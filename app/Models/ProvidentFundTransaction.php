<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher;

class ProvidentFundTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'salary_payment_id',
        'type',
        'employee_contribution',
        'employer_contribution',
        'total_contribution',
        'transaction_date',
    ];

    protected function casts(): array
    {
        return [
            'employee_contribution' => 'decimal:2',
            'employer_contribution' => 'decimal:2',
            'total_contribution' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    // Relationships
    public function staff()
    {
        return $this->belongsTo(Teacher::class, 'staff_id');
    }

    public function salaryPayment()
    {
        return $this->belongsTo(SalaryPayment::class);
    }
}
