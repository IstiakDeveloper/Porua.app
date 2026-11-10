<?php

use App\Http\Controllers\Academic\AcademicYearController;
use App\Http\Controllers\Academic\ClassController;
use App\Http\Controllers\Academic\SectionController;
use App\Http\Controllers\Academic\SubjectController;
use App\Http\Controllers\Coaching\BatchController;
use App\Http\Controllers\Coaching\BatchEnrollmentController;
use App\Http\Controllers\Coaching\CourseController;
use App\Http\Controllers\Coaching\CoachingFeeController;
use App\Http\Controllers\Coaching\TeacherPayoutController;
use App\Http\Controllers\Coaching\ModelTestController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\Accounting\AccountController;
use App\Http\Controllers\Accounting\DashboardController as AccountingDashboardController;
use App\Http\Controllers\Accounting\ExpenseCategoryController;
use App\Http\Controllers\Accounting\FixedAssetController;
use App\Http\Controllers\Accounting\FundController;
use App\Http\Controllers\Accounting\IncomeCategoryController;
use App\Http\Controllers\Accounting\InvestorController;
use App\Http\Controllers\Accounting\Reports\BalanceSheetReportController;
use App\Http\Controllers\Accounting\Reports\BankReportController;
use App\Http\Controllers\Accounting\Reports\DueReportController;
use App\Http\Controllers\Accounting\Reports\IncomeExpenditureReportController;
use App\Http\Controllers\Accounting\Reports\ReceiptPaymentReportController;
use App\Http\Controllers\Accounting\Reports\StaffWelfareLoanLedgerReportController;
use App\Http\Controllers\Accounting\TransactionController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Attendance\AttendanceSummaryController;
use App\Http\Controllers\Attendance\StudentAttendanceController;
use App\Http\Controllers\Attendance\TeacherAttendanceController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Communication\EventController;
use App\Http\Controllers\Communication\MessageController;
use App\Http\Controllers\Communication\NoticeController;
use App\Http\Controllers\Communication\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceSettingController;
use App\Http\Controllers\Leave\LeaveApplicationController;
use App\Http\Controllers\Leave\LeaveReportController;
use App\Http\Controllers\Leave\LeaveTypeController;
use App\Http\Controllers\Teacher\TeacherLeaveController;
use App\Http\Controllers\Exam\ExamController;
use App\Http\Controllers\Exam\ExamHallController;
use App\Http\Controllers\Exam\ExamInvigilatorController;
use App\Http\Controllers\Exam\ExamScheduleController;
use App\Http\Controllers\Exam\ExamSeatPlanController;
use App\Http\Controllers\Exam\GradeSettingController;
use App\Http\Controllers\Exam\MarkController;
use App\Http\Controllers\Exam\ResultController;
use App\Http\Controllers\Fee\FeeCollectionController;
use App\Http\Controllers\Fee\FeeStructureController;
use App\Http\Controllers\Fee\FeeTypeController;
use App\Http\Controllers\Fee\FeeWaiverController;
use App\Http\Controllers\Library\BookController;
use App\Http\Controllers\Library\BookIssueController;
use App\Http\Controllers\OtherStaffAttendanceController;
use App\Http\Controllers\OtherStaffController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\Student\StudentController;
use App\Http\Controllers\Student\StudentDocumentController;
use App\Http\Controllers\Student\StudentParentController;
use App\Http\Controllers\Student\StudentPromotionController;
use App\Http\Controllers\Teacher\TeacherController;
use App\Http\Controllers\Teacher\TeacherSubjectController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ============================================
// PUBLIC ROUTES
// ============================================
Route::get('/', function () {
    try {
        $isSetupCompleted = (bool) \App\Models\Setting::get('is_setup_completed', false)
            && \App\Models\User::active()
                ->whereHas('roles', fn($q) => $q->whereIn('slug', ['super-admin', 'super_admin']))
                ->exists();
    } catch (\Throwable $e) {
        // DB not ready yet (fresh migration), go to setup
        $isSetupCompleted = false;
    }

    // Setup not done → show the wizard
    if (!$isSetupCompleted) {
        return app(\App\Http\Controllers\OnboardingController::class)->show();
    }

    // Setup done + authenticated → go to dashboard
    if (\Illuminate\Support\Facades\Auth::check()) {
        return redirect()->route('dashboard');
    }

    // Setup done + not authenticated → go to login
    return redirect()->route('login');
})->name('home');

Route::get('/offline', function () {
    return \Inertia\Inertia::render('Offline');
})->name('offline');

Route::get('/sw.js', function () {
    $path = public_path('build/sw.js');
    if (!file_exists($path)) {
        $path = public_path('sw.js');
    }
    if (file_exists($path)) {
        return response()->file($path, [
            'Content-Type' => 'application/javascript',
            'Service-Worker-Allowed' => '/',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }
    abort(404);
});

Route::get('/setup', [OnboardingController::class, 'show'])->name('onboarding.wizard');
Route::post('/setup', [OnboardingController::class, 'save'])->name('onboarding.save');

// ============================================
// GUEST ROUTES (Login, Register, Password Reset)
// ============================================
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);

    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);

    Route::get('/forgot-password', [ForgotPasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/reset-password/{token}', [ForgotPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])->name('password.update');
});

