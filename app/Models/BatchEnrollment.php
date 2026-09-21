<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BatchEnrollment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'batch_id',
        'enrolled_date',
        'agreed_fee',
        'discount_amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'enrolled_date' => 'date',
        'agreed_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function batchAttendances()
    {
        return $this->hasMany(BatchAttendance::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
