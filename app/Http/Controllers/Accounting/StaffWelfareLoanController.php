<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\StaffWelfareLoan;
use App\Models\StaffWelfareLoanInstallment;
use App\Models\StaffWelfareFundDonation;
use App\Models\Teacher;
use App\Models\Account;
use App\Models\User;
use App\Models\Transaction;
use App\Models\IncomeCategory;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class StaffWelfareLoanController extends Controller
{
    /**
     * Generate unique transaction number considering deleted transactions
     */
    private function generateTransactionNumber()
    {
        $today = today();
        $prefix = 'TRX-' . $today->format('Ymd') . '-';

        // Get the last transaction number for today (including soft deleted)
        $lastTransaction = Transaction::withTrashed()
            ->where('transaction_number', 'LIKE', $prefix . '%')
            ->orderBy('transaction_number', 'desc')
            ->first();

        if ($lastTransaction) {
            // Extract the number part and increment it
            $lastNumber = (int) substr($lastTransaction->transaction_number, -6);
            $newNumber = $lastNumber + 1;
        } else {
            // First transaction of the day
            $newNumber = 1;
        }

        $transactionNumber = $prefix . str_pad($newNumber, 6, '0', STR_PAD_LEFT);

        // Keep incrementing until we find a unique number
        while (Transaction::withTrashed()->where('transaction_number', $transactionNumber)->exists()) {
            $newNumber++;
            $transactionNumber = $prefix . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
        }

        return $transactionNumber;
    }

    public function index()
    {
        $this->authorize('manage_accounting');

        // Get all loans with teacher info
        $loans = StaffWelfareLoan::with(['teacher.user', 'account', 'installments'])
            ->latest()
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'loan_number' => $loan->loan_number,
                    'teacher' => [
                        'id' => $loan->teacher->id,
                        'name' => $loan->teacher->user->name,
                        'employee_id' => $loan->teacher->employee_id,
                    ],
                    'account' => [
                        'id' => $loan->account->id,
                        'account_name' => $loan->account->account_name,
                    ],
                    'loan_amount' => (float) $loan->loan_amount,
                    'total_paid' => (float) $loan->total_paid,
                    'remaining_amount' => (float) $loan->remaining_amount,
                    'installment_count' => $loan->installment_count,
                    'paid_installments' => $loan->paid_installments,
                    'installment_amount' => (float) $loan->installment_amount,
                    'loan_date' => $loan->loan_date->format('Y-m-d'),
                    'first_installment_date' => $loan->first_installment_date->format('Y-m-d'),
                    'status' => $loan->status,
                    'progress_percentage' => $loan->progress_percentage,
                    'purpose' => $loan->purpose,
                    'remarks' => $loan->remarks,
                    'created_at' => $loan->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get donations
        $donations = StaffWelfareFundDonation::with('account')
            ->latest()
            ->get()
            ->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'donation_number' => $donation->donation_number,
                    'account' => [
                        'id' => $donation->account->id,
                        'account_name' => $donation->account->account_name,
                    ],
                    'amount' => (float) $donation->amount,
                    'donation_date' => $donation->donation_date->format('Y-m-d'),
                    'donor_name' => $donation->donor_name,
                    'payment_method' => $donation->payment_method,
                    'reference_number' => $donation->reference_number,
                    'remarks' => $donation->remarks,
                    'created_at' => $donation->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get teachers for dropdown
        $teachers = Teacher::with('user')
            ->where('status', 'active')
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->user->name,
                    'employee_id' => $teacher->employee_id,
                    'designation' => $teacher->designation,
                ];
            });

        // Get Staff Welfare Fund account specifically
        $welfareFundAccount = Account::where('status', 'active')
            ->where(function ($query) {
                $query->where('account_name', 'LIKE', '%Staff Welfare Fund%')
                    ->orWhere('account_name', 'LIKE', '%Welfare Fund%')
                    ->orWhere('account_name', 'LIKE', '%Staff Welfare%');
            })
            ->first(['id', 'account_name', 'current_balance']);

        // Calculate fund balance (exclude cancelled loans)
        $totalDonations = StaffWelfareFundDonation::sum('amount');
        $totalLoansGiven = StaffWelfareLoan::whereIn('status', ['active', 'completed'])->sum('loan_amount');
        $totalRecovered = StaffWelfareLoan::whereIn('status', ['active', 'completed'])->sum('total_paid');
        $fundBalance = $totalDonations - $totalLoansGiven + $totalRecovered;

        // Get statistics (exclude cancelled loans from calculations)
        $stats = [
            'total_loans' => StaffWelfareLoan::whereIn('status', ['active', 'completed'])->count(),
            'active_loans' => StaffWelfareLoan::where('status', 'active')->count(),
            'total_amount_given' => StaffWelfareLoan::whereIn('status', ['active', 'completed'])->sum('loan_amount'),
            'total_recovered' => StaffWelfareLoan::whereIn('status', ['active', 'completed'])->sum('total_paid'),
            'total_outstanding' => StaffWelfareLoan::where('status', 'active')->sum('remaining_amount'),
            'total_donations' => $totalDonations,
            'fund_balance' => $fundBalance,
        ];

        return Inertia::render('Accounting/StaffWelfareLoans/Index', [
            'loans' => $loans,
            'donations' => $donations,
            'teachers' => $teachers,
            'welfareFundAccount' => $welfareFundAccount,
            'stats' => $stats,
        ]);
    }

    public function show($id)
    {
        $this->authorize('manage_accounting');

        $loan = StaffWelfareLoan::with([
            'teacher.user',
            'account',
            'approver',
            'creator',
            'installments' => function ($query) {
                $query->orderBy('installment_number');
            },
            'installments.account',
            'installments.paidByUser'
        ])->findOrFail($id);

        $loanData = [
            'id' => $loan->id,
            'loan_number' => $loan->loan_number,
            'teacher' => [
                'id' => $loan->teacher->id,
                'name' => $loan->teacher->user->name,
                'employee_id' => $loan->teacher->employee_id,
                'designation' => $loan->teacher->designation,
            ],
            'account' => [
                'id' => $loan->account->id,
                'account_name' => $loan->account->account_name,
            ],
            'loan_amount' => (float) $loan->loan_amount,
            'total_paid' => (float) $loan->total_paid,
            'remaining_amount' => (float) $loan->remaining_amount,
            'installment_count' => $loan->installment_count,
            'paid_installments' => $loan->paid_installments,
            'installment_amount' => (float) $loan->installment_amount,
            'loan_date' => $loan->loan_date->format('Y-m-d'),
            'first_installment_date' => $loan->first_installment_date->format('Y-m-d'),
            'status' => $loan->status,
            'purpose' => $loan->purpose,
            'remarks' => $loan->remarks,
            'progress_percentage' => $loan->progress_percentage,
            'approver' => $loan->approver->name,
            'creator' => $loan->creator->name,
            'created_at' => $loan->created_at->format('Y-m-d H:i:s'),
            'installments' => $loan->installments->map(function ($inst) {
                return [
                    'id' => $inst->id,
                    'installment_number' => $inst->installment_number,
                    'amount' => (float) $inst->amount,
                    'due_date' => $inst->due_date->format('Y-m-d'),
                    'paid_date' => $inst->paid_date ? $inst->paid_date->format('Y-m-d') : null,
                    'status' => $inst->status,
                    'is_overdue' => $inst->is_overdue,
                    'days_overdue' => $inst->days_overdue,
                    'account' => $inst->account ? [
                        'account_name' => $inst->account->account_name,
                    ] : null,
                    'payment_method' => $inst->payment_method,
                    'reference_number' => $inst->reference_number,
                    'remarks' => $inst->remarks,
                    'paid_by' => $inst->paidByUser ? $inst->paidByUser->name : null,
                ];
            }),
        ];

        // Get Staff Welfare Fund account specifically
        $welfareFundAccount = Account::where('status', 'active')
            ->where(function ($query) {
                $query->where('account_name', 'LIKE', '%Staff Welfare Fund%')
                    ->orWhere('account_name', 'LIKE', '%Welfare Fund%')
                    ->orWhere('account_name', 'LIKE', '%Staff Welfare%');
            })
            ->first(['id', 'account_name', 'current_balance']);

        return Inertia::render('Accounting/StaffWelfareLoans/Show', [
            'loan' => $loanData,
            'welfareFundAccount' => $welfareFundAccount,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'account_id' => 'required|exists:accounts,id',
            'loan_amount' => 'required|numeric|min:1',
            'installment_amount' => 'required|numeric|min:1',
            'loan_date' => 'required|date',
            'first_installment_date' => 'required|date|after_or_equal:loan_date',
            'purpose' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Get teacher data
            $teacher = Teacher::with('user')->findOrFail($validated['teacher_id']);

            // Calculate number of installments automatically
            $installmentAmount = floatval($validated['installment_amount']);
            $loanAmount = floatval($validated['loan_amount']);
            $installmentCount = (int) ceil($loanAmount / $installmentAmount);

            // Generate loan number
            $loanNumber = 'SWL-' . date('Ymd') . '-' . str_pad(StaffWelfareLoan::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Create loan
            $loan = StaffWelfareLoan::create([
                'loan_number' => $loanNumber,
                'teacher_id' => $validated['teacher_id'],
                'account_id' => $validated['account_id'],
                'loan_amount' => $loanAmount,
                'total_paid' => 0,
                'remaining_amount' => $loanAmount,
                'installment_count' => $installmentCount,
                'paid_installments' => 0,
                'installment_amount' => $installmentAmount,
                'loan_date' => $validated['loan_date'],
                'first_installment_date' => $validated['first_installment_date'],
                'status' => 'active',
                'purpose' => $validated['purpose'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'approved_by' => auth()->id(),
                'created_by' => auth()->id(),
            ]);

            // Create installments
            $firstInstallmentDate = Carbon::parse($validated['first_installment_date']);
            for ($i = 1; $i <= $installmentCount; $i++) {
                $dueDate = $firstInstallmentDate->copy()->addMonthsNoOverflow($i - 1);

                // Calculate amount for this installment
                // Last installment should be the remaining amount to match exact loan amount
                if ($i == $installmentCount) {
                    $thisInstallmentAmount = $loanAmount - ($installmentAmount * ($installmentCount - 1));
                } else {
                    $thisInstallmentAmount = $installmentAmount;
                }

                StaffWelfareLoanInstallment::create([
                    'loan_id' => $loan->id,
                    'installment_number' => $i,
                    'amount' => $thisInstallmentAmount,
                    'due_date' => $dueDate,
                    'status' => 'pending',
                ]);
            }

            // Deduct amount from account (money given out)
            Account::find($validated['account_id'])->decrement('current_balance', $validated['loan_amount']);

            // Create Transaction record for loan disbursement
            $expenseCategory = ExpenseCategory::firstOrCreate(
                ['name' => 'Staff Welfare Loan'],
                [
                    'code' => 'SWF-LOAN',
                    'description' => 'Loans given to staff from welfare fund',
                    'status' => 'active'
                ]
            );

            $transactionNumber = $this->generateTransactionNumber();

            Transaction::create([
                'account_id' => $validated['account_id'],
                'transaction_number' => $transactionNumber,
                'type' => 'expense',
                'expense_category_id' => $expenseCategory->id,
                'amount' => $validated['loan_amount'],
                'transaction_date' => $validated['loan_date'],
                'payment_method' => 'bank_transfer',
                'description' => "Welfare Fund Loan to {$teacher->user->name} ({$teacher->employee_id}) - {$loanNumber}",
                'created_by' => auth()->id(),
            ]);

            // Log activity
            logActivity('create', "Staff Welfare Loan created: {$loanNumber} - ৳{$validated['loan_amount']}", StaffWelfareLoan::class, $loan->id);

            DB::commit();

            return redirect()->route('accounting.welfare-loans.index')
                ->with('success', "Loan created successfully! Loan Number: {$loanNumber}");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create loan: ' . $e->getMessage());
        }
    }

    public function payInstallment(Request $request, $installmentId)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'paid_date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $installment = StaffWelfareLoanInstallment::with('loan')->findOrFail($installmentId);

            if ($installment->status === 'paid') {
                return redirect()->back()->with('error', 'This installment is already paid!');
            }

            $loan = $installment->loan;

            // Mark installment as paid
            $installment->update([
                'status' => 'paid',
                'paid_date' => $validated['paid_date'],
                'account_id' => $validated['account_id'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'paid_by' => auth()->id(),
            ]);

            // Update loan
            $loan->increment('total_paid', $installment->amount);
            $loan->decrement('remaining_amount', $installment->amount);
            $loan->increment('paid_installments');

            // Add amount to account (money received back)
            Account::find($validated['account_id'])->increment('current_balance', $installment->amount);

            // Create Transaction record for installment payment
            $incomeCategory = IncomeCategory::firstOrCreate(
                ['name' => 'Staff Welfare Loan Recovery'],
                [
                    'code' => 'SWF-RECOVERY',
                    'description' => 'Installment payments from staff welfare loans',
                    'status' => 'active'
                ]
            );

            $transactionNumber = $this->generateTransactionNumber();

            $teacher = $loan->teacher;
            Transaction::create([
                'account_id' => $validated['account_id'],
                'transaction_number' => $transactionNumber,
                'type' => 'income',
                'income_category_id' => $incomeCategory->id,
                'amount' => $installment->amount,
                'transaction_date' => $validated['paid_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'description' => "Loan Installment #{$installment->installment_number} from {$teacher->user->name} - {$loan->loan_number}",
                'created_by' => auth()->id(),
            ]);

            // Check if loan is fully paid
            if ($loan->remaining_amount <= 0) {
                $loan->update(['status' => 'paid']);
            }

            // Log activity
            logActivity('update', "Loan installment paid: {$loan->loan_number} - Installment #{$installment->installment_number} - ৳{$installment->amount}", StaffWelfareLoanInstallment::class, $installment->id);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Installment payment recorded successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to record payment: ' . $e->getMessage());
        }
    }

    public function cancel($id)
    {
        $this->authorize('manage_accounting');

        DB::beginTransaction();
        try {
            $loan = StaffWelfareLoan::findOrFail($id);

            if ($loan->status !== 'active') {
                return redirect()->back()->with('error', 'Only active loans can be cancelled!');
            }

            if ($loan->total_paid > 0) {
                return redirect()->back()->with('error', 'Cannot cancel a loan with payments already made!');
            }

            // Return money to account (reverse the loan disbursement)
            Account::find($loan->account_id)->increment('current_balance', $loan->loan_amount);

            // Delete the transaction associated with this loan
            Transaction::where('description', 'LIKE', "%{$loan->loan_number}%")
                ->where('type', 'expense')
                ->delete();

            // Cancel the loan
            $loan->update(['status' => 'cancelled']);

            // Log activity
            logActivity('update', "Staff Welfare Loan cancelled: {$loan->loan_number}", StaffWelfareLoan::class, $loan->id);

            DB::commit();

            return redirect()->route('accounting.welfare-loans.index')
                ->with('success', 'Loan cancelled and transaction deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to cancel loan: ' . $e->getMessage());
        }
    }

    public function addDonation(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:1',
            'donation_date' => 'required|date',
            'donor_name' => 'nullable|string',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Generate donation number
            $donationNumber = 'SWF-' . date('Ymd') . '-' . str_pad(StaffWelfareFundDonation::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Create donation record
            StaffWelfareFundDonation::create([
                'donation_number' => $donationNumber,
                'account_id' => $validated['account_id'],
                'amount' => $validated['amount'],
                'donation_date' => $validated['donation_date'],
                'donor_name' => $validated['donor_name'] ?? 'Anonymous',
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Add amount to account (money received)
            Account::find($validated['account_id'])->increment('current_balance', $validated['amount']);

            // Create Transaction record for donation
            $incomeCategory = IncomeCategory::firstOrCreate(
                ['name' => 'Staff Welfare Fund Donation'],
                [
                    'code' => 'SWF-DONATION',
                    'description' => 'Donations received for staff welfare fund',
                    'status' => 'active'
                ]
            );

            $transactionNumber = $this->generateTransactionNumber();

            Transaction::create([
                'account_id' => $validated['account_id'],
                'transaction_number' => $transactionNumber,
                'type' => 'income',
                'income_category_id' => $incomeCategory->id,
                'amount' => $validated['amount'],
                'transaction_date' => $validated['donation_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'description' => "Welfare Fund Donation from {$validated['donor_name']} - {$donationNumber}",
                'created_by' => auth()->id(),
            ]);

            // Log activity
            logActivity('create', "Staff Welfare Fund donation added: {$donationNumber} - ৳{$validated['amount']}", StaffWelfareFundDonation::class);

            DB::commit();

            return redirect()->route('accounting.welfare-loans.index')
                ->with('success', "Donation added successfully! Amount: ৳{$validated['amount']}");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to add donation: ' . $e->getMessage());
        }
    }

    public function editLoan(Request $request, $id)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'loan_amount' => 'required|numeric|min:0.01',
            'installment_count' => 'required|integer|min:1',
            'loan_date' => 'required|date',
            'first_installment_date' => 'required|date|after_or_equal:loan_date',
            'purpose' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $loan = StaffWelfareLoan::with(['installments' => function ($query) {
                $query->orderBy('installment_number');
            }])->findOrFail($id);

            if ($loan->status !== 'active') {
                return redirect()->back()->with('error', 'Only active loans can be edited!');
            }

            $paidInstallments = $loan->installments->where('status', 'paid')->values();
            $paidCount = $paidInstallments->count();
            $totalPaid = round((float) $paidInstallments->sum('amount'), 2);

            $newLoanAmount = round((float) $validated['loan_amount'], 2);

            if ($newLoanAmount + 0.0001 < $totalPaid) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Loan amount cannot be less than total already paid (৳' . format_amount($totalPaid) . ').');
            }

            if ((int) $validated['installment_count'] < $paidCount) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Total installments cannot be less than the number of installments already paid (' . $paidCount . ').');
            }

            $remainingAmount = round($newLoanAmount - $totalPaid, 2);
            if ($remainingAmount < 0) {
                $remainingAmount = 0;
            }

            $pendingCount = (int) $validated['installment_count'] - $paidCount;

            if ($remainingAmount > 0.009 && $pendingCount < 1) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Increase total installments so there is at least one pending slot for the remaining balance (৳' . format_amount($remainingAmount) . ').');
            }

            if ($remainingAmount <= 0.009 && $pendingCount > 0) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'This loan is already fully covered by recorded payments. Set total installments to ' . $paidCount . ' or increase the loan amount.');
            }

            $oldAmount = (float) $loan->loan_amount;

            // Remove only unpaid schedule rows; paid installments and their history stay intact
            StaffWelfareLoanInstallment::where('loan_id', $loan->id)
                ->whereIn('status', ['pending', 'overdue'])
                ->delete();

            $firstInstallmentDate = Carbon::parse($validated['first_installment_date']);
            $newInstallmentAmountForLoan = (int) $validated['installment_count'] > 0
                ? round($newLoanAmount / (int) $validated['installment_count'], 2)
                : 0;

            // Keep payment records on paid rows; only move due dates to match the edited
            // first installment anchor so the whole schedule stays one continuous calendar chain.
            foreach ($paidInstallments->sortBy('installment_number') as $paidInst) {
                $paidInst->update([
                    'due_date' => $firstInstallmentDate->copy()->addMonthsNoOverflow($paidInst->installment_number - 1),
                ]);
            }

            if ($pendingCount > 0) {
                $basePendingAmount = round($remainingAmount / $pendingCount, 2);
                for ($i = 1; $i <= $pendingCount; $i++) {
                    $installmentNumber = $paidCount + $i;
                    $dueDate = $firstInstallmentDate->copy()->addMonthsNoOverflow($installmentNumber - 1);

                    if ($i === $pendingCount) {
                        $thisInstallmentAmount = round($remainingAmount - ($basePendingAmount * ($pendingCount - 1)), 2);
                    } else {
                        $thisInstallmentAmount = $basePendingAmount;
                    }

                    StaffWelfareLoanInstallment::create([
                        'loan_id' => $loan->id,
                        'installment_number' => $installmentNumber,
                        'amount' => $thisInstallmentAmount,
                        'due_date' => $dueDate,
                        'status' => 'pending',
                    ]);
                }
            }

            $loan->update([
                'loan_amount' => $newLoanAmount,
                'total_paid' => $totalPaid,
                'remaining_amount' => $remainingAmount,
                'installment_count' => (int) $validated['installment_count'],
                'paid_installments' => $paidCount,
                'installment_amount' => $newInstallmentAmountForLoan,
                'loan_date' => $validated['loan_date'],
                'first_installment_date' => $validated['first_installment_date'],
                'purpose' => $validated['purpose'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'status' => $remainingAmount <= 0.009 ? 'paid' : 'active',
            ]);

            // Adjust account balance for corrected disbursement amount
            $difference = $newLoanAmount - $oldAmount;
            if ($difference > 0) {
                Account::find($loan->account_id)->decrement('current_balance', $difference);
            } elseif ($difference < 0) {
                Account::find($loan->account_id)->increment('current_balance', abs($difference));
            }

            $teacher = $loan->teacher;
            Transaction::where('description', 'LIKE', "%{$loan->loan_number}%")
                ->where('type', 'expense')
                ->update([
                    'amount' => $newLoanAmount,
                    'transaction_date' => $validated['loan_date'],
                    'description' => "Welfare Fund Loan to {$teacher->user->name} ({$teacher->employee_id}) - {$loan->loan_number}",
                ]);

            logActivity('update', "Staff Welfare Loan edited: {$loan->loan_number} - ৳{$newLoanAmount}", StaffWelfareLoan::class, $loan->id);

            DB::commit();

            return redirect()->route('accounting.welfare-loans.show', $loan->id)
                ->with('success', 'Loan updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update loan: ' . $e->getMessage());
        }
    }

    public function deleteDonation($id)
    {
        $this->authorize('manage_accounting');

        DB::beginTransaction();
        try {
            $donation = StaffWelfareFundDonation::findOrFail($id);
            $amount = $donation->amount;
            $donationNumber = $donation->donation_number;

            // Deduct amount from account (reverse the donation)
            Account::find($donation->account_id)->decrement('current_balance', $amount);

            // Note: Transaction will NOT be deleted due to model protection
            // The original transaction remains as audit trail
            // The deletion of donation record is sufficient for business logic

            // Delete donation
            $donation->delete();

            logActivity('delete', "Staff Welfare Fund donation deleted: {$donationNumber} - ৳{$amount}", StaffWelfareFundDonation::class);

            DB::commit();

            return redirect()->route('accounting.welfare-loans.index')
                ->with('success', 'Donation deleted successfully! (Transaction preserved for audit trail)');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to delete donation: ' . $e->getMessage());
        }
    }
}
