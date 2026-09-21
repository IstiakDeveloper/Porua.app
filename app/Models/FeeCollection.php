<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FeeCollection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_number',
        'student_id',
        'fee_type_id',
        'academic_year_id',
        'account_id',
        'accounting_transaction_id',
        'batch_id',
        'batch_enrollment_id',
        'installment_title',
        'month',
        'year',
        'amount',
        'late_fee',
        'discount',
        'total_amount',
        'paid_amount',
        'payment_date',
        'payment_method',
        'transaction_id',
        'remarks',
        'status',
        'collected_by',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'amount' => 'decimal:2',
            'late_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    protected $appends = ['short_receipt_number'];

    public function getShortReceiptNumberAttribute(): string
    {
        if (empty($this->receipt_number)) {
            return '';
        }

        if (preg_match('/(\d+)$/', $this->receipt_number, $matches)) {
            return str_pad($matches[1], 4, '0', STR_PAD_LEFT);
        }

        return $this->receipt_number;
    }

    /**
     * Next paid collection voucher: 4-digit running number after the last RCP voucher.
     * Does not reset each day. Auto-generated FEE- dues are ignored.
     */
    public static function nextPaidReceiptNumber(): string
    {
        $liveMax = static::currentPaidReceiptSequence();
        $last = 0;

        if (Schema::hasTable('receipt_sequences')) {
            $sequence = DB::table('receipt_sequences')
                ->where('date_prefix', 'RCP')
                ->lockForUpdate()
                ->first();

            $last = $sequence ? (int) $sequence->last_number : 0;
            $next = max($last, $liveMax) + 1;

            if ($sequence) {
                DB::table('receipt_sequences')
                    ->where('id', $sequence->id)
                    ->update([
                        'last_number' => $next,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('receipt_sequences')->insert([
                    'date_prefix' => 'RCP',
                    'last_number' => $next,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } else {
            $next = $liveMax + 1;
        }

        return 'RCP-'.now()->format('Ymd').'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public static function currentPaidReceiptSequence(): int
    {
        $maxSuffix = (int) (static::withTrashed()
            ->where('receipt_number', 'like', 'RCP-%')
            ->max(DB::raw('CAST(RIGHT(receipt_number, 4) AS UNSIGNED)')) ?? 0);

        $distinct = (int) static::withTrashed()
            ->where('receipt_number', 'like', 'RCP-%')
            ->distinct()
            ->count('receipt_number');

        return max($maxSuffix, $distinct);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function batchEnrollment()
    {
        return $this->belongsTo(BatchEnrollment::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function accountingTransaction()
    {
        return $this->belongsTo(Transaction::class, 'accounting_transaction_id');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->whereIn('status', ['pending', 'partial', 'overdue']);
    }

    /**
     * Hide unpaid rows when the same student/fee/month/year is already paid.
     */
    public function scopeWithoutPaidDuplicate(Builder $query): Builder
    {
        return $query->whereNotExists(function ($sub) {
            $sub->from('fee_collections as paid_fees')
                ->whereColumn('paid_fees.student_id', 'fee_collections.student_id')
                ->whereColumn('paid_fees.fee_type_id', 'fee_collections.fee_type_id')
                ->whereColumn('paid_fees.month', 'fee_collections.month')
                ->whereColumn('paid_fees.year', 'fee_collections.year')
                ->where('paid_fees.status', 'paid')
                ->whereNull('paid_fees.deleted_at');
        });
    }

    public function scopeOutstanding(Builder $query): Builder
    {
        return $query->unpaid()->withoutPaidDuplicate();
    }

    /**
     * Paid rows plus genuine unpaid rows (hides cancelled and paid duplicates).
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where('status', 'paid')
                ->orWhere(fn (Builder $inner) => $inner->outstanding());
        });
    }

    public function scopeExcludeCancelled(Builder $query): Builder
    {
        return $query->where('status', '!=', 'cancelled');
    }

    public function getRemainingAttribute(): float
    {
        if (in_array($this->status, ['paid', 'cancelled'], true)) {
            return 0.0;
        }

        return max((float) $this->total_amount - (float) $this->paid_amount, 0);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['paid', 'cancelled'], true)) {
            return false;
        }

        if ($this->status === 'overdue') {
            return true;
        }

        return $this->payment_date?->isPast() ?? false;
    }

    public function getDueDateAttribute()
    {
        return $this->payment_date;
    }

    public static function periodQuery(int $studentId, int $feeTypeId, ?int $month = null, ?int $year = null): Builder
    {
        return static::query()
            ->where('student_id', $studentId)
            ->where('fee_type_id', $feeTypeId)
            ->when($month !== null, fn ($q) => $q->where('month', $month), fn ($q) => $q->whereNull('month'))
            ->when($year !== null, fn ($q) => $q->where('year', $year), fn ($q) => $q->whereNull('year'));
    }

    public static function activeExistsForPeriod(int $studentId, int $feeTypeId, ?int $month = null, ?int $year = null): bool
    {
        return static::periodQuery($studentId, $feeTypeId, $month, $year)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }

    /**
     * Create a pending fee only if this student/type/month/year does not already have an active row.
     * Locks the student row so concurrent generators cannot insert twice.
     */
    public static function createPendingIfAbsent(array $attributes): ?self
    {
        $studentId = (int) $attributes['student_id'];
        $feeTypeId = (int) $attributes['fee_type_id'];
        $month = array_key_exists('month', $attributes) ? ($attributes['month'] !== null ? (int) $attributes['month'] : null) : null;
        $year = array_key_exists('year', $attributes) ? ($attributes['year'] !== null ? (int) $attributes['year'] : null) : null;

        return DB::transaction(function () use ($attributes, $studentId, $feeTypeId, $month, $year) {
            Student::query()->whereKey($studentId)->lockForUpdate()->first();

            if (static::activeExistsForPeriod($studentId, $feeTypeId, $month, $year)) {
                return null;
            }

            try {
                return static::create($attributes);
            } catch (UniqueConstraintViolationException $e) {
                return null;
            } catch (QueryException $e) {
                if ((string) $e->getCode() === '23000') {
                    return null;
                }

                throw $e;
            }
        });
    }

    public static function paidExistsForPeriod(int $studentId, int $feeTypeId, ?int $month = null, ?int $year = null): bool
    {
        return static::periodQuery($studentId, $feeTypeId, $month, $year)
            ->where('status', 'paid')
            ->exists();
    }

    public static function findUnpaidForPeriod(int $studentId, int $feeTypeId, ?int $month = null, ?int $year = null): ?self
    {
        return static::periodQuery($studentId, $feeTypeId, $month, $year)
            ->unpaid()
            ->orderBy('id')
            ->first();
    }

    public static function cancelUnpaidDuplicatesForPeriod(
        int $studentId,
        int $feeTypeId,
        ?int $month = null,
        ?int $year = null,
        ?int $exceptId = null
    ): int {
        return static::periodQuery($studentId, $feeTypeId, $month, $year)
            ->unpaid()
            ->when($exceptId, fn (Builder $q) => $q->where('id', '!=', $exceptId))
            ->update(['status' => 'cancelled']);
    }

    /**
     * Keep the oldest unpaid row per student/type/month/year and cancel the rest.
     */
    public static function cancelAllUnpaidPeriodDuplicates(): int
    {
        $groups = DB::table('fee_collections')
            ->whereNull('deleted_at')
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->select('student_id', 'fee_type_id', 'month', 'year', DB::raw('MIN(id) as keep_id'))
            ->groupBy('student_id', 'fee_type_id', 'month', 'year')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        $cancelled = 0;

        foreach ($groups as $group) {
            $cancelled += static::cancelUnpaidDuplicatesForPeriod(
                (int) $group->student_id,
                (int) $group->fee_type_id,
                $group->month !== null ? (int) $group->month : null,
                $group->year !== null ? (int) $group->year : null,
                (int) $group->keep_id
            );
        }

        return $cancelled;
    }

    public static function cancelAllOrphanUnpaidDuplicates(): int
    {
        $orphanIds = static::query()
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
            ->pluck('id');

        $cancelled = 0;

        if ($orphanIds->isNotEmpty()) {
            $cancelled += static::query()
                ->whereIn('id', $orphanIds)
                ->update(['status' => 'cancelled']);
        }

        return $cancelled + static::cancelAllUnpaidPeriodDuplicates();
    }
}
