<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\IncomeCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncomeCategoryController extends Controller
{
    public function index()
    {
        $this->authorize('manage_accounting');

        $categories = IncomeCategory::withCount('transactions')
            ->latest()
            ->get();

        return Inertia::render('Accounting/IncomeCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:income_categories',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $category = IncomeCategory::create($validated);

        logActivity('create', "Created income category: {$category->name}", IncomeCategory::class, $category->id);

        return back()->with('success', 'Income category created successfully');
    }

    public function update(Request $request, IncomeCategory $incomeCategory)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:income_categories,code,' . $incomeCategory->id,
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $incomeCategory->update($validated);

        logActivity('update', "Updated income category: {$incomeCategory->name}", IncomeCategory::class, $incomeCategory->id);

        return back()->with('success', 'Income category updated successfully');
    }

    public function destroy(IncomeCategory $incomeCategory)
    {
        $this->authorize('manage_accounting');

        if ($incomeCategory->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete category with existing transactions');
        }

        $incomeCategory->delete();

        logActivity('delete', "Deleted income category", IncomeCategory::class, $incomeCategory->id);

        return back()->with('success', 'Income category deleted successfully');
    }
}
