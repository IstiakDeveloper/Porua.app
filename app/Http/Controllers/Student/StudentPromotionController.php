<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentPromotion;
use App\Models\Student;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentPromotionController extends Controller
{
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
            'toSection'
        ])
            ->when($request->academic_year_id, fn($q) => $q->where('to_academic_year_id', $request->academic_year_id))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Students/Promotions/Index', [
            'promotions' => $promotions,
            'academicYears' => AcademicYear::all(),
        ]);
    }

    public function create()
    {
        $this->authorize('edit_students');

        return Inertia::render('Students/Promotions/Create', [
            'academicYears' => AcademicYear::all(),
            'classes' => SchoolClass::with('sections')->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('edit_students');

        $validated = $request->validate([
            'from_academic_year_id' => 'required|exists:academic_years,id',
            'to_academic_year_id' => 'required|exists:academic_years,id|different:from_academic_year_id',
            'from_class_id' => 'required|exists:classes,id',
            'from_section_id' => 'nullable|exists:sections,id',
            'to_class_id' => 'required|exists:classes,id',
            'to_section_id' => 'nullable|exists:sections,id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'promotion_date' => 'required|date',
            'status' => 'required|in:promoted,detained,passed_out',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['student_ids'] as $studentId) {
                $student = Student::findOrFail($studentId);

                // Create promotion record
                StudentPromotion::create([
                    'student_id' => $studentId,
                    'from_academic_year_id' => $validated['from_academic_year_id'],
                    'to_academic_year_id' => $validated['to_academic_year_id'],
                    'from_class_id' => $validated['from_class_id'],
                    'to_class_id' => $validated['to_class_id'],
                    'from_section_id' => $validated['from_section_id'],
                    'to_section_id' => $validated['to_section_id'],
                    'promotion_date' => $validated['promotion_date'],
                    'status' => $validated['status'],
                    'remarks' => $validated['remarks'],
                ]);

                // Update student current class/section
                $student->update([
                    'academic_year_id' => $validated['to_academic_year_id'],
                    'class_id' => $validated['to_class_id'],
                    'section_id' => $validated['to_section_id'],
                ]);

                logActivity('create', "Promoted student: {$student->user->name}", StudentPromotion::class, $studentId);
            }

            DB::commit();

            return redirect()->route('student-promotions.index')
                ->with('success', count($validated['student_ids']) . ' students promoted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to promote students: ' . $e->getMessage());
        }
    }

    public function getStudentsForPromotion(Request $request)
    {
        $this->authorize('view_students');

        $students = Student::with(['schoolClass', 'section'])
            ->where('academic_year_id', $request->academic_year_id)
            ->where('class_id', $request->class_id)
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->where('status', 'active')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'roll_number' => $student->roll_number,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'photo_url' => $student->photo_url,
                    'current_class_id' => $student->class_id,
                    'current_section_id' => $student->section_id,
                ];
            });

        return response()->json($students);
    }

    public function destroy(StudentPromotion $studentPromotion)
    {
        $this->authorize('delete_students');

        DB::beginTransaction();
        try {
            // Revert student to previous class
            $student = $studentPromotion->student;
            $student->update([
                'academic_year_id' => $studentPromotion->from_academic_year_id,
                'class_id' => $studentPromotion->from_class_id,
                'section_id' => $studentPromotion->from_section_id,
            ]);

            $studentPromotion->delete();

            DB::commit();

            logActivity('delete', "Reverted promotion for student: {$student->user->name}", StudentPromotion::class, $studentPromotion->id);

            return back()->with('success', 'Promotion reverted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to revert promotion: ' . $e->getMessage());
        }
    }
}
