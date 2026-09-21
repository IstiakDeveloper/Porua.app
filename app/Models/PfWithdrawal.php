<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Teacher;
use App\Models\User;

class PfWithdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'employee_contribution',
        'employer_contribution',
        'total_amount',
        'withdrawal_date',
        'reason',
        'remarks',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'employee_contribution' => 'decimal:2',
            'employer_contribution' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'withdrawal_date' => 'date',
        ];
    }

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'staff_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
