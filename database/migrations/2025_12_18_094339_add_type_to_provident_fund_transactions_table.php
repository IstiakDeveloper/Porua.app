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
        Schema::table('provident_fund_transactions', function (Blueprint $table) {
            $table->enum('type', ['contribution', 'opening', 'withdrawal'])->default('contribution')->after('staff_id');
            $table->foreignId('salary_payment_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('provident_fund_transactions', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
