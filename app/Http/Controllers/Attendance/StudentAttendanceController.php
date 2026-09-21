<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\StudentAttendance;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('teacher-attendance.index', array_merge(
            $request->query(),
            ['report_type' => 'student']
        ));
    }

    public function create(Request $request)
    {
        $this->authorize('mark_attendance');

        return Inertia::render('Attendance/Students/Create', [
            'classes' => SchoolClass::with('sections')->where('status', 'active')->get(),
            'sections' => Section::where('status', 'active')->get(),
            'date' => $request->date ?? now()->format('Y-m-d'),
        ]);
    }

    public function getStudents(Request $request)
    {
        $this->authorize('mark_attendance');

        $students = Student::with(['user', 'schoolClass', 'section', 'attendance' => function($q) use ($request) {
            $q->where('date', $request->date ?? now()->format('Y-m-d'));
        }])
            ->where('class_id', $request->class_id)
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get();

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $this->authorize('mark_attendance');

        $validated = $request->validate([
            'date' => 'required|date',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.in_time' => 'nullable|date_format:H:i',
            'attendances.*.out_time' => 'nullable|date_format:H:i',
            'attendances.*.reason' => 'nullable|string',
        ]);

        // Get current academic year
        $academicYear = AcademicYear::where('is_current', true)->first();
        if (!$academicYear) {
            return back()->with('error', 'No active academic year found. Please set an academic year as current.');
        }

        DB::beginTransaction();
        try {
            foreach ($validated['attendances'] as $attendance) {
                StudentAttendance::updateOrCreate(
                    [
                        'student_id' => $attendance['student_id'],
                        'date' => $validated['date'],
                    ],
                    [
                        'academic_year_id' => $academicYear->id,
                        'class_id' => $validated['class_id'],
                        'section_id' => $validated['section_id'],
                        'status' => $attendance['status'],
                        'in_time' => $attendance['in_time'] ?? null,
                        'out_time' => $attendance['out_time'] ?? null,
                        'reason' => $attendance['reason'] ?? null,
                        'marked_by' => auth()->id(),
                    ]
                );
            }

            DB::commit();

            logActivity('create', "Marked attendance for " . count($validated['attendances']) . " students", StudentAttendance::class);

            return redirect()->route('teacher-attendance.index', [
                'report_type' => 'student',
                'date' => $validated['date'],
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'],
            ])->with('success', 'Attendance marked successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to mark attendance: ' . $e->getMessage());
        }
    }

    public function report(Request $request)
    {
        return redirect()->route('teacher-attendance.report', array_merge(
            $request->query(),
            ['report_type' => 'student']
        ));
    }

    public function destroy(StudentAttendance $studentAttendance)
    {
        $this->authorize('mark_attendance');

        $studentAttendance->delete();

        logActivity('delete', "Deleted student attendance", StudentAttendance::class, $studentAttendance->id);

        return back()->with('success', 'Attendance deleted successfully');
    }

    public function calendar(Request $request)
    {
        $query = $request->query();

        if (! isset($query['month']) && (isset($query['year']) || $request->filled('year'))) {
            $year = (int) ($query['year'] ?? now()->year);
            $month = (int) ($query['month'] ?? now()->month);
            $query['month'] = sprintf('%04d-%02d', $year, $month);
            unset($query['year']);
        }

        return redirect()->route('teacher-attendance.monthly', array_merge($query, [
            'report_type' => 'student',
        ]));
    }
}
