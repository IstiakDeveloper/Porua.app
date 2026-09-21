<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherPayout extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'payout_voucher_no',
        'teacher_id',
        'batch_id',
        'period_month',
        'period_year',
        'total_batch_collection',
        'remuneration_type',
        'commission_rate',
        'calculated_amount',
        'bonus_amount',
        'deduction_amount',
        'paid_amount',
        'payout_date',
        'account_id',
        'payment_method',
        'accounting_transaction_id',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'period_month' => 'integer',
        'period_year' => 'integer',
        'total_batch_collection' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'calculated_amount' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'payout_date' => 'date',
    ];

    public static function nextVoucherNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $prefix = "TP-{$year}{$month}-";
        $last = static::withTrashed()
            ->where('payout_voucher_no', 'like', "{$prefix}%")
            ->count();
        $next = $last + 1;
        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function accountingTransaction()
    {
        return $this->belongsTo(Transaction::class, 'accounting_transaction_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
