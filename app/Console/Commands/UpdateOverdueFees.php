<?php

namespace App\Console\Commands;

use App\Models\FeeCollection;
use App\Models\FeeStructure;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateOverdueFees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:update-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update overdue fees status and calculate late fees';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating overdue fees...');

        FeeCollection::cancelAllOrphanUnpaidDuplicates();

        $today = Carbon::today();

        // Get all pending fees (only for non-soft-deleted students)
        $pendingFees = FeeCollection::with(['feeType', 'student.schoolClass'])
            ->whereHas('student')
            ->where('status', 'pending')
            ->get();

        if ($pendingFees->isEmpty()) {
            $this->info('No pending fees found.');

            return 0;
        }

        $updatedCount = 0;
        $overdueCount = 0;

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

                // Skip fees without month/year (e.g., one-time admission fees)
                if (! $fee->month || ! $fee->year) {
                    continue;
                }

                // Get fee structure to check due date and late fee settings
                $feeStructure = FeeStructure::where('fee_type_id', $fee->fee_type_id)
                    ->where('class_id', $fee->student->class_id)
                    ->where('academic_year_id', $fee->academic_year_id)
                    ->first();

                if (! $feeStructure) {
                    continue;
                }

                // Calculate due date based on month and year
                // Use fee structure due date day, or default to 10th
                $dueDateDay = $feeStructure->due_date ? Carbon::parse($feeStructure->due_date)->day : 10;
                $dueDate = Carbon::create($fee->year, $fee->month, $dueDateDay);

                // Check if overdue
                if ($today->gt($dueDate)) {
                    $daysOverdue = $today->diffInDays($dueDate);

                    // Calculate late fee if applicable
                    $lateFee = 0;
                    if ($feeStructure->late_fee && $feeStructure->late_fee_days) {
                        // Apply late fee if days overdue exceeds grace period
                        if ($daysOverdue > $feeStructure->late_fee_days) {
                            $lateFee = $feeStructure->late_fee;
                        }
                    }

                    // Update fee collection with overdue status and late fee
                    $fee->update([
                        'status' => 'overdue',
                        'late_fee' => $lateFee,
                        'total_amount' => $fee->amount - $fee->discount + $lateFee,
                    ]);

                    $updatedCount++;
                    $overdueCount++;
                }
            } catch (\Exception $e) {
                $this->error("Error updating fee {$fee->id}: ".$e->getMessage());
            }
        }

        $this->info("✓ Updated {$updatedCount} fees");
        $this->info("✓ Overdue fees: {$overdueCount}");

        return 0;
    }
}
