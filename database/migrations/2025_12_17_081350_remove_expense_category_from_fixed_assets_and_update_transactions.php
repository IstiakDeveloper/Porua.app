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
        // Remove expense_category_id from fixed_assets
        Schema::table('fixed_assets', function (Blueprint $table) {
            $table->dropForeign(['expense_category_id']);
            $table->dropColumn('expense_category_id');
        });

        // Update transactions table to add asset_purchase type
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('income', 'expense', 'transfer', 'asset_purchase') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back expense_category_id to fixed_assets
        Schema::table('fixed_assets', function (Blueprint $table) {
            $table->foreignId('expense_category_id')->nullable()->after('account_id')->constrained('expense_categories')->onDelete('set null');
        });

        // Revert transactions table type enum
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('income', 'expense', 'transfer') NOT NULL");
    }
};
