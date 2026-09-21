<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchAttendance extends Model
{
    use HasFactory;

    protected $table = 'batch_attendances';

    protected $fillable = [
        'batch_id',
        'student_id',
        'batch_enrollment_id',
        'date',
        'status',
        'in_time',
        'remarks',
        'marked_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
        ];
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function batchEnrollment()
    {
        return $this->belongsTo(BatchEnrollment::class);
    }

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function scopeForBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
