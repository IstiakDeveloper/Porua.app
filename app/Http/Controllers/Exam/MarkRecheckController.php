<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Mark;
use App\Models\MarkRecheck;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarkRecheckController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $rechecks = MarkRecheck::query()
            ->with(['exam', 'student.user', 'subject', 'requester'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(40)
            ->withQueryString();

        return Inertia::render('Exams/Rechecks/Index', [
            'rechecks' => $rechecks,
            'filters' => $request->only(['status']),
        ]);
    }

    public function review(Request $request, MarkRecheck $recheck)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_note' => 'nullable|string|max:1000',
        ]);

        if ($recheck->status !== 'pending') {
            return back()->with('error', 'This recheck was already reviewed.');
        }

        $recheck->update([
            'status' => $validated['status'],
            'review_note' => $validated['review_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($validated['status'] === 'approved') {
            Mark::query()
                ->where('exam_id', $recheck->exam_id)
                ->where('student_id', $recheck->student_id)
                ->when($recheck->subject_id, fn ($q) => $q->where('subject_id', $recheck->subject_id))
                ->update(['recheck_open' => true]);
        }

        logActivity('update', "Reviewed mark recheck #{$recheck->id} as {$validated['status']}", MarkRecheck::class, $recheck->id);

        return back()->with('success', $validated['status'] === 'approved'
            ? 'Recheck approved. That subject can be edited, then generate the result again.'
            : 'Recheck rejected.');
    }
}
