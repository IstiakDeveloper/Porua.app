<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_teachers');

        $teachers = Teacher::with('user')
            ->withCount('teacherSubjects as subjects_count')
            ->when($request->search, fn($q) =>
                $q->whereHas('user', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%"))
                ->orWhere('employee_id', 'like', "%{$request->search}%"))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('joining_date')
            ->paginate(20)->withQueryString();

        // Transform data to include needed fields
        $teachers->getCollection()->transform(function ($teacher) {
            return [
                'id' => $teacher->id,
                'employee_id' => $teacher->employee_id,
                'first_name' => $teacher->first_name,
                'last_name' => $teacher->last_name,
                'full_name' => $teacher->full_name,
                'email' => $teacher->email ?? ($teacher->user ? $teacher->user->email : null),
                'phone' => $teacher->phone,
                'qualification' => $teacher->qualification,
                'experience_years' => $teacher->experience_years,
                'joining_date' => $teacher->joining_date ? $teacher->joining_date->format('Y-m-d') : null,
                'salary' => $teacher->salary,
                'status' => $teacher->status,
                'photo' => $teacher->photo,
                'subjects_count' => $teacher->subjects_count ?? 0,
                'user' => $teacher->user ? [
                    'name' => $teacher->user->name,
                    'email' => $teacher->user->email,
                ] : null,
            ];
        });

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'status']),
            'canToggleStatus' => $request->user()->can('edit_teachers'),
        ]);
    }

    public function create()
    {
        $this->authorize('create_teachers');

        return Inertia::render('Teachers/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create_teachers');

        $validated = $request->validate([
            'employee_id' => 'required|string|unique:teachers',
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
            'designation' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'qualification' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'salary' => 'nullable|numeric|min:0',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048',
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

            $user->assignRole('Teacher');

            // Extract first name and last name from full name
            $nameParts = explode(' ', $validated['name'], 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';

            // Handle photo upload
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('teachers/photos', 'public');
            }

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'employee_id' => $validated['employee_id'],
                'first_name' => $firstName,
                'last_name' => $lastName,
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'joining_date' => $validated['joining_date'],
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'nationality' => $validated['nationality'] ?? null,
                'designation' => $validated['designation'],
                'department' => $validated['department'] ?? null,
                'qualification' => $validated['qualification'] ?? null,
                'experience_years' => $validated['experience_years'] ?? null,
                'salary' => $validated['salary'] ?? null,
                'present_address' => $validated['present_address'] ?? null,
                'permanent_address' => $validated['permanent_address'] ?? null,
                'photo' => $photoPath,
                'status' => $validated['status'],
            ]);

            // Note: Subjects should be assigned separately via Teacher Subjects with class information
            // Use the teacher-subjects route to assign subjects with classes

            DB::commit();

            logActivity('create', "Created teacher: {$user->name}", Teacher::class, $teacher->id);

            return redirect()->route('teachers.index')
                ->with('success', 'Teacher created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to create teacher: ' . $e->getMessage());
        }
    }

    public function show(Teacher $teacher)
    {
        $this->authorize('view_teachers');

        $teacher->load([
            'user',
            'teacherSubjects.subject',
            'teacherSubjects.schoolClass',
            'attendance' => fn($q) => $q->latest()->limit(30),
            'salaries' => fn($q) => $q->latest()->limit(12),
        ]);

        return Inertia::render('Teachers/Show', [
            'teacher' => $teacher,
        ]);
    }

    public function printProfile(Teacher $teacher)
    {
        $this->authorize('view_teachers');

        $teacher->load([
            'user',
            'teacherSubjects.subject',
            'teacherSubjects.schoolClasses',
        ]);

        // Format the teacher data
        $teacherData = $teacher->toArray();
        $teacherData['full_name'] = $teacher->full_name;
        $teacherData['email'] = $teacher->email ?? ($teacher->user ? $teacher->user->email : null);
        $teacherData['phone'] = $teacher->phone;
        $teacherData['subjects_count'] = $teacher->teacherSubjects->count();

        // Format teacher subjects with classes
        $teacherData['teacher_subjects'] = $teacher->teacherSubjects->map(function ($ts) {
            return [
                'id' => $ts->id,
                'subject' => [
                    'id' => $ts->subject->id,
                    'name' => $ts->subject->name,
                    'code' => $ts->subject->code,
                ],
                'classes' => $ts->schoolClasses->map(function ($class) {
                    return [
                        'id' => $class->id,
                        'name' => $class->name,
                        'name_bengali' => $class->name_bengali,
                    ];
                })->toArray(),
            ];
        })->toArray();

        return Inertia::render('Teachers/TeacherPrintProfile', [
            'teacher' => $teacherData,
        ]);
    }

    public function printIdCard(Teacher $teacher)
    {
        $this->authorize('view_teachers');

        $teacher->load('user');

        // Format the teacher data
        $teacherData = [
            'id' => $teacher->id,
            'employee_id' => $teacher->employee_id,
            'full_name' => $teacher->full_name,
            'email' => $teacher->email ?? ($teacher->user ? $teacher->user->email : null),
            'phone' => $teacher->phone,
            'date_of_birth' => $teacher->date_of_birth ? $teacher->date_of_birth->format('Y-m-d') : null,
            'gender' => $teacher->gender,
            'blood_group' => $teacher->blood_group,
            'designation' => $teacher->designation,
            'department' => $teacher->department,
            'joining_date' => $teacher->joining_date ? $teacher->joining_date->format('Y-m-d') : null,
            'status' => $teacher->status,
            'photo' => $teacher->photo,
        ];

        return Inertia::render('Teachers/TeacherPrintIDCard', [
            'teacher' => $teacherData,
        ]);
    }

    public function edit(Teacher $teacher)
    {
        $this->authorize('edit_teachers');

        $teacher->load(['user', 'subjects']);

        // Format dates for input fields
        $teacherData = $teacher->toArray();
        if ($teacher->date_of_birth) {
            $teacherData['date_of_birth'] = $teacher->date_of_birth->format('Y-m-d');
        }
        if ($teacher->joining_date) {
            $teacherData['joining_date'] = $teacher->joining_date->format('Y-m-d');
        }
        if ($teacher->leaving_date) {
            $teacherData['leaving_date'] = $teacher->leaving_date->format('Y-m-d');
        }

        return Inertia::render('Teachers/Edit', [
            'teacher' => $teacherData,
        ]);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $this->authorize('edit_teachers');

        $validated = $request->validate([
            'employee_id' => 'required|string|unique:teachers,employee_id,' . $teacher->id,
            'joining_date' => 'required|date',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->user_id,
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'designation' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'qualification' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'salary' => 'nullable|numeric|min:0',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048',
            'status' => 'required|in:active,inactive,resigned,retired',
        ]);

        DB::beginTransaction();
        try {
            $teacher->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            // Extract first name and last name from full name
            $nameParts = explode(' ', $validated['name'], 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';

            // Handle photo upload
            $photoPath = $teacher->photo; // Keep existing photo
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($teacher->photo && Storage::disk('public')->exists($teacher->photo)) {
                    Storage::disk('public')->delete($teacher->photo);
                }
                $photoPath = $request->file('photo')->store('teachers/photos', 'public');
            }

            $teacher->update([
                'employee_id' => $validated['employee_id'],
                'first_name' => $firstName,
                'last_name' => $lastName,
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'joining_date' => $validated['joining_date'],
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'nationality' => $validated['nationality'] ?? null,
                'designation' => $validated['designation'],
                'department' => $validated['department'] ?? null,
                'qualification' => $validated['qualification'] ?? null,
                'experience_years' => $validated['experience_years'] ?? null,
                'salary' => $validated['salary'] ?? null,
                'present_address' => $validated['present_address'] ?? null,
                'permanent_address' => $validated['permanent_address'] ?? null,
                'photo' => $photoPath,
                'status' => $validated['status'],
            ]);

            // Note: Subjects should be assigned separately via Teacher Subjects with class information
            // Use the teacher-subjects route to assign subjects with classes

            DB::commit();

            logActivity('update', "Updated teacher: {$teacher->user->name}", Teacher::class, $teacher->id);

            return redirect()->route('teachers.index')
                ->with('success', 'Teacher updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to update teacher: ' . $e->getMessage());
        }
    }

    public function toggleStatus(Teacher $teacher)
    {
        $this->authorize('edit_teachers');

        $toggleableStatuses = ['active', 'inactive'];

        if (! in_array($teacher->status, $toggleableStatuses, true)) {
            return back()->with('error', 'Only active or inactive teachers can be toggled from this page.');
        }

        $newStatus = $teacher->status === 'active' ? 'inactive' : 'active';

        $teacher->update(['status' => $newStatus]);

        if ($teacher->user) {
            $teacher->user->update([
                'status' => $newStatus === 'active' ? 'active' : 'inactive',
            ]);
        }

        $label = $newStatus === 'active' ? 'activated' : 'deactivated';
        logActivity('update', "Teacher {$teacher->full_name} {$label}", Teacher::class, $teacher->id);

        return back()->with('success', 'Teacher status updated successfully.');
    }

    public function destroy(Teacher $teacher)
    {
        $this->authorize('delete_teachers');

        DB::beginTransaction();
        try {
            $teacherName = $teacher->user->name;
            $userId = $teacher->user_id;

            $teacher->delete();
            User::find($userId)?->delete();

            DB::commit();

            logActivity('delete', "Deleted teacher: {$teacherName}", Teacher::class, $teacher->id);

            return redirect()->route('teachers.index')
                ->with('success', 'Teacher deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete teacher: ' . $e->getMessage());
        }
    }
}
