<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherAttendance extends Model
{
    use HasFactory;

    protected $table = 'teacher_attendance';

    protected $fillable = [
        'teacher_id',
        'date',
        'status',
        'in_time',
        'out_time',
        'reason',
        'marked_by',
        // ZKTeco integration fields
        'employee_id',
        'punch_time',
        'punch_state',
        'punch_type',
        'device_sn',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'in_time' => 'datetime',
            'out_time' => 'datetime',
            'punch_time' => 'datetime',
            'punch_state' => 'integer',
        ];
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function marker()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}
