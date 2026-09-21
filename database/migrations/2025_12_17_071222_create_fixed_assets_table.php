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
        Schema::create('fixed_assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_name');
            $table->string('asset_code')->unique();
            $table->string('category');
            $table->decimal('purchase_price', 15, 2);
            $table->date('purchase_date');
            $table->decimal('depreciation_rate', 5, 2)->default(0);
            $table->decimal('current_value', 15, 2);
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'disposed', 'damaged'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixed_assets');
    }
};