// ============================================
// AUTHENTICATED ROUTES
// ============================================
Route::middleware(['auth', 'restrict.admin.mutations'])->group(function () {

    // Logout
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    // Dashboard (redirects to role-specific dashboard) - Auto-generate fees on visit
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('auto.fees')
        ->name('dashboard');

    // ============================================
    // ADMIN ROUTES (User, Role, Permission Management)
    // ============================================
    Route::middleware(['role:Super Admin,Admin'])->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class)->except(['show']);
        Route::resource('permissions', PermissionController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('permissions/sync', [PermissionController::class, 'sync'])->name('permissions.sync');
    });

    // ============================================
    // ACADEMIC SETUP (Super Admin & Principal Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal'])->group(function () {
        Route::resource('academic-years', AcademicYearController::class);
        Route::post('academic-years/{academic_year}/set-current', [AcademicYearController::class, 'setCurrent'])->name('academic-years.set-current');

        Route::resource('classes', ClassController::class);
        Route::resource('sections', SectionController::class);
        Route::resource('subjects', SubjectController::class);

        // Coaching Courses, Batches & Enrollments
        Route::resource('courses', CourseController::class);
        Route::resource('batches', BatchController::class);
        Route::post('batch-enrollments', [BatchEnrollmentController::class, 'store'])->name('batch-enrollments.store');
        Route::put('batch-enrollments/{enrollment}', [BatchEnrollmentController::class, 'update'])->name('batch-enrollments.update');
        Route::delete('batch-enrollments/{enrollment}', [BatchEnrollmentController::class, 'destroy'])->name('batch-enrollments.destroy');
        Route::get('api/coaching/search-students', [BatchEnrollmentController::class, 'searchStudents'])->name('api.coaching.search-students');
        Route::get('api/coaching/enrollment', [CoachingFeeController::class, 'getEnrollment'])->name('api.coaching.enrollment');

        // Coaching Batch Fees & Teacher Payouts
        Route::get('coaching/fees', [CoachingFeeController::class, 'index'])->name('coaching.fees.index');
        Route::post('coaching/fees', [CoachingFeeController::class, 'store'])->name('coaching.fees.store');
        Route::resource('teacher-payouts', TeacherPayoutController::class)->only(['index', 'store', 'destroy']);

        // Coaching Model Tests & Merit Ranking
        Route::resource('model-tests', ModelTestController::class);
        Route::get('model-tests/{model_test}/marks', [ModelTestController::class, 'markEntry'])->name('model-tests.marks');
        Route::post('model-tests/{model_test}/marks', [ModelTestController::class, 'saveMarks'])->name('model-tests.save-marks');
    });

    // ============================================
    // STUDENT MANAGEMENT (Super Admin, Principal, Teacher Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Teacher'])->group(function () {
        Route::patch('students/{student}/toggle-status', [StudentController::class, 'toggleStatus'])->name('students.toggle-status');
        Route::resource('students', StudentController::class);
        Route::get('students/sections/{classId}', [StudentController::class, 'getSections'])->name('students.sections');

        Route::resource('student-parents', StudentParentController::class);

        Route::get('students/{student}/documents', [StudentDocumentController::class, 'index'])->name('student-documents.index');
        Route::post('students/{student}/documents', [StudentDocumentController::class, 'store'])->name('student-documents.store');
        Route::delete('student-documents/{student_document}', [StudentDocumentController::class, 'destroy'])->name('student-documents.destroy');
        Route::get('student-documents/{student_document}/download', [StudentDocumentController::class, 'download'])->name('student-documents.download');
    });

    // ============================================
    // STUDENT PROMOTION (Super Admin & Principal Only)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal'])->group(function () {
        // Custom route must come BEFORE resource route to avoid conflicts
        Route::get('student-promotions/students', [StudentPromotionController::class, 'getStudentsForPromotion'])->name('student-promotions.students');
        Route::resource('student-promotions', StudentPromotionController::class)->except(['edit', 'update']);
    });

    // ============================================
    // TEACHER MANAGEMENT (Super Admin & Principal Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal'])->group(function () {
        // Print routes (must be before resource route)
        Route::get('teachers/{teacher}/print-profile', [TeacherController::class, 'printProfile'])->name('teachers.print-profile');
        Route::get('teachers/{teacher}/print-id-card', [TeacherController::class, 'printIdCard'])->name('teachers.print-id-card');
        Route::patch('teachers/{teacher}/toggle-status', [TeacherController::class, 'toggleStatus'])->name('teachers.toggle-status');

        Route::resource('teachers', TeacherController::class);

        Route::resource('teacher-subjects', TeacherSubjectController::class)->only(['index', 'create', 'store', 'destroy']);
        Route::get('teachers/{teacher}/schedule', [TeacherSubjectController::class, 'teacherSchedule'])->name('teachers.schedule');
    });

    // ============================================
    // STAFF & SALARY MANAGEMENT (Super Admin & Principal Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal'])->group(function () {
        Route::resource('staff', StaffController::class);
        Route::resource('salaries', SalaryController::class);

        // Salary Payment routes
        Route::get('salary-payments', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'index'])->name('salary-payments.index');
        Route::post('salary-payments', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'store'])->name('salary-payments.store');
        Route::post('salary-payments/bulk', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'bulkStore'])->name('salary-payments.bulk');
        Route::post('salary-payments/bulk-change-month', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'bulkChangeMonth'])->name('salary-payments.bulk-change-month');
        Route::get('salary-payments/{payment}/edit', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'edit'])->name('salary-payments.edit');
        Route::put('salary-payments/{payment}', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'update'])->name('salary-payments.update');
        Route::get('salary-payments/{payment}', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'show'])->name('salary-payments.show');
        Route::delete('salary-payments/{payment}', [App\Http\Controllers\Salary\SalaryPaymentController::class, 'destroy'])->name('salary-payments.destroy');

        // Provident Fund routes
        Route::get('provident-fund', [App\Http\Controllers\Salary\ProvidentFundController::class, 'index'])->name('provident-fund.index');
        Route::get('provident-fund/{teacher}', [App\Http\Controllers\Salary\ProvidentFundController::class, 'show'])->name('provident-fund.show');
        Route::post('provident-fund/{teacher}/opening-entry', [App\Http\Controllers\Salary\ProvidentFundController::class, 'storeOpeningEntry'])->name('provident-fund.opening-entry');
        Route::post('provident-fund/{teacher}/withdraw', [App\Http\Controllers\Salary\ProvidentFundController::class, 'withdraw'])->name('provident-fund.withdraw');
    });

    // ============================================
    // ATTENDANCE MANAGEMENT (Super Admin, Principal, Teacher Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Teacher'])->group(function () {
        // Custom routes BEFORE resource routes
        Route::get('student-attendance/students', [StudentAttendanceController::class, 'getStudents'])->name('student-attendance.students');
        Route::get('student-attendance/report', [StudentAttendanceController::class, 'report'])->name('student-attendance.report');
        Route::get('student-attendance/calendar', [StudentAttendanceController::class, 'calendar'])->name('student-attendance.calendar');
        Route::resource('student-attendance', StudentAttendanceController::class)->except(['edit', 'update']);

        Route::get('teacher-attendance/report', [TeacherAttendanceController::class, 'report'])->name('teacher-attendance.report');
        Route::get('teacher-attendance/report/pdf', [TeacherAttendanceController::class, 'reportPdf'])->name('teacher-attendance.report.pdf');
        Route::get('teacher-attendance/monthly', [TeacherAttendanceController::class, 'monthly'])->name('teacher-attendance.monthly');
        Route::get('teacher-attendance/monthly/pdf', [TeacherAttendanceController::class, 'monthlyPdf'])->name('teacher-attendance.monthly.pdf');
        Route::get('teacher-attendance/calendar', [TeacherAttendanceController::class, 'calendar'])->name('teacher-attendance.calendar');
        Route::get('teacher-attendance/sheet-report', [TeacherAttendanceController::class, 'sheetReport'])->name('teacher-attendance.sheet-report');
        Route::get('teacher-attendance/sheet-report/pdf', [TeacherAttendanceController::class, 'sheetPdf'])->name('teacher-attendance.sheet-report.pdf');
        Route::resource('teacher-attendance', TeacherAttendanceController::class)->except(['edit', 'update', 'show']);

        Route::resource('attendance-summary', AttendanceSummaryController::class)->only(['index', 'destroy']);
        Route::post('attendance-summary/generate', [AttendanceSummaryController::class, 'generate'])->name('attendance-summary.generate');
        Route::get('attendance-summary/student/{student}', [AttendanceSummaryController::class, 'student'])->name('attendance-summary.student');
        Route::get('attendance-summary/class', [AttendanceSummaryController::class, 'class'])->name('attendance-summary.class');

        // Coaching Batch Attendance & Class Routine Matrix
        Route::get('coaching/attendance', [\App\Http\Controllers\Coaching\BatchAttendanceController::class, 'index'])->name('coaching.attendance.index');
        Route::get('coaching/attendance/{batch}/sheet', [\App\Http\Controllers\Coaching\BatchAttendanceController::class, 'sheet'])->name('coaching.attendance.sheet');
        Route::post('coaching/attendance/{batch}', [\App\Http\Controllers\Coaching\BatchAttendanceController::class, 'save'])->name('coaching.attendance.save');
        Route::get('coaching/attendance/{batch}/report', [\App\Http\Controllers\Coaching\BatchAttendanceController::class, 'report'])->name('coaching.attendance.report');
        Route::get('coaching/routine', [\App\Http\Controllers\Coaching\BatchRoutineController::class, 'index'])->name('coaching.routine.index');
    });

    // ============================================
    // LEAVE MANAGEMENT (Super Admin, Admin, Principal Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal'])->group(function () {
        Route::resource('leave-types', LeaveTypeController::class)->except(['create', 'show', 'edit']);
        Route::get('leave-applications', [LeaveApplicationController::class, 'index'])->name('leave-applications.index');
        Route::post('leave-applications', [LeaveApplicationController::class, 'store'])->name('leave-applications.store');
        Route::post('leave-applications/{leave_application}/approve', [LeaveApplicationController::class, 'approve'])->name('leave-applications.approve');
        Route::post('leave-applications/{leave_application}/reject', [LeaveApplicationController::class, 'reject'])->name('leave-applications.reject');
        Route::post('leave-applications/{leave_application}/cancel', [LeaveApplicationController::class, 'cancel'])->name('leave-applications.cancel');
        Route::get('leave-reports', [LeaveReportController::class, 'index'])->name('leave-reports.index');
        Route::get('leave-reports/print', [LeaveReportController::class, 'print'])->name('leave-reports.print');
    });

    // ============================================
    // OTHER STAFF & ATTENDANCE (Super Admin Only)
    // ============================================
    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('other-staff', OtherStaffController::class);
        Route::patch('other-staff/{other_staff}/toggle-status', [OtherStaffController::class, 'toggleStatus'])->name('other-staff.toggle-status');

        Route::get('other-staff-attendance', [OtherStaffAttendanceController::class, 'index'])->name('other-staff-attendance.index');
        Route::post('other-staff-attendance', [OtherStaffAttendanceController::class, 'store'])->name('other-staff-attendance.store');
    });

    // ============================================
    // EXAM MANAGEMENT (Super Admin, Principal, Teacher Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Teacher'])->group(function () {
        Route::resource('exams', ExamController::class);

        Route::resource('exam-schedules', ExamScheduleController::class);

        Route::resource('exam-halls', ExamHallController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::resource('exam-seat-plans', ExamSeatPlanController::class)->only(['index', 'destroy']);
        Route::post('exam-seat-plans/generate', [ExamSeatPlanController::class, 'generate'])->name('exam-seat-plans.generate');
        Route::get('exam-seat-plans/show', [ExamSeatPlanController::class, 'show'])->name('exam-seat-plans.show');
        Route::post('exam-seat-plans/clear', [ExamSeatPlanController::class, 'clear'])->name('exam-seat-plans.clear');

        Route::resource('exam-invigilators', ExamInvigilatorController::class);
        Route::get('exam-invigilators/schedule', [ExamInvigilatorController::class, 'schedule'])->name('exam-invigilators.schedule');

        // Marks & Results
        Route::resource('marks', MarkController::class)->except(['show']);
        Route::get('marks/students', [MarkController::class, 'getStudents'])->name('marks.students');

        Route::get('results/tabulation', [ResultController::class, 'tabulation'])->name('results.tabulation');
        Route::get('results/tabulation/print', [ResultController::class, 'printTabulation'])->name('results.tabulation.print');
        Route::resource('results', ResultController::class)->only(['index', 'show', 'destroy']);
        Route::post('results/generate', [ResultController::class, 'generate'])->name('results.generate');
        Route::post('results/publish', [ResultController::class, 'publish'])->name('results.publish');
        Route::get('students/{student}/exams/{exam}/result', [ResultController::class, 'studentResult'])->name('results.student');

        Route::resource('grade-settings', GradeSettingController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    // Marksheet Print Route (Accessible to authorized Student, Parent, Staff)
    Route::get('results/{result}/print', [ResultController::class, 'printMarksheet'])->name('results.print');

    // ============================================
    // FEE MANAGEMENT (Super Admin, Principal, Accountant Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Accountant'])->group(function () {
        Route::resource('fee-types', FeeTypeController::class)->except(['show']);
        Route::resource('fee-structures', FeeStructureController::class)->except(['show']);

        // Fee collections with auto-generation middleware
        Route::get('fee-collections/create', [FeeCollectionController::class, 'create'])->name('fee-collections.create');
        Route::resource('fee-collections', FeeCollectionController::class)
            ->except(['show'])
            ->middleware('auto.fees');

        // Custom fee collection routes
        Route::get('fee-collections/student-fees', [FeeCollectionController::class, 'create'])->name('fee-collections.student-fees');
        Route::get('fee-collections/{fee_collection}/receipt', [FeeCollectionController::class, 'receipt'])->name('fee-collections.receipt');
        Route::get('students/{student}/fees', [FeeCollectionController::class, 'studentFees'])->name('students.fees');

        // API endpoints for fee management
        Route::get('api/fee-structures', [FeeCollectionController::class, 'getFeesByClass'])->name('api.fee-structures');
        Route::get('api/fee-collections/student-dues', [FeeCollectionController::class, 'getStudentDues'])->name('api.student-dues');
        Route::match(['get', 'post'], 'api/fee-collections/resync-student-dues', [FeeCollectionController::class, 'resyncStudentDues'])->name('api.resync-student-dues');

        Route::resource('fee-waivers', FeeWaiverController::class)->except(['show']);

        // Overdue fee management with auto-generation
        Route::get('overdue-fees', [\App\Http\Controllers\Fee\OverdueController::class, 'index'])
            ->middleware('auto.fees')
            ->name('overdue-fees.index');
        Route::post('overdue-fees/reminder', [\App\Http\Controllers\Fee\OverdueController::class, 'sendReminder'])->name('overdue-fees.reminder');
        Route::post('overdue-fees/bulk-reminder', [\App\Http\Controllers\Fee\OverdueController::class, 'bulkReminder'])->name('overdue-fees.bulk-reminder');
        Route::post('overdue-fees/mark-paid', [\App\Http\Controllers\Fee\OverdueController::class, 'markPaid'])->name('overdue-fees.mark-paid');
    });

    // ============================================
    // LIBRARY MANAGEMENT (Super Admin, Principal, Librarian Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Librarian'])->group(function () {
        Route::resource('books', BookController::class);

        Route::resource('book-issues', BookIssueController::class)->except(['edit', 'update']);
        Route::post('book-issues/{book_issue}/return', [BookIssueController::class, 'return'])->name('book-issues.return');
        Route::get('book-issues/overdue', [BookIssueController::class, 'overdueBooks'])->name('book-issues.overdue');
    });

    // ============================================
    // ACCOUNTING SYSTEM (Super Admin, Principal, Accountant Access)
    // ============================================
    Route::prefix('accounting')->middleware(['role:Super Admin,Admin,Principal,Accountant'])->group(function () {
        Route::get('dashboard', [AccountingDashboardController::class, 'index'])->name('accounting.dashboard');

        Route::resource('accounts', AccountController::class)->names([
            'index' => 'accounting.accounts.index',
            'create' => 'accounting.accounts.create',
            'store' => 'accounting.accounts.store',
            'show' => 'accounting.accounts.show',
            'edit' => 'accounting.accounts.edit',
            'update' => 'accounting.accounts.update',
            'destroy' => 'accounting.accounts.destroy',
        ]);

        Route::resource('transactions', TransactionController::class)->names([
            'index' => 'accounting.transactions.index',
            'create' => 'accounting.transactions.create',
            'store' => 'accounting.transactions.store',
            'show' => 'accounting.transactions.show',
            'edit' => 'accounting.transactions.edit',
            'update' => 'accounting.transactions.update',
            'destroy' => 'accounting.transactions.destroy',
        ]);

        Route::post('fixed-assets/{fixed_asset}/items', [FixedAssetController::class, 'storeItems'])
            ->name('accounting.fixed-assets.items.store');

        Route::resource('fixed-assets', FixedAssetController::class)->names([
            'index' => 'accounting.fixed-assets.index',
            'create' => 'accounting.fixed-assets.create',
            'store' => 'accounting.fixed-assets.store',
            'show' => 'accounting.fixed-assets.show',
            'edit' => 'accounting.fixed-assets.edit',
            'update' => 'accounting.fixed-assets.update',
            'destroy' => 'accounting.fixed-assets.destroy',
        ]);

        Route::resource('expense-categories', ExpenseCategoryController::class)->except(['show', 'create', 'edit'])->names([
            'index' => 'accounting.expense-categories.index',
            'store' => 'accounting.expense-categories.store',
            'update' => 'accounting.expense-categories.update',
            'destroy' => 'accounting.expense-categories.destroy',
        ]);

        Route::resource('income-categories', IncomeCategoryController::class)->except(['show', 'create', 'edit'])->names([
            'index' => 'accounting.income-categories.index',
            'store' => 'accounting.income-categories.store',
            'update' => 'accounting.income-categories.update',
            'destroy' => 'accounting.income-categories.destroy',
        ]);

        Route::resource('investors', InvestorController::class)->names([
            'index' => 'accounting.investors.index',
            'create' => 'accounting.investors.create',
            'store' => 'accounting.investors.store',
            'show' => 'accounting.investors.show',
            'edit' => 'accounting.investors.edit',
            'update' => 'accounting.investors.update',
            'destroy' => 'accounting.investors.destroy',
        ]);

        Route::get('investors/{investor}/ledger', [InvestorController::class, 'ledger'])->name('accounting.investors.ledger');

        // Simplified Fund Management - Only IN/OUT
        Route::get('funds', [FundController::class, 'index'])->name('accounting.funds.index');
        Route::post('funds/in', [FundController::class, 'fundIn'])->name('accounting.funds.in');
        Route::post('funds/out', [FundController::class, 'fundOut'])->name('accounting.funds.out');
        Route::put('funds/transactions/{transaction}', [FundController::class, 'editTransaction'])->name('accounting.funds.transactions.update');
        Route::delete('funds/transactions/{transaction}', [FundController::class, 'deleteTransaction'])->name('accounting.funds.transactions.delete');

        // Staff Welfare Loan Management
        Route::get('welfare-loans', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'index'])->name('accounting.welfare-loans.index');
        Route::get('welfare-loans/{loan}', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'show'])->name('accounting.welfare-loans.show');
        Route::post('welfare-loans', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'store'])->name('accounting.welfare-loans.store');
        Route::put('welfare-loans/{loan}', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'editLoan'])->name('accounting.welfare-loans.update');
        Route::post('welfare-loans/donations', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'addDonation'])->name('accounting.welfare-loans.donations.store');
        Route::delete('welfare-loans/donations/{donation}', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'deleteDonation'])->name('accounting.welfare-loans.donations.destroy');
        Route::post('welfare-loans/installments/{installment}/pay', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'payInstallment'])->name('accounting.welfare-loans.installments.pay');
        Route::post('welfare-loans/{loan}/cancel', [App\Http\Controllers\Accounting\StaffWelfareLoanController::class, 'cancel'])->name('accounting.welfare-loans.cancel');

        // Reports
        Route::get('reports/bank-report', [BankReportController::class, 'index'])->name('accounting.reports.bank-report');
        Route::get('reports/receipt-payment', [ReceiptPaymentReportController::class, 'index'])->name('accounting.reports.receipt-payment');
        Route::get('reports/income-expenditure', [IncomeExpenditureReportController::class, 'index'])->name('accounting.reports.income-expenditure');
        Route::get('reports/balance-sheet', [BalanceSheetReportController::class, 'index'])->name('accounting.reports.balance-sheet');
        Route::get('reports/due-report', [DueReportController::class, 'index'])->name('accounting.reports.due-report');
        Route::get('reports/staff-welfare-loan-ledger', [StaffWelfareLoanLedgerReportController::class, 'index'])->name('accounting.reports.staff-welfare-loan-ledger');
    });

    // ============================================
    // COMMUNICATION (All Authenticated Users)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Teacher,Accountant,Librarian,Student,Parent'])->group(function () {
        Route::resource('notices', NoticeController::class);

        Route::resource('messages', MessageController::class)->except(['edit', 'update']);
        Route::post('messages/{message}/reply', [MessageController::class, 'reply'])->name('messages.reply');
        Route::get('messages/inbox', [MessageController::class, 'inbox'])->name('messages.inbox');
        Route::get('messages/sent', [MessageController::class, 'sent'])->name('messages.sent');
        Route::get('messages/unread-count', [MessageController::class, 'unread'])->name('messages.unread');

        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
        Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
        Route::delete('notifications/delete-all', [NotificationController::class, 'deleteAll'])->name('notifications.delete-all');
        Route::post('notifications/send', [NotificationController::class, 'send'])->name('notifications.send');

        Route::resource('events', EventController::class);
        Route::get('events/calendar', [EventController::class, 'calendar'])->name('events.calendar');
    });

    // ============================================
    // REPORTS (Super Admin, Principal, Teacher, Accountant Access)
    // ============================================
    Route::middleware(['role:Super Admin,Admin,Principal,Teacher,Accountant'])->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/attendance', [ReportController::class, 'attendanceReport'])->name('reports.attendance');
        Route::get('reports/fees', [ReportController::class, 'feeReport'])->name('reports.fees');
        Route::get('reports/academic', [ReportController::class, 'academicReport'])->name('reports.academic');
        Route::get('reports/student/{student}', [ReportController::class, 'studentReport'])->name('reports.student');
        Route::get('reports/teacher/{teacher}', [ReportController::class, 'teacherReport'])->name('reports.teacher');
        Route::get('reports/class/{class}', [ReportController::class, 'classReport'])->name('reports.class');
        Route::post('reports/export', [ReportController::class, 'exportReport'])->name('reports.export');
    });

    // ============================================
    // ACTIVITY LOGS (Super Admin Access Only)
    // ============================================
    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('activity-logs', ActivityLogController::class)->only(['index', 'show', 'destroy']);
        Route::post('activity-logs/clear', [ActivityLogController::class, 'clear'])->name('activity-logs.clear');
    });

    // ============================================
    // SETTINGS (Super Admin & Principal Access)
    Route::middleware(['role:Super Admin,Admin,Principal'])->group(function () {
        // Note: Setup wizard routes (/setup GET & POST) are intentionally public
        // and registered above outside auth middleware to support fresh installation.
        // OnboardingController handles its own authorization logic.

        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingController::class, 'update'])->name('settings.update');
        Route::get('settings/general', [SettingController::class, 'general'])->name('settings.general');
        Route::get('settings/academic', [SettingController::class, 'academic'])->name('settings.academic');
        Route::get('settings/fee', [SettingController::class, 'fee'])->name('settings.fee');
        Route::get('settings/email', [SettingController::class, 'email'])->name('settings.email');
        Route::get('settings/notification', [SettingController::class, 'notification'])->name('settings.notification');
        Route::get('settings/backup', [SettingController::class, 'backup'])->name('settings.backup');
        Route::post('settings/backup/create', [SettingController::class, 'createBackup'])->name('settings.backup.create');

        // Device Settings & ZKTeco
        Route::get('device-settings', [DeviceSettingController::class, 'index'])->name('device-settings.index');
        Route::put('device-settings', [DeviceSettingController::class, 'update'])->name('device-settings.update');
        Route::put('device-settings/device', [DeviceSettingController::class, 'updateDevice'])->name('device-settings.update.device');
        Route::put('device-settings/teacher', [DeviceSettingController::class, 'updateTeacher'])->name('device-settings.update.teacher');
        Route::put('device-settings/student', [DeviceSettingController::class, 'updateStudent'])->name('device-settings.update.student');
        Route::put('device-settings/weekend', [DeviceSettingController::class, 'updateWeekend'])->name('device-settings.update.weekend');
        Route::put('device-settings/automation', [DeviceSettingController::class, 'updateAutomation'])->name('device-settings.update.automation');
        Route::post('device-settings/test-connection', [DeviceSettingController::class, 'testConnection'])->name('device-settings.test');

        // Holiday Management
        Route::post('holidays', [DeviceSettingController::class, 'storeHoliday'])->name('holidays.store');
        Route::put('holidays/{holiday}', [DeviceSettingController::class, 'updateHoliday'])->name('holidays.update');
        Route::delete('holidays/{holiday}', [DeviceSettingController::class, 'destroyHoliday'])->name('holidays.destroy');
    });

    // ============================================
    // STUDENT PORTAL (Student Access Only)
    // ============================================
    Route::prefix('student')->middleware(['role:Student'])->name('student.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Student\StudentDashboardController::class, 'index'])->name('dashboard');

        // Profile
        Route::get('/profile', [\App\Http\Controllers\Student\StudentProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [\App\Http\Controllers\Student\StudentProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/photo', [\App\Http\Controllers\Student\StudentProfileController::class, 'updatePhoto'])->name('profile.photo');
        Route::put('/profile/password', [\App\Http\Controllers\Student\StudentProfileController::class, 'updatePassword'])->name('profile.password');

        // Attendance
        Route::get('/attendance', [\App\Http\Controllers\Student\StudentAttendanceController::class, 'index'])->name('attendance.index');
        Route::get('/attendance/summary', [\App\Http\Controllers\Student\StudentAttendanceController::class, 'summary'])->name('attendance.summary');

        // Exams & Results
        Route::get('/exams', [\App\Http\Controllers\Student\StudentExamController::class, 'index'])->name('exams.index');
        Route::get('/exams/{exam}', [\App\Http\Controllers\Student\StudentExamController::class, 'show'])->name('exams.show');
        Route::get('/results', [\App\Http\Controllers\Student\StudentExamController::class, 'results'])->name('results.index');
        Route::get('/results/{result}', [\App\Http\Controllers\Student\StudentExamController::class, 'resultDetail'])->name('results.show');
        Route::get('/results/{result}/download', [\App\Http\Controllers\Student\StudentExamController::class, 'downloadMarksheet'])->name('results.download');

        // Fees
        Route::get('/fees', [\App\Http\Controllers\Student\StudentFeeController::class, 'index'])->name('fees.index');
        Route::get('/fees/{fee}/receipt', [\App\Http\Controllers\Student\StudentFeeController::class, 'receipt'])->name('fees.receipt');
        Route::get('/fees/{fee}/download', [\App\Http\Controllers\Student\StudentFeeController::class, 'downloadReceipt'])->name('fees.download');

        // Library
        Route::get('/library', [\App\Http\Controllers\Student\StudentLibraryController::class, 'index'])->name('library.index');
        Route::get('/library/books', [\App\Http\Controllers\Student\StudentLibraryController::class, 'books'])->name('library.books');
        Route::get('/library/issued', [\App\Http\Controllers\Student\StudentLibraryController::class, 'issued'])->name('library.issued');

        // Messages
        Route::get('/messages', [\App\Http\Controllers\Student\StudentMessageController::class, 'index'])->name('messages.index');
        Route::post('/messages', [\App\Http\Controllers\Student\StudentMessageController::class, 'store'])->name('messages.store');
        Route::get('/messages/{message}', [\App\Http\Controllers\Student\StudentMessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{message}/reply', [\App\Http\Controllers\Student\StudentMessageController::class, 'reply'])->name('messages.reply');

        // Notices
        Route::get('/notices', [\App\Http\Controllers\Student\StudentNoticeController::class, 'index'])->name('notices.index');
        Route::get('/notices/{notice}', [\App\Http\Controllers\Student\StudentNoticeController::class, 'show'])->name('notices.show');

        // Events
        Route::get('/events', [\App\Http\Controllers\Student\StudentEventController::class, 'index'])->name('events.index');
        Route::get('/events/calendar', [\App\Http\Controllers\Student\StudentEventController::class, 'calendar'])->name('events.calendar');
    });

    // ============================================
    // TEACHER PORTAL ROUTES
    // ============================================
    Route::prefix('teacher')->name('teacher.')->middleware(['role:Teacher'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Teacher\TeacherDashboardController::class, 'index'])->name('dashboard');

        // Profile
        Route::get('/profile', [\App\Http\Controllers\Teacher\TeacherProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [\App\Http\Controllers\Teacher\TeacherProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/photo', [\App\Http\Controllers\Teacher\TeacherProfileController::class, 'updatePhoto'])->name('profile.photo');
        Route::put('/profile/password', [\App\Http\Controllers\Teacher\TeacherProfileController::class, 'updatePassword'])->name('profile.password');

        // Attendance Management
        Route::get('/attendance', [\App\Http\Controllers\Teacher\TeacherAttendanceController::class, 'index'])->name('attendance.index');
        Route::get('/attendance/mark', [\App\Http\Controllers\Teacher\TeacherAttendanceController::class, 'markAttendance'])->name('attendance.mark');
        Route::post('/attendance/store', [\App\Http\Controllers\Teacher\TeacherAttendanceController::class, 'storeAttendance'])->name('attendance.store');
        Route::get('/attendance/history', [\App\Http\Controllers\Teacher\TeacherAttendanceController::class, 'history'])->name('attendance.history');
        Route::get('/attendance/my', [\App\Http\Controllers\Teacher\TeacherAttendanceController::class, 'myAttendance'])->name('attendance.my');

        // Leave Management
        Route::get('/leaves', [TeacherLeaveController::class, 'index'])->name('leaves.index');
        Route::post('/leaves', [TeacherLeaveController::class, 'store'])->name('leaves.store');
        Route::post('/leaves/{leave_application}/cancel', [TeacherLeaveController::class, 'cancel'])->name('leaves.cancel');

        // Students Management
        Route::get('/students', [\App\Http\Controllers\Teacher\TeacherStudentController::class, 'index'])->name('students.index');
        Route::get('/students/list', [\App\Http\Controllers\Teacher\TeacherStudentController::class, 'list'])->name('students.list');
        Route::get('/students/{student}', [\App\Http\Controllers\Teacher\TeacherStudentController::class, 'show'])->name('students.show');

        // Exams & Marks
        Route::get('/exams', [\App\Http\Controllers\Teacher\TeacherExamController::class, 'index'])->name('exams.index');
        Route::get('/exams/marks/entry', [\App\Http\Controllers\Teacher\TeacherExamController::class, 'markEntry'])->name('exams.marks.entry');
        Route::post('/exams/marks/store', [\App\Http\Controllers\Teacher\TeacherExamController::class, 'storeMarks'])->name('exams.marks.store');
        Route::get('/exams/marks/view', [\App\Http\Controllers\Teacher\TeacherExamController::class, 'viewMarks'])->name('exams.marks.view');

        // Messages
        Route::get('/messages', [\App\Http\Controllers\Teacher\TeacherMessageController::class, 'index'])->name('messages.index');
        Route::get('/messages/create', [\App\Http\Controllers\Teacher\TeacherMessageController::class, 'create'])->name('messages.create');
        Route::post('/messages/send', [\App\Http\Controllers\Teacher\TeacherMessageController::class, 'send'])->name('messages.send');
        Route::get('/messages/{message}', [\App\Http\Controllers\Teacher\TeacherMessageController::class, 'show'])->name('messages.show');

        // Notices
        Route::get('/notices', [\App\Http\Controllers\Teacher\TeacherNoticeController::class, 'index'])->name('notices.index');
        Route::get('/notices/{notice}', [\App\Http\Controllers\Teacher\TeacherNoticeController::class, 'show'])->name('notices.show');
    });

    // ============================================
    // PARENT PORTAL ROUTES
    // ============================================
    Route::prefix('parent')->name('parent.')->middleware(['role:Parent'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Parent\ParentDashboardController::class, 'index'])->name('dashboard');

        // Profile
        Route::get('/profile', [\App\Http\Controllers\Parent\ParentProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [\App\Http\Controllers\Parent\ParentProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/photo', [\App\Http\Controllers\Parent\ParentProfileController::class, 'updatePhoto'])->name('profile.photo');
        Route::put('/profile/password', [\App\Http\Controllers\Parent\ParentProfileController::class, 'updatePassword'])->name('profile.password');

        // Children Management
        Route::get('/children', [\App\Http\Controllers\Parent\ParentStudentController::class, 'index'])->name('children.index');
        Route::get('/children/{student}', [\App\Http\Controllers\Parent\ParentStudentController::class, 'show'])->name('children.show');

        // Attendance Viewing
        Route::get('/attendance', [\App\Http\Controllers\Parent\ParentAttendanceController::class, 'index'])->name('attendance.index');

        // Exams & Results
        Route::get('/exams', [\App\Http\Controllers\Parent\ParentExamController::class, 'index'])->name('exams.index');
        Route::get('/exams/result/{result}', [\App\Http\Controllers\Parent\ParentExamController::class, 'resultDetail'])->name('exams.result');
        Route::get('/exams/result/{result}/print', [\App\Http\Controllers\Exam\ResultController::class, 'printMarksheet'])->name('exams.result.print');

        // Fees
        Route::get('/fees', [\App\Http\Controllers\Parent\ParentFeeController::class, 'index'])->name('fees.index');
        Route::get('/fees/{feeCollection}', [\App\Http\Controllers\Parent\ParentFeeController::class, 'show'])->name('fees.show');

        // Messages
        Route::get('/messages', [\App\Http\Controllers\Parent\ParentMessageController::class, 'index'])->name('messages.index');
        Route::post('/messages/send', [\App\Http\Controllers\Parent\ParentMessageController::class, 'send'])->name('messages.send');
        Route::get('/messages/{message}', [\App\Http\Controllers\Parent\ParentMessageController::class, 'show'])->name('messages.show');

        // Notices
        Route::get('/notices', [\App\Http\Controllers\Parent\ParentNoticeController::class, 'index'])->name('notices.index');
        Route::get('/notices/{notice}', [\App\Http\Controllers\Parent\ParentNoticeController::class, 'show'])->name('notices.show');
    });
});

// ============================================
// SETUP/INSTALLATION ROUTES
// ============================================
Route::get('/storage-link', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('storage:link');

        return response()->json([
            'success' => true,
            'message' => 'Storage link created successfully!',
            'output' => \Illuminate\Support\Facades\Artisan::output(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create storage link: '.$e->getMessage(),
        ], 500);
    }
})->name('setup.storage-link');

Route::get('/migrate', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Database migration completed successfully!',
            'output' => \Illuminate\Support\Facades\Artisan::output(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to migrate database: '.$e->getMessage(),
        ], 500);
    }
})->name('setup.migrate');

Route::get('/logout-all', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('users:logout-all', ['--force' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All users logged out from all devices successfully!',
            'output' => \Illuminate\Support\Facades\Artisan::output(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to logout all users: '.$e->getMessage(),
        ], 500);
    }
})->name('logout-all');
