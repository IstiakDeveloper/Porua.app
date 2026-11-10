<?php

namespace App\Services;

use App\Models\DeviceSetting;
use App\Models\Holiday;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\TeacherAttendance;
use App\Support\TeacherAttendanceCalculator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LeaveAttendanceSyncService
{
    /**
     * Calculate effective days for a leave request, excluding weekends and holidays.
     */
    public function calculateEffectiveDays(Carbon|string $startDate, Carbon|string $endDate, bool $isHalfDay = false): float
    {
        if ($isHalfDay) {
            return 0.5;
        }

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->startOfDay();

        if ($end->lt($start)) {
            return 0.0;
        }

        $settings = DeviceSetting::first();
        $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
        $holidayMap = TeacherAttendanceCalculator::holidayMap($start->format('Y-m-d'), $end->format('Y-m-d'));

        $count = 0;
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $dateStr = $cursor->format('Y-m-d');
            $isWeekend = TeacherAttendanceCalculator::isWeekend($dateStr, $weekendDays);
            $isHoliday = isset($holidayMap[$dateStr]);

            if (!$isWeekend && !$isHoliday) {
                $count++;
            }
            $cursor->addDay();
        }

        // If all selected days fall on weekends/holidays, count as 0 or 1 depending on calendar span
        return (float) max($count, 1);
    }

    /**
     * Approve leave application and sync attendance records.
     */
    public function approveLeave(LeaveApplication $application, int $actionByUserId, ?string $adminRemarks = null): void
    {
        DB::transaction(function () use ($application, $actionByUserId, $adminRemarks) {
            $application->update([
                'status' => 'approved',
                'action_by' => $actionByUserId,
                'action_at' => now(),
                'admin_remarks' => $adminRemarks ?? $application->admin_remarks,
            ]);

            $start = Carbon::parse($application->start_date)->startOfDay();
            $end = Carbon::parse($application->end_date)->startOfDay();

            $settings = DeviceSetting::first();
            $weekendDays = TeacherAttendanceCalculator::weekendDays($settings);
            $holidayMap = TeacherAttendanceCalculator::holidayMap($start->format('Y-m-d'), $end->format('Y-m-d'));

            $cursor = $start->copy();
            while ($cursor->lte($end)) {
                $dateStr = $cursor->format('Y-m-d');
                $isWeekend = TeacherAttendanceCalculator::isWeekend($dateStr, $weekendDays);
                $isHoliday = isset($holidayMap[$dateStr]);

                // Record leave on working days
                if (!$isWeekend && !$isHoliday) {
                    $leaveTypeName = $application->leaveType->name ?? 'Leave';
                    $status = $application->is_half_day ? 'half_day' : 'leave';

                    TeacherAttendance::updateOrCreate(
                        [
                            'teacher_id' => $application->teacher_id,
                            'date' => $dateStr,
                        ],
                        [
                            'status' => $status,
                            'reason' => "Leave: {$leaveTypeName}" . ($application->reason ? " - {$application->reason}" : ''),
                            'marked_by' => $actionByUserId,
                            'leave_application_id' => $application->id,
                        ]
                    );
                }

                $cursor->addDay();
            }
        });
    }

    /**
     * Reject leave application.
     */
    public function rejectLeave(LeaveApplication $application, int $actionByUserId, string $adminRemarks): void
    {
        DB::transaction(function () use ($application, $actionByUserId, $adminRemarks) {
            $this->removeSyncedAttendance($application);

            $application->update([
                'status' => 'rejected',
                'action_by' => $actionByUserId,
                'action_at' => now(),
                'admin_remarks' => $adminRemarks,
            ]);
        });
    }

    /**
     * Cancel leave application (by teacher or admin).
     */
    public function cancelLeave(LeaveApplication $application, ?string $remarks = null): void
    {
        DB::transaction(function () use ($application, $remarks) {
            $this->removeSyncedAttendance($application);

            $application->update([
                'status' => 'cancelled',
                'admin_remarks' => $remarks ?? $application->admin_remarks,
            ]);
        });
    }

    /**
     * Clean up any attendance records linked to this leave application.
     */
    public function removeSyncedAttendance(LeaveApplication $application): void
    {
        TeacherAttendance::where('leave_application_id', $application->id)->delete();
    }

    /**
     * Get Leave balance summary for a teacher for a given calendar year.
     */
    public function getTeacherLeaveBalances(int $teacherId, ?int $year = null): array
    {
        $year = $year ?? (int) now()->format('Y');

        $leaveTypes = LeaveType::where('status', true)->get();

        $approvedApplications = LeaveApplication::where('teacher_id', $teacherId)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->get();

        return $leaveTypes->map(function ($type) use ($approvedApplications) {
            $usedDays = (float) $approvedApplications
                ->where('leave_type_id', $type->id)
                ->sum('total_days');

            $allowed = (float) $type->days_per_year;
            $remaining = $allowed > 0 ? max(0.0, $allowed - $usedDays) : ($type->is_paid ? 0.0 : null);

            return [
                'leave_type_id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'color' => $type->color,
                'is_paid' => $type->is_paid,
                'days_allowed' => $allowed,
                'days_used' => $usedDays,
                'days_remaining' => $remaining,
            ];
        })->values()->all();
    }
}

