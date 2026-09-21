<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('receipt_sequences')) {
            Schema::create('receipt_sequences', function (Blueprint $table) {
                $table->id();
                $table->string('date_prefix', 20)->unique();
                $table->unsignedInteger('last_number')->default(0);
                $table->timestamps();
            });
        }

        $maxSuffix = (int) (DB::table('fee_collections')
            ->where('receipt_number', 'like', 'RCP-%')
            ->max(DB::raw('CAST(RIGHT(receipt_number, 4) AS UNSIGNED)')) ?? 0);

        $distinct = (int) DB::table('fee_collections')
            ->where('receipt_number', 'like', 'RCP-%')
            ->distinct()
            ->count('receipt_number');

        $last = max($maxSuffix, $distinct);

        DB::table('receipt_sequences')->updateOrInsert(
            ['date_prefix' => 'RCP'],
            [
                'last_number' => $last,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        if (Schema::hasTable('receipt_sequences')) {
            DB::table('receipt_sequences')->where('date_prefix', 'RCP')->delete();
        }
    }
};
