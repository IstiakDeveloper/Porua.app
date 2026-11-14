<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'academic_year_id',
        'name',
        'exam_type',
        'exam_kind',
        'term_number',
        'start_date',
        'end_date',
        'result_publish_date',
        'description',
        'status',
        'is_published',
        'marks_locked',
        'min_attendance_percent',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'result_publish_date' => 'date',
            'is_published' => 'boolean',
            'marks_locked' => 'boolean',
            'min_attendance_percent' => 'integer',
            'term_number' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function isClassTest(): bool
    {
        return $this->exam_kind === 'class_test';
    }

    public function isAnnual(): bool
    {
        return $this->exam_kind === 'annual';
    }

    public function kindLabel(): string
    {
        if ($this->exam_kind === 'annual') {
            return 'Annual';
        }
        if ($this->exam_kind === 'class_test') {
            return 'Class Test';
        }
        if ($this->exam_kind === 'semester' && $this->term_number) {
            return 'Semester '.$this->term_number;
        }

        return ucfirst(str_replace('_', ' ', (string) $this->exam_type));
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function classes()
    {
        return $this->belongsToMany(SchoolClass::class, 'class_exam', 'exam_id', 'class_id');
    }

    public function schedules()
    {
        return $this->hasMany(ExamSchedule::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'exam_schedules', 'exam_id', 'subject_id')
            ->withPivot('exam_date', 'start_time', 'end_time', 'full_marks', 'pass_marks', 'exam_hall_id')
            ->withTimestamps();
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }
}
