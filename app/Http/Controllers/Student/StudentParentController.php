<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
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
            ->when($request->search, fn ($q) => $q->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Students/Parents/Index', [
            'parents' => $parents,
            'students' => Student::with('user')->where('status', 'active')->get(),
            'classes' => SchoolClass::with('sections')->where('status', 'active')->orderBy('numeric_value')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $this->authorize('create_students');

        return Inertia::render('Students/Parents/Create', [
            'students' => Student::with('user')->where('status', 'active')->get(),
            'classes' => SchoolClass::with('sections')->where('status', 'active')->orderBy('numeric_value')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_students');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:4|confirmed',
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
                'username' => $validated['username'] ?? null,
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

            return back()->withInput()->with('error', 'Failed to create parent: '.$e->getMessage());
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
            'email' => 'required|email|unique:users,email,'.$studentParent->user_id,
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

            return back()->withInput()->with('error', 'Failed to update parent: '.$e->getMessage());
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

            return back()->with('error', 'Failed to delete parent: '.$e->getMessage());
        }
    }

    /**
     * Live search students with their father, mother, and guardian details.
     */
    public function searchGuardians(Request $request)
    {
        $this->authorize('view_students');

        $query = $request->input('q');
        $classId = $request->input('class_id');
        $sectionId = $request->input('section_id');

        $students = Student::with(['schoolClass', 'section', 'parent.user'])
            ->where('status', 'active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%")
                        ->orWhere('admission_number', 'like', "%{$query}%")
                        ->orWhere('student_id', 'like', "%{$query}%")
                        ->orWhere('roll_number', 'like', "%{$query}%")
                        ->orWhere('father_name', 'like', "%{$query}%")
                        ->orWhere('father_phone', 'like', "%{$query}%")
                        ->orWhere('mother_name', 'like', "%{$query}%")
                        ->orWhere('mother_phone', 'like', "%{$query}%");
                });
            })
            ->take(30)
            ->get();

        return response()->json([
            'students' => $students->map(function ($s) {
                return [
                    'id' => $s->id,
                    'full_name' => $s->full_name,
                    'roll_number' => $s->roll_number,
                    'admission_number' => $s->admission_number,
                    'class_name' => $s->schoolClass?->name ?? 'N/A',
                    'section_name' => $s->section?->name ?? 'N/A',
                    'photo' => $s->photo,
                    'parent_id' => $s->parent_id,
                    'has_parent' => (bool) $s->parent_id,
                    'existing_parent_name' => $s->parent?->user?->name,
                    'existing_parent_phone' => $s->parent?->user?->phone,
                    'existing_parent_username' => $s->parent?->user?->username,
                    'father' => [
                        'name' => $s->father_name ?? $s->father_name_en,
                        'phone' => $s->father_phone ?? $s->father_mobile,
                        'occupation' => $s->father_occupation,
                    ],
                    'mother' => [
                        'name' => $s->mother_name ?? $s->mother_name_en,
                        'phone' => $s->mother_phone ?? $s->mother_mobile,
                        'occupation' => $s->mother_occupation,
                    ],
                    'guardian' => [
                        'name' => $s->guardian_name,
                        'phone' => $s->guardian_phone,
                        'relation' => $s->guardian_relation ?? 'guardian',
                    ],
                ];
            }),
        ]);
    }

    /**
     * Check if a parent user already exists by phone number or username.
     */
    public function checkDuplicate(Request $request)
    {
        $this->authorize('view_students');

        $phone = trim((string) $request->input('phone'));
        $username = trim((string) $request->input('username'));

        if (! $phone && ! $username) {
            return response()->json(['found' => false]);
        }

        $existingUser = User::whereHas('roles', fn ($q) => $q->where('name', 'Parent'))
            ->where(function ($q) use ($phone, $username) {
                if ($phone) {
                    $q->where('phone', $phone);
                }
                if ($username) {
                    $q->orWhere('username', $username);
                }
            })
            ->with(['studentParent.students.schoolClass', 'studentParent.students.section'])
            ->first();

        if ($existingUser && $existingUser->studentParent) {
            $parent = $existingUser->studentParent;

            return response()->json([
                'found' => true,
                'parent' => [
                    'id' => $parent->id,
                    'user_id' => $existingUser->id,
                    'name' => $existingUser->name,
                    'phone' => $existingUser->phone,
                    'username' => $existingUser->username,
                    'email' => $existingUser->email,
                    'linked_children' => $parent->students->map(fn ($c) => [
                        'id' => $c->id,
                        'full_name' => $c->full_name,
                        'roll_number' => $c->roll_number,
                        'class_name' => $c->schoolClass?->name,
                        'section_name' => $c->section?->name,
                    ]),
                ],
            ]);
        }

        return response()->json(['found' => false]);
    }

    /**
     * 1-Click Smart Quick Assign.
     */
    public function quickAssign(Request $request)
    {
        $this->authorize('create_students');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'persona' => 'required|string|in:father,mother,guardian,custom',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'username' => 'nullable|string|max:50',
            'email' => 'nullable|string|max:255',
            'password' => 'required|string|min:4',
            'link_existing_parent_id' => 'nullable|exists:student_parents,id',
            'sibling_student_ids' => 'nullable|array',
            'sibling_student_ids.*' => 'exists:students,id',
        ]);

        $student = Student::with(['schoolClass', 'section'])->findOrFail($validated['student_id']);
        $siblingIds = $validated['sibling_student_ids'] ?? [];
        $allStudentIds = array_unique(array_merge([$student->id], $siblingIds));

        DB::beginTransaction();
        try {
            // Case A: Link to existing parent account
            if (! empty($validated['link_existing_parent_id'])) {
                $parent = StudentParent::with('user')->findOrFail($validated['link_existing_parent_id']);

                Student::whereIn('id', $allStudentIds)->update(['parent_id' => $parent->id]);
                $parent->students()->syncWithoutDetaching($allStudentIds);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "Student(s) successfully linked to existing parent {$parent->user->name}.",
                    'credentials' => [
                        'student_name' => $student->full_name,
                        'class_name' => $student->schoolClass?->name,
                        'roll_number' => $student->roll_number,
                        'parent_name' => $parent->user->name,
                        'relation' => ucfirst($validated['persona']),
                        'username' => $parent->user->username ?? $parent->user->phone ?? $parent->user->email,
                        'email' => $parent->user->email,
                        'password' => '(Existing Password)',
                        'login_url' => url('/login'),
                        'linked_students_count' => count($allStudentIds),
                    ],
                ]);
            }

            // Case B: Create fresh parent account
            $phone = trim($validated['phone'] ?? '');

            // Auto-generate username if omitted
            $username = trim($validated['username'] ?? '');
            if (! $username) {
                $username = ! empty($phone) ? $phone : ('p_'.($student->admission_number ?? $student->roll_number ?? $student->id));
            }

            // Ensure username uniqueness
            $baseUsername = $username;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.'_'.$counter++;
            }

            // Auto-generate email if omitted
            $email = trim($validated['email'] ?? '');
            if (! $email) {
                $email = $username.'@porua.app';
            }
            // Ensure email uniqueness
            $baseEmail = $email;
            $counter = 1;
            while (User::where('email', $email)->exists()) {
                $parts = explode('@', $baseEmail);
                $email = $parts[0].'_'.$counter++.'@'.($parts[1] ?? 'porua.app');
            }

            $user = User::create([
                'name' => $validated['name'],
                'username' => $username,
                'email' => $email,
                'phone' => $phone ?: null,
                'password' => Hash::make($validated['password']),
                'status' => 'active',
            ]);
            $user->assignRole('Parent');

            $parent = StudentParent::create([
                'user_id' => $user->id,
                'student_id' => $student->id,
                'father_name' => $validated['persona'] === 'father' ? $validated['name'] : ($student->father_name ?? null),
                'father_phone' => $validated['persona'] === 'father' ? $phone : ($student->father_phone ?? null),
                'mother_name' => $validated['persona'] === 'mother' ? $validated['name'] : ($student->mother_name ?? null),
                'mother_phone' => $validated['persona'] === 'mother' ? $phone : ($student->mother_phone ?? null),
                'guardian_name' => $validated['persona'] === 'guardian' ? $validated['name'] : ($student->guardian_name ?? null),
                'guardian_phone' => $validated['persona'] === 'guardian' ? $phone : ($student->guardian_phone ?? null),
                'relation' => in_array($validated['persona'], ['father', 'mother', 'guardian']) ? $validated['persona'] : 'guardian',
                'status' => 'active',
            ]);

            Student::whereIn('id', $allStudentIds)->update(['parent_id' => $parent->id]);
            $parent->students()->syncWithoutDetaching($allStudentIds);

            DB::commit();

            logActivity('create', "Quick assigned parent: {$user->name} to student: {$student->full_name}", StudentParent::class, $parent->id);

            return response()->json([
                'success' => true,
                'message' => 'Parent account successfully created and linked.',
                'credentials' => [
                    'student_name' => $student->full_name,
                    'class_name' => $student->schoolClass?->name,
                    'roll_number' => $student->roll_number,
                    'parent_name' => $user->name,
                    'relation' => ucfirst($validated['persona']),
                    'username' => $username,
                    'phone' => $phone,
                    'email' => $email,
                    'password' => $validated['password'],
                    'login_url' => url('/login'),
                    'linked_students_count' => count($allStudentIds),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to assign parent: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Bulk Auto-Parent Account Generator.
     */
    public function bulkGenerate(Request $request)
    {
        $this->authorize('create_students');

        $validated = $request->validate([
            'class_id' => 'nullable|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'persona_priority' => 'nullable|string|in:father_first,mother_first,guardian_first',
            'default_password' => 'nullable|string|min:4',
            'only_unassigned' => 'nullable|boolean',
        ]);

        $defaultPassword = $validated['default_password'] ?? '1234';
        $onlyUnassigned = $request->boolean('only_unassigned', true);
        $priority = $validated['persona_priority'] ?? 'father_first';

        $query = Student::with(['schoolClass', 'section'])
            ->where('status', 'active')
            ->when($validated['class_id'] ?? null, fn ($q, $id) => $q->where('class_id', $id))
            ->when($validated['section_id'] ?? null, fn ($q, $id) => $q->where('section_id', $id))
            ->when($validated['academic_year_id'] ?? null, fn ($q, $id) => $q->where('academic_year_id', $id))
            ->when($onlyUnassigned, fn ($q) => $q->whereNull('parent_id'));

        $students = $query->get();

        if ($students->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching students found for bulk generation.',
                'stats' => [
                    'total_students' => 0,
                    'created' => 0,
                    'merged_siblings' => 0,
                ],
            ]);
        }

        $createdCount = 0;
        $mergedSiblings = 0;
        $generatedCredentials = [];

        DB::beginTransaction();
        try {
            foreach ($students as $student) {
                // Determine persona according to priority
                $guardianName = null;
                $guardianPhone = null;
                $relation = 'father';

                if ($priority === 'mother_first') {
                    if (! empty($student->mother_name)) {
                        $guardianName = $student->mother_name;
                        $guardianPhone = $student->mother_phone ?? $student->mother_mobile;
                        $relation = 'mother';
                    } elseif (! empty($student->father_name)) {
                        $guardianName = $student->father_name;
                        $guardianPhone = $student->father_phone ?? $student->father_mobile;
                        $relation = 'father';
                    }
                } else {
                    if (! empty($student->father_name)) {
                        $guardianName = $student->father_name;
                        $guardianPhone = $student->father_phone ?? $student->father_mobile;
                        $relation = 'father';
                    } elseif (! empty($student->mother_name)) {
                        $guardianName = $student->mother_name;
                        $guardianPhone = $student->mother_phone ?? $student->mother_mobile;
                        $relation = 'mother';
                    }
                }

                // Fallback to legal guardian or student fallback
                if (! $guardianName) {
                    $guardianName = $student->guardian_name ?? ('Guardian of '.$student->full_name);
                    $guardianPhone = $student->guardian_phone;
                    $relation = $student->guardian_relation ?? 'guardian';
                }

                $phone = trim($guardianPhone ?? '');

                // 1. Check if a parent already exists with this phone
                $existingParent = null;
                if (! empty($phone)) {
                    $existingParent = StudentParent::whereHas('user', fn ($q) => $q->where('phone', $phone))->first();
                }

                if ($existingParent) {
                    $student->update(['parent_id' => $existingParent->id]);
                    $existingParent->students()->syncWithoutDetaching([$student->id]);
                    $mergedSiblings++;

                    $generatedCredentials[] = [
                        'student_name' => $student->full_name,
                        'class_name' => $student->schoolClass?->name ?? 'N/A',
                        'roll_number' => $student->roll_number ?? 'N/A',
                        'parent_name' => $existingParent->user?->name ?? $guardianName,
                        'relation' => ucfirst($relation),
                        'username' => $existingParent->user?->username ?? $phone,
                        'password' => '(Existing Password)',
                        'note' => 'Sibling Auto-Merged',
                    ];

                    continue;
                }

                // 2. Generate new unique username & email
                $username = ! empty($phone) ? $phone : ('p_'.($student->admission_number ?? $student->roll_number ?? $student->id));
                $baseUsername = $username;
                $c = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername.'_'.$c++;
                }

                $email = $username.'@porua.app';
                $baseEmail = $email;
                $c = 1;
                while (User::where('email', $email)->exists()) {
                    $email = $username.'_'.$c++.'@porua.app';
                }

                // 3. Create User & Parent
                $user = User::create([
                    'name' => $guardianName,
                    'username' => $username,
                    'email' => $email,
                    'phone' => $phone ?: null,
                    'password' => Hash::make($defaultPassword),
                    'status' => 'active',
                ]);
                $user->assignRole('Parent');

                $parent = StudentParent::create([
                    'user_id' => $user->id,
                    'student_id' => $student->id,
                    'father_name' => $relation === 'father' ? $guardianName : $student->father_name,
                    'father_phone' => $relation === 'father' ? $phone : $student->father_phone,
                    'mother_name' => $relation === 'mother' ? $guardianName : $student->mother_name,
                    'mother_phone' => $relation === 'mother' ? $phone : $student->mother_phone,
                    'guardian_name' => $relation === 'guardian' ? $guardianName : $student->guardian_name,
                    'guardian_phone' => $relation === 'guardian' ? $phone : $student->guardian_phone,
                    'relation' => $relation,
                    'status' => 'active',
                ]);

                $student->update(['parent_id' => $parent->id]);
                $parent->students()->syncWithoutDetaching([$student->id]);
                $createdCount++;

                $generatedCredentials[] = [
                    'student_name' => $student->full_name,
                    'class_name' => $student->schoolClass?->name ?? 'N/A',
                    'roll_number' => $student->roll_number ?? 'N/A',
                    'parent_name' => $guardianName,
                    'relation' => ucfirst($relation),
                    'username' => $username,
                    'password' => $defaultPassword,
                    'note' => 'New Account Created',
                ];
            }

            DB::commit();

            logActivity('create', "Bulk generated {$createdCount} parent accounts and merged {$mergedSiblings} siblings.", StudentParent::class);

            return response()->json([
                'success' => true,
                'message' => "Successfully created {$createdCount} parent accounts and merged {$mergedSiblings} siblings.",
                'stats' => [
                    'total_students' => $students->count(),
                    'created' => $createdCount,
                    'merged_siblings' => $mergedSiblings,
                ],
                'credentials' => $generatedCredentials,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Bulk generation failed: '.$e->getMessage(),
            ], 422);
        }
    }
}
