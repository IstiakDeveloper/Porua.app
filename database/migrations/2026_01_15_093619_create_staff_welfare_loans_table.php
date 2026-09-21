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
        Schema::create('staff_welfare_loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_number')->unique();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('accounts')->onDelete('cascade');
            $table->decimal('loan_amount', 15, 2);
            $table->decimal('total_paid', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2);
            $table->integer('installment_count');
            $table->integer('paid_installments')->default(0);
            $table->decimal('installment_amount', 15, 2);
            $table->date('loan_date');
            $table->date('first_installment_date');
            $table->enum('status', ['active', 'paid', 'cancelled'])->default('active');
            $table->text('purpose')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('approved_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('teacher_id');
            $table->index('loan_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_welfare_loans');
    }
};
