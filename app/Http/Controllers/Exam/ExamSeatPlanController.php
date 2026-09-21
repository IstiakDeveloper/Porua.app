<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\ExamSeatPlan;
use App\Models\Exam;
use App\Models\ExamHall;
use App\Models\Student;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExamSeatPlanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $seatPlans = ExamSeatPlan::with(['exam', 'student.user', 'examHall', 'schoolClass'])
            ->when($request->exam_id, fn($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->hall_id, fn($q) => $q->where('hall_id', $request->hall_id))
            ->orderBy('seat_number')
            ->paginate(50)->withQueryString();

        return Inertia::render('Exams/SeatPlans/Index', [
            'seatPlans' => $seatPlans,
            'filters' => $request->only(['exam_id', 'hall_id']),
            'exams' => Exam::all(),
            'halls' => ExamHall::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function generate(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:classes,id',
            'hall_id' => 'required|exists:exam_halls,id',
            'starting_seat_number' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $students = Student::where('class_id', $validated['class_id'])
                ->where('status', 'active')
                ->orderBy('roll_number')
                ->get();

            $seatNumber = $validated['starting_seat_number'];

            foreach ($students as $student) {
                ExamSeatPlan::create([
                    'exam_id' => $validated['exam_id'],
                    'student_id' => $student->id,
                    'class_id' => $validated['class_id'],
                    'hall_id' => $validated['hall_id'],
                    'seat_number' => $seatNumber++,
                    'row_number' => ceil($seatNumber / 10),
                    'column_number' => ($seatNumber % 10) ?: 10,
                ]);
            }

            DB::commit();

            logActivity('create', "Generated seat plan for exam", ExamSeatPlan::class);

            return back()->with('success', 'Seat plan generated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to generate seat plan: ' . $e->getMessage());
        }
    }

    public function show(Request $request)
    {
        $this->authorize('manage_exams');

        $seatPlans = ExamSeatPlan::with(['student.user', 'examHall'])
            ->where('exam_id', $request->exam_id)
            ->where('class_id', $request->class_id)
            ->orderBy('seat_number')
            ->get();

        return Inertia::render('Exams/SeatPlans/Show', [
            'seatPlans' => $seatPlans,
            'exam' => Exam::find($request->exam_id),
            'class' => SchoolClass::find($request->class_id),
        ]);
    }

    public function destroy(ExamSeatPlan $examSeatPlan)
    {
        $this->authorize('manage_exams');

        $examSeatPlan->delete();

        logActivity('delete', "Deleted seat plan", ExamSeatPlan::class, $examSeatPlan->id);

        return back()->with('success', 'Seat plan deleted successfully');
    }

    public function clear(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'nullable|exists:classes,id',
        ]);

        $query = ExamSeatPlan::where('exam_id', $validated['exam_id']);

        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }

        $count = $query->count();
        $query->delete();

        logActivity('delete', "Cleared {$count} seat plans", ExamSeatPlan::class);

        return back()->with('success', 'Seat plans cleared successfully');
    }
}
