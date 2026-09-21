<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('payout_voucher_no')->unique();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()->constrained('batches')->nullOnDelete();
            $table->unsignedSmallInteger('period_month');
            $table->unsignedSmallInteger('period_year');
            $table->decimal('total_batch_collection', 10, 2)->default(0.00);
            $table->string('remuneration_type')->default('percentage'); // percentage / per_class / fixed
            $table->decimal('commission_rate', 10, 2)->default(0.00);
            $table->decimal('calculated_amount', 10, 2)->default(0.00);
            $table->decimal('bonus_amount', 10, 2)->default(0.00);
            $table->decimal('deduction_amount', 10, 2)->default(0.00);
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->date('payout_date');
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('payment_method')->default('cash');
            $table->foreignId('accounting_transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->enum('status', ['paid', 'draft', 'cancelled'])->default('paid');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_payouts');
    }
};
