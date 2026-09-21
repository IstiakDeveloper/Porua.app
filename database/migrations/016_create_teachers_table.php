<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])->nullable();
            $table->string('nid_no')->nullable();
            $table->string('phone');
            $table->string('emergency_contact')->nullable();
            $table->string('email')->unique()->nullable();
            $table->text('present_address');
            $table->text('permanent_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('qualification')->nullable();
            $table->string('specialization')->nullable();
            $table->string('experience_years')->nullable();
            $table->text('previous_experience')->nullable();
            $table->date('joining_date');
            $table->date('leaving_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('bank_branch')->nullable();
            $table->string('photo')->nullable();
            $table->enum('employment_type', ['permanent', 'contract', 'part_time'])->default('permanent');
            $table->enum('status', ['active', 'resigned', 'terminated', 'retired'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('employee_id');
            $table->index('status');
            $table->index(['first_name', 'last_name']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
