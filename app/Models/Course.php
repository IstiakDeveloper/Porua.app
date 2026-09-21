<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'academic_year_id',
        'fee_type',
        'standard_fee',
        'description',
        'status',
    ];

    protected $casts = [
        'standard_fee' => 'decimal:2',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function activeBatches()
    {
        return $this->hasMany(Batch::class)->where('status', 'active');
    }

    public function enrollments()
    {
        return $this->hasManyThrough(BatchEnrollment::class, Batch::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
