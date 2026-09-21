<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSeatPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_schedule_id',
        'exam_hall_id',
        'student_id',
        'seat_number',
        'row_number',
        'column_number',
        'seat_type',
        'special_requirements',
        'is_confirmed',
        'confirmed_at',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'row_number' => 'integer',
            'column_number' => 'integer',
            'is_confirmed' => 'boolean',
            'confirmed_at' => 'datetime',
        ];
    }

    // Relationships
    public function examSchedule()
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    public function examHall()
    {
        return $this->belongsTo(ExamHall::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    // Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('is_confirmed', true);
    }

    public function scopeByHall($query, $hallId)
    {
        return $query->where('exam_hall_id', $hallId);
    }

    public function scopeBySchedule($query, $scheduleId)
    {
        return $query->where('exam_schedule_id', $scheduleId);
    }

    // Helper Methods
    public function confirm()
    {
        $this->update([
            'is_confirmed' => true,
            'confirmed_at' => now(),
        ]);
    }

    public function getSeatLabel()
    {
        return "Row {$this->row_number}, Seat {$this->column_number}";
    }
}
