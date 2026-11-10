<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentNoticeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $type = $request->input('type');
        $priority = $request->input('priority');

        $notices = Notice::where('is_published', true)
            ->where(function ($query) {
                $query->whereJsonContains('target_audience', 'Parent')
                    ->orWhereJsonContains('target_audience', 'All')
                    ->orWhereJsonContains('target_audience', 'all');
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($type && $type !== 'all', function ($query) use ($type) {
                $query->where('type', $type);
            })
            ->when($priority && $priority !== 'all', function ($query) use ($priority) {
                $query->where('priority', $priority);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notice) {
                $isHighPriority = in_array($notice->priority, ['urgent', 'high'], true);
                return [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'description' => $notice->content,
                    'type' => $notice->type,
                    'priority' => $notice->priority,
                    'publish_date' => $notice->published_at ? $notice->published_at->format('d M Y') : $notice->created_at->format('d M Y'),
                    'attachments' => $notice->attachment ? [$notice->attachment] : [],
                    'is_pinned' => $isHighPriority,
                    'view_count' => 0,
                ];
            });

        // Separate pinned (high/urgent priority) notices
        $pinnedNotices = $notices->where('is_pinned', true)->values();
        $regularNotices = $notices->where('is_pinned', false)->values();

        return Inertia::render('Parent/Notices/Index', [
            'pinnedNotices' => $pinnedNotices,
            'regularNotices' => $regularNotices,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'priority' => $priority,
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $notice = Notice::findOrFail($id);

        if (!$notice->is_published) {
            abort(404, 'Notice not found.');
        }

        $targetAudience = is_array($notice->target_audience)
            ? $notice->target_audience
            : (json_decode($notice->target_audience, true) ?? []);

        $hasAccess = in_array('Parent', $targetAudience) 
            || in_array('All', $targetAudience) 
            || in_array('all', $targetAudience)
            || empty($targetAudience);

        if (!$hasAccess) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Parent/Notices/Show', [
            'notice' => [
                'id' => $notice->id,
                'title' => $notice->title,
                'description' => $notice->content,
                'type' => $notice->type,
                'priority' => $notice->priority,
                'publish_date' => $notice->published_at ? $notice->published_at->format('d M Y') : $notice->created_at->format('d M Y'),
                'attachments' => $notice->attachment ? [$notice->attachment] : [],
                'is_pinned' => in_array($notice->priority, ['urgent', 'high'], true),
                'view_count' => 0,
                'created_at' => $notice->created_at->format('d M Y h:i A'),
            ],
        ]);
    }
}
