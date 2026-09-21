<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 2024-2025
            $table->string('title')->nullable(); // Academic Year 2024-2025
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->enum('status', ['active', 'completed', 'upcoming'])->default('upcoming');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('is_current');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
