<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DeviceSetting;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use App\Support\TeacherAttendanceCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        // Get assigned classes/sections
        $assignedSections = $teacher->subjects()
            ->with(['schoolClass', 'section'])
            ->get()
            ->pluck('section')
            ->filter()
            ->unique('id')
            ->values();

        return Inertia::render('Teacher/Attendance/Index', [
            'sections' => $assignedSections->map(function ($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'class_name' => $section->schoolClass->name ?? 'N/A',
                    'student_count' => $section->students()->count(),
                ];
            }),
        ]);
    }

    public function markAttendance(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $sectionId = $request->input('section_id');
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));

        // If no section selected, redirect to index to select section
        if (!$sectionId) {
            return redirect()->route('teacher.attendance.index')
                ->with('info', 'Please select a section to view attendance.');
        }

        // Verify teacher has access to this section
        $hasAccess = $teacher->subjects()
            ->where('section_id', $sectionId)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Unauthorized access to this section.');
        }

        $section = Section::with(['schoolClass', 'students'])->findOrFail($sectionId);

        // Get attendance records from device for this date
        $existingAttendance = StudentAttendance::where('section_id', $sectionId)
            ->where('date', $date)
            ->get()
            ->keyBy('student_id');

        return Inertia::render('Teacher/Attendance/Mark', [
            'section' => [
                'id' => $section->id,
                'name' => $section->name,
                'class_name' => $section->schoolClass->name ?? 'N/A',
            ],
            'date' => $date,
            'students' => $section->students->map(function ($student) use ($existingAttendance) {
                $attendance = $existingAttendance->get($student->id);
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'roll_number' => $student->roll_number,
                    'photo' => $student->photo,
                    // Default to absent if no device record found
                    'attendance_status' => $attendance ? $attendance->status : 'absent',
                    'remarks' => $attendance ? $attendance->remarks : null,
                ];
            }),
        ]);
    }

    /**
     * Store attendance (DEPRECATED - Attendance is now captured by devices)
     * This method is kept for backward compatibility but should not be used.
     * Attendance records are automatically created by biometric/RFID devices.
     */
    public function storeAttendance(Request $request)
    {
        // This functionality is deprecated as attendance is now captured by devices
        return redirect()->route('teacher.attendance.index')
            ->with('info', 'Attendance is automatically captured by devices and cannot be manually entered.');

        /* Original code - commented out
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        /* Original code - commented out
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
            'date' => ['required', 'date'],
            'attendances' => ['required', 'array'],
            'attendances.*.student_id' => ['required', 'exists:students,id'],
            'attendances.*.status' => ['required', 'in:present,absent,late,half_day'],
            'attendances.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        // Verify teacher has access
        $hasAccess = $teacher->subjects()
            ->where('section_id', $validated['section_id'])
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Unauthorized access to this section.');
        }

        $section = Section::findOrFail($validated['section_id']);

        // Get current academic year
        $currentAcademicYear = \App\Models\AcademicYear::current()->first();

        if (!$currentAcademicYear) {
            return back()->withErrors(['error' => 'No active academic year found.']);
        }

        foreach ($validated['attendances'] as $attendance) {
            StudentAttendance::updateOrCreate(
                [
                    'student_id' => $attendance['student_id'],
                    'section_id' => $validated['section_id'],
                    'date' => $validated['date'],
                ],
                [
                    'academic_year_id' => $currentAcademicYear->id,
                    'class_id' => $section->class_id,
                    'status' => $attendance['status'],
                    'remarks' => $attendance['remarks'] ?? null,
                    'marked_by' => $user->id,
                ]
            );
        }

        return redirect()->route('teacher.attendance.index')
            ->with('success', 'Attendance marked successfully.');
        */
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $sectionId = $request->input('section_id');
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        // Verify access
        $hasAccess = $teacher->subjects()
            ->where('section_id', $sectionId)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Unauthorized access.');
        }

        $section = Section::with('schoolClass')->findOrFail($sectionId);

        $attendanceRecords = StudentAttendance::with('student')
            ->where('section_id', $sectionId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');

        return Inertia::render('Teacher/Attendance/History', [
            'section' => [
                'id' => $section->id,
                'name' => $section->name,
                'class_name' => $section->schoolClass->name ?? 'N/A',
            ],
            'month' => $month,
            'year' => $year,
            'attendanceRecords' => $attendanceRecords,
        ]);
    }

    public function myAttendance(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();
        $holidayMap = TeacherAttendanceCalculator::holidayMap(
            $startOfMonth->format('Y-m-d'),
            $endOfMonth->format('Y-m-d')
        );

        $records = TeacherAttendance::where('teacher_id', $teacher->id)
            ->whereBetween('date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
            ->get()
            ->keyBy(fn ($row) => Carbon::parse($row->getRawOriginal('date'))->format('Y-m-d'));

        // For current month, evaluate up to today unless there are later records (e.g. approved leave)
        $evalEnd = $endOfMonth->isFuture() ? now()->startOfDay() : $endOfMonth->startOfDay();
        $latestRecordDate = $records->keys()->sort()->last();
        if ($latestRecordDate && Carbon::parse($latestRecordDate)->gt($evalEnd)) {
            $evalEnd = Carbon::parse($latestRecordDate)->startOfDay();
        }

        $attendanceRecords = [];
        $summary = [
            'present' => 0,
            'absent' => 0,
            'late' => 0,
            'half_day' => 0,
            'early_leave' => 0,
            'leave' => 0,
            'holiday' => 0,
            'weekend' => 0,
            'total_days' => 0,
        ];

        for ($cursor = $evalEnd->copy(); $cursor->gte($startOfMonth); $cursor->subDay()) {
            $ymd = $cursor->format('Y-m-d');
            $rec = $records->get($ymd);

            $resolved = TeacherAttendanceCalculator::resolveDay(
                $ymd,
                $rec,
                $settings,
                $weekendDays,
                $holidayMap,
                now(),
                'teacher'
            );

            $status = $resolved['status'] ?? 'absent';
            $checkIn = $resolved['in_time_formatted'];
            $checkOut = $resolved['out_time_formatted'];
            $remarks = $rec?->reason ?: $resolved['auto_remarks'];

            $attendanceRecords[] = [
                'id' => $rec?->id ?? (int) $cursor->format('Ymd'),
                'date' => $ymd,
                'day' => $cursor->format('l'),
                'status' => $status,
                'in_time' => $resolved['in_time'],
                'out_time' => $resolved['out_time'],
                'in_time_formatted' => $checkIn,
                'out_time_formatted' => $checkOut,
                'check_in_time' => $checkIn,
                'check_out_time' => $checkOut,
                'hours' => $resolved['hours'],
                'remarks' => $remarks,
                'auto_remarks' => $resolved['auto_remarks'],
                'reason' => $rec?->reason,
            ];

            if ($status && isset($summary[$status])) {
                $summary[$status]++;
            }
        }

        // Institutional working days (excluding weekends and official holidays)
        $summary['total_days'] = max(0, count($attendanceRecords) - ($summary['weekend'] + $summary['holiday']));

        $yearlyAttendance = TeacherAttendance::where('teacher_id', $teacher->id)
            ->whereYear('date', $year)
            ->get();

        $yearlySummary = [
            'present' => $yearlyAttendance->where('status', 'present')->count(),
            'absent' => $yearlyAttendance->where('status', 'absent')->count(),
            'late' => $yearlyAttendance->where('status', 'late')->count(),
            'half_day' => $yearlyAttendance->where('status', 'half_day')->count(),
            'total_days' => $yearlyAttendance->count(),
        ];

        return Inertia::render('Teacher/Attendance/MyAttendance', [
            'teacher' => [
                'full_name' => $teacher->full_name,
                'employee_id' => $teacher->employee_id,
                'designation' => $teacher->designation,
            ],
            'month' => $month,
            'year' => $year,
            'attendanceRecords' => $attendanceRecords,
            'summary' => $summary,
            'yearlySummary' => $yearlySummary,
        ]);
    }
}
