<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_waivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_type_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->enum('waiver_type', ['percentage', 'fixed_amount'])->default('percentage');
            $table->decimal('waiver_value', 10, 2);
            $table->enum('reason', ['merit', 'financial', 'sports', 'other'])->default('merit');
            $table->text('description')->nullable();
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['student_id', 'academic_year_id']);
            $table->index(['valid_from', 'valid_to']);
        });
    }
    public function down(): void { Schema::dropIfExists('fee_waivers'); }
};
