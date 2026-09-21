<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ParentProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)
            ->with('children.class', 'children.section')
            ->firstOrFail();

        return Inertia::render('Parent/Profile', [
            'parent' => [
                'id' => $parent->id,
                'father_name' => $parent->father_name,
                'father_occupation' => $parent->father_occupation,
                'father_phone' => $parent->father_phone,
                'mother_name' => $parent->mother_name,
                'mother_occupation' => $parent->mother_occupation,
                'mother_phone' => $parent->mother_phone,
                'phone' => $parent->phone,
                'email' => $parent->email,
                'address' => $parent->address,
                'city' => $parent->city,
                'state' => $parent->state,
                'postal_code' => $parent->postal_code,
                'photo' => $parent->photo,
            ],
            'children' => $parent->children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'admission_number' => $child->admission_number,
                    'photo' => $child->photo,
                    'class_name' => $child->class->name ?? 'N/A',
                    'section_name' => $child->section->name ?? 'N/A',
                ];
            }),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'father_phone' => 'nullable|string|max:20',
            'mother_phone' => 'nullable|string|max:20',
        ]);

        $parent->update($validated);

        return redirect()->route('parent.profile.show')->with('success', 'Profile updated successfully.');
    }

    public function updatePhoto(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
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

        return redirect()->route('parent.profile.show')->with('success', 'Password updated successfully.');
    }
}
