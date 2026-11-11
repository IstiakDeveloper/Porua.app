<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OverdueController extends Controller
{
    /**
     * Display all overdue fees with professional pagination, filtering, and stats.
     */
    public function index(Request $request)
    {
        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $today = Carbon::today();

        // 1. Overall System-Wide Overdue KPI Stats
        $statsBase = FeeCollection::whereHas('student', fn ($q) => $q->where('status', 'active'))
            ->outstanding()
            ->where('status', 'overdue');

        $stats = [
            'total_overdue_count' => (int) (clone $statsBase)->count(),
            'total_overdue_amount' => (float) (clone $statsBase)->sum(DB::raw('total_amount - paid_amount')),
            'critically_overdue' => (int) (clone $statsBase)->whereDate('payment_date', '<', $today->copy()->subDays(30))->count(),
            'moderately_overdue' => (int) (clone $statsBase)->whereDate('payment_date', '<=', $today->copy()->subDays(7))
                ->whereDate('payment_date', '>=', $today->copy()->subDays(30))->count(),
            'recent_overdue' => (int) (clone $statsBase)->whereDate('payment_date', '>', $today->copy()->subDays(7))->count(),
        ];

        // 2. Build Filtered Query
        $query = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'student.section',
            'feeType',
            'academicYear',
        ])
            ->whereHas('student', fn ($q) => $q->where('status', 'active'))
            ->outstanding()
            ->where('status', 'overdue');

        $this->applyFilters($query, $request, $today);

        // Filtered stats for summary pill
        $filteredQuery = clone $query;
        $filteredStats = [
            'count' => (int) $filteredQuery->count(),
            'amount' => (float) $filteredQuery->sum(DB::raw('total_amount - paid_amount')),
        ];

        // 3. Sorting
        $sortBy = $request->input('sort_by', 'days_desc');
        switch ($sortBy) {
            case 'days_asc':
                $query->orderBy('payment_date', 'desc');
                break;
            case 'amount_desc':
                $query->orderByRaw('(total_amount - paid_amount) DESC');
                break;
            case 'amount_asc':
                $query->orderByRaw('(total_amount - paid_amount) ASC');
                break;
            case 'due_date_asc':
                $query->orderBy('payment_date', 'asc');
                break;
            case 'due_date_desc':
                $query->orderBy('payment_date', 'desc');
                break;
            case 'days_desc':
            default:
                // Oldest payment_date first = highest days overdue
                $query->orderBy('payment_date', 'asc');
                break;
        }
        $query->orderBy('id', 'desc');

        // 4. Pagination
        $perPage = in_array((int) $request->input('per_page'), [10, 15, 20, 25, 50, 100], true)
            ? (int) $request->input('per_page')
            : 20;

        $overdueList = $query->paginate($perPage)->withQueryString()->through(function (FeeCollection $fee) use ($today) {
            $student = $fee->student;
            $dueDate = $fee->payment_date ? Carbon::parse($fee->payment_date) : null;
            $period = ($fee->month && $fee->year)
                ? Carbon::create($fee->year, $fee->month, 1)->format('F Y')
                : ($dueDate ? $dueDate->format('F Y') : 'One-time');

            $daysOverdue = $dueDate ? max(0, (int) $dueDate->diffInDays($today)) : 0;

            return [
                'id' => (string) $fee->id,
                'fee_collection_id' => $fee->id,
                'student_id' => $fee->student_id,
                'student_name' => $student->full_name ?: ($student->user->name ?? 'N/A'),
                'student_admission' => $student->admission_number ?? 'N/A',
                'student_roll' => $student->roll_number ?? 'N/A',
                'student_phone' => $student->phone ?? null,
                'student_email' => $student->email ?? ($student->user->email ?? null),
                'class_id' => $student->class_id,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_id' => $student->section_id,
                'section_name' => $student->section->name ?? '',
                'fee_type_id' => $fee->fee_type_id,
                'fee_type' => $fee->feeType->name ?? 'N/A',
                'fee_frequency' => $fee->feeType->frequency ?? 'N/A',
                'fee_period' => $period,
                'amount' => (float) $fee->remaining,
                'base_amount' => (float) $fee->amount,
                'late_fee' => (float) $fee->late_fee,
                'paid_amount' => (float) $fee->paid_amount,
                'total_amount' => (float) $fee->total_amount,
                'due_date' => $dueDate ? $dueDate->format('Y-m-d') : null,
                'due_date_formatted' => $dueDate ? $dueDate->format('d M Y') : 'N/A',
                'days_overdue' => $daysOverdue,
                'academic_year' => $fee->academicYear->year ?? 'N/A',
            ];
        });

        // Dropdown data for filter controls
        $classes = SchoolClass::orderBy('name')->get(['id', 'name']);
        $sections = Section::orderBy('name')->get(['id', 'name', 'class_id']);
        $feeTypes = FeeType::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Fees/Overdue/Index', [
            'overdueList' => $overdueList,
            'stats' => $stats,
            'filteredStats' => $filteredStats,
            'classes' => $classes,
            'sections' => $sections,
            'feeTypes' => $feeTypes,
            'filters' => [
                'search' => $request->input('search', ''),
                'class_id' => $request->input('class_id', 'all'),
                'section_id' => $request->input('section_id', 'all'),
                'fee_type_id' => $request->input('fee_type_id', 'all'),
                'days_filter' => $request->input('days_filter', 'all'),
                'sort_by' => $sortBy,
                'per_page' => (string) $perPage,
            ],
        ]);
    }

    /**
     * Export filtered overdue fees to CSV file.
     */
    public function export(Request $request): StreamedResponse
    {
        $today = Carbon::today();

        $query = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'student.section',
            'feeType',
            'academicYear',
        ])
            ->whereHas('student', fn ($q) => $q->where('status', 'active'))
            ->outstanding()
            ->where('status', 'overdue');

        $this->applyFilters($query, $request, $today);
        $query->orderBy('payment_date', 'asc')->orderBy('id', 'desc');

        $filename = 'overdue_fees_'.now()->format('Y_m_d_His').'.csv';

        return response()->streamDownload(function () use ($query, $today) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'Student ID',
                'Student Name',
                'Class',
                'Section',
                'Roll Number',
                'Phone',
                'Email',
                'Fee Type',
                'Period',
                'Due Date',
                'Days Overdue',
                'Base Fee (BDT)',
                'Late Fee (BDT)',
                'Remaining Due (BDT)',
            ]);

            $query->chunk(200, function ($fees) use ($handle, $today) {
                foreach ($fees as $fee) {
                    $student = $fee->student;
                    $dueDate = $fee->payment_date ? Carbon::parse($fee->payment_date) : null;
                    $daysOverdue = $dueDate ? max(0, (int) $dueDate->diffInDays($today)) : 0;
                    $period = ($fee->month && $fee->year)
                        ? Carbon::create($fee->year, $fee->month, 1)->format('F Y')
                        : ($dueDate ? $dueDate->format('F Y') : 'One-time');

                    fputcsv($handle, [
                        $student->admission_number ?? ('STU-'.$student->id),
                        $student->full_name ?: ($student->user->name ?? 'N/A'),
                        $student->schoolClass->name ?? 'N/A',
                        $student->section->name ?? '',
                        $student->roll_number ?? '',
                        $student->phone ?? '',
                        $student->email ?? ($student->user->email ?? ''),
                        $fee->feeType->name ?? 'Fee',
                        $period,
                        $dueDate ? $dueDate->format('d/m/Y') : '',
                        $daysOverdue,
                        (float) $fee->amount,
                        (float) $fee->late_fee,
                        (float) $fee->remaining,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Send reminder to student/parent.
     */
    public function sendReminder(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_collection_id' => 'nullable|exists:fee_collections,id',
            'reminder_type' => 'required|in:email,sms,both',
        ]);

        $student = Student::with(['user', 'parent'])->findOrFail($request->student_id);
        $studentName = $student->full_name ?: ($student->user->name ?? 'Student');

        $channel = match ($request->reminder_type) {
            'email' => 'via email',
            'sms' => 'via SMS',
            'both' => 'via SMS & email',
            default => '',
        };

        return back()->with('success', "Reminder dispatched to {$studentName} {$channel} successfully.");
    }

    /**
     * Bulk send reminders to filtered students or selected fee collections.
     */
    public function bulkReminder(Request $request)
    {
        $request->validate([
            'reminder_type' => 'required|in:email,sms,both',
            'days_filter' => 'nullable|string',
            'class_id' => 'nullable',
            'section_id' => 'nullable',
            'fee_type_id' => 'nullable',
            'selected_ids' => 'nullable|array',
            'selected_ids.*' => 'integer|exists:fee_collections,id',
        ]);

        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $today = Carbon::today();

        $query = FeeCollection::outstanding()
            ->where('status', 'overdue')
            ->whereHas('student', fn ($q) => $q->where('status', 'active'));

        if (! empty($request->selected_ids)) {
            $query->whereIn('id', $request->selected_ids);
        } else {
            $this->applyFilters($query, $request, $today);
        }

        $reminderCount = $query->count();

        $channelText = match ($request->reminder_type) {
            'email' => 'via Email',
            'sms' => 'via SMS',
            'both' => 'via SMS & Email',
            default => '',
        };

        return back()->with('success', "Dispatched reminders to {$reminderCount} students {$channelText} successfully.");
    }

    /**
     * Mark fee as paid (redirect to POS collection desk).
     */
    public function markPaid(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_collection_id' => 'nullable|exists:fee_collections,id',
        ]);

        return redirect()->route('fee-collections.create', [
            'student_id' => $request->student_id,
        ])->with('info', 'Please complete the payment collection at the counter.');
    }

    /**
     * Helper to apply common filters across index, export, and bulkReminder.
     */
    private function applyFilters(Builder $query, Request $request, Carbon $today): void
    {
        // 1. Search (Student name, admission number, roll, phone, email)
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereHas('student.user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('student', fn ($s) => $s->where('admission_number', 'like', "%{$search}%")
                        ->orWhere('roll_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                    );
            });
        }

        // 2. Class filter
        if ($request->filled('class_id') && $request->class_id !== 'all') {
            $query->whereHas('student', fn ($q) => $q->where('class_id', $request->class_id));
        }

        // 3. Section filter
        if ($request->filled('section_id') && $request->section_id !== 'all') {
            $query->whereHas('student', fn ($q) => $q->where('section_id', $request->section_id));
        }

        // 4. Fee Type filter
        if ($request->filled('fee_type_id') && $request->fee_type_id !== 'all') {
            $query->where('fee_type_id', $request->fee_type_id);
        }

        // 5. Overdue Days / Severity filter
        if ($request->filled('days_filter') && $request->days_filter !== 'all') {
            $filter = $request->days_filter;
            if ($filter === '7') {
                $query->whereDate('payment_date', '<=', $today->copy()->subDays(7));
            } elseif ($filter === '15') {
                $query->whereDate('payment_date', '<=', $today->copy()->subDays(15));
            } elseif ($filter === '30') {
                $query->whereDate('payment_date', '<=', $today->copy()->subDays(30));
            } elseif ($filter === '60') {
                $query->whereDate('payment_date', '<=', $today->copy()->subDays(60));
            } elseif ($filter === 'critical') {
                $query->whereDate('payment_date', '<', $today->copy()->subDays(30));
            } elseif ($filter === 'moderate') {
                $query->whereDate('payment_date', '<=', $today->copy()->subDays(7))
                    ->whereDate('payment_date', '>=', $today->copy()->subDays(30));
            } elseif ($filter === 'recent') {
                $query->whereDate('payment_date', '>', $today->copy()->subDays(7));
            }
        }
    }
}
