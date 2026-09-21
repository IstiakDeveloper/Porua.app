<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\FeeWaiver;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Transaction;
use App\Traits\CreatesAccountingTransactions;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeeCollectionController extends Controller
{
    use CreatesAccountingTransactions;

    /**
     * Display fee collections list
     */
    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $activeTab = $request->get('tab', 'paid');
        if (in_array($request->status, ['pending', 'overdue'], true)) {
            $activeTab = 'dues';
        }

        // Date range: support date_from/date_to or month+year (monthly filter)
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;
        if ($request->filled('month') && $request->filled('year')) {
            $dateFrom = Carbon::create($request->year, $request->month, 1)->format('Y-m-d');
            $dateTo = Carbon::create($request->year, $request->month, 1)->endOfMonth()->format('Y-m-d');
        }

        // Calculate statistics (system-wide and consistent)
        $statsQueryPaid = FeeCollection::where('status', 'paid')
            ->whereHas('student')
            ->when($request->fee_type_id, fn ($q, $id) => $q->where('fee_type_id', $id))
            ->when($dateFrom, fn ($q) => $q->whereDate('payment_date', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('payment_date', '<=', $dateTo));

        $statsQueryPending = FeeCollection::outstanding()
            ->whereHas('student')
            ->when($request->fee_type_id, fn ($q, $id) => $q->where('fee_type_id', $id));

        $todayCollected = FeeCollection::where('status', 'paid')
            ->whereHas('student')
            ->whereDate('payment_date', Carbon::today())
            ->sum('paid_amount');

        $todayReceiptsCount = FeeCollection::where('status', 'paid')
            ->whereHas('student')
            ->whereDate('payment_date', Carbon::today())
            ->distinct('receipt_number')
            ->count('receipt_number');

        $thisMonthCollected = FeeCollection::where('status', 'paid')
            ->whereHas('student')
            ->whereMonth('payment_date', Carbon::now()->month)
            ->whereYear('payment_date', Carbon::now()->year)
            ->sum('paid_amount');

        $stats = [
            'total_collected' => (float) (clone $statsQueryPaid)->sum('paid_amount'),
            'today_collected' => (float) $todayCollected,
            'today_receipts_count' => (int) $todayReceiptsCount,
            'this_month_collected' => (float) $thisMonthCollected,
            'pending_fees' => (float) (clone $statsQueryPending)->where('status', 'pending')->sum('total_amount'),
            'overdue_fees' => (float) (clone $statsQueryPending)->where('status', 'overdue')->sum('total_amount'),
            'pending_count' => (int) (clone $statsQueryPending)->where('status', 'pending')->count(),
            'overdue_count' => (int) (clone $statsQueryPending)->where('status', 'overdue')->count(),
        ];

        if ($activeTab === 'dues') {
            // UNPAID DUES TAB: Real student fee demands (pending / overdue)
            $duesQuery = FeeCollection::with([
                'student.user',
                'student.schoolClass',
                'student.section',
                'feeType',
            ])
                ->whereHas('student')
                ->outstanding()
                ->when($request->status && in_array($request->status, ['pending', 'overdue'], true), function ($q) use ($request) {
                    $q->where('status', $request->status);
                })
                ->when($request->fee_type_id, fn ($q, $id) => $q->where('fee_type_id', $id))
                ->when($request->class_id, fn ($q, $cid) => $q->whereHas('student', fn ($sq) => $sq->where('class_id', $cid)))
                ->when($request->section_id, fn ($q, $sid) => $q->whereHas('student', fn ($sq) => $sq->where('section_id', $sid)))
                ->when($request->search, function ($q, $search) {
                    $q->where(function ($sq) use ($search) {
                        $sq->whereHas('student.user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('student', fn ($s) => $s->where('admission_number', 'like', "%{$search}%")->orWhere('roll_number', 'like', "%{$search}%"));
                    });
                })
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->orderBy('id', 'desc');

            $collections = $duesQuery->paginate(20)->withQueryString()->through(function ($fee) {
                $period = ($fee->month && $fee->year)
                    ? Carbon::create($fee->year, $fee->month, 1)->format('M Y')
                    : 'One-time';

                return [
                    'id' => $fee->id,
                    'student_id' => $fee->student_id,
                    'student_name' => $fee->student->user->name ?? 'N/A',
                    'admission_number' => $fee->student->admission_number ?? 'N/A',
                    'roll_number' => $fee->student->roll_number ?? 'N/A',
                    'class_name' => $fee->student->schoolClass->name ?? 'N/A',
                    'section_name' => $fee->student->section->name ?? '',
                    'fee_type_name' => $fee->feeType->name ?? 'Fee',
                    'period' => $period,
                    'month' => $fee->month,
                    'year' => $fee->year,
                    'amount' => (float) $fee->amount,
                    'late_fee' => (float) $fee->late_fee,
                    'discount' => (float) $fee->discount,
                    'total_amount' => (float) $fee->total_amount,
                    'due_date' => $fee->due_date ? Carbon::parse($fee->due_date)->format('d M Y') : null,
                    'status' => $fee->status,
                ];
            });
        } else {
            // PAID MONEY RECEIPTS TAB: Clean cash-in receipts ledger
            $paidQuery = FeeCollection::with([
                'student.user',
                'student.schoolClass',
                'student.section',
                'feeType',
                'account',
                'collector',
            ])
                ->where('status', 'paid')
                ->whereNotNull('receipt_number')
                ->whereHas('student')
                ->when($request->fee_type_id, fn ($q, $id) => $q->where('fee_type_id', $id))
                ->when($dateFrom, fn ($q) => $q->whereDate('payment_date', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('payment_date', '<=', $dateTo))
                ->when($request->class_id, fn ($q, $cid) => $q->whereHas('student', fn ($sq) => $sq->where('class_id', $cid)))
                ->when($request->section_id, fn ($q, $sid) => $q->whereHas('student', fn ($sq) => $sq->where('section_id', $sid)))
                ->when($request->search, function ($q, $search) {
                    $q->where(function ($sq) use ($search) {
                        $sq->whereHas('student.user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('student', fn ($s) => $s->where('admission_number', 'like', "%{$search}%")->orWhere('roll_number', 'like', "%{$search}%"))
                            ->orWhere('receipt_number', 'like', "%{$search}%");
                    });
                })
                ->latest('payment_date')
                ->latest('id')
                ->get();

            $groupedReceipts = $paidQuery->groupBy('receipt_number')->map(function ($group) {
                $first = $group->first();
                $itemsCount = $group->count();

                $feeNames = $group->map(function ($f) {
                    $period = ($f->month && $f->year) ? Carbon::create($f->year, $f->month, 1)->format('M y') : null;
                    return ($f->feeType->name ?? 'Fee') . ($period ? " ($period)" : '');
                })->unique()->join(', ');

                return [
                    'id' => $first->id,
                    'receipt_number' => $first->receipt_number,
                    'student_name' => $first->student->user->name ?? 'N/A',
                    'admission_number' => $first->student->admission_number ?? 'N/A',
                    'roll_number' => $first->student->roll_number ?? 'N/A',
                    'class_name' => $first->student->schoolClass->name ?? 'N/A',
                    'section_name' => $first->student->section->name ?? '',
                    'fee_items_summary' => $feeNames,
                    'items_count' => $itemsCount,
                    'amount' => (float) $group->sum('amount'),
                    'late_fee' => (float) $group->sum('late_fee'),
                    'discount' => (float) $group->sum('discount'),
                    'paid_amount' => (float) $group->sum('paid_amount'),
                    'payment_date' => $first->payment_date ? Carbon::parse($first->payment_date)->format('d M Y') : 'N/A',
                    'payment_method' => $first->payment_method ?? 'cash',
                    'account_name' => $first->account->account_name ?? 'Cash Account',
                    'collector_name' => $first->collector->name ?? 'Cashier',
                    'status' => 'paid',
                ];
            })->values();

            $page = (int) $request->get('page', 1);
            $perPage = 20;
            $total = $groupedReceipts->count();
            $collections = new \Illuminate\Pagination\LengthAwarePaginator(
                $groupedReceipts->slice(($page - 1) * $perPage, $perPage)->values(),
                $total,
                $perPage,
                $page,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        }

        return Inertia::render('Fees/Collections/Index', [
            'collections' => $collections,
            'students' => Student::with(['user', 'schoolClass'])
                ->where('status', 'active')
                ->get(),
            'accounts' => $this->getActiveAccounts(),
            'defaultAccountId' => $this->getDefaultFeeAccountId(),
            'classes' => \App\Models\SchoolClass::where('status', 'active')
                ->orderBy('order')
                ->get(['id', 'name']),
            'sections' => \App\Models\Section::with('schoolClass:id,name')
                ->where('status', 'active')
                ->get(['id', 'name', 'class_id']),
            'feeTypes' => FeeType::active()->orderBy('name')->get(['id', 'name']),
            'activeTab' => $activeTab,
            'stats' => $stats,
            'filters' => array_merge($request->only([
                'status', 'search', 'class_id', 'section_id',
                'fee_type_id', 'date_from', 'date_to', 'month', 'year',
            ]), ['tab' => $activeTab]),
        ]);
    }

    /**
     * Display the modern POS-style fee collection counter
     */
    public function create(Request $request)
    {
        $this->authorize('manage_fees');

        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $students = Student::with(['user:id,name', 'schoolClass:id,name', 'section:id,name'])
            ->where('status', 'active')
            ->orderBy('admission_number')
            ->get([
                'id',
                'user_id',
                'class_id',
                'section_id',
                'admission_number',
                'roll_number',
                'father_name',
                'phone',
                'guardian_phone',
                'photo',
                'monthly_fee',
            ])
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->user->name ?? '',
                    'admission_number' => $s->admission_number ?? '',
                    'roll_number' => $s->roll_number ?? '',
                    'class_id' => $s->class_id,
                    'section_id' => $s->section_id,
                    'class_name' => $s->schoolClass->name ?? '',
                    'section_name' => $s->section->name ?? '',
                    'phone' => $s->phone ?? $s->guardian_phone ?? '',
                    'father_name' => $s->father_name ?? '',
                    'photo' => $s->photo ? asset('storage/'.$s->photo) : null,
                    'monthly_fee' => $s->monthly_fee ? (float) $s->monthly_fee : null,
                ];
            });

        $classes = SchoolClass::where('status', 'active')
            ->orderBy('order')
            ->get(['id', 'name']);

        $sections = Section::where('status', 'active')
            ->get(['id', 'name', 'class_id']);

        $accounts = $this->getActiveAccounts();
        $defaultAccountId = $this->getDefaultFeeAccountId();

        return Inertia::render('Fees/Collections/Create', [
            'students' => $students,
            'classes' => $classes,
            'sections' => $sections,
            'accounts' => $accounts,
            'defaultAccountId' => $defaultAccountId,
            'preselectedStudentId' => $request->query('student_id') ? (int) $request->query('student_id') : null,
            'preselectedMonth' => $request->query('month') ? (int) $request->query('month') : null,
            'preselectedFeeId' => $request->query('fee_id') ? (int) $request->query('fee_id') : null,
        ]);
    }

    /**
     * Display student fees page (alias to create)
     */
    public function studentFeesPage(Request $request)
    {
        return $this->create($request);
    }

    /**
     * Store fee collection (supports both new and old formats)
     */
    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        // Check if it's paying pending fees or creating new fees
        $hasPendingFees = ($request->has('pending_fees') && count($request->pending_fees) > 0)
            || ($request->has('fee_collection_ids') && count($request->fee_collection_ids) > 0);
        $hasNewFees = $request->has('fee_structures') && count($request->fee_structures) > 0;

        if (! $hasPendingFees && ! $hasNewFees) {
            return redirect()->back()
                ->with('error', 'Please select at least one fee to collect');
        }

        // Validate common fields
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'pending_fees' => 'nullable|array',
            'pending_fees.*.id' => 'required|exists:fee_collections,id',
            'pending_fees.*.discount' => 'nullable|numeric|min:0',
            'fee_collection_ids' => 'nullable|array',
            'fee_collection_ids.*' => 'nullable|exists:fee_collections,id',
            'fee_structures' => 'nullable|array',
            'fee_structures.*.fee_structure_id' => 'nullable|exists:fee_structures,id',
            'fee_structures.*.month' => 'nullable|integer|min:1|max:12',
            'fee_structures.*.year' => 'nullable|integer|min:2020|max:2100',
            'fee_structures.*.discount' => 'nullable|numeric|min:0',
            'account_id' => 'required|exists:accounts,id',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,mobile_banking,online',
            'payment_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $student = Student::with('user')->findOrFail($validated['student_id']);
            $globalDiscount = floatval($validated['discount'] ?? 0);
            $usesPerFeeDiscounts = ! empty($validated['pending_fees'])
                || collect($validated['fee_structures'] ?? [])->contains(fn ($fee) => array_key_exists('discount', $fee));

            // One voucher per payment: 4-digit running number after the last RCP receipt
            $receiptNumber = FeeCollection::nextPaidReceiptNumber();

            $totalAmount = 0;
            $feeDescriptions = [];
            $feeCount = 0;

            // Process pending/overdue fees first
            if ($hasPendingFees) {
                $pendingFeesInput = ! empty($validated['pending_fees'])
                    ? $validated['pending_fees']
                    : array_map(
                        fn ($feeId) => ['id' => $feeId, 'discount' => 0],
                        $validated['fee_collection_ids']
                    );

                $pendingFeeCount = count($pendingFeesInput);
                $pendingDiscountPool = $usesPerFeeDiscounts
                    ? 0
                    : $globalDiscount * ($pendingFeeCount / ($pendingFeeCount + ($hasNewFees ? count($validated['fee_structures']) : 0)));

                foreach ($pendingFeesInput as $pendingFeeInput) {
                    $feeId = $pendingFeeInput['id'];
                    $fee = FeeCollection::with(['student.user', 'feeType'])
                        ->findOrFail($feeId);

                    if ($fee->status === 'paid') {
                        throw new \Exception("Fee {$fee->feeType->name} has already been paid.");
                    }

                    $feeDiscount = $usesPerFeeDiscounts
                        ? floatval($pendingFeeInput['discount'] ?? 0)
                        : ($pendingFeeCount > 0 ? $pendingDiscountPool / $pendingFeeCount : 0);

                    $grossAmount = $fee->amount + $fee->late_fee;
                    if ($feeDiscount > $grossAmount) {
                        throw new \Exception("Discount cannot exceed fee amount for {$fee->feeType->name}.");
                    }

                    $paidAmount = $grossAmount - $feeDiscount;
                    $totalAmount += $paidAmount;
                    $feeCount++;

                    // Update fee collection - SAME receipt number for all
                    $fee->update([
                        'receipt_number' => $receiptNumber,
                        'account_id' => $validated['account_id'],
                        'discount' => $feeDiscount,
                        'total_amount' => $paidAmount,
                        'paid_amount' => $paidAmount,
                        'payment_date' => $validated['payment_date'],
                        'payment_method' => $validated['payment_method'],
                        'status' => 'paid',
                        'remarks' => $validated['remarks'] ?? null,
                        'collected_by' => auth()->id(),
                    ]);

                    FeeCollection::cancelUnpaidDuplicatesForPeriod(
                        $fee->student_id,
                        $fee->fee_type_id,
                        $fee->month,
                        $fee->year,
                        $fee->id
                    );

                    $monthName = ($fee->year && $fee->month)
                        ? Carbon::create($fee->year, $fee->month, 1)->format('M Y')
                        : null;
                    $feeDescriptions[] = $monthName
                        ? $fee->feeType->name.' ('.$monthName.')'
                        : $fee->feeType->name;
                }
            }

            // Process new fees
            if ($hasNewFees) {
                $newFeeCount = count($validated['fee_structures']);
                $newDiscountPool = $usesPerFeeDiscounts
                    ? 0
                    : $globalDiscount * ($newFeeCount / (($hasPendingFees ? count($validated['pending_fees'] ?? $validated['fee_collection_ids'] ?? []) : 0) + $newFeeCount));

                foreach ($validated['fee_structures'] as $feeData) {
                    $feeStructure = FeeStructure::with(['feeType', 'academicYear'])
                        ->findOrFail($feeData['fee_structure_id']);

                    $month = intval($feeData['month']);
                    $year = intval($feeData['year']);

                    $feeAmount = floatval($feeStructure->amount);
                    $feeDiscount = $usesPerFeeDiscounts
                        ? floatval($feeData['discount'] ?? 0)
                        : ($newFeeCount > 0 ? $newDiscountPool / $newFeeCount : 0);

                    if ($feeDiscount > $feeAmount) {
                        $monthName = Carbon::create($year, $month, 1)->format('F Y');
                        throw new \Exception("Discount cannot exceed fee amount for '{$feeStructure->feeType->name}' ({$monthName}).");
                    }

                    $paidAmount = $feeAmount - $feeDiscount;
                    $totalAmount += $paidAmount;
                    $feeCount++;

                    $this->settleAdvanceFee(
                        studentId: (int) $validated['student_id'],
                        feeStructure: $feeStructure,
                        month: $month,
                        year: $year,
                        receiptNumber: $receiptNumber,
                        validated: $validated,
                        feeDiscount: $feeDiscount
                    );

                    $monthName = Carbon::create($year, $month, 1)->format('M Y');
                    $feeDescriptions[] = $feeStructure->feeType->name.' ('.$monthName.')';
                }
            }

            // Create accounting transactions - ONE FOR EACH FEE TYPE
            if ($totalAmount > 0) {
                // Group fees by type to create separate transactions
                $feesByType = [];
                $allProcessedFees = [];

                // Collect all processed fees
                if ($hasPendingFees) {
                    $processedPendingIds = ! empty($validated['pending_fees'])
                        ? collect($validated['pending_fees'])->pluck('id')
                        : collect($validated['fee_collection_ids'] ?? []);

                    foreach ($processedPendingIds as $feeId) {
                        $fee = FeeCollection::with(['feeType'])->find($feeId);
                        if ($fee) {
                            $allProcessedFees[] = [
                                'fee_type_id' => $fee->fee_type_id,
                                'fee_type_name' => $fee->feeType->name,
                                'amount' => $fee->paid_amount,
                                'month' => $fee->month,
                                'year' => $fee->year,
                            ];
                        }
                    }
                }

                if ($hasNewFees) {
                    // Retrieve newly created fees by receipt number
                    $newFees = FeeCollection::with(['feeType'])
                        ->where('receipt_number', $receiptNumber)
                        ->whereIn('status', ['paid'])
                        ->get();

                    foreach ($newFees as $fee) {
                        // Skip if already added from pending fees
                        $alreadyAdded = false;
                        foreach ($allProcessedFees as $processed) {
                            if ($processed['fee_type_id'] === $fee->fee_type_id &&
                                $processed['month'] === $fee->month &&
                                $processed['year'] === $fee->year) {
                                $alreadyAdded = true;
                                break;
                            }
                        }

                        if (! $alreadyAdded) {
                            $allProcessedFees[] = [
                                'fee_type_id' => $fee->fee_type_id,
                                'fee_type_name' => $fee->feeType->name,
                                'amount' => $fee->paid_amount,
                                'month' => $fee->month,
                                'year' => $fee->year,
                            ];
                        }
                    }
                }

                // Group by fee type
                foreach ($allProcessedFees as $feeData) {
                    $feeTypeKey = $feeData['fee_type_id'];
                    if (! isset($feesByType[$feeTypeKey])) {
                        $feesByType[$feeTypeKey] = [
                            'fee_type_id' => $feeData['fee_type_id'],
                            'fee_type_name' => $feeData['fee_type_name'],
                            'amount' => 0,
                            'descriptions' => [],
                        ];
                    }
                    $feesByType[$feeTypeKey]['amount'] += $feeData['amount'];
                    $monthName = Carbon::create($feeData['year'], $feeData['month'], 1)->format('M Y');
                    $feesByType[$feeTypeKey]['descriptions'][] = $monthName;
                }

                // Create separate transaction for each fee type
                foreach ($feesByType as $feeTypeData) {
                    $description = "{$feeTypeData['fee_type_name']} from {$student->user->name} - ".implode(', ', $feeTypeData['descriptions']);
                    if (! empty($validated['remarks'])) {
                        $description .= " | {$validated['remarks']}";
                    }

                    $this->createFeeIncomeTransactionByType(
                        accountId: $validated['account_id'],
                        feeTypeId: $feeTypeData['fee_type_id'],
                        feeTypeName: $feeTypeData['fee_type_name'],
                        amount: $feeTypeData['amount'],
                        date: $validated['payment_date'],
                        paymentMethod: $validated['payment_method'],
                        referenceNumber: $receiptNumber,
                        description: $description
                    );
                }

                // Update account balance ONCE with total amount
                Account::find($validated['account_id'])->increment('current_balance', $totalAmount);
            }

            DB::commit();

            logActivity(
                'create',
                "Collected {$feeCount} fees from {$student->user->name} (Receipt: {$receiptNumber})",
                FeeCollection::class
            );

            $firstFee = FeeCollection::where('receipt_number', $receiptNumber)->first();

            if ($request->boolean('redirect_to_receipt', true) && $firstFee) {
                return redirect()->route('fee-collections.receipt', $firstFee->id)
                    ->with('success', "Fees collected successfully! Receipt: {$receiptNumber} ({$feeCount} items)");
            }

            return redirect()->back()
                ->with('success', "Fees collected successfully! Receipt: {$receiptNumber} ({$feeCount} months)");

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to collect fees: '.$e->getMessage());
        }
    }

    /**
     * Show form to edit a paid receipt (all rows sharing the same receipt_number).
     */
    public function edit(FeeCollection $feeCollection)
    {
        $this->authorize('manage_fees');

        $feeCollection->load(['student.user', 'student.schoolClass']);

        $related = FeeCollection::with(['feeType'])
            ->where('receipt_number', $feeCollection->receipt_number)
            ->orderBy('year')
            ->orderBy('month')
            ->orderBy('fee_type_id')
            ->get();

        if ($related->contains(fn ($r) => $r->status !== 'paid')) {
            return redirect()->route('fee-collections.index')
                ->with('error', 'Only paid receipts can be edited.');
        }

        $first = $related->first();
        $lines = $related->map(fn ($r) => [
            'id' => $r->id,
            'fee_type' => ['name' => $r->feeType->name ?? 'N/A'],
            'month' => $r->month,
            'year' => $r->year,
            'amount' => (float) $r->amount,
            'late_fee' => (float) $r->late_fee,
            'discount' => (float) $r->discount,
        ]);

        return Inertia::render('Fees/Collections/Edit', [
            'receipt_number' => $feeCollection->receipt_number,
            'student' => [
                'user' => ['name' => $feeCollection->student->user->name ?? 'N/A'],
                'admission_number' => $feeCollection->student->admission_number ?? 'N/A',
                'school_class' => ['name' => $feeCollection->student->schoolClass->name ?? 'N/A'],
            ],
            'payment_date' => $first->payment_date->format('Y-m-d'),
            'payment_method' => $first->payment_method,
            'account_id' => $first->account_id,
            'remarks' => $first->remarks ?? '',
            'lines' => $lines,
            'accounts' => Account::where('status', 'active')
                ->get(['id', 'account_name', 'current_balance']),
            'fee_collection_id' => $feeCollection->id,
        ]);
    }

    /**
     * Update a paid receipt and sync accounting (reverse old income txs by reference, recreate).
     */
    public function update(Request $request, FeeCollection $feeCollection)
    {
        $this->authorize('manage_fees');

        $receiptNumber = $feeCollection->receipt_number;

        $related = FeeCollection::with(['student.user', 'feeType'])
            ->where('receipt_number', $receiptNumber)
            ->get();

        if ($related->isEmpty()) {
            return redirect()->route('fee-collections.index')
                ->with('error', 'Receipt not found.');
        }

        if ($related->contains(fn ($r) => $r->status !== 'paid')) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Only paid receipts can be edited.');
        }

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,mobile_banking,online',
            'payment_date' => 'required|date',
            'remarks' => 'nullable|string|max:500',
            'lines' => 'required|array|min:1',
            'lines.*.id' => 'required|exists:fee_collections,id',
            'lines.*.amount' => 'required|numeric|min:0',
            'lines.*.late_fee' => 'nullable|numeric|min:0',
            'lines.*.discount' => 'nullable|numeric|min:0',
        ]);

        $lineIds = collect($validated['lines'])->pluck('id')->sort()->values();
        $existingIds = $related->pluck('id')->sort()->values();
        if ($lineIds->count() !== $existingIds->count() || $lineIds->diff($existingIds)->isNotEmpty()) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Line items must match this receipt exactly.');
        }

        DB::beginTransaction();
        try {
            $student = $related->first()->student;

            $oldTransactions = Transaction::where('reference_number', $receiptNumber)
                ->where('type', 'income')
                ->get();

            foreach ($oldTransactions as $trx) {
                $this->reverseAccountingTransaction($trx->id);
            }

            $totalAmount = 0;
            $allProcessedFees = [];

            foreach ($validated['lines'] as $line) {
                $fee = $related->firstWhere('id', $line['id']);
                if (! $fee || $fee->receipt_number !== $receiptNumber) {
                    throw new \Exception('Invalid fee line for this receipt.');
                }

                $amount = floatval($line['amount']);
                $lateFee = floatval($line['late_fee'] ?? 0);
                $discount = floatval($line['discount'] ?? 0);
                $paidAmount = $amount + $lateFee - $discount;

                if ($paidAmount < 0) {
                    throw new \Exception('Discount cannot exceed amount plus late fee.');
                }

                $fee->update([
                    'account_id' => $validated['account_id'],
                    'amount' => $amount,
                    'late_fee' => $lateFee,
                    'discount' => $discount,
                    'total_amount' => $paidAmount,
                    'paid_amount' => $paidAmount,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'remarks' => $validated['remarks'] ?? null,
                ]);

                $totalAmount += $paidAmount;
                $allProcessedFees[] = [
                    'fee_type_id' => $fee->fee_type_id,
                    'fee_type_name' => $fee->feeType->name,
                    'amount' => $paidAmount,
                    'month' => $fee->month,
                    'year' => $fee->year,
                ];
            }

            if ($totalAmount > 0) {
                $feesByType = [];
                foreach ($allProcessedFees as $feeData) {
                    $feeTypeKey = $feeData['fee_type_id'];
                    if (! isset($feesByType[$feeTypeKey])) {
                        $feesByType[$feeTypeKey] = [
                            'fee_type_id' => $feeData['fee_type_id'],
                            'fee_type_name' => $feeData['fee_type_name'],
                            'amount' => 0,
                            'descriptions' => [],
                        ];
                    }
                    $feesByType[$feeTypeKey]['amount'] += $feeData['amount'];
                    $monthName = Carbon::create($feeData['year'], $feeData['month'], 1)->format('M Y');
                    $feesByType[$feeTypeKey]['descriptions'][] = $monthName;
                }

                foreach ($feesByType as $feeTypeData) {
                    $description = "{$feeTypeData['fee_type_name']} from {$student->user->name} - ".implode(', ', $feeTypeData['descriptions']);
                    if (! empty($validated['remarks'])) {
                        $description .= " | {$validated['remarks']}";
                    }

                    $this->createFeeIncomeTransactionByType(
                        accountId: (int) $validated['account_id'],
                        feeTypeId: $feeTypeData['fee_type_id'],
                        feeTypeName: $feeTypeData['fee_type_name'],
                        amount: $feeTypeData['amount'],
                        date: $validated['payment_date'],
                        paymentMethod: $validated['payment_method'],
                        referenceNumber: $receiptNumber,
                        description: $description
                    );
                }

                Account::find($validated['account_id'])->increment('current_balance', $totalAmount);
            }

            DB::commit();

            logActivity(
                'update',
                "Updated fee receipt {$receiptNumber} for {$student->user->name}",
                FeeCollection::class
            );

            return redirect()->route('fee-collections.index')
                ->with('success', "Receipt {$receiptNumber} updated successfully.");

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update receipt: '.$e->getMessage());
        }
    }

    /**
     * Display fee collection receipt
     */
    public function receipt(FeeCollection $feeCollection)
    {
        $this->authorize('manage_fees');

        $feeCollection->load([
            'student.user',
            'student.schoolClass',
            'student.section',
            'feeType',
            'academicYear',
            'collector',
            'batch.course',
        ]);

        // Get all collections with same receipt number
        $relatedCollections = FeeCollection::with(['feeType', 'batch.course'])
            ->where('receipt_number', $feeCollection->receipt_number)
            ->get();

        return Inertia::render('Fees/Collections/Receipt', [
            'collection' => $feeCollection,
            'relatedCollections' => $relatedCollections,
            'totalAmount' => $relatedCollections->sum('total_amount'),
        ]);
    }

    /**
     * Delete fee collection
     */
    public function destroy(FeeCollection $feeCollection)
    {
        $this->authorize('manage_fees');

        DB::beginTransaction();
        try {
            $receiptNumber = $feeCollection->receipt_number;

            // Delete all collections with same receipt number
            $collections = FeeCollection::where('receipt_number', $receiptNumber)->get();

            foreach ($collections as $collection) {
                // Reverse accounting transaction if exists
                if ($collection->accounting_transaction_id) {
                    $this->reverseAccountingTransaction($collection->accounting_transaction_id);
                }
                $collection->delete();
            }

            DB::commit();

            logActivity(
                'delete',
                "Deleted fee collection(s) with receipt: {$receiptNumber}",
                FeeCollection::class
            );

            return redirect()->route('fee-collections.index')
                ->with('success', 'Fee collection deleted and accounting reversed successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to delete fee collection: '.$e->getMessage());
        }
    }

    /**
     * Get fee structures by class (API endpoint)
     */
    public function getFeesByClass(Request $request)
    {
        $classId = $request->query('class_id');

        if (! $classId) {
            return response()->json([]);
        }

        $feeStructures = FeeStructure::with(['feeType', 'academicYear'])
            ->where('class_id', $classId)
            ->whereHas('academicYear', function ($q) {
                $q->where('status', 'active');
            })
            ->get()
            ->map(function ($structure) {
                return [
                    'id' => $structure->id,
                    'fee_type' => [
                        'id' => $structure->feeType->id,
                        'name' => $structure->feeType->name,
                        'frequency' => $structure->feeType->frequency,
                    ],
                    'academic_year' => [
                        'id' => $structure->academicYear->id,
                        'year' => $structure->academicYear->year,
                    ],
                    'amount' => $structure->amount,
                    'due_date' => $structure->due_date,
                    'status' => $structure->status,
                ];
            });

        return response()->json($feeStructures);
    }

    /**
     * Get student pending/overdue fees and advance collection details (API endpoint)
     */
    public function getStudentDues(Request $request)
    {
        $studentId = $request->query('student_id');

        if (! $studentId) {
            return response()->json([
                'student' => null,
                'dues' => [],
                'advance_months' => [],
                'fee_structures' => [],
                'active_waivers' => [],
                'recent_receipts' => [],
                'next_month' => (int) date('n'),
                'next_year' => (int) date('Y'),
            ]);
        }

        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $student = Student::with(['user:id,name', 'schoolClass:id,name', 'section:id,name'])
            ->find($studentId);

        if (! $student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        // Get student pending/overdue/partial dues
        $dues = FeeCollection::with(['feeType'])
            ->where('student_id', $studentId)
            ->outstanding()
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($fee) {
                $monthName = ($fee->month && $fee->year)
                    ? Carbon::create($fee->year, $fee->month, 1)->format('F Y')
                    : 'N/A';

                return [
                    'id' => $fee->id,
                    'fee_type_id' => $fee->fee_type_id,
                    'fee_type' => $fee->feeType->name ?? 'Fee',
                    'month' => $fee->month,
                    'year' => $fee->year,
                    'month_name' => $monthName,
                    'amount' => (float) $fee->amount,
                    'late_fee' => (float) $fee->late_fee,
                    'discount' => (float) $fee->discount,
                    'total_amount' => (float) $fee->total_amount,
                    'paid_amount' => (float) $fee->paid_amount,
                    'status' => $fee->status,
                    'due_date' => $fee->payment_date ? Carbon::parse($fee->payment_date)->format('Y-m-d') : null,
                ];
            });

        // Find latest recorded month (either paid or pending) so advance months come next
        $latestRecord = FeeCollection::where('student_id', $studentId)
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('month')
            ->whereNotNull('year')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();

        $currentM = (int) date('n');
        $currentY = (int) date('Y');

        if ($latestRecord) {
            $nextMonth = $latestRecord->month + 1;
            $nextYear = $latestRecord->year;
            if ($nextMonth > 12) {
                $nextMonth = 1;
                $nextYear++;
            }
        } else {
            $nextMonth = $currentM;
            $nextYear = $currentY;
        }

        // Find class fee structures
        $feeStructures = FeeStructure::with('feeType')
            ->where('class_id', $student->class_id)
            ->get()
            ->map(function ($fs) use ($student) {
                $isMonthly = ($fs->feeType->frequency ?? '') === 'monthly';
                $amount = ($isMonthly && $student->monthly_fee)
                    ? (float) $student->monthly_fee
                    : (float) $fs->amount;

                return [
                    'id' => $fs->id,
                    'fee_type_id' => $fs->fee_type_id,
                    'fee_type_name' => $fs->feeType->name ?? 'Fee',
                    'frequency' => $fs->feeType->frequency ?? 'one_time',
                    'amount' => $amount,
                ];
            });

        $monthlyStructure = $feeStructures->first(fn ($fs) => $fs['frequency'] === 'monthly')
            ?? $feeStructures->first();

        // Generate next 6 advance months
        $advanceMonths = [];
        $tMonth = $nextMonth;
        $tYear = $nextYear;
        for ($i = 0; $i < 6; $i++) {
            $dateObj = Carbon::create($tYear, $tMonth, 1);
            $advanceMonths[] = [
                'month' => $tMonth,
                'year' => $tYear,
                'label' => $dateObj->format('M Y'),
                'full_label' => $dateObj->format('F Y'),
                'fee_structure_id' => $monthlyStructure['id'] ?? null,
                'fee_type_name' => $monthlyStructure['fee_type_name'] ?? 'Tuition Fee',
                'amount' => $monthlyStructure['amount'] ?? 0,
            ];

            $tMonth++;
            if ($tMonth > 12) {
                $tMonth = 1;
                $tYear++;
            }
        }

        // Active waivers for this student
        $activeWaivers = FeeWaiver::where('student_id', $studentId)
            ->active()
            ->with('feeType')
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'fee_type_id' => $w->fee_type_id,
                'fee_type_name' => $w->feeType->name ?? 'All Fees',
                'waiver_type' => $w->waiver_type,
                'waiver_value' => (float) $w->waiver_value,
                'reason' => $w->reason,
            ]);

        // Recent paid receipts (last 5 receipts)
        $recentReceipts = FeeCollection::with('feeType')
            ->where('student_id', $studentId)
            ->where('status', 'paid')
            ->latest('payment_date')
            ->latest('id')
            ->get()
            ->groupBy('receipt_number')
            ->take(5)
            ->map(function ($group) {
                $first = $group->first();

                return [
                    'id' => $first->id,
                    'receipt_number' => $first->receipt_number,
                    'payment_date' => $first->payment_date ? Carbon::parse($first->payment_date)->format('d M Y') : 'N/A',
                    'payment_method' => ucfirst(str_replace('_', ' ', $first->payment_method ?? 'cash')),
                    'total_paid' => (float) $group->sum('paid_amount'),
                    'items_count' => $group->count(),
                    'fee_names' => $group->map(fn ($f) => $f->feeType->name ?? 'Fee')->unique()->join(', '),
                ];
            })
            ->values();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->user->name ?? '',
                'admission_number' => $student->admission_number ?? '',
                'roll_number' => $student->roll_number ?? '',
                'class_name' => $student->schoolClass->name ?? '',
                'section_name' => $student->section->name ?? '',
                'phone' => $student->phone ?? $student->guardian_phone ?? '',
                'father_name' => $student->father_name ?? '',
                'photo' => $student->photo ? asset('storage/'.$student->photo) : null,
                'monthly_fee' => $student->monthly_fee ? (float) $student->monthly_fee : null,
            ],
            'dues' => $dues,
            'advance_months' => $advanceMonths,
            'fee_structures' => $feeStructures,
            'active_waivers' => $activeWaivers,
            'recent_receipts' => $recentReceipts,
            'next_month' => $nextMonth,
            'next_year' => $nextYear,
        ]);
    }

    /**
     * Calculate total overdue fees
     */
    private function calculateOverdueFees(): float
    {
        $today = Carbon::today();
        $totalOverdue = 0;

        // Get all active fee structures that are overdue
        $overdueFeeStructures = FeeStructure::where('due_date', '<', $today)
            ->whereHas('academicYear', function ($q) {
                $q->where('status', 'active');
            })
            ->get();

        foreach ($overdueFeeStructures as $feeStructure) {
            // Get students in this class
            $students = Student::where('class_id', $feeStructure->class_id)
                ->where('status', 'active')
                ->get();

            foreach ($students as $student) {
                // Calculate month and year from due date
                $dueDate = Carbon::parse($feeStructure->due_date);

                // Check if not paid
                $paid = FeeCollection::where('student_id', $student->id)
                    ->where('fee_type_id', $feeStructure->fee_type_id)
                    ->where('month', $dueDate->month)
                    ->where('year', $dueDate->year)
                    ->where('status', 'paid')
                    ->exists();

                if (! $paid) {
                    $totalOverdue += floatval($feeStructure->amount);
                }
            }
        }

        return $totalOverdue;
    }

    private function getActiveAccounts()
    {
        return Account::where('status', 'active')
            ->orderBy('id')
            ->get(['id', 'account_name', 'current_balance']);
    }

    private function getDefaultFeeAccountId(): ?int
    {
        $accounts = $this->getActiveAccounts();

        $primeBank = $accounts->first(fn ($account) => stripos($account->account_name, 'prime') !== false);
        if ($primeBank) {
            return $primeBank->id;
        }

        return $accounts->get(1)?->id ?? $accounts->first()?->id;
    }

    /**
     * Settle advance/new fee: update existing unpaid row or create paid record.
     */
    private function settleAdvanceFee(
        int $studentId,
        FeeStructure $feeStructure,
        int $month,
        int $year,
        string $receiptNumber,
        array $validated,
        float $feeDiscount
    ): FeeCollection {
        if (FeeCollection::paidExistsForPeriod($studentId, $feeStructure->fee_type_id, $month, $year)) {
            $monthName = Carbon::create($year, $month, 1)->format('F Y');
            throw new \Exception("Fee '{$feeStructure->feeType->name}' for {$monthName} has already been paid.");
        }

        $feeAmount = floatval($feeStructure->amount);
        if ($feeDiscount > $feeAmount) {
            $monthName = Carbon::create($year, $month, 1)->format('F Y');
            throw new \Exception("Discount cannot exceed fee amount for '{$feeStructure->feeType->name}' ({$monthName}).");
        }

        $paidAmount = $feeAmount - $feeDiscount;

        $payload = [
            'receipt_number' => $receiptNumber,
            'account_id' => $validated['account_id'],
            'amount' => $feeAmount,
            'late_fee' => 0,
            'discount' => $feeDiscount,
            'total_amount' => $paidAmount,
            'paid_amount' => $paidAmount,
            'payment_date' => $validated['payment_date'],
            'payment_method' => $validated['payment_method'],
            'status' => 'paid',
            'remarks' => $validated['remarks'] ?? null,
            'collected_by' => auth()->id(),
        ];

        $existingUnpaid = FeeCollection::findUnpaidForPeriod(
            $studentId,
            $feeStructure->fee_type_id,
            $month,
            $year
        );

        if ($existingUnpaid) {
            $existingUnpaid->update($payload);
            FeeCollection::cancelUnpaidDuplicatesForPeriod(
                $studentId,
                $feeStructure->fee_type_id,
                $month,
                $year,
                $existingUnpaid->id
            );

            return $existingUnpaid->fresh();
        }

        return FeeCollection::create([
            ...$payload,
            'student_id' => $studentId,
            'fee_type_id' => $feeStructure->fee_type_id,
            'academic_year_id' => $feeStructure->academic_year_id,
            'month' => $month,
            'year' => $year,
        ]);
    }
}
