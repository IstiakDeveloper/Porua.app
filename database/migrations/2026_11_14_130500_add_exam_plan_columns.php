<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->string('exam_kind')->default('semester')->after('exam_type');
            $table->unsignedTinyInteger('term_number')->nullable()->after('exam_kind');
            $table->boolean('marks_locked')->default(false)->after('is_published');
            $table->unsignedTinyInteger('min_attendance_percent')->nullable()->after('marks_locked');
            $table->index('exam_kind');
        });

        DB::table('exams')->where('exam_type', 'final')->update([
            'exam_kind' => 'annual',
            'term_number' => null,
            'min_attendance_percent' => 75,
        ]);
        DB::table('exams')->where('exam_type', 'first_term')->update([
            'exam_kind' => 'semester',
            'term_number' => 1,
        ]);
        DB::table('exams')->where('exam_type', 'mid_term')->update([
            'exam_kind' => 'semester',
            'term_number' => 2,
        ]);
        DB::table('exams')->where('exam_type', 'test')->update([
            'exam_kind' => 'class_test',
            'term_number' => null,
        ]);

        Schema::table('marks', function (Blueprint $table) {
            $table->boolean('recheck_open')->default(false)->after('verified_at');
        });

        Schema::create('mark_rechecks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason');
            $table->string('status')->default('pending');
            $table->text('review_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['exam_id', 'student_id', 'status']);
        });

        Schema::create('mark_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mark_id')->nullable()->constrained('marks')->nullOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->timestamps();

            $table->index(['exam_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mark_audits');
        Schema::dropIfExists('mark_rechecks');

        Schema::table('marks', function (Blueprint $table) {
            $table->dropColumn('recheck_open');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['exam_kind']);
            $table->dropColumn(['exam_kind', 'term_number', 'marks_locked', 'min_attendance_percent']);
        });
    }
};
