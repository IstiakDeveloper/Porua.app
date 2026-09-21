<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Define a super admin gate
        Gate::before(function (User $user, string $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        // User Management Gates
        Gate::define('view_users', fn (User $user) => $user->hasPermission('view_users'));
        Gate::define('create_users', fn (User $user) => $user->hasPermission('create_users'));
        Gate::define('edit_users', fn (User $user) => $user->hasPermission('edit_users'));
        Gate::define('delete_users', fn (User $user) => $user->hasPermission('delete_users'));

        // Student Management Gates
        Gate::define('view_students', fn (User $user) => $user->hasPermission('view_students'));
        Gate::define('create_students', fn (User $user) => $user->hasPermission('create_students'));
        Gate::define('edit_students', fn (User $user) => $user->hasPermission('edit_students'));
        Gate::define('delete_students', fn (User $user) => $user->hasPermission('delete_students'));
        Gate::define('promote_students', fn (User $user) => $user->hasPermission('promote_students'));

        // Teacher Management Gates
        Gate::define('view_teachers', fn (User $user) => $user->hasPermission('view_teachers'));
        Gate::define('create_teachers', fn (User $user) => $user->hasPermission('create_teachers'));
        Gate::define('edit_teachers', fn (User $user) => $user->hasPermission('edit_teachers'));
        Gate::define('delete_teachers', fn (User $user) => $user->hasPermission('delete_teachers'));

        // Staff Management Gates
        Gate::define('view_staff', fn (User $user) => $user->hasPermission('view_staff'));
        Gate::define('create_staff', fn (User $user) => $user->hasPermission('create_staff'));
        Gate::define('edit_staff', fn (User $user) => $user->hasPermission('edit_staff'));
        Gate::define('delete_staff', fn (User $user) => $user->hasPermission('delete_staff'));

        // Class Management Gates
        Gate::define('view_classes', fn (User $user) => $user->hasPermission('view_classes'));
        Gate::define('create_classes', fn (User $user) => $user->hasPermission('create_classes'));
        Gate::define('edit_classes', fn (User $user) => $user->hasPermission('edit_classes'));
        Gate::define('delete_classes', fn (User $user) => $user->hasPermission('delete_classes'));

        // Coaching Courses & Batches Gates
        Gate::define('view_courses', fn (User $user) => $user->hasPermission('view_classes') || $user->hasPermission('view_courses'));
        Gate::define('create_courses', fn (User $user) => $user->hasPermission('create_classes') || $user->hasPermission('create_courses'));
        Gate::define('edit_courses', fn (User $user) => $user->hasPermission('edit_classes') || $user->hasPermission('edit_courses'));
        Gate::define('delete_courses', fn (User $user) => $user->hasPermission('delete_classes') || $user->hasPermission('delete_courses'));

        Gate::define('view_batches', fn (User $user) => $user->hasPermission('view_sections') || $user->hasPermission('view_batches'));
        Gate::define('create_batches', fn (User $user) => $user->hasPermission('create_sections') || $user->hasPermission('create_batches'));
        Gate::define('edit_batches', fn (User $user) => $user->hasPermission('edit_sections') || $user->hasPermission('edit_batches'));
        Gate::define('delete_batches', fn (User $user) => $user->hasPermission('delete_sections') || $user->hasPermission('delete_batches'));

        Gate::define('view_enrollments', fn (User $user) => $user->hasPermission('view_students') || $user->hasPermission('view_enrollments'));
        Gate::define('create_enrollments', fn (User $user) => $user->hasPermission('create_students') || $user->hasPermission('create_enrollments'));
        Gate::define('edit_enrollments', fn (User $user) => $user->hasPermission('edit_students') || $user->hasPermission('edit_enrollments'));
        Gate::define('delete_enrollments', fn (User $user) => $user->hasPermission('delete_students') || $user->hasPermission('delete_enrollments'));

        // Subject Management Gates
        Gate::define('view_subjects', fn (User $user) => $user->hasPermission('view_subjects'));
        Gate::define('create_subjects', fn (User $user) => $user->hasPermission('create_subjects'));
        Gate::define('edit_subjects', fn (User $user) => $user->hasPermission('edit_subjects'));
        Gate::define('delete_subjects', fn (User $user) => $user->hasPermission('delete_subjects'));

        // Attendance Management Gates
        Gate::define('view_attendance', fn (User $user) => $user->hasPermission('view_attendance'));
        Gate::define('mark_attendance', fn (User $user) => $user->hasPermission('mark_attendance'));
        Gate::define('edit_attendance', fn (User $user) => $user->hasPermission('edit_attendance'));

        // Exam Management Gates
        Gate::define('view_exams', fn (User $user) => $user->hasPermission('view_exams'));
        Gate::define('create_exams', fn (User $user) => $user->hasPermission('create_exams'));
        Gate::define('edit_exams', fn (User $user) => $user->hasPermission('edit_exams'));
        Gate::define('delete_exams', fn (User $user) => $user->hasPermission('delete_exams'));
        Gate::define('view_marks', fn (User $user) => $user->hasPermission('view_marks'));
        Gate::define('enter_marks', fn (User $user) => $user->hasPermission('enter_marks'));
        Gate::define('edit_marks', fn (User $user) => $user->hasPermission('edit_marks'));
        Gate::define('view_results', fn (User $user) => $user->hasPermission('view_results'));
        Gate::define('publish_results', fn (User $user) => $user->hasPermission('publish_results'));

        // App-level "manage_*" gates used by controllers
        Gate::define('manage_exams', fn (User $user) => $user->hasPermission('manage_exams'));
        Gate::define('manage_fees', fn (User $user) => $user->hasPermission('manage_fees'));
        Gate::define('manage_library', fn (User $user) => $user->hasPermission('manage_library'));
        Gate::define('manage_notices', fn (User $user) => $user->hasPermission('manage_notices'));
        Gate::define('manage_accounting', fn (User $user) => $user->hasPermission('manage_accounting'));

        // Fee Management Gates
        Gate::define('view_fees', fn (User $user) => $user->hasPermission('view_fees'));
        Gate::define('collect_fees', fn (User $user) => $user->hasPermission('collect_fees'));
        Gate::define('create_fee_types', fn (User $user) => $user->hasPermission('create_fee_types'));
        Gate::define('manage_fee_waivers', fn (User $user) => $user->hasPermission('manage_fee_waivers'));

        // Library Management Gates
        Gate::define('view_books', fn (User $user) => $user->hasPermission('view_books'));
        Gate::define('create_books', fn (User $user) => $user->hasPermission('create_books'));
        Gate::define('issue_books', fn (User $user) => $user->hasPermission('issue_books'));
        Gate::define('return_books', fn (User $user) => $user->hasPermission('return_books'));

        // Communication Gates
        Gate::define('view_notices', fn (User $user) => $user->hasPermission('view_notices'));
        Gate::define('create_notices', fn (User $user) => $user->hasPermission('create_notices'));
        Gate::define('send_messages', fn (User $user) => $user->hasPermission('send_messages'));

        // Reports Gates
        Gate::define('view_reports', fn (User $user) => $user->hasPermission('view_reports'));
        Gate::define('export_reports', fn (User $user) => $user->hasPermission('export_reports'));

        // Settings Gates
        Gate::define('manage_settings', fn (User $user) => $user->hasPermission('manage_settings'));
        Gate::define('view_activity_logs', fn (User $user) => $user->hasPermission('view_activity_logs'));

        // Coaching Teacher Payouts Gates
        Gate::define('view_teacher_payouts', fn (User $user) => $user->hasPermission('view_teacher_payouts') || $user->hasPermission('manage_accounting') || $user->hasPermission('manage_fees'));
        Gate::define('manage_teacher_payouts', fn (User $user) => $user->hasPermission('manage_teacher_payouts') || $user->hasPermission('manage_accounting') || $user->hasPermission('manage_fees'));

        // Coaching Model Tests Gates
        Gate::define('view_model_tests', fn (User $user) => $user->hasPermission('view_model_tests') || $user->hasPermission('view_exams') || $user->hasPermission('manage_exams') || $user->hasPermission('view_batches'));
        Gate::define('manage_model_tests', fn (User $user) => $user->hasPermission('manage_model_tests') || $user->hasPermission('manage_exams') || $user->hasPermission('edit_batches'));

        // Coaching Batch Attendance & Routine Gates
        Gate::define('view_batch_attendance', fn (User $user) => $user->hasPermission('view_batch_attendance') || $user->hasPermission('view_attendance') || $user->hasPermission('view_batches'));
        Gate::define('mark_batch_attendance', fn (User $user) => $user->hasPermission('mark_batch_attendance') || $user->hasPermission('mark_attendance') || $user->hasPermission('edit_batches'));
        Gate::define('view_coaching_routine', fn (User $user) => $user->hasPermission('view_coaching_routine') || $user->hasPermission('view_batches') || $user->hasPermission('view_classes'));
    }
}
