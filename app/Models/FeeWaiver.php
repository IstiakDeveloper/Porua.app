<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeWaiver extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'fee_type_id',
        'academic_year_id',
        'waiver_type',
        'waiver_value',
        'reason',
        'description',
        'valid_from',
        'valid_to',
        'status',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'waiver_value' => 'decimal:2',
            'valid_from' => 'date',
            'valid_to' => 'date',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->whereDate('valid_from', '<=', now())
                     ->where(function($q) {
                         $q->whereNull('valid_to')
                           ->orWhereDate('valid_to', '>=', now());
                     });
    }
}
