<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\FeeCollection;
use App\Models\Result;
use App\Models\Notice;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ParentDashboardController extends Controller
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

        // Get all children linked directly or through pivot
        $children = Student::where('parent_id', $parent->id)
            ->orWhereHas('parents', fn($q) => $q->where('student_parents.id', $parent->id))
            ->with(['schoolClass', 'section'])
            ->get();

        // Get today's attendance for all children
        $todayAttendance = [];
        foreach ($children as $child) {
            $attendance = StudentAttendance::where('student_id', $child->id)
                ->where('date', Carbon::today())
                ->first();

            $todayAttendance[$child->id] = [
                'status' => $attendance ? $attendance->status : 'not_marked',
                'remarks' => $attendance ? $attendance->remarks : null,
            ];
        }

        // Get recent exam results for all children
        $recentResults = [];
        foreach ($children as $child) {
            $results = Result::where('student_id', $child->id)
                ->where('is_published', true)
                ->with('exam')
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->get();

            $recentResults[$child->id] = $results;
        }

        // Get fee status for all children
        $feeStatus = [];
        foreach ($children as $child) {
            $outstanding = FeeCollection::where('student_id', $child->id)->outstanding()->get();

            $feeStatus[$child->id] = [
                'total_due' => (float) $outstanding->sum(fn ($fee) => $fee->remaining),
                'overdue_count' => $outstanding->where('status', 'overdue')->count(),
            ];
        }

        // Get recent notices
        $recentNotices = Notice::where('is_published', true)
            ->where(function ($query) {
                $query->whereJsonContains('target_audience', 'Parent')
                    ->orWhereJsonContains('target_audience', 'All')
                    ->orWhereJsonContains('target_audience', 'all');
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get unread messages
        $unreadMessages = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Parent/Dashboard', [
            'parent' => [
                'id' => $parent->id,
                'father_name' => $parent->father_name ?? $user->name,
                'mother_name' => $parent->mother_name ?? '',
                'phone' => $parent->phone ?? $user->phone ?? '',
                'email' => $parent->email ?? $user->email,
            ],
            'children' => $children->map(function ($child) use ($todayAttendance, $recentResults, $feeStatus) {
                return [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'admission_number' => $child->admission_number,
                    'roll_number' => $child->roll_number,
                    'photo' => $child->photo,
                    'class_name' => $child->schoolClass->name ?? 'N/A',
                    'section_name' => $child->section->name ?? 'N/A',
                    'today_attendance' => $todayAttendance[$child->id] ?? ['status' => 'not_marked'],
                    'recent_results' => $recentResults[$child->id] ?? [],
                    'fee_status' => $feeStatus[$child->id] ?? ['total_due' => 0, 'overdue_count' => 0],
                ];
            }),
            'recentNotices' => $recentNotices,
            'unreadMessages' => $unreadMessages,
        ]);
    }
}
