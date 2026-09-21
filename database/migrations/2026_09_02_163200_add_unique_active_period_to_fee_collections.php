<?php

use App\Models\FeeCollection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        FeeCollection::cancelAllUnpaidPeriodDuplicates();

        Schema::table('fee_collections', function (Blueprint $table) {
            $table->string('active_period_key', 80)
                ->nullable()
                ->virtualAs("CASE WHEN `deleted_at` IS NULL AND `status` IN ('pending','partial','overdue') THEN CONCAT(`student_id`, '-', `fee_type_id`, '-', IFNULL(`month`, 0), '-', IFNULL(`year`, 0)) ELSE NULL END");
            $table->unique('active_period_key', 'fee_collections_active_period_unique');
        });
    }

    public function down(): void
    {
        Schema::table('fee_collections', function (Blueprint $table) {
            $table->dropUnique('fee_collections_active_period_unique');
            $table->dropColumn('active_period_key');
        });
    }
};
