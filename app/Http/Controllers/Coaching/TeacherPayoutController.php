<?php

namespace App\Http\Controllers\Coaching;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Batch;
use App\Models\FeeCollection;
use App\Models\Teacher;
use App\Models\TeacherPayout;
use App\Traits\CreatesAccountingTransactions;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherPayoutController extends Controller
{
    use CreatesAccountingTransactions;

    public function index(Request $request)
    {
        $this->authorize('view_teacher_payouts');

        $selectedMonth = (int) $request->input('month', Carbon::now()->month);
        $selectedYear = (int) $request->input('year', Carbon::now()->year);
        $selectedTeacherId = $request->input('teacher_id');

        // 1. Fetch batches with teachers for the remuneration calculation sheet
        $batchesQuery = Batch::with(['teacher', 'course'])
            ->whereNotNull('teacher_id')
            ->where('status', 'active');

        if ($selectedTeacherId) {
            $batchesQuery->where('teacher_id', $selectedTeacherId);
        }

        $batches = $batchesQuery->get()->map(function ($batch) use ($selectedMonth, $selectedYear) {
            $collection = (float) FeeCollection::where('batch_id', $batch->id)
                ->where('status', 'paid')
                ->whereMonth('payment_date', $selectedMonth)
                ->whereYear('payment_date', $selectedYear)
                ->sum('paid_amount');

            $rate = (float) ($batch->teacher_commission_rate ?? 0);
            $type = $batch->remuneration_type ?? 'none';
            $calculatedAmount = 0.0;

            if ($type === 'percentage') {
                $calculatedAmount = round(($collection * $rate) / 100, 2);
            } elseif ($type === 'fixed' || $type === 'per_class') {
                $calculatedAmount = $rate;
            }

            $alreadyPaid = (float) TeacherPayout::where('teacher_id', $batch->teacher_id)
                ->where('batch_id', $batch->id)
                ->where('period_month', $selectedMonth)
                ->where('period_year', $selectedYear)
                ->where('status', 'paid')
                ->sum('paid_amount');

            $dueAmount = max(0, $calculatedAmount - $alreadyPaid);

            return [
                'batch_id' => $batch->id,
                'batch_name' => $batch->name,
                'course_name' => $batch->course?->name ?? 'N/A',
                'teacher_id' => $batch->teacher_id,
                'teacher_name' => $batch->teacher?->full_name ?? 'N/A',
                'remuneration_type' => $type,
                'commission_rate' => $rate,
                'total_collection' => $collection,
                'calculated_commission' => $calculatedAmount,
                'already_paid' => $alreadyPaid,
                'due_amount' => $dueAmount,
            ];
        });

        // 2. Fetch historical payouts
        $payoutsQuery = TeacherPayout::with(['teacher', 'batch.course', 'account', 'creator'])
            ->latest('payout_date');

        if ($selectedTeacherId) {
            $payoutsQuery->where('teacher_id', $selectedTeacherId);
        }
        if ($request->filled('month')) {
            $payoutsQuery->where('period_month', $selectedMonth);
        }
        if ($request->filled('year')) {
            $payoutsQuery->where('period_year', $selectedYear);
        }

        $payouts = $payoutsQuery->paginate(15)->withQueryString();

        // 3. Dropdown datasets
        $teachers = Teacher::where('status', 'active')->orderBy('first_name')->get();
        $accounts = Account::where('status', 'active')->get();

        // 4. Summary metrics
        $totalPaidThisMonth = (float) TeacherPayout::where('period_month', $selectedMonth)
            ->where('period_year', $selectedYear)
            ->where('status', 'paid')
            ->sum('paid_amount');

        $totalEstimatedCommission = $batches->sum('calculated_commission');
        $totalDueCommission = $batches->sum('due_amount');

        return Inertia::render('Coaching/TeacherPayouts/Index', [
            'calculationSheet' => $batches,
            'payouts' => $payouts,
            'teachers' => $teachers,
            'accounts' => $accounts,
            'filters' => [
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'teacher_id' => $selectedTeacherId,
            ],
            'metrics' => [
                'total_estimated' => $totalEstimatedCommission,
                'total_paid' => $totalPaidThisMonth,
                'total_due' => $totalDueCommission,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_teacher_payouts');

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'batch_id' => 'nullable|exists:batches,id',
            'period_month' => 'required|integer|between:1,12',
            'period_year' => 'required|integer|min:2020|max:2035',
            'total_batch_collection' => 'required|numeric|min:0',
            'remuneration_type' => 'required|string|in:none,percentage,per_class,fixed',
            'commission_rate' => 'required|numeric|min:0',
            'calculated_amount' => 'required|numeric|min:0',
            'bonus_amount' => 'nullable|numeric|min:0',
            'deduction_amount' => 'nullable|numeric|min:0',
            'paid_amount' => 'required|numeric|min:1',
            'payout_date' => 'required|date',
            'account_id' => 'required|exists:accounts,id',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $voucherNo = TeacherPayout::nextVoucherNumber();
            $teacher = Teacher::findOrFail($validated['teacher_id']);
            $batch = !empty($validated['batch_id']) ? Batch::find($validated['batch_id']) : null;

            $batchName = $batch ? " (Batch: {$batch->name})" : '';
            $monthName = Carbon::create($validated['period_year'], $validated['period_month'], 1)->format('F Y');
            $description = "Teacher Commission Payout for {$teacher->full_name}{$batchName} - {$monthName}";

            // Record accounting expense transaction
            $transaction = $this->createExpenseTransaction(
                accountId: (int) $validated['account_id'],
                amount: (float) $validated['paid_amount'],
                date: $validated['payout_date'],
                paymentMethod: $validated['payment_method'],
                referenceNumber: $voucherNo,
                description: $description
            );

            $payout = TeacherPayout::create([
                'payout_voucher_no' => $voucherNo,
                'teacher_id' => $validated['teacher_id'],
                'batch_id' => $validated['batch_id'] ?? null,
                'period_month' => $validated['period_month'],
                'period_year' => $validated['period_year'],
                'total_batch_collection' => $validated['total_batch_collection'],
                'remuneration_type' => $validated['remuneration_type'],
                'commission_rate' => $validated['commission_rate'],
                'calculated_amount' => $validated['calculated_amount'],
                'bonus_amount' => $validated['bonus_amount'] ?? 0,
                'deduction_amount' => $validated['deduction_amount'] ?? 0,
                'paid_amount' => $validated['paid_amount'],
                'payout_date' => $validated['payout_date'],
                'account_id' => $validated['account_id'],
                'payment_method' => $validated['payment_method'],
                'accounting_transaction_id' => $transaction->id,
                'status' => 'paid',
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            logActivity('create', "Disbursed teacher payout {$voucherNo} of {$payout->paid_amount} BDT to {$teacher->full_name}", TeacherPayout::class, $payout->id);

            return back()->with('success', "Payout {$voucherNo} disbursed successfully!");
        });
    }

    public function destroy(TeacherPayout $payout)
    {
        $this->authorize('manage_teacher_payouts');

        DB::transaction(function () use ($payout) {
            if ($payout->accounting_transaction_id) {
                $this->reverseAccountingTransaction($payout->accounting_transaction_id);
            }

            $voucher = $payout->payout_voucher_no;
            $payout->delete();

            logActivity('delete', "Cancelled and reversed teacher payout {$voucher}", TeacherPayout::class);
        });

        return back()->with('success', 'Teacher payout cancelled and accounting balance reversed.');
    }
}
