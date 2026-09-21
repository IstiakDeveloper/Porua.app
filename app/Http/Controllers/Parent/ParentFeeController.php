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
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $studentId = $request->input('student_id');

        if (!$studentId) {
            $student = Student::where('parent_id', $parent->id)->first();
            if (!$student) {
                abort(404, 'No children found.');
            }
            $studentId = $student->id;
        } else {
            $student = Student::where('parent_id', $parent->id)->findOrFail($studentId);
        }

        $children = Student::where('parent_id', $parent->id)->get();

        // Get fee collections (hide cancelled and duplicate unpaid rows)
        $feeCollections = FeeCollection::where('student_id', $studentId)
            ->visible()
            ->with(['feeType', 'collector'])
            ->orderBy('payment_date', 'desc')
            ->get();

        $outstanding = FeeCollection::where('student_id', $studentId)->outstanding()->get();

        // Calculate summary
        $summary = [
            'total_amount' => $feeCollections->sum('total_amount'),
            'total_paid' => $feeCollections->sum('paid_amount'),
            'total_due' => $outstanding->sum(fn ($fee) => $fee->remaining),
            'overdue_amount' => $outstanding->where('status', 'overdue')->sum(fn ($fee) => $fee->remaining),
            'overdue_count' => $outstanding->where('status', 'overdue')->count(),
        ];

        return Inertia::render('Parent/Fees/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'roll_number' => $student->roll_number,
                'class_name' => $student->class->name ?? 'N/A',
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
                    'amount' => $fee->total_amount,
                    'paid_amount' => $fee->paid_amount,
                    'remaining' => $fee->remaining,
                    'due_date' => $fee->due_date,
                    'payment_date' => $fee->payment_date,
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
        $parent = StudentParent::where('user_id', $user->id)->firstOrFail();

        $feeCollection = FeeCollection::with(['feeType', 'student', 'collector'])
            ->findOrFail($id);

        // Verify parent has access
        if ($feeCollection->student->parent_id !== $parent->id) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Parent/Fees/Show', [
            'feeCollection' => [
                'id' => $feeCollection->id,
                'fee_type' => $feeCollection->feeType->name ?? 'N/A',
                'student_name' => $feeCollection->student->full_name ?? 'N/A',
                'amount' => $feeCollection->total_amount,
                'paid_amount' => $feeCollection->paid_amount,
                'remaining' => $feeCollection->remaining,
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
