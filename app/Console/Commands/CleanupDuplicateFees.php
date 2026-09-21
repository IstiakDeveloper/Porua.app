<?php

namespace App\Console\Commands;

use App\Models\FeeCollection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanupDuplicateFees extends Command
{
    protected $signature = 'fees:cleanup-duplicates {--dry-run : Show duplicates without cancelling}';

    protected $description = 'Cancel unpaid duplicate fees (same student + fee type + month) and unpaid rows that already have a paid receipt';

    public function handle(): int
    {
        $periodDuplicates = $this->unpaidPeriodDuplicateRows();
        $orphanUnpaid = $this->orphanUnpaidRows();

        $this->info('Unpaid same-period duplicates: '.$periodDuplicates->count());
        $this->info('Unpaid rows already paid: '.$orphanUnpaid->count());

        if ($periodDuplicates->isNotEmpty()) {
            $this->table(
                ['Keep ID', 'Cancel ID', 'Student', 'Fee', 'Month', 'Amount', 'Status'],
                $periodDuplicates->map(fn ($row) => [
                    $row['keep_id'],
                    $row['id'],
                    $row['student_name'],
                    $row['fee_name'],
                    $row['period'],
                    $row['amount'],
                    $row['status'],
                ])->all()
            );
        }

        if ($orphanUnpaid->isNotEmpty()) {
            $this->table(
                ['Cancel ID', 'Student', 'Fee', 'Month', 'Amount', 'Status'],
                $orphanUnpaid->map(fn ($row) => [
                    $row['id'],
                    $row['student_name'],
                    $row['fee_name'],
                    $row['period'],
                    $row['amount'],
                    $row['status'],
                ])->all()
            );
        }

        if ($this->option('dry-run')) {
            $this->comment('Dry run only. Nothing was cancelled.');

            return self::SUCCESS;
        }

        if ($periodDuplicates->isEmpty() && $orphanUnpaid->isEmpty()) {
            $this->info('No unpaid duplicates to cancel.');
            $this->uniqueIndexStatus();

            return self::SUCCESS;
        }

        $cancelled = FeeCollection::cancelAllOrphanUnpaidDuplicates();
        $this->info("Cancelled {$cancelled} unpaid duplicate row(s).");
        $this->uniqueIndexStatus();

        return self::SUCCESS;
    }

    private function unpaidPeriodDuplicateRows()
    {
        $groups = DB::table('fee_collections')
            ->whereNull('deleted_at')
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->select('student_id', 'fee_type_id', 'month', 'year', DB::raw('MIN(id) as keep_id'))
            ->groupBy('student_id', 'fee_type_id', 'month', 'year')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        $rows = collect();

        foreach ($groups as $group) {
            $duplicates = FeeCollection::with(['student.user', 'feeType'])
                ->periodQuery(
                    (int) $group->student_id,
                    (int) $group->fee_type_id,
                    $group->month !== null ? (int) $group->month : null,
                    $group->year !== null ? (int) $group->year : null
                )
                ->unpaid()
                ->where('id', '!=', $group->keep_id)
                ->orderBy('id')
                ->get();

            foreach ($duplicates as $fee) {
                $rows->push([
                    'keep_id' => $group->keep_id,
                    'id' => $fee->id,
                    'student_name' => $this->studentName($fee),
                    'fee_name' => $fee->feeType->name ?? 'Fee',
                    'period' => $this->periodLabel($fee),
                    'amount' => $fee->amount,
                    'status' => $fee->status,
                ]);
            }
        }

        return $rows;
    }

    private function orphanUnpaidRows()
    {
        return FeeCollection::query()
            ->unpaid()
            ->whereExists(function ($sub) {
                $sub->from('fee_collections as paid_fees')
                    ->whereColumn('paid_fees.student_id', 'fee_collections.student_id')
                    ->whereColumn('paid_fees.fee_type_id', 'fee_collections.fee_type_id')
                    ->whereColumn('paid_fees.month', 'fee_collections.month')
                    ->whereColumn('paid_fees.year', 'fee_collections.year')
                    ->where('paid_fees.status', 'paid')
                    ->whereNull('paid_fees.deleted_at');
            })
            ->with(['student.user', 'feeType'])
            ->orderBy('id')
            ->get()
            ->map(fn (FeeCollection $fee) => [
                'id' => $fee->id,
                'student_name' => $this->studentName($fee),
                'fee_name' => $fee->feeType->name ?? 'Fee',
                'period' => $this->periodLabel($fee),
                'amount' => $fee->amount,
                'status' => $fee->status,
            ]);
    }

    private function studentName(FeeCollection $fee): string
    {
        if (! empty($fee->student?->full_name)) {
            return $fee->student->full_name;
        }

        $name = trim(($fee->student?->first_name ?? '').' '.($fee->student?->last_name ?? ''));

        return $name !== '' ? $name : ($fee->student?->user?->name ?? 'Student #'.$fee->student_id);
    }

    private function periodLabel(FeeCollection $fee): string
    {
        return ($fee->month && $fee->year) ? $fee->month.'/'.$fee->year : '-';
    }

    private function uniqueIndexStatus(): void
    {
        if (Schema::hasColumn('fee_collections', 'active_period_key')) {
            $this->info('Unique period key is in place. New unpaid duplicates cannot be inserted.');
        } else {
            $this->warn('Unique period key is missing. Run: php artisan migrate');
        }
    }
}
