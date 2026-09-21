<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherNoticeController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type');
        $priority = $request->input('priority');

        $notices = Notice::where('is_published', true)
            ->with('creator')
            ->where(function ($query) {
                $query->where('target_audience', 'like', '%"Teacher"%')
                    ->orWhere('target_audience', 'like', '%"teacher"%')
                    ->orWhere('target_audience', 'like', '%"All"%')
                    ->orWhere('target_audience', 'like', '%"all"%');
            })
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($priority, function ($query, $priority) {
                $query->where('priority', $priority);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/Notices/Index', [
            'notices' => $notices->map(function ($notice) {
                return [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'content' => $notice->content,
                    'notice_type' => ucfirst($notice->type),
                    'priority' => ucfirst($notice->priority),
                    'publish_date' => $notice->published_at?->format('Y-m-d') ?? $notice->created_at->format('Y-m-d'),
                    'expiry_date' => $notice->valid_to ? $notice->valid_to->format('Y-m-d') : null,
                    'is_pinned' => false,
                    'target_audience' => $notice->target_audience,
                    'attachments' => [],
                    'views_count' => 0,
                    'created_by' => $notice->creator->name ?? 'Admin',
                ];
            }),
            'filters' => [
                'type' => $type,
                'priority' => $priority,
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $notice = Notice::with('creator')->findOrFail($id);

        // Check if notice is published
        if (!$notice->is_published) {
            abort(403, 'This notice is not published.');
        }

        // Verify access - check if Teacher or All is in target audience
        $targetAudience = $notice->target_audience ?? [];
        $hasAccess = false;

        foreach ($targetAudience as $audience) {
            if (in_array(strtolower($audience), ['teacher', 'all'])) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Teacher/Notices/Show', [
            'notice' => [
                'id' => $notice->id,
                'title' => $notice->title,
                'content' => $notice->content,
                'notice_type' => ucfirst($notice->type),
                'priority' => ucfirst($notice->priority),
                'publish_date' => $notice->published_at?->format('Y-m-d') ?? $notice->created_at->format('Y-m-d'),
                'valid_from' => $notice->valid_from ? $notice->valid_from->format('Y-m-d') : null,
                'valid_to' => $notice->valid_to ? $notice->valid_to->format('Y-m-d') : null,
                'attachment' => $notice->attachment,
                'created_by' => $notice->creator->name ?? 'Admin',
                'created_at' => $notice->created_at->format('M d, Y'),
            ],
        ]);
    }
}
