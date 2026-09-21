<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'class_id',
        'subject_id',
        'exam_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'room_number',
        'instructions',
    ];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'duration_minutes' => 'integer',
        ];
    }

    // Accessors for proper time formatting
    protected function startTime(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn ($value) => $value ? date('h:i A', strtotime($value)) : null,
        );
    }

    protected function endTime(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn ($value) => $value ? date('h:i A', strtotime($value)) : null,
        );
    }

    // Relationships
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    // NEW relationships for exam management
    public function seatPlans()
    {
        return $this->hasMany(ExamSeatPlan::class);
    }

    public function invigilators()
    {
        return $this->hasMany(ExamInvigilator::class);
    }

    public function halls()
    {
        return $this->belongsToMany(ExamHall::class, 'exam_seat_plans')
                    ->distinct();
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('exam_date', '>=', now());
    }

    public function scopeToday($query)
    {
        return $query->whereDate('exam_date', today());
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('exam_date', $date);
    }

    // Helper Methods
    public function getTotalSeats()
    {
        return $this->seatPlans()->count();
    }

    public function getAssignedStudents()
    {
        return $this->seatPlans()->count();
    }

    public function getTotalInvigilators()
    {
        return $this->invigilators()->count();
    }

    public function isSeatingComplete()
    {
        $totalStudents = Student::where('class_id', $this->class_id)->count();
        return $this->getAssignedStudents() >= $totalStudents;
    }
}
