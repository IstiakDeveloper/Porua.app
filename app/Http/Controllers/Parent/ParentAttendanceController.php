<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentAttendance;
use App\Support\ParentPortal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);

        $studentId = $request->input('student_id');
        $date = $request->input('date', Carbon::now()->format('Y-m-d'));

        $children = ParentPortal::children($parent);
        $contacts = ParentPortal::contacts($children, $user->id);

        if (! $studentId) {
            $student = $children->first();
            $studentId = $student?->id;
        } else {
            $student = $children->firstWhere('id', (int) $studentId);
        }

        if (! $student) {
            return Inertia::render('Parent/Attendance/Index', [
                'student' => null,
                'children' => [],
                'selectedDate' => $date,
                'attendanceRecord' => null,
                'monthlySummary' => [
                    'present' => 0, 'absent' => 0, 'late' => 0, 'half_day' => 0, 'total_days' => 0,
                ],
                'yearlySummary' => [
                    'present' => 0, 'absent' => 0, 'late' => 0, 'total_days' => 0,
                ],
                'contact' => null,
            ]);
        }

        // Get attendance record for the selected date
        $attendanceRecord = StudentAttendance::where('student_id', $studentId)
            ->where('date', $date)
            ->first();

        // Get monthly summary for the selected date's month
        $selectedDate = Carbon::parse($date);
        $monthlyRecords = StudentAttendance::where('student_id', $studentId)
            ->whereYear('date', $selectedDate->year)
            ->whereMonth('date', $selectedDate->month)
            ->get();

        $monthlySummary = [
            'present' => $monthlyRecords->where('status', 'present')->count(),
            'absent' => $monthlyRecords->where('status', 'absent')->count(),
            'late' => $monthlyRecords->where('status', 'late')->count(),
            'half_day' => $monthlyRecords->where('status', 'half_day')->count(),
            'total_days' => $monthlyRecords->count(),
        ];

        // Get yearly summary
        $yearlyRecords = StudentAttendance::where('student_id', $studentId)
            ->whereYear('date', $selectedDate->year)
            ->get();

        $yearlySummary = [
            'present' => $yearlyRecords->where('status', 'present')->count(),
            'absent' => $yearlyRecords->where('status', 'absent')->count(),
            'late' => $yearlyRecords->where('status', 'late')->count(),
            'total_days' => $yearlyRecords->count(),
        ];

        return Inertia::render('Parent/Attendance/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
            ],
            'children' => $children->map(fn ($c) => ParentPortal::childOption($c))->values(),
            'contact' => collect($contacts)->firstWhere('student_id', $student->id),
            'selectedDate' => $date,
            'attendanceRecord' => $attendanceRecord ? [
                'id' => $attendanceRecord->id,
                'date' => $attendanceRecord->date,
                'status' => $attendanceRecord->status,
                'in_time' => $attendanceRecord->in_time ? (is_string($attendanceRecord->in_time) ? $attendanceRecord->in_time : $attendanceRecord->in_time->format('H:i:s')) : null,
                'out_time' => $attendanceRecord->out_time ? (is_string($attendanceRecord->out_time) ? $attendanceRecord->out_time : $attendanceRecord->out_time->format('H:i:s')) : null,
                'reason' => $attendanceRecord->reason,
            ] : null,
            'monthlySummary' => $monthlySummary,
            'yearlySummary' => $yearlySummary,
        ]);
    }
}
