<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\StudentAttendance;
use App\Models\Student;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

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

        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $attendanceRecords = \App\Models\TeacherAttendance::where('teacher_id', $teacher->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date', 'desc')
            ->get();

        $summary = [
            'present' => $attendanceRecords->where('status', 'present')->count(),
            'absent' => $attendanceRecords->where('status', 'absent')->count(),
            'late' => $attendanceRecords->where('status', 'late')->count(),
            'half_day' => $attendanceRecords->where('status', 'half_day')->count(),
            'total_days' => $attendanceRecords->count(),
        ];

        $yearlyAttendance = \App\Models\TeacherAttendance::where('teacher_id', $teacher->id)
            ->whereYear('date', $year)
            ->get();

        $yearlySummary = [
            'present' => $yearlyAttendance->where('status', 'present')->count(),
            'absent' => $yearlyAttendance->where('status', 'absent')->count(),
            'late' => $yearlyAttendance->where('status', 'late')->count(),
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
