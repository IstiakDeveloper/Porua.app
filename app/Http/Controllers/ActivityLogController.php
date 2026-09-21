<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_users');

        $logs = ActivityLog::with('user')
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->action, fn($q) => $q->where('action', $request->action))
            ->when($request->model_type, fn($q) => $q->where('model_type', $request->model_type))
            ->when($request->from_date, fn($q) => $q->whereDate('created_at', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->whereDate('created_at', '<=', $request->to_date))
            ->latest()
            ->paginate(50)->withQueryString();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['user_id', 'action', 'model_type', 'from_date', 'to_date']),
        ]);
    }

    public function show(ActivityLog $activityLog)
    {
        $this->authorize('view_users');

        $activityLog->load('user');

        return Inertia::render('ActivityLogs/Show', [
            'log' => $activityLog,
        ]);
    }

    public function destroy(ActivityLog $activityLog)
    {
        $this->authorize('delete_users');

        $activityLog->delete();

        return back()->with('success', 'Activity log deleted successfully');
    }

    public function clear(Request $request)
    {
        $this->authorize('delete_users');

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1',
        ]);

        $days = $validated['days'] ?? 30;

        ActivityLog::where('created_at', '<', now()->subDays($days))->delete();

        logActivity('delete', "Cleared activity logs older than {$days} days", ActivityLog::class);

        return back()->with('success', 'Activity logs cleared successfully');
    }
}
