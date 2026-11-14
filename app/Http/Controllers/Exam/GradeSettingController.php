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

        GradeSetting::create($validated + ['order' => (int) round((float) $validated['min_marks'])]);

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

    public function installNational()
    {
        $this->authorize('manage_exams');

        $scale = [
            ['A+', 80, 100, 5.00, 'Outstanding', 7],
            ['A', 70, 79.99, 4.00, 'Excellent', 6],
            ['A-', 60, 69.99, 3.50, 'Very Good', 5],
            ['B', 50, 59.99, 3.00, 'Good', 4],
            ['C', 40, 49.99, 2.00, 'Satisfactory', 3],
            ['D', 33, 39.99, 1.00, 'Pass', 2],
            ['F', 0, 32.99, 0.00, 'Fail', 1],
        ];

        $created = 0;
        foreach ($scale as [$name, $min, $max, $point, $remarks, $order]) {
            $exists = GradeSetting::query()
                ->whereNull('academic_year_id')
                ->where('grade_name', $name)
                ->exists();

            if ($exists) {
                continue;
            }

            GradeSetting::create([
                'academic_year_id' => null,
                'grade_name' => $name,
                'min_marks' => $min,
                'max_marks' => $max,
                'grade_point' => $point,
                'remarks' => $remarks,
                'order' => $order,
            ]);
            $created++;
        }

        return back()->with('success', $created > 0
            ? "National grade scale added ({$created} grades)."
            : 'The national grade scale is already installed.');
    }

    public function destroy(GradeSetting $gradeSetting)
    {
        $this->authorize('manage_exams');

        $gradeSetting->delete();

        logActivity('delete', "Deleted grade setting", GradeSetting::class, $gradeSetting->id);

        return back()->with('success', 'Grade setting deleted successfully');
    }
}
