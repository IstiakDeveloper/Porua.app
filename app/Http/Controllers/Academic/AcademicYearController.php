<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\FeeStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index()
    {
        $this->authorize('view_classes');

        $years = AcademicYear::latest()->get();

        return Inertia::render('Academic/Years/Index', [
            'years' => $years,
        ]);
    }

    public function create()
    {
        $this->authorize('create_classes');

        $sourceYears = AcademicYear::query()
            ->orderByDesc('is_current')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'is_current']);

        return Inertia::render('Academic/Years/Create', [
            'sourceYears' => $sourceYears,
            'defaultCopyFromId' => AcademicYear::where('is_current', true)->value('id'),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_classes');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,completed,upcoming',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'copy_fee_structures' => 'boolean',
            'copy_from_academic_year_id' => 'nullable|exists:academic_years,id',
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $copyFeeStructures = (bool) ($validated['copy_fee_structures'] ?? false);
        $copyFromId = $validated['copy_from_academic_year_id'] ?? null;
        unset($validated['copy_fee_structures'], $validated['copy_from_academic_year_id']);

        $year = AcademicYear::create($validated);

        $copiedCount = 0;
        if ($copyFeeStructures && $copyFromId) {
            $sourceStructures = FeeStructure::where('academic_year_id', $copyFromId)->get();
            foreach ($sourceStructures as $structure) {
                FeeStructure::create([
                    'fee_type_id' => $structure->fee_type_id,
                    'class_id' => $structure->class_id,
                    'academic_year_id' => $year->id,
                    'amount' => $structure->amount,
                    'due_date' => $structure->due_date,
                    'late_fee' => $structure->late_fee,
                    'late_fee_days' => $structure->late_fee_days,
                ]);
                $copiedCount++;
            }
        }

        $message = 'Academic year created successfully';
        if ($copiedCount > 0) {
            $message .= " — {$copiedCount} fee structure(s) copied";
        }

        logActivity('create', "Created academic year: {$year->name}".($copiedCount ? " (copied {$copiedCount} fee structures)" : ''), AcademicYear::class, $year->id);

        return redirect()->route('academic-years.index')
            ->with('success', $message);
    }

    public function edit(AcademicYear $academicYear)
    {
        $this->authorize('edit_classes');

        return Inertia::render('Academic/Years/Edit', [
            'year' => $academicYear,
        ]);
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $this->authorize('edit_classes');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,completed,upcoming',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)
                ->where('id', '!=', $academicYear->id)
                ->update(['is_current' => false]);
        }

        $academicYear->update($validated);

        logActivity('update', "Updated academic year: {$academicYear->name}", AcademicYear::class, $academicYear->id);

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year updated successfully');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $this->authorize('delete_classes');

        if ($academicYear->students()->count() > 0) {
            return back()->with('error', 'Cannot delete academic year with enrolled students');
        }

        $yearName = $academicYear->name;
        $academicYear->delete();

        logActivity('delete', "Deleted academic year: {$yearName}", AcademicYear::class, $academicYear->id);

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year deleted successfully');
    }

    public function setCurrent(AcademicYear $academicYear)
    {
        $this->authorize('edit_classes');

        AcademicYear::where('is_current', true)->update(['is_current' => false]);
        $academicYear->update(['is_current' => true, 'status' => 'active']);

        logActivity('update', "Set {$academicYear->name} as current academic year", AcademicYear::class, $academicYear->id);

        return back()->with('success', 'Academic year set as current');
    }
}
