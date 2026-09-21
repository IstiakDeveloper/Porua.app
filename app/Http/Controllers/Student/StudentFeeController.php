<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\FeeCollection;
use App\Models\FeeWaiver;
use Carbon\Carbon;

class StudentFeeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get filter parameters
        $status = $request->input('status'); // paid, pending, partial
        $year = $request->input('year', Carbon::now()->year);

        // Build query
        $query = FeeCollection::with(['feeType', 'academicYear', 'collector'])
            ->where('student_id', $student->id)
            ->visible();

        if ($status) {
            if (in_array($status, ['pending', 'partial', 'overdue'], true)) {
                $query->outstanding()->where('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        if ($year) {
            $query->whereYear('payment_date', $year);
        }

        $fees = $query->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'receipt_number' => $fee->receipt_number,
                    'fee_type' => $fee->feeType->name ?? 'N/A',
                    'month' => $fee->month ? Carbon::create()->month($fee->month)->format('F') : 'N/A',
                    'year' => $fee->year,
                    'amount' => $fee->amount,
                    'late_fee' => $fee->late_fee,
                    'discount' => $fee->discount,
                    'total_amount' => $fee->total_amount,
                    'paid_amount' => $fee->paid_amount,
                    'remaining' => $fee->remaining,
                    'payment_date' => $fee->payment_date?->format('d M Y'),
                    'payment_method' => $fee->payment_method,
                    'status' => $fee->status,
                    'remarks' => $fee->remarks,
                    'collected_by' => $fee->collector->name ?? 'N/A',
                    'is_overdue' => $fee->is_overdue,
                ];
            });

        $outstanding = FeeCollection::where('student_id', $student->id)->outstanding()->get();

        // Calculate summary
        $totalPaid = FeeCollection::where('student_id', $student->id)->where('status', 'paid')->sum('paid_amount');
        $totalDue = $outstanding->sum(fn ($fee) => $fee->remaining);
        $overdueCount = $outstanding->where('status', 'overdue')->count();

        // Get fee waivers
        $waivers = FeeWaiver::with(['feeType'])
            ->where('student_id', $student->id)
            ->where('status', 'approved')
            ->get()
            ->map(function($waiver) {
                return [
                    'id' => $waiver->id,
                    'fee_type' => $waiver->feeType->name ?? 'N/A',
                    'waiver_type' => $waiver->waiver_type,
                    'waiver_amount' => $waiver->waiver_amount,
                    'waiver_percentage' => $waiver->waiver_percentage,
                    'reason' => $waiver->reason,
                    'valid_from' => $waiver->valid_from?->format('d M Y'),
                    'valid_to' => $waiver->valid_to?->format('d M Y'),
                ];
            });

        return Inertia::render('Student/Fees/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'roll_number' => $student->roll_number,
                'admission_number' => $student->admission_number,
            ],
            'fees' => $fees,
            'summary' => [
                'total_paid' => round($totalPaid, 2),
                'total_due' => round($totalDue, 2),
                'overdue_count' => $overdueCount,
            ],
            'waivers' => $waivers,
            'filters' => [
                'status' => $status,
                'year' => (int)$year,
            ],
        ]);
    }

    public function receipt($feeId)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $fee = FeeCollection::with(['feeType', 'academicYear', 'student', 'collector'])
            ->where('id', $feeId)
            ->where('student_id', $student->id)
            ->firstOrFail();

        return Inertia::render('Student/Fees/Receipt', [
            'fee' => [
                'id' => $fee->id,
                'receipt_number' => $fee->receipt_number,
                'fee_type' => $fee->feeType->name ?? 'N/A',
                'month' => $fee->month ? Carbon::create()->month($fee->month)->format('F') : 'N/A',
                'year' => $fee->year,
                'amount' => $fee->amount,
                'late_fee' => $fee->late_fee,
                'discount' => $fee->discount,
                'total_amount' => $fee->total_amount,
                'paid_amount' => $fee->paid_amount,
                'payment_date' => $fee->payment_date?->format('d M Y'),
                'payment_method' => $fee->payment_method,
                'transaction_id' => $fee->transaction_id,
                'remarks' => $fee->remarks,
                'collected_by' => $fee->collector->name ?? 'N/A',
                'status' => $fee->status,
            ],
            'student' => [
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'father_name' => $student->father_name,
                'phone' => $student->phone,
            ],
        ]);
    }

    public function downloadReceipt($feeId)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Verify the fee belongs to this student
        FeeCollection::where('id', $feeId)
            ->where('student_id', $student->id)
            ->firstOrFail();

        // TODO: Generate PDF receipt using DomPDF or Snappy
        // For now, redirect back to receipt page
        // Users can use browser's Print > Save as PDF functionality

        return redirect()->route('student.fees.receipt', $feeId);
    }
}
