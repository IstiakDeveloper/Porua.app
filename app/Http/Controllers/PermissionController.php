<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        $this->authorize('view_users');

        $permissions = Permission::all();

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_users');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
            'slug' => 'required|string|max:255|unique:permissions',
            'module' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $permission = Permission::create($validated);

        logActivity('create', "Created permission: {$permission->name}", Permission::class, $permission->id);

        return back()->with('success', 'Permission created successfully');
    }

    public function update(Request $request, Permission $permission)
    {
        $this->authorize('edit_users');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'slug' => 'required|string|max:255|unique:permissions,slug,' . $permission->id,
            'module' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $permission->update($validated);

        logActivity('update', "Updated permission: {$permission->name}", Permission::class, $permission->id);

        return back()->with('success', 'Permission updated successfully');
    }

    public function destroy(Permission $permission)
    {
        $this->authorize('delete_users');

        if ($permission->roles()->count() > 0) {
            return back()->with('error', 'Cannot delete permission assigned to roles');
        }

        $permissionName = $permission->name;
        $permission->delete();

        logActivity('delete', "Deleted permission: {$permissionName}", Permission::class, $permission->id);

        return back()->with('success', 'Permission deleted successfully');
    }

    public function sync()
    {
        $this->authorize('create_users');

        // Define all system permissions
        $permissions = [
            // Users & Roles
            ['name' => 'View Users', 'slug' => 'view_users', 'module' => 'User Management'],
            ['name' => 'Create Users', 'slug' => 'create_users', 'module' => 'User Management'],
            ['name' => 'Edit Users', 'slug' => 'edit_users', 'module' => 'User Management'],
            ['name' => 'Delete Users', 'slug' => 'delete_users', 'module' => 'User Management'],

            // Students
            ['name' => 'View Students', 'slug' => 'view_students', 'module' => 'Student Management'],
            ['name' => 'Create Students', 'slug' => 'create_students', 'module' => 'Student Management'],
            ['name' => 'Edit Students', 'slug' => 'edit_students', 'module' => 'Student Management'],
            ['name' => 'Delete Students', 'slug' => 'delete_students', 'module' => 'Student Management'],

            // Teachers
            ['name' => 'View Teachers', 'slug' => 'view_teachers', 'module' => 'Teacher Management'],
            ['name' => 'Create Teachers', 'slug' => 'create_teachers', 'module' => 'Teacher Management'],
            ['name' => 'Edit Teachers', 'slug' => 'edit_teachers', 'module' => 'Teacher Management'],
            ['name' => 'Delete Teachers', 'slug' => 'delete_teachers', 'module' => 'Teacher Management'],

            // Staff
            ['name' => 'View Staff', 'slug' => 'view_staff', 'module' => 'Staff Management'],
            ['name' => 'Create Staff', 'slug' => 'create_staff', 'module' => 'Staff Management'],
            ['name' => 'Edit Staff', 'slug' => 'edit_staff', 'module' => 'Staff Management'],
            ['name' => 'Delete Staff', 'slug' => 'delete_staff', 'module' => 'Staff Management'],

            // Classes & Subjects
            ['name' => 'View Classes', 'slug' => 'view_classes', 'module' => 'Academic'],
            ['name' => 'Create Classes', 'slug' => 'create_classes', 'module' => 'Academic'],
            ['name' => 'Edit Classes', 'slug' => 'edit_classes', 'module' => 'Academic'],
            ['name' => 'Delete Classes', 'slug' => 'delete_classes', 'module' => 'Academic'],
            ['name' => 'View Subjects', 'slug' => 'view_subjects', 'module' => 'Academic'],
            ['name' => 'Create Subjects', 'slug' => 'create_subjects', 'module' => 'Academic'],
            ['name' => 'Edit Subjects', 'slug' => 'edit_subjects', 'module' => 'Academic'],
            ['name' => 'Delete Subjects', 'slug' => 'delete_subjects', 'module' => 'Academic'],

            // Attendance
            ['name' => 'View Attendance', 'slug' => 'view_attendance', 'module' => 'Attendance'],
            ['name' => 'Mark Attendance', 'slug' => 'mark_attendance', 'module' => 'Attendance'],

            // Exams
            ['name' => 'Manage Exams', 'slug' => 'manage_exams', 'module' => 'Examination'],
            ['name' => 'View Results', 'slug' => 'view_results', 'module' => 'Examination'],

            // Fees
            ['name' => 'Manage Fees', 'slug' => 'manage_fees', 'module' => 'Fee Management'],
            ['name' => 'Collect Fees', 'slug' => 'collect_fees', 'module' => 'Fee Management'],

            // Library
            ['name' => 'Manage Library', 'slug' => 'manage_library', 'module' => 'Library'],

            // Communication
            ['name' => 'Manage Notices', 'slug' => 'manage_notices', 'module' => 'Communication'],
            ['name' => 'Send Messages', 'slug' => 'send_messages', 'module' => 'Communication'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        logActivity('create', "Synced system permissions", Permission::class);

        return back()->with('success', 'Permissions synced successfully');
    }
}
