<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_id',
        'name',
        'teacher_id',
        'room_no',
        'days_of_week',
        'start_time',
        'end_time',
        'max_capacity',
        'remuneration_type',
        'teacher_commission_rate',
        'status',
        'notes',
    ];

    protected $casts = [
        'days_of_week' => 'array',
        'max_capacity' => 'integer',
        'teacher_commission_rate' => 'decimal:2',
    ];

    protected $appends = [
        'formatted_schedule',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function enrollments()
    {
        return $this->hasMany(BatchEnrollment::class);
    }

    public function activeEnrollments()
    {
        return $this->hasMany(BatchEnrollment::class)->where('status', 'active');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'batch_enrollments')
            ->withPivot(['id', 'enrolled_date', 'agreed_fee', 'discount_amount', 'status', 'notes'])
            ->withTimestamps();
    }

    public function feeCollections()
    {
        return $this->hasMany(FeeCollection::class);
    }

    public function teacherPayouts()
    {
        return $this->hasMany(TeacherPayout::class);
    }

    public function modelTests()
    {
        return $this->hasMany(ModelTest::class);
    }

    public function batchAttendances()
    {
        return $this->hasMany(BatchAttendance::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getFormattedScheduleAttribute(): string
    {
        $days = is_array($this->days_of_week) ? implode(', ', $this->days_of_week) : '';
        $time = '';
        if ($this->start_time && $this->end_time) {
            $start = date('h:i A', strtotime($this->start_time));
            $end = date('h:i A', strtotime($this->end_time));
            $time = " ($start - $end)";
        }
        return trim($days . $time);
    }
}
