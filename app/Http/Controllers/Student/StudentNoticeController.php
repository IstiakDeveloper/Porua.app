<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Notice;

class StudentNoticeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $type = $request->input('type'); // general, academic, event, holiday
        $priority = $request->input('priority'); // high, medium, low

        $notices = Notice::published()
            ->active()
            ->where(function($query) use ($student) {
                $query->whereJsonContains('target_audience', 'Student')
                    ->orWhereJsonContains('target_audience', 'all')
                    ->orWhereJsonContains('target_audience', 'All')
                    ->orWhereJsonContains('target_classes', $student->class_id);
            })
            ->when($type, function($query, $type) {
                $query->where('type', $type);
            })
            ->when($priority, function($query, $priority) {
                $query->where('priority', $priority);
            })
            ->orderBy('priority', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($notice) {
                return [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'content' => $notice->content,
                    'type' => $notice->type,
                    'priority' => $notice->priority,
                    'attachment' => $notice->attachment,
                    'valid_from' => $notice->valid_from?->format('d M Y'),
                    'valid_to' => $notice->valid_to?->format('d M Y'),
                    'created_at' => $notice->created_at->format('d M Y'),
                    'created_by' => $notice->creator->name ?? 'Administration',
                ];
            });

        return Inertia::render('Student/Notices/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
            ],
            'notices' => $notices,
            'filters' => [
                'type' => $type,
                'priority' => $priority,
            ],
        ]);
    }

    public function show($noticeId)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $notice = Notice::with('creator')
            ->where('id', $noticeId)
            ->where('is_published', true)
            ->where(function($query) use ($student) {
                $query->whereJsonContains('target_audience', 'Student')
                    ->orWhereJsonContains('target_audience', 'all')
                    ->orWhereJsonContains('target_audience', 'All')
                    ->orWhereJsonContains('target_classes', $student->class_id);
            })
            ->firstOrFail();

        return Inertia::render('Student/Notices/Show', [
            'notice' => [
                'id' => $notice->id,
                'title' => $notice->title,
                'content' => $notice->content,
                'type' => $notice->type,
                'priority' => $notice->priority,
                'attachment' => $notice->attachment,
                'valid_from' => $notice->valid_from?->format('d M Y'),
                'valid_to' => $notice->valid_to?->format('d M Y'),
                'created_at' => $notice->created_at->format('d M Y h:i A'),
                'created_by' => $notice->creator->name ?? 'Administration',
            ],
        ]);
    }
}
