<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\BatchAttendance;
use App\Models\BatchEnrollment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BatchAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_batch_attendance');

        $date = $request->input('date', now()->format('Y-m-d'));
        $carbonDate = Carbon::parse($date);
        $dayShort = $carbonDate->format('D'); // e.g. "Sat"
        $dayFull = $carbonDate->format('l');  // e.g. "Saturday"

        $search = $request->input('search');

        $batches = Batch::with(['course', 'teacher.user'])
            ->withCount(['batchEnrollments as enrolled_count' => function ($q) {
                $q->where('status', 'active');
            }])
            ->when($search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('course', fn($c) => $c->where('name', 'like', "%{$search}%"));
            })
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(function ($batch) use ($date, $dayShort, $dayFull) {
                // Check if scheduled today
                $days = is_array($batch->days_of_week) ? $batch->days_of_week : [];
                $isScheduled = in_array($dayShort, $days) || in_array($dayFull, $days);

                // Fetch attendances for this batch on this date
                $attendances = BatchAttendance::where('batch_id', $batch->id)
                    ->where('date', $date)
                    ->get();

                $attendancesCount = $attendances->count();
                $presentCount = $attendances->whereIn('status', ['present', 'late'])->count();
                $absentCount = $attendances->where('status', 'absent')->count();
                $lateCount = $attendances->where('status', 'late')->count();

                $attendanceStatus = 'unscheduled';
                if ($attendancesCount > 0) {
                    $attendanceStatus = 'completed';
                } elseif ($isScheduled) {
                    $attendanceStatus = 'pending';
                }

                return [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'course_name' => $batch->course?->name ?? 'N/A',
                    'teacher_name' => $batch->teacher?->user?->name ?? 'Unassigned',
                    'room_no' => $batch->room_no,
                    'start_time' => $batch->start_time,
                    'end_time' => $batch->end_time,
                    'formatted_schedule' => $batch->formatted_schedule,
                    'is_scheduled_today' => $isScheduled,
                    'enrolled_count' => $batch->enrolled_count,
                    'attendances_count' => $attendancesCount,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'late_count' => $lateCount,
                    'status' => $attendanceStatus,
                ];
            });

        // Summary stats for the selected date
        $totalScheduled = $batches->where('is_scheduled_today', true)->count();
        $completedCount = $batches->where('status', 'completed')->count();
        $pendingCount = $batches->where('status', 'pending')->count();
        $totalPresent = $batches->sum('present_count');
        $totalAbsent = $batches->sum('absent_count');

        return Inertia::render('Coaching/Attendance/Index', [
            'batches' => $batches,
            'date' => $date,
            'dayName' => $dayFull,
            'summary' => [
                'total_scheduled' => $totalScheduled,
                'completed' => $completedCount,
                'pending' => $pendingCount,
                'total_present' => $totalPresent,
                'total_absent' => $totalAbsent,
            ],
            'filters' => [
                'search' => $search,
                'date' => $date,
            ],
        ]);
    }

    public function sheet(Request $request, Batch $batch)
    {
        $this->authorize('mark_batch_attendance');

        $date = $request->input('date', now()->format('Y-m-d'));
        $batch->load(['course', 'teacher.user']);

        $enrollments = BatchEnrollment::with(['student.user'])
            ->where('batch_id', $batch->id)
            ->where('status', 'active')
            ->get();

        $existingAttendances = BatchAttendance::where('batch_id', $batch->id)
            ->where('date', $date)
            ->get()
            ->keyBy('student_id');

        $isTaken = $existingAttendances->isNotEmpty();

        // Calculate past attendance rates for each enrolled student
        $studentAttendanceHistory = BatchAttendance::where('batch_id', $batch->id)
            ->where('date', '<', $date)
            ->select('student_id', DB::raw('COUNT(*) as total'), DB::raw('SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as attended'))
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $students = $enrollments->map(function ($enrollment) use ($existingAttendances, $studentAttendanceHistory) {
            $student = $enrollment->student;
            $existing = $existingAttendances->get($student->id);
            $history = $studentAttendanceHistory->get($student->id);

            $pastTotal = $history?->total ?? 0;
            $pastAttended = $history?->attended ?? 0;
            $pastRate = $pastTotal > 0 ? round(($pastAttended / $pastTotal) * 100) : 100;

            return [
                'id' => $student->id,
                'batch_enrollment_id' => $enrollment->id,
                'name' => $student->user?->name ?? ($student->first_name . ' ' . $student->last_name),
                'admission_number' => $student->admission_number ?? $student->id,
                'phone' => $student->phone ?? $student->guardian_phone ?? 'N/A',
                'status' => $existing ? $existing->status : 'present',
                'remarks' => $existing ? $existing->remarks : '',
                'past_attendance_rate' => $pastRate,
                'past_classes' => $pastTotal,
            ];
        });

        return Inertia::render('Coaching/Attendance/Sheet', [
            'batch' => [
                'id' => $batch->id,
                'name' => $batch->name,
                'course_name' => $batch->course?->name ?? 'N/A',
                'teacher_name' => $batch->teacher?->user?->name ?? 'Unassigned',
                'room_no' => $batch->room_no,
                'formatted_schedule' => $batch->formatted_schedule,
            ],
            'students' => $students,
            'date' => $date,
            'isTaken' => $isTaken,
        ]);
    }

    public function save(Request $request, Batch $batch)
    {
        $this->authorize('mark_batch_attendance');

        $validated = $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array|min:1',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.batch_enrollment_id' => 'nullable|exists:batch_enrollments,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.remarks' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $batch) {
            $userId = auth()->id();
            $date = $validated['date'];

            foreach ($validated['attendances'] as $item) {
                BatchAttendance::updateOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'student_id' => $item['student_id'],
                        'date' => $date,
                    ],
                    [
                        'batch_enrollment_id' => $item['batch_enrollment_id'] ?? null,
                        'status' => $item['status'],
                        'remarks' => $item['remarks'] ?? null,
                        'marked_by' => $userId,
                    ]
                );
            }
        });

        return redirect()->route('coaching.attendance.index', ['date' => $validated['date']])
            ->with('success', 'Batch attendance saved successfully.');
    }

    public function report(Request $request, Batch $batch)
    {
        $this->authorize('view_batch_attendance');

        $month = $request->input('month', now()->format('Y-m'));
        $batch->load(['course', 'teacher.user']);

        // Fetch distinct dates for this batch during this month
        $dates = BatchAttendance::where('batch_id', $batch->id)
            ->where('date', 'like', "{$month}%")
            ->distinct()
            ->orderBy('date')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        // Enrolled students
        $enrollments = BatchEnrollment::with(['student.user'])
            ->where('batch_id', $batch->id)
            ->where('status', 'active')
            ->get();

        // All attendances in this month
        $attendances = BatchAttendance::where('batch_id', $batch->id)
            ->where('date', 'like', "{$month}%")
            ->get();

        $attendanceMatrix = [];
        foreach ($attendances as $att) {
            $formattedDate = Carbon::parse($att->date)->format('Y-m-d');
            $attendanceMatrix[$att->student_id][$formattedDate] = $att->status;
        }

        $totalClasses = count($dates);

        $studentReports = $enrollments->map(function ($enrollment) use ($dates, $attendanceMatrix, $totalClasses) {
            $student = $enrollment->student;
            $studentId = $student->id;
            $studentAtts = $attendanceMatrix[$studentId] ?? [];

            $present = 0;
            $absent = 0;
            $late = 0;
            $excused = 0;

            $dateRecords = [];
            foreach ($dates as $d) {
                $status = $studentAtts[$d] ?? '-';
                $dateRecords[$d] = $status;

                if ($status === 'present') $present++;
                elseif ($status === 'late') { $present++; $late++; }
                elseif ($status === 'absent') $absent++;
                elseif ($status === 'excused') $excused++;
            }

            $percentage = $totalClasses > 0 ? round(($present / $totalClasses) * 100) : 0;

            return [
                'id' => $student->id,
                'name' => $student->user?->name ?? ($student->first_name . ' ' . $student->last_name),
                'admission_number' => $student->admission_number ?? $student->id,
                'records' => $dateRecords,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'excused' => $excused,
                'percentage' => $percentage,
            ];
        });

        return Inertia::render('Coaching/Attendance/Report', [
            'batch' => [
                'id' => $batch->id,
                'name' => $batch->name,
                'course_name' => $batch->course?->name ?? 'N/A',
                'teacher_name' => $batch->teacher?->user?->name ?? 'Unassigned',
                'formatted_schedule' => $batch->formatted_schedule,
            ],
            'month' => $month,
            'dates' => $dates,
            'students' => $studentReports,
            'totalClasses' => $totalClasses,
        ]);
    }
}
