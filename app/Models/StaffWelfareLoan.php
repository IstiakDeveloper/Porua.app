<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffWelfareLoan extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_number',
        'teacher_id',
        'account_id',
        'loan_amount',
        'total_paid',
        'remaining_amount',
        'installment_count',
        'paid_installments',
        'installment_amount',
        'loan_date',
        'first_installment_date',
        'status',
        'purpose',
        'remarks',
        'approved_by',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'loan_amount' => 'decimal:2',
            'total_paid' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'installment_amount' => 'decimal:2',
            'installment_count' => 'integer',
            'paid_installments' => 'integer',
            'loan_date' => 'date',
            'first_installment_date' => 'date',
        ];
    }

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function installments()
    {
        return $this->hasMany(StaffWelfareLoanInstallment::class, 'loan_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    // Accessors
    public function getProgressPercentageAttribute()
    {
        if ($this->loan_amount == 0) return 0;
        return round(($this->total_paid / $this->loan_amount) * 100, 2);
    }

    public function getIsFullyPaidAttribute()
    {
        return $this->remaining_amount <= 0;
    }
}
