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
        Schema::create('other_staff_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('other_staff_id')->constrained('other_staff')->onDelete('cascade');
            $table->string('employee_id')->index();
            $table->date('date')->index();
            $table->dateTime('in_time')->nullable();
            $table->dateTime('out_time')->nullable();
            $table->string('status')->default('present'); // present, late, early_leave, absent, weekend, holiday
            $table->dateTime('punch_time')->nullable();
            $table->integer('punch_state')->default(0);
            $table->string('punch_type')->default('fingerprint');
            $table->string('device_sn')->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['other_staff_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('other_staff_attendances');
    }
};
