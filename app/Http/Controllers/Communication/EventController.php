<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::with('createdBy')
            ->when($request->event_type, fn($q) => $q->where('event_type', $request->event_type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('start_date')
            ->paginate(20)->withQueryString();

        return Inertia::render('Communication/Events/Index', [
            'events' => $events,
            'filters' => $request->only(['event_type', 'status']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_notices');

        return Inertia::render('Communication/Events/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('manage_notices');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|in:academic,sports,cultural,holiday,meeting,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'organizer' => 'nullable|string|max:255',
            'status' => 'required|in:scheduled,ongoing,completed,cancelled',
        ]);

        $event = Event::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        logActivity('create', "Created event: {$event->title}", Event::class, $event->id);

        return redirect()->route('events.index')
            ->with('success', 'Event created successfully');
    }

    public function show(Event $event)
    {
        $event->load('createdBy');

        return Inertia::render('Communication/Events/Show', [
            'event' => $event,
        ]);
    }

    public function edit(Event $event)
    {
        $this->authorize('manage_notices');

        return Inertia::render('Communication/Events/Edit', [
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $this->authorize('manage_notices');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|in:academic,sports,cultural,holiday,meeting,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'organizer' => 'nullable|string|max:255',
            'status' => 'required|in:scheduled,ongoing,completed,cancelled',
        ]);

        $event->update($validated);

        logActivity('update', "Updated event: {$event->title}", Event::class, $event->id);

        return redirect()->route('events.index')
            ->with('success', 'Event updated successfully');
    }

    public function destroy(Event $event)
    {
        $this->authorize('manage_notices');

        $eventTitle = $event->title;
        $event->delete();

        logActivity('delete', "Deleted event: {$eventTitle}", Event::class, $event->id);

        return redirect()->route('events.index')
            ->with('success', 'Event deleted successfully');
    }

    public function calendar()
    {
        $events = Event::where('status', '!=', 'cancelled')
            ->get(['id', 'title', 'start_date', 'end_date', 'event_type']);

        return Inertia::render('Communication/Events/Calendar', [
            'events' => $events,
        ]);
    }
}
