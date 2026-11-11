<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\FeeCollection;
use App\Models\Message;
use App\Models\Notice;
use App\Models\StudentAttendance;
use App\Support\ParentPortal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);
        $children = ParentPortal::children($parent);

        $todayAttendance = [];
        foreach ($children as $child) {
            $attendance = StudentAttendance::where('student_id', $child->id)
                ->where('date', Carbon::today())
                ->first();

            $todayAttendance[$child->id] = [
                'status' => $attendance ? $attendance->status : 'not_marked',
            ];
        }

        $feeStatus = [];
        foreach ($children as $child) {
            $outstanding = FeeCollection::where('student_id', $child->id)->outstanding()->get();

            $feeStatus[$child->id] = [
                'total_due' => (float) $outstanding->sum(fn ($fee) => $fee->remaining),
                'overdue_count' => $outstanding->where('status', 'overdue')->count(),
            ];
        }

        $recentNotices = Notice::where('is_published', true)
            ->where(function ($query) {
                $query->whereJsonContains('target_audience', 'Parent')
                    ->orWhereJsonContains('target_audience', 'All')
                    ->orWhereJsonContains('target_audience', 'all');
            })
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($notice) {
                return [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'type' => $notice->type,
                    'priority' => $notice->priority,
                    'publish_date' => $notice->published_at
                        ? $notice->published_at->format('d M Y')
                        : $notice->created_at->format('d M Y'),
                ];
            });

        $unreadMessages = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Parent/Dashboard', [
            'parent' => [
                'id' => $parent->id,
                'father_name' => $parent->father_name ?? '',
                'mother_name' => $parent->mother_name ?? '',
                'phone' => $parent->phone ?? $user->phone ?? '',
                'email' => $parent->email ?? $user->email,
                'account_name' => $user->name,
            ],
            'children' => $children->map(function ($child) use ($todayAttendance, $feeStatus) {
                return [
                    ...ParentPortal::childOption($child),
                    'today_attendance' => $todayAttendance[$child->id] ?? ['status' => 'not_marked'],
                    'today_class' => ParentPortal::todayClass($child),
                    'fee_status' => $feeStatus[$child->id] ?? ['total_due' => 0, 'overdue_count' => 0],
                ];
            }),
            'recentNotices' => $recentNotices,
            'nextEvent' => ParentPortal::nextEvent(),
            'unreadMessages' => $unreadMessages,
        ]);
    }
}
