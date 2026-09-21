<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_courses');

        $query = Course::with(['academicYear'])
            ->withCount(['batches', 'activeBatches']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $courses = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Coaching/Courses/Index', [
            'courses' => $courses,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $this->authorize('create_courses');

        $academicYears = AcademicYear::where('status', 'active')->get();
        $currentAcademicYear = AcademicYear::where('is_current', true)->first();

        return Inertia::render('Coaching/Courses/Create', [
            'academicYears' => $academicYears,
            'currentAcademicYearId' => $currentAcademicYear?->id,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_courses');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'fee_type' => 'required|in:monthly,one_time',
            'standard_fee' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $course = Course::create($validated);

        logActivity('create', "Created course: {$course->name}", Course::class, $course->id);

        return redirect()->route('courses.index')->with('success', 'Course created successfully');
    }

    public function edit(Course $course)
    {
        $this->authorize('edit_courses');

        $academicYears = AcademicYear::where('status', 'active')->get();

        return Inertia::render('Coaching/Courses/Edit', [
            'course' => $course,
            'academicYears' => $academicYears,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $this->authorize('edit_courses');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'fee_type' => 'required|in:monthly,one_time',
            'standard_fee' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $course->update($validated);

        logActivity('update', "Updated course: {$course->name}", Course::class, $course->id);

        return redirect()->route('courses.index')->with('success', 'Course updated successfully');
    }

    public function destroy(Course $course)
    {
        $this->authorize('delete_courses');

        if ($course->batches()->exists()) {
            return back()->with('error', 'Cannot delete course with associated batches. Please delete or reassign batches first.');
        }

        $courseName = $course->name;
        $course->delete();

        logActivity('delete', "Deleted course: {$courseName}", Course::class);

        return redirect()->route('courses.index')->with('success', 'Course deleted successfully');
    }
}
