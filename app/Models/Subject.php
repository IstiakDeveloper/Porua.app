<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'name_bengali',
        'code',
        'type',
        'total_marks',
        'pass_marks',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_marks' => 'integer',
            'pass_marks' => 'integer',
        ];
    }

    // Relationships
    public function classes()
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subject', 'subject_id', 'class_id');
    }

    public function teachers()
    {
        return $this->hasMany(TeacherSubject::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }
}
