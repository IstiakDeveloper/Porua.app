<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Class 1, Class 2, etc
            $table->string('name_bengali')->nullable(); // প্রথম শ্রেণী
            $table->integer('numeric_value'); // 1, 2, 3...10
            $table->integer('order')->default(0); // For sorting
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('numeric_value');
            $table->index('order');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
