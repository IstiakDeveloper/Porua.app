<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\GradeSetting;
use App\Models\Mark;
use App\Models\Result;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class ResultCalculationService
{
    /**
     * Generate or re-generate results for a given exam and class.
     *
     * @param int $examId
     * @param int $classId
     * @return array
     */
    public function generate(int $examId, int $classId): array
    {
        $exam = Exam::findOrFail($examId);
        $schoolClass = SchoolClass::findOrFail($classId);

        $unverified = Mark::where('exam_id', $examId)
            ->where('class_id', $classId)
            ->whereNull('verified_by')
            ->count();

        if ($unverified > 0) {
            return [
                'success' => false,
                'message' => $unverified.' mark rows are still unverified. Verify marks, then generate results.',
                'count' => 0,
            ];
        }

        $attendance = app(ExamYearSheetService::class);
        $minimumAttendance = $exam->isAnnual() ? (int) ($exam->min_attendance_percent ?? 75) : null;

        // Fetch all active students in the class
        $students = Student::where('class_id', $classId)
            ->where('status', 'active')
            ->orderBy('roll_number')
            ->get();

        if ($students->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No active students found in this class.',
                'count' => 0,
            ];
        }

        // Fetch exam schedules to know scheduled subjects and pass criteria
        $schedules = ExamSchedule::where('exam_id', $examId)
            ->where('class_id', $classId)
            ->with('subject')
            ->get()
            ->keyBy('subject_id');

        // Fetch all grade settings ordered by min_marks desc
        $gradeSettings = GradeSetting::scaleForYear($exam->academic_year_id ? (int) $exam->academic_year_id : null);

        $compiledStudents = [];

        foreach ($students as $student) {
            // Get marks for this student in this exam
            $marks = Mark::where('exam_id', $examId)
                ->where('student_id', $student->id)
                ->with('subject')
                ->get();

            if ($marks->isEmpty()) {
                continue;
            }

            $totalFullMarks = 0;
            $totalObtainedMarks = 0;
            $totalGradePoints = 0;
            $hasFailed = false;
            $allAbsent = true;
            $evaluatedCount = 0;

            foreach ($marks as $mark) {
                $subject = $mark->subject;
                $fullMarks = (float) ($mark->total_marks > 0 ? $mark->total_marks : ($subject->total_marks ?? 100));
                
                // If marked absent
                if ($mark->is_absent) {
                    $obtainedMarks = 0.0;
                    $gp = 0.0;
                    $grade = 'F';
                    $hasFailed = true;
                } else {
                    $allAbsent = false;
                    $theory = (float) ($mark->theory_marks ?? 0);
                    $practical = (float) ($mark->practical_marks ?? 0);
                    
                    // If obtained_marks is already recorded, use it; otherwise compute from theory + practical
                    $obtainedMarks = $mark->obtained_marks !== null 
                        ? (float) $mark->obtained_marks 
                        : ($theory + $practical);

                    // Pass marks: from subject pass_marks or 33% of full marks
                    $passMarks = (float) ($subject->pass_marks ?? round($fullMarks * 0.33, 2));

                    // Subject percentage
                    $subjectPercentage = $fullMarks > 0 ? ($obtainedMarks / $fullMarks) * 100 : 0;

                    if ($obtainedMarks < $passMarks) {
                        $gp = 0.0;
                        $grade = 'F';
                        $hasFailed = true;
                    } else {
                        $gradeInfo = $this->getGradeForPercentage($subjectPercentage, $gradeSettings);
                        $gp = $gradeInfo['gpa'];
                        $grade = $gradeInfo['grade'];
                    }
                }

                // Synchronize the mark record so subject-wise view is always accurate
                $mark->update([
                    'total_marks' => $fullMarks,
                    'obtained_marks' => $obtainedMarks,
                    'grade' => $grade,
                    'grade_point' => $gp,
                ]);

                $totalFullMarks += $fullMarks;
                $totalObtainedMarks += $obtainedMarks;
                $totalGradePoints += $gp;
                $evaluatedCount++;
            }

            if ($evaluatedCount === 0) {
                continue;
            }

            $overallPercentage = $totalFullMarks > 0 ? round(($totalObtainedMarks / $totalFullMarks) * 100, 2) : 0.0;

            if ($allAbsent) {
                $status = 'absent';
                $gpa = 0.00;
                $finalGrade = 'F';
                $remarks = 'Absent in all subjects';
            } elseif ($hasFailed) {
                $status = 'fail';
                $gpa = 0.00;
                $finalGrade = 'F';
                $remarks = 'Failed in one or more subjects';
            } else {
                $status = 'pass';
                $gpa = round($totalGradePoints / $evaluatedCount, 2);
                $finalGrade = $this->getGradeForGpa($gpa);
                $remarks = $this->getRemarksForGpa($gpa);
            }

            if ($minimumAttendance !== null && $exam->academic_year_id) {
                $percent = $attendance->attendancePercent($student->id, (int) $exam->academic_year_id);
                if ($percent !== null && $percent < $minimumAttendance) {
                    $status = 'fail';
                    $gpa = 0.00;
                    $finalGrade = 'F';
                    $remarks = 'Attendance '.$percent.'% is below the '.$minimumAttendance.'% annual requirement';
                }
            }

            $compiledStudents[] = [
                'student_id' => $student->id,
                'section_id' => $student->section_id,
                'roll_number' => (int) ($student->roll_number ?? 999999),
                'total_marks' => $totalFullMarks,
                'obtained_marks' => $totalObtainedMarks,
                'percentage' => $overallPercentage,
                'gpa' => $gpa,
                'grade' => $finalGrade,
                'status' => $status,
                'remarks' => $remarks,
            ];
        }

        if (empty($compiledStudents)) {
            return [
                'success' => false,
                'message' => 'No student marks found to generate results.',
                'count' => 0,
            ];
        }

        // ==========================================
        // 1. Calculate Class Positions (Merit Order)
        // Passed students first by GPA DESC -> Obtained Marks DESC -> Roll ASC
        // Then failed/absent students by Obtained Marks DESC -> Roll ASC
        // ==========================================
        usort($compiledStudents, function ($a, $b) {
            $statusWeight = ['pass' => 3, 'fail' => 2, 'absent' => 1];
            $weightA = $statusWeight[$a['status']] ?? 0;
            $weightB = $statusWeight[$b['status']] ?? 0;

            if ($weightA !== $weightB) {
                return $weightB <=> $weightA;
            }

            if ($a['status'] === 'pass') {
                if ($a['gpa'] != $b['gpa']) {
                    return $b['gpa'] <=> $a['gpa'];
                }
            }

            if ($a['obtained_marks'] != $b['obtained_marks']) {
                return $b['obtained_marks'] <=> $a['obtained_marks'];
            }

            return $a['roll_number'] <=> $b['roll_number'];
        });

        foreach ($compiledStudents as $index => &$item) {
            $item['class_position'] = $index + 1;
        }
        unset($item);

        // ==========================================
        // 2. Calculate Section Positions
        // ==========================================
        $sectionGroups = [];
        foreach ($compiledStudents as $item) {
            $secId = $item['section_id'] ?? 0;
            $sectionGroups[$secId][] = $item;
        }

        $finalStudentResults = [];
        foreach ($sectionGroups as $secId => $groupStudents) {
            // Already sorted according to the merit criteria, just assign section position
            foreach ($groupStudents as $secIndex => $st) {
                $st['section_position'] = $secIndex + 1;
                $finalStudentResults[$st['student_id']] = $st;
            }
        }

        // ==========================================
        // 3. Save to Database in Transaction
        // ==========================================
        DB::beginTransaction();
        try {
            foreach ($finalStudentResults as $studentId => $res) {
                Result::updateOrCreate(
                    [
                        'exam_id' => $examId,
                        'student_id' => $studentId,
                    ],
                    [
                        'class_id' => $classId,
                        'total_marks' => $res['total_marks'],
                        'obtained_marks' => $res['obtained_marks'],
                        'percentage' => $res['percentage'],
                        'gpa' => $res['gpa'],
                        'grade' => $res['grade'],
                        'class_position' => $res['class_position'],
                        'section_position' => $res['section_position'],
                        'result_status' => $res['status'],
                        'remarks' => $res['remarks'],
                    ]
                );
            }

            DB::commit();

            return [
                'success' => true,
                'message' => 'Results generated successfully for ' . count($finalStudentResults) . ' students.',
                'count' => count($finalStudentResults),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get Tabulation Sheet data for an exam and class.
     */
    public function getTabulationData(int $examId, int $classId, ?int $sectionId = null): array
    {
        $exam = Exam::with('academicYear')->findOrFail($examId);
        $schoolClass = SchoolClass::with('sections')->findOrFail($classId);

        // Subjects from exam schedules or class subjects
        $scheduledSubjects = ExamSchedule::where('exam_id', $examId)
            ->where('class_id', $classId)
            ->with('subject')
            ->get()
            ->pluck('subject')
            ->filter()
            ->unique('id')
            ->values();

        if ($scheduledSubjects->isEmpty()) {
            $scheduledSubjects = $schoolClass->subjects()->where('subjects.status', 'active')->get();
        }

        $query = Student::where('class_id', $classId)
            ->where('status', 'active')
            ->with(['user', 'section', 'results' => function ($q) use ($examId) {
                $q->where('exam_id', $examId);
            }, 'marks' => function ($q) use ($examId) {
                $q->where('exam_id', $examId);
            }]);

        if ($sectionId) {
            $query->where('section_id', $sectionId);
        }

        $students = $query->orderBy('roll_number')->get();

        $rows = [];
        foreach ($students as $student) {
            $result = $student->results->first();
            $marksKeyed = $student->marks->keyBy('subject_id');

            $subjectMarks = [];
            foreach ($scheduledSubjects as $sub) {
                $m = $marksKeyed->get($sub->id);
                $subjectMarks[$sub->id] = [
                    'subject_name' => $sub->name,
                    'theory_marks' => $m ? $m->theory_marks : null,
                    'practical_marks' => $m ? $m->practical_marks : null,
                    'obtained_marks' => $m ? $m->obtained_marks : null,
                    'full_marks' => $m ? $m->total_marks : ($sub->total_marks ?? 100),
                    'grade' => $m ? $m->grade : '-',
                    'grade_point' => $m ? $m->grade_point : '-',
                    'is_absent' => $m ? (bool)$m->is_absent : false,
                ];
            }

            $rows[] = [
                'student_id' => $student->id,
                'roll_number' => $student->roll_number,
                'student_name' => $student->full_name,
                'section_name' => $student->section->name ?? 'N/A',
                'subject_marks' => $subjectMarks,
                'total_marks' => $result ? $result->total_marks : null,
                'obtained_marks' => $result ? $result->obtained_marks : null,
                'percentage' => $result ? $result->percentage : null,
                'gpa' => $result ? $result->gpa : null,
                'grade' => $result ? $result->grade : null,
                'class_position' => $result ? $result->class_position : null,
                'section_position' => $result ? $result->section_position : null,
                'result_status' => $result ? $result->result_status : null,
            ];
        }

        // Sort rows by class position if generated
        usort($rows, function ($a, $b) {
            if ($a['class_position'] !== null && $b['class_position'] !== null) {
                return $a['class_position'] <=> $b['class_position'];
            }
            return ((int)$a['roll_number']) <=> ((int)$b['roll_number']);
        });

        return [
            'exam' => $exam,
            'schoolClass' => $schoolClass,
            'subjects' => $scheduledSubjects,
            'rows' => $rows,
            'section_id' => $sectionId,
        ];
    }

    /**
     * Helper to get grade & GP from percentage.
     */
    private function getGradeForPercentage(float $percentage, $gradeSettings): array
    {
        if ($gradeSettings && $gradeSettings->isNotEmpty()) {
            foreach ($gradeSettings as $setting) {
                if ($percentage >= $setting->min_marks && $percentage <= $setting->max_marks) {
                    return [
                        'grade' => $setting->grade_name,
                        'gpa' => (float) $setting->grade_point,
                        'remarks' => $setting->remarks,
                    ];
                }
            }
        }

        // Standard Default Scale (NCTB)
        if ($percentage >= 80) return ['grade' => 'A+', 'gpa' => 5.0, 'remarks' => 'Outstanding'];
        if ($percentage >= 70) return ['grade' => 'A',  'gpa' => 4.0, 'remarks' => 'Excellent'];
        if ($percentage >= 60) return ['grade' => 'A-', 'gpa' => 3.5, 'remarks' => 'Very Good'];
        if ($percentage >= 50) return ['grade' => 'B',  'gpa' => 3.0, 'remarks' => 'Good'];
        if ($percentage >= 40) return ['grade' => 'C',  'gpa' => 2.0, 'remarks' => 'Satisfactory'];
        if ($percentage >= 33) return ['grade' => 'D',  'gpa' => 1.0, 'remarks' => 'Pass'];
        return ['grade' => 'F', 'gpa' => 0.0, 'remarks' => 'Fail'];
    }

    /**
     * Helper to get overall letter grade from average GPA.
     */
    private function getGradeForGpa(float $gpa): string
    {
        if ($gpa >= 5.0) return 'A+';
        if ($gpa >= 4.0) return 'A';
        if ($gpa >= 3.5) return 'A-';
        if ($gpa >= 3.0) return 'B';
        if ($gpa >= 2.0) return 'C';
        if ($gpa >= 1.0) return 'D';
        return 'F';
    }

    /**
     * Helper to get remarks from GPA.
     */
    private function getRemarksForGpa(float $gpa): string
    {
        if ($gpa >= 5.0) return 'Outstanding';
        if ($gpa >= 4.0) return 'Excellent';
        if ($gpa >= 3.5) return 'Very Good';
        if ($gpa >= 3.0) return 'Good';
        if ($gpa >= 2.0) return 'Satisfactory';
        if ($gpa >= 1.0) return 'Passed';
        return 'Failed';
    }
}
