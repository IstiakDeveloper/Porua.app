<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Mark;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MarkController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $marks = Mark::with(['student.user', 'exam', 'schoolClass', 'subject'])
            ->when($request->exam_id, fn($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->subject_id, fn($q) => $q->where('subject_id', $request->subject_id))
            ->latest()
            ->paginate(50)->withQueryString();

        return Inertia::render('Exams/Marks/Index', [
            'marks' => $marks,
            'filters' => $request->only(['exam_id', 'class_id', 'subject_id']),
            'exams' => Exam::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_exams');

        return Inertia::render('Exams/Marks/Create', [
            'exams' => Exam::where('status', '!=', 'cancelled')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
        ]);
    }

    public function getStudents(Request $request)
    {
        $students = Student::with([
            'user',
            'marks' => function($q) use ($request) {
                $q->where('exam_id', $request->exam_id)
                  ->where('subject_id', $request->subject_id);
            }
        ])
            ->where('class_id', $request->class_id)
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->where('status', 'active')
            ->get();

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.theory_marks' => 'nullable|numeric|min:0',
            'marks.*.practical_marks' => 'nullable|numeric|min:0',
            'marks.*.total_marks' => 'required|numeric|min:0',
            'marks.*.grade' => 'nullable|string|max:10',
            'marks.*.remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['marks'] as $mark) {
                Mark::updateOrCreate(
                    [
                        'exam_id' => $validated['exam_id'],
                        'student_id' => $mark['student_id'],
                        'subject_id' => $validated['subject_id'],
                    ],
                    [
                        'class_id' => $validated['class_id'],
                        'theory_marks' => $mark['theory_marks'] ?? null,
                        'practical_marks' => $mark['practical_marks'] ?? null,
                        'total_marks' => $mark['total_marks'],
                        'grade' => $mark['grade'] ?? null,
                        'remarks' => $mark['remarks'] ?? null,
                        'marked_by' => auth()->id(),
                    ]
                );
            }

            DB::commit();

            logActivity('create', "Entered marks for " . count($validated['marks']) . " students", Mark::class);

            return redirect()->route('marks.index')
                ->with('success', 'Marks entered successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to enter marks: ' . $e->getMessage());
        }
    }

    public function edit(Request $request)
    {
        $this->authorize('manage_exams');

        $marks = Mark::with('student.user')
            ->where('exam_id', $request->exam_id)
            ->where('class_id', $request->class_id)
            ->where('subject_id', $request->subject_id)
            ->get();

        return Inertia::render('Exams/Marks/Edit', [
            'marks' => $marks,
            'exam' => Exam::find($request->exam_id),
            'class' => SchoolClass::find($request->class_id),
            'subject' => Subject::find($request->subject_id),
        ]);
    }

    public function destroy(Mark $mark)
    {
        $this->authorize('manage_exams');

        $mark->delete();

        logActivity('delete', "Deleted mark", Mark::class, $mark->id);

        return back()->with('success', 'Mark deleted successfully');
    }
}
