<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->string('roll_number')->nullable();
            $table->enum('status', ['enrolled', 'promoted', 'detained', 'passed_out'])->default('enrolled');
            $table->timestamps();

            $table->unique(['student_id', 'academic_year_id'], 'student_sessions_student_year_unique');
            $table->index(['academic_year_id', 'class_id', 'section_id'], 'student_sessions_placement_idx');
        });

        Schema::table('student_promotions', function (Blueprint $table) {
            $table->string('from_roll')->nullable()->after('promotion_date');
            $table->string('to_roll')->nullable()->after('from_roll');
            $table->foreignId('to_class_id')->nullable()->change();
        });

        $duplicateIds = DB::table('student_promotions as older')
            ->join('student_promotions as newer', function ($join) {
                $join->on('older.student_id', '=', 'newer.student_id')
                    ->on('older.from_academic_year_id', '=', 'newer.from_academic_year_id')
                    ->on('older.id', '<', 'newer.id');
            })
            ->pluck('older.id');

        if ($duplicateIds->isNotEmpty()) {
            DB::table('student_promotions')->whereIn('id', $duplicateIds)->delete();
        }

        Schema::table('student_promotions', function (Blueprint $table) {
            $table->unique(['student_id', 'from_academic_year_id'], 'student_promotions_student_year_unique');
        });

        $this->backfillSessions();
    }

    public function down(): void
    {
        Schema::table('student_promotions', function (Blueprint $table) {
            $table->dropUnique('student_promotions_student_year_unique');
            $table->dropColumn(['from_roll', 'to_roll']);
        });

        Schema::dropIfExists('student_sessions');
    }

    private function backfillSessions(): void
    {
        $now = now();
        $students = DB::table('students')->get()->keyBy('id');

        $promotions = DB::table('student_promotions')
            ->orderBy('promotion_date')
            ->orderBy('id')
            ->get();

        foreach ($promotions as $promotion) {
            $student = $students->get($promotion->student_id);
            $fromIsCurrent = $student && (int) $student->academic_year_id === (int) $promotion->from_academic_year_id;

            $fromSession = DB::table('student_sessions')
                ->where('student_id', $promotion->student_id)
                ->where('academic_year_id', $promotion->from_academic_year_id)
                ->first();

            if (! $fromSession) {
                DB::table('student_sessions')->insert([
                    'student_id' => $promotion->student_id,
                    'academic_year_id' => $promotion->from_academic_year_id,
                    'class_id' => $promotion->from_class_id,
                    'section_id' => $promotion->from_section_id,
                    'roll_number' => null,
                    'status' => $promotion->status,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } elseif (! $fromIsCurrent) {
                DB::table('student_sessions')->where('id', $fromSession->id)->update([
                    'class_id' => $promotion->from_class_id,
                    'section_id' => $promotion->from_section_id,
                    'status' => $promotion->status,
                    'updated_at' => $now,
                ]);
            }

            if (! in_array($promotion->status, ['promoted', 'detained'], true) || ! $promotion->to_class_id) {
                continue;
            }

            $toExists = DB::table('student_sessions')
                ->where('student_id', $promotion->student_id)
                ->where('academic_year_id', $promotion->to_academic_year_id)
                ->exists();

            if ($toExists) {
                continue;
            }

            DB::table('student_sessions')->insert([
                'student_id' => $promotion->student_id,
                'academic_year_id' => $promotion->to_academic_year_id,
                'class_id' => $promotion->to_class_id,
                'section_id' => $promotion->to_section_id,
                'roll_number' => null,
                'status' => 'enrolled',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        foreach ($students as $student) {
            if (! $student->academic_year_id || ! $student->class_id) {
                continue;
            }

            $status = $student->status === 'passed' ? 'passed_out' : 'enrolled';
            $keys = [
                'student_id' => $student->id,
                'academic_year_id' => $student->academic_year_id,
            ];
            $values = [
                'class_id' => $student->class_id,
                'section_id' => $student->section_id,
                'roll_number' => $student->roll_number,
                'status' => $status,
                'updated_at' => $now,
            ];

            $exists = DB::table('student_sessions')->where($keys)->exists();
            if ($exists) {
                DB::table('student_sessions')->where($keys)->update($values);
            } else {
                DB::table('student_sessions')->insert($keys + $values + ['created_at' => $now]);
            }
        }
    }
};
