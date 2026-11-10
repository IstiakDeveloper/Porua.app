<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Student;
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
        $parent = StudentParent::firstOrCreate(
            ['user_id' => $user->id],
            [
                'father_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
            ]
        );

        $children = Student::where('parent_id', $parent->id)
            ->orWhereHas('parents', fn($q) => $q->where('student_parents.id', $parent->id))
            ->with(['schoolClass', 'section'])
            ->get();

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
                'city' => '',
                'state' => '',
                'postal_code' => '',
                'photo' => $parent->photo,
            ],
            'children' => $children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'admission_number' => $child->admission_number,
                    'photo' => $child->photo,
                    'class_name' => $child->schoolClass->name ?? 'N/A',
                    'section_name' => $child->section->name ?? 'N/A',
                ];
            }),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::firstOrCreate(
            ['user_id' => $user->id],
            [
                'father_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
            ]
        );

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
        $parent = StudentParent::firstOrCreate(
            ['user_id' => $user->id],
            [
                'father_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
            ]
        );

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

        if (!Hash::check($validated['current_password'], $user->password)) {
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
