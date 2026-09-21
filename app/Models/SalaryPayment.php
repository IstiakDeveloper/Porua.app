<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher;

class SalaryPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'month',
        'year',
        'base_salary',
        'provident_fund_deduction',
        'employer_pf_contribution',
        'net_salary',
        'total_amount',
        'payment_date',
        'account_id',
        'payment_method',
        'reference_number',
        'remarks',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'base_salary' => 'decimal:2',
            'provident_fund_deduction' => 'decimal:2',
            'employer_pf_contribution' => 'decimal:2',
            'net_salary' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    // Relationships
    public function staff()
    {
        return $this->belongsTo(Teacher::class, 'staff_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function providentFundTransaction()
    {
        return $this->hasOne(ProvidentFundTransaction::class);
    }

    // Accessors
    public function getMonthNameAttribute()
    {
        $months = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'
        ];
        return $months[$this->month] ?? '';
    }

    public function getPeriodAttribute()
    {
        return $this->month_name . ' ' . $this->year;
    }
}
