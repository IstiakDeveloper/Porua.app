<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BatchRoutineController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_coaching_routine');

        $teacherId = $request->input('teacher_id');
        $roomNo = $request->input('room_no');

        $batches = Batch::with(['course', 'teacher.user'])
            ->where('status', 'active')
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($roomNo, fn($q) => $q->where('room_no', $roomNo))
            ->orderBy('start_time')
            ->get();

        $daysOfWeek = [
            ['key' => 'Sat', 'full' => 'Saturday', 'bangla' => 'শনিবার'],
            ['key' => 'Sun', 'full' => 'Sunday', 'bangla' => 'রবিবার'],
            ['key' => 'Mon', 'full' => 'Monday', 'bangla' => 'সোমবার'],
            ['key' => 'Tue', 'full' => 'Tuesday', 'bangla' => 'মঙ্গলবার'],
            ['key' => 'Wed', 'full' => 'Wednesday', 'bangla' => 'বুধবার'],
            ['key' => 'Thu', 'full' => 'Thursday', 'bangla' => 'বৃহস্পতিবার'],
            ['key' => 'Fri', 'full' => 'Friday', 'bangla' => 'শুক্রবার'],
        ];

        $scheduleByDay = [];

        foreach ($daysOfWeek as $day) {
            $dayKey = $day['key'];
            $dayFull = $day['full'];

            $dayBatches = $batches->filter(function ($batch) use ($dayKey, $dayFull) {
                $days = is_array($batch->days_of_week) ? $batch->days_of_week : [];
                return in_array($dayKey, $days) || in_array($dayFull, $days);
            })->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'course_name' => $batch->course?->name ?? 'N/A',
                    'teacher_name' => $batch->teacher?->user?->name ?? 'Unassigned',
                    'room_no' => $batch->room_no ?? 'TBA',
                    'start_time' => $batch->start_time ? date('h:i A', strtotime($batch->start_time)) : '',
                    'end_time' => $batch->end_time ? date('h:i A', strtotime($batch->end_time)) : '',
                    'max_capacity' => $batch->max_capacity,
                    'enrolled_count' => $batch->batchEnrollments()->where('status', 'active')->count(),
                ];
            })->values();

            $scheduleByDay[$dayKey] = [
                'day' => $day,
                'batches' => $dayBatches,
            ];
        }

        // Distinct rooms and teachers for filtering
        $rooms = Batch::whereNotNull('room_no')->where('room_no', '!=', '')->distinct()->pluck('room_no')->sort()->values();
        $teachers = Teacher::with('user')->where('status', 'active')->get()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->user?->name ?? 'Teacher #'.$t->id,
        ]);

        return Inertia::render('Coaching/Routine/Index', [
            'scheduleByDay' => $scheduleByDay,
            'daysOfWeek' => $daysOfWeek,
            'rooms' => $rooms,
            'teachers' => $teachers,
            'filters' => [
                'teacher_id' => $teacherId,
                'room_no' => $roomNo,
            ],
            'totalActiveBatches' => $batches->count(),
        ]);
    }
}
