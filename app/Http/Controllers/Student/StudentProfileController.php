<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Models\Student;

class StudentProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        $student = Student::with([
            'academicYear',
            'schoolClass',
            'section',
            'user',
            'parents'
        ])->where('user_id', $user->id)->firstOrFail();

        return Inertia::render('Student/Profile', [
            'student' => [
                'id' => $student->id,
                'user_id' => $student->user_id,

                // Personal Information
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'first_name_bengali' => $student->first_name_bengali,
                'last_name_bengali' => $student->last_name_bengali,
                'date_of_birth' => $student->date_of_birth?->format('Y-m-d'),
                'gender' => $student->gender,
                'blood_group' => $student->blood_group,
                'birth_certificate_no' => $student->birth_certificate_no,
                'religion' => $student->religion,
                'nationality' => $student->nationality,

                // Contact Information
                'phone' => $student->phone,
                'email' => $student->email,
                'present_address' => $student->present_address,
                'permanent_address' => $student->permanent_address,
                'city' => $student->city,
                'state' => $student->state,
                'postal_code' => $student->postal_code,

                // Academic Information
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'academic_year' => $student->academicYear->name ?? 'N/A',
                'admission_date' => $student->admission_date?->format('d M Y'),

                // Guardian Information
                'father_name' => $student->father_name,
                'father_phone' => $student->father_phone,
                'mother_name' => $student->mother_name,
                'mother_phone' => $student->mother_phone,
                'guardian_name' => $student->guardian_name,
                'guardian_phone' => $student->guardian_phone,
                'guardian_relation' => $student->guardian_relation,

                // Medical Information
                'medical_conditions' => $student->medical_conditions,
                'allergies' => $student->allergies,

                // Photo
                'photo_url' => $student->photo_url,

                // Previous School
                'previous_school' => $student->previous_school,
                'previous_class' => $student->previous_class,

                // Status
                'status' => $student->status,
            ],
            'parents' => $student->parents->map(function($parent) {
                return [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'relation' => $parent->relation,
                    'phone' => $parent->phone,
                    'email' => $parent->email,
                    'occupation' => $parent->occupation,
                    'is_primary_contact' => $parent->is_primary_contact,
                ];
            }),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Validate only fields students can update
        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'present_address' => 'nullable|string|max:500',
            'medical_conditions' => 'nullable|string|max:1000',
            'allergies' => 'nullable|string|max:500',
        ]);

        $student->update($validated);

        // Update user email if provided
        if ($request->has('email') && $request->email) {
            $user->update(['email' => $request->email]);
        }

        return back()->with('success', 'Profile updated successfully!');
    }

    public function updatePhoto(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Delete old photo if exists
        if ($student->photo) {
            Storage::disk('public')->delete($student->photo);
        }

        // Store new photo
        $path = $request->file('photo')->store('students/photos', 'public');

        $student->update(['photo' => $path]);

        // Also update user avatar
        $user->update(['avatar' => $path]);

        return back()->with('success', 'Photo updated successfully!');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect']);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password changed successfully!');
    }
}
