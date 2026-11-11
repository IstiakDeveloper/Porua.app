<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\FeeCollection;
use App\Support\ParentPortal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentFeeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);
        $studentId = $request->input('student_id');
        $children = ParentPortal::children($parent);

        if (! $studentId) {
            $student = $children->first();
            $studentId = $student?->id;
        } else {
            $student = $children->firstWhere('id', (int) $studentId);
        }

        if (! $student) {
            return Inertia::render('Parent/Fees/Index', [
                'student' => null,
                'children' => [],
                'feeCollections' => [],
                'summary' => [
                    'total_amount' => 0,
                    'total_paid' => 0,
                    'total_due' => 0,
                    'overdue_amount' => 0,
                    'overdue_count' => 0,
                ],
            ]);
        }

        // Get fee collections (hide cancelled and duplicate unpaid rows)
        $feeCollections = FeeCollection::where('student_id', $studentId)
            ->visible()
            ->with(['feeType', 'collector'])
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $outstanding = FeeCollection::where('student_id', $studentId)->outstanding()->get();

        // Calculate summary
        $summary = [
            'total_amount' => (float) $feeCollections->sum('total_amount'),
            'total_paid' => (float) $feeCollections->sum('paid_amount'),
            'total_due' => (float) $outstanding->sum(fn ($fee) => $fee->remaining),
            'overdue_amount' => (float) $outstanding->where('status', 'overdue')->sum(fn ($fee) => $fee->remaining),
            'overdue_count' => $outstanding->where('status', 'overdue')->count(),
        ];

        return Inertia::render('Parent/Fees/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number ?? '',
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'father_name' => $student->father_name ?? '',
                'phone' => $student->phone ?? '',
            ],
            'children' => $children->map(fn ($c) => ParentPortal::childOption($c))->values(),
            'feeCollections' => $feeCollections->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'fee_type' => $fee->feeType->name ?? 'N/A',
                    'month' => $fee->month ? Carbon::create()->month($fee->month)->format('F') : null,
                    'year' => $fee->year,
                    'amount' => (float) $fee->total_amount,
                    'original_amount' => (float) ($fee->amount ?: $fee->total_amount),
                    'discount' => (float) ($fee->discount ?? 0),
                    'paid_amount' => (float) $fee->paid_amount,
                    'remaining' => (float) $fee->remaining,
                    'due_date' => $fee->due_date ? (is_string($fee->due_date) ? $fee->due_date : $fee->due_date->format('Y-m-d')) : null,
                    'payment_date' => $fee->payment_date ? (is_string($fee->payment_date) ? $fee->payment_date : $fee->payment_date->format('Y-m-d')) : null,
                    'created_at' => $fee->created_at ? $fee->created_at->format('Y-m-d') : null,
                    'status' => $fee->status,
                    'is_overdue' => (bool) $fee->is_overdue,
                    'payment_method' => $fee->payment_method ?: 'Cash',
                    'receipt_number' => $fee->receipt_number,
                    'collector_name' => $fee->collector->name ?? 'Accounts Office',
                    'remarks' => $fee->remarks,
                ];
            }),
            'summary' => $summary,
            'parent' => [
                'father_name' => $parent->father_name ?? '',
                'mother_name' => $parent->mother_name ?? '',
                'phone' => $parent->phone ?? '',
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);

        $feeCollection = FeeCollection::with([
            'feeType',
            'student.schoolClass',
            'student.section',
            'collector',
        ])->findOrFail($id);

        if (! ParentPortal::children($parent)->contains('id', $feeCollection->student_id)) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Parent/Fees/Show', [
            'feeCollection' => [
                'id' => $feeCollection->id,
                'fee_type' => $feeCollection->feeType->name ?? 'N/A',
                'student_name' => $feeCollection->student->full_name ?? 'N/A',
                'admission_number' => $feeCollection->student->admission_number ?? '',
                'roll_number' => $feeCollection->student->roll_number ?? '',
                'class_name' => $feeCollection->student->schoolClass->name ?? 'N/A',
                'section_name' => $feeCollection->student->section->name ?? 'N/A',
                'amount' => (float) $feeCollection->total_amount,
                'paid_amount' => (float) $feeCollection->paid_amount,
                'discount' => (float) ($feeCollection->discount ?? 0),
                'remaining' => (float) $feeCollection->remaining,
                'due_date' => $feeCollection->due_date ? (is_string($feeCollection->due_date) ? $feeCollection->due_date : $feeCollection->due_date->format('Y-m-d')) : null,
                'payment_date' => $feeCollection->payment_date ? (is_string($feeCollection->payment_date) ? $feeCollection->payment_date : $feeCollection->payment_date->format('Y-m-d')) : null,
                'status' => $feeCollection->status,
                'is_overdue' => (bool) $feeCollection->is_overdue,
                'payment_method' => $feeCollection->payment_method ?: 'Cash',
                'receipt_number' => $feeCollection->receipt_number,
                'collector_name' => $feeCollection->collector->name ?? 'Accounts Office',
                'remarks' => $feeCollection->remarks,
                'created_at' => $feeCollection->created_at ? $feeCollection->created_at->format('Y-m-d') : null,
            ],
        ]);
    }

    public function receipt(Request $request, $id)
    {
        $user = $request->user();
        $parent = ParentPortal::parent($user);

        $feeCollection = FeeCollection::with([
            'feeType',
            'student.schoolClass',
            'student.section',
            'collector',
        ])->findOrFail($id);

        if (! ParentPortal::children($parent)->contains('id', $feeCollection->student_id)) {
            abort(403, 'Unauthorized access.');
        }

        // Get all collections sharing this receipt number
        $relatedCollections = collect([$feeCollection]);
        if ($feeCollection->receipt_number) {
            $relatedCollections = FeeCollection::with(['feeType'])
                ->where('receipt_number', $feeCollection->receipt_number)
                ->where('student_id', $feeCollection->student_id)
                ->get();
        }

        return Inertia::render('Parent/Fees/Receipt', [
            'fee' => [
                'id' => $feeCollection->id,
                'receipt_number' => $feeCollection->receipt_number ?: ('RCP-'.str_pad($feeCollection->id, 6, '0', STR_PAD_LEFT)),
                'fee_type' => $feeCollection->feeType->name ?? 'N/A',
                'month' => $feeCollection->month ? Carbon::create()->month($feeCollection->month)->format('F') : null,
                'year' => $feeCollection->year,
                'amount' => (float) $feeCollection->total_amount,
                'paid_amount' => (float) $feeCollection->paid_amount,
                'discount' => (float) ($feeCollection->discount ?? 0),
                'remaining' => (float) $feeCollection->remaining,
                'payment_date' => $feeCollection->payment_date ? (is_string($feeCollection->payment_date) ? $feeCollection->payment_date : $feeCollection->payment_date->format('Y-m-d')) : Carbon::now()->format('Y-m-d'),
                'payment_method' => $feeCollection->payment_method ?: 'Cash',
                'status' => $feeCollection->status,
                'remarks' => $feeCollection->remarks,
                'collected_by' => $feeCollection->collector->name ?? 'School Accounts',
            ],
            'relatedItems' => $relatedCollections->map(fn ($item) => [
                'id' => $item->id,
                'fee_type' => $item->feeType->name ?? 'N/A',
                'month' => $item->month ? Carbon::create()->month($item->month)->format('F') : null,
                'year' => $item->year,
                'amount' => (float) $item->total_amount,
                'paid_amount' => (float) $item->paid_amount,
                'discount' => (float) ($item->discount ?? 0),
            ]),
            'student' => [
                'id' => $feeCollection->student->id,
                'full_name' => $feeCollection->student->full_name,
                'admission_number' => $feeCollection->student->admission_number ?? '',
                'roll_number' => $feeCollection->student->roll_number ?? '',
                'class_name' => $feeCollection->student->schoolClass->name ?? 'N/A',
                'section_name' => $feeCollection->student->section->name ?? 'N/A',
                'father_name' => $feeCollection->student->father_name ?? $parent->father_name ?? '',
                'phone' => $feeCollection->student->phone ?? $parent->phone ?? '',
            ],
            'parent' => [
                'father_name' => $parent->father_name ?? '',
                'mother_name' => $parent->mother_name ?? '',
                'phone' => $parent->phone ?? '',
            ],
        ]);
    }
}
