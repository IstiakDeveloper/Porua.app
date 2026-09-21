<?php

/**
 * Example Routes with Role & Permission Middleware
 *
 * This file demonstrates how to use role and permission middleware
 * in your application routes.
 */

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Example: Dashboard Route (Authenticated users only)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Example: Super Admin & Principal Routes
Route::middleware(['auth', 'role:Super Admin,Principal'])->prefix('admin')->group(function () {
    // User Management
    Route::get('/users', fn() => 'Users List')->name('admin.users.index');
    Route::get('/users/create', fn() => 'Create User')->name('admin.users.create');

    // System Settings
    Route::get('/settings', fn() => 'System Settings')->name('admin.settings');
});

// Example: Teacher Routes
Route::middleware(['auth', 'role:Teacher'])->prefix('teacher')->group(function () {
    Route::get('/classes', fn() => 'My Classes')->name('teacher.classes');
    Route::get('/students', fn() => 'My Students')->name('teacher.students');
    Route::get('/attendance', fn() => 'Mark Attendance')->name('teacher.attendance');
});

// Example: Student Routes
Route::middleware(['auth', 'role:Student'])->prefix('student')->group(function () {
    Route::get('/profile', fn() => 'My Profile')->name('student.profile');
    Route::get('/results', fn() => 'My Results')->name('student.results');
    Route::get('/attendance', fn() => 'My Attendance')->name('student.attendance');
});

// Example: Parent Routes
Route::middleware(['auth', 'role:Parent'])->prefix('parent')->group(function () {
    Route::get('/children', fn() => 'My Children')->name('parent.children');
    Route::get('/fees', fn() => 'Fee Status')->name('parent.fees');
});

// Example: Permission-based Routes
Route::middleware(['auth', 'permission:view_students'])->group(function () {
    Route::get('/students', fn() => 'Students List')->name('students.index');
});

Route::middleware(['auth', 'permission:create_students'])->group(function () {
    Route::get('/students/create', fn() => 'Create Student')->name('students.create');
    Route::post('/students', fn() => 'Store Student')->name('students.store');
});

Route::middleware(['auth', 'permission:edit_students'])->group(function () {
    Route::get('/students/{id}/edit', fn($id) => "Edit Student $id")->name('students.edit');
    Route::put('/students/{id}', fn($id) => "Update Student $id")->name('students.update');
});

Route::middleware(['auth', 'permission:delete_students'])->group(function () {
    Route::delete('/students/{id}', fn($id) => "Delete Student $id")->name('students.destroy');
});

// Example: Multiple Permissions (User needs ANY of these)
Route::middleware(['auth', 'permission:view_reports,export_reports'])->group(function () {
    Route::get('/reports', fn() => 'Reports Dashboard')->name('reports.index');
});

// Example: Accountant Routes
Route::middleware(['auth', 'role:Accountant'])->prefix('accounts')->group(function () {
    Route::get('/fees', fn() => 'Fee Collections')->name('accounts.fees');
    Route::get('/reports', fn() => 'Financial Reports')->name('accounts.reports');
});

// Example: Librarian Routes
Route::middleware(['auth', 'role:Librarian'])->prefix('library')->group(function () {
    Route::get('/books', fn() => 'Books List')->name('library.books');
    Route::get('/issues', fn() => 'Book Issues')->name('library.issues');
});

// Example: Using Gate in Controller
// You can also use Gate::authorize() or $this->authorize() in controllers:
/*
class StudentController extends Controller
{
    public function index()
    {
        Gate::authorize('view_students');
        // or
        $this->authorize('view_students');

        // Your code here
    }

    public function store()
    {
        if (!Gate::allows('create_students')) {
            abort(403, 'You do not have permission to create students.');
        }

        // Your code here
    }
}
*/
