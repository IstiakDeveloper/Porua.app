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
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('religion', 50)->nullable()->after('blood_group');
            $table->string('nationality', 100)->nullable()->after('religion');
            $table->string('designation')->nullable()->after('nationality');
            $table->string('department')->nullable()->after('designation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['religion', 'nationality', 'designation', 'department']);
        });
    }
};
