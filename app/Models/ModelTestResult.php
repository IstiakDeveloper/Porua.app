<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModelTestResult extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'model_test_id',
        'student_id',
        'batch_enrollment_id',
        'marks_obtained',
        'is_absent',
        'percentage',
        'status',
        'merit_rank',
        'teacher_remarks',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'percentage' => 'decimal:2',
        'is_absent' => 'boolean',
        'merit_rank' => 'integer',
    ];

    public function modelTest()
    {
        return $this->belongsTo(ModelTest::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function batchEnrollment()
    {
        return $this->belongsTo(BatchEnrollment::class);
    }
}
