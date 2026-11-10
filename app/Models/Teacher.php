<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'blood_group',
        'religion',
        'nationality',
        'designation',
        'department',
        'nid_no',
        'phone',
        'emergency_contact',
        'email',
        'present_address',
        'permanent_address',
        'city',
        'state',
        'postal_code',
        'qualification',
        'specialization',
        'experience_years',
        'previous_experience',
        'joining_date',
        'leaving_date',
        'salary',
        'bank_name',
        'bank_account_no',
        'bank_branch',
        'photo',
        'employment_type',
        'status',
        'notes',
    ];

    protected $appends = [
        'full_name',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joining_date' => 'date',
            'leaving_date' => 'date',
            'salary' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function teacherSubjects()
    {
        return $this->hasMany(TeacherSubject::class);
    }

    public function subjects()
    {
        return $this->hasMany(TeacherSubject::class);
    }

    public function attendance()
    {
        return $this->hasMany(TeacherAttendance::class);
    }

    public function leaveApplications()
    {
        return $this->hasMany(LeaveApplication::class);
    }

    public function salaries()
    {
        return $this->morphMany(Salary::class, 'salaryable');
    }

    public function bookIssues()
    {
        return $this->morphMany(BookIssue::class, 'issueable');
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function payouts()
    {
        return $this->hasMany(TeacherPayout::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}
