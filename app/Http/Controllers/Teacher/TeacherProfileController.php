<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Services\LeaveAttendanceSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class TeacherProfileController extends Controller
{
    public function show(Request $request, LeaveAttendanceSyncService $syncService)
    {
        $user = $request->user();
        $teacher = Teacher::with(['subjects.class', 'subjects.section', 'user'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $leaveBalances = $syncService->getTeacherLeaveBalances($teacher->id);
        $recentLeaves = LeaveApplication::with('leaveType')
            ->where('teacher_id', $teacher->id)
            ->latest('id')
            ->limit(5)
            ->get();
        $leaveTypes = LeaveType::active()->get();

        return Inertia::render('Teacher/Profile', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $teacher->phone,
                'designation' => $teacher->designation,
                'department' => $teacher->department,
                'qualification' => $teacher->qualification,
                'experience_years' => $teacher->experience_years,
                'joining_date' => $teacher->joining_date,
                'date_of_birth' => $teacher->date_of_birth,
                'gender' => $teacher->gender,
                'blood_group' => $teacher->blood_group,
                'religion' => $teacher->religion,
                'present_address' => $teacher->present_address,
                'permanent_address' => $teacher->permanent_address,
                'photo' => $teacher->photo ? Storage::url($teacher->photo) : null,
                'status' => $teacher->status,
                'employee_id' => $teacher->employee_id,
                'subjects' => $teacher->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'code' => $subject->code,
                        'class_name' => $subject->class->name ?? 'N/A',
                        'section_name' => $subject->section->name ?? 'All Sections',
                    ];
                }),
            ],
            'leaveBalances' => $leaveBalances,
            'recentLeaves' => $recentLeaves,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'present_address' => ['nullable', 'string', 'max:500'],
            'permanent_address' => ['nullable', 'string', 'max:500'],
            'blood_group' => ['nullable', 'string', 'max:10'],
            'religion' => ['nullable', 'string', 'max:50'],
        ]);

        $teacher->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        // Delete old photo if exists
        if ($teacher->photo && Storage::disk('public')->exists($teacher->photo)) {
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

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Password updated successfully. You have been logged out from all devices. Please log in with your new password.');
    }
}
