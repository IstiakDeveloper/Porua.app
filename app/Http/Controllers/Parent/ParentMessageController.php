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
        $parent = StudentParent::firstOrCreate(
            ['user_id' => $user->id],
            [
                'father_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
            ]
        );

        $search = $request->input('search');

        // Inbox messages
        $inbox = Message::where('receiver_id', $user->id)
            ->with(['sender', 'receiver'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'subject' => $message->subject,
                    'message' => $message->message,
                    'sender' => [
                        'name' => $message->sender->name ?? 'Administration',
                    ],
                    'recipient' => [
                        'name' => $message->receiver->name ?? 'Me',
                    ],
                    'read_at' => $message->read_at ? $message->read_at->format('d M Y h:i A') : null,
                    'created_at' => $message->created_at->format('d M Y h:i A'),
                ];
            });

        // Sent messages
        $sent = Message::where('sender_id', $user->id)
            ->with(['sender', 'receiver'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'subject' => $message->subject,
                    'message' => $message->message,
                    'sender' => [
                        'name' => $message->sender->name ?? 'Me',
                    ],
                    'recipient' => [
                        'name' => $message->receiver->name ?? 'Recipient',
                    ],
                    'read_at' => $message->read_at ? $message->read_at->format('d M Y h:i A') : null,
                    'created_at' => $message->created_at->format('d M Y h:i A'),
                ];
            });

        $unreadCount = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Parent/Messages/Index', [
            'parent' => [
                'id' => $parent->id,
                'father_name' => $parent->father_name ?? $user->name,
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
            $message->update([
                'read_at' => now(),
                'is_read' => true,
            ]);
        }

        return Inertia::render('Parent/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'subject' => $message->subject,
                'message' => $message->message,
                'sender_name' => $message->sender->name ?? 'N/A',
                'receiver_name' => $message->receiver->name ?? 'N/A',
                'attachments' => $message->attachment ? [$message->attachment] : [],
                'read_at' => $message->read_at ? $message->read_at->format('d M Y h:i A') : null,
                'created_at' => $message->created_at->format('d M Y h:i A'),
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
            'is_read' => false,
        ]);

        return redirect()->route('parent.messages.index')->with('success', 'Message sent successfully.');
    }
}
