<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mark extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'subject_id',
        'class_id',
        'theory_marks',
        'practical_marks',
        'total_marks',
        'obtained_marks',
        'grade',
        'grade_point',
        'is_absent',
        'remarks',
        'entered_by',
        'verified_by',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'theory_marks' => 'decimal:2',
            'practical_marks' => 'decimal:2',
            'total_marks' => 'decimal:2',
            'obtained_marks' => 'decimal:2',
            'grade_point' => 'decimal:2',
            'is_absent' => 'boolean',
            'verified_at' => 'datetime',
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

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function enterer()
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_by');
    }

    public function scopeAbsent($query)
    {
        return $query->where('is_absent', true);
    }
}
