<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentMessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $search = $request->input('search');

        // Inbox messages
        $inbox = Message::where('receiver_id', $user->id)
            ->with('sender')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Sent messages
        $sent = Message::where('sender_id', $user->id)
            ->with('receiver')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $unreadCount = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Parent/Messages/Index', [
            'parent' => [
                'id' => $parent->id,
                'father_name' => $parent->father_name,
            ],
            'inbox' => $inbox,
            'sent' => $sent,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $message = Message::with(['sender', 'receiver'])->findOrFail($id);

        // Verify user has access
        if ($message->receiver_id !== $user->id && $message->sender_id !== $user->id) {
            abort(403, 'Unauthorized access.');
        }

        // Mark as read if user is recipient
        if ($message->receiver_id === $user->id && is_null($message->read_at)) {
            $message->update(['read_at' => now()]);
        }

        return Inertia::render('Parent/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'subject' => $message->subject,
                'message' => $message->message,
                'sender_name' => $message->sender->name ?? 'N/A',
                'receiver_name' => $message->receiver->name ?? 'N/A',
                'attachments' => $message->attachments,
                'read_at' => $message->read_at,
                'created_at' => $message->created_at,
            ],
        ]);
    }

    public function send(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        return redirect()->route('parent.messages.index')->with('success', 'Message sent successfully.');
    }
}
