<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Communication/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function unread()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->latest()
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->count(),
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'Notification marked as read');
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back()->with('success', 'All notifications marked as read');
    }

    public function destroy(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $notification->delete();

        return back()->with('success', 'Notification deleted successfully');
    }

    public function deleteAll()
    {
        Notification::where('user_id', auth()->id())->delete();

        logActivity('delete', "Deleted all notifications", Notification::class);

        return back()->with('success', 'All notifications deleted successfully');
    }

    public function send(Request $request)
    {
        $this->authorize('manage_notices');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'notification_type' => 'required|in:info,success,warning,error',
            'target_users' => 'required|array',
            'target_users.*' => 'exists:users,id',
            'action_url' => 'nullable|url',
        ]);

        foreach ($validated['target_users'] as $userId) {
            Notification::create([
                'user_id' => $userId,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'notification_type' => $validated['notification_type'],
                'action_url' => $validated['action_url'],
                'is_read' => false,
            ]);
        }

        logActivity('create', "Sent notification to " . count($validated['target_users']) . " users", Notification::class);

        return back()->with('success', 'Notification sent successfully');
    }
}
