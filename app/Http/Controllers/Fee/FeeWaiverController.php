<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeWaiver;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeWaiverController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        $waivers = FeeWaiver::with(['student.user', 'student.schoolClass'])
            ->when($request->waiver_type, fn($q) => $q->where('waiver_type', $request->waiver_type))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Fees/Waivers/Index', [
            'feeWaivers' => $waivers,
            'students' => Student::with(['user', 'schoolClass'])->where('status', 'active')->get(),
            'filters' => $request->only(['waiver_type']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_fees');

        return Inertia::render('Fees/Waivers/Create', [
            'students' => Student::with(['user', 'schoolClass'])->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'waiver_type' => 'required|in:percentage,fixed',
            'waiver_amount' => 'required|numeric|min:0',
            'reason' => 'required|string',
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after_or_equal:valid_from',
            'status' => 'required|in:active,expired,cancelled',
        ]);

        $waiver = FeeWaiver::create($validated);

        logActivity('create', "Created fee waiver for student", FeeWaiver::class, $waiver->id);

        return redirect()->route('fee-waivers.index')
            ->with('success', 'Fee waiver created successfully');
    }

    public function edit(FeeWaiver $feeWaiver)
    {
        $this->authorize('manage_fees');

        $feeWaiver->load(['student.user', 'student.schoolClass']);

        return Inertia::render('Fees/Waivers/Edit', [
            'waiver' => $feeWaiver,
            'students' => Student::with(['user', 'schoolClass'])->where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, FeeWaiver $feeWaiver)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'waiver_type' => 'required|in:percentage,fixed',
            'waiver_amount' => 'required|numeric|min:0',
            'reason' => 'required|string',
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after_or_equal:valid_from',
            'status' => 'required|in:active,expired,cancelled',
        ]);

        $feeWaiver->update($validated);

        logActivity('update', "Updated fee waiver", FeeWaiver::class, $feeWaiver->id);

        return redirect()->route('fee-waivers.index')
            ->with('success', 'Fee waiver updated successfully');
    }

    public function destroy(FeeWaiver $feeWaiver)
    {
        $this->authorize('manage_fees');

        $feeWaiver->delete();

        logActivity('delete', "Deleted fee waiver", FeeWaiver::class, $feeWaiver->id);

        return redirect()->route('fee-waivers.index')
            ->with('success', 'Fee waiver deleted successfully');
    }
}
