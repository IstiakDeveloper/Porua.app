<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\GradeSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GradeSettingController extends Controller
{
    public function index()
    {
        $this->authorize('manage_exams');

        $grades = GradeSetting::orderBy('min_marks', 'desc')->get();

        return Inertia::render('Exams/Grades/Index', [
            'grades' => $grades,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'grade_name' => 'required|string|max:10',
            'grade_point' => 'required|numeric|min:0|max:5',
            'min_marks' => 'required|numeric|min:0|max:100',
            'max_marks' => 'required|numeric|min:0|max:100|gte:min_marks',
            'remarks' => 'nullable|string|max:255',
        ]);

        GradeSetting::create($validated);

        logActivity('create', "Created grade setting: {$validated['grade_name']}", GradeSetting::class);

        return back()->with('success', 'Grade setting created successfully');
    }

    public function update(Request $request, GradeSetting $gradeSetting)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'grade_name' => 'required|string|max:10',
            'grade_point' => 'required|numeric|min:0|max:5',
            'min_marks' => 'required|numeric|min:0|max:100',
            'max_marks' => 'required|numeric|min:0|max:100|gte:min_marks',
            'remarks' => 'nullable|string|max:255',
        ]);

        $gradeSetting->update($validated);

        logActivity('update', "Updated grade setting: {$validated['grade_name']}", GradeSetting::class, $gradeSetting->id);

        return back()->with('success', 'Grade setting updated successfully');
    }

    public function destroy(GradeSetting $gradeSetting)
    {
        $this->authorize('manage_exams');

        $gradeSetting->delete();

        logActivity('delete', "Deleted grade setting", GradeSetting::class, $gradeSetting->id);

        return back()->with('success', 'Grade setting deleted successfully');
    }
}
