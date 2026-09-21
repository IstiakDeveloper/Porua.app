<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Batch;
use App\Models\BatchEnrollment;
use App\Models\FeeCollection;
use App\Models\FeeType;
use App\Models\Student;
use App\Traits\CreatesAccountingTransactions;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CoachingFeeController extends Controller
{
    use CreatesAccountingTransactions;

    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        $query = FeeCollection::with(['student.user', 'batch.course', 'collector', 'account'])
            ->whereNotNull('batch_id')
            ->where('status', 'paid');

        if ($request->filled('batch_id')) {
            $query->where('batch_id', $request->input('batch_id'));
        }

        if ($request->filled('month')) {
            $query->where('month', $request->input('month'));
        }

        if ($request->filled('year')) {
            $query->where('year', $request->input('year'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($sq) use ($search) {
                        $sq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('student_id', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    })
                    ->orWhereHas('batch', function ($bq) use ($search) {
                        $bq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $collections = $query->latest('payment_date')->paginate(15)->withQueryString();

        $batches = Batch::with('course')->where('status', 'active')->orderBy('name')->get();
        $accounts = Account::where('status', 'active')->get();

        $totalCollected = (float) FeeCollection::whereNotNull('batch_id')->where('status', 'paid')->sum('paid_amount');
        $thisMonthCollected = (float) FeeCollection::whereNotNull('batch_id')
            ->where('status', 'paid')
            ->whereMonth('payment_date', Carbon::now()->month)
            ->whereYear('payment_date', Carbon::now()->year)
            ->sum('paid_amount');

        return Inertia::render('Coaching/Fees/Index', [
            'collections' => $collections,
            'batches' => $batches,
            'accounts' => $accounts,
            'filters' => $request->only(['batch_id', 'month', 'year', 'search']),
            'metrics' => [
                'total_collected' => $totalCollected,
                'this_month_collected' => $thisMonthCollected,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('collect_fees');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
            'collection_mode' => 'required|in:monthly,installment',
            'month' => 'nullable|required_if:collection_mode,monthly|integer|between:1,12',
            'year' => 'nullable|required_if:collection_mode,monthly|integer|min:2020|max:2035',
            'installment_title' => 'nullable|required_if:collection_mode,installment|string|max:100',
            'amount' => 'required|numeric|min:1',
            'discount' => 'nullable|numeric|min:0',
            'paid_amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'account_id' => 'required|exists:accounts,id',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $student = Student::findOrFail($validated['student_id']);
            $batch = Batch::with('course')->findOrFail($validated['batch_id']);
            $enrollment = BatchEnrollment::where('batch_id', $batch->id)
                ->where('student_id', $student->id)
                ->first();

            // Find or create a default coaching fee type
            $feeType = FeeType::firstOrCreate(
                ['name' => 'Coaching Batch Fee'],
                [
                    'code' => 'COACHING-FEE',
                    'description' => 'Coaching center batch tuition and course fees',
                    'status' => 'active',
                ]
            );

            $receiptNumber = FeeCollection::nextPaidReceiptNumber();
            $discount = (float) ($validated['discount'] ?? 0);
            $grossAmount = (float) $validated['amount'];
            $totalAmount = max(0, $grossAmount - $discount);
            $paidAmount = (float) $validated['paid_amount'];

            // Description for accounting
            $periodLabel = $validated['collection_mode'] === 'monthly'
                ? Carbon::create($validated['year'], $validated['month'], 1)->format('F Y')
                : $validated['installment_title'];
            $description = "Coaching Fee from {$student->full_name} for Batch: {$batch->name} ({$periodLabel})";

            // Record accounting income transaction & increment account balance
            $transaction = $this->createFeeIncomeTransaction(
                accountId: (int) $validated['account_id'],
                amount: $paidAmount,
                date: $validated['payment_date'],
                paymentMethod: $validated['payment_method'],
                referenceNumber: $receiptNumber,
                description: $description
            );

            $collection = FeeCollection::create([
                'receipt_number' => $receiptNumber,
                'student_id' => $student->id,
                'batch_id' => $batch->id,
                'batch_enrollment_id' => $enrollment?->id,
                'installment_title' => $validated['collection_mode'] === 'installment' ? $validated['installment_title'] : null,
                'month' => $validated['collection_mode'] === 'monthly' ? (int) $validated['month'] : null,
                'year' => $validated['collection_mode'] === 'monthly' ? (int) $validated['year'] : null,
                'fee_type_id' => $feeType->id,
                'academic_year_id' => $student->academic_year_id ?? 1,
                'account_id' => $validated['account_id'],
                'accounting_transaction_id' => $transaction->id,
                'amount' => $grossAmount,
                'discount' => $discount,
                'late_fee' => 0,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'status' => 'paid',
                'remarks' => $validated['remarks'] ?? null,
                'collected_by' => auth()->id(),
            ]);

            logActivity('create', "Collected coaching fee {$paidAmount} BDT from {$student->full_name} for batch {$batch->name}", FeeCollection::class, $collection->id);

            return redirect()->route('fees.collections.receipt', $collection->id)
                ->with('success', 'Fee collected successfully! Receipt ready.');
        });
    }

    public function getEnrollment(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
        ]);

        $enrollment = BatchEnrollment::where('student_id', $request->student_id)
            ->where('batch_id', $request->batch_id)
            ->with(['batch.course'])
            ->first();

        if (! $enrollment) {
            return response()->json(['error' => 'Enrollment not found'], 404);
        }

        // Count previous payments made for this batch
        $previousPaid = (float) FeeCollection::where('student_id', $request->student_id)
            ->where('batch_id', $request->batch_id)
            ->where('status', 'paid')
            ->sum('paid_amount');

        return response()->json([
            'agreed_fee' => (float) $enrollment->agreed_fee,
            'discount_amount' => (float) $enrollment->discount_amount,
            'previous_paid' => $previousPaid,
            'batch_name' => $enrollment->batch->name,
            'course_name' => $enrollment->batch->course?->name ?? 'N/A',
            'course_fee' => (float) ($enrollment->batch->course?->standard_fee ?? 0),
        ]);
    }
}
