<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LogoutAllUsers extends Command
{
    protected $signature = 'users:logout-all {--force}';

    protected $description = 'Logout all users from all devices';

    public function handle(): int
    {
        if (! $this->option('force')) {
            $sessionCount = DB::table('sessions')->count();
            $this->info("Total sessions to delete: {$sessionCount}");

            if (! $this->confirm('Are you sure you want to logout all users?')) {
                $this->info('Operation cancelled.');

                return self::FAILURE;
            }
        }

        $deletedCount = DB::table('sessions')->delete();

        logActivity('logout_all', "All {$deletedCount} users logged out from all devices");

        $this->info("✓ Successfully logged out all users! ({$deletedCount} sessions deleted)");

        return self::SUCCESS;
    }
}
