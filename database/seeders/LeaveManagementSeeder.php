<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class LeaveManagementSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Default Leave Types
        $leaveTypes = [
            [
                'name' => 'Casual Leave',
                'code' => 'CL',
                'days_per_year' => 14,
                'is_paid' => true,
                'color' => '#0284c7', // Sky Blue
                'requires_attachment' => false,
                'description' => 'Casual leave for personal, family, or urgent affairs.',
                'status' => true,
            ],
            [
                'name' => 'Sick Leave',
                'code' => 'SL',
                'days_per_year' => 10,
                'is_paid' => true,
                'color' => '#e11d48', // Rose Red
                'requires_attachment' => false,
                'description' => 'Leave for medical reasons or illness recovery.',
                'status' => true,
            ],
            [
                'name' => 'Earned Leave',
                'code' => 'AL',
                'days_per_year' => 10,
                'is_paid' => true,
                'color' => '#10b981', // Emerald Green
                'requires_attachment' => false,
                'description' => 'Annual earned vacation or personal leave.',
                'status' => true,
            ],
            [
                'name' => 'Maternity Leave',
                'code' => 'ML',
                'days_per_year' => 180,
                'is_paid' => true,
                'color' => '#a855f7', // Purple
                'requires_attachment' => true,
                'description' => 'Maternity leave for female staff members.',
                'status' => true,
            ],
            [
                'name' => 'Unpaid Leave',
                'code' => 'UL',
                'days_per_year' => 0,
                'is_paid' => false,
                'color' => '#64748b', // Slate Gray
                'requires_attachment' => false,
                'description' => 'Leave without pay for extended absence or special circumstances.',
                'status' => true,
            ],
        ];

        foreach ($leaveTypes as $type) {
            LeaveType::firstOrCreate(
                ['code' => $type['code']],
                $type
            );
        }

        // 2. Seed Permissions
        $permissions = [
            ['name' => 'View Leaves', 'slug' => 'view_leaves', 'module' => 'Leave Management'],
            ['name' => 'Apply Leaves', 'slug' => 'apply_leaves', 'module' => 'Leave Management'],
            ['name' => 'Approve Leaves', 'slug' => 'approve_leaves', 'module' => 'Leave Management'],
            ['name' => 'Manage Leave Types', 'slug' => 'manage_leave_types', 'module' => 'Leave Management'],
            ['name' => 'View Leave Reports', 'slug' => 'view_leave_reports', 'module' => 'Leave Management'],
        ];

        $createdPermissions = [];
        foreach ($permissions as $p) {
            $createdPermissions[$p['slug']] = Permission::firstOrCreate(
                ['slug' => $p['slug']],
                ['name' => $p['name'], 'module' => $p['module']]
            );
        }

        // 3. Assign permissions to roles
        $roles = Role::all()->keyBy('name');

        if (isset($roles['Super Admin'])) {
            $roles['Super Admin']->permissions()->syncWithoutDetaching(
                collect($createdPermissions)->pluck('id')
            );
        }

        if (isset($roles['Admin'])) {
            $roles['Admin']->permissions()->syncWithoutDetaching(
                collect($createdPermissions)->pluck('id')
            );
        }

        if (isset($roles['Principal'])) {
            $principalPerms = [
                $createdPermissions['view_leaves']->id,
                $createdPermissions['apply_leaves']->id,
                $createdPermissions['approve_leaves']->id,
                $createdPermissions['view_leave_reports']->id,
            ];
            $roles['Principal']->permissions()->syncWithoutDetaching($principalPerms);
        }

        if (isset($roles['Teacher'])) {
            $teacherPerms = [
                $createdPermissions['view_leaves']->id,
                $createdPermissions['apply_leaves']->id,
            ];
            $roles['Teacher']->permissions()->syncWithoutDetaching($teacherPerms);
        }
    }
}
