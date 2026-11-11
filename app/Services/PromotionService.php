<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\Result;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentPromotion;
use App\Models\StudentSession;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PromotionService
{
    public function preview(array $filters): array
    {
        $yearId = (int) $filters['academic_year_id'];
        $classId = ! empty($filters['class_id']) ? (int) $filters['class_id'] : null;
        $sectionId = ! empty($filters['section_id']) ? (int) $filters['section_id'] : null;
        $toYearId = (int) $filters['to_academic_year_id'];

        $activeClasses = SchoolClass::with('sections')->where('status', 'active')->get();
        $sourceClass = $classId ? $activeClasses->firstWhere('id', $classId) : null;

        if ($classId && ! $sourceClass) {
            throw ValidationException::withMessages([
                'class_id' => 'The selected class is not active.',
            ]);
        }

        if ($sourceClass && $sectionId && ! $sourceClass->sections->contains('id', $sectionId)) {
            throw ValidationException::withMessages([
                'section_id' => 'The selected section does not belong to this class.',
            ]);
        }

        $students = Student::query()
            ->with(['schoolClass.sections', 'section'])
            ->where('academic_year_id', $yearId)
            ->where('status', 'active')
            ->when($classId, fn ($query) => $query->where('class_id', $classId))
            ->when($sectionId, fn ($query) => $query->where('section_id', $sectionId))
            ->get()
            ->sortBy(fn (Student $student) => sprintf(
                '%05d-%s-%s-%s',
                $student->schoolClass?->numeric_value ?? 0,
                $student->section?->name ?? '',
                $student->first_name,
                $student->last_name
            ))
            ->values();

        $studentIds = $students->pluck('id');
        $alreadyPromoted = StudentPromotion::query()
            ->where('from_academic_year_id', $yearId)
            ->whereIn('student_id', $studentIds)
            ->pluck('student_id')
            ->flip();

        $results = $this->latestResults($yearId, $studentIds);
        $nextClasses = [];
        $classIds = collect();
        $sectionIds = collect();

        $payload = $students->map(function (Student $student) use ($alreadyPromoted, $results, $activeClasses, &$nextClasses, $classIds, $sectionIds) {
            $source = $activeClasses->firstWhere('id', $student->class_id) ?? $student->schoolClass;
            $nextClass = $source ? $this->nextClassFrom($activeClasses, $source) : null;
            $defaultSection = $this->defaultTargetSection($nextClass, $student->section?->name);
            $result = $results->get($student->id);

            if ($source) {
                $classIds->push($source->id);
                $sectionIds->push(...$source->sections->pluck('id'));
            }
            if ($nextClass) {
                $nextClasses[$nextClass->id] = $nextClass;
                $classIds->push($nextClass->id);
                $sectionIds->push(...$nextClass->sections->pluck('id'));
            }

            return [
                'id' => $student->id,
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'photo_url' => $student->photo_url,
                'class_id' => $student->class_id,
                'class_name' => $student->schoolClass?->name,
                'section_id' => $student->section_id,
                'section_name' => $student->section?->name,
                'next_class_id' => $nextClass?->id,
                'next_class_name' => $nextClass?->name,
                'default_section_id' => $defaultSection?->id,
                'result_status' => $result?->result_status,
                'result_summary' => $this->resultSummary($result),
                'already_promoted' => $alreadyPromoted->has($student->id),
            ];
        })->values();

        $feeClassIds = $classIds->filter()->unique()->isEmpty()
            ? []
            : FeeStructure::query()
                ->where('academic_year_id', $toYearId)
                ->whereIn('class_id', $classIds->filter()->unique()->all())
                ->pluck('class_id')
                ->unique()
                ->values()
                ->all();

        $singleNext = count($nextClasses) === 1 ? array_values($nextClasses)[0] : null;

        return [
            'students' => $payload,
            'next_class' => $this->classPayload($singleNext),
            'source_class' => $this->classPayload($sourceClass),
            'fee_structure_class_ids' => $feeClassIds,
            'taken_rolls' => $this->takenRolls($toYearId, $sectionIds->filter()->unique()->all()),
            'source_year_is_current' => (bool) AcademicYear::where('id', $yearId)->value('is_current'),
        ];
    }

    public function promote(array $validated, int $userId): array
    {
        $fromYearId = (int) $validated['from_academic_year_id'];
        $toYearId = (int) $validated['to_academic_year_id'];
        $fromClassId = ! empty($validated['from_class_id']) ? (int) $validated['from_class_id'] : null;
        $fromSectionId = ! empty($validated['from_section_id']) ? (int) $validated['from_section_id'] : null;
        $decisions = collect($validated['decisions']);

        if ($decisions->pluck('student_id')->unique()->count() !== $decisions->count()) {
            throw ValidationException::withMessages([
                'decisions' => 'Each student can only be included once.',
            ]);
        }

        $activeClasses = SchoolClass::with('sections')->where('status', 'active')->get();
        $students = Student::with(['user', 'section', 'schoolClass'])
            ->whereIn('id', $decisions->pluck('student_id'))
            ->get()
            ->keyBy('id');

        $existingIds = StudentPromotion::query()
            ->where('from_academic_year_id', $fromYearId)
            ->whereIn('student_id', $students->keys())
            ->pluck('student_id');

        if ($existingIds->isNotEmpty()) {
            $names = $existingIds
                ->map(fn ($id) => $students->get($id)?->full_name ?? 'Student')
                ->implode(', ');

            throw ValidationException::withMessages([
                'decisions' => "Already promoted from this academic year: {$names}.",
            ]);
        }

        $rows = $decisions->map(function (array $decision) use ($students, $fromYearId, $fromClassId, $fromSectionId, $activeClasses) {
            $student = $students->get($decision['student_id']);
            if (
                ! $student
                || (int) $student->academic_year_id !== $fromYearId
                || $student->status !== 'active'
                || ($fromClassId && (int) $student->class_id !== $fromClassId)
                || ($fromSectionId && (int) $student->section_id !== $fromSectionId)
            ) {
                throw ValidationException::withMessages([
                    'decisions' => 'Every selected student must still be active in the chosen session.',
                ]);
            }

            $sourceClass = $activeClasses->firstWhere('id', $student->class_id) ?? $student->schoolClass;
            if (! $sourceClass) {
                throw ValidationException::withMessages([
                    'decisions' => "{$student->full_name} has no class to promote from.",
                ]);
            }

            [$toClassId, $toSectionId] = $this->resolveDestination(
                $student,
                $decision['status'],
                isset($decision['to_section_id']) ? (int) $decision['to_section_id'] : null,
                $sourceClass,
                $this->nextClassFrom($activeClasses, $sourceClass)
            );

            return [
                'student' => $student,
                'student_id' => $student->id,
                'status' => $decision['status'],
                'to_class_id' => $toClassId,
                'to_section_id' => $toSectionId,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
            ];
        });

        $rolls = $this->assignRolls($rows, $toYearId);
        $missingFeeClasses = $this->missingFeeClassNames($toYearId, $rows->pluck('to_class_id')->filter()->unique()->all());

        DB::transaction(function () use ($rows, $rolls, $validated, $fromYearId, $toYearId, $userId) {
            foreach ($rows as $row) {
                /** @var Student $student */
                $student = $row['student'];
                $fromSession = StudentSession::firstOrCreate(
                    [
                        'student_id' => $student->id,
                        'academic_year_id' => $fromYearId,
                    ],
                    [
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'roll_number' => $student->roll_number,
                        'status' => 'enrolled',
                    ]
                );

                if ($fromSession->roll_number === null && $student->roll_number) {
                    $fromSession->roll_number = $student->roll_number;
                }

                $fromSession->class_id = $student->class_id;
                $fromSession->section_id = $student->section_id;
                $fromSession->status = $row['status'];
                $fromSession->save();

                $toRoll = $rolls[$student->id] ?? null;

                $promotion = StudentPromotion::create([
                    'student_id' => $student->id,
                    'from_academic_year_id' => $fromYearId,
                    'to_academic_year_id' => $toYearId,
                    'from_class_id' => $student->class_id,
                    'to_class_id' => $row['to_class_id'],
                    'from_section_id' => $student->section_id,
                    'to_section_id' => $row['to_section_id'],
                    'promotion_date' => $validated['promotion_date'],
                    'from_roll' => $fromSession->roll_number,
                    'to_roll' => $toRoll,
                    'status' => $row['status'],
                    'remarks' => $validated['remarks'] ?? null,
                    'promoted_by' => $userId,
                ]);

                if ($row['status'] === 'passed_out') {
                    $student->update([
                        'status' => 'passed',
                        'status_changed_at' => $validated['promotion_date'],
                        'status_reason' => $validated['remarks'] ?: 'Passed out',
                    ]);
                } else {
                    $student->update([
                        'academic_year_id' => $toYearId,
                        'class_id' => $row['to_class_id'],
                        'section_id' => $row['to_section_id'],
                        'roll_number' => $toRoll,
                        'status' => 'active',
                    ]);
                }

                StudentSession::syncPlacement($student->fresh());

                $name = $student->user->name ?? $student->full_name;
                logActivity('create', "Promoted student: {$name}", StudentPromotion::class, $promotion->id);
            }
        });

        return [
            'count' => $rows->count(),
            'missing_fee_classes' => $missingFeeClasses,
        ];
    }

    public function revert(StudentPromotion $promotion): void
    {
        $student = $promotion->student()->withTrashed()->first();
        if (! $student) {
            throw ValidationException::withMessages([
                'promotion' => 'This student record no longer exists.',
            ]);
        }

        if ($this->targetYearHasActivity($student->id, (int) $promotion->to_academic_year_id)) {
            $yearName = AcademicYear::where('id', $promotion->to_academic_year_id)->value('name') ?? 'the target year';

            throw ValidationException::withMessages([
                'promotion' => "Cannot revert {$student->full_name}. Attendance or fees already exist in {$yearName}.",
            ]);
        }

        DB::transaction(function () use ($promotion, $student) {
            $fromSession = StudentSession::query()
                ->where('student_id', $student->id)
                ->where('academic_year_id', $promotion->from_academic_year_id)
                ->first();

            $sectionId = $promotion->from_section_id ?: $fromSession?->section_id ?: $student->section_id;
            if (! $sectionId) {
                throw ValidationException::withMessages([
                    'promotion' => 'Cannot revert because the previous section is missing.',
                ]);
            }

            $student->update([
                'academic_year_id' => $promotion->from_academic_year_id,
                'class_id' => $promotion->from_class_id,
                'section_id' => $sectionId,
                'roll_number' => $promotion->from_roll ?? $fromSession?->roll_number ?? $student->roll_number,
                'status' => 'active',
                'status_changed_at' => $promotion->status === 'passed_out' ? now() : $student->status_changed_at,
                'status_reason' => $promotion->status === 'passed_out' ? null : $student->status_reason,
            ]);

            if (
                $promotion->status !== 'passed_out'
                && (int) $promotion->to_academic_year_id !== (int) $promotion->from_academic_year_id
            ) {
                StudentSession::query()
                    ->where('student_id', $student->id)
                    ->where('academic_year_id', $promotion->to_academic_year_id)
                    ->delete();
            }

            StudentSession::syncPlacement($student->fresh());

            $name = $student->user->name ?? $student->full_name;
            $promotionId = $promotion->id;
            $promotion->delete();

            logActivity('delete', "Reverted promotion for student: {$name}", StudentPromotion::class, $promotionId);
        });
    }

    /**
     * @param  Collection<int, array{student_id: int, status: string, to_section_id: int|null, first_name: string, last_name: string}>  $rows
     * @return array<int, string>
     */
    public function assignRolls(Collection $rows, int $toYearId): array
    {
        $moving = $rows->filter(fn (array $row) => $row['status'] !== 'passed_out' && $row['to_section_id']);
        $taken = $this->takenRolls($toYearId, $moving->pluck('to_section_id')->unique()->filter()->all());
        $rolls = [];

        foreach ($moving->groupBy('to_section_id') as $sectionId => $group) {
            $used = array_fill_keys($taken[(int) $sectionId] ?? [], true);
            $sorted = $group->sort(function (array $a, array $b) {
                $left = mb_strtolower(trim($a['first_name'].' '.$a['last_name']), 'UTF-8');
                $right = mb_strtolower(trim($b['first_name'].' '.$b['last_name']), 'UTF-8');

                return $left <=> $right;
            })->values();

            $number = 1;
            foreach ($sorted as $row) {
                while (isset($used[$number])) {
                    $number++;
                }
                $rolls[$row['student_id']] = (string) $number;
                $used[$number] = true;
                $number++;
            }
        }

        return $rolls;
    }

    private function suggestStatus(?string $resultStatus, bool $hasNextClass): ?string
    {
        if ($resultStatus === 'fail') {
            return 'detained';
        }

        if ($resultStatus === 'pass' && $hasNextClass) {
            return 'promoted';
        }

        if ($resultStatus === 'pass') {
            return 'passed_out';
        }

        return null;
    }

    private function resultSummary(?Result $result): ?string
    {
        if (! $result) {
            return null;
        }

        $parts = array_filter([
            $result->result_status ? ucfirst($result->result_status) : null,
            $result->grade,
            $result->gpa !== null ? 'GPA '.number_format((float) $result->gpa, 2) : null,
        ]);

        return $parts === [] ? null : implode(' · ', $parts);
    }

    private function latestResults(int $yearId, Collection $studentIds): Collection
    {
        if ($studentIds->isEmpty()) {
            return collect();
        }

        return Result::query()
            ->select('results.*')
            ->join('exams', 'exams.id', '=', 'results.exam_id')
            ->where('exams.academic_year_id', $yearId)
            ->whereNull('exams.deleted_at')
            ->where('results.is_published', true)
            ->whereIn('results.student_id', $studentIds)
            ->orderByDesc('results.id')
            ->get()
            ->unique('student_id')
            ->keyBy('student_id');
    }

    private function nextClassFrom(Collection $classes, SchoolClass $class): ?SchoolClass
    {
        return $classes
            ->where('status', 'active')
            ->where('numeric_value', $class->numeric_value + 1)
            ->sortBy([
                ['order', 'asc'],
                ['id', 'asc'],
            ])
            ->first();
    }

    private function defaultTargetSection(?SchoolClass $nextClass, ?string $currentSectionName): ?Section
    {
        if (! $nextClass || $nextClass->sections->isEmpty()) {
            return null;
        }

        $matched = $currentSectionName
            ? $this->matchingSection($nextClass, $currentSectionName)
            : null;

        return $matched ?? $nextClass->sections->sortBy('id')->first();
    }

    private function matchingSection(?SchoolClass $class, string $sectionName): ?Section
    {
        if (! $class) {
            return null;
        }

        $needle = mb_strtolower(trim($sectionName), 'UTF-8');

        return $class->sections->first(
            fn (Section $section) => mb_strtolower(trim($section->name), 'UTF-8') === $needle
        );
    }

    /**
     * @return array{0: int|null, 1: int|null}
     */
    private function resolveDestination(Student $student, string $status, ?int $sectionId, SchoolClass $sourceClass, ?SchoolClass $nextClass): array
    {
        if ($status === 'passed_out') {
            return [null, null];
        }

        if ($status === 'promoted') {
            if (! $nextClass) {
                throw ValidationException::withMessages([
                    'decisions' => "{$student->full_name} cannot be promoted because there is no next class. Mark them as passed out.",
                ]);
            }

            $section = $nextClass->sections->firstWhere('id', $sectionId);
            if (! $section) {
                throw ValidationException::withMessages([
                    'decisions' => "Select a {$nextClass->name} section for {$student->full_name}.",
                ]);
            }

            return [$nextClass->id, $section->id];
        }

        $section = $sourceClass->sections->firstWhere('id', $sectionId);
        if (! $section) {
            throw ValidationException::withMessages([
                'decisions' => "Select a {$sourceClass->name} section for {$student->full_name}.",
            ]);
        }

        return [$sourceClass->id, $section->id];
    }

    private function classPayload(?SchoolClass $class): ?array
    {
        if (! $class) {
            return null;
        }

        return [
            'id' => $class->id,
            'name' => $class->name,
            'sections' => $class->sections->map(fn (Section $section) => [
                'id' => $section->id,
                'name' => $section->name,
            ])->values(),
        ];
    }

    /**
     * @param  array<int, int>  $sectionIds
     * @return array<int, array<int, int>>
     */
    private function takenRolls(int $yearId, array $sectionIds): array
    {
        $sectionIds = array_values(array_unique(array_map('intval', $sectionIds)));
        $map = [];
        foreach ($sectionIds as $sectionId) {
            $map[$sectionId] = [];
        }

        if ($sectionIds === []) {
            return $map;
        }

        $sessionRolls = StudentSession::query()
            ->where('academic_year_id', $yearId)
            ->whereIn('section_id', $sectionIds)
            ->whereNotNull('roll_number')
            ->get(['section_id', 'roll_number']);

        $studentRolls = Student::query()
            ->where('academic_year_id', $yearId)
            ->whereIn('section_id', $sectionIds)
            ->where('status', 'active')
            ->whereNotNull('roll_number')
            ->get(['section_id', 'roll_number']);

        foreach ($sessionRolls->concat($studentRolls) as $row) {
            $number = $this->numericRoll($row->roll_number);
            if ($number !== null) {
                $map[(int) $row->section_id][$number] = $number;
            }
        }

        foreach ($map as $sectionId => $rolls) {
            $values = array_values($rolls);
            sort($values);
            $map[$sectionId] = $values;
        }

        return $map;
    }

    private function numericRoll(?string $roll): ?int
    {
        $roll = trim((string) $roll);
        if ($roll === '' || ! ctype_digit($roll)) {
            return null;
        }

        return (int) $roll;
    }

    /**
     * @param  array<int, int>  $classIds
     * @return array<int, string>
     */
    private function missingFeeClassNames(int $yearId, array $classIds): array
    {
        if ($classIds === []) {
            return [];
        }

        $present = FeeStructure::query()
            ->where('academic_year_id', $yearId)
            ->whereIn('class_id', $classIds)
            ->pluck('class_id');

        $missingIds = collect($classIds)->diff($present);

        if ($missingIds->isEmpty()) {
            return [];
        }

        return SchoolClass::whereIn('id', $missingIds)->orderBy('numeric_value')->pluck('name')->all();
    }

    private function targetYearHasActivity(int $studentId, int $yearId): bool
    {
        $hasAttendance = StudentAttendance::query()
            ->where('student_id', $studentId)
            ->where('academic_year_id', $yearId)
            ->exists();

        if ($hasAttendance) {
            return true;
        }

        return FeeCollection::query()
            ->where('student_id', $studentId)
            ->where('academic_year_id', $yearId)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }
}
