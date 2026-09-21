<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSummary;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceSummaryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_attendance');

        $summaries = AttendanceSummary::with(['student.user', 'schoolClass', 'academicYear'])
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->academic_year_id, fn($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->when($request->month, fn($q) => $q->where('month', $request->month))
            ->when($request->year, fn($q) => $q->where('year', $request->year))
            ->latest()
            ->paginate(50)->withQueryString();

        return Inertia::render('Attendance/Summary/Index', [
            'summaries' => $summaries,
            'filters' => $request->only(['class_id', 'academic_year_id', 'month', 'year']),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'academicYears' => AcademicYear::all(),
        ]);
    }

    public function generate(Request $request)
    {
        $this->authorize('mark_attendance');

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        DB::beginTransaction();
        try {
            $students = Student::where('class_id', $validated['class_id'])
                ->where('academic_year_id', $validated['academic_year_id'])
                ->where('status', 'active')
                ->get();

            foreach ($students as $student) {
                $attendances = $student->attendances()
                    ->whereMonth('date', $validated['month'])
                    ->whereYear('date', $validated['year'])
                    ->get();

                $totalDays = $attendances->count();
                $presentDays = $attendances->where('status', 'present')->count();
                $absentDays = $attendances->where('status', 'absent')->count();
                $lateDays = $attendances->where('status', 'late')->count();
                $halfDays = $attendances->where('status', 'half_day')->count();

                $percentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0;

                AttendanceSummary::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'month' => $validated['month'],
                        'year' => $validated['year'],
                    ],
                    [
                        'class_id' => $validated['class_id'],
                        'academic_year_id' => $validated['academic_year_id'],
                        'total_days' => $totalDays,
                        'present_days' => $presentDays,
                        'absent_days' => $absentDays,
                        'late_days' => $lateDays,
                        'half_days' => $halfDays,
                        'attendance_percentage' => $percentage,
                    ]
                );
            }

            DB::commit();

            logActivity('create', "Generated attendance summary", AttendanceSummary::class);

            return back()->with('success', 'Attendance summary generated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to generate summary: ' . $e->getMessage());
        }
    }

    public function student(Student $student)
    {
        $this->authorize('view_students');

        $summaries = AttendanceSummary::where('student_id', $student->id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return Inertia::render('Attendance/Summary/Student', [
            'student' => $student->load(['user', 'schoolClass', 'section']),
            'summaries' => $summaries,
        ]);
    }

    public function class(Request $request)
    {
        $this->authorize('view_attendance');

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        $summaries = AttendanceSummary::with('student.user')
            ->where('class_id', $validated['class_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->orderBy('attendance_percentage', 'desc')
            ->get();

        $stats = [
            'total_students' => $summaries->count(),
            'average_percentage' => round($summaries->avg('attendance_percentage'), 2),
            'high_attendance' => $summaries->where('attendance_percentage', '>=', 90)->count(),
            'low_attendance' => $summaries->where('attendance_percentage', '<', 75)->count(),
        ];

        return Inertia::render('Attendance/Summary/Class', [
            'summaries' => $summaries,
            'stats' => $stats,
            'class' => SchoolClass::find($validated['class_id']),
            'filters' => $validated,
        ]);
    }

    public function destroy(AttendanceSummary $attendanceSummary)
    {
        $this->authorize('mark_attendance');

        $attendanceSummary->delete();

        logActivity('delete', "Deleted attendance summary", AttendanceSummary::class, $attendanceSummary->id);

        return back()->with('success', 'Attendance summary deleted successfully');
    }
}
