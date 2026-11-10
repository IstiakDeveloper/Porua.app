<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        /**
         * Seed permissions that are actually used by controllers/policies.
         * Keep this list authoritative + idempotent (safe to re-run).
         */
        $permissions = [
            // Users & Roles
            ['slug' => 'view_users', 'module' => 'User Management'],
            ['slug' => 'create_users', 'module' => 'User Management'],
            ['slug' => 'edit_users', 'module' => 'User Management'],
            ['slug' => 'delete_users', 'module' => 'User Management'],

            // Teachers
            ['slug' => 'view_teachers', 'module' => 'Teacher Management'],
            ['slug' => 'create_teachers', 'module' => 'Teacher Management'],
            ['slug' => 'edit_teachers', 'module' => 'Teacher Management'],
            ['slug' => 'delete_teachers', 'module' => 'Teacher Management'],

            // Students
            ['slug' => 'view_students', 'module' => 'Student Management'],
            ['slug' => 'create_students', 'module' => 'Student Management'],
            ['slug' => 'edit_students', 'module' => 'Student Management'],
            ['slug' => 'delete_students', 'module' => 'Student Management'],
            ['slug' => 'promote_students', 'module' => 'Student Management'],

            // Staff
            ['slug' => 'view_staff', 'module' => 'Staff Management'],
            ['slug' => 'create_staff', 'module' => 'Staff Management'],
            ['slug' => 'edit_staff', 'module' => 'Staff Management'],
            ['slug' => 'delete_staff', 'module' => 'Staff Management'],

            // Academic
            ['slug' => 'view_classes', 'module' => 'Academic'],
            ['slug' => 'create_classes', 'module' => 'Academic'],
            ['slug' => 'edit_classes', 'module' => 'Academic'],
            ['slug' => 'delete_classes', 'module' => 'Academic'],
            ['slug' => 'view_subjects', 'module' => 'Academic'],
            ['slug' => 'create_subjects', 'module' => 'Academic'],
            ['slug' => 'edit_subjects', 'module' => 'Academic'],
            ['slug' => 'delete_subjects', 'module' => 'Academic'],

            // Attendance
            ['slug' => 'view_attendance', 'module' => 'Attendance'],
            ['slug' => 'mark_attendance', 'module' => 'Attendance'],
            ['slug' => 'edit_attendance', 'module' => 'Attendance'],

            // Examination
            ['slug' => 'view_results', 'module' => 'Examination'],
            ['slug' => 'view_exams', 'module' => 'Examination'],
            ['slug' => 'create_exams', 'module' => 'Examination'],
            ['slug' => 'edit_exams', 'module' => 'Examination'],
            ['slug' => 'delete_exams', 'module' => 'Examination'],
            ['slug' => 'view_marks', 'module' => 'Examination'],
            ['slug' => 'enter_marks', 'module' => 'Examination'],
            ['slug' => 'edit_marks', 'module' => 'Examination'],
            ['slug' => 'publish_results', 'module' => 'Examination'],
            // App-level consolidated permission used by controllers
            ['slug' => 'manage_exams', 'module' => 'Examination'],

            // Fees
            ['slug' => 'collect_fees', 'module' => 'Fee Management'],
            ['slug' => 'view_fees', 'module' => 'Fee Management'],
            ['slug' => 'create_fee_types', 'module' => 'Fee Management'],
            ['slug' => 'manage_fee_waivers', 'module' => 'Fee Management'],
            // App-level consolidated permission used by controllers
            ['slug' => 'manage_fees', 'module' => 'Fee Management'],

            // Library
            ['slug' => 'view_books', 'module' => 'Library'],
            ['slug' => 'create_books', 'module' => 'Library'],
            ['slug' => 'issue_books', 'module' => 'Library'],
            ['slug' => 'return_books', 'module' => 'Library'],
            // App-level consolidated permission used by controllers
            ['slug' => 'manage_library', 'module' => 'Library'],

            // Communication
            ['slug' => 'send_messages', 'module' => 'Communication'],
            ['slug' => 'view_notices', 'module' => 'Communication'],
            ['slug' => 'create_notices', 'module' => 'Communication'],
            // App-level consolidated permission used by controllers
            ['slug' => 'manage_notices', 'module' => 'Communication'],

            // Accounting
            ['slug' => 'manage_accounting', 'module' => 'Accounting'],

            // Reports
            ['slug' => 'view_reports', 'module' => 'Reports'],
            ['slug' => 'export_reports', 'module' => 'Reports'],

            // Settings / Logs
            ['slug' => 'manage_settings', 'module' => 'Settings'],
            ['slug' => 'view_activity_logs', 'module' => 'Settings'],
        ];

        foreach ($permissions as $permission) {
            $slug = $permission['slug'];
            // `permissions.name` is unique in this project, so key off `name`
            // to avoid duplicates when previous seeders used a different slug format.
            Permission::updateOrCreate(
                ['name' => $slug],
                [
                    'slug' => $slug,
                    'name' => $slug, // UI currently expects machine-style names (e.g. view_users)
                    'module' => $permission['module'],
                ]
            );
        }

        // Create Roles
        $superAdmin = Role::updateOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin']);
        $adminRole = Role::updateOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $principal = Role::updateOrCreate(['slug' => 'principal'], ['name' => 'Principal']);
        $teacher = Role::updateOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $accountant = Role::updateOrCreate(['slug' => 'accountant'], ['name' => 'Accountant']);
        $librarian = Role::updateOrCreate(['slug' => 'librarian'], ['name' => 'Librarian']);
        $studentRole = Role::updateOrCreate(['slug' => 'student'], ['name' => 'Student']);
        $parentRole = Role::updateOrCreate(['slug' => 'parent'], ['name' => 'Parent']);

        // Assign all permissions to Super Admin
        $superAdmin->permissions()->sync(Permission::query()->pluck('id')->toArray());

        // Admin: same breadth as Super Admin except explicit edit/delete capabilities
        $adminPermissionIds = Permission::query()->get()
            ->filter(function ($permission) {
                $normalized = str_replace('-', '_', (string) $permission->slug);

                return ! str_starts_with($normalized, 'edit_') && ! str_starts_with($normalized, 'delete_');
            })
            ->pluck('id');
        $adminRole->permissions()->sync($adminPermissionIds->toArray());

        // Assign permissions to Principal (almost all except user management)
        $principalPermissions = Permission::whereNotIn('name', ['delete_users', 'manage_settings'])
            ->pluck('id');
        $principal->permissions()->sync($principalPermissions->toArray());

        // Assign permissions to Teacher
        $teacherPermissions = Permission::whereIn('name', [
            'view_students', 'view_classes', 'view_attendance', 'mark_attendance',
            'manage_exams', 'view_results',
            'manage_notices', 'send_messages',
        ])->pluck('id');
        $teacher->permissions()->sync($teacherPermissions->toArray());

        // Assign permissions to Accountant
        $accountantPermissions = Permission::whereIn('name', [
            'view_students', 'manage_fees', 'collect_fees', 'manage_accounting',
        ])->pluck('id');
        $accountant->permissions()->sync($accountantPermissions->toArray());

        // Assign permissions to Librarian
        $librarianPermissions = Permission::whereIn('name', [
            'manage_library',
        ])->pluck('id');
        $librarian->permissions()->sync($librarianPermissions->toArray());

        $this->call(LeaveManagementSeeder::class);

        $this->command->info('System roles and permissions seeded successfully! Run Setup Wizard to initialize institute and super admin.');
    }
}
