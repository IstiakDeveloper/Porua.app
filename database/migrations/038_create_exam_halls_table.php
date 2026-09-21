<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_halls', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->integer('capacity');
            $table->integer('rows')->default(10);
            $table->integer('columns')->default(5);
            $table->json('facilities')->nullable(); // AC, projector, etc
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'maintenance', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('code');
            $table->index('status');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('exam_halls');
    }
};
