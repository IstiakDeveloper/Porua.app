<?php

namespace App\Services;

use App\Models\Mark;
use App\Models\MarkAudit;
use App\Models\Result;
use Illuminate\Validation\ValidationException;

class MarkGuard
{
    public function assertEditable(int $examId, int $studentId, int $subjectId): void
    {
        $published = Result::query()
            ->where('exam_id', $examId)
            ->where('student_id', $studentId)
            ->where('is_published', true)
            ->exists();

        if (! $published) {
            return;
        }

        $open = Mark::query()
            ->where('exam_id', $examId)
            ->where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->where('recheck_open', true)
            ->exists();

        if ($open) {
            return;
        }

        throw ValidationException::withMessages([
            'marks' => 'Published marks stay locked. Approve a recheck before editing this subject.',
        ]);
    }

    public function audit(?Mark $mark, int $examId, int $studentId, ?int $subjectId, string $action, ?array $before, ?array $after): void
    {
        MarkAudit::create([
            'mark_id' => $mark?->id,
            'exam_id' => $examId,
            'student_id' => $studentId,
            'subject_id' => $subjectId,
            'user_id' => auth()->id(),
            'action' => $action,
            'before' => $before,
            'after' => $after,
        ]);
    }

    public function snapshot(?Mark $mark): ?array
    {
        if (! $mark) {
            return null;
        }

        return $mark->only([
            'theory_marks',
            'practical_marks',
            'obtained_marks',
            'total_marks',
            'grade',
            'grade_point',
            'is_absent',
            'verified_by',
            'recheck_open',
        ]);
    }
}
