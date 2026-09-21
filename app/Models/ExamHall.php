<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamHall extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'building',
        'floor',
        'capacity',
        'rows',
        'columns',
        'facilities',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'rows' => 'integer',
            'columns' => 'integer',
            'facilities' => 'array',
        ];
    }

    // Relationships
    public function seatPlans()
    {
        return $this->hasMany(ExamSeatPlan::class);
    }

    public function invigilators()
    {
        return $this->hasMany(ExamInvigilator::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'active')
                     ->whereDoesntHave('seatPlans', function($q) {
                         $q->whereHas('examSchedule', function($q2) {
                             $q2->whereDate('exam_date', '>=', now());
                         });
                     });
    }

    // Helper Methods
    public function getTotalSeats()
    {
        return $this->rows * $this->columns;
    }

    public function getAvailableSeats($examScheduleId)
    {
        $occupied = $this->seatPlans()
                        ->where('exam_schedule_id', $examScheduleId)
                        ->count();
        
        return $this->capacity - $occupied;
    }

    public function isAvailable($examScheduleId)
    {
        return $this->getAvailableSeats($examScheduleId) > 0;
    }
}
