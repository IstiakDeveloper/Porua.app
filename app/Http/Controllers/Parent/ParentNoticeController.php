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
                    ->orWhereJsonContains('target_audience', 'All');
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($priority, function ($query, $priority) {
                $query->where('priority', $priority);
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Separate pinned notices
        $pinnedNotices = $notices->where('is_pinned', true);
        $regularNotices = $notices->where('is_pinned', false);

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

        // Verify notice is published and targeted to parents
        if (!$notice->is_published) {
            abort(404, 'Notice not found.');
        }

        $targetAudience = is_array($notice->target_audience)
            ? $notice->target_audience
            : json_decode($notice->target_audience, true);

        if (!in_array('Parent', $targetAudience) && !in_array('All', $targetAudience)) {
            abort(403, 'Unauthorized access.');
        }

        // Increment view count
        $notice->increment('view_count');

        return Inertia::render('Parent/Notices/Show', [
            'notice' => [
                'id' => $notice->id,
                'title' => $notice->title,
                'description' => $notice->description,
                'type' => $notice->type,
                'priority' => $notice->priority,
                'publish_date' => $notice->publish_date,
                'attachments' => $notice->attachments,
                'is_pinned' => $notice->is_pinned,
                'view_count' => $notice->view_count,
                'created_at' => $notice->created_at,
            ],
        ]);
    }
}
