<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $notices = Notice::with('creator')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->is_published !== null, fn($q) => $q->where('is_published', $request->is_published))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Communication/Notices/Index', [
            'notices' => $notices,
            'filters' => $request->only(['type', 'is_published']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_notices');

        return Inertia::render('Communication/Notices/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('manage_notices');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,academic,event,holiday,urgent',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_audience' => 'nullable|array',
            'target_classes' => 'nullable|array',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'send_sms' => 'boolean',
            'send_email' => 'boolean',
            'is_published' => 'boolean',
        ]);

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $notice = Notice::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        logActivity('create', "Created notice: {$notice->title}", Notice::class, $notice->id);

        return redirect()->route('notices.index')
            ->with('success', 'Notice created successfully');
    }

    public function show(Notice $notice)
    {
        $notice->load('creator');

        return Inertia::render('Communication/Notices/Show', [
            'notice' => $notice,
        ]);
    }

    public function edit(Notice $notice)
    {
        $this->authorize('manage_notices');

        return Inertia::render('Communication/Notices/Edit', [
            'notice' => $notice,
        ]);
    }

    public function update(Request $request, Notice $notice)
    {
        $this->authorize('manage_notices');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,academic,event,holiday,urgent',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_audience' => 'nullable|array',
            'target_classes' => 'nullable|array',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'send_sms' => 'boolean',
            'send_email' => 'boolean',
            'is_published' => 'boolean',
        ]);

        // Set published_at if publishing for the first time
        if (($validated['is_published'] ?? false) && !$notice->published_at) {
            $validated['published_at'] = now();
        }

        $notice->update($validated);

        logActivity('update', "Updated notice: {$notice->title}", Notice::class, $notice->id);

        return redirect()->route('notices.index')
            ->with('success', 'Notice updated successfully');
    }

    public function destroy(Notice $notice)
    {
        $this->authorize('manage_notices');

        $noticeTitle = $notice->title;
        $notice->delete();

        logActivity('delete', "Deleted notice: {$noticeTitle}", Notice::class, $notice->id);

        return redirect()->route('notices.index')
            ->with('success', 'Notice deleted successfully');
    }
}
