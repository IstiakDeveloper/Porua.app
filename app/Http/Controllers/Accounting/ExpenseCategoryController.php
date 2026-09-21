<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $this->authorize('manage_accounting');

        $categories = ExpenseCategory::withCount('transactions')
            ->latest()
            ->get();

        return Inertia::render('Accounting/ExpenseCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:expense_categories',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $category = ExpenseCategory::create($validated);

        logActivity('create', "Created expense category: {$category->name}", ExpenseCategory::class, $category->id);

        return back()->with('success', 'Expense category created successfully');
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:expense_categories,code,' . $expenseCategory->id,
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $expenseCategory->update($validated);

        logActivity('update', "Updated expense category: {$expenseCategory->name}", ExpenseCategory::class, $expenseCategory->id);

        return back()->with('success', 'Expense category updated successfully');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        $this->authorize('manage_accounting');

        if ($expenseCategory->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete category with existing transactions');
        }

        $expenseCategory->delete();

        logActivity('delete', "Deleted expense category", ExpenseCategory::class, $expenseCategory->id);

        return back()->with('success', 'Expense category deleted successfully');
    }
}
