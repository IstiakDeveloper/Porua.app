<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Support\ParentPortal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ParentProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);
        $children = ParentPortal::children($parent);

        return Inertia::render('Parent/Profile', [
            'parent' => [
                'id' => $parent->id,
                'father_name' => $parent->father_name ?? $user->name,
                'father_occupation' => $parent->father_occupation ?? '',
                'father_phone' => $parent->father_phone ?? '',
                'mother_name' => $parent->mother_name ?? '',
                'mother_occupation' => $parent->mother_occupation ?? '',
                'mother_phone' => $parent->mother_phone ?? '',
                'phone' => $parent->phone ?? $user->phone ?? '',
                'email' => $parent->email ?? $user->email,
                'address' => $parent->address ?? '',
                'photo' => ParentPortal::photoUrl($parent->photo),
            ],
            'children' => $children->map(fn ($child) => ParentPortal::childOption($child))->values(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'father_phone' => ['nullable', 'string', 'max:20'],
            'mother_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $parent->update([
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'father_phone' => $validated['father_phone'] ?? null,
            'mother_phone' => $validated['mother_phone'] ?? null,
        ]);

        // Keep user model in sync
        $user->update([
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ]);

        return redirect()->route('parent.profile.show')->with('success', 'Profile updated successfully.');
    }

    public function updatePhoto(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        // Delete old photo if exists
        if ($parent->photo) {
            Storage::disk('public')->delete($parent->photo);
        }

        $path = $request->file('photo')->store('parents', 'public');
        $parent->update(['photo' => $path]);

        return redirect()->route('parent.profile.show')->with('success', 'Photo updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Password updated successfully. You have been logged out from all devices. Please log in with your new password.');
    }
}
