<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_summary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->integer('month');
            $table->integer('year');
            $table->integer('total_days')->default(0);
            $table->integer('present_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->integer('late_days')->default(0);
            $table->integer('leave_days')->default(0);
            $table->integer('half_days')->default(0);
            $table->decimal('attendance_percentage', 5, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['student_id', 'year', 'month']);
            $table->index(['year', 'month']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('attendance_summary');
    }
};
