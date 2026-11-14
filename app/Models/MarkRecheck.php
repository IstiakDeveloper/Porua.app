<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class MarkRecheck extends Model
{
    protected $fillable = [
        'exam_id',
        'student_id',
        'subject_id',
        'requested_by',
        'reason',
        'status',
        'review_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public static function open(Student $student, int $userId, int $examId, int $subjectId, string $reason): self
    {
        $published = Result::query()
            ->where('student_id', $student->id)
            ->where('exam_id', $examId)
            ->where('is_published', true)
            ->exists();

        if (! $published) {
            throw ValidationException::withMessages([
                'exam_id' => 'Recheck is available after the result is published.',
            ]);
        }

        $mark = Mark::query()
            ->where('exam_id', $examId)
            ->where('student_id', $student->id)
            ->where('subject_id', $subjectId)
            ->first();

        if (! $mark) {
            throw ValidationException::withMessages([
                'subject_id' => 'This subject has no mark on that exam.',
            ]);
        }

        $pending = self::query()
            ->where('exam_id', $examId)
            ->where('student_id', $student->id)
            ->where('subject_id', $subjectId)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            throw ValidationException::withMessages([
                'subject_id' => 'A recheck for this subject is already waiting.',
            ]);
        }

        return self::create([
            'exam_id' => $examId,
            'student_id' => $student->id,
            'subject_id' => $subjectId,
            'requested_by' => $userId,
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }
}
