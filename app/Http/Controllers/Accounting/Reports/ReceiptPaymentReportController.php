<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\FundTransaction;
use App\Models\Setting;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceiptPaymentReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();
        $accountId = $request->account_id;
        // Normalize empty values coming from the UI
        if ($accountId === '' || $accountId === null) {
            $accountId = null;
        }

        // Opening balances:
        // - Period opening: running balance at startDate (opening + all activity before startDate)
        // - Cumulative opening: configured starting balance (no date; software start)
        $openingBalancePeriod = 0;
        $openingBalanceCumulative = 0;

        if ($accountId) {
            // Single account
            $account = Account::find($accountId);
            $openingBalanceCumulative = $account ? $account->opening_balance : 0;

            // Period opening = cumulative opening + all activity before start date
            $openingBalancePeriod = $openingBalanceCumulative;

            $previousTransactions = Transaction::where(function ($query) use ($accountId) {
                $query->where('account_id', $accountId)
                    ->orWhere('transfer_to_account_id', $accountId);
            })
                ->where('transaction_date', '<', $startDate)
                ->get();

            foreach ($previousTransactions as $trans) {
                if ($trans->account_id == $accountId) {
                    if ($trans->type === 'income') {
                        $openingBalancePeriod += $trans->amount;
                    } elseif ($trans->type === 'expense' || $trans->type === 'transfer' || $trans->type === 'asset_purchase') {
                        $openingBalancePeriod -= $trans->amount;
                    }
                }
                if ($trans->transfer_to_account_id == $accountId && $trans->type === 'transfer') {
                    $openingBalancePeriod += $trans->amount;
                }
            }

            $previousFundTransactions = FundTransaction::where('account_id', $accountId)
                ->where('transaction_date', '<', $startDate)
                ->get();

            foreach ($previousFundTransactions as $fundTrans) {
                if ($fundTrans->transaction_type === 'in') {
                    $openingBalancePeriod += $fundTrans->amount;
                } elseif ($fundTrans->transaction_type === 'out') {
                    $openingBalancePeriod -= $fundTrans->amount;
                }
            }
        } else {
            // All accounts - sum all bank/cash account balances
            $allAccounts = Account::where('status', 'active')
                ->whereIn('account_type', ['bank', 'cash'])
                ->get();

            $openingBalancePeriod = 0;
            $openingBalanceCumulative = 0;
            foreach ($allAccounts as $acc) {
                $openingBalanceCumulative += $acc->opening_balance;

                // For "All Accounts", opening should reflect the combined running balance
                // as of the start date (opening + all transactions before start date).
                $accBalance = $acc->opening_balance;

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

                $openingBalancePeriod += $accBalance;
            }
        }

        // Get transactions for the period (Month)
        $transactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount'])
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        if ($accountId) {
            $transactionsQuery->where(function ($query) use ($accountId) {
                $query->where('account_id', $accountId)
                    ->orWhere('transfer_to_account_id', $accountId);
            });
        }

        $monthTransactions = $transactionsQuery->get();

        // Get cumulative transactions (from beginning to end date)
        $cumulativeTransactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount'])
            ->where('transaction_date', '<=', $endDate);

        if ($accountId) {
            $cumulativeTransactionsQuery->where(function ($query) use ($accountId) {
                $query->where('account_id', $accountId)
                    ->orWhere('transfer_to_account_id', $accountId);
            });
        }

        $cumulativeTransactions = $cumulativeTransactionsQuery->get();

        // Get fund transactions for the period
        $fundTransactionsMonthQuery = FundTransaction::with(['fund', 'account'])
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        if ($accountId) {
            $fundTransactionsMonthQuery->where('account_id', $accountId);
        }

        $monthFundTransactions = $fundTransactionsMonthQuery->get();

        // Get cumulative fund transactions
        $fundTransactionsCumulativeQuery = FundTransaction::with(['fund', 'account'])
            ->where('transaction_date', '<=', $endDate);

        if ($accountId) {
            $fundTransactionsCumulativeQuery->where('account_id', $accountId);
        }

        $cumulativeFundTransactions = $fundTransactionsCumulativeQuery->get();

        // Process RECEIPTS with Month and Cumulative amounts
        $receiptsGrouped = [];
        $totalMonthReceipts = 0;
        $totalCumulativeReceipts = 0;

        // Income - Month
        foreach ($monthTransactions as $trans) {
            if ($trans->type === 'income' && (! $accountId || $trans->account_id == $accountId)) {
                $categoryName = $trans->incomeCategory ? $trans->incomeCategory->name : 'Other Income';
                if (! isset($receiptsGrouped[$categoryName])) {
                    $receiptsGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'income',
                    ];
                }
                $receiptsGrouped[$categoryName]['month_amount'] += $trans->amount;
                $totalMonthReceipts += $trans->amount;
            }

            // Transfer In - Month
            if ($trans->type === 'transfer' && $trans->transfer_to_account_id == $accountId) {
                $key = 'Transfer In';
                if (! isset($receiptsGrouped[$key])) {
                    $receiptsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'transfer_in',
                    ];
                }
                $receiptsGrouped[$key]['month_amount'] += $trans->amount;
                $totalMonthReceipts += $trans->amount;
            }
        }

        // Income - Cumulative
        foreach ($cumulativeTransactions as $trans) {
            if ($trans->type === 'income' && (! $accountId || $trans->account_id == $accountId)) {
                $categoryName = $trans->incomeCategory ? $trans->incomeCategory->name : 'Other Income';
                if (! isset($receiptsGrouped[$categoryName])) {
                    $receiptsGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'income',
                    ];
                }
                $receiptsGrouped[$categoryName]['cumulative_amount'] += $trans->amount;
                $totalCumulativeReceipts += $trans->amount;
            }

            // Transfer In - Cumulative
            if ($trans->type === 'transfer' && $trans->transfer_to_account_id == $accountId) {
                $key = 'Transfer In';
                if (! isset($receiptsGrouped[$key])) {
                    $receiptsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'transfer_in',
                    ];
                }
                $receiptsGrouped[$key]['cumulative_amount'] += $trans->amount;
                $totalCumulativeReceipts += $trans->amount;
            }
        }

        // Fund In - Month
        foreach ($monthFundTransactions as $fundTrans) {
            if ($fundTrans->transaction_type === 'in') {
                $key = 'Fund In - '.($fundTrans->fund ? $fundTrans->fund->name : 'Fund');
                if (! isset($receiptsGrouped[$key])) {
                    $receiptsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'fund_in',
                    ];
                }
                $receiptsGrouped[$key]['month_amount'] += $fundTrans->amount;
                $totalMonthReceipts += $fundTrans->amount;
            }
        }

        // Fund In - Cumulative
        foreach ($cumulativeFundTransactions as $fundTrans) {
            if ($fundTrans->transaction_type === 'in') {
                $key = 'Fund In - '.($fundTrans->fund ? $fundTrans->fund->name : 'Fund');
                if (! isset($receiptsGrouped[$key])) {
                    $receiptsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'fund_in',
                    ];
                }
                $receiptsGrouped[$key]['cumulative_amount'] += $fundTrans->amount;
                $totalCumulativeReceipts += $fundTrans->amount;
            }
        }

        $receipts = array_values($receiptsGrouped);

        // Process PAYMENTS with Month and Cumulative amounts
        $paymentsGrouped = [];
        $totalMonthPayments = 0;
        $totalCumulativePayments = 0;
        $fixedAssetsMonthGrouped = [];
        $fixedAssetsCumulativeGrouped = [];

        // Expenses - Month
        foreach ($monthTransactions as $trans) {
            if ($trans->type === 'asset_purchase' && (! $accountId || $trans->account_id == $accountId)) {
                $assetKey = $this->fixedAssetGroupKey((string) ($trans->description ?? ''));
                if (! isset($fixedAssetsMonthGrouped[$assetKey])) {
                    $fixedAssetsMonthGrouped[$assetKey] = 0;
                }
                $fixedAssetsMonthGrouped[$assetKey] += $trans->amount;

                $totalMonthPayments += $trans->amount;
            } elseif ($trans->type === 'expense' && (! $accountId || $trans->account_id == $accountId)) {
                $categoryName = $trans->expenseCategory ? $trans->expenseCategory->name : 'Other Expense';
                if (! isset($paymentsGrouped[$categoryName])) {
                    $paymentsGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'expense',
                    ];
                }
                $paymentsGrouped[$categoryName]['month_amount'] += $trans->amount;
                $totalMonthPayments += $trans->amount;
            }

            // Transfer Out - Month
            if ($trans->type === 'transfer' && $trans->account_id == $accountId) {
                $key = 'Transfer Out';
                if (! isset($paymentsGrouped[$key])) {
                    $paymentsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'transfer_out',
                    ];
                }
                $paymentsGrouped[$key]['month_amount'] += $trans->amount;
                $totalMonthPayments += $trans->amount;
            }
        }

        // Expenses - Cumulative
        foreach ($cumulativeTransactions as $trans) {
            if ($trans->type === 'asset_purchase' && (! $accountId || $trans->account_id == $accountId)) {
                $assetKey = $this->fixedAssetGroupKey((string) ($trans->description ?? ''));
                if (! isset($fixedAssetsCumulativeGrouped[$assetKey])) {
                    $fixedAssetsCumulativeGrouped[$assetKey] = 0;
                }
                $fixedAssetsCumulativeGrouped[$assetKey] += $trans->amount;

                $totalCumulativePayments += $trans->amount;
            } elseif ($trans->type === 'expense' && (! $accountId || $trans->account_id == $accountId)) {
                $categoryName = $trans->expenseCategory ? $trans->expenseCategory->name : 'Other Expense';
                if (! isset($paymentsGrouped[$categoryName])) {
                    $paymentsGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'expense',
                    ];
                }
                $paymentsGrouped[$categoryName]['cumulative_amount'] += $trans->amount;
                $totalCumulativePayments += $trans->amount;
            }

            // Transfer Out - Cumulative
            if ($trans->type === 'transfer' && $trans->account_id == $accountId) {
                $key = 'Transfer Out';
                if (! isset($paymentsGrouped[$key])) {
                    $paymentsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'transfer_out',
                    ];
                }
                $paymentsGrouped[$key]['cumulative_amount'] += $trans->amount;
                $totalCumulativePayments += $trans->amount;
            }
        }

        // Fund Out - Month
        foreach ($monthFundTransactions as $fundTrans) {
            if ($fundTrans->transaction_type === 'out') {
                $key = 'Fund Out - '.($fundTrans->fund ? $fundTrans->fund->name : 'Fund');
                if (! isset($paymentsGrouped[$key])) {
                    $paymentsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'fund_out',
                    ];
                }
                $paymentsGrouped[$key]['month_amount'] += $fundTrans->amount;
                $totalMonthPayments += $fundTrans->amount;
            }
        }

        // Fund Out - Cumulative
        foreach ($cumulativeFundTransactions as $fundTrans) {
            if ($fundTrans->transaction_type === 'out') {
                $key = 'Fund Out - '.($fundTrans->fund ? $fundTrans->fund->name : 'Fund');
                if (! isset($paymentsGrouped[$key])) {
                    $paymentsGrouped[$key] = [
                        'description' => $key,
                        'month_amount' => 0,
                        'cumulative_amount' => 0,
                        'type' => 'fund_out',
                    ];
                }
                $paymentsGrouped[$key]['cumulative_amount'] += $fundTrans->amount;
                $totalCumulativePayments += $fundTrans->amount;
            }
        }

        $payments = array_values($paymentsGrouped);

        // Append Fixed Asset purchases as plain rows (no header/total)
        if (! empty($fixedAssetsMonthGrouped) || ! empty($fixedAssetsCumulativeGrouped)) {
            // Add detail lines (do not affect totals; totals already include asset_purchase above)
            $allAssetKeys = array_unique(array_merge(array_keys($fixedAssetsMonthGrouped), array_keys($fixedAssetsCumulativeGrouped)));
            sort($allAssetKeys);

            $detailRows = [];
            foreach ($allAssetKeys as $assetKey) {
                $detailRows[] = [
                    // Plain rows: no symbols/prefix
                    'description' => $assetKey,
                    'month_amount' => $fixedAssetsMonthGrouped[$assetKey] ?? 0,
                    'cumulative_amount' => $fixedAssetsCumulativeGrouped[$assetKey] ?? 0,
                    'type' => 'fixed_asset_detail',
                ];
            }

            // Put fixed asset rows at the top of payments list
            array_unshift($payments, ...$detailRows);
        }

        // Calculate closing balance
        $closingBalance = $openingBalancePeriod + $totalMonthReceipts - $totalMonthPayments;
        $cumulativeClosingBalance = $openingBalanceCumulative + $totalCumulativeReceipts - $totalCumulativePayments;

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon');
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        return Inertia::render('Accounting/Reports/ReceiptPayment', [
            'receipts' => $receipts,
            'payments' => $payments,
            'openingBalance' => $openingBalancePeriod,
            'openingBalanceCumulative' => $openingBalanceCumulative,
            'totalMonthReceipts' => $totalMonthReceipts,
            'totalMonthPayments' => $totalMonthPayments,
            'totalCumulativeReceipts' => $totalCumulativeReceipts,
            'totalCumulativePayments' => $totalCumulativePayments,
            'closingBalance' => $closingBalance,
            'cumulativeClosingBalance' => $cumulativeClosingBalance,
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

    /**
     * Build a stable display key for grouping fixed asset payment rows.
     * Handles both initial purchase and quantity addition transactions.
     */
    private function fixedAssetGroupKey(string $description): string
    {
        if (preg_match('/Fixed Asset (?:Purchase|Addition):\s*(.+?)\s*\((FA-[^)]+)\)/', $description, $matches)) {
            return trim($matches[1]) . ' (' . trim($matches[2]) . ')';
        }

        if (preg_match('/\((FA-[^)]+)\)/', $description, $matches)) {
            $assetCode = trim($matches[1]);
            if (preg_match('/Fixed Asset (?:Purchase|Addition):\s*(.+?)\s*\(/', $description, $nameMatch)) {
                return trim($nameMatch[1]) . ' (' . $assetCode . ')';
            }

            return 'Fixed Asset (' . $assetCode . ')';
        }

        return 'Fixed Asset';
    }
}
