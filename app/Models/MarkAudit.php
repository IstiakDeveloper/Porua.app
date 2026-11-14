<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarkAudit extends Model
{
    protected $fillable = [
        'mark_id',
        'exam_id',
        'student_id',
        'subject_id',
        'user_id',
        'action',
        'before',
        'after',
    ];

    protected function casts(): array
    {
        return [
            'before' => 'array',
            'after' => 'array',
        ];
    }
}
