<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE fee_collections MODIFY COLUMN status ENUM('paid','partial','pending','overdue','cancelled') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE fee_collections MODIFY COLUMN status ENUM('paid','partial','pending','cancelled') NOT NULL DEFAULT 'paid'");
    }
};
