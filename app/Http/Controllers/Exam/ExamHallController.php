<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\ExamHall;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamHallController extends Controller
{
    public function index()
    {
        $this->authorize('manage_exams');

        $halls = ExamHall::latest()->get();

        return Inertia::render('Exams/Halls/Index', [
            'halls' => $halls,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:exam_halls',
            'capacity' => 'required|integer|min:1',
            'location' => 'nullable|string|max:255',
            'facilities' => 'nullable|string',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        $hall = ExamHall::create($validated);

        logActivity('create', "Created exam hall: {$hall->name}", ExamHall::class, $hall->id);

        return back()->with('success', 'Exam hall created successfully');
    }

    public function update(Request $request, ExamHall $examHall)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:exam_halls,code,' . $examHall->id,
            'capacity' => 'required|integer|min:1',
            'location' => 'nullable|string|max:255',
            'facilities' => 'nullable|string',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        $examHall->update($validated);

        logActivity('update', "Updated exam hall: {$examHall->name}", ExamHall::class, $examHall->id);

        return back()->with('success', 'Exam hall updated successfully');
    }

    public function destroy(ExamHall $examHall)
    {
        $this->authorize('manage_exams');

        $hallName = $examHall->name;
        $examHall->delete();

        logActivity('delete', "Deleted exam hall: {$hallName}", ExamHall::class, $examHall->id);

        return back()->with('success', 'Exam hall deleted successfully');
    }
}
