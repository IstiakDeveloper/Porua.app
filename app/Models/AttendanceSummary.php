<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSummary extends Model
{
    use HasFactory;

    protected $table = 'attendance_summary';

    protected $fillable = [
        'student_id',
        'academic_year_id',
        'month',
        'year',
        'total_days',
        'present_days',
        'absent_days',
        'late_days',
        'leave_days',
        'half_days',
        'attendance_percentage',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'total_days' => 'integer',
            'present_days' => 'integer',
            'absent_days' => 'integer',
            'late_days' => 'integer',
            'leave_days' => 'integer',
            'half_days' => 'integer',
            'attendance_percentage' => 'decimal:2',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
