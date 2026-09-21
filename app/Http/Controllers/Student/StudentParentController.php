<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentParentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_students');

        $parents = StudentParent::with(['user', 'students.user'])
            ->when($request->search, fn($q) =>
                $q->whereHas('user', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Students/Parents/Index', [
            'parents' => $parents,
            'students' => Student::with('user')->where('status', 'active')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $this->authorize('create_students');

        return Inertia::render('Students/Parents/Create', [
            'students' => Student::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_students');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'father_name' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'father_occupation' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:20',
            'mother_occupation' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_relation' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
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

            $user->assignRole('Parent');

            $parent = StudentParent::create([
                'user_id' => $user->id,
                'student_id' => $validated['student_ids'][0] ?? null,
                'father_name' => $validated['father_name'],
                'father_phone' => $validated['father_phone'],
                'father_occupation' => $validated['father_occupation'],
                'mother_name' => $validated['mother_name'],
                'mother_phone' => $validated['mother_phone'],
                'mother_occupation' => $validated['mother_occupation'],
                'guardian_name' => $validated['guardian_name'],
                'guardian_phone' => $validated['guardian_phone'],
                'guardian_relation' => $validated['guardian_relation'],
                'address' => $validated['address'],
            ]);

            $parent->students()->sync($validated['student_ids']);

            DB::commit();

            logActivity('create', "Created parent: {$user->name}", StudentParent::class, $parent->id);

            return redirect()->route('student-parents.index')
                ->with('success', 'Parent created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to create parent: ' . $e->getMessage());
        }
    }

    public function show(StudentParent $studentParent)
    {
        $this->authorize('view_students');

        $studentParent->load(['user', 'students.user', 'students.schoolClass', 'students.section']);

        return Inertia::render('Students/Parents/Show', [
            'parent' => $studentParent,
        ]);
    }

    public function edit(StudentParent $studentParent)
    {
        $this->authorize('edit_students');

        $studentParent->load(['user', 'students']);

        return Inertia::render('Students/Parents/Edit', [
            'parent' => $studentParent,
            'students' => Student::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, StudentParent $studentParent)
    {
        $this->authorize('edit_students');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $studentParent->user_id,
            'phone' => 'required|string|max:20',
            'father_name' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'father_occupation' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:20',
            'mother_occupation' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_relation' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        DB::beginTransaction();
        try {
            $studentParent->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            $studentParent->update([
                'father_name' => $validated['father_name'],
                'father_phone' => $validated['father_phone'],
                'father_occupation' => $validated['father_occupation'],
                'mother_name' => $validated['mother_name'],
                'mother_phone' => $validated['mother_phone'],
                'mother_occupation' => $validated['mother_occupation'],
                'guardian_name' => $validated['guardian_name'],
                'guardian_phone' => $validated['guardian_phone'],
                'guardian_relation' => $validated['guardian_relation'],
                'address' => $validated['address'],
            ]);

            $studentParent->students()->sync($validated['student_ids']);

            DB::commit();

            logActivity('update', "Updated parent: {$studentParent->user->name}", StudentParent::class, $studentParent->id);

            return redirect()->route('student-parents.index')
                ->with('success', 'Parent updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to update parent: ' . $e->getMessage());
        }
    }

    public function destroy(StudentParent $studentParent)
    {
        $this->authorize('delete_students');

        DB::beginTransaction();
        try {
            $parentName = $studentParent->user->name;
            $userId = $studentParent->user_id;

            $studentParent->delete();
            User::find($userId)?->delete();

            DB::commit();

            logActivity('delete', "Deleted parent: {$parentName}", StudentParent::class, $studentParent->id);

            return redirect()->route('student-parents.index')
                ->with('success', 'Parent deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete parent: ' . $e->getMessage());
        }
    }
}
