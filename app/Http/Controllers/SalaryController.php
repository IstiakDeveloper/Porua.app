<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Salary;
use App\Models\Teacher;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        $salaries = Salary::with(['employee'])
            ->when($request->employee_type, fn($q) => $q->where('employee_type', $request->employee_type))
            ->when($request->month, fn($q) => $q->where('month', $request->month))
            ->when($request->year, fn($q) => $q->where('year', $request->year))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('payment_date')
            ->paginate(20)->withQueryString();

        return Inertia::render('Salaries/Index', [
            'salaries' => $salaries,
            'filters' => $request->only(['employee_type', 'month', 'year', 'status']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_fees');

        return Inertia::render('Salaries/Create', [
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
            'staff' => Staff::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'employee_type' => 'required|in:teacher,staff',
            'employee_id' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'net_salary' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,cheque',
            'remarks' => 'nullable|string',
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        // Check duplicate
        $exists = Salary::where('employee_type', $validated['employee_type'])
            ->where('employee_id', $validated['employee_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->exists();

        if ($exists) {
            return back()->withInput()->with('error', 'Salary already paid for this month');
        }

        $salary = Salary::create($validated);

        logActivity('create', "Created salary payment", Salary::class, $salary->id);

        return redirect()->route('salaries.index')
            ->with('success', 'Salary payment recorded successfully');
    }

    public function show(Salary $salary)
    {
        $this->authorize('manage_fees');

        $salary->load('employee');

        return Inertia::render('Salaries/Show', [
            'salary' => $salary,
        ]);
    }

    public function edit(Salary $salary)
    {
        $this->authorize('manage_fees');

        $salary->load('employee');

        return Inertia::render('Salaries/Edit', [
            'salary' => $salary,
        ]);
    }

    public function update(Request $request, Salary $salary)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'net_salary' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,cheque',
            'remarks' => 'nullable|string',
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        $salary->update($validated);

        logActivity('update', "Updated salary payment", Salary::class, $salary->id);

        return redirect()->route('salaries.index')
            ->with('success', 'Salary payment updated successfully');
    }

    public function destroy(Salary $salary)
    {
        $this->authorize('manage_fees');

        $salary->delete();

        logActivity('delete', "Deleted salary payment", Salary::class, $salary->id);

        return redirect()->route('salaries.index')
            ->with('success', 'Salary payment deleted successfully');
    }
}
