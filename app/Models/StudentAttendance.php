<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAttendance extends Model
{
    use HasFactory;

    protected $table = 'student_attendance';

    protected $fillable = [
        'student_id',
        'class_id',
        'section_id',
        'academic_year_id',
        'date',
        'status',
        'in_time',
        'out_time',
        'reason',
        'sms_sent',
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
            'date' => 'date',
            'in_time' => 'datetime',
            'out_time' => 'datetime',
            'sms_sent' => 'boolean',
            'punch_time' => 'datetime',
            'punch_state' => 'integer',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function marker()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}
