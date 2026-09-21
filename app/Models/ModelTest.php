<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModelTest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'batch_id',
        'title',
        'test_type',
        'test_date',
        'total_marks',
        'pass_marks',
        'duration_minutes',
        'status',
        'highest_marks',
        'average_marks',
        'passed_count',
        'failed_count',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'test_date' => 'date',
        'total_marks' => 'decimal:2',
        'pass_marks' => 'decimal:2',
        'highest_marks' => 'decimal:2',
        'average_marks' => 'decimal:2',
        'duration_minutes' => 'integer',
        'passed_count' => 'integer',
        'failed_count' => 'integer',
    ];

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function results()
    {
        return $this->hasMany(ModelTestResult::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Recalculate merit ranks, highest marks, average marks, and pass/fail counts
     */
    public function recalculateMeritList(): void
    {
        $results = $this->results()->where('is_absent', false)->orderByDesc('marks_obtained')->get();

        $highest = 0.0;
        $total = 0.0;
        $passed = 0;
        $failed = 0;
        $count = $results->count();

        $currentRank = 1;
        $previousMarks = null;

        foreach ($results as $index => $result) {
            $marks = (float) $result->marks_obtained;
            if ($index === 0) {
                $highest = $marks;
            }
            $total += $marks;

            // Handle ties: if marks equal previous, same rank, otherwise index + 1
            if ($previousMarks !== null && $marks < $previousMarks) {
                $currentRank = $index + 1;
            }
            $previousMarks = $marks;

            $percentage = $this->total_marks > 0 ? round(($marks / $this->total_marks) * 100, 2) : 0.0;
            $status = $marks >= $this->pass_marks ? 'pass' : 'fail';

            if ($status === 'pass') {
                $passed++;
            } else {
                $failed++;
            }

            $result->update([
                'percentage' => $percentage,
                'status' => $status,
                'merit_rank' => $currentRank,
            ]);
        }

        // Also update absent students
        $absents = $this->results()->where('is_absent', true)->get();
        foreach ($absents as $absent) {
            $absent->update([
                'marks_obtained' => null,
                'percentage' => 0.00,
                'status' => 'absent',
                'merit_rank' => null,
            ]);
        }

        $average = $count > 0 ? round($total / $count, 2) : 0.0;

        $this->update([
            'highest_marks' => $highest,
            'average_marks' => $average,
            'passed_count' => $passed,
            'failed_count' => $failed,
            'status' => $this->status === 'upcoming' ? 'completed' : $this->status,
        ]);
    }
}
