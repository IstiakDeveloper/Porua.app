<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 10)->unique();
            $table->unsignedInteger('days_per_year')->default(0);
            $table->boolean('is_paid')->default(true);
            $table->string('color', 20)->default('#0284c7');
            $table->boolean('requires_attachment')->default(false);
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('leave_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained('leave_types')->onDelete('restrict');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 5, 1)->default(1.0);
            $table->boolean('is_half_day')->default(false);
            $table->enum('half_day_type', ['first_half', 'second_half'])->nullable();
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('action_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('action_at')->nullable();
            $table->text('admin_remarks')->nullable();
            $table->timestamps();

            $table->index(['teacher_id', 'status']);
            $table->index(['start_date', 'end_date']);
        });

        Schema::table('teacher_attendance', function (Blueprint $table) {
            $table->foreignId('leave_application_id')->nullable()->after('reason')->constrained('leave_applications')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_attendance', function (Blueprint $table) {
            $table->dropForeign(['leave_application_id']);
            $table->dropColumn('leave_application_id');
        });

        Schema::dropIfExists('leave_applications');
        Schema::dropIfExists('leave_types');
    }
};

