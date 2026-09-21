<?php

namespace App\Traits;

use App\Models\Account;
use App\Models\IncomeCategory;
use App\Models\Transaction;

trait CreatesAccountingTransactions
{
    /**
     * Create an accounting income transaction for fee collection by fee type
     */
    public function createFeeIncomeTransactionByType(
        int $accountId,
        int $feeTypeId,
        string $feeTypeName,
        float $amount,
        string $date,
        string $paymentMethod,
        string $referenceNumber,
        string $description
    ): Transaction {
        // Step 1: ফি টাইপের নাম থেকে ক্যাটেগরি কোড তৈরি
        $categoryCode = 'FEE-'.strtoupper(str_replace(' ', '-', $feeTypeName));
        $incomeCategory = IncomeCategory::firstOrCreate(
            ['code' => $categoryCode],
            [
                'name' => $feeTypeName.' Income',
                'description' => 'Income from '.$feeTypeName,
                'status' => 'active',
                'created_by' => auth()->id(),
            ]
        );

        // Generate transaction number
        $transactionNumber = 'TRX-'.date('Ymd').'-'.str_pad(
            Transaction::withTrashed()->whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        // Create income transaction (without updating balance)
        $transaction = Transaction::create([
            'transaction_number' => $transactionNumber,
            'account_id' => $accountId,
            'type' => 'income',
            'income_category_id' => $incomeCategory->id,
            'amount' => $amount,
            'transaction_date' => $date,
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'description' => $description,
            'created_by' => auth()->id(),
        ]);

        // Note: Balance should be updated by caller after all transactions
        // to avoid multiple increments

        return $transaction;
    }

    /**
     * Create an accounting income transaction for fee collection
     */
    public function createFeeIncomeTransaction(
        int $accountId,
        float $amount,
        string $date,
        string $paymentMethod,
        string $referenceNumber,
        string $description
    ): Transaction {
        // Get or create "Fee Income" category
        $incomeCategory = IncomeCategory::firstOrCreate(
            ['name' => 'Fee Income'],
            [
                'code' => 'FEE-INC',
                'description' => 'Student fee collections',
                'status' => 'active',
                'created_by' => auth()->id(),
            ]
        );

        // Generate transaction number
        $transactionNumber = 'TRX-'.date('Ymd').'-'.str_pad(
            Transaction::withTrashed()->whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        // Create income transaction
        $transaction = Transaction::create([
            'transaction_number' => $transactionNumber,
            'account_id' => $accountId,
            'type' => 'income',
            'income_category_id' => $incomeCategory->id,
            'amount' => $amount,
            'transaction_date' => $date,
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'description' => $description,
            'created_by' => auth()->id(),
        ]);

        // Update account balance (credit - income)
        Account::find($accountId)->increment('current_balance', $amount);

        return $transaction;
    }

    /**
     * Reverse an accounting transaction
     */
    public function reverseAccountingTransaction(int $transactionId): bool
    {
        $transaction = Transaction::find($transactionId);

        if (! $transaction) {
            return false;
        }

        // Reverse account balance based on transaction type
        $account = Account::find($transaction->account_id);

        if ($transaction->type === 'income') {
            // Reverse income: decrease balance
            $account->decrement('current_balance', $transaction->amount);
        } elseif ($transaction->type === 'expense') {
            // Reverse expense: increase balance
            $account->increment('current_balance', $transaction->amount);
        }

        // Delete the transaction
        $transaction->delete();

        return true;
    }

    /**
     * Create an accounting expense transaction (for salary, expenses etc.)
     */
    public function createExpenseTransaction(
        int $accountId,
        float $amount,
        string $date,
        string $paymentMethod,
        string $referenceNumber,
        string $description,
        ?int $expenseCategoryId = null
    ): Transaction {
        // If no expense category provided, get or create "Salary & Wages" category
        if (! $expenseCategoryId) {
            $expenseCategory = \App\Models\ExpenseCategory::firstOrCreate(
                ['name' => 'Salary & Wages'],
                [
                    'description' => 'Staff and teacher salary payments',
                    'status' => 'active',
                    'created_by' => auth()->id(),
                ]
            );
            $expenseCategoryId = $expenseCategory->id;
        }

        // Generate transaction number
        $transactionNumber = 'TRX-'.date('Ymd').'-'.str_pad(
            Transaction::whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        // Create expense transaction
        $transaction = Transaction::create([
            'transaction_number' => $transactionNumber,
            'account_id' => $accountId,
            'type' => 'expense',
            'expense_category_id' => $expenseCategoryId,
            'amount' => $amount,
            'transaction_date' => $date,
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'description' => $description,
            'created_by' => auth()->id(),
        ]);

        // Update account balance (debit - expense)
        Account::find($accountId)->decrement('current_balance', $amount);

        return $transaction;
    }

    /**
     * Create an accounting income transaction
     */
    public function createIncomeTransaction(
        int $accountId,
        float $amount,
        string $date,
        string $paymentMethod,
        string $referenceNumber,
        string $description,
        ?int $incomeCategoryId = null
    ): Transaction {
        // If no income category provided, get or create generic "Other Income" category
        if (! $incomeCategoryId) {
            $incomeCategory = IncomeCategory::firstOrCreate(
                ['code' => 'OTHER_INCOME'],
                [
                    'name' => 'Other Income',
                    'description' => 'Miscellaneous income',
                    'status' => 'active',
                ]
            );
            $incomeCategoryId = $incomeCategory->id;
        }

        // Generate transaction number
        $transactionNumber = 'TRX-'.date('Ymd').'-'.str_pad(
            Transaction::whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        // Create income transaction
        $transaction = Transaction::create([
            'transaction_number' => $transactionNumber,
            'account_id' => $accountId,
            'type' => 'income',
            'income_category_id' => $incomeCategoryId,
            'amount' => $amount,
            'transaction_date' => $date,
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'description' => $description,
            'created_by' => auth()->id(),
        ]);

        // Update account balance (credit - income)
        Account::find($accountId)->increment('current_balance', $amount);

        return $transaction;
    }
}
