<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\Mark;
use App\Models\Exam;
use App\Models\Student;
use App\Models\GradeSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $results = Result::with(['student.user', 'exam', 'schoolClass'])
            ->when($request->exam_id, fn($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->latest()
            ->paginate(50)->withQueryString();

        return Inertia::render('Exams/Results/Index', [
            'results' => $results,
            'filters' => $request->only(['exam_id', 'class_id', 'student_id']),
            'exams' => Exam::all(),
            'classes' => \App\Models\SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function generate(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
        ]);

        DB::beginTransaction();
        try {
            // Get all students with marks for this exam
            $students = Student::where('class_id', $validated['class_id'])
                ->where('status', 'active')
                ->get();

            foreach ($students as $student) {
                $marks = Mark::where('exam_id', $validated['exam_id'])
                    ->where('student_id', $student->id)
                    ->get();

                if ($marks->isEmpty()) {
                    continue;
                }

                $totalMarks = $marks->sum('total_marks');
                $totalSubjects = $marks->count();
                $percentage = $totalSubjects > 0 ? ($totalMarks / ($totalSubjects * 100)) * 100 : 0;

                // Calculate grade
                $grade = $this->calculateGrade($percentage);

                Result::updateOrCreate(
                    [
                        'exam_id' => $validated['exam_id'],
                        'student_id' => $student->id,
                    ],
                    [
                        'class_id' => $validated['class_id'],
                        'total_marks' => $totalMarks,
                        'obtained_marks' => $totalMarks,
                        'percentage' => round($percentage, 2),
                        'grade' => $grade['grade'],
                        'gpa' => $grade['gpa'],
                        'status' => $percentage >= 40 ? 'pass' : 'fail',
                        'remarks' => $grade['remarks'] ?? null,
                    ]
                );
            }

            DB::commit();

            logActivity('create', "Generated results for exam", Result::class);

            return back()->with('success', 'Results generated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to generate results: ' . $e->getMessage());
        }
    }

    public function publish(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
        ]);

        Result::where('exam_id', $validated['exam_id'])
            ->where('class_id', $validated['class_id'])
            ->update(['is_published' => true]);

        logActivity('update', "Published exam results", Result::class);

        return back()->with('success', 'Results published successfully');
    }

    public function show(Result $result)
    {
        $this->authorize('view_students');

        $result->load([
            'student.user',
            'exam',
            'schoolClass',
            'student.marks' => fn($q) => $q->where('exam_id', $result->exam_id)->with('subject')
        ]);

        return Inertia::render('Exams/Results/Show', [
            'result' => $result,
        ]);
    }

    public function studentResult(Student $student, Exam $exam)
    {
        $result = Result::with(['exam', 'schoolClass', 'student.marks' => function($q) use ($exam) {
            $q->where('exam_id', $exam->id)->with('subject');
        }])
            ->where('student_id', $student->id)
            ->where('exam_id', $exam->id)
            ->first();

        if (!$result || !$result->is_published) {
            abort(404, 'Result not found or not published');
        }

        return Inertia::render('Exams/Results/Student', [
            'result' => $result,
        ]);
    }

    private function calculateGrade($percentage)
    {
        $gradeSetting = GradeSetting::where('min_marks', '<=', $percentage)
            ->where('max_marks', '>=', $percentage)
            ->first();

        if ($gradeSetting) {
            return [
                'grade' => $gradeSetting->grade_name,
                'gpa' => $gradeSetting->grade_point,
                'remarks' => $gradeSetting->remarks,
            ];
        }

        // Default grading
        if ($percentage >= 80) return ['grade' => 'A+', 'gpa' => 5.0, 'remarks' => 'Outstanding'];
        if ($percentage >= 70) return ['grade' => 'A', 'gpa' => 4.0, 'remarks' => 'Excellent'];
        if ($percentage >= 60) return ['grade' => 'B', 'gpa' => 3.5, 'remarks' => 'Very Good'];
        if ($percentage >= 50) return ['grade' => 'C', 'gpa' => 3.0, 'remarks' => 'Good'];
        if ($percentage >= 40) return ['grade' => 'D', 'gpa' => 2.0, 'remarks' => 'Pass'];
        return ['grade' => 'F', 'gpa' => 0.0, 'remarks' => 'Fail'];
    }

    public function destroy(Result $result)
    {
        $this->authorize('manage_exams');

        $result->delete();

        logActivity('delete', "Deleted result", Result::class, $result->id);

        return back()->with('success', 'Result deleted successfully');
    }
}
