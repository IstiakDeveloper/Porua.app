<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\BatchEnrollment;
use App\Models\ModelTest;
use App\Models\ModelTestResult;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ModelTestController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_model_tests');

        $query = ModelTest::with(['batch.course', 'creator'])
            ->withCount('results');

        if ($request->filled('batch_id')) {
            $query->where('batch_id', $request->input('batch_id'));
        }

        if ($request->filled('test_type')) {
            $query->where('test_type', $request->input('test_type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('batch', function ($bq) use ($search) {
                        $bq->where('name', 'like', "%{$search}%")
                            ->orWhereHas('course', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
                    });
            });
        }

        $tests = $query->latest('test_date')->paginate(15)->withQueryString();

        $batches = Batch::with('course')->where('status', 'active')->orderBy('name')->get();

        // Summary metrics
        $totalTests = ModelTest::count();
        $completedTests = ModelTest::whereIn('status', ['completed', 'published'])->count();
        $avgScore = ModelTest::whereIn('status', ['completed', 'published'])->avg('average_marks') ?? 0;

        return Inertia::render('Coaching/ModelTests/Index', [
            'tests' => $tests,
            'batches' => $batches,
            'filters' => $request->only(['batch_id', 'test_type', 'status', 'search']),
            'metrics' => [
                'total_tests' => $totalTests,
                'completed_tests' => $completedTests,
                'overall_average' => round((float) $avgScore, 1),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_model_tests');

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:255',
            'test_type' => 'required|in:weekly_test,daily_quiz,model_test,mock_exam,monthly_test',
            'test_date' => 'required|date',
            'total_marks' => 'required|numeric|min:1',
            'pass_marks' => 'required|numeric|min:0|lte:total_marks',
            'duration_minutes' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $test = ModelTest::create([
                'batch_id' => $validated['batch_id'],
                'title' => $validated['title'],
                'test_type' => $validated['test_type'],
                'test_date' => $validated['test_date'],
                'total_marks' => $validated['total_marks'],
                'pass_marks' => $validated['pass_marks'],
                'duration_minutes' => $validated['duration_minutes'] ?? null,
                'status' => 'upcoming',
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Auto-enroll all active students of this batch into test results
            $enrollments = BatchEnrollment::where('batch_id', $test->batch_id)
                ->where('status', 'active')
                ->get();

            foreach ($enrollments as $enrollment) {
                ModelTestResult::create([
                    'model_test_id' => $test->id,
                    'student_id' => $enrollment->student_id,
                    'batch_enrollment_id' => $enrollment->id,
                    'marks_obtained' => null,
                    'is_absent' => false,
                    'percentage' => 0.00,
                    'status' => 'pass',
                    'merit_rank' => null,
                ]);
            }

            logActivity('create', "Created model test: {$test->title} for batch #{$test->batch_id}", ModelTest::class, $test->id);

            return redirect()->route('model-tests.show', $test->id)
                ->with('success', "Model test '{$test->title}' created with {$enrollments->count()} candidate students!");
        });
    }

    public function show(ModelTest $modelTest)
    {
        $this->authorize('view_model_tests');

        $modelTest->load(['batch.course', 'batch.teacher', 'creator']);

        // Fetch results ordered by merit rank ascending (ranked first, then unranked/absent)
        $results = $modelTest->results()
            ->with(['student.user'])
            ->orderByRaw('CASE WHEN merit_rank IS NULL THEN 1 ELSE 0 END, merit_rank ASC, marks_obtained DESC')
            ->get();

        return Inertia::render('Coaching/ModelTests/Show', [
            'test' => $modelTest,
            'results' => $results,
        ]);
    }

    public function markEntry(ModelTest $modelTest)
    {
        $this->authorize('manage_model_tests');

        $modelTest->load(['batch.course']);

        // Check if any newly enrolled students in the batch don't have results yet
        $existingStudentIds = $modelTest->results()->pluck('student_id')->toArray();
        $missingEnrollments = BatchEnrollment::where('batch_id', $modelTest->batch_id)
            ->where('status', 'active')
            ->whereNotIn('student_id', $existingStudentIds)
            ->get();

        foreach ($missingEnrollments as $enrollment) {
            ModelTestResult::create([
                'model_test_id' => $modelTest->id,
                'student_id' => $enrollment->student_id,
                'batch_enrollment_id' => $enrollment->id,
                'marks_obtained' => null,
                'is_absent' => false,
                'percentage' => 0.00,
                'status' => 'pass',
            ]);
        }

        $results = $modelTest->results()
            ->with(['student.user'])
            ->get()
            ->sortBy(function ($r) {
                return $r->student?->roll_number ?? $r->student?->first_name ?? '';
            })
            ->values();

        return Inertia::render('Coaching/ModelTests/MarkEntry', [
            'test' => $modelTest,
            'results' => $results,
        ]);
    }

    public function saveMarks(Request $request, ModelTest $modelTest)
    {
        $this->authorize('manage_model_tests');

        $validated = $request->validate([
            'results' => 'required|array',
            'results.*.id' => 'required|exists:model_test_results,id',
            'results.*.marks_obtained' => 'nullable|numeric|min:0|max:' . $modelTest->total_marks,
            'results.*.is_absent' => 'boolean',
            'results.*.teacher_remarks' => 'nullable|string|max:255',
            'publish_now' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $modelTest) {
            foreach ($validated['results'] as $entry) {
                $isAbsent = !empty($entry['is_absent']);
                $marks = (!$isAbsent && isset($entry['marks_obtained']) && $entry['marks_obtained'] !== '')
                    ? (float) $entry['marks_obtained']
                    : null;

                ModelTestResult::where('id', $entry['id'])
                    ->where('model_test_id', $modelTest->id)
                    ->update([
                        'is_absent' => $isAbsent,
                        'marks_obtained' => $marks,
                        'teacher_remarks' => $entry['teacher_remarks'] ?? null,
                    ]);
            }

            // Recalculate ranks, highest marks, averages, pass/fail counts
            $modelTest->recalculateMeritList();

            if (!empty($validated['publish_now'])) {
                $modelTest->update(['status' => 'published']);
            }

            logActivity('update', "Updated marks and merit ranks for test: {$modelTest->title}", ModelTest::class, $modelTest->id);
        });

        return redirect()->route('model-tests.show', $modelTest->id)
            ->with('success', 'Marks saved and merit ranking calculated successfully!');
    }

    public function update(Request $request, ModelTest $modelTest)
    {
        $this->authorize('manage_model_tests');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'test_type' => 'required|in:weekly_test,daily_quiz,model_test,mock_exam,monthly_test',
            'test_date' => 'required|date',
            'total_marks' => 'required|numeric|min:1',
            'pass_marks' => 'required|numeric|min:0|lte:total_marks',
            'duration_minutes' => 'nullable|integer|min:1',
            'status' => 'required|in:upcoming,completed,published,cancelled',
            'notes' => 'nullable|string',
        ]);

        $modelTest->update($validated);
        $modelTest->recalculateMeritList();

        logActivity('update', "Updated model test: {$modelTest->title}", ModelTest::class, $modelTest->id);

        return back()->with('success', 'Model test updated successfully.');
    }

    public function destroy(ModelTest $modelTest)
    {
        $this->authorize('manage_model_tests');

        $title = $modelTest->title;
        $modelTest->results()->delete();
        $modelTest->delete();

        logActivity('delete', "Deleted model test: {$title}", ModelTest::class);

        return redirect()->route('model-tests.index')
            ->with('success', 'Model test and student test records deleted successfully.');
    }
}
