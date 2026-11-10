<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\Setting;
use App\Models\Teacher;
use App\Services\LeaveAttendanceSyncService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveReportController extends Controller
{
    public function index(Request $request, LeaveAttendanceSyncService $syncService)
    {
        $this->authorize('view_leave_reports');

        $year = (int) $request->input('year', now()->year);
        $month = $request->input('month');
        $teacherId = $request->input('teacher_id');
        $department = $request->input('department');
        $leaveTypeId = $request->input('leave_type_id');

        $leaveTypes = LeaveType::where('status', true)->orderBy('id')->get();

        // 1. Fetch Teachers
        $teacherQuery = Teacher::active()
            ->orderBy('first_name');

        if ($teacherId) {
            $teacherQuery->where('id', $teacherId);
        }

        if ($department) {
            $teacherQuery->where('department', $department);
        }

        $teachers = $teacherQuery->get(['id', 'first_name', 'last_name', 'employee_id', 'department', 'designation']);

        // 2. Fetch all approved applications for the year/month
        $applicationsQuery = LeaveApplication::with(['leaveType', 'teacher'])
            ->where('status', 'approved')
            ->whereYear('start_date', $year);

        if ($month) {
            $applicationsQuery->whereMonth('start_date', $month);
        }

        if ($teacherId) {
            $applicationsQuery->where('teacher_id', $teacherId);
        }

        if ($department) {
            $applicationsQuery->whereHas('teacher', fn($q) => $q->where('department', $department));
        }

        if ($leaveTypeId) {
            $applicationsQuery->where('leave_type_id', $leaveTypeId);
        }

        $approvedLeaves = $applicationsQuery->get();

        // 3. Build teacher-wise leave consumption rows
        $teacherSummaries = $teachers->map(function ($teacher) use ($leaveTypes, $approvedLeaves) {
            $teacherLeaves = $approvedLeaves->where('teacher_id', $teacher->id);
            $byType = [];
            $totalDays = 0.0;

            foreach ($leaveTypes as $type) {
                $days = (float) $teacherLeaves->where('leave_type_id', $type->id)->sum('total_days');
                $allowed = (float) $type->days_per_year;
                $remaining = $allowed > 0 ? max(0.0, $allowed - $days) : null;

                $byType[$type->code] = [
                    'used' => $days,
                    'allowed' => $allowed,
                    'remaining' => $remaining,
                ];
                $totalDays += $days;
            }

            return [
                'teacher' => [
                    'id' => $teacher->id,
                    'full_name' => $teacher->full_name,
                    'employee_id' => $teacher->employee_id,
                    'department' => $teacher->department ?? 'General',
                    'designation' => $teacher->designation ?? 'Teacher',
                ],
                'by_type' => $byType,
                'total_days_taken' => $totalDays,
            ];
        });

        // 4. Overall stats
        $stats = [
            'total_leave_days' => (float) $approvedLeaves->sum('total_days'),
            'total_approved_requests' => $approvedLeaves->count(),
            'paid_days' => (float) $approvedLeaves->filter(fn($l) => $l->leaveType?->is_paid)->sum('total_days'),
            'unpaid_days' => (float) $approvedLeaves->filter(fn($l) => !$l->leaveType?->is_paid)->sum('total_days'),
            'teachers_on_leave_count' => $approvedLeaves->pluck('teacher_id')->unique()->count(),
        ];

        // Detailed leave list for table
        $detailedLogs = LeaveApplication::with(['teacher', 'leaveType', 'actionBy'])
            ->whereYear('start_date', $year)
            ->when($month, fn($q) => $q->whereMonth('start_date', $month))
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($department, fn($q) => $q->whereHas('teacher', fn($t) => $t->where('department', $department)))
            ->when($leaveTypeId, fn($q) => $q->where('leave_type_id', $leaveTypeId))
            ->latest('start_date')
            ->limit(50)
            ->get();

        $allTeachers = Teacher::active()->get(['id', 'first_name', 'last_name', 'employee_id']);
        $departments = Teacher::whereNotNull('department')->distinct()->pluck('department');

        return Inertia::render('Leaves/Report', [
            'summaries' => $teacherSummaries,
            'detailedLogs' => $detailedLogs,
            'leaveTypes' => $leaveTypes,
            'stats' => $stats,
            'filters' => [
                'year' => $year,
                'month' => $month ? (int) $month : null,
                'teacher_id' => $teacherId ? (int) $teacherId : null,
                'department' => $department,
                'leave_type_id' => $leaveTypeId ? (int) $leaveTypeId : null,
            ],
            'teachers' => $allTeachers,
            'departments' => $departments,
        ]);
    }

    public function print(Request $request)
    {
        $this->authorize('view_leave_reports');

        $year = (int) $request->input('year', now()->year);
        $month = $request->input('month');
        $department = $request->input('department');

        $leaveTypes = LeaveType::where('status', true)->orderBy('id')->get();

        $teachers = Teacher::active()
            ->when($department, fn($q) => $q->where('department', $department))
            ->orderBy('first_name')
            ->get();

        $approvedLeaves = LeaveApplication::with(['leaveType', 'teacher'])
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->when($month, fn($q) => $q->whereMonth('start_date', $month))
            ->when($department, fn($q) => $q->whereHas('teacher', fn($t) => $t->where('department', $department)))
            ->get();

        $rows = $teachers->map(function ($teacher) use ($leaveTypes, $approvedLeaves) {
            $teacherLeaves = $approvedLeaves->where('teacher_id', $teacher->id);
            $byType = [];
            $total = 0.0;

            foreach ($leaveTypes as $type) {
                $days = (float) $teacherLeaves->where('leave_type_id', $type->id)->sum('total_days');
                $byType[$type->code] = $days;
                $total += $days;
            }

            return [
                'teacher' => $teacher,
                'by_type' => $byType,
                'total' => $total,
            ];
        });

        $schoolName = Setting::get('school_name', config('app.name', 'Porua School'));
        $schoolAddress = Setting::get('school_address', '');

        return view('attendance.teachers.leave-report-print', [
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
            'year' => $year,
            'monthName' => $month ? Carbon::create()->month((int)$month)->format('F') : 'Full Year',
            'department' => $department ?? 'All Departments',
            'leaveTypes' => $leaveTypes,
            'rows' => $rows,
            'totalLeaveDays' => (float) $approvedLeaves->sum('total_days'),
            'totalApprovedRequests' => $approvedLeaves->count(),
        ]);
    }
}

