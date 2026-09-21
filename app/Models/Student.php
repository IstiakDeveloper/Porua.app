<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'academic_year_id',
        'class_id',
        'section_id',
        'parent_id',
        'admission_number',
        'student_id',
        'form_number',
        'monthly_fee',
        'roll_number',
        'class_role',
        'first_name',
        'last_name',
        'first_name_bengali',
        'last_name_bengali',
        'name_bn',
        'name_en',
        'date_of_birth',
        'birth_place_district',
        'gender',
        'blood_group',
        'birth_certificate_no',
        'birth_certificate_number',
        'religion',
        'nationality',
        'minorities',
        'minority_name',
        'handicap',
        'phone',
        'email',
        'present_address',
        'present_address_division',
        'present_address_district',
        'present_address_upazila',
        'present_address_city',
        'present_address_ward',
        'present_address_village',
        'present_address_house_number',
        'present_address_post',
        'present_address_post_code',
        'permanent_address',
        'permanent_address_division',
        'permanent_address_district',
        'permanent_address_upazila',
        'permanent_address_city',
        'permanent_address_ward',
        'permanent_address_village',
        'permanent_address_house_number',
        'permanent_address_post',
        'permanent_address_post_code',
        'city',
        'state',
        'postal_code',
        'father_name',
        'father_name_bn',
        'father_name_en',
        'father_phone',
        'father_mobile',
        'father_nid',
        'father_dob',
        'father_occupation',
        'father_dead',
        'mother_name',
        'mother_name_bn',
        'mother_name_en',
        'mother_phone',
        'mother_mobile',
        'mother_nid',
        'mother_dob',
        'mother_occupation',
        'mother_dead',
        'guardian_name',
        'guardian_phone',
        'guardian_relation',
        'admission_date',
        'previous_school',
        'previous_class',
        'previous_exam_result',
        'special_notes',
        'medical_conditions',
        'allergies',
        'information_correct',
        'photo',
        'birth_certificate',
        'previous_marksheet',
        'transfer_certificate',
        'status',
        'status_changed_at',
        'status_reason',
    ];

    protected $appends = [
        'full_name',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'admission_date' => 'date',
            'status_changed_at' => 'date',
            'mother_dob' => 'date',
            'father_dob' => 'date',
            'minorities' => 'boolean',
            'mother_dead' => 'boolean',
            'father_dead' => 'boolean',
            'information_correct' => 'boolean',
            'monthly_fee' => 'decimal:2',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function class()
    {
        return $this->schoolClass();
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function parent()
    {
        return $this->belongsTo(StudentParent::class, 'parent_id');
    }

    public function parents()
    {
        return $this->hasMany(StudentParent::class);
    }

    public function documents()
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function promotions()
    {
        return $this->hasMany(StudentPromotion::class);
    }

    public function attendance()
    {
        return $this->hasMany(StudentAttendance::class);
    }

    public function attendanceSummary()
    {
        return $this->hasMany(AttendanceSummary::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function feeCollections()
    {
        return $this->hasMany(FeeCollection::class);
    }

    public function feeWaivers()
    {
        return $this->hasMany(FeeWaiver::class);
    }

    public function bookIssues()
    {
        return $this->morphMany(BookIssue::class, 'issueable');
    }

    public function batchEnrollments()
    {
        return $this->hasMany(BatchEnrollment::class);
    }

    public function batches()
    {
        return $this->belongsToMany(Batch::class, 'batch_enrollments')
            ->withPivot(['id', 'enrolled_date', 'agreed_fee', 'discount_amount', 'status', 'notes'])
            ->withTimestamps();
    }

    public function modelTestResults()
    {
        return $this->hasMany(ModelTestResult::class);
    }

    public function batchAttendances()
    {
        return $this->hasMany(BatchAttendance::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeBySection($query, $sectionId)
    {
        return $query->where('section_id', $sectionId);
    }

    public function scopeByAcademicYear($query, $yearId)
    {
        return $query->where('academic_year_id', $yearId);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name.' '.$this->last_name;
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth->age;
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo ? asset('storage/'.$this->photo) : null;
    }
}
