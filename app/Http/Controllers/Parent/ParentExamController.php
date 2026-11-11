<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use App\Models\Mark;
use App\Models\Result;
use App\Support\ParentPortal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentExamController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);
        $studentId = $request->input('student_id');
        $children = ParentPortal::children($parent);

        if (! $studentId) {
            $student = $children->first();
            $studentId = $student?->id;
        } else {
            $student = $children->firstWhere('id', (int) $studentId);
        }

        if (! $student) {
            return Inertia::render('Parent/Exams/Index', [
                'student' => null,
                'children' => [],
                'upcomingExams' => [],
                'results' => [],
            ]);
        }

        // Get upcoming exam schedules for this student's class
        $upcomingExams = ExamSchedule::with(['exam', 'subject'])
            ->where('class_id', $student->class_id)
            ->where('exam_date', '>=', now()->toDateString())
            ->orderBy('exam_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->take(10)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'name' => ($schedule->exam->name ?? 'Exam').' - '.($schedule->subject->name ?? ''),
                    'exam_date' => $schedule->exam_date ? $schedule->exam_date->format('Y-m-d') : '',
                    'start_time' => $schedule->start_time ?? '',
                    'end_time' => $schedule->end_time ?? '',
                ];
            });

        // Get published results
        $results = Result::where('student_id', $studentId)
            ->where('is_published', true)
            ->with('exam')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'exam' => [
                        'name' => $result->exam->name ?? 'N/A',
                    ],
                    'total_marks' => (float) $result->total_marks,
                    'obtained_marks' => (float) $result->obtained_marks,
                    'percentage' => (float) $result->percentage,
                    'grade' => $result->grade ?? 'N/A',
                    'gpa' => (float) ($result->gpa ?? 0),
                    'pass_status' => ucfirst($result->result_status ?? 'pass'),
                    'result_status' => $result->result_status,
                    'class_position' => $result->class_position,
                    'section_position' => $result->section_position,
                    'created_at' => $result->created_at ? $result->created_at->toISOString() : now()->toISOString(),
                ];
            });

        return Inertia::render('Parent/Exams/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
            ],
            'children' => $children->map(fn ($c) => ParentPortal::childOption($c))->values(),
            'upcomingExams' => $upcomingExams,
            'results' => $results,
        ]);
    }

    public function resultDetail(Request $request, $id)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);

        $result = Result::with(['exam', 'student.schoolClass', 'student.section', 'student.parents'])
            ->findOrFail($id);

        if (! ParentPortal::children($parent)->contains('id', $result->student_id)) {
            abort(403, 'Unauthorized access.');
        }

        // Only allow viewing published results
        if (! $result->is_published) {
            abort(403, 'This exam result has not been published yet.');
        }

        // Get subject-wise marks
        $marks = Mark::where('exam_id', $result->exam_id)
            ->where('student_id', $result->student_id)
            ->with('subject')
            ->get();

        return Inertia::render('Parent/Exams/ResultDetail', [
            'student' => [
                'id' => $result->student->id,
                'full_name' => $result->student->full_name,
                'roll_number' => $result->student->roll_number,
                'class_name' => $result->student->schoolClass->name ?? 'N/A',
                'section_name' => $result->student->section->name ?? 'N/A',
            ],
            'result' => [
                'id' => $result->id,
                'exam_name' => $result->exam->name ?? 'N/A',
                'total_marks' => (float) $result->total_marks,
                'obtained_marks' => (float) $result->obtained_marks,
                'percentage' => (float) $result->percentage,
                'grade' => $result->grade ?? 'N/A',
                'gpa' => (float) ($result->gpa ?? 0),
                'class_position' => $result->class_position,
                'section_position' => $result->section_position,
                'remarks' => $result->remarks,
                'pass_status' => ucfirst($result->result_status ?? 'pass'),
                'result_status' => $result->result_status,
            ],
            'marks' => $marks->map(function ($mark) {
                return [
                    'subject' => $mark->subject->name ?? 'N/A',
                    'theory_marks' => $mark->theory_marks,
                    'practical_marks' => $mark->practical_marks,
                    'obtained_marks' => $mark->obtained_marks,
                    'total_marks' => $mark->total_marks,
                    'grade' => $mark->grade ?? '-',
                    'grade_point' => $mark->grade_point ?? '-',
                    'is_absent' => (bool) $mark->is_absent,
                ];
            }),
        ]);
    }
}
