<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeTypeController extends Controller
{
    public function index()
    {
        $this->authorize('manage_fees');

        $feeTypes = FeeType::latest()->get();

        return Inertia::render('Fees/Types/Index', [
            'feeTypes' => $feeTypes,
        ]);
    }

    public function create()
    {
        $this->authorize('manage_fees');

        return Inertia::render('Fees/Types/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:fee_types',
            'description' => 'nullable|string',
            'frequency' => 'required|in:monthly,quarterly,yearly,one_time',
            'status' => 'required|in:active,inactive',
        ]);

        $feeType = FeeType::create($validated);

        logActivity('create', "Created fee type: {$feeType->name}", FeeType::class, $feeType->id);

        return redirect()->route('fee-types.index')
            ->with('success', 'Fee type created successfully');
    }

    public function edit(FeeType $feeType)
    {
        $this->authorize('manage_fees');

        return Inertia::render('Fees/Types/Edit', [
            'feeType' => $feeType,
        ]);
    }

    public function update(Request $request, FeeType $feeType)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:fee_types,code,' . $feeType->id,
            'description' => 'nullable|string',
            'frequency' => 'required|in:monthly,quarterly,yearly,one_time',
            'status' => 'required|in:active,inactive',
        ]);

        $feeType->update($validated);

        logActivity('update', "Updated fee type: {$feeType->name}", FeeType::class, $feeType->id);

        return redirect()->route('fee-types.index')
            ->with('success', 'Fee type updated successfully');
    }

    public function destroy(FeeType $feeType)
    {
        $this->authorize('manage_fees');

        if ($feeType->feeStructures()->count() > 0) {
            return back()->with('error', 'Cannot delete fee type with existing structures');
        }

        $feeTypeName = $feeType->name;
        $feeType->delete();

        logActivity('delete', "Deleted fee type: {$feeTypeName}", FeeType::class, $feeType->id);

        return redirect()->route('fee-types.index')
            ->with('success', 'Fee type deleted successfully');
    }
}
