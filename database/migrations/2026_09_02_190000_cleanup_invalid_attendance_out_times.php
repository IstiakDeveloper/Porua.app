<?php

use App\Models\DeviceSetting;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $settings = Schema::hasTable('device_settings') ? DeviceSetting::first() : null;
        $teacherLateTime = $settings?->teacher_late_time ?? '08:15:00';

        // 1. Clean up teacher_attendance where out_time is within 60 minutes of in_time
        if (Schema::hasTable('teacher_attendance')) {
            // First, fix falsely marked early_leave records
            $earlyLeaveTeachers = DB::table('teacher_attendance')
                ->whereNotNull('in_time')
                ->whereNotNull('out_time')
                ->where('status', 'early_leave')
                ->whereRaw('TIMESTAMPDIFF(MINUTE, in_time, out_time) < 60')
                ->get();

            foreach ($earlyLeaveTeachers as $rec) {
                $inTime = Carbon::parse($rec->in_time);
                $dateStr = Carbon::parse($rec->date)->toDateString();
                $lateCutoff = Carbon::parse($dateStr . ' ' . $teacherLateTime);

                $newStatus = ($settings && $settings->auto_mark_late && $inTime->greaterThan($lateCutoff)) ? 'late' : 'present';

                DB::table('teacher_attendance')
                    ->where('id', $rec->id)
                    ->update([
                        'status' => $newStatus,
                        'out_time' => null,
                        'updated_at' => now(),
                    ]);
            }

            // Next, set out_time = null for any remaining records where diff < 60 mins
            DB::table('teacher_attendance')
                ->whereNotNull('in_time')
                ->whereNotNull('out_time')
                ->whereRaw('TIMESTAMPDIFF(MINUTE, in_time, out_time) < 60')
                ->update([
                    'out_time' => null,
                    'updated_at' => now(),
                ]);
        }

        // 2. Clean up other_staff_attendances
        if (Schema::hasTable('other_staff_attendances')) {
            $earlyLeaveStaff = DB::table('other_staff_attendances')
                ->whereNotNull('in_time')
                ->whereNotNull('out_time')
                ->where('status', 'early_leave')
                ->whereRaw('TIMESTAMPDIFF(MINUTE, in_time, out_time) < 60')
                ->get();

            foreach ($earlyLeaveStaff as $rec) {
                DB::table('other_staff_attendances')
                    ->where('id', $rec->id)
                    ->update([
                        'status' => 'present',
                        'out_time' => null,
                        'updated_at' => now(),
                    ]);
            }

            DB::table('other_staff_attendances')
                ->whereNotNull('in_time')
                ->whereNotNull('out_time')
                ->whereRaw('TIMESTAMPDIFF(MINUTE, in_time, out_time) < 60')
                ->update([
                    'out_time' => null,
                    'updated_at' => now(),
                ]);
        }

        // 3. Clean up student_attendance
        if (Schema::hasTable('student_attendance')) {
            DB::table('student_attendance')
                ->whereNotNull('in_time')
                ->whereNotNull('out_time')
                ->whereRaw('TIMESTAMPDIFF(MINUTE, in_time, out_time) < 60')
                ->update([
                    'out_time' => null,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // Cleanup migration is irreversible as previously corrupted data had out_time == in_time
    }
};
