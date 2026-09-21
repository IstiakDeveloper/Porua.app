<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\DeviceSetting;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use App\Support\TeacherAttendanceCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('mark_attendance');

        $reportType = $this->reportType($request);
        $selectedDate = $request->date ?? now()->format('Y-m-d');
        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
        $holidayMap = TeacherAttendanceCalculator::holidayMap($selectedDate, $selectedDate);
        $isStudent = $reportType === 'student';

        if ($isStudent) {
            $people = $request->filled('class_id') ? $this->studentQuery($request)->get() : collect();
            $records = StudentAttendance::where('date', $selectedDate)
                ->whereIn('student_id', $people->pluck('id'))
                ->get()
                ->keyBy('student_id');
        } else {
            $people = $this->teacherQuery($request)->get();
            $records = TeacherAttendance::with(['teacher' => fn ($q) => $q->withTrashed()->with('user')])
                ->where('date', $selectedDate)
                ->get()
                ->keyBy('teacher_id');
        }

        $rows = $people->map(function ($person) use ($records, $settings, $weekendDays, $holidayMap, $selectedDate, $reportType, $isStudent) {
            $resolved = TeacherAttendanceCalculator::resolveDay(
                $selectedDate,
                $records->get($person->id),
                $settings,
                $weekendDays,
                $holidayMap,
                personType: $reportType
            );

            $payload = $isStudent ? $this->studentPayload($person) : $this->teacherPayload($person);

            return [
                'id' => $resolved['attendance_record_id'],
                'teacher_id' => $person->id,
                'date' => $selectedDate,
                'status' => $resolved['status'],
                'in_time' => $resolved['in_time'],
                'out_time' => $resolved['out_time'],
                'in_time_formatted' => $resolved['in_time_formatted'],
                'out_time_formatted' => $resolved['out_time_formatted'],
                'hours' => $resolved['hours'],
                'remarks' => $resolved['remarks'],
                'auto_remarks' => $resolved['auto_remarks'],
                'teacher' => $payload,
                'person' => $payload,
            ];
        });

        $stats = TeacherAttendanceCalculator::emptySummary();
        $stats['total'] = $rows->count();
        foreach ($rows as $row) {
            TeacherAttendanceCalculator::incrementSummary($stats, $row['status']);
        }

        if ($request->filled('status')) {
            $rows = $rows->filter(fn ($row) => $row['status'] === $request->status)->values();
        }

        return Inertia::render('Attendance/Teachers/Index', [
            'reportType' => $reportType,
            'attendances' => $this->paginateCollection($rows, $request, 50),
            'filters' => [
                'report_type' => $reportType,
                'date' => $selectedDate,
                'status' => $request->status,
                'search' => $request->search,
                'department' => $request->department,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
                'per_page' => (int) ($request->per_page ?? 50),
            ],
            'stats' => $stats,
            'departments' => $this->departments(),
            'classes' => $this->classOptions(),
            'sections' => $this->sectionOptions(),
            'needsClass' => $isStudent && ! $request->filled('class_id'),
            'deviceSetting' => $this->deviceSettingPayload($settings),
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('mark_attendance');

        $date = $request->date ?? now()->format('Y-m-d');

        $teachers = Teacher::with(['user', 'attendance' => fn ($q) => $q->where('date', $date)])
            ->where('status', 'active')
            ->orderBy('id')
            ->get()
            ->map(function (Teacher $teacher) {
                $record = $teacher->attendance->first();

                return [
                    'id' => $teacher->id,
                    'employee_id' => $teacher->employee_id,
                    'name' => $this->teacherName($teacher),
                    'designation' => $teacher->designation,
                    'department' => $teacher->department,
                    'attendance' => $record ? [
                        'status' => $record->status,
                        'in_time' => $record->in_time?->format('H:i'),
                        'out_time' => $record->out_time?->format('H:i'),
                        'reason' => $record->reason,
                    ] : null,
                ];
            });

        return Inertia::render('Attendance/Teachers/Create', [
            'teachers' => $teachers,
            'date' => $date,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('mark_attendance');

        $validated = $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.teacher_id' => 'required|exists:teachers,id',
            'attendances.*.status' => 'required|in:present,absent,late,early_leave,half_day,holiday,leave',
            'attendances.*.in_time' => 'nullable|date_format:H:i',
            'attendances.*.out_time' => 'nullable|date_format:H:i',
            'attendances.*.reason' => 'nullable|string',
            'attendances.*.check_in_time' => 'nullable|date_format:H:i',
            'attendances.*.check_out_time' => 'nullable|date_format:H:i',
            'attendances.*.remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['attendances'] as $attendance) {
                TeacherAttendance::updateOrCreate(
                    [
                        'teacher_id' => $attendance['teacher_id'],
                        'date' => $validated['date'],
                    ],
                    [
                        'status' => $attendance['status'],
                        'in_time' => $attendance['in_time'] ?? $attendance['check_in_time'] ?? null,
                        'out_time' => $attendance['out_time'] ?? $attendance['check_out_time'] ?? null,
                        'reason' => $attendance['reason'] ?? $attendance['remarks'] ?? null,
                        'marked_by' => auth()->id(),
                    ]
                );
            }

            DB::commit();

            logActivity('create', 'Marked attendance for '.count($validated['attendances']).' teachers', TeacherAttendance::class);

            return redirect()->route('teacher-attendance.index', ['date' => $validated['date']])
                ->with('success', 'Attendance marked successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', 'Failed to mark attendance: '.$e->getMessage());
        }
    }

    public function destroy(TeacherAttendance $teacherAttendance)
    {
        $this->authorize('mark_attendance');

        $teacherAttendance->delete();

        logActivity('delete', 'Deleted teacher attendance', TeacherAttendance::class, $teacherAttendance->id);

        return back()->with('success', 'Attendance deleted successfully');
    }

    public function calendar(Request $request)
    {
        return redirect()->route('teacher-attendance.monthly', $request->query());
    }

    public function monthly(Request $request)
    {
        $this->authorize('view_attendance');

        $month = $this->resolveMonth($request);
        $payload = $this->buildMonthlyPayload($request, $month);

        return Inertia::render('Attendance/Teachers/Monthly', $payload);
    }

    public function monthlyPdf(Request $request)
    {
        $this->authorize('view_attendance');

        $month = $this->resolveMonth($request);
        $payload = $this->buildMonthlyPayload($request, $month, paginate: false);

        return response()->view('attendance.teachers.monthly-print', array_merge($payload, $this->schoolInfo()))
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function report(Request $request)
    {
        $this->authorize('view_attendance');

        $reportType = $this->reportType($request);
        $fromDate = $request->from_date ?? now()->startOfMonth()->format('Y-m-d');
        $toDate = $request->to_date ?? now()->format('Y-m-d');
        $teacherId = $request->teacher_id ? (int) $request->teacher_id : null;
        $studentId = $request->student_id ? (int) $request->student_id : null;
        $classId = $request->class_id ? (int) $request->class_id : null;
        $sectionId = $request->section_id ? (int) $request->section_id : null;

        $payload = [
            'reportType' => $reportType,
            'teachers' => $this->teacherOptions(),
            'students' => $this->studentOptions($classId, $sectionId),
            'classes' => $this->classOptions(),
            'sections' => $this->sectionOptions(),
            'filters' => [
                'report_type' => $reportType,
                'teacher_id' => $teacherId,
                'student_id' => $studentId,
                'class_id' => $classId,
                'section_id' => $sectionId,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'person' => null,
            'teacher' => null,
            'days' => [],
            'stats' => TeacherAttendanceCalculator::emptySummary(),
        ];

        if ($reportType === 'student' && $studentId) {
            $payload = array_merge($payload, $this->buildStudentReport($studentId, $fromDate, $toDate));
        } elseif ($reportType === 'teacher' && $teacherId) {
            $payload = array_merge($payload, $this->buildTeacherReport($teacherId, $fromDate, $toDate));
        }

        return Inertia::render('Attendance/Teachers/Report', $payload);
    }

    public function reportPdf(Request $request)
    {
        $this->authorize('view_attendance');

        $reportType = $this->reportType($request);

        $request->validate([
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'teacher_id' => $reportType === 'teacher' ? 'required|exists:teachers,id' : 'nullable',
            'student_id' => $reportType === 'student' ? 'required|exists:students,id' : 'nullable',
        ]);

        $report = $reportType === 'student'
            ? $this->buildStudentReport((int) $request->student_id, $request->from_date, $request->to_date)
            : $this->buildTeacherReport((int) $request->teacher_id, $request->from_date, $request->to_date);

        return response()->view('attendance.teachers.report-print', array_merge($report, [
            'fromDate' => $request->from_date,
            'toDate' => $request->to_date,
            'reportType' => $reportType,
            'reportTitle' => $reportType === 'student' ? 'STUDENT ATTENDANCE REPORT' : 'TEACHER ATTENDANCE REPORT',
        ], $this->schoolInfo()))
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function sheetReport(Request $request)
    {
        $this->authorize('view_attendance');

        return Inertia::render('Attendance/Teachers/SheetReport', [
            'reportType' => $this->reportType($request),
            'departments' => $this->departments(),
            'classes' => $this->classOptions(),
            'sections' => $this->sectionOptions(),
            'filters' => [
                'report_type' => $this->reportType($request),
                'start_date' => $request->start_date ?? now()->subDays(6)->format('Y-m-d'),
                'end_date' => $request->end_date ?? now()->format('Y-m-d'),
                'department' => $request->department,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
            ],
        ]);
    }

    public function sheetPdf(Request $request)
    {
        $this->authorize('view_attendance');

        $reportType = $this->reportType($request);

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'department' => 'nullable|string',
            'class_id' => 'nullable|exists:classes,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end = Carbon::parse($validated['end_date'])->startOfDay();

        if ($start->diffInDays($end) > 31) {
            return back()->with('error', 'Date range cannot exceed 31 days.');
        }

        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
        $from = $start->format('Y-m-d');
        $to = $end->format('Y-m-d');
        $holidayMap = TeacherAttendanceCalculator::holidayMap($from, $to);

        $isStudent = $reportType === 'student';

        if ($isStudent) {
            $people = Student::with(['user', 'schoolClass', 'section'])
                ->where('status', 'active')
                ->when($validated['class_id'] ?? null, fn ($q, $classId) => $q->where('class_id', $classId))
                ->when($validated['section_id'] ?? null, fn ($q, $sectionId) => $q->where('section_id', $sectionId))
                ->orderBy('first_name')
                ->get();

            $records = StudentAttendance::whereBetween('date', [$from, $to])
                ->whereIn('student_id', $people->pluck('id'))
                ->get()
                ->groupBy(fn ($row) => $row->date->format('Y-m-d'))
                ->map(fn ($group) => $group->keyBy('student_id'));
        } else {
            $people = Teacher::with('user')
                ->where('status', 'active')
                ->when($validated['department'] ?? null, fn ($q, $dept) => $q->where('department', $dept))
                ->orderBy('id')
                ->get();

            $records = TeacherAttendance::whereBetween('date', [$from, $to])
                ->whereIn('teacher_id', $people->pluck('id'))
                ->get()
                ->groupBy(fn ($row) => $row->date->format('Y-m-d'))
                ->map(fn ($group) => $group->keyBy('teacher_id'));
        }

        $days = [];
        $overall = TeacherAttendanceCalculator::emptySummary();

        for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
            $ymd = $cursor->format('Y-m-d');
            $dayRecords = $records->get($ymd, collect());
            $dayStats = TeacherAttendanceCalculator::emptySummary();
            $rows = [];

            foreach ($people as $person) {
                $resolved = TeacherAttendanceCalculator::resolveDay(
                    $ymd,
                    $dayRecords->get($person->id),
                    $settings,
                    $weekendDays,
                    $holidayMap,
                    personType: $reportType
                );

                $personPayload = $isStudent ? $this->studentPayload($person) : $this->teacherPayload($person);
                $rows[] = array_merge($resolved, [
                    'person' => $personPayload,
                    'teacher' => $personPayload,
                ]);

                TeacherAttendanceCalculator::incrementSummary($dayStats, $resolved['status']);
                TeacherAttendanceCalculator::incrementSummary($overall, $resolved['status']);
            }

            $days[] = [
                'date' => $ymd,
                'day_name' => $cursor->format('l'),
                'rows' => $rows,
                'stats' => $dayStats,
            ];
        }

        $groupLabel = $isStudent
            ? collect([
                optional(SchoolClass::find($validated['class_id'] ?? null))->name,
                optional(Section::find($validated['section_id'] ?? null))->name,
            ])->filter()->implode(' · ')
            : ($validated['department'] ?? null);

        return response()->view('attendance.teachers.sheet-print', array_merge($this->schoolInfo(), [
            'startDate' => $from,
            'endDate' => $to,
            'department' => $groupLabel,
            'days' => $days,
            'stats' => $overall,
            'teacherCount' => $people->count(),
            'reportType' => $reportType,
            'reportTitle' => $isStudent ? 'STUDENT ATTENDANCE SHEET' : 'TEACHER ATTENDANCE SHEET',
            'entityLabel' => $isStudent ? 'Student' : 'Teacher',
            'groupHeading' => $isStudent ? 'Class' : 'Dept',
        ]))->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function buildMonthlyPayload(Request $request, Carbon $month, bool $paginate = true): array
    {
        $reportType = $this->reportType($request);
        $isStudent = $reportType === 'student';
        $from = $month->copy()->startOfMonth()->format('Y-m-d');
        $to = $month->copy()->endOfMonth()->format('Y-m-d');
        $daysInMonth = $month->daysInMonth;
        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
        $holidayMap = TeacherAttendanceCalculator::holidayMap($from, $to);

        if ($isStudent) {
            $people = $request->filled('class_id') ? $this->studentQuery($request)->get() : collect();
            $records = StudentAttendance::whereBetween('date', [$from, $to])
                ->whereIn('student_id', $people->pluck('id'))
                ->get()
                ->groupBy('student_id')
                ->map(fn ($group) => $group->keyBy(fn ($row) => $row->date->format('Y-m-d')));
        } else {
            $people = $this->teacherQuery($request)->get();
            $records = TeacherAttendance::whereBetween('date', [$from, $to])
                ->whereIn('teacher_id', $people->pluck('id'))
                ->get()
                ->groupBy('teacher_id')
                ->map(fn ($group) => $group->keyBy(fn ($row) => $row->date->format('Y-m-d')));
        }

        $rows = $people->map(function ($person) use ($records, $settings, $weekendDays, $holidayMap, $month, $daysInMonth, $reportType, $isStudent) {
            $personRecords = $records->get($person->id, collect());
            $grid = [];
            $summary = TeacherAttendanceCalculator::emptySummary();

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $ymd = sprintf('%s-%02d', $month->format('Y-m'), $day);
                $resolved = TeacherAttendanceCalculator::resolveDay(
                    $ymd,
                    $personRecords->get($ymd),
                    $settings,
                    $weekendDays,
                    $holidayMap,
                    personType: $reportType
                );
                $grid[$day] = $resolved;
                TeacherAttendanceCalculator::incrementSummary($summary, $resolved['status']);
            }

            $payload = $isStudent ? $this->studentPayload($person) : $this->teacherPayload($person);

            return [
                'id' => $person->id,
                'name' => $payload['name'],
                'employee_id' => $payload['employee_id'],
                'designation' => $payload['designation'] ?? null,
                'department' => $payload['department'] ?? null,
                'attendance' => $grid,
                'summary' => $summary,
                'present_count' => $summary['present'] + $summary['late'] + $summary['early_leave'] + $summary['half_day'],
            ];
        });

        $teachersPayload = $paginate
            ? $this->paginateCollection($rows, $request, 20)
            : ['data' => $rows->values()];

        return [
            'reportType' => $reportType,
            'teachers' => $teachersPayload,
            'month' => $month->format('Y-m'),
            'year' => $month->year,
            'month_number' => $month->month,
            'daysInMonth' => $daysInMonth,
            'departments' => $this->departments(),
            'classes' => $this->classOptions(),
            'sections' => $this->sectionOptions(),
            'filters' => [
                'report_type' => $reportType,
                'search' => $request->search,
                'department' => $request->department,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
                'month' => $month->format('Y-m'),
                'per_page' => $request->per_page ?? 20,
            ],
            'needsClass' => $isStudent && ! $request->filled('class_id'),
            'schoolName' => $this->schoolInfo()['schoolName'],
        ];
    }

    private function buildTeacherReport(int $teacherId, string $fromDate, string $toDate): array
    {
        $teacher = Teacher::withTrashed()->with('user')->findOrFail($teacherId);
        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
        $holidayMap = TeacherAttendanceCalculator::holidayMap($fromDate, $toDate);

        $records = TeacherAttendance::where('teacher_id', $teacherId)
            ->whereBetween('date', [$fromDate, $toDate])
            ->get()
            ->keyBy(fn ($row) => $row->date->format('Y-m-d'));

        $stats = TeacherAttendanceCalculator::emptySummary();
        $days = [];
        $start = Carbon::parse($fromDate)->startOfDay();
        $end = Carbon::parse($toDate)->startOfDay();

        for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
            $ymd = $cursor->format('Y-m-d');
            $resolved = TeacherAttendanceCalculator::resolveDay(
                $ymd,
                $records->get($ymd),
                $settings,
                $weekendDays,
                $holidayMap
            );

            $days[] = array_merge($resolved, [
                'date' => $ymd,
                'day' => $cursor->format('l'),
            ]);

            TeacherAttendanceCalculator::incrementSummary($stats, $resolved['status']);
        }

        $workingDays = max(1, count($days) - ($stats['weekend'] + $stats['holiday']));
        $attended = $stats['present'] + $stats['late'] + $stats['early_leave'] + $stats['half_day'];
        $stats['total'] = count($days);
        $stats['percentage'] = round(($attended / $workingDays) * 100, 1);

        $person = $this->teacherPayload($teacher);

        return [
            'teacher' => $person,
            'person' => $person,
            'days' => $days,
            'stats' => $stats,
        ];
    }

    private function buildStudentReport(int $studentId, string $fromDate, string $toDate): array
    {
        $student = Student::withTrashed()->with(['user', 'schoolClass', 'section'])->findOrFail($studentId);
        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
        $holidayMap = TeacherAttendanceCalculator::holidayMap($fromDate, $toDate);

        $records = StudentAttendance::where('student_id', $studentId)
            ->whereBetween('date', [$fromDate, $toDate])
            ->get()
            ->keyBy(fn ($row) => $row->date->format('Y-m-d'));

        $stats = TeacherAttendanceCalculator::emptySummary();
        $days = [];
        $start = Carbon::parse($fromDate)->startOfDay();
        $end = Carbon::parse($toDate)->startOfDay();

        for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
            $ymd = $cursor->format('Y-m-d');
            $resolved = TeacherAttendanceCalculator::resolveDay(
                $ymd,
                $records->get($ymd),
                $settings,
                $weekendDays,
                $holidayMap,
                personType: 'student'
            );

            $days[] = array_merge($resolved, [
                'date' => $ymd,
                'day' => $cursor->format('l'),
            ]);

            TeacherAttendanceCalculator::incrementSummary($stats, $resolved['status']);
        }

        $workingDays = max(1, count($days) - ($stats['weekend'] + $stats['holiday']));
        $attended = $stats['present'] + $stats['late'] + $stats['early_leave'] + $stats['half_day'];
        $stats['total'] = count($days);
        $stats['percentage'] = round(($attended / $workingDays) * 100, 1);
        $person = $this->studentPayload($student);

        return [
            'teacher' => $person,
            'person' => $person,
            'days' => $days,
            'stats' => $stats,
        ];
    }

    private function reportType(Request $request): string
    {
        return $request->report_type === 'student' ? 'student' : 'teacher';
    }

    private function resolveMonth(Request $request): Carbon
    {
        if ($request->filled('month') && preg_match('/^\d{4}-\d{2}$/', (string) $request->month)) {
            return Carbon::parse($request->month.'-01')->startOfMonth();
        }

        $year = (int) ($request->year ?? now()->year);
        $month = (int) ($request->month ?? now()->month);

        return Carbon::create($year, max(1, min(12, $month)), 1)->startOfMonth();
    }

    private function teacherQuery(Request $request)
    {
        return Teacher::with('user')
            ->where('status', 'active')
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($inner) use ($search) {
                    $inner->where('employee_id', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('designation', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->department, fn ($q) => $q->where('department', $request->department))
            ->orderBy('id');
    }

    private function teacherOptions(): Collection
    {
        return Teacher::with('user')
            ->where('status', 'active')
            ->orderBy('id')
            ->get()
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'name' => $this->teacherName($teacher),
                'employee_id' => $teacher->employee_id,
            ]);
    }

    private function studentQuery(Request $request)
    {
        return Student::with(['user', 'schoolClass', 'section'])
            ->where('status', 'active')
            ->when($request->class_id, fn ($q) => $q->where('class_id', $request->class_id))
            ->when($request->section_id, fn ($q) => $q->where('section_id', $request->section_id))
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($inner) use ($search) {
                    $inner->where('admission_number', 'like', "%{$search}%")
                        ->orWhere('student_id', 'like', "%{$search}%")
                        ->orWhere('roll_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('first_name');
    }

    private function studentOptions(?int $classId = null, ?int $sectionId = null): Collection
    {
        return Student::with(['user', 'schoolClass', 'section'])
            ->where('status', 'active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
            ->orderBy('first_name')
            ->get()
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'name' => $this->studentName($student),
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass?->name,
                'section_name' => $student->section?->name,
            ]);
    }

    private function studentPayload(Student $student): array
    {
        $className = $student->schoolClass?->name;
        $sectionName = $student->section?->name;

        return [
            'id' => $student->id,
            'name' => $this->studentName($student),
            'employee_id' => $student->admission_number ?: $student->student_id,
            'admission_number' => $student->admission_number,
            'roll_number' => $student->roll_number,
            'designation' => collect([$className, $sectionName])->filter()->implode(' · '),
            'department' => $className,
            'class_name' => $className,
            'section_name' => $sectionName,
        ];
    }

    private function studentName(Student $student): string
    {
        return $student->user?->name
            ?? trim(($student->first_name ?? '').' '.($student->last_name ?? ''))
            ?: ('Student '.($student->admission_number ?: $student->id));
    }

    private function classOptions(): Collection
    {
        return SchoolClass::active()->ordered()->get(['id', 'name']);
    }

    private function sectionOptions(): Collection
    {
        return Section::active()->get(['id', 'name', 'class_id']);
    }

    private function teacherPayload(Teacher $teacher): array
    {
        return [
            'id' => $teacher->id,
            'name' => $this->teacherName($teacher),
            'employee_id' => $teacher->employee_id,
            'email' => $teacher->user?->email,
            'designation' => $teacher->designation,
            'department' => $teacher->department,
        ];
    }

    private function teacherName(Teacher $teacher): string
    {
        return $teacher->user?->name
            ?? trim(($teacher->first_name ?? '').' '.($teacher->last_name ?? ''))
            ?: ('Employee '.($teacher->employee_id ?: $teacher->id));
    }

    private function departments(): array
    {
        return Teacher::where('status', 'active')
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department')
            ->values()
            ->all();
    }

    private function deviceSettingPayload(?DeviceSetting $settings): ?array
    {
        if (! $settings) {
            return null;
        }

        return [
            'device_name' => $settings->device_name,
            'device_ip' => $settings->device_ip,
            'last_sync_at' => $settings->last_sync_at?->toIso8601String(),
        ];
    }

    private function schoolInfo(): array
    {
        return [
            'schoolName' => Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon'),
            'schoolAddress' => Setting::where('key', 'school_address')->value('value') ?: '',
        ];
    }

    private function paginateCollection(Collection $items, Request $request, int $defaultPerPage): LengthAwarePaginator
    {
        $perPage = (int) ($request->per_page ?? $defaultPerPage);
        $perPage = $perPage > 0 ? min($perPage, 200) : $defaultPerPage;
        $page = max(1, (int) $request->page);
        $slice = $items->forPage($page, $perPage)->values();

        return new LengthAwarePaginator(
            $slice,
            $items->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );
    }
}
