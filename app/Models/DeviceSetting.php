<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_name',
        'device_ip',
        'device_port',
        'last_sync_at',
        'last_sync_status',
        'total_synced',
        'teacher_in_time',
        'teacher_out_time',
        'teacher_late_time',
        'student_in_time',
        'student_out_time',
        'student_late_time',
        'weekend_days',
        'auto_mark_present',
        'auto_mark_absent',
        'auto_mark_late',
        'auto_mark_early_leave',
        'sms_on_present',
        'sms_on_absent',
        'sms_on_late',
        'sms_on_early_leave',
        'auto_sync_enabled',
        'sync_interval_minutes',
    ];

    protected function casts(): array
    {
        return [
            'last_sync_at' => 'datetime',
            'total_synced' => 'integer',
            'weekend_days' => 'array',
            'auto_mark_present' => 'boolean',
            'auto_mark_absent' => 'boolean',
            'auto_mark_late' => 'boolean',
            'auto_mark_early_leave' => 'boolean',
            'sms_on_present' => 'boolean',
            'sms_on_absent' => 'boolean',
            'sms_on_late' => 'boolean',
            'sms_on_early_leave' => 'boolean',
            'auto_sync_enabled' => 'boolean',
            'sync_interval_minutes' => 'integer',
        ];
    }

    /**
     * Get the singleton instance (only one setting record should exist)
     */
    public static function current()
    {
        $setting = static::first();

        if (! $setting) {
            $setting = static::create([
                'device_name' => 'ZKTeco F10',
                'device_ip' => '192.168.0.21',
                'device_port' => 4370,
                'weekend_days' => [5, 6], // Friday, Saturday
            ]);
        }

        return $setting;
    }

    /**
     * Check if a given date is a weekend
     */
    public function isWeekend($date)
    {
        $dayOfWeek = (int) Carbon::parse($date)->dayOfWeek;
        $days = array_map('intval', $this->weekend_days ?? []);

        return in_array($dayOfWeek, $days, true);
    }

    /**
     * Check if a given date is a holiday
     */
    public function isHoliday($date)
    {
        return Holiday::where('date', $date)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if a given date is a working day
     */
    public function isWorkingDay($date)
    {
        return ! $this->isWeekend($date) && ! $this->isHoliday($date);
    }

    /**
     * Calculate attendance status based on in_time
     */
    public function calculateStatus($inTime, $type = 'teacher')
    {
        $expectedTime = $type === 'teacher' ? $this->teacher_in_time : $this->student_in_time;
        $lateTime = $type === 'teacher' ? $this->teacher_late_time : $this->student_late_time;

        $expected = Carbon::parse($expectedTime);
        $late = Carbon::parse($lateTime);
        $actual = Carbon::parse($inTime);

        // Check if arrived after late time
        if ($actual->greaterThanOrEqualTo($late)) {
            return $this->auto_mark_late ? 'late' : 'present';
        }

        // On time
        return 'present';
    }

    /** Early leave tolerance (minutes before out_time) */
    const EARLY_LEAVE_TOLERANCE_MINUTES = 15;

    /**
     * Check if should mark as early leave
     */
    public function isEarlyLeave($outTime, $type = 'teacher')
    {
        if (! $this->auto_mark_early_leave) {
            return false;
        }

        if ($type === 'student') {
            return false;
        }

        if (! $this->teacher_out_time) {
            return false;
        }

        $expected = Carbon::parse($this->teacher_out_time);
        $actual = Carbon::parse($outTime);

        return $actual->lessThan($expected->copy()->subMinutes(self::EARLY_LEAVE_TOLERANCE_MINUTES));
    }

    /**
     * Compute teacher attendance status from in_time/out_time using current device settings.
     * Returns: 'present' | 'late' | 'early_leave'
     */
    public function computeTeacherStatus($inTime, $outTime, $date = null)
    {
        $date = $date ? Carbon::parse($date)->toDateString() : now()->toDateString();
        $status = 'present';

        // An out_time within 60 minutes of in_time is not considered a valid checkout
        if ($inTime && $outTime && Carbon::parse($inTime)->diffInMinutes(Carbon::parse($outTime)) < 60) {
            $outTime = null;
        }

        if ($outTime && $this->teacher_out_time && $this->auto_mark_early_leave) {
            $expectedOut = Carbon::parse($date.' '.$this->teacher_out_time);
            $actualOut = Carbon::parse($outTime);
            if ($actualOut->lessThan($expectedOut->copy()->subMinutes(self::EARLY_LEAVE_TOLERANCE_MINUTES))) {
                $status = 'early_leave';
            }
        }

        if ($inTime && $this->teacher_late_time && $this->auto_mark_late) {
            $lateCutoff = Carbon::parse($date.' '.$this->teacher_late_time);
            $actualIn = Carbon::parse($inTime);
            if ($actualIn->greaterThan($lateCutoff)) {
                $status = 'late';
            }
        }

        return $status;
    }

    /**
     * Update last sync information
     */
    public function updateLastSync($status, $message = null, $records = 0)
    {
        $this->update([
            'last_sync_at' => now(),
            'last_sync_status' => $status,
            'last_sync_message' => $message,
            'last_sync_records' => $records,
        ]);
    }

    /**
     * Get formatted last sync time
     */
    public function getLastSyncFormatted()
    {
        if (! $this->last_sync_at) {
            return 'Never';
        }

        return $this->last_sync_at->diffForHumans();
    }
}
