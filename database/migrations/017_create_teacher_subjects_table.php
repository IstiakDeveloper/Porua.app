<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->boolean('is_class_teacher')->default(false);
            $table->timestamps();
            
            $table->index(['teacher_id', 'academic_year_id']);
            $table->index(['class_id', 'section_id', 'subject_id']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
    }
};
