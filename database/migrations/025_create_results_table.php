<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->decimal('total_marks', 8, 2);
            $table->decimal('obtained_marks', 8, 2);
            $table->decimal('percentage', 5, 2);
            $table->decimal('gpa', 3, 2)->nullable();
            $table->string('grade')->nullable();
            $table->integer('class_position')->nullable();
            $table->integer('section_position')->nullable();
            $table->enum('result_status', ['pass', 'fail', 'absent'])->default('pass');
            $table->text('remarks')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            
            $table->unique(['exam_id', 'student_id']);
            $table->index(['exam_id', 'class_id']);
            $table->index(['is_published', 'result_status']);
        });
    }
    public function down(): void { Schema::dropIfExists('results'); }
};
