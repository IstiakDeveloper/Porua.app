<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\SchoolClass;
use Illuminate\Validation\ValidationException;

class ExamPlanService
{
    /**
     * @param  array<string, mixed>  $input
     * @return array{exam_type: string, exam_kind: string, term_number: int|null, min_attendance_percent: int|null}
     */
    public function normalize(array $input): array
    {
        $type = isset($input['exam_type']) ? (string) $input['exam_type'] : null;
        $kind = isset($input['exam_kind']) ? (string) $input['exam_kind'] : null;
        $term = isset($input['term_number']) && $input['term_number'] !== '' && $input['term_number'] !== null
            ? (int) $input['term_number']
            : null;

        if (! $kind && $type) {
            [$kind, $derivedTerm] = $this->kindFromType($type);
            $term = $term ?? $derivedTerm;
        }

        $kind = $kind ?: 'semester';

        if ($kind === 'class_test') {
            $type = 'test';
            $term = null;
        } elseif ($kind === 'annual') {
            $type = 'final';
            $term = null;
        } elseif ($kind === 'semester') {
            if ($term === 1) {
                $type = 'first_term';
            } elseif ($term === 2) {
                $type = 'mid_term';
            } elseif ($type !== 'practical') {
                $type = 'first_term';
                $term = 1;
            }
        }

        $minimum = $input['min_attendance_percent'] ?? null;
        if ($kind === 'annual') {
            $minimum = ($minimum === null || $minimum === '') ? 75 : (int) $minimum;
        } else {
            $minimum = null;
        }

        return [
            'exam_type' => $type ?: 'first_term',
            'exam_kind' => $kind,
            'term_number' => $term,
            'min_attendance_percent' => $minimum,
        ];
    }

    /**
     * @param  array<int, int|string>  $classIds
     */
    public function assertSlotAvailable(int $yearId, array $classIds, string $kind, ?int $term, ?int $ignoreExamId = null): void
    {
        if ($kind === 'class_test' || $classIds === []) {
            return;
        }

        if ($kind === 'semester' && ! in_array($term, [1, 2], true)) {
            return;
        }

        $query = Exam::query()
            ->with('classes')
            ->where('academic_year_id', $yearId)
            ->where('exam_kind', $kind)
            ->when($ignoreExamId, fn ($q) => $q->where('id', '!=', $ignoreExamId))
            ->whereHas('classes', fn ($q) => $q->whereIn('classes.id', $classIds));

        if ($kind === 'semester') {
            $query->where('term_number', $term);
        }

        $conflict = $query->first();
        if (! $conflict) {
            return;
        }

        $taken = $conflict->classes->whereIn('id', array_map('intval', $classIds))->pluck('name');
        if ($taken->isEmpty()) {
            $taken = SchoolClass::whereIn('id', $classIds)->pluck('name');
        }

        $slot = $kind === 'annual' ? 'Annual' : 'Semester '.$term;

        throw ValidationException::withMessages([
            'classes' => $taken->implode(', ').' already has a '.$slot.' exam in this academic year ('.$conflict->name.').',
        ]);
    }

    /**
     * @return array{0: string, 1: int|null}
     */
    public function kindFromType(string $type): array
    {
        return match ($type) {
            'final' => ['annual', null],
            'mid_term' => ['semester', 2],
            'test' => ['class_test', null],
            'practical' => ['semester', null],
            default => ['semester', 1],
        };
    }
}
