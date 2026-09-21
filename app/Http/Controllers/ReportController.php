<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\StudentAttendance;
use App\Models\TeacherAttendance;
use App\Models\FeeCollection;
use App\Models\Mark;
use App\Models\Result;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $this->authorize('view_attendance');

        return Inertia::render('Reports/Index');
    }

    public function attendanceReport(Request $request)
    {
        $this->authorize('view_attendance');

        $validated = $request->validate([
            'report_type' => 'required|in:student,teacher',
            'class_id' => 'nullable|exists:classes,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        if ($validated['report_type'] === 'student') {
            $query = StudentAttendance::with(['student.user', 'schoolClass', 'section'])
                ->whereBetween('date', [$validated['from_date'], $validated['to_date']]);

            if ($request->class_id) {
                $query->where('class_id', $request->class_id);
            }

            $attendances = $query->get();

            $summary = [
                'total_days' => $attendances->pluck('date')->unique()->count(),
                'present' => $attendances->where('status', 'present')->count(),
                'absent' => $attendances->where('status', 'absent')->count(),
                'late' => $attendances->where('status', 'late')->count(),
                'half_day' => $attendances->where('status', 'half_day')->count(),
            ];
        } else {
            $query = TeacherAttendance::with('teacher.user')
                ->whereBetween('date', [$validated['from_date'], $validated['to_date']]);

            $attendances = $query->get();

            $summary = [
                'total_days' => $attendances->pluck('date')->unique()->count(),
                'present' => $attendances->where('status', 'present')->count(),
                'absent' => $attendances->where('status', 'absent')->count(),
                'late' => $attendances->where('status', 'late')->count(),
                'leave' => $attendances->where('status', 'leave')->count(),
            ];
        }

        return Inertia::render('Reports/Attendance', [
            'attendances' => $attendances,
            'summary' => $summary,
            'filters' => $validated,
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function feeReport(Request $request)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'class_id' => 'nullable|exists:classes,id',
            'payment_status' => 'nullable|in:paid,partial,pending',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        $query = FeeCollection::with(['student.user', 'feeType', 'schoolClass'])
            ->whereBetween('payment_date', [$validated['from_date'], $validated['to_date']]);

        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        $collections = $query->get();

        $summary = [
            'total_amount' => $collections->sum('amount'),
            'total_paid' => $collections->sum('paid_amount'),
            'total_discount' => $collections->sum('discount'),
            'total_fine' => $collections->sum('fine'),
            'total_due' => $collections->sum(fn($c) => $c->amount - $c->paid_amount + $c->fine - $c->discount),
            'paid_count' => $collections->where('payment_status', 'paid')->count(),
            'partial_count' => $collections->where('payment_status', 'partial')->count(),
            'pending_count' => $collections->where('payment_status', 'pending')->count(),
        ];

        return Inertia::render('Reports/Fees', [
            'collections' => $collections,
            'summary' => $summary,
            'filters' => $validated,
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function academicReport(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'nullable|exists:classes,id',
        ]);

        $query = Result::with(['student.user', 'schoolClass', 'exam'])
            ->where('exam_id', $validated['exam_id']);

        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }

        $results = $query->get();

        $summary = [
            'total_students' => $results->count(),
            'passed' => $results->where('status', 'pass')->count(),
            'failed' => $results->where('status', 'fail')->count(),
            'average_percentage' => round($results->avg('percentage'), 2),
            'highest_percentage' => $results->max('percentage'),
            'lowest_percentage' => $results->min('percentage'),
            'grade_distribution' => $results->groupBy('grade')->map->count(),
        ];

        return Inertia::render('Reports/Academic', [
            'results' => $results,
            'summary' => $summary,
            'filters' => $validated,
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function studentReport(Student $student)
    {
        $this->authorize('view_students');

        $student->load([
            'user',
            'schoolClass',
            'section',
            'academicYear',
            'attendances' => fn($q) => $q->latest()->limit(30),
            'feeCollections.feeType',
            'marks.exam',
            'marks.subject',
        ]);

        $attendanceSummary = [
            'present' => $student->attendances->where('status', 'present')->count(),
            'absent' => $student->attendances->where('status', 'absent')->count(),
            'late' => $student->attendances->where('status', 'late')->count(),
            'total' => $student->attendances->count(),
        ];

        $feeSummary = [
            'total_paid' => $student->feeCollections->sum('paid_amount'),
            'total_due' => $student->feeCollections->where('payment_status', '!=', 'paid')->sum(fn($c) => $c->amount - $c->paid_amount),
        ];

        return Inertia::render('Reports/StudentReport', [
            'student' => $student,
            'attendanceSummary' => $attendanceSummary,
            'feeSummary' => $feeSummary,
        ]);
    }

    public function teacherReport(Teacher $teacher)
    {
        $this->authorize('view_teachers');

        $teacher->load([
            'user',
            'subjects',
            'sections',
            'attendances' => fn($q) => $q->latest()->limit(30),
            'salaries' => fn($q) => $q->latest()->limit(12),
        ]);

        $attendanceSummary = [
            'present' => $teacher->attendances->where('status', 'present')->count(),
            'absent' => $teacher->attendances->where('status', 'absent')->count(),
            'late' => $teacher->attendances->where('status', 'late')->count(),
            'leave' => $teacher->attendances->where('status', 'leave')->count(),
            'total' => $teacher->attendances->count(),
        ];

        $salarySummary = [
            'total_paid' => $teacher->salaries->where('status', 'paid')->sum('net_salary'),
            'pending' => $teacher->salaries->where('status', 'pending')->sum('net_salary'),
        ];

        return Inertia::render('Reports/TeacherReport', [
            'teacher' => $teacher,
            'attendanceSummary' => $attendanceSummary,
            'salarySummary' => $salarySummary,
        ]);
    }

    public function classReport(SchoolClass $class)
    {
        $this->authorize('view_classes');

        $class->load(['sections.students', 'students', 'subjects']);

        $stats = [
            'total_students' => $class->students()->where('status', 'active')->count(),
            'total_sections' => $class->sections()->count(),
            'male_students' => $class->students()->where('gender', 'male')->count(),
            'female_students' => $class->students()->where('gender', 'female')->count(),
        ];

        return Inertia::render('Reports/ClassReport', [
            'class' => $class,
            'stats' => $stats,
        ]);
    }

    public function exportReport(Request $request)
    {
        // This would handle PDF/Excel export
        // Implementation depends on chosen export library
        return response()->json(['message' => 'Export functionality coming soon']);
    }
}
