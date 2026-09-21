<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_collections', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('accounting_transaction_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->integer('month')->nullable();
            $table->integer('year')->nullable();
            $table->decimal('amount', 10, 2);
            $table->decimal('late_fee', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('paid_amount', 10, 2);
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'mobile_banking', 'online'])->default('cash');
            $table->string('transaction_id')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['paid', 'partial', 'pending', 'overdue', 'cancelled'])->default('pending');
            $table->foreignId('collected_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->index('receipt_number');
            $table->index(['student_id', 'academic_year_id']);
            $table->index(['year', 'month']);
            $table->index('payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_collections');
    }
};
