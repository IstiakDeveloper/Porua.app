<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable();

            // Basic Info
            $table->string('admission_number')->unique();
            $table->string('student_id')->unique()->nullable();
            $table->string('form_number')->unique()->nullable();
            $table->decimal('monthly_fee', 10, 2)->nullable();
            $table->string('roll_number')->nullable();
            $table->string('class_role')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('first_name_bengali')->nullable();
            $table->string('last_name_bengali')->nullable();
            $table->string('name_bn')->nullable();
            $table->string('name_en')->nullable();
            $table->date('date_of_birth');
            $table->string('birth_place_district')->nullable();
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])->nullable();
            $table->string('birth_certificate_no')->nullable();
            $table->string('birth_certificate_number')->nullable();
            $table->string('religion')->nullable();
            $table->string('nationality')->default('Bangladeshi');
            $table->boolean('minorities')->default(false);
            $table->string('minority_name')->nullable();
            $table->string('handicap')->nullable();

            // Contact Info
            $table->string('phone')->nullable();
            $table->string('email')->unique()->nullable();
            $table->text('present_address');
            $table->string('present_address_division')->nullable();
            $table->string('present_address_district')->nullable();
            $table->string('present_address_upazila')->nullable();
            $table->string('present_address_city')->nullable();
            $table->string('present_address_ward')->nullable();
            $table->string('present_address_village')->nullable();
            $table->string('present_address_house_number')->nullable();
            $table->string('present_address_post')->nullable();
            $table->string('present_address_post_code')->nullable();

            $table->text('permanent_address')->nullable();
            $table->string('permanent_address_division')->nullable();
            $table->string('permanent_address_district')->nullable();
            $table->string('permanent_address_upazila')->nullable();
            $table->string('permanent_address_city')->nullable();
            $table->string('permanent_address_ward')->nullable();
            $table->string('permanent_address_village')->nullable();
            $table->string('permanent_address_house_number')->nullable();
            $table->string('permanent_address_post')->nullable();
            $table->string('permanent_address_post_code')->nullable();

            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();

            // Guardian/Parent Info (basic - detailed in separate table)
            $table->string('father_name')->nullable();
            $table->string('father_name_bn')->nullable();
            $table->string('father_name_en')->nullable();
            $table->string('father_phone')->nullable();
            $table->string('father_mobile')->nullable();
            $table->string('father_nid')->nullable();
            $table->date('father_dob')->nullable();
            $table->string('father_occupation')->nullable();
            $table->boolean('father_dead')->default(false);

            $table->string('mother_name')->nullable();
            $table->string('mother_name_bn')->nullable();
            $table->string('mother_name_en')->nullable();
            $table->string('mother_phone')->nullable();
            $table->string('mother_mobile')->nullable();
            $table->string('mother_nid')->nullable();
            $table->date('mother_dob')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->boolean('mother_dead')->default(false);

            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->enum('guardian_relation', ['father', 'mother', 'uncle', 'aunt', 'grandfather', 'grandmother', 'other'])->default('father');

            // Academic Info
            $table->date('admission_date');
            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            $table->text('previous_exam_result')->nullable();
            $table->text('special_notes')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();
            $table->boolean('information_correct')->default(false);

            // Documents
            $table->string('photo')->nullable();
            $table->string('birth_certificate')->nullable();
            $table->string('previous_marksheet')->nullable();
            $table->string('transfer_certificate')->nullable();

            // Status
            $table->enum('status', ['active', 'passed', 'transferred', 'dropped', 'suspended'])->default('active');
            $table->date('status_changed_at')->nullable();
            $table->text('status_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('admission_number');
            $table->index('roll_number');
            $table->index(['class_id', 'section_id']);
            $table->index('status');
            $table->index('academic_year_id');
            $table->index(['first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
