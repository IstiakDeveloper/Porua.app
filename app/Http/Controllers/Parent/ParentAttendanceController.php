<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Student;
use App\Models\StudentAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ParentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $studentId = $request->input('student_id');
        $date = $request->input('date', Carbon::now()->format('Y-m-d'));

        if (!$studentId) {
            // Get first child by default
            $student = Student::where('parent_id', $parent->id)->first();
            if (!$student) {
                abort(404, 'No children found.');
            }
            $studentId = $student->id;
        } else {
            $student = Student::where('parent_id', $parent->id)->findOrFail($studentId);
        }

        // Get all children for dropdown
        $children = Student::where('parent_id', $parent->id)->get();

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
                'class_name' => $student->class->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
            ],
            'children' => $children->map(fn($c) => [
                'id' => $c->id,
                'full_name' => $c->full_name,
            ]),
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
