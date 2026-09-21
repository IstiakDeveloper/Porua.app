<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Setting;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncomeExpenditureReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();
        $accountId = $request->account_id;

        // Excluded categories for Income & Expenditure Report
        $excludedIncomeCategories = [
            'Staff Welfare Fund Donation',
            'Staff Welfare Loan Recovery',
            'Provident Fund Contribution',
        ];

        $excludedExpenseCategories = [
            'Staff Welfare Loan',
            'Provident Fund Withdrawal',
            'Fixed Asset Purchase',
        ];

        // Get transactions for the period (Month) - excluding certain categories
        $transactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->whereNotIn('type', ['transfer', 'asset_purchase']); // Exclude transfers and asset purchases

        if ($accountId) {
            $transactionsQuery->where('account_id', $accountId);
        }

        $monthTransactions = $transactionsQuery->get();

        // Get cumulative transactions (from beginning to end date)
        $cumulativeTransactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory'])
            ->where('transaction_date', '<=', $endDate)
            ->whereNotIn('type', ['transfer', 'asset_purchase']);

        if ($accountId) {
            $cumulativeTransactionsQuery->where('account_id', $accountId);
        }

        $cumulativeTransactions = $cumulativeTransactionsQuery->get();

        // Process INCOME with Month and Cumulative amounts
        $incomeGrouped = [];
        $totalMonthIncome = 0;
        $totalCumulativeIncome = 0;

        // Income - Month
        foreach ($monthTransactions as $trans) {
            if ($trans->type === 'income') {
                $categoryName = $trans->incomeCategory ? $trans->incomeCategory->name : 'Other Income';

                // Skip excluded categories
                if (in_array($categoryName, $excludedIncomeCategories)) {
                    continue;
                }

                if (! isset($incomeGrouped[$categoryName])) {
                    $incomeGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                    ];
                }
                $incomeGrouped[$categoryName]['month_amount'] += $trans->amount;
                $totalMonthIncome += $trans->amount;
            }
        }

        // Income - Cumulative
        foreach ($cumulativeTransactions as $trans) {
            if ($trans->type === 'income') {
                $categoryName = $trans->incomeCategory ? $trans->incomeCategory->name : 'Other Income';

                // Skip excluded categories
                if (in_array($categoryName, $excludedIncomeCategories)) {
                    continue;
                }

                if (! isset($incomeGrouped[$categoryName])) {
                    $incomeGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                    ];
                }
                $incomeGrouped[$categoryName]['cumulative_amount'] += $trans->amount;
                $totalCumulativeIncome += $trans->amount;
            }
        }

        $income = array_values($incomeGrouped);

        // Process EXPENDITURE with Month and Cumulative amounts
        $expenditureGrouped = [];
        $totalMonthExpenditure = 0;
        $totalCumulativeExpenditure = 0;

        // Expenditure - Month
        foreach ($monthTransactions as $trans) {
            if ($trans->type === 'expense') {
                $categoryName = $trans->expenseCategory ? $trans->expenseCategory->name : 'Other Expense';

                // Skip excluded categories
                if (in_array($categoryName, $excludedExpenseCategories)) {
                    continue;
                }

                if (! isset($expenditureGrouped[$categoryName])) {
                    $expenditureGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                    ];
                }
                $expenditureGrouped[$categoryName]['month_amount'] += $trans->amount;
                $totalMonthExpenditure += $trans->amount;
            }
        }

        // Expenditure - Cumulative
        foreach ($cumulativeTransactions as $trans) {
            if ($trans->type === 'expense') {
                $categoryName = $trans->expenseCategory ? $trans->expenseCategory->name : 'Other Expense';

                // Skip excluded categories
                if (in_array($categoryName, $excludedExpenseCategories)) {
                    continue;
                }

                if (! isset($expenditureGrouped[$categoryName])) {
                    $expenditureGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                    ];
                }
                $expenditureGrouped[$categoryName]['cumulative_amount'] += $trans->amount;
                $totalCumulativeExpenditure += $trans->amount;
            }
        }

        $expenditure = array_values($expenditureGrouped);

        // Calculate surplus/deficit
        $monthSurplus = $totalMonthIncome - $totalMonthExpenditure;
        $cumulativeSurplus = $totalCumulativeIncome - $totalCumulativeExpenditure;

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon');
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        return Inertia::render('Accounting/Reports/IncomeExpenditure', [
            'income' => $income,
            'expenditure' => $expenditure,
            'totalMonthIncome' => $totalMonthIncome,
            'totalMonthExpenditure' => $totalMonthExpenditure,
            'totalCumulativeIncome' => $totalCumulativeIncome,
            'totalCumulativeExpenditure' => $totalCumulativeExpenditure,
            'monthSurplus' => $monthSurplus,
            'cumulativeSurplus' => $cumulativeSurplus,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'account_id' => $accountId,
            ],
            'accounts' => Account::where('status', 'active')->get(),
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
        ]);
    }
}
