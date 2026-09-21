<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Event;
use Carbon\Carbon;

class StudentEventController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $type = $request->input('type'); // academic, cultural, sports, holiday
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $events = Event::whereYear('start_date', $year)
            ->when($month, function($query, $month) {
                $query->whereMonth('start_date', $month);
            })
            ->when($type, function($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy('start_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'type' => $event->type,
                    'event_date' => $event->start_date?->format('Y-m-d'),
                    'event_date_formatted' => $event->start_date?->format('d M Y'),
                    'start_time' => $event->start_time?->format('H:i'),
                    'end_time' => $event->end_time?->format('H:i'),
                    'location' => $event->location,
                    'organizer' => $event->creator->name ?? 'Administration',
                ];
            });

        return Inertia::render('Student/Events/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
            ],
            'events' => $events,
            'filters' => [
                'type' => $type,
                'month' => (int)$month,
                'year' => (int)$year,
            ],
        ]);
    }

    public function calendar(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        // Get all events for the calendar view
        $events = Event::whereYear('start_date', $year)
            ->whereMonth('start_date', $month)
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->start_date?->format('Y-m-d'),
                    'type' => $event->type,
                    'start_time' => $event->start_time?->format('H:i'),
                    'end_time' => $event->end_time?->format('H:i'),
                    'location' => $event->location,
                ];
            });

        return Inertia::render('Student/Events/Calendar', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
            ],
            'events' => $events,
            'currentMonth' => (int)$month,
            'currentYear' => (int)$year,
        ]);
    }
}
