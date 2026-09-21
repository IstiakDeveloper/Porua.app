<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\FixedAsset;
use App\Models\Fund;
use App\Models\Setting;
use App\Models\StaffWelfareLoan;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BalanceSheetReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();

        // ===== FUND AND LIABILITIES (Left Side) =====

        // 1. Fund Balance (from fund_transactions - investors) as of date
        $fundTransactionsIn = \App\Models\FundTransaction::where('transaction_type', 'in')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');

        $fundTransactionsOut = \App\Models\FundTransaction::where('transaction_type', 'out')
            ->where('transaction_date', '<=', $endDate)
            ->sum('amount');

        $fundBalance = $fundTransactionsIn - $fundTransactionsOut;

        // 2. Surplus from Income & Expenditure Statement
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

        $totalIncome = Transaction::where('type', 'income')
            ->where('transaction_date', '<=', $endDate)
            ->whereNotIn('type', ['transfer', 'asset_purchase'])
            ->whereHas('incomeCategory', function ($query) use ($excludedIncomeCategories) {
                $query->whereNotIn('name', $excludedIncomeCategories);
            })
            ->sum('amount');

        $totalExpenditure = Transaction::where('type', 'expense')
            ->where('transaction_date', '<=', $endDate)
            ->whereNotIn('type', ['transfer', 'asset_purchase'])
            ->whereHas('expenseCategory', function ($query) use ($excludedExpenseCategories) {
                $query->whereNotIn('name', $excludedExpenseCategories);
            })
            ->sum('amount');

        $surplus = $totalIncome - $totalExpenditure;

        // 3. Provident Fund Balance
        $pfContributions = Transaction::where('type', 'income')
            ->where('transaction_date', '<=', $endDate)
            ->whereHas('incomeCategory', function ($query) {
                $query->where('name', 'Provident Fund Contribution');
            })
            ->sum('amount');

        $pfWithdrawals = Transaction::where('type', 'expense')
            ->where('transaction_date', '<=', $endDate)
            ->whereHas('expenseCategory', function ($query) {
                $query->where('name', 'Provident Fund Withdrawal');
            })
            ->sum('amount');

        $providentFundBalance = $pfContributions - $pfWithdrawals;

        // 4. Staff Welfare Fund Balance (Donations Only)
        // Note: Loan recoveries are NOT shown here as they reduce the Outstanding Loan Asset
        $welfareDonations = Transaction::where('type', 'income')
            ->where('transaction_date', '<=', $endDate)
            ->whereHas('incomeCategory', function ($query) {
                $query->where('name', 'Staff Welfare Fund Donation');
            })
            ->sum('amount');

        $staffWelfareFundBalance = $welfareDonations;

        // Total Fund and Liabilities
        $totalFundAndLiabilities = $fundBalance + $surplus + $providentFundBalance + $staffWelfareFundBalance;

        // ===== PROPERTY AND ASSETS (Right Side) =====

        // 1. Fixed Assets (list of all active assets with their current values)
        $fixedAssets = FixedAsset::where('status', 'active')
            ->where('purchase_date', '<=', $endDate)
            ->select('asset_name', 'asset_code', 'current_value')
            ->orderBy('asset_name')
            ->get();

        $totalFixedAssets = $fixedAssets->sum('current_value');

        // 2. Staff Welfare Loan Outstanding
        // This is the loan amount minus repayments that occurred on or before the selected date.
        $welfareLoanOutstanding = StaffWelfareLoan::where('status', 'active')
            ->where('loan_date', '<=', $endDate)
            ->withSum(['installments as paid_amount_as_of_date' => function ($query) use ($endDate) {
                $query->whereNotNull('paid_date')
                    ->where('paid_date', '<=', $endDate);
            }], 'amount')
            ->get()
            ->sum(function ($loan) {
                return $loan->loan_amount - $loan->paid_amount_as_of_date;
            });

        // 3. Closing Bank Balance (ALL accounts combined as of the selected date)
        // This already includes all cash movements including loan recoveries
        $closingBankBalance = Account::getTotalBalanceAsOfDate($endDate);

        // Total Property and Assets
        $totalPropertyAndAssets = $totalFixedAssets + $welfareLoanOutstanding + $closingBankBalance;

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon');
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        return Inertia::render('Accounting/Reports/BalanceSheet', [
            'fundAndLiabilities' => [
                'fund' => $fundBalance,
                'surplus' => $surplus,
                'providentFund' => $providentFundBalance,
                'staffWelfareFund' => $staffWelfareFundBalance,
                'total' => $totalFundAndLiabilities,
            ],
            'propertyAndAssets' => [
                'fixedAssets' => $fixedAssets,
                'totalFixedAssets' => $totalFixedAssets,
                'welfareLoanOutstanding' => $welfareLoanOutstanding,
                'closingBankBalance' => $closingBankBalance,
                'total' => $totalPropertyAndAssets,
            ],
            'filters' => [
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'balanceDifference' => $totalPropertyAndAssets - $totalFundAndLiabilities,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
        ]);
    }
}
