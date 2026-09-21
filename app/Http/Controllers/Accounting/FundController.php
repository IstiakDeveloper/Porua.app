<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Fund;
use App\Models\FundTransaction;
use App\Models\Investor;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FundController extends Controller
{
    public function index()
    {
        $this->authorize('manage_accounting');

        // Get investors with their fund balance
        $investors = Investor::select('id', 'investor_code', 'name', 'email', 'phone', 'investor_type', 'status')
            ->withSum(['funds' => function ($query) {
                $query->where('status', 'active');
            }], 'current_balance')
            ->get()
            ->map(function ($investor) {
                $investor->current_balance = $investor->funds_sum_current_balance ?? 0;
                unset($investor->funds_sum_current_balance);
                return $investor;
            });

        // Get stats
        $stats = [
            'total_investors' => Investor::count(),
            'active_investors' => Investor::where('status', 'active')->count(),
            'total_balance' => Fund::where('status', 'active')->sum('current_balance'),
            'total_in' => FundTransaction::where('transaction_type', 'in')->sum('amount'),
            'total_out' => FundTransaction::where('transaction_type', 'out')->sum('amount'),
        ];

        $accounts = Account::where('status', 'active')->get(['id', 'account_name', 'current_balance']);

        return Inertia::render('Accounting/Funds/Index', [
            'investors' => $investors,
            'accounts' => $accounts,
            'stats' => $stats,
        ]);
    }

    public function fundIn(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'investor_id' => 'required|exists:investors,id',
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $investor = Investor::find($validated['investor_id']);

            // Find or create fund for this investor
            $fund = Fund::firstOrCreate(
                [
                    'investor_id' => $validated['investor_id'],
                    'status' => 'active',
                ],
                [
                    'fund_code' => 'FD-' . str_pad(Fund::max('id') + 1, 4, '0', STR_PAD_LEFT),
                    'account_id' => $validated['account_id'],
                    'current_balance' => 0,
                    'created_by' => auth()->id(),
                ]
            );

            // Generate transaction number
            $transactionNumber = 'FTRX-' . date('Ymd') . '-' . str_pad(FundTransaction::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Create transaction
            FundTransaction::create([
                'transaction_number' => $transactionNumber,
                'fund_id' => $fund->id,
                'account_id' => $validated['account_id'],
                'transaction_type' => 'in',
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'] ?? "Fund received from: {$investor->name}",
                'created_by' => auth()->id(),
            ]);

            // Update fund balance
            $fund->increment('current_balance', $validated['amount']);

            // Update account balance (credit - money received)
            Account::find($validated['account_id'])->increment('current_balance', $validated['amount']);

            DB::commit();

            logActivity('create', "Fund IN: ৳{$validated['amount']} from {$investor->name}", FundTransaction::class, $fund->id);

            return redirect()->route('accounting.funds.index')
                ->with('success', "Fund IN recorded successfully! Amount: ৳{$validated['amount']}");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to record Fund IN: ' . $e->getMessage());
        }
    }

    public function fundOut(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'investor_id' => 'required|exists:investors,id',
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $investor = Investor::find($validated['investor_id']);

            // Find active fund for this investor
            $fund = Fund::where('investor_id', $validated['investor_id'])
                ->where('status', 'active')
                ->first();

            if (!$fund) {
                return redirect()->back()
                    ->with('error', 'No active fund found for this investor');
            }

            // Check if investor has sufficient balance
            if ($fund->current_balance < $validated['amount']) {
                return redirect()->back()
                    ->with('error', "Insufficient balance. Current balance: ৳{$fund->current_balance}");
            }

            // Check if account has sufficient balance
            $account = Account::find($validated['account_id']);
            if ($account->current_balance < $validated['amount']) {
                return redirect()->back()
                    ->with('error', "Account has insufficient balance. Current balance: ৳{$account->current_balance}");
            }

            // Generate transaction number
            $transactionNumber = 'FTRX-' . date('Ymd') . '-' . str_pad(FundTransaction::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Create transaction
            FundTransaction::create([
                'transaction_number' => $transactionNumber,
                'fund_id' => $fund->id,
                'account_id' => $validated['account_id'],
                'transaction_type' => 'out',
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'] ?? "Fund returned to: {$investor->name}",
                'created_by' => auth()->id(),
            ]);

            // Update fund balance
            $fund->decrement('current_balance', $validated['amount']);

            // Update account balance (debit - money paid out)
            $account->decrement('current_balance', $validated['amount']);

            // If fund balance is zero, mark as closed
            if ($fund->current_balance == 0) {
                $fund->update(['status' => 'closed']);
            }

            DB::commit();

            logActivity('create', "Fund OUT: ৳{$validated['amount']} to {$investor->name}", FundTransaction::class, $fund->id);

            return redirect()->route('accounting.funds.index')
                ->with('success', "Fund OUT recorded successfully! Amount: ৳{$validated['amount']}");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to record Fund OUT: ' . $e->getMessage());
        }
    }

    public function editTransaction(Request $request, $id)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $transaction = FundTransaction::with(['fund', 'account'])->findOrFail($id);
            $oldAmount = $transaction->amount;
            $amountDifference = $validated['amount'] - $oldAmount;

            // Update transaction
            $transaction->update([
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'],
            ]);

            // Adjust fund balance
            if ($transaction->transaction_type === 'in') {
                // If amount increased, add difference; if decreased, subtract difference
                $transaction->fund->increment('current_balance', $amountDifference);
                $transaction->account->increment('current_balance', $amountDifference);
            } else {
                // For 'out' transactions, reverse the logic
                $transaction->fund->decrement('current_balance', $amountDifference);
                $transaction->account->decrement('current_balance', $amountDifference);
            }

            DB::commit();

            logActivity('update', "Fund transaction edited: {$transaction->transaction_number}", FundTransaction::class, $transaction->id);

            return redirect()->route('accounting.funds.index')
                ->with('success', 'Transaction updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update transaction: ' . $e->getMessage());
        }
    }

    public function deleteTransaction($id)
    {
        $this->authorize('manage_accounting');

        DB::beginTransaction();
        try {
            $transaction = FundTransaction::with(['fund', 'account'])->findOrFail($id);
            $amount = $transaction->amount;
            $transactionNumber = $transaction->transaction_number;

            // Reverse the transaction effects
            if ($transaction->transaction_type === 'in') {
                // Reverse fund IN: decrease balances
                $transaction->fund->decrement('current_balance', $amount);
                $transaction->account->decrement('current_balance', $amount);
            } else {
                // Reverse fund OUT: increase balances
                $transaction->fund->increment('current_balance', $amount);
                $transaction->account->increment('current_balance', $amount);
            }

            // Check if fund needs to be reactivated
            if ($transaction->fund->status === 'closed' && $transaction->fund->current_balance > 0) {
                $transaction->fund->update(['status' => 'active']);
            }

            // Delete the transaction
            $transaction->delete();

            DB::commit();

            logActivity('delete', "Fund transaction deleted: {$transactionNumber}", FundTransaction::class, $id);

            return redirect()->route('accounting.funds.index')
                ->with('success', 'Transaction deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to delete transaction: ' . $e->getMessage());
        }
    }
}
