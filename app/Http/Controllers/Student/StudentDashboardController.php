<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\FeeCollection;
use App\Models\Exam;
use App\Models\Result;
use App\Models\Notice;
use App\Models\BookIssue;
use App\Models\Message;
use Carbon\Carbon;

class StudentDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get student record
        $student = Student::with([
            'academicYear',
            'schoolClass',
            'section',
            'user'
        ])->where('user_id', $user->id)->firstOrFail();

        // Get attendance summary
        $attendanceSummary = $this->getAttendanceSummary($student->id);

        // Get fee status
        $feeStatus = $this->getFeeStatus($student->id);

        // Get recent exams
        $recentExams = $this->getRecentExams($student->class_id);

        // Get published results
        $recentResults = $this->getRecentResults($student->id);

        // Get recent notices (for students)
        $recentNotices = Notice::published()
            ->active()
            ->where(function($query) use ($student) {
                $query->whereJsonContains('target_audience', 'Student')
                    ->orWhereJsonContains('target_classes', $student->class_id);
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'title', 'type', 'priority', 'valid_from', 'valid_to', 'created_at']);

        // Get issued books
        $issuedBooks = BookIssue::with('book')
            ->where('issueable_type', Student::class)
            ->where('issueable_id', $student->id)
            ->whereIn('status', ['issued', 'overdue'])
            ->orderBy('issue_date', 'desc')
            ->take(5)
            ->get();

        // Get unread messages count
        $unreadMessagesCount = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Student/Dashboard', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'photo_url' => $student->photo_url,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'academic_year' => $student->academicYear->name ?? 'N/A',
                'phone' => $student->phone,
                'email' => $student->email,
                'blood_group' => $student->blood_group,
            ],
            'attendanceSummary' => $attendanceSummary,
            'feeStatus' => $feeStatus,
            'recentExams' => $recentExams,
            'recentResults' => $recentResults,
            'recentNotices' => $recentNotices,
            'issuedBooks' => $issuedBooks,
            'unreadMessagesCount' => $unreadMessagesCount,
        ]);
    }

    private function getAttendanceSummary($studentId)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Total attendance this month
        $monthlyAttendance = StudentAttendance::where('student_id', $studentId)
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->get();

        $totalDays = $monthlyAttendance->count();
        $presentDays = $monthlyAttendance->where('status', 'present')->count();
        $absentDays = $monthlyAttendance->where('status', 'absent')->count();
        $lateDays = $monthlyAttendance->where('status', 'late')->count();

        // Today's attendance
        $todayAttendance = StudentAttendance::where('student_id', $studentId)
            ->whereDate('date', Carbon::today())
            ->first();

        // Overall percentage (this academic year)
        $yearlyAttendance = StudentAttendance::where('student_id', $studentId)
            ->whereYear('date', $currentYear)
            ->get();

        $yearlyTotal = $yearlyAttendance->count();
        $yearlyPresent = $yearlyAttendance->where('status', 'present')->count();
        $attendancePercentage = $yearlyTotal > 0 ? round(($yearlyPresent / $yearlyTotal) * 100, 2) : 0;

        return [
            'today' => [
                'status' => $todayAttendance?->status ?? 'Not Marked',
                'in_time' => $todayAttendance?->in_time?->format('h:i A'),
                'out_time' => $todayAttendance?->out_time?->format('h:i A'),
            ],
            'monthly' => [
                'total' => $totalDays,
                'present' => $presentDays,
                'absent' => $absentDays,
                'late' => $lateDays,
                'percentage' => $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0,
            ],
            'yearly' => [
                'total' => $yearlyTotal,
                'present' => $yearlyPresent,
                'percentage' => $attendancePercentage,
            ],
        ];
    }

    private function getFeeStatus($studentId)
    {
        $outstanding = FeeCollection::with('feeType')
            ->where('student_id', $studentId)
            ->outstanding()
            ->get();

        $totalPaid = FeeCollection::where('student_id', $studentId)
            ->where('status', 'paid')
            ->sum('paid_amount');

        $recentPayments = FeeCollection::with('feeType')
            ->where('student_id', $studentId)
            ->where('status', 'paid')
            ->orderBy('payment_date', 'desc')
            ->take(5)
            ->get();

        return [
            'total_paid' => round($totalPaid, 2),
            'total_due' => round($outstanding->sum(fn ($fee) => $fee->remaining), 2),
            'overdue_count' => $outstanding->where('status', 'overdue')->count(),
            'recent_payments' => $recentPayments->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'receipt_number' => $fee->receipt_number,
                    'fee_type' => $fee->feeType->name ?? 'N/A',
                    'amount' => $fee->paid_amount,
                    'payment_date' => $fee->payment_date?->format('d M Y'),
                ];
            }),
        ];
    }

    private function getRecentExams($classId)
    {
        return Exam::with('academicYear')
            ->whereHas('classes', function($query) use ($classId) {
                $query->where('class_id', $classId);
            })
            ->where('start_date', '>=', Carbon::now()->subDays(30))
            ->orderBy('start_date', 'desc')
            ->take(5)
            ->get()
            ->map(function($exam) {
                return [
                    'id' => $exam->id,
                    'name' => $exam->name,
                    'exam_date' => $exam->start_date->format('d M Y'),
                    'total_marks' => 0,
                    'passing_marks' => 0,
                ];
            });
    }

    private function getRecentResults($studentId)
    {
        return Result::with(['exam', 'schoolClass'])
            ->where('student_id', $studentId)
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($result) {
                return [
                    'id' => $result->id,
                    'exam_name' => $result->exam->name ?? 'N/A',
                    'total_marks' => $result->total_marks,
                    'obtained_marks' => $result->obtained_marks,
                    'percentage' => $result->percentage,
                    'gpa' => $result->gpa,
                    'grade' => $result->grade,
                    'position' => $result->class_position,
                    'result_status' => $result->result_status,
                ];
            });
    }
}
