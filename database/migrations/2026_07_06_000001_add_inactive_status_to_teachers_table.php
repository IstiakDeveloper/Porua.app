<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE teachers MODIFY COLUMN status ENUM('active', 'inactive', 'resigned', 'terminated', 'retired') NOT NULL DEFAULT 'active'");

        DB::table('teachers')
            ->where('status', 'terminated')
            ->update(['status' => 'inactive']);
    }

    public function down(): void
    {
        DB::table('teachers')
            ->where('status', 'inactive')
            ->update(['status' => 'terminated']);

        DB::statement("ALTER TABLE teachers MODIFY COLUMN status ENUM('active', 'resigned', 'terminated', 'retired') NOT NULL DEFAULT 'active'");
    }
};
