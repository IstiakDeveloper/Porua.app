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
        Schema::create('pf_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('teachers')->onDelete('cascade');
            $table->decimal('employee_contribution', 10, 2)->comment('Total employee PF withdrawn');
            $table->decimal('employer_contribution', 10, 2)->comment('Total employer PF withdrawn');
            $table->decimal('total_amount', 10, 2)->comment('Total withdrawal amount');
            $table->date('withdrawal_date');
            $table->string('reason')->comment('Reason for withdrawal (resignation, retirement, etc.)');
            $table->text('remarks')->nullable();
            $table->foreignId('approved_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pf_withdrawals');
    }
};
