<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSession extends Model
{
    protected $fillable = [
        'student_id',
        'academic_year_id',
        'class_id',
        'section_id',
        'roll_number',
        'status',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public static function syncPlacement(Student $student): void
    {
        if (! $student->academic_year_id || ! $student->class_id) {
            return;
        }

        static::updateOrCreate(
            [
                'student_id' => $student->id,
                'academic_year_id' => $student->academic_year_id,
            ],
            [
                'class_id' => $student->class_id,
                'section_id' => $student->section_id,
                'roll_number' => $student->roll_number,
                'status' => $student->status === 'passed' ? 'passed_out' : 'enrolled',
            ]
        );
    }
}
