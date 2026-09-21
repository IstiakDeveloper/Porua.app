<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_type_id',
        'class_id',
        'academic_year_id',
        'amount',
        'due_date',
        'late_fee',
        'late_fee_days',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'late_fee' => 'decimal:2',
            'late_fee_days' => 'integer',
            'due_date' => 'date',
        ];
    }

    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
