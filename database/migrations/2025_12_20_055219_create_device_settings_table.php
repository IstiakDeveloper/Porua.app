<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('device_settings', function (Blueprint $table) {
            $table->id();

            // Device Information
            $table->string('device_name')->default('ZKTeco F10');
            $table->string('device_ip');
            $table->integer('device_port')->default(4370);
            $table->string('device_model')->nullable();
            $table->boolean('device_status')->default(true);

            // Last Sync Information
            $table->timestamp('last_sync_at')->nullable();
            $table->string('last_sync_status')->nullable(); // success/failed
            $table->text('last_sync_message')->nullable();
            $table->integer('last_sync_records')->default(0);

            // Teacher Attendance Rules
            $table->time('teacher_in_time')->default('08:30:00');
            $table->time('teacher_out_time')->default('16:30:00');
            $table->integer('teacher_late_threshold')->default(15); // minutes
            $table->integer('teacher_early_leave_threshold')->default(30); // minutes

            // Student Attendance Rules
            $table->time('student_in_time')->default('08:45:00');
            $table->time('student_out_time')->default('15:30:00');
            $table->integer('student_late_threshold')->default(15); // minutes
            $table->integer('student_early_leave_threshold')->default(30); // minutes

            // Weekend Settings (JSON array of day numbers: 0=Sunday, 6=Saturday)
            $table->json('weekend_days')->nullable();

            // Auto Mark Settings
            $table->boolean('auto_mark_absent')->default(true);
            $table->time('auto_mark_absent_after')->default('10:00:00');
            $table->boolean('auto_mark_late')->default(true);
            $table->boolean('auto_mark_early_leave')->default(true);

            // Notification Settings
            $table->boolean('send_sms_on_absent')->default(false);
            $table->boolean('send_sms_on_late')->default(false);

            // Sync Settings
            $table->boolean('auto_sync_enabled')->default(false);
            $table->integer('auto_sync_interval')->default(60); // minutes
            $table->time('daily_sync_time')->nullable(); // e.g., 23:00:00

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_settings');
    }
};
