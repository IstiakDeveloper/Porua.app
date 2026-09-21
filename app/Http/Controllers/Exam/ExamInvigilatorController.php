<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\ExamInvigilator;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\ExamHall;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamInvigilatorController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $invigilators = ExamInvigilator::with(['exam', 'teacher.user', 'examSchedule.subject', 'examHall'])
            ->when($request->exam_id, fn($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->teacher_id, fn($q) => $q->where('teacher_id', $request->teacher_id))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Exams/Invigilators/Index', [
            'invigilators' => $invigilators,
            'filters' => $request->only(['exam_id', 'teacher_id']),
            'exams' => Exam::all(),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
            'halls' => ExamHall::where('status', 'active')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_exams');

        return Inertia::render('Exams/Invigilators/Create', [
            'exams' => Exam::where('status', '!=', 'completed')->get(),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
            'halls' => ExamHall::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'teacher_id' => 'required|exists:teachers,id',
            'exam_schedule_id' => 'nullable|exists:exam_schedules,id',
            'hall_id' => 'nullable|exists:exam_halls,id',
            'duty_date' => 'required|date',
            'duty_time' => 'required|date_format:H:i',
            'remarks' => 'nullable|string',
        ]);

        $invigilator = ExamInvigilator::create($validated);

        logActivity('create', "Assigned invigilator duty", ExamInvigilator::class, $invigilator->id);

        return redirect()->route('exam-invigilators.index')
            ->with('success', 'Invigilator assigned successfully');
    }

    public function edit(ExamInvigilator $examInvigilator)
    {
        $this->authorize('manage_exams');

        $examInvigilator->load(['exam', 'teacher.user', 'examSchedule', 'examHall']);

        return Inertia::render('Exams/Invigilators/Edit', [
            'invigilator' => $examInvigilator,
            'exams' => Exam::all(),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
            'halls' => ExamHall::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, ExamInvigilator $examInvigilator)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'teacher_id' => 'required|exists:teachers,id',
            'exam_schedule_id' => 'nullable|exists:exam_schedules,id',
            'hall_id' => 'nullable|exists:exam_halls,id',
            'duty_date' => 'required|date',
            'duty_time' => 'required|date_format:H:i',
            'remarks' => 'nullable|string',
        ]);

        $examInvigilator->update($validated);

        logActivity('update', "Updated invigilator duty", ExamInvigilator::class, $examInvigilator->id);

        return redirect()->route('exam-invigilators.index')
            ->with('success', 'Invigilator updated successfully');
    }

    public function destroy(ExamInvigilator $examInvigilator)
    {
        $this->authorize('manage_exams');

        $examInvigilator->delete();

        logActivity('delete', "Deleted invigilator duty", ExamInvigilator::class, $examInvigilator->id);

        return redirect()->route('exam-invigilators.index')
            ->with('success', 'Invigilator deleted successfully');
    }

    public function schedule(Request $request)
    {
        $this->authorize('manage_exams');

        $schedules = ExamSchedule::with(['exam', 'subject', 'invigilators.teacher.user'])
            ->where('exam_id', $request->exam_id)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Exams/Invigilators/Schedule', [
            'schedules' => $schedules,
            'exam' => Exam::find($request->exam_id),
        ]);
    }
}
