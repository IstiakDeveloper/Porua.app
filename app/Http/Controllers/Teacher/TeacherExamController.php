<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Exam;
use App\Models\Mark;
use App\Models\Student;
use App\Models\ExamInvigilator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherExamController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        // Get teacher's subject IDs
        $subjectIds = $teacher->subjects()->pluck('subject_id')->toArray();

        // Get exams for teacher's subjects
        $exams = Exam::whereHas('schedules', function ($query) use ($subjectIds) {
            $query->whereIn('subject_id', $subjectIds);
        })
            ->with(['schedules.subject', 'schedules.schoolClass'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get invigilation duties
        $invigilationDuties = ExamInvigilator::where('teacher_id', $teacher->id)
            ->with(['examSchedule.exam', 'examSchedule.subject', 'examHall'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/Exams/Index', [
            'exams' => $exams->map(function ($exam) use ($subjectIds, $teacher) {
                $schedule = $exam->schedules->whereIn('subject_id', $subjectIds)->first();

                // Get teacher's section for this subject
                $teacherSubject = $teacher->subjects()
                    ->where('subject_id', $schedule ? $schedule->subject_id : null)
                    ->with('section')
                    ->first();

                return [
                    'id' => $exam->id,
                    'name' => $exam->name,
                    'exam_date' => $schedule && $schedule->exam_date ? $schedule->exam_date->format('Y-m-d') : null,
                    'subject_id' => $schedule ? $schedule->subject_id : null,
                    'subject_name' => $schedule && $schedule->subject ? $schedule->subject->name : 'N/A',
                    'class_name' => $schedule && $schedule->schoolClass ? $schedule->schoolClass->name : 'N/A',
                    'section_name' => $teacherSubject && $teacherSubject->section ? $teacherSubject->section->name : 'N/A',
                    'is_published' => $exam->is_published,
                    'total_marks' => $exam->total_marks,
                ];
            }),
            'invigilationDuties' => $invigilationDuties->map(function ($duty) {
                return [
                    'id' => $duty->id,
                    'exam_name' => $duty->examSchedule->exam->name ?? 'N/A',
                    'subject' => $duty->examSchedule->subject->name ?? 'N/A',
                    'exam_date' => $duty->examSchedule->exam_date ?? 'N/A',
                    'start_time' => $duty->examSchedule->start_time ?? 'N/A',
                    'end_time' => $duty->examSchedule->end_time ?? 'N/A',
                    'hall_name' => $duty->examHall->name ?? 'N/A',
                ];
            }),
        ]);
    }

    public function markEntry(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $examId = $request->input('exam_id');
        $subjectId = $request->input('subject_id');

        // Get exam with schedule
        $examSchedule = \App\Models\ExamSchedule::where('exam_id', $examId)
            ->where('subject_id', $subjectId)
            ->with(['exam', 'schoolClass', 'subject'])
            ->firstOrFail();

        $exam = $examSchedule->exam;
        $subject = $examSchedule->subject;

        // Get teacher's section for this subject
        $teacherSubject = $teacher->subjects()
            ->where('subject_id', $subjectId)
            ->with('section.schoolClass')
            ->first();

        if (!$teacherSubject) {
            abort(403, 'Unauthorized access.');
        }

        $section = $teacherSubject->section;

        // Get students in this section
        $students = Student::where('section_id', $section->id)
            ->orderBy('roll_number')
            ->get();

        // Get existing marks
        $existingMarks = Mark::where('exam_id', $examId)
            ->where('subject_id', $subjectId)
            ->get()
            ->keyBy('student_id');

        // Get subject total marks from first mark entry (if exists)
        $subjectTotalMarks = $existingMarks->first() ? $existingMarks->first()->total_marks : null;

        return Inertia::render('Teacher/Exams/MarkEntry', [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'class_name' => $section && $section->schoolClass ? $section->schoolClass->name : 'N/A',
                'section_name' => $section ? $section->name : 'N/A',
                'total_marks' => $subjectTotalMarks ?? 100, // Use subject total or default 100
            ],
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
            ],
            'students' => $students->map(function ($student) use ($existingMarks) {
                $mark = $existingMarks->get($student->id);
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'roll_number' => $student->roll_number,
                    'theory_marks' => $mark ? $mark->theory_marks : null,
                    'practical_marks' => $mark ? $mark->practical_marks : null,
                    'is_absent' => $mark ? $mark->is_absent : false,
                ];
            }),
        ]);
    }

    public function storeMarks(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'exam_id' => ['required', 'exists:exams,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'subject_total_marks' => ['required', 'numeric', 'min:1'],
            'marks' => ['required', 'array'],
            'marks.*.student_id' => ['required', 'exists:students,id'],
            'marks.*.theory_marks' => ['nullable', 'numeric', 'min:0'],
            'marks.*.practical_marks' => ['nullable', 'numeric', 'min:0'],
            'marks.*.is_absent' => ['boolean'],
        ]);

        // Get exam schedule to verify
        $examSchedule = \App\Models\ExamSchedule::where('exam_id', $validated['exam_id'])
            ->where('subject_id', $validated['subject_id'])
            ->firstOrFail();

        // Get teacher's section for this subject
        $teacherSubject = $teacher->subjects()
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$teacherSubject) {
            abort(403, 'Unauthorized access.');
        }

        $exam = Exam::findOrFail($validated['exam_id']);
        $subjectTotalMarks = $validated['subject_total_marks'];

        foreach ($validated['marks'] as $markData) {
            $theoryMarks = $markData['is_absent'] ? null : ($markData['theory_marks'] ?? 0);
            $practicalMarks = $markData['is_absent'] ? null : ($markData['practical_marks'] ?? 0);
            $obtainedMarks = $markData['is_absent'] ? 0 : (($theoryMarks ?? 0) + ($practicalMarks ?? 0));

            // Calculate grade using subject total marks
            $percentage = $subjectTotalMarks > 0 ? ($obtainedMarks / $subjectTotalMarks) * 100 : 0;
            $grade = $this->calculateGrade($percentage);

            Mark::updateOrCreate(
                [
                    'exam_id' => $validated['exam_id'],
                    'student_id' => $markData['student_id'],
                    'subject_id' => $validated['subject_id'],
                ],
                [
                    'class_id' => $teacherSubject->class_id,
                    'theory_marks' => $theoryMarks,
                    'practical_marks' => $practicalMarks,
                    'obtained_marks' => $obtainedMarks,
                    'total_marks' => $subjectTotalMarks,
                    'grade' => $grade['grade'],
                    'grade_point' => $grade['gp'],
                    'is_absent' => $markData['is_absent'],
                ]
            );
        }

        return redirect()->route('teacher.exams.index')
            ->with('success', 'Marks entered successfully.');
    }

    public function viewMarks(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $examId = $request->input('exam_id');
        $subjectId = $request->input('subject_id');

        // Get exam with schedule
        $examSchedule = \App\Models\ExamSchedule::where('exam_id', $examId)
            ->where('subject_id', $subjectId)
            ->with(['exam', 'schoolClass', 'subject'])
            ->firstOrFail();

        $exam = $examSchedule->exam;
        $subject = $examSchedule->subject;

        // Get teacher's section for this subject
        $teacherSubject = $teacher->subjects()
            ->where('subject_id', $subjectId)
            ->with('section.schoolClass')
            ->first();

        if (!$teacherSubject) {
            abort(403, 'Unauthorized access.');
        }

        $section = $teacherSubject->section;

        $marks = Mark::where('exam_id', $examId)
            ->where('subject_id', $subjectId)
            ->with('student')
            ->orderBy('obtained_marks', 'desc')
            ->get();

        $statistics = [
            'total_students' => $marks->count(),
            'passed' => $marks->where('grade', '!=', 'F')->count(),
            'failed' => $marks->where('grade', 'F')->count(),
            'absent' => $marks->where('is_absent', true)->count(),
            'highest' => $marks->where('is_absent', false)->max('obtained_marks') ?? 0,
            'lowest' => $marks->where('is_absent', false)->min('obtained_marks') ?? 0,
            'average' => $marks->where('is_absent', false)->avg('obtained_marks') ?? 0,
        ];

        return Inertia::render('Teacher/Exams/ViewMarks', [
            'exam' => [
                'name' => $exam->name,
                'class_name' => $section && $section->schoolClass ? $section->schoolClass->name : 'N/A',
                'section_name' => $section ? $section->name : 'N/A',
            ],
            'subject' => [
                'name' => $subject->name,
            ],
            'marks' => $marks->map(function ($mark) {
                return [
                    'student_name' => $mark->student->full_name ?? 'N/A',
                    'roll_number' => $mark->student->roll_number ?? 'N/A',
                    'theory_marks' => $mark->theory_marks,
                    'practical_marks' => $mark->practical_marks,
                    'obtained_marks' => $mark->obtained_marks,
                    'total_marks' => $mark->total_marks,
                    'grade' => $mark->grade,
                    'grade_point' => $mark->grade_point,
                    'is_absent' => $mark->is_absent,
                ];
            }),
            'statistics' => $statistics,
        ]);
    }

    private function calculateGrade($percentage)
    {
        if ($percentage >= 80) return ['grade' => 'A+', 'gp' => 5.0];
        if ($percentage >= 70) return ['grade' => 'A', 'gp' => 4.0];
        if ($percentage >= 60) return ['grade' => 'A-', 'gp' => 3.5];
        if ($percentage >= 50) return ['grade' => 'B', 'gp' => 3.0];
        if ($percentage >= 40) return ['grade' => 'C', 'gp' => 2.0];
        if ($percentage >= 33) return ['grade' => 'D', 'gp' => 1.0];
        return ['grade' => 'F', 'gp' => 0.0];
    }
}
