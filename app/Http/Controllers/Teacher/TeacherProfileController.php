<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class TeacherProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::with(['subjects.class', 'subjects.section', 'user'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        return Inertia::render('Teacher/Profile', [
            'teacher' => [
                'id' => $teacher->id,
                'full_name' => $teacher->full_name,
                'employee_id' => $teacher->employee_id,
                'phone' => $teacher->phone,
                'email' => $teacher->email,
                'photo' => $teacher->photo,
                'date_of_birth' => $teacher->date_of_birth,
                'gender' => $teacher->gender,
                'address' => $teacher->address,
                'city' => $teacher->city,
                'state' => $teacher->state,
                'postal_code' => $teacher->postal_code,
                'country' => $teacher->country,
                'designation' => $teacher->designation,
                'department' => $teacher->department,
                'qualification' => $teacher->qualification,
                'experience_years' => $teacher->experience_years,
                'joining_date' => $teacher->joining_date,
                'employment_status' => $teacher->employment_status,
                'bank_name' => $teacher->bank_name,
                'bank_account_number' => $teacher->bank_account_number,
                'basic_salary' => $teacher->basic_salary,
                'subjects' => $teacher->subjects->map(function ($teacherSubject) {
                    return [
                        'id' => $teacherSubject->subject->id ?? null,
                        'name' => $teacherSubject->subject->name ?? 'N/A',
                        'class' => $teacherSubject->schoolClass->name ?? 'N/A',
                        'section' => $teacherSubject->section->name ?? 'N/A',
                    ];
                }),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        $teacher->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePhoto(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'photo' => ['required', 'image', 'max:2048'], // 2MB max
        ]);

        // Delete old photo if exists
        if ($teacher->photo) {
            Storage::disk('public')->delete($teacher->photo);
        }

        // Store new photo
        $path = $request->file('photo')->store('teachers/photos', 'public');

        $teacher->update(['photo' => $path]);

        return redirect()->back()->with('success', 'Profile photo updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('success', 'Password updated successfully.');
    }
}
