<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\AttendanceSummary;
use Carbon\Carbon;

class StudentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get month and year from request or use current
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        // Get attendance for the selected month
        $attendance = StudentAttendance::where('student_id', $student->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get()
            ->map(function($record) {
                return [
                    'id' => $record->id,
                    'date' => $record->date->format('Y-m-d'),
                    'day' => $record->date->format('l'),
                    'status' => $record->status,
                    'in_time' => $record->in_time?->format('h:i A'),
                    'out_time' => $record->out_time?->format('h:i A'),
                    'reason' => $record->reason,
                ];
            });

        // Calculate monthly summary
        $totalDays = $attendance->count();
        $presentDays = $attendance->where('status', 'present')->count();
        $absentDays = $attendance->where('status', 'absent')->count();
        $lateDays = $attendance->where('status', 'late')->count();
        $percentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0;

        // Get yearly summary
        $yearlySummary = $this->getYearlySummary($student->id, $year);

        // Get available months (months with attendance records)
        $availableMonths = StudentAttendance::where('student_id', $student->id)
            ->whereYear('date', $year)
            ->selectRaw('DISTINCT MONTH(date) as month')
            ->orderBy('month', 'desc')
            ->pluck('month')
            ->toArray();

        return Inertia::render('Student/Attendance/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'roll_number' => $student->roll_number,
            ],
            'attendance' => $attendance,
            'summary' => [
                'total' => $totalDays,
                'present' => $presentDays,
                'absent' => $absentDays,
                'late' => $lateDays,
                'percentage' => $percentage,
            ],
            'yearlySummary' => $yearlySummary,
            'filters' => [
                'month' => (int)$month,
                'year' => (int)$year,
            ],
            'availableMonths' => $availableMonths,
        ]);
    }

    public function summary(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $year = $request->input('year', Carbon::now()->year);

        // Get attendance summary by month for the year
        $monthlySummary = [];
        for ($month = 1; $month <= 12; $month++) {
            $attendance = StudentAttendance::where('student_id', $student->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();

            $total = $attendance->count();
            $present = $attendance->where('status', 'present')->count();
            $absent = $attendance->where('status', 'absent')->count();
            $late = $attendance->where('status', 'late')->count();

            $monthlySummary[] = [
                'month' => Carbon::create()->month($month)->format('F'),
                'month_number' => $month,
                'total' => $total,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'percentage' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
            ];
        }

        // Get overall yearly stats
        $yearlyAttendance = StudentAttendance::where('student_id', $student->id)
            ->whereYear('date', $year)
            ->get();

        $yearlyStats = [
            'total' => $yearlyAttendance->count(),
            'present' => $yearlyAttendance->where('status', 'present')->count(),
            'absent' => $yearlyAttendance->where('status', 'absent')->count(),
            'late' => $yearlyAttendance->where('status', 'late')->count(),
            'percentage' => $yearlyAttendance->count() > 0
                ? round(($yearlyAttendance->where('status', 'present')->count() / $yearlyAttendance->count()) * 100, 2)
                : 0,
        ];

        return Inertia::render('Student/Attendance/Summary', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
            ],
            'monthlySummary' => $monthlySummary,
            'yearlyStats' => $yearlyStats,
            'year' => (int)$year,
        ]);
    }

    private function getYearlySummary($studentId, $year)
    {
        $yearlyAttendance = StudentAttendance::where('student_id', $studentId)
            ->whereYear('date', $year)
            ->get();

        $total = $yearlyAttendance->count();
        $present = $yearlyAttendance->where('status', 'present')->count();
        $absent = $yearlyAttendance->where('status', 'absent')->count();
        $late = $yearlyAttendance->where('status', 'late')->count();

        return [
            'total' => $total,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'percentage' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
        ];
    }
}
