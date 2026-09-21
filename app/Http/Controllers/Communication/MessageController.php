<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        $messages = Message::with(['sender', 'receiver'])
            ->where(function($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Communication/Messages/Index', [
            'messages' => $messages,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Communication/Messages/Create', [
            'users' => User::where('id', '!=', auth()->id())->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,normal,high',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'priority' => $validated['priority'],
            'status' => 'sent',
            'is_read' => false,
        ]);

        logActivity('create', "Sent message: {$message->subject}", Message::class, $message->id);

        return redirect()->route('messages.index')
            ->with('success', 'Message sent successfully');
    }

    public function show(Message $message)
    {
        if ($message->receiver_id !== auth()->id() && $message->sender_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Mark as read if receiver is viewing
        if ($message->receiver_id === auth()->id() && !$message->is_read) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        $message->load(['sender', 'receiver']);

        return Inertia::render('Communication/Messages/Show', [
            'message' => $message,
        ]);
    }

    public function reply(Request $request, Message $message)
    {
        if ($message->receiver_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $reply = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $message->sender_id,
            'subject' => 'Re: ' . $message->subject,
            'message' => $validated['message'],
            'priority' => $message->priority,
            'parent_id' => $message->id,
            'status' => 'sent',
            'is_read' => false,
        ]);

        logActivity('create', "Replied to message: {$message->subject}", Message::class, $reply->id);

        return back()->with('success', 'Reply sent successfully');
    }

    public function destroy(Message $message)
    {
        if ($message->receiver_id !== auth()->id() && $message->sender_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $message->delete();

        logActivity('delete', "Deleted message", Message::class, $message->id);

        return redirect()->route('messages.index')
            ->with('success', 'Message deleted successfully');
    }

    public function inbox()
    {
        $messages = Message::with('sender')
            ->where('receiver_id', auth()->id())
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Communication/Messages/Inbox', [
            'messages' => $messages,
        ]);
    }

    public function sent()
    {
        $messages = Message::with('receiver')
            ->where('sender_id', auth()->id())
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Communication/Messages/Sent', [
            'messages' => $messages,
        ]);
    }

    public function unread()
    {
        $count = Message::where('receiver_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
