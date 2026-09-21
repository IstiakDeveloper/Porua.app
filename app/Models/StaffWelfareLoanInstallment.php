<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffWelfareLoanInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'installment_number',
        'amount',
        'due_date',
        'paid_date',
        'status',
        'account_id',
        'payment_method',
        'reference_number',
        'remarks',
        'paid_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'installment_number' => 'integer',
            'due_date' => 'date',
            'paid_date' => 'date',
        ];
    }

    // Relationships
    public function loan()
    {
        return $this->belongsTo(StaffWelfareLoan::class, 'loan_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function paidByUser()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'pending')
                    ->where('due_date', '<', now());
            });
    }

    // Accessors
    public function getIsOverdueAttribute()
    {
        return $this->status === 'pending' && $this->due_date < now();
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue) return 0;
        return now()->diffInDays($this->due_date);
    }
}
