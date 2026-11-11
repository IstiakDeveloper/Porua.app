<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateUsernamesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:generate-usernames {--force : Overwrite existing usernames if requested}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate unique usernames for all users who do not currently have one';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = $this->option('force');

        $query = User::with(['roles', 'student', 'teacher', 'staff', 'studentParent']);
        if (! $force) {
            $query->whereNull('username')->orWhere('username', '');
        }

        $users = $query->get();
        $total = $users->count();

        if ($total === 0) {
            $this->info('All users already have a username assigned!');

            return Command::SUCCESS;
        }

        $this->info("Found {$total} users needing a username. Generating now...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $updatedCount = 0;

        foreach ($users as $user) {
            $candidate = null;
            $roleSlug = $user->roles->first()?->slug ?? 'user';

            // 1. Super Admin default
            if ($user->id === 1 || in_array($roleSlug, ['super-admin', 'super_admin'])) {
                $candidate = 'admin';
            }
            // 2. Student with admission number
            elseif ($user->student && ! empty($user->student->admission_number)) {
                $candidate = trim($user->student->admission_number);
            }
            // 3. User with mobile phone number (digits)
            elseif (! empty($user->phone)) {
                $digits = preg_replace('/[^0-9]/', '', $user->phone);
                if (strlen($digits) >= 10 && strlen($digits) <= 15) {
                    $candidate = $digits;
                }
            }
            // 4. Email prefix if email exists
            if (empty($candidate) && ! empty($user->email)) {
                $prefix = explode('@', $user->email)[0];
                $cleanPrefix = strtolower(preg_replace('/[^a-zA-Z0-9_.-]/', '', $prefix));
                if (strlen($cleanPrefix) >= 3) {
                    $candidate = $cleanPrefix;
                }
            }
            // 5. User name
            if (empty($candidate) && ! empty($user->name)) {
                $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', str_replace([' ', '-', '.'], '_', trim($user->name))));
                $cleanName = trim(preg_replace('/_+/', '_', $cleanName), '_');
                if (strlen($cleanName) >= 3) {
                    $candidate = substr($cleanName, 0, 30);
                }
            }
            // 6. Fallback
            if (empty($candidate)) {
                $candidate = 'user_'.$user->id;
            }

            // Ensure uniqueness
            $base = $candidate;
            $counter = 1;
            while (User::where('username', $candidate)->where('id', '!=', $user->id)->exists()) {
                $candidate = substr($base, 0, 40).'_'.$counter++;
            }

            // Save without triggering events that alter tokens
            DB::table('users')->where('id', $user->id)->update([
                'username' => $candidate,
            ]);

            $updatedCount++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully generated and assigned usernames to {$updatedCount} users!");

        return Command::SUCCESS;
    }
}
