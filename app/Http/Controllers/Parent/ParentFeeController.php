<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use App\Models\Student;
use App\Models\FeeCollection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentFeeController extends Controller
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

        $studentId = $request->input('student_id');

        $children = Student::where('parent_id', $parent->id)
            ->orWhereHas('parents', fn($q) => $q->where('student_parents.id', $parent->id))
            ->with(['schoolClass', 'section'])
            ->get();

        if (!$studentId) {
            $student = $children->first();
            $studentId = $student?->id;
        } else {
            $student = $children->firstWhere('id', (int) $studentId);
        }

        if (!$student) {
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
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
            ],
            'children' => $children->map(fn($c) => [
                'id' => $c->id,
                'full_name' => $c->full_name,
            ]),
            'feeCollections' => $feeCollections->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'fee_type' => $fee->feeType->name ?? 'N/A',
                    'amount' => (float) $fee->total_amount,
                    'paid_amount' => (float) $fee->paid_amount,
                    'remaining' => (float) $fee->remaining,
                    'due_date' => $fee->due_date ? (is_string($fee->due_date) ? $fee->due_date : $fee->due_date->format('Y-m-d')) : null,
                    'payment_date' => $fee->payment_date ? (is_string($fee->payment_date) ? $fee->payment_date : $fee->payment_date->format('Y-m-d')) : null,
                    'status' => $fee->status,
                    'is_overdue' => $fee->is_overdue,
                    'payment_method' => $fee->payment_method,
                    'receipt_number' => $fee->receipt_number,
                    'collector_name' => $fee->collector->name ?? 'N/A',
                    'remarks' => $fee->remarks,
                ];
            }),
            'summary' => $summary,
        ]);
    }

    public function show(Request $request, $id)
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

        $feeCollection = FeeCollection::with(['feeType', 'student.parents', 'collector'])
            ->findOrFail($id);

        // Verify parent has access
        $isParentChild = ($feeCollection->student->parent_id === $parent->id)
            || $feeCollection->student->parents->contains('id', $parent->id);

        if (!$isParentChild) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Parent/Fees/Show', [
            'feeCollection' => [
                'id' => $feeCollection->id,
                'fee_type' => $feeCollection->feeType->name ?? 'N/A',
                'student_name' => $feeCollection->student->full_name ?? 'N/A',
                'amount' => (float) $feeCollection->total_amount,
                'paid_amount' => (float) $feeCollection->paid_amount,
                'remaining' => (float) $feeCollection->remaining,
                'due_date' => $feeCollection->due_date,
                'payment_date' => $feeCollection->payment_date,
                'status' => $feeCollection->status,
                'is_overdue' => $feeCollection->is_overdue,
                'payment_method' => $feeCollection->payment_method,
                'receipt_number' => $feeCollection->receipt_number,
                'collector_name' => $feeCollection->collector->name ?? 'N/A',
                'remarks' => $feeCollection->remarks,
                'created_at' => $feeCollection->created_at,
            ],
        ]);
    }
}
