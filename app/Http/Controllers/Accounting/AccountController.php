<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $accounts = Account::query()
            ->when($request->search, fn($q) => $q->where('account_name', 'like', "%{$request->search}%")
                ->orWhere('account_number', 'like', "%{$request->search}%"))
            ->when($request->type, fn($q) => $q->where('account_type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)->withQueryString();

        $totalBalance = Account::where('status', 'active')->sum('current_balance');
        $totalAccounts = Account::count();
        $activeAccounts = Account::where('status', 'active')->count();

        return Inertia::render('Accounting/Accounts/Index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'type', 'status']),
            'stats' => [
                'total_balance' => $totalBalance,
                'total_accounts' => $totalAccounts,
                'active_accounts' => $activeAccounts,
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/Accounts/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255|unique:accounts',
            'account_type' => 'required|in:bank,cash,mobile_banking',
            'bank_name' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'opening_balance' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['current_balance'] = $validated['opening_balance'];

        $account = Account::create($validated);

        logActivity('create', "Created account: {$account->account_name}", Account::class, $account->id);

        return redirect()->route('accounting.accounts.index')
            ->with('success', 'Account created successfully');
    }

    public function show(Account $account)
    {
        $this->authorize('manage_accounting');

        $account->load(['transactions' => fn($q) => $q->latest()->limit(50)]);

        $totalIncome = $account->transactions()->where('type', 'income')->sum('amount');
        $totalExpense = $account->transactions()->where('type', 'expense')->sum('amount');
        $transfersIn = $account->transfersIn()->sum('amount');
        $transfersOut = $account->transactions()->where('type', 'transfer')->sum('amount');

        return Inertia::render('Accounting/Accounts/Show', [
            'account' => $account,
            'stats' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'transfers_in' => $transfersIn,
                'transfers_out' => $transfersOut,
            ],
        ]);
    }

    public function edit(Account $account)
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/Accounts/Edit', [
            'account' => $account,
        ]);
    }

    public function update(Request $request, Account $account)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255|unique:accounts,account_number,' . $account->id,
            'account_type' => 'required|in:bank,cash,mobile_banking',
            'bank_name' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $account->update($validated);

        logActivity('update', "Updated account: {$account->account_name}", Account::class, $account->id);

        return redirect()->route('accounting.accounts.index')
            ->with('success', 'Account updated successfully');
    }

    public function destroy(Account $account)
    {
        $this->authorize('manage_accounting');

        if ($account->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete account with existing transactions');
        }

        $accountName = $account->account_name;
        $account->delete();

        logActivity('delete', "Deleted account: {$accountName}", Account::class, $account->id);

        return redirect()->route('accounting.accounts.index')
            ->with('success', 'Account deleted successfully');
    }
}
