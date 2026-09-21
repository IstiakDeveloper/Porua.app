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
        // Add ZKTeco fields to teacher_attendance table
        Schema::table('teacher_attendance', function (Blueprint $table) {
            $table->string('employee_id')->nullable()->after('teacher_id');
            $table->dateTime('punch_time')->nullable()->after('out_time');
            $table->integer('punch_state')->nullable()->comment('0=Check In, 1=Check Out')->after('punch_time');
            $table->string('punch_type')->nullable()->default('fingerprint')->after('punch_state');
            $table->string('device_sn')->nullable()->after('punch_type');

            // Index for performance
            $table->index('employee_id');
            $table->index('punch_time');
        });

        // Add ZKTeco fields to student_attendance table
        Schema::table('student_attendance', function (Blueprint $table) {
            $table->string('employee_id')->nullable()->after('student_id');
            $table->dateTime('punch_time')->nullable()->after('out_time');
            $table->integer('punch_state')->nullable()->comment('0=Check In, 1=Check Out')->after('punch_time');
            $table->string('punch_type')->nullable()->default('fingerprint')->after('punch_state');
            $table->string('device_sn')->nullable()->after('punch_type');

            // Index for performance
            $table->index('employee_id');
            $table->index('punch_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_attendance', function (Blueprint $table) {
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['punch_time']);
            $table->dropColumn(['employee_id', 'punch_time', 'punch_state', 'punch_type', 'device_sn']);
        });

        Schema::table('student_attendance', function (Blueprint $table) {
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['punch_time']);
            $table->dropColumn(['employee_id', 'punch_time', 'punch_state', 'punch_type', 'device_sn']);
        });
    }
};
