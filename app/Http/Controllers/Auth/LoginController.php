<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        // Fresh install: setup not completed → redirect to wizard
        $isSetupCompleted = (bool) \App\Models\Setting::get('is_setup_completed', false)
            && \App\Models\User::active()
                ->whereHas('roles', fn ($q) => $q->whereIn('slug', ['super-admin', 'super_admin']))
                ->exists();

        if (! $isSetupCompleted) {
            return redirect()->route('onboarding.wizard');
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $input = $request->input('login') ?? $request->input('email');

        $request->validate([
            'login' => 'nullable|string',
            'email' => 'nullable|string',
            'password' => 'required|string|min:4',
            'remember' => 'boolean',
        ]);

        if (empty($input)) {
            throw ValidationException::withMessages([
                'login' => 'Please enter your username, mobile number, or email address.',
            ]);
        }

        $input = trim((string) $input);
        $password = (string) $request->input('password');
        $remember = $request->boolean('remember');

        // Find user by username, email, or phone
        $user = \App\Models\User::where('username', $input)
            ->orWhere('email', $input)
            ->orWhere('phone', $input)
            ->first();

        if (! $user || ! \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => 'The provided credentials do not match our records.',
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'login' => 'Your account is '.($user->status ?? 'inactive').'. Please contact school administration.',
            ]);
        }

        Auth::login($user, $remember);

        $request->session()->regenerate();

        // Update last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        logActivity('login', 'User logged in successfully');

        // Redirect based on user role
        if ($user->hasRole('Student')) {
            return redirect()->intended(route('student.dashboard'));
        } elseif ($user->hasRole('Teacher')) {
            return redirect()->intended(route('teacher.dashboard'));
        } elseif ($user->hasRole('Parent')) {
            return redirect()->intended(route('parent.dashboard'));
        }

        // Default dashboard for Admin, Principal, etc.
        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        logActivity('logout', 'User logged out');

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function logoutAllDevices(Request $request)
    {
        $user = Auth::user();

        logActivity('logout_all_devices', 'User logged out from all devices');

        // Invalidate all sessions for this user
        $user->invalidateAllSessions();

        return redirect()->route('login')->with('message', 'You have been logged out from all devices.');
    }
}
