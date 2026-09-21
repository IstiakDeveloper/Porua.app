<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_name',
        'account_number',
        'account_type',
        'bank_name',
        'branch',
        'opening_balance',
        'current_balance',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'opening_balance' => 'decimal:2',
            'current_balance' => 'decimal:2',
        ];
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function transfersIn()
    {
        return $this->hasMany(Transaction::class, 'transfer_to_account_id');
    }

    public function getTotalIncomeAttribute()
    {
        return $this->transactions()->where('type', 'income')->sum('amount');
    }

    public function getTotalExpenseAttribute()
    {
        return $this->transactions()->where('type', 'expense')->sum('amount');
    }

    /**
     * Calculate account balance as of a specific date
     * This method can be used across multiple reports for date-wise balance calculation
     *
     * @param string|Carbon $date The date to calculate balance as of
     * @return float The account balance as of the specified date
     */
    public function getBalanceAsOfDate($date)
    {
        // Convert to Carbon if string
        $date = $date instanceof \Carbon\Carbon ? $date : \Carbon\Carbon::parse($date);

        // Start with opening balance
        $balance = $this->opening_balance;

        // Add all income transactions up to date (from transactions table)
        $income = Transaction::where('account_id', $this->id)
            ->where('type', 'income')
            ->where('transaction_date', '<=', $date)
            ->sum('amount');

        // Add all transfers INTO this account up to date
        $transfersIn = Transaction::where('transfer_to_account_id', $this->id)
            ->where('type', 'transfer')
            ->where('transaction_date', '<=', $date)
            ->sum('amount');

        // Subtract all expense transactions up to date
        $expenses = Transaction::where('account_id', $this->id)
            ->where('type', 'expense')
            ->where('transaction_date', '<=', $date)
            ->sum('amount');

        // Subtract all transfers OUT of this account up to date
        $transfersOut = Transaction::where('account_id', $this->id)
            ->where('type', 'transfer')
            ->where('transaction_date', '<=', $date)
            ->sum('amount');

        // Add Fund transactions IN (from fund_transactions table)
        $fundTransactionsIn = \App\Models\FundTransaction::where('account_id', $this->id)
            ->where('transaction_type', 'in')
            ->where('transaction_date', '<=', $date)
            ->sum('amount');

        // Subtract Fund transactions OUT (from fund_transactions table)
        $fundTransactionsOut = \App\Models\FundTransaction::where('account_id', $this->id)
            ->where('transaction_type', 'out')
            ->where('transaction_date', '<=', $date)
            ->sum('amount');

        // Subtract Fixed Asset purchases (from fixed_assets table)
        // Fixed assets directly decrement account balance without creating transaction
        $fixedAssetPurchases = \App\Models\FixedAsset::where('account_id', $this->id)
            ->where('purchase_date', '<=', $date)
            ->sum('purchase_price');

        // Calculate final balance
        $balance = $balance + $income + $transfersIn + $fundTransactionsIn
                   - $expenses - $transfersOut - $fundTransactionsOut - $fixedAssetPurchases;

        return $balance;
    }

    /**
     * Static method to get total balance of all accounts as of a specific date
     * Useful for Balance Sheet and other financial reports
     *
     * @param string|Carbon $date The date to calculate total balance as of
     * @return float Total balance of all accounts as of the specified date
     */
    public static function getTotalBalanceAsOfDate($date)
    {
        $accounts = self::all();
        $totalBalance = 0;

        foreach ($accounts as $account) {
            $totalBalance += $account->getBalanceAsOfDate($date);
        }

        return $totalBalance;
    }
}
