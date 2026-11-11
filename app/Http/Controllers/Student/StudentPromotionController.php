<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\StudentPromotion;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StudentPromotionController extends Controller
{
    public function __construct(private PromotionService $promotions) {}

    public function index(Request $request)
    {
        $this->authorize('view_students');

        $promotions = StudentPromotion::with([
            'student.user',
            'fromAcademicYear',
            'toAcademicYear',
            'fromClass',
            'toClass',
            'fromSection',
            'toSection',
        ])
            ->when($request->academic_year_id, fn ($q) => $q->where('to_academic_year_id', $request->academic_year_id))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Students/Promotions/Index', [
            'promotions' => $promotions,
            'academicYears' => AcademicYear::all(),
            'filters' => $request->only(['academic_year_id']),
        ]);
    }

    public function create()
    {
        $this->authorize('edit_students');

        return Inertia::render('Students/Promotions/Create', [
            'academicYears' => AcademicYear::orderByDesc('start_date')->get(),
            'classes' => SchoolClass::with('sections')->where('status', 'active')->orderBy('numeric_value')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('edit_students');

        $validated = $request->validate([
            'from_academic_year_id' => 'required|exists:academic_years,id',
            'to_academic_year_id' => 'required|exists:academic_years,id|different:from_academic_year_id',
            'from_class_id' => 'nullable|exists:classes,id',
            'from_section_id' => 'nullable|exists:sections,id',
            'promotion_date' => 'required|date',
            'remarks' => 'nullable|string',
            'decisions' => 'required|array|min:1',
            'decisions.*.student_id' => 'required|integer|exists:students,id',
            'decisions.*.status' => 'required|in:promoted,detained,passed_out',
            'decisions.*.to_section_id' => 'nullable|integer|exists:sections,id',
        ]);

        $result = $this->promotions->promote($validated, (int) $request->user()->id);

        $message = $result['count'].' '.($result['count'] === 1 ? 'student' : 'students').' updated successfully';
        if ($result['missing_fee_classes'] !== []) {
            $message .= '. No fee structure for '.implode(', ', $result['missing_fee_classes']).' in the target year, so monthly fees will not generate for that class until a structure is added.';
        }

        return redirect()->route('student-promotions.index')
            ->with('success', $message);
    }

    public function getStudentsForPromotion(Request $request)
    {
        $this->authorize('view_students');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'nullable|exists:classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'to_academic_year_id' => 'required|exists:academic_years,id|different:academic_year_id',
        ]);

        return response()->json($this->promotions->preview($validated));
    }

    public function destroy(StudentPromotion $studentPromotion)
    {
        $this->authorize('delete_students');

        try {
            $this->promotions->revert($studentPromotion);
        } catch (ValidationException $exception) {
            return back()->with('error', collect($exception->errors())->flatten()->first());
        }

        return back()->with('success', 'Promotion reverted successfully');
    }
}
