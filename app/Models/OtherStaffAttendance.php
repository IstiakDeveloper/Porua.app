<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtherStaffAttendance extends Model
{
    use HasFactory;

    protected $table = 'other_staff_attendances';

    protected $fillable = [
        'other_staff_id',
        'employee_id',
        'date',
        'in_time',
        'out_time',
        'status',
        'punch_time',
        'punch_state',
        'punch_type',
        'device_sn',
        'marked_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'in_time' => 'datetime',
            'out_time' => 'datetime',
            'punch_time' => 'datetime',
        ];
    }

    public function otherStaff()
    {
        return $this->belongsTo(OtherStaff::class, 'other_staff_id');
    }

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
