<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherStudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        // Get assigned sections
        $assignedSections = $teacher->subjects()
            ->with(['schoolClass', 'section.schoolClass'])
            ->get()
            ->pluck('section')
            ->unique('id')
            ->values();

        return Inertia::render('Teacher/Students/Index', [
            'sections' => $assignedSections->map(function ($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'class_name' => $section->schoolClass->name ?? 'N/A',
                    'student_count' => $section->students()->count(),
                ];
            }),
        ]);
    }

    public function list(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $sectionId = $request->input('section_id');
        $search = $request->input('search', '');

        // Verify access
        $hasAccess = $teacher->subjects()->whereHas('section', function ($query) use ($sectionId) {
            $query->where('id', $sectionId);
        })->exists();

        if (!$hasAccess) {
            abort(403, 'Unauthorized access.');
        }

        $section = \App\Models\Section::with('schoolClass')->findOrFail($sectionId);

        $students = Student::where('section_id', $sectionId)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('admission_number', 'like', "%{$search}%")
                        ->orWhere('roll_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('roll_number')
            ->get();

        return Inertia::render('Teacher/Students/List', [
            'section' => [
                'id' => $section->id,
                'name' => $section->name,
                'class_name' => $section->schoolClass->name ?? 'N/A',
            ],
            'students' => $students->map(function ($student) {
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'admission_number' => $student->admission_number,
                    'roll_number' => $student->roll_number,
                    'photo' => $student->photo,
                    'date_of_birth' => $student->date_of_birth,
                    'gender' => $student->gender,
                    'phone' => $student->phone,
                    'email' => $student->email,
                    'guardian_name' => $student->guardian_name,
                    'guardian_phone' => $student->guardian_phone,
                ];
            }),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $student = Student::with(['class', 'section', 'parent'])->findOrFail($id);

        // Verify teacher has access to this student's section
        $hasAccess = $teacher->subjects()->whereHas('section', function ($query) use ($student) {
            $query->where('id', $student->section_id);
        })->exists();

        if (!$hasAccess) {
            abort(403, 'Unauthorized access to this student.');
        }

        // Get student attendance summary
        $attendanceSummary = \App\Models\StudentAttendance::where('student_id', $student->id)
            ->whereYear('date', now()->year)
            ->get();

        $attendanceStats = [
            'present' => $attendanceSummary->where('status', 'present')->count(),
            'absent' => $attendanceSummary->where('status', 'absent')->count(),
            'late' => $attendanceSummary->where('status', 'late')->count(),
            'total_days' => $attendanceSummary->count(),
        ];

        // Get recent exam results
        $recentResults = \App\Models\Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->with('exam')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Teacher/Students/Show', [
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
                'city' => $student->city,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'guardian_name' => $student->guardian_name,
                'guardian_phone' => $student->guardian_phone,
                'guardian_email' => $student->guardian_email,
                'guardian_relation' => $student->guardian_relation,
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
        ]);
    }
}
