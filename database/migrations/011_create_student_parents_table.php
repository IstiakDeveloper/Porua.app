<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Parent user account

            $table->enum('relation', ['father', 'mother', 'guardian'])->nullable(); // father, mother, guardian
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('nid_no')->nullable(); // National ID
            $table->string('occupation')->nullable();
            $table->string('designation')->nullable();
            $table->string('organization')->nullable();
            $table->decimal('annual_income', 12, 2)->nullable();
            $table->text('office_address')->nullable();
            $table->text('home_address')->nullable();
            $table->string('photo')->nullable();
            $table->boolean('is_primary_contact')->default(false);
            $table->boolean('can_pickup')->default(true); // Can pickup student from school
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');

            // Additional parent information fields
            $table->string('father_name')->nullable();
            $table->string('father_phone')->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('mother_phone')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_relation')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('student_id');
            $table->index('phone');
            $table->index('is_primary_contact');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_parents');
    }
};
