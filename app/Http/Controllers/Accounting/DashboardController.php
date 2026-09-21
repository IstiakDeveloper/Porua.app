<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\FixedAsset;
use App\Models\ExpenseCategory;
use App\Models\IncomeCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $totalBalance = Account::where('status', 'active')->sum('current_balance');
        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('type', 'expense')->sum('amount');
        $totalAssets = FixedAsset::where('status', 'active')->sum('current_value');

        // Monthly income/expense
        $monthlyIncome = Transaction::where('type', 'income')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        $monthlyExpense = Transaction::where('type', 'expense')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        // Recent transactions
        $recentTransactions = Transaction::with(['account', 'incomeCategory', 'expenseCategory'])
            ->latest('transaction_date')
            ->limit(10)
            ->get();

        // Expense by category
        $expenseByCategory = Transaction::with('expenseCategory')
            ->where('type', 'expense')
            ->whereMonth('transaction_date', now()->month)
            ->get()
            ->groupBy('expense_category_id')
            ->map(function ($items) {
                return [
                    'category' => $items->first()->expenseCategory->name ?? 'Uncategorized',
                    'total' => $items->sum('amount'),
                ];
            })
            ->values();

        // Income by category
        $incomeByCategory = Transaction::with('incomeCategory')
            ->where('type', 'income')
            ->whereMonth('transaction_date', now()->month)
            ->get()
            ->groupBy('income_category_id')
            ->map(function ($items) {
                return [
                    'category' => $items->first()->incomeCategory->name ?? 'Uncategorized',
                    'total' => $items->sum('amount'),
                ];
            })
            ->values();

        // Accounts summary
        $accounts = Account::where('status', 'active')->get()->map(function ($account) {
            return [
                'id' => $account->id,
                'name' => $account->account_name,
                'type' => $account->account_type,
                'balance' => $account->current_balance,
            ];
        });

        return Inertia::render('Accounting/Dashboard', [
            'stats' => [
                'total_balance' => $totalBalance,
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'total_assets' => $totalAssets,
                'monthly_income' => $monthlyIncome,
                'monthly_expense' => $monthlyExpense,
                'net_balance' => $totalIncome - $totalExpense,
            ],
            'recentTransactions' => $recentTransactions,
            'expenseByCategory' => $expenseByCategory,
            'incomeByCategory' => $incomeByCategory,
            'accounts' => $accounts,
        ]);
    }
}
