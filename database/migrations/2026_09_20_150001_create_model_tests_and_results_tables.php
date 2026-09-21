<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('model_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('batches')->cascadeOnDelete();
            $table->string('title');
            $table->enum('test_type', ['weekly_test', 'daily_quiz', 'model_test', 'mock_exam', 'monthly_test'])->default('model_test');
            $table->date('test_date');
            $table->decimal('total_marks', 8, 2)->default(100.00);
            $table->decimal('pass_marks', 8, 2)->default(40.00);
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->enum('status', ['upcoming', 'completed', 'published', 'cancelled'])->default('upcoming');
            $table->decimal('highest_marks', 8, 2)->default(0.00);
            $table->decimal('average_marks', 8, 2)->default(0.00);
            $table->unsignedInteger('passed_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('model_test_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_test_id')->constrained('model_tests')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('batch_enrollment_id')->nullable()->constrained('batch_enrollments')->nullOnDelete();
            $table->decimal('marks_obtained', 8, 2)->nullable();
            $table->boolean('is_absent')->default(false);
            $table->decimal('percentage', 5, 2)->default(0.00);
            $table->enum('status', ['pass', 'fail', 'absent'])->default('pass');
            $table->unsignedInteger('merit_rank')->nullable();
            $table->string('teacher_remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['model_test_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_test_results');
        Schema::dropIfExists('model_tests');
    }
};
