<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\Result;
use App\Models\Mark;
use App\Models\ExamSeatPlan;

class StudentExamController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get all exams for student's class
        $exams = Exam::with(['academicYear'])
            ->whereHas('classes', function($query) use ($student) {
                $query->where('class_id', $student->class_id);
            })
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function($exam) use ($student) {
                // Check if result is published for this student
                $result = Result::where('student_id', $student->id)
                    ->where('exam_id', $exam->id)
                    ->first();

                return [
                    'id' => $exam->id,
                    'name' => $exam->name,
                    'exam_date' => $exam->start_date?->format('d M Y'),
                    'total_marks' => 0,
                    'passing_marks' => 0,
                    'academic_year' => $exam->academicYear->name ?? 'N/A',
                    'has_result' => $result && $result->is_published,
                    'result_id' => $result?->id,
                ];
            });

        // Get exam schedules for student's class
        $upcomingSchedules = ExamSchedule::with(['exam', 'subject'])
            ->whereHas('exam', function($query) use ($student) {
                $query->whereHas('classes', function($q) use ($student) {
                    $q->where('class_id', $student->class_id);
                });
            })
            ->where('exam_date', '>=', now())
            ->orderBy('exam_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->take(10)
            ->get()
            ->map(function($schedule) {
                return [
                    'id' => $schedule->id,
                    'exam_name' => $schedule->exam->name ?? 'N/A',
                    'subject_name' => $schedule->subject->name ?? 'N/A',
                    'exam_date' => $schedule->exam_date?->format('d M Y'),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'duration' => $schedule->duration,
                    'room_number' => $schedule->room_number,
                ];
            });

        return Inertia::render('Student/Exams/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'roll_number' => $student->roll_number,
            ],
            'exams' => $exams,
            'upcomingSchedules' => $upcomingSchedules,
        ]);
    }

    public function show($examId)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $exam = Exam::with('academicYear')->findOrFail($examId);

        // Get exam schedule for this exam and student's class
        $schedules = ExamSchedule::with(['subject'])
            ->where('exam_id', $examId)
            ->whereHas('exam', function($query) use ($student) {
                $query->whereHas('classes', function($q) use ($student) {
                    $q->where('class_id', $student->class_id);
                });
            })
            ->orderBy('exam_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function($schedule) {
                return [
                    'id' => $schedule->id,
                    'subject_name' => $schedule->subject->name ?? 'N/A',
                    'exam_date' => $schedule->exam_date?->format('d M Y'),
                    'day' => $schedule->exam_date?->format('l'),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'duration' => $schedule->duration,
                    'room_number' => $schedule->room_number,
                ];
            });

        // Get seat plan if exists (for any schedule of this exam)
        $scheduleIds = $schedules->pluck('id')->toArray();
        $seatPlan = ExamSeatPlan::whereIn('exam_schedule_id', $scheduleIds)
            ->where('student_id', $student->id)
            ->with('examHall')
            ->first();

        return Inertia::render('Student/Exams/Show', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'roll_number' => $student->roll_number,
            ],
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'exam_date' => $exam->start_date?->format('d M Y'),
                'total_marks' => 0,
                'passing_marks' => 0,
                'academic_year' => $exam->academicYear->name ?? 'N/A',
            ],
            'schedules' => $schedules,
            'seatPlan' => $seatPlan ? [
                'hall_name' => $seatPlan->examHall->name ?? 'N/A',
                'seat_number' => $seatPlan->seat_number,
                'row_number' => $seatPlan->row_number,
            ] : null,
        ]);
    }

    public function results()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $results = Result::with(['exam', 'schoolClass'])
            ->where('student_id', $student->id)
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($result) {
                return [
                    'id' => $result->id,
                    'exam_id' => $result->exam_id,
                    'exam_name' => $result->exam->name ?? 'N/A',
                    'exam_date' => $result->exam->start_date?->format('d M Y'),
                    'total_marks' => $result->total_marks,
                    'obtained_marks' => $result->obtained_marks,
                    'percentage' => $result->percentage,
                    'gpa' => $result->gpa,
                    'grade' => $result->grade,
                    'class_position' => $result->class_position,
                    'section_position' => $result->section_position,
                    'result_status' => $result->result_status,
                    'remarks' => $result->remarks,
                ];
            });

        return Inertia::render('Student/Exams/Results', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'roll_number' => $student->roll_number,
            ],
            'results' => $results,
        ]);
    }

    public function resultDetail($resultId)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $result = Result::with(['exam', 'schoolClass'])
            ->where('id', $resultId)
            ->where('student_id', $student->id)
            ->where('is_published', true)
            ->firstOrFail();

        // Get subject-wise marks
        $marks = Mark::with('subject')
            ->where('exam_id', $result->exam_id)
            ->where('student_id', $student->id)
            ->get()
            ->map(function($mark) {
                return [
                    'id' => $mark->id,
                    'subject_name' => $mark->subject->name ?? 'N/A',
                    'theory_marks' => $mark->theory_marks,
                    'practical_marks' => $mark->practical_marks,
                    'total_marks' => $mark->total_marks,
                    'obtained_marks' => $mark->obtained_marks,
                    'grade' => $mark->grade,
                    'grade_point' => $mark->grade_point,
                    'is_absent' => $mark->is_absent,
                    'remarks' => $mark->remarks,
                ];
            });

        return Inertia::render('Student/Exams/ResultDetail', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'roll_number' => $student->roll_number,
                'admission_number' => $student->admission_number,
            ],
            'result' => [
                'id' => $result->id,
                'exam_name' => $result->exam->name ?? 'N/A',
                'exam_date' => $result->exam->start_date?->format('d M Y'),
                'total_marks' => $result->total_marks,
                'obtained_marks' => $result->obtained_marks,
                'percentage' => $result->percentage,
                'gpa' => $result->gpa,
                'grade' => $result->grade,
                'class_position' => $result->class_position,
                'section_position' => $result->section_position,
                'result_status' => $result->result_status,
                'remarks' => $result->remarks,
            ],
            'marks' => $marks,
        ]);
    }

    public function downloadMarksheet($resultId)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $result = Result::with(['exam', 'schoolClass', 'student'])
            ->where('id', $resultId)
            ->where('student_id', $student->id)
            ->where('is_published', true)
            ->firstOrFail();

        // Get subject-wise marks
        $marks = Mark::with('subject')
            ->where('exam_id', $result->exam_id)
            ->where('student_id', $student->id)
            ->get();

        // TODO: Generate PDF marksheet
        // For now, return JSON (implement PDF generation later)

        return response()->json([
            'message' => 'Marksheet download feature will be implemented with PDF generation',
            'result' => $result,
            'marks' => $marks,
        ]);
    }
}
