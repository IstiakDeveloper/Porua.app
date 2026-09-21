<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('grade_name');
            $table->decimal('min_marks', 5, 2);
            $table->decimal('max_marks', 5, 2);
            $table->decimal('grade_point', 3, 2);
            $table->text('remarks')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['academic_year_id', 'order']);
        });
    }
    public function down(): void { Schema::dropIfExists('grade_settings'); }
};
