<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\Teacher;
use App\Services\LeaveAttendanceSyncService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherLeaveController extends Controller
{
    public function index(Request $request, LeaveAttendanceSyncService $syncService)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $balances = $syncService->getTeacherLeaveBalances($teacher->id);

        $applications = LeaveApplication::with(['leaveType', 'actionBy'])
            ->where('teacher_id', $teacher->id)
            ->latest('id')
            ->paginate(15);

        $leaveTypes = LeaveType::active()->get();

        return Inertia::render('Teacher/Leaves/Index', [
            'teacher' => [
                'id' => $teacher->id,
                'full_name' => $teacher->full_name,
                'employee_id' => $teacher->employee_id,
                'designation' => $teacher->designation,
                'department' => $teacher->department,
            ],
            'balances' => $balances,
            'applications' => $applications,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function store(Request $request, LeaveAttendanceSyncService $syncService)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_half_day' => 'boolean',
            'half_day_type' => 'nullable|in:first_half,second_half',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $isHalfDay = (bool) ($validated['is_half_day'] ?? false);
        $totalDays = $syncService->calculateEffectiveDays($validated['start_date'], $validated['end_date'], $isHalfDay);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave_attachments', 'public');
        }

        LeaveApplication::create([
            'teacher_id' => $teacher->id,
            'user_id' => $user->id,
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

        return back()->with('success', 'Leave application submitted successfully. It will be reviewed by administration.');
    }

    public function cancel(Request $request, LeaveApplication $leaveApplication, LeaveAttendanceSyncService $syncService)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        if ($leaveApplication->teacher_id !== $teacher->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($leaveApplication->status === 'cancelled') {
            return back()->with('info', 'Application is already cancelled.');
        }

        $syncService->cancelLeave($leaveApplication, 'Cancelled by Teacher');

        return back()->with('success', 'Leave application has been cancelled.');
    }
}

