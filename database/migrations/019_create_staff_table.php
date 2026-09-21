<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('phone');
            $table->string('email')->unique()->nullable();
            $table->text('address')->nullable();
            $table->string('designation');
            $table->string('department')->nullable();
            $table->date('joining_date');
            $table->date('leaving_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->string('photo')->nullable();
            $table->enum('status', ['active', 'resigned', 'terminated'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('employee_id');
            $table->index('designation');
            $table->index('status');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
