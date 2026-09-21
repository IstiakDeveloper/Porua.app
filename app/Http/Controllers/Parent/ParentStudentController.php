<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentStudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $children = Student::where('parent_id', $parent->id)
            ->with(['class', 'section'])
            ->get();

        return Inertia::render('Parent/Children/Index', [
            'children' => $children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'admission_number' => $child->admission_number,
                    'roll_number' => $child->roll_number,
                    'photo' => $child->photo,
                    'date_of_birth' => $child->date_of_birth,
                    'gender' => $child->gender,
                    'class_name' => $child->class->name ?? 'N/A',
                    'section_name' => $child->section->name ?? 'N/A',
                    'phone' => $child->phone,
                    'email' => $child->email,
                ];
            }),
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $student = Student::where('parent_id', $parent->id)
            ->with(['class', 'section'])
            ->findOrFail($id);

        // Get attendance summary
        $attendanceSummary = \App\Models\StudentAttendance::where('student_id', $student->id)
            ->whereYear('attendance_date', now()->year)
            ->get();

        $attendanceStats = [
            'present' => $attendanceSummary->where('status', 'present')->count(),
            'absent' => $attendanceSummary->where('status', 'absent')->count(),
            'late' => $attendanceSummary->where('status', 'late')->count(),
            'total_days' => $attendanceSummary->count(),
        ];

        // Get recent results
        $recentResults = \App\Models\Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->with('exam')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get fee summary
        $outstanding = \App\Models\FeeCollection::where('student_id', $student->id)->outstanding()->get();
        $feeStats = [
            'total_paid' => \App\Models\FeeCollection::where('student_id', $student->id)->where('status', 'paid')->sum('paid_amount'),
            'total_due' => $outstanding->sum(fn ($fee) => $fee->remaining),
            'overdue_count' => $outstanding->where('status', 'overdue')->count(),
        ];

        return Inertia::render('Parent/Children/Show', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'photo' => $student->photo,
                'date_of_birth' => $student->date_of_birth,
                'gender' => $student->gender,
                'phone' => $student->phone,
                'email' => $student->email,
                'address' => $student->address,
                'class_name' => $student->class->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'blood_group' => $student->blood_group,
                'medical_conditions' => $student->medical_conditions,
            ],
            'attendanceStats' => $attendanceStats,
            'recentResults' => $recentResults->map(function ($result) {
                return [
                    'exam_name' => $result->exam->name ?? 'N/A',
                    'total_marks' => $result->total_marks,
                    'obtained_marks' => $result->obtained_marks,
                    'percentage' => $result->percentage,
                    'grade' => $result->grade,
                    'gpa' => $result->gpa,
                ];
            }),
            'feeStats' => $feeStats,
        ]);
    }
}
