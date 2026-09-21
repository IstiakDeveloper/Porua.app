<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\BatchEnrollment;
use App\Models\Student;
use Illuminate\Http\Request;

class BatchEnrollmentController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create_enrollments');

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'student_id' => 'required|exists:students,id',
            'enrolled_date' => 'required|date',
            'agreed_fee' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $batch = Batch::with('course')->findOrFail($validated['batch_id']);

        // Check capacity
        $activeCount = $batch->activeEnrollments()->count();
        if ($activeCount >= $batch->max_capacity) {
            return back()->with('error', "Batch capacity ({$batch->max_capacity}) has been reached.");
        }

        // Check existing enrollment
        $existing = BatchEnrollment::where('batch_id', $batch->id)
            ->where('student_id', $validated['student_id'])
            ->first();

        if ($existing) {
            if ($existing->status === 'dropped' || $existing->status === 'completed') {
                $existing->update([
                    'status' => 'active',
                    'enrolled_date' => $validated['enrolled_date'],
                    'agreed_fee' => $validated['agreed_fee'] ?? $batch->course->standard_fee,
                    'discount_amount' => $validated['discount_amount'] ?? 0,
                    'notes' => $validated['notes'] ?? null,
                ]);

                return back()->with('success', 'Student re-enrolled into batch successfully.');
            }

            return back()->with('error', 'Student is already enrolled in this batch.');
        }

        // Default agreed_fee to course standard fee if not provided
        $agreedFee = isset($validated['agreed_fee']) && $validated['agreed_fee'] !== null
            ? $validated['agreed_fee']
            : ($batch->course->standard_fee ?? 0);

        $enrollment = BatchEnrollment::create([
            'batch_id' => $batch->id,
            'student_id' => $validated['student_id'],
            'enrolled_date' => $validated['enrolled_date'],
            'agreed_fee' => $agreedFee,
            'discount_amount' => $validated['discount_amount'] ?? 0,
            'status' => 'active',
            'notes' => $validated['notes'] ?? null,
        ]);

        $student = Student::find($validated['student_id']);
        logActivity('create', "Enrolled student {$student->full_name} into batch {$batch->name}", BatchEnrollment::class, $enrollment->id);

        return back()->with('success', 'Student enrolled successfully.');
    }

    public function update(Request $request, BatchEnrollment $enrollment)
    {
        $this->authorize('edit_enrollments');

        $validated = $request->validate([
            'status' => 'required|in:active,completed,dropped',
            'agreed_fee' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $enrollment->update($validated);

        logActivity('update', "Updated enrollment #{$enrollment->id}", BatchEnrollment::class, $enrollment->id);

        return back()->with('success', 'Enrollment updated successfully.');
    }

    public function destroy(BatchEnrollment $enrollment)
    {
        $this->authorize('delete_enrollments');

        $enrollment->delete();

        logActivity('delete', "Removed enrollment #{$enrollment->id}", BatchEnrollment::class);

        return back()->with('success', 'Enrollment removed successfully.');
    }

    public function searchStudents(Request $request)
    {
        $this->authorize('view_students');

        $query = $request->input('q', '');
        $batchId = $request->input('batch_id');

        $studentQuery = Student::where('status', 'active');

        if ($batchId) {
            $enrolledIds = BatchEnrollment::where('batch_id', $batchId)->pluck('student_id');
            $studentQuery->whereNotIn('id', $enrolledIds);
        }

        if (strlen($query) > 0) {
            $studentQuery->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('student_id', 'like', "%{$query}%")
                    ->orWhere('roll_number', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%");
            });
        }

        $students = $studentQuery->select('id', 'first_name', 'last_name', 'student_id', 'roll_number', 'phone')
            ->take(20)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->full_name,
                    'student_id' => $s->student_id,
                    'roll_number' => $s->roll_number,
                    'phone' => $s->phone,
                ];
            });

        return response()->json($students);
    }
}
