<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index()
    {
        $this->authorize('view_classes');

        $classes = SchoolClass::withCount(['sections', 'students', 'subjects', 'feeStructures'])
            ->orderBy('order')
            ->get();

        return Inertia::render('Academic/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    public function create()
    {
        $this->authorize('create_classes');

        $subjects = Subject::where('status', 'active')->get();
        $feeTypes = \App\Models\FeeType::where('status', 'active')->get();
        $academicYears = \App\Models\AcademicYear::where('status', 'active')->get();
        $currentAcademicYear = \App\Models\AcademicYear::where('is_current', true)->first();

        return Inertia::render('Academic/Classes/Create', [
            'subjects' => $subjects,
            'feeTypes' => $feeTypes,
            'academicYears' => $academicYears,
            'currentAcademicYearId' => $currentAcademicYear?->id,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_classes');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bengali' => 'nullable|string|max:255',
            'numeric_value' => 'required|integer|min:1|max:12',
            'order' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'subjects' => 'array',
            'subjects.*' => 'exists:subjects,id',
            'fee_structures' => 'array',
            'fee_structures.*.fee_type_id' => 'required|exists:fee_types,id',
            'fee_structures.*.academic_year_id' => 'required|exists:academic_years,id',
            'fee_structures.*.amount' => 'required|numeric|min:0',
        ]);

        $class = SchoolClass::create($validated);

        if (!empty($validated['subjects'])) {
            $class->subjects()->sync($validated['subjects']);
        }

        // Create fee structures with auto-generated due dates
        if (!empty($validated['fee_structures'])) {
            foreach ($validated['fee_structures'] as $feeData) {
                $feeType = \App\Models\FeeType::find($feeData['fee_type_id']);
                $academicYear = \App\Models\AcademicYear::find($feeData['academic_year_id']);

                // Auto-generate due date based on frequency
                $dueDate = $this->generateDueDate($feeType->frequency, $academicYear);

                $class->feeStructures()->create([
                    'fee_type_id' => $feeData['fee_type_id'],
                    'academic_year_id' => $feeData['academic_year_id'],
                    'amount' => $feeData['amount'],
                    'due_date' => $dueDate,
                    'status' => 'active',
                ]);
            }
        }

        logActivity('create', "Created class: {$class->name}", SchoolClass::class, $class->id);

        return redirect()->route('classes.index')
            ->with('success', 'Class created successfully');
    }

    public function show(SchoolClass $class)
    {
        $this->authorize('view_classes');

        $class->load(['sections.students', 'subjects', 'students', 'feeStructures.feeType', 'feeStructures.academicYear']);

        return Inertia::render('Academic/Classes/Show', [
            'schoolClass' => $class,
        ]);
    }

    public function edit(SchoolClass $class)
    {
        $this->authorize('edit_classes');

        $class->load(['subjects', 'feeStructures.feeType', 'feeStructures.academicYear']);
        $subjects = Subject::where('status', 'active')->get();
        $feeTypes = \App\Models\FeeType::where('status', 'active')->get();
        $academicYears = \App\Models\AcademicYear::where('status', 'active')->get();
        $currentAcademicYear = \App\Models\AcademicYear::where('is_current', true)->first();

        return Inertia::render('Academic/Classes/Edit', [
            'class' => $class,
            'subjects' => $subjects,
            'feeTypes' => $feeTypes,
            'academicYears' => $academicYears,
            'currentAcademicYearId' => $currentAcademicYear?->id,
        ]);
    }

    public function update(Request $request, SchoolClass $class)
    {
        $this->authorize('edit_classes');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bengali' => 'nullable|string|max:255',
            'numeric_value' => 'required|integer|min:1|max:12',
            'order' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'subjects' => 'array',
            'subjects.*' => 'exists:subjects,id',
            'fee_structures' => 'array',
            'fee_structures.*.fee_type_id' => 'required|exists:fee_types,id',
            'fee_structures.*.academic_year_id' => 'required|exists:academic_years,id',
            'fee_structures.*.amount' => 'required|numeric|min:0',
        ]);

        $class->update($validated);
        $class->subjects()->sync($validated['subjects'] ?? []);

        // Update fee structures - delete old ones and create new
        if (isset($validated['fee_structures'])) {
            $class->feeStructures()->delete();
            foreach ($validated['fee_structures'] as $feeData) {
                $feeType = \App\Models\FeeType::find($feeData['fee_type_id']);
                $academicYear = \App\Models\AcademicYear::find($feeData['academic_year_id']);

                // Auto-generate due date based on frequency
                $dueDate = $this->generateDueDate($feeType->frequency, $academicYear);

                $class->feeStructures()->create([
                    'fee_type_id' => $feeData['fee_type_id'],
                    'academic_year_id' => $feeData['academic_year_id'],
                    'amount' => $feeData['amount'],
                    'due_date' => $dueDate,
                    'status' => 'active',
                ]);
            }
        }

        logActivity('update', "Updated class: {$class->name}", SchoolClass::class, $class->id);

        return redirect()->route('classes.index')
            ->with('success', 'Class updated successfully');
    }

    public function destroy(SchoolClass $class)
    {
        $this->authorize('delete_classes');

        if ($class->students()->count() > 0) {
            return back()->with('error', 'Cannot delete class with enrolled students');
        }

        $className = $class->name;
        $class->delete();

        logActivity('delete', "Deleted class: {$className}", SchoolClass::class, $class->id);

        return redirect()->route('classes.index')
            ->with('success', 'Class deleted successfully');
    }

    /**
     * Generate due date based on fee frequency
     */
    private function generateDueDate(string $frequency, $academicYear): string
    {
        $currentDate = now();

        switch ($frequency) {
            case 'monthly':
                // Last day of current month
                return $currentDate->endOfMonth()->format('Y-m-d');

            case 'quarterly':
                // Last day of next quarter (based on academic year)
                if ($academicYear && isset($academicYear->year)) {
                    // Extract first year from format like "2024-2025"
                    $yearParts = explode('-', $academicYear->year);
                    $startYear = (int)$yearParts[0];

                    // Academic year quarters (assuming it starts in January)
                    // Q1: January-March (March 31)
                    // Q2: April-June (June 30)
                    // Q3: July-September (September 30)
                    // Q4: October-December (December 31)

                    // Get current date
                    $now = now();

                    // Find the next quarter end date
                    $quarters = [
                        $startYear . '-03-31',
                        $startYear . '-06-30',
                        $startYear . '-09-30',
                        $startYear . '-12-31',
                    ];

                    // Find the first quarter end that's in the future
                    foreach ($quarters as $quarterEnd) {
                        if ($now->lt(\Carbon\Carbon::parse($quarterEnd))) {
                            return $quarterEnd;
                        }
                    }

                    // If all quarters passed, use next year's Q1
                    return ($startYear + 1) . '-03-31';
                } else {
                    // Fallback: next quarter end from current date
                    $month = $currentDate->month;
                    $quarterEndMonth = ceil($month / 3) * 3;
                    $quarterEnd = $currentDate->copy()->month($quarterEndMonth)->endOfMonth();

                    // If quarter end is less than 15 days away, move to next quarter
                    if ($quarterEnd->diffInDays($currentDate) < 15) {
                        $quarterEnd->addMonths(3)->endOfMonth();
                    }

                    return $quarterEnd->format('Y-m-d');
                }

            case 'yearly':
                // December 31 of academic year or current year
                if ($academicYear && isset($academicYear->year)) {
                    // Extract first year from format like "2024-2025"
                    $yearParts = explode('-', $academicYear->year);
                    $year = $yearParts[0];
                } else {
                    $year = $currentDate->year;
                }
                return $year . '-12-31';

            case 'one_time':
                // 30 days from now
                return $currentDate->addDays(30)->format('Y-m-d');

            default:
                return $currentDate->endOfMonth()->format('Y-m-d');
        }
    }
}
