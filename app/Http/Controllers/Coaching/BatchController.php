<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_batches');

        $query = Batch::with(['course', 'teacher'])
            ->withCount(['enrollments', 'activeEnrollments']);

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->input('course_id'));
        }

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->input('teacher_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('room_no', 'like', "%{$search}%")
                    ->orWhereHas('course', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $batches = $query->latest()->paginate(15)->withQueryString();
        $courses = Course::where('status', 'active')->orderBy('name')->get();
        $teachers = Teacher::where('status', 'active')->orderBy('first_name')->get();

        return Inertia::render('Coaching/Batches/Index', [
            'batches' => $batches,
            'courses' => $courses,
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'course_id', 'teacher_id', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create_batches');

        $courses = Course::where('status', 'active')->orderBy('name')->get();
        $teachers = Teacher::where('status', 'active')->orderBy('first_name')->get();

        return Inertia::render('Coaching/Batches/Create', [
            'courses' => $courses,
            'teachers' => $teachers,
            'selectedCourseId' => $request->input('course_id'),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_batches');

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'room_no' => 'nullable|string|max:100',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'string|in:Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'max_capacity' => 'required|integer|min:1',
            'remuneration_type' => 'nullable|in:none,percentage,per_class,fixed',
            'teacher_commission_rate' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,completed,upcoming,cancelled',
            'notes' => 'nullable|string',
        ]);

        $batch = Batch::create($validated);

        logActivity('create', "Created batch: {$batch->name}", Batch::class, $batch->id);

        return redirect()->route('batches.show', $batch->id)->with('success', 'Batch created successfully');
    }

    public function show(Batch $batch, Request $request)
    {
        $this->authorize('view_batches');

        $batch->load(['course.academicYear', 'teacher']);
        $batch->loadCount(['enrollments', 'activeEnrollments']);

        $enrollmentsQuery = $batch->enrollments()
            ->with(['student.academicYear', 'student.schoolClass', 'student.section'])
            ->latest();

        if ($request->filled('enrollment_status')) {
            $enrollmentsQuery->where('status', $request->input('enrollment_status'));
        }

        if ($request->filled('student_search')) {
            $search = $request->input('student_search');
            $enrollmentsQuery->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('roll_number', 'like', "%{$search}%");
            });
        }

        $enrollments = $enrollmentsQuery->paginate(20)->withQueryString();

        // Enrolled student IDs to exclude from quick enroll picker
        $enrolledStudentIds = $batch->enrollments()->pluck('student_id')->toArray();
        $availableStudents = Student::where('status', 'active')
            ->whereNotIn('id', $enrolledStudentIds)
            ->select('id', 'first_name', 'last_name', 'student_id', 'roll_number', 'phone')
            ->orderBy('first_name')
            ->take(100)
            ->get();

        return Inertia::render('Coaching/Batches/Show', [
            'batch' => $batch,
            'enrollments' => $enrollments,
            'availableStudents' => $availableStudents,
            'filters' => $request->only(['student_search', 'enrollment_status']),
        ]);
    }

    public function edit(Batch $batch)
    {
        $this->authorize('edit_batches');

        $courses = Course::where('status', 'active')->orderBy('name')->get();
        $teachers = Teacher::where('status', 'active')->orderBy('first_name')->get();

        return Inertia::render('Coaching/Batches/Edit', [
            'batch' => $batch,
            'courses' => $courses,
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, Batch $batch)
    {
        $this->authorize('edit_batches');

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'room_no' => 'nullable|string|max:100',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'string|in:Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'max_capacity' => 'required|integer|min:1',
            'remuneration_type' => 'nullable|in:none,percentage,per_class,fixed',
            'teacher_commission_rate' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,completed,upcoming,cancelled',
            'notes' => 'nullable|string',
        ]);

        $batch->update($validated);

        logActivity('update', "Updated batch: {$batch->name}", Batch::class, $batch->id);

        return redirect()->route('batches.show', $batch->id)->with('success', 'Batch updated successfully');
    }

    public function destroy(Batch $batch)
    {
        $this->authorize('delete_batches');

        if ($batch->enrollments()->exists()) {
            return back()->with('error', 'Cannot delete batch with student enrollments. Please drop or remove enrollments first.');
        }

        $batchName = $batch->name;
        $batch->delete();

        logActivity('delete', "Deleted batch: {$batchName}", Batch::class);

        return redirect()->route('batches.index')->with('success', 'Batch deleted successfully');
    }
}
