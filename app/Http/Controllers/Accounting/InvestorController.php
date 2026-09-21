<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Investor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvestorController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $investors = Investor::query()
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('investor_code', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->investor_type, fn($q) => $q->where('investor_type', $request->investor_type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->withCount('funds')
            ->latest()
            ->paginate(20)->withQueryString();

        // Add investment stats for each investor
        $investors->getCollection()->transform(function ($investor) {
            $investor->total_investment = $investor->funds()->sum('current_balance');
            $investor->active_investment = $investor->funds()->where('status', 'active')->sum('current_balance');
            return $investor;
        });

        $stats = [
            'total_investors' => Investor::count(),
            'active_investors' => Investor::where('status', 'active')->count(),
            'total_funds' => Investor::has('funds')->count(),
        ];

        return Inertia::render('Accounting/Investors/Index', [
            'investors' => $investors,
            'filters' => $request->only(['search', 'investor_type', 'status']),
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $this->authorize('manage_accounting');

        // Generate next investor code
        $lastInvestor = Investor::latest('id')->first();
        $nextNumber = $lastInvestor ? (int) substr($lastInvestor->investor_code, 4) + 1 : 1;
        $nextCode = 'INV-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Accounting/Investors/Create', [
            'nextInvestorCode' => $nextCode,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'investor_code' => 'required|string|max:50|unique:investors',
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'investor_type' => 'required|in:individual,organization,institution,government',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        $investor = Investor::create($validated);

        logActivity('create', "Created investor: {$investor->name}", Investor::class, $investor->id);

        return redirect()->route('accounting.investors.index')
            ->with('success', 'Investor created successfully');
    }

    public function show(Investor $investor)
    {
        $this->authorize('manage_accounting');

        $investor->load(['funds' => function ($query) {
            $query->with(['account', 'transactions'])->latest();
        }]);

        $stats = [
            'total_investment' => $investor->funds()->sum('current_balance'),
            'active_investment' => $investor->funds()->where('status', 'active')->sum('current_balance'),
            'total_funds' => $investor->funds()->count(),
            'active_funds' => $investor->funds()->where('status', 'active')->count(),
        ];

        return Inertia::render('Accounting/Investors/Show', [
            'investor' => $investor,
            'stats' => $stats,
        ]);
    }

    public function edit(Investor $investor)
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/Investors/Edit', [
            'investor' => $investor,
        ]);
    }

    public function update(Request $request, Investor $investor)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'investor_code' => 'required|string|max:50|unique:investors,investor_code,' . $investor->id,
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'investor_type' => 'required|in:individual,organization,institution,government',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        $investor->update($validated);

        logActivity('update', "Updated investor: {$investor->name}", Investor::class, $investor->id);

        return redirect()->route('accounting.investors.index')
            ->with('success', 'Investor updated successfully');
    }

    public function destroy(Investor $investor)
    {
        $this->authorize('manage_accounting');

        if ($investor->funds()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete investor with existing funds');
        }

        $investor->delete();

        logActivity('delete', "Deleted investor", Investor::class, $investor->id);

        return redirect()->route('accounting.investors.index')
            ->with('success', 'Investor deleted successfully');
    }

    public function ledger(Investor $investor)
    {
        $this->authorize('manage_accounting');

        // Get all fund transactions for this investor
        $transactions = \App\Models\FundTransaction::whereHas('fund', function ($query) use ($investor) {
            $query->where('investor_id', $investor->id);
        })
            ->with(['account', 'fund'])
            ->orderBy('transaction_date', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'transactions' => $transactions,
            'investor' => $investor,
        ]);
    }
}
