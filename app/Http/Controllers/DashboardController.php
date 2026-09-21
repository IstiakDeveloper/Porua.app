<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Account;
use App\Models\Event;
use App\Models\Exam;
use App\Models\FeeCollection;
use App\Models\Notice;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the executive dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Redirect to role-specific dashboard if user is not admin / management
        if ($user->hasRole('Student')) {
            return redirect()->route('student.dashboard');
        } elseif ($user->hasRole('Teacher')) {
            return redirect()->route('teacher.dashboard');
        } elseif ($user->hasRole('Parent')) {
            return redirect()->route('parent.dashboard');
        }

        // 1. Current Academic / Financial Year
        $academicYear = AcademicYear::where('is_current', true)->first() ?: AcademicYear::latest('start_date')->first();
        $academicYearId = $academicYear?->id;
        $academicYearName = $academicYear?->name;

        // 2. Core Counts
        $totalStudents = Student::where('status', 'active')->count();
        $totalTeachers = Teacher::where('status', 'active')->count();
        $totalClasses = SchoolClass::where('status', 'active')->count();
        $liquidBalance = (float) Account::where('status', 'active')->sum('current_balance');

        // 3. Accurate Financial Metrics for Active Session
        $feesQuery = FeeCollection::where('status', '!=', 'cancelled')
            ->when($academicYear, function ($q) use ($academicYearId, $academicYearName) {
                $q->where(function ($sq) use ($academicYearId, $academicYearName) {
                    if ($academicYearId) {
                        $sq->where('academic_year_id', $academicYearId);
                    }
                    if (is_numeric($academicYearName)) {
                        $sq->orWhere('year', (int) $academicYearName);
                    }
                });
            });

        $feeRecords = $feesQuery->get(['id', 'month', 'year', 'amount', 'late_fee', 'discount', 'paid_amount', 'payment_date']);

        $totalBilled = 0.0;
        $totalPaid = 0.0;
        $todayCollection = 0.0;
        $thisMonthCollection = 0.0;
        $now = now();

        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun',
            7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec',
        ];

        $monthlyTrends = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyTrends[$m] = [
                'month' => $m,
                'name' => $monthNames[$m],
                'billed' => 0.0,
                'paid' => 0.0,
                'due' => 0.0,
            ];
        }

        foreach ($feeRecords as $fee) {
            $amount = (float) $fee->amount + (float) $fee->late_fee - (float) $fee->discount;
            $paid = (float) $fee->paid_amount;
            $totalBilled += $amount;
            $totalPaid += $paid;

            $m = $fee->month ? (int) $fee->month : ($fee->payment_date ? (int) $fee->payment_date->month : null);
            if ($m && isset($monthlyTrends[$m])) {
                $monthlyTrends[$m]['billed'] += $amount;
                $monthlyTrends[$m]['paid'] += $paid;
            }

            if ($fee->payment_date) {
                if ($fee->payment_date->isToday()) {
                    $todayCollection += $paid;
                }
                if ($fee->payment_date->month === $now->month && $fee->payment_date->year === $now->year) {
                    $thisMonthCollection += $paid;
                }
            }
        }

        foreach ($monthlyTrends as &$mt) {
            $mt['due'] = max($mt['billed'] - $mt['paid'], 0);
        }
        unset($mt);

        $totalDue = max($totalBilled - $totalPaid, 0);
        $collectionRate = $totalBilled > 0 ? round(($totalPaid / $totalBilled) * 100, 1) : 0;

        // 4. Attendance Statistics (Smart Fallback if Today is not recorded yet)
        $todayStr = now()->toDateString();
        $isToday = true;
        $studentTotal = StudentAttendance::where('date', $todayStr)->count();

        if ($studentTotal === 0) {
            $latestDate = StudentAttendance::max('date');
            if ($latestDate) {
                $attendanceDate = $latestDate;
                $isToday = false;
                $studentTotal = StudentAttendance::where('date', $attendanceDate)->count();
            } else {
                $attendanceDate = $todayStr;
            }
        } else {
            $attendanceDate = $todayStr;
        }

        $studentPresent = StudentAttendance::where('date', $attendanceDate)->where('status', 'present')->count();
        $studentAbsent = StudentAttendance::where('date', $attendanceDate)->where('status', 'absent')->count();
        $studentLate = StudentAttendance::where('date', $attendanceDate)->where('status', 'late')->count();
        $studentRate = $studentTotal > 0 ? round(($studentPresent / $studentTotal) * 100, 1) : 0;

        $teacherTotal = TeacherAttendance::where('date', $attendanceDate)->count();
        $teacherPresent = TeacherAttendance::where('date', $attendanceDate)->whereIn('status', ['present', 'late', 'early_leave'])->count();
        $teacherAbsent = TeacherAttendance::where('date', $attendanceDate)->where('status', 'absent')->count();
        $teacherRate = $teacherTotal > 0 ? round(($teacherPresent / $teacherTotal) * 100, 1) : 0;

        // 5. Recent Live Paid Collections
        $recentCollections = FeeCollection::with(['student.schoolClass', 'feeType'])
            ->where('status', 'paid')
            ->latest('payment_date')
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(function ($c) {
                $student = $c->student;
                $sName = $student ? trim(($student->first_name ?? '').' '.($student->last_name ?? '')) : 'Unknown';
                if ($sName === '' && $student) {
                    $sName = $student->user->name ?? 'Student #'.$student->id;
                }

                return [
                    'id' => $c->id,
                    'short_receipt_number' => $c->short_receipt_number,
                    'receipt_number' => $c->receipt_number,
                    'student_name' => $sName,
                    'student_id' => $student?->student_id ?? '-',
                    'class_name' => $student?->schoolClass?->name ?? '-',
                    'fee_type' => $c->feeType?->name ?? 'Tuition Fee',
                    'amount' => (float) $c->paid_amount,
                    'payment_method' => $c->payment_method ? ucfirst($c->payment_method) : 'Cash',
                    'date' => $c->payment_date ? $c->payment_date->format('d M Y') : null,
                ];
            });

        // 6. Class-Wise Snapshot
        $classesSnapshot = SchoolClass::withCount(['students' => function ($q) {
            $q->where('status', 'active');
        }])
            ->active()
            ->ordered()
            ->limit(6)
            ->get()
            ->map(function ($cls) use ($academicYearId, $academicYearName) {
                $fees = FeeCollection::whereHas('student', function ($sq) use ($cls) {
                    $sq->where('class_id', $cls->id);
                })
                    ->where('status', '!=', 'cancelled')
                    ->when($academicYearId, function ($q) use ($academicYearId, $academicYearName) {
                        $q->where(function ($sq) use ($academicYearId, $academicYearName) {
                            $sq->where('academic_year_id', $academicYearId);
                            if (is_numeric($academicYearName)) {
                                $sq->orWhere('year', (int) $academicYearName);
                            }
                        });
                    })
                    ->get(['amount', 'late_fee', 'discount', 'paid_amount']);

                $billed = 0.0;
                $paid = 0.0;
                foreach ($fees as $f) {
                    $billed += (float) $f->amount + (float) $f->late_fee - (float) $f->discount;
                    $paid += (float) $f->paid_amount;
                }
                $due = max($billed - $paid, 0);
                $rate = $billed > 0 ? round(($paid / $billed) * 100, 1) : 0;

                return [
                    'id' => $cls->id,
                    'name' => $cls->name,
                    'student_count' => $cls->students_count,
                    'billed' => $billed,
                    'paid' => $paid,
                    'due' => $due,
                    'collection_rate' => $rate,
                ];
            });

        // 7. Upcoming Exams, Notices, Events
        $upcomingExams = Exam::where('start_date', '>=', $todayStr)
            ->orderBy('start_date')
            ->limit(5)
            ->get(['id', 'name', 'exam_type', 'start_date', 'end_date'])
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'name' => $e->name,
                    'exam_type' => $e->exam_type,
                    'start_date' => $e->start_date ? Carbon::parse($e->start_date)->format('d M Y') : null,
                    'end_date' => $e->end_date ? Carbon::parse($e->end_date)->format('d M Y') : null,
                ];
            });

        $recentNotices = Notice::where('is_published', true)
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'published_at'])
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->title,
                    'published_at' => $n->published_at ? Carbon::parse($n->published_at)->format('d M Y, h:i A') : null,
                ];
            });

        $upcomingEvents = Event::upcoming()
            ->orderBy('start_date')
            ->limit(5)
            ->get(['id', 'title', 'start_date', 'end_date', 'type'])
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'title' => $e->title,
                    'start_date' => $e->start_date ? Carbon::parse($e->start_date)->format('d M Y') : null,
                    'end_date' => $e->end_date ? Carbon::parse($e->end_date)->format('d M Y') : null,
                    'type' => $e->type,
                ];
            });

        return Inertia::render('Dashboard', [
            'academicYear' => $academicYear,
            'kpis' => [
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_classes' => $totalClasses,
                'total_billed' => $totalBilled,
                'total_collected' => $totalPaid,
                'total_due' => $totalDue,
                'collection_rate' => $collectionRate,
                'today_collection' => $todayCollection,
                'this_month_collection' => $thisMonthCollection,
                'liquid_balance' => $liquidBalance,
            ],
            'attendance' => [
                'date' => $attendanceDate,
                'formatted_date' => Carbon::parse($attendanceDate)->format('d M Y'),
                'is_today' => $isToday,
                'student_present' => $studentPresent,
                'student_absent' => $studentAbsent,
                'student_late' => $studentLate,
                'student_total' => $studentTotal,
                'student_rate' => $studentRate,
                'teacher_present' => $teacherPresent,
                'teacher_absent' => $teacherAbsent,
                'teacher_total' => $teacherTotal,
                'teacher_rate' => $teacherRate,
            ],
            'monthlyTrends' => array_values($monthlyTrends),
            'recentCollections' => $recentCollections,
            'classesSnapshot' => $classesSnapshot,
            'upcomingExams' => $upcomingExams,
            'recentNotices' => $recentNotices,
            'upcomingEvents' => $upcomingEvents,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'avatar' => $user->avatar,
            ],
        ]);
    }
}
