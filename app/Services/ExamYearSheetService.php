<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Mark;
use App\Models\Result;
use App\Models\Student;
use App\Models\StudentAttendance;

class ExamYearSheetService
{
    public function attendancePercent(int $studentId, int $yearId): ?float
    {
        $base = StudentAttendance::query()
            ->where('student_id', $studentId)
            ->where('academic_year_id', $yearId);

        $total = (clone $base)->count();
        if ($total === 0) {
            return null;
        }

        $attended = (clone $base)->whereIn('status', ['present', 'late', 'half_day'])->count();

        return round(($attended / $total) * 100, 2);
    }

    public function forStudent(Student $student): array
    {
        $yearId = (int) $student->academic_year_id;

        $annualExam = Exam::query()
            ->where('academic_year_id', $yearId)
            ->where('exam_kind', 'annual')
            ->whereHas('classes', fn ($q) => $q->where('classes.id', $student->class_id))
            ->first();

        $percent = $yearId ? $this->attendancePercent($student->id, $yearId) : null;
        $minimum = $annualExam?->min_attendance_percent;
        $eligible = ($percent === null || $minimum === null) ? null : $percent >= $minimum;

        $published = Result::query()
            ->with('exam')
            ->where('student_id', $student->id)
            ->where('is_published', true)
            ->whereHas('exam', fn ($q) => $q->where('academic_year_id', $yearId))
            ->get();

        $summarize = function (Result $result): array {
            return [
                'result_id' => $result->id,
                'exam_id' => $result->exam_id,
                'exam_name' => $result->exam->name ?? 'Exam',
                'term_number' => $result->exam->term_number,
                'total_marks' => (float) $result->total_marks,
                'obtained_marks' => (float) $result->obtained_marks,
                'percentage' => (float) $result->percentage,
                'gpa' => (float) ($result->gpa ?? 0),
                'grade' => $result->grade,
                'result_status' => $result->result_status,
                'class_position' => $result->class_position,
                'section_position' => $result->section_position,
                'remarks' => $result->remarks,
            ];
        };

        $semesters = $published
            ->filter(fn (Result $result) => $result->exam && $result->exam->exam_kind === 'semester' && in_array((int) $result->exam->term_number, [1, 2], true))
            ->sortBy(fn (Result $result) => (int) $result->exam->term_number)
            ->map($summarize)
            ->values()
            ->all();

        $annual = $published
            ->first(fn (Result $result) => $result->exam && $result->exam->exam_kind === 'annual');

        $classTestMarks = Mark::query()
            ->with(['exam', 'subject'])
            ->where('student_id', $student->id)
            ->whereHas('exam', function ($q) use ($yearId, $student) {
                $q->where('exam_kind', 'class_test')
                    ->where('academic_year_id', $yearId)
                    ->whereHas('results', function ($result) use ($student) {
                        $result->where('student_id', $student->id)->where('is_published', true);
                    });
            })
            ->get();

        $classTests = $classTestMarks
            ->groupBy('subject_id')
            ->map(function ($marks) {
                $subject = $marks->first()->subject;
                $percents = $marks->map(function (Mark $mark) {
                    $full = (float) ($mark->total_marks ?: 0);

                    return $full > 0 ? ((float) $mark->obtained_marks / $full) * 100 : 0;
                });

                return [
                    'subject_name' => $subject->name ?? 'Subject',
                    'average_percent' => round((float) $percents->avg(), 2),
                    'tests' => $marks->map(fn (Mark $mark) => [
                        'exam_name' => $mark->exam->name ?? 'Class test',
                        'date' => $mark->exam->start_date?->format('d M Y'),
                        'obtained_marks' => $mark->obtained_marks,
                        'total_marks' => $mark->total_marks,
                        'grade' => $mark->grade,
                        'is_absent' => (bool) $mark->is_absent,
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();

        $weakSubjects = Mark::query()
            ->with(['subject', 'exam'])
            ->where('student_id', $student->id)
            ->where(function ($q) {
                $q->where('grade', 'F')->orWhere('is_absent', true);
            })
            ->whereHas('exam', function ($q) use ($yearId, $student) {
                $q->where('academic_year_id', $yearId)
                    ->where('exam_kind', '!=', 'class_test')
                    ->whereHas('results', function ($result) use ($student) {
                        $result->where('student_id', $student->id)->where('is_published', true);
                    });
            })
            ->get()
            ->map(fn (Mark $mark) => [
                'subject_name' => $mark->subject->name ?? 'Subject',
                'exam_name' => $mark->exam->name ?? 'Exam',
                'grade' => $mark->is_absent ? 'Absent' : ($mark->grade ?: 'F'),
                'obtained_marks' => $mark->obtained_marks,
                'total_marks' => $mark->total_marks,
            ])
            ->values()
            ->all();

        return [
            'attendance' => [
                'percent' => $percent,
                'minimum' => $minimum,
                'eligible' => $eligible,
            ],
            'semesters' => $semesters,
            'annual' => $annual ? $summarize($annual) : null,
            'class_tests' => $classTests,
            'weak_subjects' => $weakSubjects,
        ];
    }
}
