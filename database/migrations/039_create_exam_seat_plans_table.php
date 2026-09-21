<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_seat_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_schedule_id')->constrained('exam_schedules')->onDelete('cascade');
            $table->foreignId('exam_hall_id')->constrained('exam_halls')->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('seat_number');
            $table->integer('row_number');
            $table->integer('column_number');
            $table->enum('seat_type', ['regular', 'special', 'vip'])->default('regular');
            $table->text('special_requirements')->nullable(); // wheelchair accessible, etc
            $table->boolean('is_confirmed')->default(false);
            $table->timestamp('confirmed_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            $table->unique(['exam_schedule_id', 'exam_hall_id', 'seat_number']);
            $table->unique(['exam_schedule_id', 'student_id']);
            $table->index(['exam_schedule_id', 'exam_hall_id']);
            $table->index('student_id');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('exam_seat_plans');
    }
};
