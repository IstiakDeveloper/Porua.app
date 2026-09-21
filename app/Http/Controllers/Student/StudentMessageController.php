<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Message;
use App\Models\User;

class StudentMessageController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get inbox messages
        $inbox = Message::with(['sender'])
            ->where('receiver_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($message) {
                return [
                    'id' => $message->id,
                    'subject' => $message->subject,
                    'message' => $message->message,
                    'sender_name' => $message->sender->name ?? 'Unknown',
                    'sender_role' => $message->sender->roles->first()->name ?? 'User',
                    'recipient_name' => $message->receiver->name ?? 'Unknown',
                    'is_read' => !is_null($message->read_at),
                    'read_at' => $message->read_at?->format('d M Y h:i A'),
                    'sent_at' => $message->created_at->format('d M Y h:i A'),
                    'has_attachment' => false, // Add attachment logic if needed
                    'reply_to' => $message->reply_to,
                ];
            });

        // Get sent messages
        $sent = Message::with(['receiver'])
            ->where('sender_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($message) {
                return [
                    'id' => $message->id,
                    'subject' => $message->subject,
                    'message' => $message->message,
                    'sender_name' => $message->sender->name ?? 'Unknown',
                    'sender_role' => $message->sender->roles->first()->name ?? 'User',
                    'recipient_name' => $message->receiver->name ?? 'Unknown',
                    'is_read' => !is_null($message->read_at),
                    'read_at' => $message->read_at?->format('d M Y h:i A'),
                    'sent_at' => $message->created_at->format('d M Y h:i A'),
                    'has_attachment' => false, // Add attachment logic if needed
                    'reply_to' => $message->reply_to,
                ];
            });

        // Get unread count
        $unreadCount = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        // Get available recipients (Teachers and Admins)
        $recipients = User::with('roles')
            ->whereHas('roles', function($query) {
                $query->whereIn('name', ['Teacher', 'Admin', 'Principal']);
            })
            ->where('id', '!=', $user->id) // Exclude current user
            ->orderBy('name')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->roles->first()->name ?? 'User',
                ];
            });

        return Inertia::render('Student/Messages/Index', [
            'messages' => [
                'inbox' => $inbox,
                'sent' => $sent,
            ],
            'unread_count' => $unreadCount,
            'recipients' => $recipients,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Message sent successfully!');
    }

    public function show($messageId)
    {
        $user = Auth::user();

        $message = Message::with(['sender.roles', 'receiver'])
            ->where('id', $messageId)
            ->where(function($query) use ($user) {
                $query->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            })
            ->firstOrFail();

        // Mark as read if receiver is viewing
        if ($message->receiver_id === $user->id && is_null($message->read_at)) {
            $message->update(['read_at' => now()]);
        }

        return Inertia::render('Student/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'subject' => $message->subject,
                'message' => $message->message,
                'sender_name' => $message->sender->name ?? 'Unknown',
                'sender_role' => $message->sender->roles->first()->name ?? 'User',
                'sender_id' => $message->sender_id,
                'recipient_name' => $message->receiver->name ?? 'Unknown',
                'recipient_id' => $message->receiver_id,
                'is_read' => !is_null($message->read_at),
                'read_at' => $message->read_at?->format('d M Y h:i A'),
                'sent_at' => $message->created_at->format('d M Y h:i A'),
                'has_attachment' => false, // Add attachment logic if needed
                'attachments' => [], // Add attachments if needed
                'reply_to' => $message->reply_to ?? null,
            ],
            'can_reply' => $message->receiver_id === $user->id, // Can only reply if you're the receiver
        ]);
    }

    public function reply(Request $request, $messageId)
    {
        $user = Auth::user();

        $originalMessage = Message::where('id', $messageId)
            ->where(function($query) use ($user) {
                $query->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            })
            ->firstOrFail();

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        // Determine receiver (reply to sender if you're the receiver, vice versa)
        $receiverId = $originalMessage->sender_id === $user->id
            ? $originalMessage->receiver_id
            : $originalMessage->sender_id;

        $reply = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'subject' => 'Re: ' . $originalMessage->subject,
            'message' => $validated['message'],
            'parent_id' => $originalMessage->id,
        ]);

        return back()->with('success', 'Reply sent successfully!');
    }
}
