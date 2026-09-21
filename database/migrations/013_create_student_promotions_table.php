<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignId('to_academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignId('from_class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('to_class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('from_section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->foreignId('to_section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->enum('status', ['promoted', 'detained', 'passed_out'])->default('promoted');
            $table->text('remarks')->nullable();
            $table->date('promotion_date');
            $table->foreignId('promoted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('student_id');
            $table->index(['from_academic_year_id', 'to_academic_year_id'], 'sp_academic_years_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_promotions');
    }
};
