<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherMessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $inbox = Message::where('receiver_id', $user->id)
            ->with(['sender'])
            ->orderBy('created_at', 'desc')
            ->get();

        $sent = Message::where('sender_id', $user->id)
            ->with(['receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        $unreadCount = $inbox->whereNull('read_at')->count();

        return Inertia::render('Teacher/Messages/Index', [
            'messages' => [
                'inbox' => $inbox->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'subject' => $message->subject,
                        'message' => $message->message,
                        'sender_name' => $message->sender->name ?? 'Unknown',
                        'sent_at' => $message->created_at->format('Y-m-d H:i'),
                        'read_at' => $message->read_at ? $message->read_at->format('Y-m-d H:i') : null,
                        'is_read' => !is_null($message->read_at),
                        'has_attachment' => !empty($message->attachment),
                    ];
                }),
                'sent' => $sent->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'subject' => $message->subject,
                        'message' => $message->message,
                        'receiver_name' => $message->receiver->name ?? 'Unknown',
                        'sent_at' => $message->created_at->format('Y-m-d H:i'),
                        'is_read' => !is_null($message->read_at),
                    ];
                }),
            ],
            'unread_count' => $unreadCount,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $message = Message::with(['sender', 'receiver'])->findOrFail($id);

        // Verify access
        if ($message->receiver_id !== $user->id && $message->sender_id !== $user->id) {
            abort(403, 'Unauthorized access.');
        }

        // Mark as read if recipient
        if ($message->receiver_id === $user->id && is_null($message->read_at)) {
            $message->update(['read_at' => now()]);
        }

        return Inertia::render('Teacher/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'subject' => $message->subject,
                'message' => $message->message,
                'sender_name' => $message->sender->name ?? 'Unknown',
                'receiver_name' => $message->receiver->name ?? 'Unknown',
                'sent_at' => $message->created_at->format('Y-m-d H:i'),
                'read_at' => $message->read_at ? $message->read_at->format('Y-m-d H:i') : null,
                'attachment' => $message->attachment,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        // Get teacher's students from assigned sections
        $sectionIds = $teacher->subjects()->pluck('section_id')->unique();

        $students = \App\Models\Student::whereIn('section_id', $sectionIds)
            ->with(['user', 'section.schoolClass'])
            ->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->user_id,
                    'name' => trim($student->first_name . ' ' . $student->last_name),
                    'roll' => $student->roll_number,
                    'class' => $student->section && $student->section->schoolClass ? $student->section->schoolClass->name : 'N/A',
                    'section' => $student->section ? $student->section->name : 'N/A',
                ];
            });

        // Get other teachers
        $teachers = Teacher::with('user')->orderBy('first_name')->get()->map(function ($teacher) {
            return [
                'id' => $teacher->user_id,
                'name' => trim($teacher->first_name . ' ' . $teacher->last_name),
            ];
        });

        return Inertia::render('Teacher/Messages/Create', [
            'students' => $students,
            'teachers' => $teachers,
        ]);
    }

    public function send(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'attachment' => ['nullable', 'file', 'max:5120'], // 5MB max
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('messages/attachments', 'public');
        }

        Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'attachment' => $attachmentPath,
        ]);

        return back()->with('success', 'Message sent successfully.');
    }
}
