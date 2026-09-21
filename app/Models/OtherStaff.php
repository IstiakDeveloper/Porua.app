<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OtherStaff extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'other_staff';

    protected $fillable = [
        'employee_id',
        'name',
        'phone',
        'designation',
        'in_time',
        'out_time',
        'late_time',
        'weekend',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'weekend' => 'array',
        ];
    }

    public function attendances()
    {
        return $this->hasMany(OtherStaffAttendance::class, 'other_staff_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if a given date is a weekend for this staff member
     */
    public function isWeekend($date): bool
    {
        if (empty($this->weekend)) {
            return false;
        }

        $dayName = Carbon::parse($date)->format('l'); // e.g. 'Friday'
        $weekendDays = is_array($this->weekend) ? $this->weekend : json_decode($this->weekend, true) ?? [];

        return in_array($dayName, $weekendDays);
    }
}
