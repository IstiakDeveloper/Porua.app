<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\Mark;
use App\Models\Result;
use App\Models\Student;
use App\Models\ExamInvigilator;
use App\Services\MarkGuard;
use App\Services\ResultCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherExamController extends Controller
{
    public function __construct(
        private MarkGuard $guard,
        private ResultCalculationService $results,
    ) {}

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
                    'exam_kind' => $exam->exam_kind,
                    'class_id' => $schedule?->class_id,
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
        $subjectTotalMarks = $existingMarks->first()?->total_marks ?: $request->input('full_marks');

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
        $classId = (int) $teacherSubject->class_id;

        DB::beginTransaction();
        try {
            foreach ($validated['marks'] as $markData) {
                $this->guard->assertEditable((int) $exam->id, (int) $markData['student_id'], (int) $validated['subject_id']);

                $theoryMarks = $markData['is_absent'] ? null : ($markData['theory_marks'] ?? 0);
                $practicalMarks = $markData['is_absent'] ? null : ($markData['practical_marks'] ?? 0);
                $obtainedMarks = $markData['is_absent'] ? 0 : (($theoryMarks ?? 0) + ($practicalMarks ?? 0));

                $percentage = $subjectTotalMarks > 0 ? ($obtainedMarks / $subjectTotalMarks) * 100 : 0;
                $grade = $this->calculateGrade($percentage);

                $existing = Mark::where('exam_id', $exam->id)
                    ->where('student_id', $markData['student_id'])
                    ->where('subject_id', $validated['subject_id'])
                    ->first();
                $before = $this->guard->snapshot($existing);
                $wasRecheck = (bool) ($existing?->recheck_open);

                $saved = Mark::updateOrCreate(
                    [
                        'exam_id' => $validated['exam_id'],
                        'student_id' => $markData['student_id'],
                        'subject_id' => $validated['subject_id'],
                    ],
                    [
                        'class_id' => $classId,
                        'theory_marks' => $theoryMarks,
                        'practical_marks' => $practicalMarks,
                        'obtained_marks' => $obtainedMarks,
                        'total_marks' => $subjectTotalMarks,
                        'grade' => $grade['grade'],
                        'grade_point' => $grade['gp'],
                        'is_absent' => $markData['is_absent'] ?? false,
                        'entered_by' => $user->id,
                        'verified_by' => $exam->isClassTest() ? $user->id : null,
                        'verified_at' => $exam->isClassTest() ? now() : null,
                        'recheck_open' => false,
                    ]
                );

                $this->guard->audit(
                    $saved,
                    (int) $exam->id,
                    (int) $markData['student_id'],
                    (int) $validated['subject_id'],
                    $existing ? 'update' : 'create',
                    $before,
                    $this->guard->snapshot($saved)
                );

                if ($wasRecheck) {
                    Result::where('exam_id', $exam->id)
                        ->where('student_id', $markData['student_id'])
                        ->update(['is_published' => false]);
                }
            }

            DB::commit();
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        if ($exam->isClassTest()) {
            $outcome = $this->results->generate((int) $exam->id, $classId);
            if (! $outcome['success']) {
                return redirect()->route('teacher.exams.index')->with('error', $outcome['message']);
            }
        }

        return redirect()->route('teacher.exams.index')
            ->with('success', $exam->isClassTest()
                ? 'Class test marks saved. Publish when the result should be visible.'
                : 'Marks saved. An admin verifies them before the result is generated.');
    }

    public function createClassTest(Request $request)
    {
        $teacher = Teacher::where('user_id', $request->user()->id)->firstOrFail();

        $assignments = $teacher->subjects()->with(['subject', 'schoolClass', 'section'])->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'class_id' => $row->class_id,
                'class_name' => $row->schoolClass->name ?? 'Class',
                'section_name' => $row->section->name ?? 'Section',
                'subject_id' => $row->subject_id,
                'subject_name' => $row->subject->name ?? 'Subject',
            ];
        });

        return Inertia::render('Teacher/Exams/ClassTest', [
            'assignments' => $assignments,
        ]);
    }

    public function storeClassTest(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'assignment_id' => ['required', 'integer'],
            'name' => ['nullable', 'string', 'max:255'],
            'exam_date' => ['required', 'date'],
            'full_marks' => ['required', 'numeric', 'min:1'],
        ]);

        $assignment = $teacher->subjects()->with(['subject', 'schoolClass'])->findOrFail($validated['assignment_id']);
        $yearId = Student::where('class_id', $assignment->class_id)->where('status', 'active')->value('academic_year_id')
            ?? $assignment->academic_year_id;

        if (! $yearId) {
            return back()->with('error', 'This class has no academic year yet.');
        }

        $title = $validated['name'] ?: trim(($assignment->subject->name ?? 'Subject').' Class Test');

        $exam = DB::transaction(function () use ($validated, $assignment, $yearId, $title) {
            $exam = Exam::create([
                'academic_year_id' => $yearId,
                'name' => $title,
                'exam_type' => 'test',
                'exam_kind' => 'class_test',
                'term_number' => null,
                'start_date' => $validated['exam_date'],
                'end_date' => $validated['exam_date'],
                'status' => 'ongoing',
                'description' => 'Class test',
            ]);

            $exam->classes()->sync([$assignment->class_id]);

            ExamSchedule::create([
                'exam_id' => $exam->id,
                'class_id' => $assignment->class_id,
                'subject_id' => $assignment->subject_id,
                'exam_date' => $validated['exam_date'],
                'start_time' => '09:00:00',
                'end_time' => '09:40:00',
                'duration_minutes' => 40,
            ]);

            return $exam;
        });

        return redirect()->route('teacher.exams.marks.entry', [
            'exam_id' => $exam->id,
            'subject_id' => $assignment->subject_id,
            'full_marks' => $validated['full_marks'],
        ])->with('success', 'Class test created. Enter marks next.');
    }

    public function publishClassTest(Request $request, Exam $exam)
    {
        $teacher = Teacher::where('user_id', $request->user()->id)->firstOrFail();

        if (! $exam->isClassTest()) {
            abort(404);
        }

        $subjectIds = $teacher->subjects()->pluck('subject_id');
        $schedule = ExamSchedule::where('exam_id', $exam->id)->whereIn('subject_id', $subjectIds)->first();
        if (! $schedule) {
            abort(403, 'This class test is not yours.');
        }

        $outcome = $this->results->generate((int) $exam->id, (int) $schedule->class_id);
        if (! $outcome['success']) {
            return back()->with('error', $outcome['message']);
        }

        Result::where('exam_id', $exam->id)->where('class_id', $schedule->class_id)->update(['is_published' => true]);
        $exam->update(['marks_locked' => true, 'status' => 'completed', 'is_published' => true, 'published_at' => now()]);

        return back()->with('success', 'Class test result published.');
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
