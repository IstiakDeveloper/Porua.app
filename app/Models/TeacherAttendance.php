<?php

namespace App\Models;

use App\Support\TeacherAttendanceCalculator;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherAttendance extends Model
{
    use HasFactory;

    protected $table = 'teacher_attendance';

    protected $fillable = [
        'teacher_id',
        'date',
        'status',
        'in_time',
        'out_time',
        'reason',
        'leave_application_id',
        'marked_by',
        // ZKTeco integration fields
        'employee_id',
        'punch_time',
        'punch_state',
        'punch_type',
        'device_sn',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'in_time' => 'datetime',
            'out_time' => 'datetime',
            'punch_time' => 'datetime',
            'punch_state' => 'integer',
        ];
    }

    protected $appends = [
        'check_in_time',
        'check_out_time',
        'remarks',
    ];

    public function getCheckInTimeAttribute(): ?string
    {
        return TeacherAttendanceCalculator::formatTime($this->in_time ?? $this->punch_time);
    }

    public function getCheckOutTimeAttribute(): ?string
    {
        return TeacherAttendanceCalculator::formatTime($this->out_time);
    }

    public function getRemarksAttribute(): ?string
    {
        return $this->reason;
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function marker()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function leaveApplication()
    {
        return $this->belongsTo(LeaveApplication::class, 'leave_application_id');
    }

    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}
