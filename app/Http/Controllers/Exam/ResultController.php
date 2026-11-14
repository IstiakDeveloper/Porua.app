<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\Exam;
use App\Models\GradeSetting;
use App\Models\Mark;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\StudentAttendance;
use App\Services\ResultCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultController extends Controller
{
    protected ResultCalculationService $calculationService;

    public function __construct(ResultCalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $results = Result::with(['student.user', 'student.section', 'exam', 'schoolClass'])
            ->when($request->exam_id, fn($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->orderBy('class_position')
            ->latest('id')
            ->paginate(50)->withQueryString();

        return Inertia::render('Exams/Results/Index', [
            'results' => $results,
            'filters' => $request->only(['exam_id', 'class_id', 'student_id']),
            'exams' => Exam::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function generate(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
        ]);

        try {
            $outcome = $this->calculationService->generate(
                (int) $validated['exam_id'],
                (int) $validated['class_id']
            );

            if (!$outcome['success']) {
                return back()->with('error', $outcome['message']);
            }

            logActivity('create', "Generated results for exam ID: {$validated['exam_id']} and class ID: {$validated['class_id']}", Result::class);

            return back()->with('success', $outcome['message']);
        } catch (\Exception $e) {
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

        Exam::where('id', $validated['exam_id'])->update(['marks_locked' => true]);

        logActivity('update', "Published exam results for exam ID {$validated['exam_id']} and class ID {$validated['class_id']}", Result::class);

        return back()->with('success', 'Results published successfully. Students and parents can now view their marksheet.');
    }

    public function show(Result $result)
    {
        $this->authorize('view_students');

        $result->load([
            'student.user',
            'student.section',
            'exam',
            'schoolClass',
            'student.marks' => fn($q) => $q->where('exam_id', $result->exam_id)->with('subject')
        ]);

        return Inertia::render('Exams/Results/Show', [
            'result' => $result,
        ]);
    }

    public function tabulation(Request $request)
    {
        $this->authorize('manage_exams');

        $examId = $request->input('exam_id');
        $classId = $request->input('class_id');
        $sectionId = $request->input('section_id');

        $exams = Exam::orderBy('created_at', 'desc')->get();
        $classes = SchoolClass::where('status', 'active')->with('sections')->get();

        // If not specified, default to first available
        if (!$examId && $exams->isNotEmpty()) {
            $examId = $exams->first()->id;
        }
        if (!$classId && $classes->isNotEmpty()) {
            $classId = $classes->first()->id;
        }

        $tabulationData = null;
        if ($examId && $classId) {
            $tabulationData = $this->calculationService->getTabulationData(
                (int) $examId,
                (int) $classId,
                $sectionId ? (int) $sectionId : null
            );
        }

        return Inertia::render('Exams/Results/Tabulation', [
            'exams' => $exams,
            'classes' => $classes,
            'filters' => [
                'exam_id' => (string) $examId,
                'class_id' => (string) $classId,
                'section_id' => (string) $sectionId,
            ],
            'tabulation' => $tabulationData,
        ]);
    }

    public function printTabulation(Request $request)
    {
        $this->authorize('manage_exams');

        $examId = (int) $request->input('exam_id');
        $classId = (int) $request->input('class_id');
        $sectionId = $request->input('section_id') ? (int) $request->input('section_id') : null;

        if (!$examId || !$classId) {
            abort(404, 'Exam and Class must be specified.');
        }

        $tabulationData = $this->calculationService->getTabulationData($examId, $classId, $sectionId);

        $schoolName = Setting::get('school_name', config('app.name', 'Porua School'));
        $schoolAddress = Setting::get('school_address', '');
        $schoolPhone = Setting::get('school_phone', '');
        $schoolEmail = Setting::get('school_email', '');
        $schoolLogo = Setting::get('school_logo', '');

        return view('exams.tabulation-print', array_merge($tabulationData, [
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
            'schoolPhone' => $schoolPhone,
            'schoolEmail' => $schoolEmail,
            'schoolLogo' => $schoolLogo,
        ]));
    }

    public function printMarksheet(Result $result)
    {
        // Allow student, parent, or staff with permission to view
        $user = auth()->user();
        if ($user->hasRole('Student')) {
            $student = \App\Models\Student::where('user_id', $user->id)->first();
            if (!$student || $student->id !== $result->student_id || !$result->is_published) {
                abort(403, 'Unauthorized access to marksheet.');
            }
        } elseif ($user->hasRole('Parent')) {
            $parent = \App\Models\StudentParent::where('user_id', $user->id)->first();
            if (!$parent || $result->student->parent_id !== $parent->id || !$result->is_published) {
                abort(403, 'Unauthorized access to marksheet.');
            }
        } else {
            $this->authorize('view_students');
        }

        $result->load([
            'student.user',
            'student.schoolClass',
            'student.section.teacher.user',
            'exam.academicYear',
            'schoolClass',
            'student.marks' => fn($q) => $q->where('exam_id', $result->exam_id)->with('subject')
        ]);

        $student = $result->student;
        $yearId = $result->exam?->academic_year_id ? (int) $result->exam->academic_year_id : null;
        $marks = $student->marks->sortBy(fn ($mark) => $mark->subject->name ?? '')->values();

        $highest = Mark::query()
            ->where('exam_id', $result->exam_id)
            ->where('class_id', $result->class_id)
            ->where('is_absent', false)
            ->selectRaw('subject_id, MAX(obtained_marks) as highest')
            ->groupBy('subject_id')
            ->pluck('highest', 'subject_id');

        $attendance = ['days' => 0, 'attended' => 0, 'percent' => null];
        if ($yearId) {
            $rows = StudentAttendance::query()
                ->where('student_id', $student->id)
                ->where('academic_year_id', $yearId);
            $days = (clone $rows)->count();
            $attended = (clone $rows)->whereIn('status', ['present', 'late', 'half_day'])->count();
            $attendance = [
                'days' => $days,
                'attended' => $attended,
                'percent' => $days > 0 ? round(($attended / $days) * 100, 2) : null,
            ];
        }

        $logo = Setting::get('school_logo', '');
        $logoUrl = $logo
            ? (str_starts_with($logo, 'http') ? $logo : asset('storage/'.$logo))
            : null;

        $classTeacher = $student->section?->teacher?->user?->name
            ?? $student->section?->teacher?->full_name;

        return view('exams.marksheet-print', [
            'result' => $result,
            'student' => $student,
            'marks' => $marks,
            'highest' => $highest,
            'attendance' => $attendance,
            'classTeacher' => $classTeacher,
            'gradeSettings' => GradeSetting::scaleForYear($yearId),
            'schoolName' => Setting::get('school_name', config('app.name', 'Porua School')),
            'schoolAddress' => Setting::get('school_address', ''),
            'schoolPhone' => Setting::get('school_phone', ''),
            'schoolEmail' => Setting::get('school_email', ''),
            'schoolWebsite' => Setting::get('school_website', ''),
            'schoolCode' => Setting::get('school_code', ''),
            'establishedYear' => Setting::get('established_year', ''),
            'schoolLogo' => $logoUrl,
        ]);
    }

    public function destroy(Result $result)
    {
        $this->authorize('manage_exams');

        $result->delete();

        logActivity('delete', "Deleted result", Result::class, $result->id);

        return back()->with('success', 'Result deleted successfully');
    }
}
