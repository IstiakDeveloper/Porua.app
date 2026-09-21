<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('title'); // Birth Certificate, Marksheet, etc
            $table->enum('type', ['certificate', 'marksheet', 'medical', 'id_proof', 'photo', 'other']);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable(); // pdf, jpg, png
            $table->integer('file_size')->nullable(); // in KB
            $table->text('description')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('student_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_documents');
    }
};
