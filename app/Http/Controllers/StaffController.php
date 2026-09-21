<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_staff');

        $staff = Staff::with('user')
            ->when($request->search, fn($q) =>
                $q->whereHas('user', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%"))
                ->orWhere('employee_id', 'like', "%{$request->search}%"))
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('joining_date')
            ->paginate(20)->withQueryString();

        return Inertia::render('Staff/Index', [
            'staff' => $staff,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function create()
    {
        $this->authorize('create_staff');

        return Inertia::render('Staff/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create_staff');

        $validated = $request->validate([
            'employee_id' => 'required|string|unique:staff',
            'joining_date' => 'required|date',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'role' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'designation' => 'required|string|max:255',
            'qualification' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'photo' => 'nullable|string',
            'status' => 'required|in:active,inactive,resigned,retired',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'status' => 'active',
            ]);

            // Assign role based on staff role
            $roleMap = [
                'Principal' => 'Principal',
                'Accountant' => 'Accountant',
                'Librarian' => 'Librarian',
            ];
            $user->assignRole($roleMap[$validated['role']] ?? 'Staff');

            $staff = Staff::create([
                'user_id' => $user->id,
                'employee_id' => $validated['employee_id'],
                'joining_date' => $validated['joining_date'],
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'],
                'religion' => $validated['religion'],
                'nationality' => $validated['nationality'],
                'role' => $validated['role'],
                'department' => $validated['department'],
                'designation' => $validated['designation'],
                'qualification' => $validated['qualification'],
                'experience_years' => $validated['experience_years'],
                'present_address' => $validated['present_address'],
                'permanent_address' => $validated['permanent_address'],
                'photo' => $validated['photo'],
                'status' => $validated['status'],
            ]);

            DB::commit();

            logActivity('create', "Created staff: {$user->name}", Staff::class, $staff->id);

            return redirect()->route('staff.index')
                ->with('success', 'Staff created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to create staff: ' . $e->getMessage());
        }
    }

    public function show(Staff $staff)
    {
        $this->authorize('view_staff');

        $staff->load([
            'user',
            'salaries' => fn($q) => $q->latest()->limit(12),
        ]);

        return Inertia::render('Staff/Show', [
            'staff' => $staff,
        ]);
    }

    public function edit(Staff $staff)
    {
        $this->authorize('edit_staff');

        $staff->load('user');

        return Inertia::render('Staff/Edit', [
            'staff' => $staff,
        ]);
    }

    public function update(Request $request, Staff $staff)
    {
        $this->authorize('edit_staff');

        $validated = $request->validate([
            'employee_id' => 'required|string|unique:staff,employee_id,' . $staff->id,
            'joining_date' => 'required|date',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->user_id,
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'role' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'designation' => 'required|string|max:255',
            'qualification' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'photo' => 'nullable|string',
            'status' => 'required|in:active,inactive,resigned,retired',
        ]);

        DB::beginTransaction();
        try {
            $staff->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            $staff->update([
                'employee_id' => $validated['employee_id'],
                'joining_date' => $validated['joining_date'],
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'],
                'religion' => $validated['religion'],
                'nationality' => $validated['nationality'],
                'role' => $validated['role'],
                'department' => $validated['department'],
                'designation' => $validated['designation'],
                'qualification' => $validated['qualification'],
                'experience_years' => $validated['experience_years'],
                'present_address' => $validated['present_address'],
                'permanent_address' => $validated['permanent_address'],
                'photo' => $validated['photo'],
                'status' => $validated['status'],
            ]);

            DB::commit();

            logActivity('update', "Updated staff: {$staff->user->name}", Staff::class, $staff->id);

            return redirect()->route('staff.index')
                ->with('success', 'Staff updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to update staff: ' . $e->getMessage());
        }
    }

    public function destroy(Staff $staff)
    {
        $this->authorize('delete_staff');

        DB::beginTransaction();
        try {
            $staffName = $staff->user->name;
            $userId = $staff->user_id;

            $staff->delete();
            User::find($userId)?->delete();

            DB::commit();

            logActivity('delete', "Deleted staff: {$staffName}", Staff::class, $staff->id);

            return redirect()->route('staff.index')
                ->with('success', 'Staff deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete staff: ' . $e->getMessage());
        }
    }
}
