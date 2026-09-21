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
                ->whereHas('roles', fn($q) => $q->whereIn('slug', ['super-admin', 'super_admin']))
                ->exists();

        if (!$isSetupCompleted) {
            return redirect()->route('onboarding.wizard');
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $remember = $credentials['remember'] ?? false;
        unset($credentials['remember']);

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        $request->session()->regenerate();

        // Update last login
        Auth::user()->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        logActivity('login', 'User logged in successfully');

        // Redirect based on user role
        $user = Auth::user();

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
