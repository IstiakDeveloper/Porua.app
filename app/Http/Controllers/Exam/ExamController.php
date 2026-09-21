<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $exams = Exam::with(['academicYear', 'classes'])
            ->when($request->academic_year_id, fn($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->when($request->exam_type, fn($q) => $q->where('exam_type', $request->exam_type))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
            'filters' => $request->only(['academic_year_id', 'exam_type']),
            'academicYears' => AcademicYear::all(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_exams');

        return Inertia::render('Exams/Create', [
            'academicYears' => AcademicYear::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'exam_type' => 'required|in:first_term,mid_term,final,test,practical',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'result_publish_date' => 'nullable|date|after_or_equal:end_date',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'description' => 'nullable|string',
            'classes' => 'array',
            'classes.*' => 'exists:classes,id',
        ]);

        DB::beginTransaction();
        try {
            $exam = Exam::create($validated);

            if (!empty($validated['classes'])) {
                $exam->classes()->sync($validated['classes']);

                // Auto-generate exam fees for all students in selected classes
                $this->generateExamFeesForStudents($exam, $validated['classes'], $validated['academic_year_id']);
            }

            DB::commit();

            logActivity('create', "Created exam: {$exam->name}", Exam::class, $exam->id);

            return redirect()->route('exams.index')
                ->with('success', 'Exam created successfully and fees generated for students');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create exam: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to create exam: ' . $e->getMessage());
        }
    }

    public function show(Exam $exam)
    {
        $this->authorize('manage_exams');

        $exam->load(['academicYear', 'classes', 'schedules.subject', 'schedules.schoolClass']);

        return Inertia::render('Exams/Show', [
            'exam' => $exam,
        ]);
    }

    public function edit(Exam $exam)
    {
        $this->authorize('manage_exams');

        $exam->load('classes');

        return Inertia::render('Exams/Edit', [
            'exam' => $exam,
            'academicYears' => AcademicYear::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, Exam $exam)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'exam_type' => 'required|in:first_term,mid_term,final,test,practical',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'result_publish_date' => 'nullable|date|after_or_equal:end_date',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'description' => 'nullable|string',
            'classes' => 'array',
            'classes.*' => 'exists:classes,id',
        ]);

        $exam->update($validated);
        $exam->classes()->sync($validated['classes'] ?? []);

        logActivity('update', "Updated exam: {$exam->name}", Exam::class, $exam->id);

        return redirect()->route('exams.index')
            ->with('success', 'Exam updated successfully');
    }

    public function destroy(Exam $exam)
    {
        $this->authorize('manage_exams');

        if ($exam->marks()->count() > 0) {
            return back()->with('error', 'Cannot delete exam with recorded marks');
        }

        $examName = $exam->name;
        $exam->delete();

        logActivity('delete', "Deleted exam: {$examName}", Exam::class, $exam->id);

        return redirect()->route('exams.index')
            ->with('success', 'Exam deleted successfully');
    }

    /**
     * Auto-generate exam fees for students in selected classes
     */
    private function generateExamFeesForStudents(Exam $exam, array $classIds, int $academicYearId)
    {
        try {
            $examStartDate = Carbon::parse($exam->start_date);
            $dueDate = $examStartDate->copy()->subDays(7); // Due 7 days before exam

            foreach ($classIds as $classId) {
                // Get Exam Fee structure for this class
                $examFeeStructure = FeeStructure::with('feeType')
                    ->where('class_id', $classId)
                    ->where('academic_year_id', $academicYearId)
                    ->whereHas('feeType', function($q) {
                        $q->where(function($query) {
                            $query->where('name', 'LIKE', '%Exam Fee%')
                                  ->orWhere('name', 'LIKE', '%exam fee%')
                                  ->orWhere('frequency', 'quarterly');
                        });
                    })
                    ->first();

                // Skip if no exam fee structure found for this class
                if (!$examFeeStructure) {
                    \Log::warning("No Exam Fee structure found for class ID: {$classId}");
                    continue;
                }

                // Get all active students in this class
                $students = Student::where('class_id', $classId)
                    ->where('academic_year_id', $academicYearId)
                    ->where('status', 'active')
                    ->get();

                foreach ($students as $student) {
                    FeeCollection::createPendingIfAbsent([
                        'receipt_number' => 'FEE-' . date('Ymd') . '-' . str_pad(
                            FeeCollection::whereDate('created_at', today())->count() + 1,
                            6,
                            '0',
                            STR_PAD_LEFT
                        ),
                        'student_id' => $student->id,
                        'fee_type_id' => $examFeeStructure->fee_type_id,
                        'academic_year_id' => $academicYearId,
                        'month' => $examStartDate->month,
                        'year' => $examStartDate->year,
                        'amount' => $examFeeStructure->amount,
                        'late_fee' => 0,
                        'discount' => 0,
                        'total_amount' => $examFeeStructure->amount,
                        'paid_amount' => 0,
                        'payment_date' => $dueDate,
                        'status' => 'pending',
                        'remarks' => "Auto-generated for exam: {$exam->name}",
                        'collected_by' => auth()->id() ?? 1,
                    ]);
                }

                \Log::info("Generated exam fees for " . $students->count() . " students in class ID: {$classId}");
            }

        } catch (\Exception $e) {
            \Log::error('Failed to generate exam fees: ' . $e->getMessage());
            throw $e; // Re-throw to trigger transaction rollback
        }
    }
}
