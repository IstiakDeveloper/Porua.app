<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $assetIds = DB::table('fixed_asset_items')
            ->select('fixed_asset_id')
            ->groupBy('fixed_asset_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('fixed_asset_id');

        foreach ($assetIds as $assetId) {
            $asset = DB::table('fixed_assets')->where('id', $assetId)->first();
            if (!$asset) {
                continue;
            }

            $items = DB::table('fixed_asset_items')->where('fixed_asset_id', $assetId)->get();
            $totalQty = $items->sum('quantity');
            $totalAmount = $items->sum('amount');
            $keepId = $items->first()->id;

            DB::table('fixed_asset_items')->where('id', $keepId)->update([
                'item_name' => $asset->asset_name,
                'quantity' => $totalQty,
                'amount' => $totalAmount,
                'unit_price' => $totalQty > 0 ? round($totalAmount / $totalQty, 2) : 0,
                'updated_at' => now(),
            ]);

            DB::table('fixed_asset_items')
                ->where('fixed_asset_id', $assetId)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        // Sync item_name with asset_name
        foreach (DB::table('fixed_assets')->get(['id', 'asset_name']) as $asset) {
            DB::table('fixed_asset_items')
                ->where('fixed_asset_id', $asset->id)
                ->update(['item_name' => $asset->asset_name, 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Cannot reliably split merged items
    }
};
