<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
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

        return Inertia::render('Academic/Years/Create');
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
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $year = AcademicYear::create($validated);

        logActivity('create', "Created academic year: {$year->name}", AcademicYear::class, $year->id);

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year created successfully');
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
