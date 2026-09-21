<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'class_id',
        'total_marks',
        'obtained_marks',
        'percentage',
        'gpa',
        'grade',
        'class_position',
        'section_position',
        'result_status',
        'remarks',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'total_marks' => 'decimal:2',
            'obtained_marks' => 'decimal:2',
            'percentage' => 'decimal:2',
            'gpa' => 'decimal:2',
            'class_position' => 'integer',
            'section_position' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopePass($query)
    {
        return $query->where('result_status', 'pass');
    }

    public function scopeFail($query)
    {
        return $query->where('result_status', 'fail');
    }
}
