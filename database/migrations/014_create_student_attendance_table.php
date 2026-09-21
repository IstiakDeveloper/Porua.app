<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'leave', 'half_day', 'weekend', 'holiday'])->default('present');
            $table->time('in_time')->nullable();
            $table->time('out_time')->nullable();
            $table->text('reason')->nullable();
            $table->boolean('sms_sent')->default(false);
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['student_id', 'date']);
            $table->index(['class_id', 'section_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_attendance');
    }
};
