<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamScheduleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $schedules = ExamSchedule::with(['exam', 'schoolClass', 'subject'])
            ->when($request->exam_id, fn($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->orderBy('exam_date')
            ->orderBy('start_time')
            ->paginate(50)->withQueryString();

        return Inertia::render('Exams/Schedules/Index', [
            'schedules' => $schedules,
            'filters' => $request->only(['exam_id', 'class_id']),
            'exams' => Exam::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_exams');

        return Inertia::render('Exams/Schedules/Create', [
            'exams' => Exam::where('status', '!=', 'completed')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'room_number' => 'nullable|string|max:50',
            'instructions' => 'nullable|string',
        ]);

        // Map 'date' to 'exam_date' for database
        $validated['exam_date'] = $validated['date'];
        unset($validated['date']);

        $schedule = ExamSchedule::create($validated);

        logActivity('create', "Created exam schedule", ExamSchedule::class, $schedule->id);

        return redirect()->route('exam-schedules.index')
            ->with('success', 'Exam schedule created successfully');
    }

    public function show(ExamSchedule $examSchedule)
    {
        $this->authorize('manage_exams');

        $examSchedule->load(['exam', 'schoolClass', 'subject']);

        return Inertia::render('Exams/Schedules/Show', [
            'schedule' => $examSchedule,
        ]);
    }

    public function edit(ExamSchedule $examSchedule)
    {
        $this->authorize('manage_exams');

        $examSchedule->load(['exam', 'schoolClass', 'subject']);

        return Inertia::render('Exams/Schedules/Edit', [
            'schedule' => $examSchedule,
            'exams' => Exam::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, ExamSchedule $examSchedule)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'room_number' => 'nullable|string|max:50',
            'instructions' => 'nullable|string',
        ]);

        // Map 'date' to 'exam_date' for database
        $validated['exam_date'] = $validated['date'];
        unset($validated['date']);

        $examSchedule->update($validated);

        logActivity('update', "Updated exam schedule", ExamSchedule::class, $examSchedule->id);

        return redirect()->route('exam-schedules.index')
            ->with('success', 'Exam schedule updated successfully');
    }

    public function destroy(ExamSchedule $examSchedule)
    {
        $this->authorize('manage_exams');

        $examSchedule->delete();

        logActivity('delete', "Deleted exam schedule", ExamSchedule::class, $examSchedule->id);

        return redirect()->route('exam-schedules.index')
            ->with('success', 'Exam schedule deleted successfully');
    }
}
