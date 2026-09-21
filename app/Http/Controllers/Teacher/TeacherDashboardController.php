<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use App\Models\ClassRoom;
use App\Models\Subject;
use App\Models\Exam;
use App\Models\Mark;
use App\Models\Notice;
use App\Models\Message;
use App\Models\ExamInvigilator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TeacherDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        // Get today's schedule
        $todaySchedule = $this->getTodaySchedule($teacher);

        // Get assigned subjects and classes
        $assignedSubjects = $teacher->subjects()->with(['subject', 'schoolClass', 'section'])->get();

        // Get today's attendance summary
        $attendanceSummary = $this->getAttendanceSummary($teacher);

        // Get pending mark entries
        $pendingMarks = $this->getPendingMarkEntries($teacher);

        // Get recent notices
        $recentNotices = Notice::where('is_published', true)
            ->where(function ($query) {
                $query->whereJsonContains('target_audience', 'Teacher')
                    ->orWhereJsonContains('target_audience', 'All');
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get invigilation duties
        $invigilationDuties = ExamInvigilator::where('teacher_id', $teacher->id)
            ->whereHas('examSchedule.exam', function ($query) {
                $query->where('exam_date', '>=', Carbon::today());
            })
            ->with(['examSchedule.exam', 'examHall'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        // Get unread messages count
        $unreadMessages = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        // Get teacher's own attendance this month
        $myAttendance = TeacherAttendance::where('teacher_id', $teacher->id)
            ->whereYear('date', Carbon::now()->year)
            ->whereMonth('date', Carbon::now()->month)
            ->get();

        $myAttendanceStats = [
            'present' => $myAttendance->where('status', 'present')->count(),
            'absent' => $myAttendance->where('status', 'absent')->count(),
            'late' => $myAttendance->where('status', 'late')->count(),
            'total_days' => $myAttendance->count(),
        ];

        return Inertia::render('Teacher/Dashboard', [
            'teacher' => [
                'id' => $teacher->id,
                'full_name' => $teacher->full_name,
                'employee_id' => $teacher->employee_id,
                'designation' => $teacher->designation,
                'phone' => $teacher->phone,
                'email' => $teacher->email,
                'photo' => $teacher->photo,
                'department' => $teacher->department,
            ],
            'todaySchedule' => $todaySchedule,
            'assignedSubjects' => $assignedSubjects,
            'attendanceSummary' => $attendanceSummary,
            'pendingMarks' => $pendingMarks,
            'recentNotices' => $recentNotices,
            'invigilationDuties' => $invigilationDuties,
            'unreadMessages' => $unreadMessages,
            'myAttendance' => $myAttendanceStats,
        ]);
    }

    private function getTodaySchedule($teacher)
    {
        $today = Carbon::now()->format('l'); // Day name (Monday, Tuesday, etc.)

        // Get routine/timetable for today
        // Assuming you have a routine table
        return $teacher->subjects()
            ->with(['subject', 'schoolClass', 'section'])
            ->get()
            ->map(function ($teacherSubject) use ($today) {
                return [
                    'subject' => $teacherSubject->subject->name ?? 'N/A',
                    'class' => $teacherSubject->schoolClass->name ?? null,
                    'section' => $teacherSubject->section->name ?? null,
                    'time' => 'TBD', // Add time from routine table
                    'room' => 'TBD', // Add room from routine table
                ];
            });
    }

    private function getAttendanceSummary($teacher)
    {
        // Get today's attendance for assigned classes
        $assignedSections = $teacher->subjects()->with(['section.schoolClass'])->get()->pluck('section')->filter()->unique('id');

        $summary = [];
        foreach ($assignedSections as $section) {
            $totalStudents = $section->students()->count();
            $presentToday = \App\Models\StudentAttendance::where('section_id', $section->id)
                ->where('date', Carbon::today())
                ->where('status', 'present')
                ->count();

            $summary[] = [
                'class' => $section->schoolClass->name ?? 'N/A',
                'section' => $section->name,
                'total' => $totalStudents,
                'present' => $presentToday,
                'absent' => $totalStudents - $presentToday,
            ];
        }

        return $summary;
    }

    private function getPendingMarkEntries($teacher)
    {
        $pendingExams = [];

        // Get teacher's assigned subjects with class and section info
        $teacherSubjects = $teacher->subjects()->with(['schoolClass', 'section', 'subject'])->get();

        // Get exams with schedules for teacher's subjects
        $exams = Exam::where('is_published', false)
            ->where('status', '!=', 'completed')
            ->whereHas('schedules', function ($query) use ($teacherSubjects) {
                $query->whereIn('subject_id', $teacherSubjects->pluck('subject_id')->toArray());
            })
            ->with(['schedules.subject', 'schedules.schoolClass'])
            ->get();

        foreach ($exams as $exam) {
            foreach ($exam->schedules as $schedule) {
                // Find matching teacher subject assignment
                $teacherSubject = $teacherSubjects->first(function ($ts) use ($schedule) {
                    return $ts->subject_id == $schedule->subject_id && $ts->class_id == $schedule->class_id;
                });

                if ($teacherSubject) {
                    // Count students in teacher's section for this class
                    $totalStudents = $teacherSubject->section ? $teacherSubject->section->students()->count() : 0;

                    // Count marks already entered for this section
                    $enteredMarks = Mark::where('exam_id', $exam->id)
                        ->where('subject_id', $schedule->subject_id)
                        ->where('class_id', $schedule->class_id)
                        ->count();

                    if ($enteredMarks < $totalStudents) {
                        $pendingExams[] = [
                            'exam_name' => $exam->name,
                            'subject' => $schedule->subject->name ?? 'N/A',
                            'class' => $schedule->schoolClass->name ?? 'N/A',
                            'section' => $teacherSubject->section->name ?? 'N/A',
                            'total_students' => $totalStudents,
                            'entered' => $enteredMarks,
                            'pending' => $totalStudents - $enteredMarks,
                        ];
                    }
                }
            }
        }

        return $pendingExams;
    }
}
