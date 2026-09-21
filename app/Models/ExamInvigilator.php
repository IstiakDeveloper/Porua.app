<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamInvigilator extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_schedule_id',
        'exam_hall_id',
        'teacher_id',
        'role',
        'duty_start_time',
        'duty_end_time',
        'is_present',
        'check_in_time',
        'check_out_time',
        'responsibilities',
        'remarks',
        'assigned_by',
    ];

    protected function casts(): array
    {
        return [
            'duty_start_time' => 'datetime',
            'duty_end_time' => 'datetime',
            'check_in_time' => 'datetime',
            'check_out_time' => 'datetime',
            'is_present' => 'boolean',
        ];
    }

    // Relationships
    public function examSchedule()
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    public function examHall()
    {
        return $this->belongsTo(ExamHall::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    // Scopes
    public function scopeChief($query)
    {
        return $query->where('role', 'chief');
    }

    public function scopePresent($query)
    {
        return $query->where('is_present', true);
    }

    public function scopeBySchedule($query, $scheduleId)
    {
        return $query->where('exam_schedule_id', $scheduleId);
    }

    public function scopeByHall($query, $hallId)
    {
        return $query->where('exam_hall_id', $hallId);
    }

    // Helper Methods
    public function checkIn()
    {
        $this->update([
            'is_present' => true,
            'check_in_time' => now(),
        ]);
    }

    public function checkOut()
    {
        $this->update([
            'check_out_time' => now(),
        ]);
    }

    public function isChief()
    {
        return $this->role === 'chief';
    }

    public function getDutyDuration()
    {
        if (!$this->check_in_time || !$this->check_out_time) {
            return null;
        }

        return $this->check_in_time->diffInMinutes($this->check_out_time);
    }
}
