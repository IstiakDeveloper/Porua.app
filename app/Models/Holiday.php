<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'date',
        'type',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Scope to get only active holidays
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get holidays for a specific date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to get upcoming holidays
     */
    public function scopeUpcoming($query, $days = 30)
    {
        return $query->where('date', '>=', now())
            ->where('date', '<=', now()->addDays($days))
            ->orderBy('date');
    }

    /**
     * Scope to get holidays by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if a specific date is a holiday
     */
    public static function isHoliday($date)
    {
        return static::where('date', Carbon::parse($date)->format('Y-m-d'))
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Get holiday for a specific date
     */
    public static function getHoliday($date)
    {
        return static::where('date', $date)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get formatted date
     */
    public function getFormattedDateAttribute()
    {
        return $this->date->format('d M, Y');
    }

    /**
     * Check if holiday is today
     */
    public function getIsTodayAttribute()
    {
        return $this->date->isToday();
    }

    /**
     * Check if holiday is upcoming
     */
    public function getIsUpcomingAttribute()
    {
        return $this->date->isFuture();
    }

    /**
     * Get days until holiday
     */
    public function getDaysUntilAttribute()
    {
        if ($this->date->isPast()) {
            return null;
        }

        return $this->date->diffInDays(now());
    }
}
