<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\ExpenseCategory;
use App\Models\FundTransaction;
use App\Models\IncomeCategory;
use App\Models\Setting;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();

        // Get all active bank/cash accounts
        $allAccounts = Account::where('status', 'active')
            ->whereIn('account_type', ['bank', 'cash'])
            ->get();

        // Get all income categories from database
        $incomeCategories = IncomeCategory::where('status', 'active')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        // Get all expense categories from database
        $expenseCategories = ExpenseCategory::where('status', 'active')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        // Build credit categories: Fund In + Income Categories
        $creditCategories = array_merge(['Fund In'], $incomeCategories);

        // Build debit categories: Fund Out + Expense Categories + Asset Purchase
        $debitCategories = array_merge(['Fund Out'], $expenseCategories, ['Asset Purchase']);

        // Calculate Opening Balance (sum of all accounts before start date)
        $openingBalance = $this->calculateOpeningBalance($allAccounts, $startDate);

        // Get all dates in the range
        $dates = [];
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dates[] = $currentDate->format('Y-m-d');
            $currentDate->addDay();
        }

        // Get all transactions in the date range with categories
        $transactions = Transaction::with(['incomeCategory', 'expenseCategory'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date')
            ->get();

        // Get all fund transactions in the date range
        $fundTransactions = FundTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date')
            ->get();

        // Build daily report data with category breakdown
        $dailyData = [];
        $runningBalance = $openingBalance;

        // Initialize totals for each category
        $creditTotals = array_fill_keys($creditCategories, 0);
        $debitTotals = array_fill_keys($debitCategories, 0);
        $grandTotalCredit = 0;
        $grandTotalDebit = 0;

        foreach ($dates as $date) {
            // Initialize day data with all categories
            $dayCredits = array_fill_keys($creditCategories, 0);
            $dayDebits = array_fill_keys($debitCategories, 0);

            // Process fund transactions for this day
            foreach ($fundTransactions as $fundTrans) {
                if ($fundTrans->transaction_date->format('Y-m-d') === $date) {
                    if ($fundTrans->transaction_type === 'in') {
                        $dayCredits['Fund In'] += $fundTrans->amount;
                    } elseif ($fundTrans->transaction_type === 'out') {
                        $dayDebits['Fund Out'] += $fundTrans->amount;
                    }
                }
            }

            // Process regular transactions for this day
            foreach ($transactions as $trans) {
                if ($trans->transaction_date->format('Y-m-d') === $date) {
                    if ($trans->type === 'income') {
                        $categoryName = $trans->incomeCategory->name ?? 'Unknown';
                        if (isset($dayCredits[$categoryName])) {
                            $dayCredits[$categoryName] += $trans->amount;
                        }
                    } elseif ($trans->type === 'expense') {
                        $categoryName = $trans->expenseCategory->name ?? 'Unknown';
                        if (isset($dayDebits[$categoryName])) {
                            $dayDebits[$categoryName] += $trans->amount;
                        }
                    } elseif ($trans->type === 'asset_purchase') {
                        $dayDebits['Asset Purchase'] += $trans->amount;
                    }
                }
            }

            // Calculate totals for the day
            $dayTotalCredit = array_sum($dayCredits);
            $dayTotalDebit = array_sum($dayDebits);
            $runningBalance = $runningBalance + $dayTotalCredit - $dayTotalDebit;

            // Add to grand totals
            $grandTotalCredit += $dayTotalCredit;
            $grandTotalDebit += $dayTotalDebit;

            // Add to category totals
            foreach ($dayCredits as $cat => $amount) {
                $creditTotals[$cat] += $amount;
            }
            foreach ($dayDebits as $cat => $amount) {
                $debitTotals[$cat] += $amount;
            }

            // Only include days with activity
            if ($dayTotalCredit > 0 || $dayTotalDebit > 0) {
                $dailyData[] = [
                    'date' => $date,
                    'credits' => $dayCredits,
                    'total_credit' => $dayTotalCredit,
                    'debits' => $dayDebits,
                    'total_debit' => $dayTotalDebit,
                    'balance' => $runningBalance,
                ];
            }
        }

        $closingBalance = $runningBalance;

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon');
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        return Inertia::render('Accounting/Reports/BankReport', [
            'dailyData' => $dailyData,
            'openingBalance' => $openingBalance,
            'closingBalance' => $closingBalance,
            'grandTotalCredit' => $grandTotalCredit,
            'grandTotalDebit' => $grandTotalDebit,
            'creditTotals' => $creditTotals,
            'debitTotals' => $debitTotals,
            'creditCategories' => $creditCategories,
            'debitCategories' => $debitCategories,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'accounts' => $allAccounts,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
        ]);
    }

    private function calculateOpeningBalance($allAccounts, $startDate)
    {
        $openingBalance = 0;

        foreach ($allAccounts as $acc) {
            $accBalance = $acc->opening_balance;

            // Add all previous transactions for this account before start date
            $prevTrans = Transaction::where(function ($query) use ($acc) {
                $query->where('account_id', $acc->id)
                    ->orWhere('transfer_to_account_id', $acc->id);
            })
                ->where('transaction_date', '<', $startDate)
                ->get();

            foreach ($prevTrans as $trans) {
                if ($trans->account_id == $acc->id) {
                    if ($trans->type === 'income') {
                        $accBalance += $trans->amount;
                    } elseif ($trans->type === 'expense' || $trans->type === 'transfer' || $trans->type === 'asset_purchase') {
                        $accBalance -= $trans->amount;
                    }
                }
                if ($trans->transfer_to_account_id == $acc->id && $trans->type === 'transfer') {
                    $accBalance += $trans->amount;
                }
            }

            // Add fund transactions before start date
            $prevFundTrans = FundTransaction::where('account_id', $acc->id)
                ->where('transaction_date', '<', $startDate)
                ->get();

            foreach ($prevFundTrans as $fundTrans) {
                if ($fundTrans->transaction_type === 'in') {
                    $accBalance += $fundTrans->amount;
                } elseif ($fundTrans->transaction_type === 'out') {
                    $accBalance -= $fundTrans->amount;
                }
            }

            $openingBalance += $accBalance;
        }

        return $openingBalance;
    }
}
