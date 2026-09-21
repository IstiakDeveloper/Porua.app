<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->enum('remuneration_type', ['none', 'percentage', 'per_class'])->default('none')->after('max_capacity');
            $table->decimal('teacher_commission_rate', 10, 2)->default(0.00)->after('remuneration_type');
        });

        Schema::table('fee_collections', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('academic_year_id')->constrained('batches')->nullOnDelete();
            $table->foreignId('batch_enrollment_id')->nullable()->after('batch_id')->constrained('batch_enrollments')->nullOnDelete();
            $table->string('installment_title')->nullable()->after('batch_enrollment_id');
        });
    }

    public function down(): void
    {
        Schema::table('fee_collections', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropForeign(['batch_enrollment_id']);
            $table->dropColumn(['batch_id', 'batch_enrollment_id', 'installment_title']);
        });

        Schema::table('batches', function (Blueprint $table) {
            $table->dropColumn(['remuneration_type', 'teacher_commission_rate']);
        });
    }
};
