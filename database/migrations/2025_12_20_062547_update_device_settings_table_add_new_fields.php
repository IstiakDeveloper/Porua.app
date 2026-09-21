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
        Schema::table('device_settings', function (Blueprint $table) {
            // Add new time fields
            $table->time('teacher_late_time')->default('08:45:00')->after('teacher_out_time');
            $table->time('student_late_time')->default('09:00:00')->after('student_out_time');

            // Rename columns
            $table->renameColumn('last_sync_records', 'total_synced');
            $table->renameColumn('auto_sync_interval', 'sync_interval_minutes');

            // Add new boolean fields
            $table->boolean('auto_mark_present')->default(true)->after('auto_mark_absent_after');
            $table->boolean('sms_on_present')->default(false)->after('send_sms_on_late');
            $table->boolean('sms_on_absent')->default(false)->after('sms_on_present');
            $table->boolean('sms_on_late')->default(false)->after('sms_on_absent');
            $table->boolean('sms_on_early_leave')->default(false)->after('sms_on_late');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('device_settings', function (Blueprint $table) {
            $table->dropColumn([
                'teacher_late_time',
                'student_late_time',
                'auto_mark_present',
                'sms_on_present',
                'sms_on_absent',
                'sms_on_late',
                'sms_on_early_leave',
            ]);

            $table->renameColumn('total_synced', 'last_sync_records');
            $table->renameColumn('sync_interval_minutes', 'auto_sync_interval');
        });
    }
};
