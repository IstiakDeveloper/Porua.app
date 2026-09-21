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
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('teachers')->onDelete('cascade');
            $table->tinyInteger('month')->comment('1-12');
            $table->year('year');
            $table->decimal('base_salary', 10, 2)->comment('Original salary amount');
            $table->decimal('provident_fund_deduction', 10, 2)->default(0)->comment('5% employee contribution');
            $table->decimal('employer_pf_contribution', 10, 2)->default(0)->comment('5% employer contribution');
            $table->decimal('net_salary', 10, 2)->comment('Amount paid to employee (base - PF deduction)');
            $table->decimal('total_amount', 10, 2)->comment('Total deducted from account (base + employer PF)');
            $table->date('payment_date');
            $table->foreignId('account_id')->constrained('accounts')->onDelete('restrict');
            $table->string('payment_method')->default('cash'); // cash, bank_transfer, cheque
            $table->string('reference_number')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            // Prevent duplicate salary payment for same month/year
            $table->unique(['staff_id', 'month', 'year'], 'unique_staff_month_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_payments');
    }
};
