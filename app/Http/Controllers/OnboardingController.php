<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Account;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function show()
    {
        try {
            $isSetupCompleted = (bool) Setting::get('is_setup_completed', false)
                && User::active()->whereHas('roles', fn($q) => $q->whereIn('slug', ['super-admin', 'super_admin']))->exists();
        } catch (\Throwable $e) {
            $isSetupCompleted = false;
        }

        // Setup complete + logged in → go to dashboard (skip wizard)
        if ($isSetupCompleted && Auth::check()) {
            // Allow super admin to revisit wizard via direct URL for re-configuration
            if (!Auth::user()->isSuperAdmin()) {
                return redirect()->route('dashboard');
            }
            // Super admin can access settings wizard
            $this->authorize('manage_settings');
        }

        // Setup complete + not logged in → go to login
        if ($isSetupCompleted && !Auth::check()) {
            return redirect()->route('login');
        }

        try {
            $settings = Setting::pluck('value', 'key')->toArray();
            $currentYear = AcademicYear::where('is_current', true)->first() ?? AcademicYear::latest()->first();
            $primaryAccount = Account::where('status', 'active')->first();
            $adminUser = User::active()
                ->whereHas('roles', fn($q) => $q->whereIn('slug', ['super-admin', 'super_admin']))
                ->first();
        } catch (\Throwable $e) {
            $settings = [];
            $currentYear = null;
            $primaryAccount = null;
            $adminUser = null;
        }

        return Inertia::render('Settings/OnboardingWizard', [
            'currentSettings' => $settings,
            'currentYear' => $currentYear,
            'primaryAccount' => $primaryAccount,
            'adminUser' => $adminUser ? [
                'name' => $adminUser->name,
                'email' => $adminUser->email,
            ] : null,
            'isFreshSetup' => !$isSetupCompleted,
        ]);
    }

    public function save(Request $request)
    {
        try {
            $isSetupCompleted = (bool) Setting::get('is_setup_completed', false)
                && User::active()->whereHas('roles', fn($q) => $q->whereIn('slug', ['super-admin', 'super_admin']))->exists();
        } catch (\Throwable $e) {
            $isSetupCompleted = false;
        }

        // If setup already complete, must be authenticated with permission
        if ($isSetupCompleted && !Auth::check()) {
            return redirect()->route('login');
        }

        if ($isSetupCompleted && Auth::check()) {
            $this->authorize('manage_settings');
        }


        $validated = $request->validate([
            // Step 1: Identity & Mode
            'institute_type' => 'required|in:school,coaching,hybrid',
            'school_name' => 'required|string|max:255',
            'school_code' => 'nullable|string|max:50',
            'school_phone' => 'nullable|string|max:50',
            'school_email' => 'nullable|email|max:100',
            'school_address' => 'nullable|string|max:500',
            'school_website' => 'nullable|string|max:255',
            'established_year' => 'nullable|string|max:10',
            'currency_symbol' => 'required|string|max:10',
            'invoice_footer_text' => 'nullable|string|max:255',

            // Step 2: Academic Session
            'session_name' => 'required|string|max:100',
            'session_start' => 'required|date',
            'session_end' => 'required|date|after_or_equal:session_start',

            // Step 3: Financial Account
            'account_name' => 'required|string|max:100',
            'account_type' => 'required|string|in:cash,bank,mobile_banking',
            'opening_balance' => 'required|numeric|min:0',

            // Step 4: Super Admin Account
            'admin_name' => $isSetupCompleted ? 'nullable|string|max:100' : 'required|string|max:100',
            'admin_email' => $isSetupCompleted ? 'nullable|email|max:100' : 'required|email|max:100',
            'admin_password' => $isSetupCompleted ? 'nullable|string|min:6' : 'required|string|min:6',
        ]);

        try {
            $adminUserId = DB::transaction(function () use ($request, $validated) {
            // 1. Save Files if uploaded
            if ($request->hasFile('school_logo')) {
                $request->validate(['school_logo' => 'image|mimes:jpeg,png,jpg,webp,svg|max:2048']);
                $logoPath = $request->file('school_logo')->store('settings', 'public');
                Setting::set('school_logo', $logoPath);
            }

            if ($request->hasFile('school_favicon')) {
                $request->validate(['school_favicon' => 'image|mimes:jpeg,png,jpg,ico,svg|max:1024']);
                $faviconPath = $request->file('school_favicon')->store('settings', 'public');
                Setting::set('school_favicon', $faviconPath);
            }

            // 2. Save General Institute Settings
            $settingKeys = [
                'institute_type',
                'school_name',
                'school_code',
                'school_phone',
                'school_email',
                'school_address',
                'school_website',
                'established_year',
                'currency_symbol',
                'invoice_footer_text',
            ];

            foreach ($settingKeys as $key) {
                if (isset($validated[$key])) {
                    Setting::set($key, $validated[$key]);
                }
            }

            // Sync institute_name after the main institute details are valid.
            Setting::set('institute_name', $validated['school_name']);

            // 3. Setup Academic Session
            $academicYear = AcademicYear::where('name', $validated['session_name'])->first();
            if ($academicYear) {
                $academicYear->update([
                    'start_date' => $validated['session_start'],
                    'end_date' => $validated['session_end'],
                    'is_current' => true,
                    'status' => 'active',
                ]);
            } else {
                AcademicYear::query()->update(['is_current' => false]);
                AcademicYear::create([
                    'name' => $validated['session_name'],
                    'start_date' => $validated['session_start'],
                    'end_date' => $validated['session_end'],
                    'is_current' => true,
                    'status' => 'active',
                ]);
            }

            // 4. Setup Initial Operating Account
            $account = Account::where('account_name', $validated['account_name'])->first();
            if (!$account) {
                Account::create([
                    'account_name' => $validated['account_name'],
                    'account_number' => 'ACC-' . strtoupper(substr(uniqid(), -6)),
                    'account_type' => $validated['account_type'],
                    'opening_balance' => $validated['opening_balance'],
                    'current_balance' => $validated['opening_balance'],
                    'status' => 'active',
                    'description' => 'Primary operating account created via Setup Wizard',
                ]);
            }

            // 5. Setup Super Admin User
            $superAdminRole = Role::whereIn('slug', ['super-admin', 'super_admin'])
                ->orWhere('name', 'Super Admin')
                ->first();

            if (!$superAdminRole) {
                $superAdminRole = Role::create([
                    'name' => 'Super Admin',
                    'slug' => 'super-admin',
                    'description' => 'Full administrative access',
                ]);
            }

            $adminEmail = $validated['admin_email'] ?? 'admin@school.com';
            $adminName = $validated['admin_name'] ?? 'Super Admin';
            $adminPassword = !empty($validated['admin_password'])
                ? Hash::make($validated['admin_password'])
                : Hash::make('password');

            $adminUser = User::where('email', $adminEmail)->first();
            if ($adminUser) {
                $adminUser->update([
                    'name' => $adminName,
                    'status' => 'active',
                ]);
                if (!empty($validated['admin_password'])) {
                    $adminUser->update(['password' => $adminPassword]);
                }
            } else {
                $adminUser = User::create([
                    'name' => $adminName,
                    'email' => $adminEmail,
                    'password' => $adminPassword,
                    'status' => 'active',
                ]);
            }

            $adminUser->roles()->syncWithoutDetaching([$superAdminRole->id]);

            $adminUser->load('roles');
            if (!$adminUser->exists || !$adminUser->isActive() || !$adminUser->hasRole($superAdminRole)) {
                throw new \RuntimeException('Super Admin user verification failed before setup commit.');
            }

            // Mark setup complete only after every required record exists.
            Setting::set('is_setup_completed', '1', 'boolean');

            return $adminUser->id;
            });

            $adminUser = User::with('roles')->find($adminUserId);
            if (!$adminUser || !$adminUser->isActive() || !$adminUser->isSuperAdmin()) {
                throw new \RuntimeException('Super Admin user was not available after setup commit.');
            }

            Auth::login($adminUser);
            $request->session()->regenerate();
            Cache::forget('global_institute_settings');

            return redirect()->route('dashboard')
                ->with('success', "Setup completed successfully! Welcome to {$validated['school_name']}.");
        } catch (\Throwable $exception) {
            Log::error('Institute onboarding failed.', [
                'message' => $exception->getMessage(),
                'exception' => get_class($exception),
            ]);

            return back()
                ->withInput()
                ->withErrors(['setup' => 'Setup could not be completed. No changes were saved. Please correct the highlighted fields or contact support.']);
        }
    }
}
