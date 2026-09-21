<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentParent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'user_id',
        'relation',
        'name',
        'phone',
        'email',
        'nid_no',
        'occupation',
        'designation',
        'organization',
        'annual_income',
        'office_address',
        'home_address',
        'photo',
        'is_primary_contact',
        'can_pickup',
        'notes',
        'status',
        'father_name',
        'father_phone',
        'father_occupation',
        'mother_name',
        'mother_phone',
        'mother_occupation',
        'guardian_name',
        'guardian_phone',
        'guardian_relation',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'annual_income' => 'decimal:2',
            'is_primary_contact' => 'boolean',
            'can_pickup' => 'boolean',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_parent_pivot', 'parent_id', 'student_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary_contact', true);
    }
}
