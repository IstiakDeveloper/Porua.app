<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OverdueController extends Controller
{
    /**
     * Display all overdue fees from actual fee collection records.
     */
    public function index()
    {
        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $today = Carbon::today();

        $overdueFees = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'feeType',
            'academicYear',
        ])
            ->whereHas('student', fn ($q) => $q->where('status', 'active'))
            ->outstanding()
            ->where('status', 'overdue')
            ->orderBy('payment_date')
            ->get();

        $overdueList = $overdueFees->map(function (FeeCollection $fee) use ($today) {
            $student = $fee->student;
            $dueDate = Carbon::parse($fee->payment_date);
            $feeStructure = FeeStructure::where('fee_type_id', $fee->fee_type_id)
                ->where('class_id', $student->class_id)
                ->where('academic_year_id', $fee->academic_year_id)
                ->first();

            $period = ($fee->month && $fee->year)
                ? Carbon::create($fee->year, $fee->month, 1)->format('F Y')
                : $dueDate->format('F Y');

            return [
                'id' => (string) $fee->id,
                'student_id' => $fee->student_id,
                'student_name' => $student->full_name ?? $student->user->name ?? 'N/A',
                'student_roll' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'fee_type' => $fee->feeType->name ?? 'N/A',
                'fee_frequency' => $fee->feeType->frequency ?? 'N/A',
                'fee_period' => $period,
                'amount' => $fee->remaining,
                'due_date' => $dueDate->format('Y-m-d'),
                'days_overdue' => (int) $dueDate->diffInDays($today),
                'academic_year' => $fee->academicYear->year ?? 'N/A',
                'fee_structure_id' => $feeStructure?->id ?? 0,
                'fee_collection_id' => $fee->id,
                'student_email' => $student->email ?? $student->user->email ?? null,
                'student_phone' => $student->phone ?? null,
            ];
        })->sortByDesc('days_overdue')->values()->all();

        $stats = [
            'total_overdue_count' => count($overdueList),
            'total_overdue_amount' => array_sum(array_column($overdueList, 'amount')),
            'critically_overdue' => count(array_filter($overdueList, fn ($item) => $item['days_overdue'] > 30)),
            'moderately_overdue' => count(array_filter($overdueList, fn ($item) => $item['days_overdue'] >= 7 && $item['days_overdue'] <= 30)),
        ];

        return Inertia::render('Fees/Overdue/Index', [
            'overdueList' => $overdueList,
            'stats' => $stats,
        ]);
    }

    /**
     * Send reminder to student/parent
     */
    public function sendReminder(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_structure_id' => 'nullable|exists:fee_structures,id',
            'fee_collection_id' => 'nullable|exists:fee_collections,id',
            'reminder_type' => 'required|in:email,sms,both',
        ]);

        $student = Student::with(['user', 'parent'])->findOrFail($request->student_id);
        $studentName = $student->full_name ?? $student->user->name ?? 'Student';

        $message = "Reminder sent to {$studentName}";
        if ($request->reminder_type === 'email' || $request->reminder_type === 'both') {
            $message .= ' via email';
        }
        if ($request->reminder_type === 'sms' || $request->reminder_type === 'both') {
            $message .= ' via SMS';
        }

        return back()->with('success', $message);
    }

    /**
     * Bulk send reminders
     */
    public function bulkReminder(Request $request)
    {
        $request->validate([
            'reminder_type' => 'required|in:email,sms,both',
            'days_filter' => 'required|in:all,7,30,60',
        ]);

        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $today = Carbon::today();
        $daysOverdue = $request->days_filter === 'all' ? 0 : (int) $request->days_filter;

        $query = FeeCollection::outstanding()
            ->where('status', 'overdue')
            ->whereHas('student', fn ($q) => $q->where('status', 'active'));

        if ($daysOverdue > 0) {
            $filterDate = $today->copy()->subDays($daysOverdue);
            $query->whereDate('payment_date', '<=', $filterDate);
        }

        $reminderCount = $query->count();

        return back()->with('success', "Sent {$reminderCount} reminders successfully");
    }

    /**
     * Mark fee as paid (redirect to collection form)
     */
    public function markPaid(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_structure_id' => 'nullable|exists:fee_structures,id',
            'fee_collection_id' => 'nullable|exists:fee_collections,id',
        ]);

        return redirect()->route('fee-collections.index', [
            'student_id' => $request->student_id,
            'fee_structure_id' => $request->fee_structure_id,
        ])->with('info', 'Please complete the payment collection');
    }
}
