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
        Schema::create('provident_fund_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('salary_payment_id')->constrained('salary_payments')->onDelete('cascade');
            $table->decimal('employee_contribution', 10, 2)->comment('5% from employee salary');
            $table->decimal('employer_contribution', 10, 2)->comment('5% from employer');
            $table->decimal('total_contribution', 10, 2)->comment('Total = employee + employer');
            $table->date('transaction_date');
            $table->timestamps();

            $table->index('staff_id');
            $table->index('transaction_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provident_fund_transactions');
    }
};
