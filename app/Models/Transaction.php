<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_id',
        'transaction_number',
        'type',
        'income_category_id',
        'expense_category_id',
        'transfer_to_account_id',
        'amount',
        'transaction_date',
        'payment_method',
        'reference_number',
        'description',
        'attachment',
        'created_by',
    ];

    /**
     * Boot method to prevent deletion of Staff Welfare Fund transactions
     */
    protected static function boot()
    {
        parent::boot();

        // Prevent deletion of Staff Welfare Fund transactions
        static::deleting(function ($transaction) {
            // Check if this is a Staff Welfare Fund transaction
            $isWelfareFundTransaction = false;

            // Check by income category
            if ($transaction->income_category_id) {
                $incomeCategory = $transaction->incomeCategory;
                if ($incomeCategory && (
                    str_contains($incomeCategory->code, 'SWF-') ||
                    str_contains($incomeCategory->name, 'Staff Welfare') ||
                    str_contains($incomeCategory->name, 'Welfare Fund')
                )) {
                    $isWelfareFundTransaction = true;
                }
            }

            // Check by expense category
            if ($transaction->expense_category_id) {
                $expenseCategory = $transaction->expenseCategory;
                if ($expenseCategory && (
                    str_contains($expenseCategory->code, 'SWF-') ||
                    str_contains($expenseCategory->name, 'Staff Welfare') ||
                    str_contains($expenseCategory->name, 'Welfare Fund')
                )) {
                    $isWelfareFundTransaction = true;
                }
            }

            // Check by account name
            if ($transaction->account_id) {
                $account = $transaction->account;
                if ($account && (
                    str_contains($account->account_name, 'Staff Welfare Fund') ||
                    str_contains($account->account_name, 'Welfare Fund')
                )) {
                    $isWelfareFundTransaction = true;
                }
            }

            // Check by description
            if (str_contains($transaction->description, 'Welfare Fund') ||
                str_contains($transaction->description, 'Staff Welfare')) {
                $isWelfareFundTransaction = true;
            }

            // Prevent deletion if it's a welfare fund transaction
            if ($isWelfareFundTransaction) {
                // Log the attempt
                \Log::warning('Attempted to delete Staff Welfare Fund transaction', [
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'user_id' => auth()->id(),
                ]);

                // Return false to prevent deletion
                return false;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function incomeCategory()
    {
        return $this->belongsTo(IncomeCategory::class);
    }

    public function expenseCategory()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function transferToAccount()
    {
        return $this->belongsTo(Account::class, 'transfer_to_account_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
