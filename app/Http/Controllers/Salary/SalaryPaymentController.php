<?php

namespace App\Http\Controllers\Salary;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalaryPaymentRequest;
use App\Http\Requests\UpdateSalaryPaymentRequest;
use App\Models\Account;
use App\Models\ExpenseCategory;
use App\Models\IncomeCategory;
use App\Models\ProvidentFundTransaction;
use App\Models\SalaryPayment;
use App\Models\Teacher;
use App\Models\Transaction;
use App\Traits\CreatesAccountingTransactions;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalaryPaymentController extends Controller
{
    use CreatesAccountingTransactions;

    /**
     * Display a listing of salary payments.
     */
    public function index(Request $request)
    {
        $payments = SalaryPayment::with(['staff.user', 'account', 'creator'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('staff', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%");
                });
            })
            ->when($request->month, function ($query, $month) {
                $query->where('month', $month);
            })
            ->when($request->year, function ($query, $year) {
                $query->where('year', $year);
            })
            ->latest('payment_date')
            ->paginate(15)
            ->withQueryString();

        $teachers = Teacher::where('status', 'active')
            ->with('user')
            ->whereNotNull('salary')
            ->orderBy('first_name')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name,
                'employee_id' => $t->employee_id,
                'salary' => $t->salary,
                'designation' => $t->designation,
            ]);

        $accounts = Account::whereIn('account_type', ['bank', 'cash', 'mobile_banking'])
            ->where('status', 'active')
            ->orderBy('account_name')
            ->get();

        return Inertia::render('Salaries/Payments/Index', [
            'payments' => $payments,
            'teachers' => $teachers,
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'month', 'year']),
        ]);
    }

    /**
     * Store a newly created salary payment.
     */
    public function store(StoreSalaryPaymentRequest $request)
    {
        // Check if payment already exists for this teacher/month/year BEFORE transaction
        $existingPayment = SalaryPayment::where('staff_id', $request->staff_id)
            ->where('month', $request->month)
            ->where('year', $request->year)
            ->first();

        if ($existingPayment) {
            $teacher = Teacher::with('user')->find($request->staff_id);
            $monthName = date('F', mktime(0, 0, 0, $request->month, 1));
            
            return redirect()->back()->with('error', "Salary already paid for {$teacher->user->name} in {$monthName} {$request->year}");
        }

        try {
            DB::beginTransaction();

            $validated = $request->validated();

            $baseSalary = (float) $validated['base_salary'];
            $amounts = $this->calculateSalaryAmounts($baseSalary);
            $employeePF = $amounts['employeePF'];
            $employerPF = $amounts['employerPF'];
            $netSalary = $amounts['netSalary'];
            $totalAmount = $amounts['totalAmount'];

            // Create salary payment record
            $payment = SalaryPayment::create([
                'staff_id' => $validated['staff_id'],
                'month' => $validated['month'],
                'year' => $validated['year'],
                'base_salary' => $baseSalary,
                'provident_fund_deduction' => $employeePF,
                'employer_pf_contribution' => $employerPF,
                'net_salary' => $netSalary,
                'total_amount' => $totalAmount,
                'payment_date' => $validated['payment_date'],
                'account_id' => $validated['account_id'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Create provident fund transaction
            ProvidentFundTransaction::create([
                'staff_id' => $validated['staff_id'],
                'salary_payment_id' => $payment->id,
                'employee_contribution' => $employeePF,
                'employer_contribution' => $employerPF,
                'total_contribution' => $employeePF + $employerPF,
                'transaction_date' => $validated['payment_date'],
            ]);

            // Get staff details for description
            $staff = Teacher::with('user')->find($validated['staff_id']);

            $categories = $this->getSalaryAccountingCategories();

            $this->createSalaryAccountingTransactions(
                payment: $payment,
                staff: $staff,
                accountId: (int) $validated['account_id'],
                paymentDate: $validated['payment_date'],
                paymentMethod: $validated['payment_method'],
                baseSalary: $baseSalary,
                employeePF: $employeePF,
                employerPF: $employerPF,
                salaryCategory: $categories['salaryCategory'],
                pfCategory: $categories['pfCategory'],
                pfAccount: $categories['pfAccount']
            );

            DB::commit();

            return redirect()->back()->with('success', 'Salary paid successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to process salary payment: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing a posted salary payment.
     */
    public function edit(SalaryPayment $payment)
    {
        $payment->load(['staff.user', 'account']);

        $accounts = Account::whereIn('account_type', ['bank', 'cash', 'mobile_banking'])
            ->where('status', 'active')
            ->orderBy('account_name')
            ->get();

        return Inertia::render('Salaries/Payments/Edit', [
            'payment' => $payment,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Update a posted salary payment and sync accounting / PF records.
     */
    public function update(UpdateSalaryPaymentRequest $request, SalaryPayment $payment)
    {
        $validated = $request->validated();

        $duplicate = SalaryPayment::where('staff_id', $validated['staff_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->where('id', '!=', $payment->id)
            ->exists();

        if ($duplicate) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Another salary payment already exists for this teacher and period.');
        }

        try {
            DB::beginTransaction();

            $baseSalary = (float) $validated['base_salary'];
            $amounts = $this->calculateSalaryAmounts($baseSalary);
            $employeePF = $amounts['employeePF'];
            $employerPF = $amounts['employerPF'];
            $netSalary = $amounts['netSalary'];
            $totalAmount = $amounts['totalAmount'];

            $this->reverseSalaryAccountingTransactions($payment);

            $payment->update([
                'staff_id' => $validated['staff_id'],
                'month' => $validated['month'],
                'year' => $validated['year'],
                'base_salary' => $baseSalary,
                'provident_fund_deduction' => $employeePF,
                'employer_pf_contribution' => $employerPF,
                'net_salary' => $netSalary,
                'total_amount' => $totalAmount,
                'payment_date' => $validated['payment_date'],
                'account_id' => $validated['account_id'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $payment->refresh();
            $payment->load('staff.user');

            if ($payment->providentFundTransaction) {
                $payment->providentFundTransaction->update([
                    'staff_id' => $validated['staff_id'],
                    'employee_contribution' => $employeePF,
                    'employer_contribution' => $employerPF,
                    'total_contribution' => $employeePF + $employerPF,
                    'transaction_date' => $validated['payment_date'],
                ]);
            } else {
                ProvidentFundTransaction::create([
                    'staff_id' => $validated['staff_id'],
                    'salary_payment_id' => $payment->id,
                    'employee_contribution' => $employeePF,
                    'employer_contribution' => $employerPF,
                    'total_contribution' => $employeePF + $employerPF,
                    'transaction_date' => $validated['payment_date'],
                ]);
            }

            $categories = $this->getSalaryAccountingCategories();
            $this->createSalaryAccountingTransactions(
                payment: $payment,
                staff: $payment->staff,
                accountId: (int) $validated['account_id'],
                paymentDate: $validated['payment_date'],
                paymentMethod: $validated['payment_method'],
                baseSalary: $baseSalary,
                employeePF: $employeePF,
                employerPF: $employerPF,
                salaryCategory: $categories['salaryCategory'],
                pfCategory: $categories['pfCategory'],
                pfAccount: $categories['pfAccount']
            );

            DB::commit();

            return redirect()->route('salary-payments.index')
                ->with('success', 'Salary payment updated and recalculated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update salary payment: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified salary payment.
     */
    public function show(SalaryPayment $payment)
    {
        $payment->load(['staff.user', 'account', 'creator', 'providentFundTransaction']);

        return Inertia::render('Salaries/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Remove the specified salary payment.
     */
    public function destroy(SalaryPayment $payment)
    {
        try {
            DB::beginTransaction();

            $payment->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Salary payment deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to delete salary payment: ' . $e->getMessage());
        }
    }

    /**
     * Process bulk salary payments for multiple teachers.
     */
    public function bulkStore(Request $request)
    {
        $request->validate([
            'teacher_ids' => 'required|array|min:1',
            'teacher_ids.*' => 'required|exists:teachers,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'payment_date' => 'required|date',
            'account_id' => 'required|exists:accounts,id',
            'payment_method' => 'required|in:cash,bank_transfer,cheque',
            'reference_number' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Get or create Salary expense category
            $salaryCategory = ExpenseCategory::firstOrCreate(
                ['code' => 'SALARY'],
                [
                    'name' => 'Salary & Wages',
                    'description' => 'Employee salary and wage payments',
                    'status' => 'active'
                ]
            );

            // Get or create Provident Fund expense category
            $pfCategory = ExpenseCategory::firstOrCreate(
                ['code' => 'PROVIDENT_FUND'],
                [
                    'name' => 'Provident Fund',
                    'description' => 'Employee and employer provident fund contributions',
                    'status' => 'active'
                ]
            );

            // Get or create Provident Fund account
            $pfAccount = Account::firstOrCreate(
                ['account_name' => 'Provident Fund'],
                [
                    'account_type' => 'bank',
                    'account_number' => 'PF-' . date('Ymd'),
                    'bank_name' => 'Internal Fund',
                    'branch_name' => 'Main',
                    'current_balance' => 0,
                    'status' => 'active',
                ]
            );

            // Get or create Provident Fund income category
            IncomeCategory::firstOrCreate(
                ['code' => 'PF_INCOME'],
                [
                    'name' => 'Provident Fund Contribution',
                    'description' => 'Employee and employer provident fund contributions',
                    'status' => 'active',
                ]
            );

            $successCount = 0;
            $errors = [];

            foreach ($request->teacher_ids as $teacherId) {
                try {
                    // Check if payment already exists for this teacher/month/year
                    $existingPayment = SalaryPayment::where('staff_id', $teacherId)
                        ->where('month', $request->month)
                        ->where('year', $request->year)
                        ->first();

                    $teacher = Teacher::with('user')->find($teacherId);

                    if (!$teacher->salary) {
                        $errors[] = "{$teacher->user->name} does not have a salary set";
                        continue;
                    }

                    if ($existingPayment && $existingPayment->status === 'paid') {
                        $errors[] = "{$teacher->user->name} already paid for this period";
                        continue;
                    }

                    // If existing and pending/overdue, mark as paid
                    if ($existingPayment && in_array($existingPayment->status, ['pending', 'overdue'])) {
                        $existingPayment->update([
                            'status' => 'paid',
                            'payment_date' => $request->payment_date,
                            'account_id' => $request->account_id,
                            'payment_method' => $request->payment_method,
                            'reference_number' => $request->reference_number,
                            'remarks' => $request->remarks,
                        ]);

                        $payment = $existingPayment;
                        $baseSalary = (float) $payment->base_salary;
                        $employeePF = (float) $payment->provident_fund_deduction;
                        $employerPF = (float) $payment->employer_pf_contribution;
                        $totalAmount = (float) $payment->total_amount;
                    } else {
                        // Create new salary payment
                        $baseSalary = (float) $teacher->salary;
                        $employeePF = round($baseSalary * 0.05, 2);
                        $employerPF = round($baseSalary * 0.05, 2);
                        $netSalary = $baseSalary - $employeePF;
                        $totalAmount = $baseSalary + $employerPF;

                        $payment = SalaryPayment::create([
                            'staff_id' => $teacherId,
                            'month' => $request->month,
                            'year' => $request->year,
                            'base_salary' => $baseSalary,
                            'provident_fund_deduction' => $employeePF,
                            'employer_pf_contribution' => $employerPF,
                            'net_salary' => $netSalary,
                            'total_amount' => $totalAmount,
                            'payment_date' => $request->payment_date,
                            'status' => 'paid',
                            'account_id' => $request->account_id,
                            'payment_method' => $request->payment_method,
                            'reference_number' => $request->reference_number,
                            'remarks' => $request->remarks,
                            'created_by' => auth()->id(),
                        ]);
                    }

                    // Create PF transaction if doesn't exist
                    if (!$payment->providentFundTransaction) {
                        ProvidentFundTransaction::create([
                            'staff_id' => $teacherId,
                            'salary_payment_id' => $payment->id,
                            'employee_contribution' => $employeePF,
                            'employer_contribution' => $employerPF,
                            'total_contribution' => $employeePF + $employerPF,
                            'transaction_date' => $request->payment_date,
                        ]);
                    }

                    $this->createSalaryAccountingTransactions(
                        payment: $payment,
                        staff: $teacher,
                        accountId: (int) $request->account_id,
                        paymentDate: $request->payment_date,
                        paymentMethod: $request->payment_method,
                        baseSalary: $baseSalary,
                        employeePF: $employeePF,
                        employerPF: $employerPF,
                        salaryCategory: $salaryCategory,
                        pfCategory: $pfCategory,
                        pfAccount: $pfAccount
                    );

                    $successCount++;
                } catch (\Exception $e) {
                    $teacher = Teacher::with('user')->find($teacherId);
                    $errors[] = "{$teacher->user->name}: {$e->getMessage()}";
                }
            }

            DB::commit();

            if ($successCount > 0 && count($errors) === 0) {
                return redirect()->back()->with('success', "Successfully processed {$successCount} salary payments!");
            } elseif ($successCount > 0) {
                return redirect()->back()->with('warning', "Processed {$successCount} payments. " . count($errors) . " failed: " . implode(', ', $errors));
            } else {
                return redirect()->back()->with('error', "All payments failed: " . implode(', ', $errors));
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to process bulk payments: ' . $e->getMessage());
        }
    }

    /**
     * @return array{employeePF: float, employerPF: float, netSalary: float, totalAmount: float}
     */
    private function calculateSalaryAmounts(float $baseSalary): array
    {
        $employeePF = round($baseSalary * 0.05, 2);
        $employerPF = round($baseSalary * 0.05, 2);
        $netSalary = round($baseSalary - $employeePF, 2);
        $totalAmount = round($baseSalary + $employerPF, 2);

        return compact('employeePF', 'employerPF', 'netSalary', 'totalAmount');
    }

    private function accountingReference(SalaryPayment $payment): string
    {
        return 'SAL-PAY-' . $payment->id;
    }

    /**
     * @return array{salaryCategory: ExpenseCategory, pfCategory: ExpenseCategory, pfAccount: Account, pfIncomeCategory: IncomeCategory}
     */
    private function getSalaryAccountingCategories(): array
    {
        $salaryCategory = ExpenseCategory::firstOrCreate(
            ['code' => 'SALARY'],
            [
                'name' => 'Salary & Wages',
                'description' => 'Employee salary and wage payments',
                'status' => 'active',
            ]
        );

        $pfCategory = ExpenseCategory::firstOrCreate(
            ['code' => 'PROVIDENT_FUND'],
            [
                'name' => 'Provident Fund',
                'description' => 'Employee and employer provident fund contributions',
                'status' => 'active',
            ]
        );

        $pfAccount = Account::firstOrCreate(
            ['account_name' => 'Provident Fund'],
            [
                'account_type' => 'bank',
                'account_number' => 'PF-' . date('Ymd'),
                'bank_name' => 'Internal Fund',
                'branch_name' => 'Main',
                'current_balance' => 0,
                'status' => 'active',
            ]
        );

        $pfIncomeCategory = IncomeCategory::firstOrCreate(
            ['code' => 'PF_INCOME'],
            [
                'name' => 'Provident Fund Income',
                'description' => 'Employee and employer provident fund contributions',
                'status' => 'active',
            ]
        );

        return compact('salaryCategory', 'pfCategory', 'pfAccount', 'pfIncomeCategory');
    }

    private function createSalaryAccountingTransactions(
        SalaryPayment $payment,
        Teacher $staff,
        int $accountId,
        string $paymentDate,
        string $paymentMethod,
        float $baseSalary,
        float $employeePF,
        float $employerPF,
        ExpenseCategory $salaryCategory,
        ExpenseCategory $pfCategory,
        Account $pfAccount
    ): void {
        $categories = $this->getSalaryAccountingCategories();
        $pfIncomeCategory = $categories['pfIncomeCategory'];
        $reference = $this->accountingReference($payment);
        $monthName = $payment->month_name;
        $periodLabel = "{$monthName} {$payment->year}";
        $staffName = $staff->user->name;

        $this->createExpenseTransaction(
            accountId: $accountId,
            amount: $baseSalary,
            date: $paymentDate,
            paymentMethod: $paymentMethod,
            referenceNumber: $reference,
            description: "Salary payment for {$staffName} ({$periodLabel})",
            expenseCategoryId: $salaryCategory->id
        );

        $this->createExpenseTransaction(
            accountId: $accountId,
            amount: $employeePF,
            date: $paymentDate,
            paymentMethod: $paymentMethod,
            referenceNumber: $reference,
            description: "PF Deduction (Employee) for {$staffName} ({$periodLabel})",
            expenseCategoryId: $pfCategory->id
        );

        $this->createIncomeTransaction(
            accountId: $pfAccount->id,
            amount: $employeePF,
            date: $paymentDate,
            paymentMethod: $paymentMethod,
            referenceNumber: $reference,
            description: "PF Contribution (Employee) from {$staffName} ({$periodLabel})",
            incomeCategoryId: $pfIncomeCategory->id
        );

        $this->createIncomeTransaction(
            accountId: $pfAccount->id,
            amount: $employerPF,
            date: $paymentDate,
            paymentMethod: 'internal_transfer',
            referenceNumber: $reference,
            description: "PF Contribution (Employer) for {$staffName} ({$periodLabel})",
            incomeCategoryId: $pfIncomeCategory->id
        );
    }

    private function findSalaryPaymentTransactions(SalaryPayment $payment): Collection
    {
        $reference = $this->accountingReference($payment);
        $byReference = Transaction::where('reference_number', $reference)->get();
        if ($byReference->isNotEmpty()) {
            return $byReference;
        }

        if ($payment->reference_number) {
            $byUserReference = Transaction::where('reference_number', $payment->reference_number)
                ->whereDate('transaction_date', $payment->payment_date)
                ->get();
            if ($byUserReference->count() >= 4) {
                return $byUserReference;
            }
        }

        $payment->loadMissing('staff.user');
        $staffName = $payment->staff?->user?->name ?? '';
        if ($staffName === '') {
            return collect();
        }

        $monthYear = date('F Y', strtotime("{$payment->year}-{$payment->month}-01"));
        $monthName = $payment->month_name;

        return Transaction::where('description', 'like', "%{$staffName}%")
            ->where(function ($query) use ($monthYear, $monthName, $payment) {
                $query->where('description', 'like', "%{$monthYear}%")
                    ->orWhere('description', 'like', "%({$monthName} {$payment->year})%");
            })
            ->whereDate('transaction_date', $payment->payment_date)
            ->get();
    }

    private function reverseSalaryAccountingTransactions(SalaryPayment $payment): void
    {
        foreach ($this->findSalaryPaymentTransactions($payment) as $transaction) {
            $this->reverseAccountingTransaction($transaction->id);
        }
    }
}
