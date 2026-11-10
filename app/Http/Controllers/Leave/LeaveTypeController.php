<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    public function index()
    {
        $this->authorize('manage_leave_types');

        $leaveTypes = LeaveType::withCount('applications')->orderBy('id')->get();

        return Inertia::render('Leaves/Types', [
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_leave_types');

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:leave_types,code',
            'days_per_year' => 'required|integer|min:0|max:365',
            'is_paid' => 'required|boolean',
            'color' => 'nullable|string|max:20',
            'requires_attachment' => 'required|boolean',
            'description' => 'nullable|string|max:500',
            'status' => 'required|boolean',
        ]);

        LeaveType::create($validated);

        return back()->with('success', 'Leave type created successfully.');
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        $this->authorize('manage_leave_types');

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:leave_types,code,' . $leaveType->id,
            'days_per_year' => 'required|integer|min:0|max:365',
            'is_paid' => 'required|boolean',
            'color' => 'nullable|string|max:20',
            'requires_attachment' => 'required|boolean',
            'description' => 'nullable|string|max:500',
            'status' => 'required|boolean',
        ]);

        $leaveType->update($validated);

        return back()->with('success', 'Leave type updated successfully.');
    }

    public function destroy(LeaveType $leaveType)
    {
        $this->authorize('manage_leave_types');

        if ($leaveType->applications()->exists()) {
            return back()->with('error', 'Cannot delete leave type that has associated leave applications. You can deactivate it instead.');
        }

        $leaveType->delete();

        return back()->with('success', 'Leave type deleted successfully.');
    }
}

