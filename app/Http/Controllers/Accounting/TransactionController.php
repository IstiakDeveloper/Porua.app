<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\ExpenseCategory;
use App\Models\IncomeCategory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $transactions = Transaction::with(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount', 'creator'])
            ->when($request->search, fn ($q) => $q->where('transaction_number', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%"))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->account_id, fn ($q) => $q->where('account_id', $request->account_id))
            ->when($request->date_from, fn ($q) => $q->whereDate('transaction_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('transaction_date', '<=', $request->date_to))
            // Ensure deterministic "most recent first" ordering even when many
            // transactions share the same transaction_date.
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate(50)->withQueryString()
            ->appends($request->only(['search', 'type', 'account_id', 'date_from', 'date_to']));

        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('type', 'expense')->sum('amount');

        return Inertia::render('Accounting/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'account_id', 'date_from', 'date_to']),
            'accounts' => Account::where('status', 'active')->get(),
            'stats' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net' => $totalIncome - $totalExpense,
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/Transactions/Create', [
            'accounts' => Account::where('status', 'active')->get(),
            'incomeCategories' => IncomeCategory::where('status', 'active')->get(),
            'expenseCategories' => ExpenseCategory::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:income,expense,transfer',
            'income_category_id' => 'required_if:type,income|nullable|exists:income_categories,id',
            'expense_category_id' => 'required_if:type,expense|nullable|exists:expense_categories,id',
            'transfer_to_account_id' => 'required_if:type,transfer|nullable|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'payment_method' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Generate transaction number (including soft-deleted transactions)
            $validated['transaction_number'] = 'TXN-'.date('Ymd').'-'.str_pad(
                Transaction::withTrashed()->whereDate('created_at', today())->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );
            $validated['created_by'] = auth()->id();

            $transaction = Transaction::create($validated);

            // Update account balance
            $account = Account::find($validated['account_id']);
            if ($validated['type'] === 'income') {
                $account->increment('current_balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $account->decrement('current_balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $account->decrement('current_balance', $validated['amount']);
                Account::find($validated['transfer_to_account_id'])->increment('current_balance', $validated['amount']);
            }

            DB::commit();

            logActivity('create', "Created transaction: {$transaction->transaction_number}", Transaction::class, $transaction->id);

            return redirect()->route('accounting.transactions.index')
                ->with('success', 'Transaction created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', 'Failed to create transaction: '.$e->getMessage());
        }
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('manage_accounting');

        $transaction->load(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount', 'creator']);

        return Inertia::render('Accounting/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(Transaction $transaction)
    {
        $this->authorize('manage_accounting');

        $transaction->load(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount']);

        return Inertia::render('Accounting/Transactions/Edit', [
            'transaction' => $transaction,
            'accounts' => Account::where('status', 'active')->get(),
            'incomeCategories' => IncomeCategory::where('status', 'active')->get(),
            'expenseCategories' => ExpenseCategory::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:income,expense,transfer',
            'income_category_id' => 'required_if:type,income|nullable|exists:income_categories,id',
            'expense_category_id' => 'required_if:type,expense|nullable|exists:expense_categories,id',
            'transfer_to_account_id' => 'required_if:type,transfer|nullable|exists:accounts,id|different:account_id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'payment_method' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Normalize irrelevant fields for the selected type
        if ($validated['type'] !== 'income') {
            $validated['income_category_id'] = null;
        }
        if ($validated['type'] !== 'expense') {
            $validated['expense_category_id'] = null;
        }
        if ($validated['type'] !== 'transfer') {
            $validated['transfer_to_account_id'] = null;
        }

        DB::beginTransaction();
        try {
            // Reverse old balance effects
            $oldAccount = Account::find($transaction->account_id);
            $oldTransferTo = $transaction->transfer_to_account_id ? Account::find($transaction->transfer_to_account_id) : null;

            if ($transaction->type === 'income') {
                $oldAccount?->decrement('current_balance', $transaction->amount);
            } elseif ($transaction->type === 'expense') {
                $oldAccount?->increment('current_balance', $transaction->amount);
            } elseif ($transaction->type === 'transfer') {
                $oldAccount?->increment('current_balance', $transaction->amount);
                $oldTransferTo?->decrement('current_balance', $transaction->amount);
            }

            // Apply new balance effects
            $newAccount = Account::find($validated['account_id']);
            $newTransferTo = $validated['transfer_to_account_id'] ? Account::find($validated['transfer_to_account_id']) : null;

            if ($validated['type'] === 'income') {
                $newAccount?->increment('current_balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $newAccount?->decrement('current_balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $newAccount?->decrement('current_balance', $validated['amount']);
                $newTransferTo?->increment('current_balance', $validated['amount']);
            }

            $transaction->update($validated);

            DB::commit();

            logActivity('update', "Updated transaction: {$transaction->transaction_number}", Transaction::class, $transaction->id);

            return redirect()->route('accounting.transactions.show', $transaction)
                ->with('success', 'Transaction updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', 'Failed to update transaction: '.$e->getMessage());
        }
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('manage_accounting');

        DB::beginTransaction();
        try {
            // Reverse the balance changes
            if ($transaction->type === 'income') {
                $transaction->account->decrement('current_balance', $transaction->amount);
            } elseif ($transaction->type === 'expense') {
                $transaction->account->increment('current_balance', $transaction->amount);
            } elseif ($transaction->type === 'transfer' && $transaction->transferToAccount) {
                $transaction->account->increment('current_balance', $transaction->amount);
                $transaction->transferToAccount->decrement('current_balance', $transaction->amount);
            }

            // Attempt to delete the transaction
            $deleted = $transaction->delete();

            // Check if deletion was successful (model protection may prevent it)
            if ($deleted === false) {
                DB::rollBack();

                return redirect()->route('accounting.transactions.index')
                    ->with('error', 'Cannot delete this transaction. Staff Welfare Fund transactions are protected for audit trail.');
            }

            DB::commit();

            logActivity('delete', "Deleted transaction: {$transaction->transaction_number}", Transaction::class, $transaction->id);

            return redirect()->route('accounting.transactions.index')
                ->with('success', 'Transaction deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Failed to delete transaction: '.$e->getMessage());
        }
    }
}
