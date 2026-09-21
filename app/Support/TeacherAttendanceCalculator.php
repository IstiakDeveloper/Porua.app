<?php

namespace App\Support;

use App\Models\DeviceSetting;
use App\Models\Holiday;
use App\Models\StudentAttendance;
use App\Models\TeacherAttendance;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class TeacherAttendanceCalculator
{
    public static function weekendDays(?DeviceSetting $settings): array
    {
        $days = $settings?->weekend_days ?? [5, 6];

        if (! is_array($days)) {
            $days = [5, 6];
        }

        return array_values(array_map('intval', $days));
    }

    public static function isWeekend(string $date, array $weekendDays): bool
    {
        return in_array((int) Carbon::parse($date)->dayOfWeek, $weekendDays, true);
    }

    /**
     * @return array<string, string> Y-m-d => holiday name
     */
    public static function holidayMap(string $from, string $to): array
    {
        return Holiday::active()
            ->dateRange($from, $to)
            ->get(['date', 'name'])
            ->mapWithKeys(fn ($holiday) => [$holiday->date->format('Y-m-d') => $holiday->name])
            ->all();
    }

    public static function emptySummary(): array
    {
        return [
            'present' => 0,
            'absent' => 0,
            'late' => 0,
            'early_leave' => 0,
            'half_day' => 0,
            'leave' => 0,
            'holiday' => 0,
            'weekend' => 0,
        ];
    }

    public static function incrementSummary(array &$summary, ?string $status): void
    {
        if ($status && isset($summary[$status])) {
            $summary[$status]++;
        }
    }

    public static function resolveDay(
        string $date,
        TeacherAttendance|StudentAttendance|null $record,
        ?DeviceSetting $settings,
        array $weekendDays,
        array $holidayMap,
        ?CarbonInterface $today = null,
        string $personType = 'teacher'
    ): array {
        $today = $today ?? now();
        $isFuture = Carbon::parse($date)->startOfDay()->gt($today->copy()->startOfDay());
        $holidayName = $holidayMap[$date] ?? null;
        $inTime = $record?->in_time;
        $outTime = $record?->out_time;

        // If out_time is within 60 minutes of in_time, do not consider it a valid checkout
        if ($inTime && $outTime && Carbon::parse($inTime)->diffInMinutes(Carbon::parse($outTime)) < 60) {
            $outTime = null;
        }

        $status = self::determineStatus($date, $record, $settings, $weekendDays, $holidayMap, $isFuture, $personType, $outTime);

        return [
            'status' => $status,
            'attendance_record_id' => $record?->id,
            'in_time' => $inTime?->toIso8601String(),
            'out_time' => $outTime?->toIso8601String(),
            'in_time_formatted' => self::formatTime($inTime),
            'out_time_formatted' => self::formatTime($outTime),
            'hours' => self::workingHours($inTime, $outTime),
            'remarks' => $record?->reason,
            'auto_remarks' => self::autoRemarks(
                $status,
                $inTime,
                $outTime,
                $settings,
                $date,
                $holidayName,
                $record?->reason,
                $personType
            ),
            'holiday_name' => $holidayName,
            'missing_checkout' => (bool) ($inTime && ! $outTime),
        ];
    }

    public static function determineStatus(
        string $date,
        TeacherAttendance|StudentAttendance|null $record,
        ?DeviceSetting $settings,
        array $weekendDays,
        array $holidayMap,
        bool $isFuture,
        string $personType = 'teacher',
        mixed $sanitizedOutTime = null
    ): ?string {
        $stored = $record?->status === 'excused' ? 'leave' : $record?->status;

        if (self::isWeekend($date, $weekendDays) || $stored === 'weekend') {
            return 'weekend';
        }

        if ($record?->in_time) {
            if ($personType === 'student') {
                return $settings
                    ? $settings->calculateStatus($record->in_time, 'student')
                    : ($stored ?: 'present');
            }

            $outTime = $sanitizedOutTime ?? $record->out_time;
            if ($outTime && Carbon::parse($record->in_time)->diffInMinutes(Carbon::parse($outTime)) < 60) {
                $outTime = null;
            }

            return $settings
                ? $settings->computeTeacherStatus($record->in_time, $outTime, $date)
                : ($stored ?: 'present');
        }

        if ($stored === 'leave') {
            return 'leave';
        }

        if ($stored === 'holiday' || isset($holidayMap[$date])) {
            return 'holiday';
        }

        if ($stored) {
            return $stored;
        }

        if ($isFuture) {
            return null;
        }

        return 'absent';
    }

    public static function formatTime(mixed $time): ?string
    {
        if (! $time) {
            return null;
        }

        return Carbon::parse($time)->format('g:i A');
    }

    public static function workingHours(mixed $inTime, mixed $outTime): ?string
    {
        if (! $inTime || ! $outTime) {
            return null;
        }

        $start = Carbon::parse($inTime);
        $end = Carbon::parse($outTime);

        if ($end->lt($start)) {
            return null;
        }

        $hours = (int) $start->diffInHours($end);
        $minutes = (int) $start->copy()->addHours($hours)->diffInMinutes($end);

        return $hours.'h '.$minutes.'m';
    }

    public static function autoRemarks(
        ?string $status,
        mixed $inTime,
        mixed $outTime,
        ?DeviceSetting $settings,
        string $date,
        ?string $holidayName = null,
        ?string $reason = null,
        string $personType = 'teacher'
    ): ?string {
        if ($status === null) {
            return null;
        }

        if ($status === 'weekend') {
            return 'Weekend';
        }

        if ($status === 'holiday') {
            return $holidayName ?: 'Holiday';
        }

        if ($status === 'leave') {
            return $reason ?: 'On leave';
        }

        if ($status === 'absent') {
            return 'Absent';
        }

        if ($status === 'half_day') {
            $hours = self::workingHours($inTime, $outTime);

            return $hours ? 'Half day ('.$hours.')' : 'Half day';
        }

        $parts = [];

        $lateTime = $personType === 'student' ? $settings?->student_late_time : $settings?->teacher_late_time;
        if ($status === 'late' && $inTime && $lateTime) {
            $cutoff = Carbon::parse($date.' '.$lateTime);
            $actual = Carbon::parse($inTime);
            if ($actual->gt($cutoff)) {
                $parts[] = 'Late by '.self::minutesLabel($cutoff->diffInMinutes($actual));
            } else {
                $parts[] = 'Late';
            }
        } elseif ($status === 'late') {
            $parts[] = 'Late';
        }

        if ($status === 'early_leave' && $outTime && $settings?->teacher_out_time) {
            $expected = Carbon::parse($date.' '.$settings->teacher_out_time);
            $actual = Carbon::parse($outTime);
            if ($actual->lt($expected)) {
                $parts[] = 'Left early by '.self::minutesLabel($actual->diffInMinutes($expected));
            } else {
                $parts[] = 'Left early';
            }
        } elseif ($status === 'early_leave') {
            $parts[] = 'Left early';
        }

        if ($inTime && ! $outTime) {
            $parts[] = 'Missing checkout';
        } elseif ($outTime && ! $inTime) {
            $parts[] = 'Missing check-in';
        }

        if ($reason && ! in_array($status, ['leave', 'holiday'], true)) {
            $parts[] = $reason;
        }

        if ($parts === []) {
            return $status === 'present' ? 'Regular' : ucfirst(str_replace('_', ' ', $status));
        }

        return implode(' · ', $parts);
    }

    public static function statusCode(?string $status): string
    {
        return match ($status) {
            'present' => 'P',
            'absent' => 'A',
            'late' => 'L',
            'early_leave' => 'EL',
            'half_day' => 'HD',
            'leave' => 'LV',
            'holiday' => 'H',
            'weekend' => 'W',
            default => '-',
        };
    }

    private static function minutesLabel(int $minutes): string
    {
        $minutes = max(0, $minutes);
        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;

        if ($hours > 0 && $mins > 0) {
            return $hours.'h '.$mins.'m';
        }

        if ($hours > 0) {
            return $hours.'h';
        }

        return $mins.'m';
    }
}
