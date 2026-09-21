<?php

namespace App\Http\Middleware;

use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\Student;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AutoGenerateMonthlyFees
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Run fee generation in background (non-blocking)
        // Check only once per hour to avoid multiple calls
        $cacheKey = 'fee_generation_check_' . now()->format('Y-m-d-H');

        if (!Cache::has($cacheKey)) {
            Cache::put($cacheKey, true, now()->addHour());

            try {
                $this->generateMonthlyFees();
                $this->updateOverdueFees();
            } catch (\Exception $e) {
                Log::error('Auto fee generation failed: ' . $e->getMessage());
            }
        }

        return $next($request);
    }

    /**
     * Generate monthly fees for all active students
     */
    private function generateMonthlyFees(): void
    {
        $academicYear = AcademicYear::where('is_current', true)->first();

        if (!$academicYear) {
            return;
        }

        FeeCollection::cancelAllUnpaidPeriodDuplicates();

        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Check if within academic year period
        if (now()->lt($academicYear->start_date) || now()->gt($academicYear->end_date)) {
            return;
        }

        // Get all active students
        $students = Student::where('status', 'active')
            ->where('academic_year_id', $academicYear->id)
            ->get();

        foreach ($students as $student) {
            // Get monthly fee structures for student's class
            $feeStructures = FeeStructure::with('feeType')
                ->where('class_id', $student->class_id)
                ->where('academic_year_id', $academicYear->id)
                ->whereHas('feeType', function ($q) {
                    $q->where('frequency', 'monthly');
                })
                ->get();

            foreach ($feeStructures as $feeStructure) {
                $dueDate = $feeStructure->due_date ?? Carbon::create($currentYear, $currentMonth, 10);

                FeeCollection::createPendingIfAbsent([
                    'receipt_number' => 'FEE-' . date('Ymd') . '-' . str_pad(
                        FeeCollection::whereDate('created_at', today())->count() + 1,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
                    'student_id' => $student->id,
                    'fee_type_id' => $feeStructure->fee_type_id,
                    'academic_year_id' => $academicYear->id,
                    'month' => $currentMonth,
                    'year' => $currentYear,
                    'amount' => $feeStructure->amount,
                    'late_fee' => 0,
                    'discount' => 0,
                    'total_amount' => $feeStructure->amount,
                    'paid_amount' => 0,
                    'payment_date' => $dueDate,
                    'status' => 'pending',
                    'remarks' => 'Auto-generated monthly fee',
                    'collected_by' => 1,
                ]);
            }
        }
    }

    /**
     * Update overdue fees and calculate late fees
     */
    private function updateOverdueFees(): void
    {
        $today = Carbon::today();

        // Get all pending fees
        $pendingFees = FeeCollection::with(['feeType', 'student.schoolClass'])
            ->where('status', 'pending')
            ->get();

        foreach ($pendingFees as $fee) {
            try {
                if (FeeCollection::paidExistsForPeriod(
                    (int) $fee->student_id,
                    (int) $fee->fee_type_id,
                    (int) $fee->month,
                    (int) $fee->year
                )) {
                    FeeCollection::cancelUnpaidDuplicatesForPeriod(
                        (int) $fee->student_id,
                        (int) $fee->fee_type_id,
                        (int) $fee->month,
                        (int) $fee->year
                    );

                    continue;
                }

                // Get fee structure
                $feeStructure = FeeStructure::where('fee_type_id', $fee->fee_type_id)
                    ->where('class_id', $fee->student->class_id)
                    ->where('academic_year_id', $fee->academic_year_id)
                    ->first();

                if (!$feeStructure) {
                    continue;
                }

                // Calculate due date
                $dueDateDay = $feeStructure->due_date ? Carbon::parse($feeStructure->due_date)->day : 10;
                $dueDate = Carbon::create($fee->year, $fee->month, $dueDateDay);

                // Check if overdue
                if ($today->gt($dueDate)) {
                    $daysOverdue = $today->diffInDays($dueDate);

                    // Calculate late fee
                    $lateFee = 0;
                    if ($feeStructure->late_fee && $feeStructure->late_fee_days) {
                        if ($daysOverdue > $feeStructure->late_fee_days) {
                            $lateFee = $feeStructure->late_fee;
                        }
                    }

                    // Update fee
                    $fee->update([
                        'status' => 'overdue',
                        'late_fee' => $lateFee,
                        'total_amount' => $fee->amount - $fee->discount + $lateFee,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("Error updating fee {$fee->id}: " . $e->getMessage());
            }
        }
    }
}
