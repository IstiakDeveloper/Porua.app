<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\FixedAsset;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FixedAssetController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $assets = FixedAsset::query()
            ->withSum('items as total_quantity', 'quantity')
            ->when($request->search, fn($q) => $q->where('asset_name', 'like', "%{$request->search}%")
                ->orWhere('asset_code', 'like', "%{$request->search}%"))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)->withQueryString();

        $totalValue = FixedAsset::where('status', 'active')->sum('current_value');
        $totalAssets = FixedAsset::count();

        return Inertia::render('Accounting/FixedAssets/Index', [
            'assets' => $assets,
            'filters' => $request->only(['search', 'category', 'status']),
            'stats' => [
                'total_value' => $totalValue,
                'total_assets' => $totalAssets,
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('manage_accounting');

        $lastAsset = FixedAsset::latest('id')->first();
        $nextNumber = $lastAsset ? (int) substr($lastAsset->asset_code, 3) + 1 : 1;
        $nextCode = 'FA-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Accounting/FixedAssets/Create', [
            'accounts' => Account::where('status', 'active')->get(),
            'nextAssetCode' => $nextCode,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'asset_name' => 'required|string|max:255',
            'asset_code' => 'required|string|max:50|unique:fixed_assets',
            'category' => 'required|string|max:100',
            'account_id' => 'required|exists:accounts,id',
            'purchase_date' => 'required|date',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:active,disposed,damaged',
            'quantity' => 'required|numeric|min:0.01',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $quantity = round((float) $validated['quantity'], 2);
        $amount = round((float) $validated['amount'], 2);
        $unitPrice = round($amount / $quantity, 2);

        DB::beginTransaction();
        try {
            $asset = FixedAsset::create([
                'asset_name' => $validated['asset_name'],
                'asset_code' => $validated['asset_code'],
                'category' => $validated['category'],
                'account_id' => $validated['account_id'],
                'purchase_price' => $amount,
                'purchase_date' => $validated['purchase_date'],
                'depreciation_rate' => $validated['depreciation_rate'] ?? 0,
                'current_value' => $amount,
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'],
            ]);

            $asset->items()->create([
                'item_name' => $asset->asset_name,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'amount' => $amount,
            ]);

            $transactionNumber = $this->generateTransactionNumber();

            Transaction::create([
                'account_id' => $validated['account_id'],
                'transaction_number' => $transactionNumber,
                'type' => 'asset_purchase',
                'amount' => $amount,
                'transaction_date' => $validated['purchase_date'],
                'description' => "Fixed Asset Purchase: {$asset->asset_name} ({$asset->asset_code}) - Qty: {$quantity}",
                'created_by' => auth()->id(),
            ]);

            Account::find($validated['account_id'])->decrement('current_balance', $amount);

            DB::commit();

            logActivity('create', "Created fixed asset: {$asset->asset_name} (Qty: {$quantity}) with transaction: {$transactionNumber}", FixedAsset::class, $asset->id);

            return redirect()->route('accounting.fixed-assets.index')
                ->with('success', 'Fixed asset purchased successfully and payment recorded');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to purchase fixed asset: ' . $e->getMessage());
        }
    }

    public function show(FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        $fixedAsset->load('items');

        return Inertia::render('Accounting/FixedAssets/Show', [
            'asset' => $this->appendQuantitySummary($fixedAsset),
            'accounts' => Account::where('status', 'active')->get(),
        ]);
    }

    public function edit(FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/FixedAssets/Edit', [
            'asset' => $fixedAsset,
        ]);
    }

    public function update(Request $request, FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'asset_name' => 'required|string|max:255',
            'asset_code' => 'required|string|max:50|unique:fixed_assets,asset_code,' . $fixedAsset->id,
            'category' => 'required|string|max:100',
            'purchase_date' => 'required|date',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'current_value' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,disposed,damaged',
        ]);

        DB::beginTransaction();
        try {
            $fixedAsset->update($validated);

            $item = $fixedAsset->items()->first();
            if ($item) {
                $item->update(['item_name' => $validated['asset_name']]);
            }

            DB::commit();

            logActivity('update', "Updated fixed asset: {$fixedAsset->asset_name}", FixedAsset::class, $fixedAsset->id);

            return redirect()->route('accounting.fixed-assets.index')
                ->with('success', 'Fixed asset updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update fixed asset: ' . $e->getMessage());
        }
    }

    public function destroy(FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        $fixedAsset->delete();

        logActivity('delete', "Deleted fixed asset", FixedAsset::class, $fixedAsset->id);

        return redirect()->route('accounting.fixed-assets.index')
            ->with('success', 'Fixed asset deleted successfully');
    }

    public function storeItems(Request $request, FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'purchase_date' => 'nullable|date',
            'quantity' => 'required|numeric|min:0.01',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $addQuantity = round((float) $validated['quantity'], 2);
        $addAmount = round((float) $validated['amount'], 2);
        $purchaseDate = $validated['purchase_date'] ?? now()->toDateString();

        DB::beginTransaction();
        try {
            $this->addQuantityToAsset($fixedAsset, $addQuantity, $addAmount);

            $fixedAsset->update([
                'purchase_price' => $fixedAsset->purchase_price + $addAmount,
                'current_value' => $fixedAsset->current_value + $addAmount,
            ]);

            $transactionNumber = $this->generateTransactionNumber();

            Transaction::create([
                'account_id' => $validated['account_id'],
                'transaction_number' => $transactionNumber,
                'type' => 'asset_purchase',
                'amount' => $addAmount,
                'transaction_date' => $purchaseDate,
                'description' => "Fixed Asset Addition: {$fixedAsset->asset_name} ({$fixedAsset->asset_code}) - Qty: +{$addQuantity}",
                'created_by' => auth()->id(),
            ]);

            Account::find($validated['account_id'])->decrement('current_balance', $addAmount);

            DB::commit();

            logActivity('update', "Added Qty {$addQuantity} to fixed asset: {$fixedAsset->asset_name}", FixedAsset::class, $fixedAsset->id);

            return redirect()->route('accounting.fixed-assets.show', $fixedAsset)
                ->with('success', 'Quantity and amount added successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to add quantity: ' . $e->getMessage());
        }
    }

    private function addQuantityToAsset(FixedAsset $asset, float $addQuantity, float $addAmount): void
    {
        $item = $asset->items()->first();

        if ($item) {
            $newQuantity = round((float) $item->quantity + $addQuantity, 2);
            $newAmount = round((float) $item->amount + $addAmount, 2);

            $item->update([
                'item_name' => $asset->asset_name,
                'quantity' => $newQuantity,
                'amount' => $newAmount,
                'unit_price' => $newQuantity > 0 ? round($newAmount / $newQuantity, 2) : 0,
            ]);
        } else {
            $asset->items()->create([
                'item_name' => $asset->asset_name,
                'quantity' => $addQuantity,
                'amount' => $addAmount,
                'unit_price' => round($addAmount / $addQuantity, 2),
            ]);
        }
    }

    private function appendQuantitySummary(FixedAsset $asset): FixedAsset
    {
        $items = $asset->items;
        $totalQuantity = $items->sum('quantity');
        $totalAmount = $items->sum('amount');

        $asset->quantity_summary = [
            'quantity' => (float) $totalQuantity,
            'amount' => (float) $totalAmount,
            'unit_price' => $totalQuantity > 0 ? round($totalAmount / $totalQuantity, 2) : 0,
        ];

        return $asset;
    }

    private function generateTransactionNumber(): string
    {
        return 'TXN-' . date('Ymd') . '-' . str_pad(
            Transaction::withTrashed()->whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );
    }
}
