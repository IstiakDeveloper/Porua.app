<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_invigilators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_schedule_id')->constrained('exam_schedules')->onDelete('cascade');
            $table->foreignId('exam_hall_id')->constrained('exam_halls')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['chief', 'assistant', 'relief'])->default('assistant');
            $table->time('duty_start_time')->nullable();
            $table->time('duty_end_time')->nullable();
            $table->boolean('is_present')->default(false);
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->text('responsibilities')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['exam_schedule_id', 'exam_hall_id']);
            $table->index('teacher_id');
            $table->index(['exam_schedule_id', 'teacher_id']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('exam_invigilators');
    }
};
