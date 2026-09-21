<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Student;
use App\Models\Result;
use App\Models\Mark;
use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentExamController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $studentId = $request->input('student_id');

        if (!$studentId) {
            $student = Student::where('parent_id', $parent->id)->first();
            if (!$student) {
                abort(404, 'No children found.');
            }
            $studentId = $student->id;
        } else {
            $student = Student::where('parent_id', $parent->id)->findOrFail($studentId);
        }

        $children = Student::where('parent_id', $parent->id)->get();

        // Get upcoming exams
        $upcomingExams = Exam::where('section_id', $student->section_id)
            ->where('exam_date', '>=', now())
            ->orderBy('exam_date', 'asc')
            ->get();

        // Get published results
        $results = Result::where('student_id', $studentId)
            ->where('is_published', true)
            ->with('exam')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Parent/Exams/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'roll_number' => $student->roll_number,
                'class_name' => $student->class->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
            ],
            'children' => $children->map(fn($c) => [
                'id' => $c->id,
                'full_name' => $c->full_name,
            ]),
            'upcomingExams' => $upcomingExams,
            'results' => $results,
        ]);
    }

    public function resultDetail(Request $request, $id)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $result = Result::with(['exam', 'student.class', 'student.section'])
            ->findOrFail($id);

        // Verify parent has access
        if ($result->student->parent_id !== $parent->id) {
            abort(403, 'Unauthorized access.');
        }

        // Get subject-wise marks
        $marks = Mark::where('exam_id', $result->exam_id)
            ->where('student_id', $result->student_id)
            ->with('subject')
            ->get();

        return Inertia::render('Parent/Exams/ResultDetail', [
            'student' => [
                'full_name' => $result->student->full_name,
                'roll_number' => $result->student->roll_number,
                'class_name' => $result->student->class->name ?? 'N/A',
                'section_name' => $result->student->section->name ?? 'N/A',
            ],
            'result' => [
                'id' => $result->id,
                'exam_name' => $result->exam->name ?? 'N/A',
                'total_marks' => $result->total_marks,
                'obtained_marks' => $result->obtained_marks,
                'percentage' => $result->percentage,
                'grade' => $result->grade,
                'gpa' => $result->gpa,
                'class_position' => $result->class_position,
                'section_position' => $result->section_position,
                'remarks' => $result->remarks,
                'pass_status' => $result->pass_status,
            ],
            'marks' => $marks->map(function ($mark) {
                return [
                    'subject' => $mark->subject->name ?? 'N/A',
                    'theory_marks' => $mark->theory_marks,
                    'practical_marks' => $mark->practical_marks,
                    'obtained_marks' => $mark->obtained_marks,
                    'total_marks' => $mark->total_marks,
                    'grade' => $mark->grade,
                    'grade_point' => $mark->grade_point,
                    'is_absent' => $mark->is_absent,
                ];
            }),
        ]);
    }
}
