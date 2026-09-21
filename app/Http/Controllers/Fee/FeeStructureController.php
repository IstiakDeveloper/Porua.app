<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeStructureController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        $feeStructures = FeeStructure::with(['feeType', 'schoolClass', 'academicYear'])
            ->when($request->academic_year_id, fn($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Fees/Structures/Index', [
            'feeStructures' => $feeStructures,
            'feeTypes' => FeeType::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'academicYears' => AcademicYear::all(),
            'filters' => $request->only(['academic_year_id', 'class_id']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_fees');

        return Inertia::render('Fees/Structures/Create', [
            'feeTypes' => FeeType::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'academicYears' => AcademicYear::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'required|exists:classes,id',
            'fee_type_id' => 'required|exists:fee_types,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $feeStructure = FeeStructure::create($validated);

        logActivity('create', "Created fee structure", FeeStructure::class, $feeStructure->id);

        return redirect()->route('fee-structures.index')
            ->with('success', 'Fee structure created successfully');
    }

    public function edit(FeeStructure $feeStructure)
    {
        $this->authorize('manage_fees');

        $feeStructure->load(['feeType', 'schoolClass', 'academicYear']);

        return Inertia::render('Fees/Structures/Edit', [
            'feeStructure' => $feeStructure,
            'feeTypes' => FeeType::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'academicYears' => AcademicYear::all(),
        ]);
    }

    public function update(Request $request, FeeStructure $feeStructure)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'required|exists:classes,id',
            'fee_type_id' => 'required|exists:fee_types,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $feeStructure->update($validated);

        logActivity('update', "Updated fee structure", FeeStructure::class, $feeStructure->id);

        return redirect()->route('fee-structures.index')
            ->with('success', 'Fee structure updated successfully');
    }

    public function destroy(FeeStructure $feeStructure)
    {
        $this->authorize('manage_fees');

        $feeStructure->delete();

        logActivity('delete', "Deleted fee structure", FeeStructure::class, $feeStructure->id);

        return redirect()->route('fee-structures.index')
            ->with('success', 'Fee structure deleted successfully');
    }
}
