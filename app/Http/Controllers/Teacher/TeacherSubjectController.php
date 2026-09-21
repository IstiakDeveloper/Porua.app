<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TeacherSubject;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherSubjectController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_teachers');

        $assignments = TeacherSubject::with(['teacher.user', 'subject', 'schoolClass', 'section'])
            ->when($request->teacher_id, fn($q) => $q->where('teacher_id', $request->teacher_id))
            ->when($request->subject_id, fn($q) => $q->where('subject_id', $request->subject_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->latest()
            ->paginate(20)->withQueryString();

        // Ensure all relationships are properly loaded and transform to match frontend expectations
        $transformedAssignments = $assignments->getCollection()->map(function ($assignment) {
            try {
                // Load missing relationships if needed
                if (!$assignment->relationLoaded('teacher')) {
                    $assignment->load('teacher.user');
                }
                if (!$assignment->relationLoaded('subject')) {
                    $assignment->load('subject');
                }
                if (!$assignment->relationLoaded('schoolClass')) {
                    $assignment->load('schoolClass');
                }
                if (!$assignment->relationLoaded('section')) {
                    $assignment->load('section');
                }

                return [
                    'id' => $assignment->id,
                    'teacher' => $assignment->teacher ? [
                        'id' => $assignment->teacher->id,
                        'employee_id' => $assignment->teacher->employee_id,
                        'user' => $assignment->teacher->user ? [
                            'name' => $assignment->teacher->user->name,
                            'email' => $assignment->teacher->user->email,
                        ] : null
                    ] : null,
                    'subject' => $assignment->subject ? [
                        'id' => $assignment->subject->id,
                        'name' => $assignment->subject->name,
                        'code' => $assignment->subject->code,
                    ] : null,
                    'schoolClass' => $assignment->schoolClass ? [
                        'id' => $assignment->schoolClass->id,
                        'name' => $assignment->schoolClass->name,
                    ] : null,
                    'section' => $assignment->section ? [
                        'id' => $assignment->section->id,
                        'name' => $assignment->section->name,
                    ] : null,
                ];
            } catch (\Exception $e) {
                \Log::error('Error transforming assignment: ' . $e->getMessage(), ['assignment_id' => $assignment->id ?? 'unknown']);
                return null;
            }
        })->filter(); // Remove null entries

        // Replace collection with transformed data
        $assignments->setCollection($transformedAssignments);

        return Inertia::render('Teachers/Subjects/Index', [
            'assignments' => $assignments,
            'filters' => $request->only(['teacher_id', 'subject_id', 'class_id']),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'sections' => Section::where('status', 'active')->get(),
            'currentAcademicYear' => AcademicYear::where('is_current', true)->first(),
        ]);
    }

    public function create()
    {
        $this->authorize('create_teachers');

        return Inertia::render('Teachers/Subjects/Create', [
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'sections' => Section::where('status', 'active')->get(),
            'currentAcademicYear' => AcademicYear::where('is_current', true)->first(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_teachers');

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'exists:classes,id',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'exists:sections,id',
        ]);

        // Get current academic year
        $currentAcademicYear = AcademicYear::where('is_current', true)->first();
        if (!$currentAcademicYear) {
            return back()->withInput()->with('error', 'No active academic year found. Please set an active academic year first.');
        }

        $assignedCount = 0;
        $duplicateCount = 0;

        // Create assignments for each combination of class, subject, and section
        foreach ($validated['class_ids'] as $classId) {
            // Get sections for this class or use null if no sections selected
            $sectionsForClass = isset($validated['section_ids']) && count($validated['section_ids']) > 0
                ? Section::whereIn('id', $validated['section_ids'])->where('class_id', $classId)->pluck('id')->toArray()
                : [null];

            // If no sections selected for this class, assign to all sections of the class
            if (empty($sectionsForClass) || (count($sectionsForClass) === 1 && $sectionsForClass[0] === null)) {
                $sectionsForClass = [null]; // null means all sections
            }

            foreach ($validated['subject_ids'] as $subjectId) {
                foreach ($sectionsForClass as $sectionId) {
                    // Check if assignment already exists
                    $exists = TeacherSubject::where('teacher_id', $validated['teacher_id'])
                        ->where('subject_id', $subjectId)
                        ->where('class_id', $classId)
                        ->where('section_id', $sectionId)
                        ->where('academic_year_id', $currentAcademicYear->id)
                        ->exists();

                    if (!$exists) {
                        $assignment = TeacherSubject::create([
                            'teacher_id' => $validated['teacher_id'],
                            'subject_id' => $subjectId,
                            'class_id' => $classId,
                            'section_id' => $sectionId,
                            'academic_year_id' => $currentAcademicYear->id,
                        ]);

                        logActivity('create', "Assigned subject to teacher", TeacherSubject::class, $assignment->id);
                        $assignedCount++;
                    } else {
                        $duplicateCount++;
                    }
                }
            }
        }

        $message = "{$assignedCount} assignment(s) created successfully";
        if ($duplicateCount > 0) {
            $message .= " ({$duplicateCount} duplicate(s) skipped)";
        }

        return redirect()->route('teacher-subjects.index')
            ->with('success', $message);
    }

    public function destroy(TeacherSubject $teacherSubject)
    {
        $this->authorize('delete_teachers');

        $teacherSubject->delete();

        logActivity('delete', "Removed subject assignment", TeacherSubject::class, $teacherSubject->id);

        return back()->with('success', 'Subject assignment removed successfully');
    }

    public function teacherSchedule(Teacher $teacher)
    {
        $this->authorize('view_teachers');

        $assignments = TeacherSubject::with(['subject', 'schoolClass', 'section'])
            ->where('teacher_id', $teacher->id)
            ->get();

        return Inertia::render('Teachers/Subjects/Schedule', [
            'teacher' => $teacher->load('user'),
            'assignments' => $assignments,
        ]);
    }
}
