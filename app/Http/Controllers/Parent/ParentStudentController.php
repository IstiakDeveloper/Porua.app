<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\FeeCollection;
use App\Models\Result;
use App\Models\StudentAttendance;
use App\Support\ParentPortal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentStudentController extends Controller
{
    public function index()
    {
        return redirect()->route('parent.dashboard');
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);
        $children = ParentPortal::children($parent);
        $student = $children->firstWhere('id', (int) $id);

        if (! $student) {
            abort(404);
        }

        $attendanceSummary = StudentAttendance::where('student_id', $student->id)
            ->whereYear('date', now()->year)
            ->get();

        $attendanceStats = [
            'present' => $attendanceSummary->where('status', 'present')->count(),
            'absent' => $attendanceSummary->where('status', 'absent')->count(),
            'late' => $attendanceSummary->where('status', 'late')->count(),
            'total_days' => $attendanceSummary->count(),
        ];

        $recentResults = Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->with('exam')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $outstanding = FeeCollection::where('student_id', $student->id)->outstanding()->get();
        $feeStats = [
            'total_paid' => (float) FeeCollection::where('student_id', $student->id)->where('status', 'paid')->sum('paid_amount'),
            'total_due' => (float) $outstanding->sum(fn ($fee) => $fee->remaining),
            'overdue_count' => $outstanding->where('status', 'overdue')->count(),
        ];

        $dob = $student->date_of_birth;
        $dobValue = $dob instanceof \DateTimeInterface ? $dob->format('Y-m-d') : ($dob ?: null);

        return Inertia::render('Parent/Children/Show', [
            'student' => [
                ...ParentPortal::childOption($student),
                'date_of_birth' => $dobValue,
                'gender' => $student->gender,
                'phone' => $student->phone,
                'email' => $student->email,
                'address' => $student->present_address ?: $student->permanent_address,
                'blood_group' => $student->blood_group,
                'medical_conditions' => $student->medical_conditions,
            ],
            'attendanceStats' => $attendanceStats,
            'recentResults' => $recentResults->map(function ($result) {
                return [
                    'id' => $result->id,
                    'exam_name' => $result->exam->name ?? 'N/A',
                    'total_marks' => $result->total_marks,
                    'obtained_marks' => $result->obtained_marks,
                    'percentage' => $result->percentage,
                    'grade' => $result->grade,
                    'gpa' => $result->gpa,
                ];
            }),
            'feeStats' => $feeStats,
            'todayClass' => ParentPortal::todayClass($student),
            'issuedBooks' => ParentPortal::issuedBooks($student),
        ]);
    }
}
