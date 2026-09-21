<?php

namespace App\Http\Controllers;

use App\Models\OtherStaff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherStaffController extends Controller
{
    /**
     * Display a listing of other staff.
     */
    public function index(Request $request)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access. Only Super Admin can access Other Staff module.');

        $query = OtherStaff::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $staff = $query->orderBy('name')->paginate(15)->withQueryString();

        $stats = [
            'total' => OtherStaff::count(),
            'active' => OtherStaff::where('status', 'active')->count(),
            'inactive' => OtherStaff::where('status', 'inactive')->count(),
        ];

        return Inertia::render('OtherStaff/Index', [
            'staff' => $staff,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created other staff in storage.
     */
    public function store(Request $request)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access.');

        $validated = $request->validate([
            'employee_id' => 'required|string|max:50|unique:other_staff,employee_id',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'designation' => 'nullable|string|max:100',
            'in_time' => 'required|string',
            'out_time' => 'required|string',
            'late_time' => 'nullable|string',
            'weekend' => 'nullable|array',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['late_time'])) {
            $validated['late_time'] = $validated['in_time'];
        }

        if (empty($validated['weekend'])) {
            $validated['weekend'] = ['Friday'];
        }

        OtherStaff::create($validated);

        return redirect()->back()->with('success', 'Other Staff member created successfully.');
    }

    /**
     * Update the specified other staff in storage.
     */
    public function update(Request $request, OtherStaff $otherStaff)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access.');

        $validated = $request->validate([
            'employee_id' => 'required|string|max:50|unique:other_staff,employee_id,' . $otherStaff->id,
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'designation' => 'nullable|string|max:100',
            'in_time' => 'required|string',
            'out_time' => 'required|string',
            'late_time' => 'nullable|string',
            'weekend' => 'nullable|array',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['late_time'])) {
            $validated['late_time'] = $validated['in_time'];
        }

        if (empty($validated['weekend'])) {
            $validated['weekend'] = ['Friday'];
        }

        $otherStaff->update($validated);

        return redirect()->back()->with('success', 'Other Staff member updated successfully.');
    }

    /**
     * Remove the specified other staff from storage.
     */
    public function destroy(OtherStaff $otherStaff)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access.');

        $otherStaff->delete();

        return redirect()->back()->with('success', 'Other Staff member deleted successfully.');
    }

    /**
     * Toggle the status of specified other staff.
     */
    public function toggleStatus(OtherStaff $otherStaff)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access.');

        $otherStaff->update([
            'status' => $otherStaff->status === 'active' ? 'inactive' : 'active',
        ]);

        return redirect()->back()->with('success', 'Staff status updated successfully.');
    }
}
