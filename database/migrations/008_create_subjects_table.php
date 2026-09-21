<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Mathematics, Science
            $table->string('name_bengali')->nullable(); // গণিত, বিজ্ঞান
            $table->string('code')->unique(); // MATH101
            $table->enum('type', ['theory', 'practical', 'both'])->default('theory');
            $table->integer('total_marks')->default(100);
            $table->integer('pass_marks')->default(33);
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
