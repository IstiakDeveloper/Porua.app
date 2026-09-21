<?php

use App\Models\FixedAsset;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fixed_asset_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixed_asset_id')->constrained()->cascadeOnDelete();
            $table->string('item_name');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Backfill existing assets with a single item from their purchase price
        FixedAsset::withTrashed()->chunkById(100, function ($assets) {
            foreach ($assets as $asset) {
                DB::table('fixed_asset_items')->insert([
                    'fixed_asset_id' => $asset->id,
                    'item_name' => $asset->asset_name,
                    'quantity' => 1,
                    'unit_price' => $asset->purchase_price,
                    'amount' => $asset->purchase_price,
                    'description' => null,
                    'created_at' => $asset->created_at,
                    'updated_at' => $asset->updated_at,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_asset_items');
    }
};
