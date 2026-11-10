<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\Teacher;
use App\Services\LeaveAttendanceSyncService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveApplicationController extends Controller
{
    public function index(Request $request, LeaveAttendanceSyncService $syncService)
    {
        $this->authorize('view_leaves');

        $status = $request->input('status', 'pending');
        $teacherId = $request->input('teacher_id');
        $department = $request->input('department');
        $leaveTypeId = $request->input('leave_type_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = LeaveApplication::with(['teacher.user', 'leaveType', 'actionBy'])
            ->latest('id');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($teacherId) {
            $query->where('teacher_id', $teacherId);
        }

        if ($department) {
            $query->whereHas('teacher', fn($q) => $q->where('department', $department));
        }

        if ($leaveTypeId) {
            $query->where('leave_type_id', $leaveTypeId);
        }

        if ($fromDate) {
            $query->whereDate('end_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('start_date', '<=', $toDate);
        }

        $applications = $query->paginate(20)->withQueryString();

        // Calculate summary cards
        $today = Carbon::today()->toDateString();
        $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
        $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();

        $stats = [
            'pending' => LeaveApplication::where('status', 'pending')->count(),
            'approved_this_month' => LeaveApplication::where('status', 'approved')
                ->whereBetween('start_date', [$thisMonthStart, $thisMonthEnd])
                ->count(),
            'on_leave_today' => LeaveApplication::where('status', 'approved')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->count(),
            'rejected' => LeaveApplication::where('status', 'rejected')->count(),
        ];

        $teachers = Teacher::active()->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'employee_id', 'department']);
        $departments = Teacher::whereNotNull('department')->distinct()->pluck('department');
        $leaveTypes = LeaveType::active()->get();

        return Inertia::render('Leaves/Index', [
            'applications' => $applications,
            'filters' => [
                'status' => $status,
                'teacher_id' => $teacherId,
                'department' => $department,
                'leave_type_id' => $leaveTypeId,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'stats' => $stats,
            'teachers' => $teachers,
            'departments' => $departments,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function store(Request $request, LeaveAttendanceSyncService $syncService)
    {
        $this->authorize('apply_leaves');

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_half_day' => 'boolean',
            'half_day_type' => 'nullable|in:first_half,second_half',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'auto_approve' => 'boolean',
        ]);

        $isHalfDay = (bool) ($validated['is_half_day'] ?? false);
        $totalDays = $syncService->calculateEffectiveDays($validated['start_date'], $validated['end_date'], $isHalfDay);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $teacher = Teacher::findOrFail($validated['teacher_id']);

        $application = LeaveApplication::create([
            'teacher_id' => $teacher->id,
            'user_id' => $teacher->user_id ?? auth()->id(),
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $totalDays,
            'is_half_day' => $isHalfDay,
            'half_day_type' => $validated['half_day_type'] ?? null,
            'reason' => $validated['reason'],
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        if (!empty($validated['auto_approve']) && auth()->user()->can('approve_leaves')) {
            $syncService->approveLeave($application, auth()->id(), 'Directly approved by Administrator');
        }

        return back()->with('success', 'Leave application recorded successfully.');
    }

    public function approve(Request $request, LeaveApplication $leaveApplication, LeaveAttendanceSyncService $syncService)
    {
        $this->authorize('approve_leaves');

        $validated = $request->validate([
            'admin_remarks' => 'nullable|string|max:500',
        ]);

        $syncService->approveLeave($leaveApplication, auth()->id(), $validated['admin_remarks'] ?? null);

        return back()->with('success', 'Leave application approved and attendance sheet updated.');
    }

    public function reject(Request $request, LeaveApplication $leaveApplication, LeaveAttendanceSyncService $syncService)
    {
        $this->authorize('approve_leaves');

        $validated = $request->validate([
            'admin_remarks' => 'required|string|max:500',
        ]);

        $syncService->rejectLeave($leaveApplication, auth()->id(), $validated['admin_remarks']);

        return back()->with('success', 'Leave application rejected.');
    }

    public function cancel(Request $request, LeaveApplication $leaveApplication, LeaveAttendanceSyncService $syncService)
    {
        $this->authorize('approve_leaves');

        $validated = $request->validate([
            'admin_remarks' => 'nullable|string|max:500',
        ]);

        $syncService->cancelLeave($leaveApplication, $validated['admin_remarks'] ?? 'Cancelled by Admin');

        return back()->with('success', 'Leave application cancelled and attendance records reverted.');
    }
}

