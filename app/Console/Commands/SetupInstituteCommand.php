<?php

namespace App\Console\Commands;

use App\Models\AcademicYear;
use App\Models\Account;
use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SetupInstituteCommand extends Command
{
    protected $signature = 'institute:setup
                            {--name= : Name of the school or coaching center}
                            {--type= : Type: school, coaching, or hybrid}
                            {--phone= : Primary contact number}
                            {--address= : Physical campus address}
                            {--currency=৳ : Currency symbol (e.g. ৳ or $)}
                            {--session= : Academic session/year (e.g. 2026-2027)}';

    protected $description = 'Quickly configure institution identity, operating mode, and defaults for a new client instance';

    public function handle()
    {
        $this->info('====================================================');
        $this->info('  🚀 Porua.app Multi-Institute Quick Setup Engine   ');
        $this->info('====================================================');

        $name = $this->option('name') ?: $this->ask('Enter Institution Name', 'Mousumi Bidyaniketon');
        $type = $this->option('type') ?: $this->choice('Select Operating Mode', ['school', 'coaching', 'hybrid'], 0);
        $phone = $this->option('phone') ?: $this->ask('Contact Phone Number', '01700000000');
        $address = $this->option('address') ?: $this->ask('Campus Address', 'Dhaka, Bangladesh');
        $currency = $this->option('currency') ?: '৳';
        $session = $this->option('session') ?: date('Y') . '-' . (date('Y') + 1);

        $this->line('');
        $this->info("Configuring institution: <comment>{$name}</comment> (<fg=yellow>{$type}</>)");

        // 1. Settings
        Setting::set('school_name', $name);
        Setting::set('institute_name', $name);
        Setting::set('institute_type', $type);
        Setting::set('school_phone', $phone);
        Setting::set('school_address', $address);
        Setting::set('currency_symbol', $currency);
        Setting::set('invoice_footer_text', "Thank you for choosing {$name}. Please preserve this receipt.");

        // 2. Academic Session
        $year = AcademicYear::firstOrCreate(
            ['name' => $session],
            [
                'start_date' => date('Y-01-01'),
                'end_date' => date('Y-12-31'),
                'is_current' => true,
                'status' => 'active',
            ]
        );
        AcademicYear::where('id', '!=', $year->id)->update(['is_current' => false]);

        // 3. Primary Operating Account
        Account::firstOrCreate(
            ['account_number' => 'CASH-001'],
            [
                'account_name' => 'Main Cash Counter',
                'account_type' => 'cash',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'status' => 'active',
                'description' => 'Primary Cash Counter created via CLI setup',
            ]
        );

        // 4. Invalidate Cache
        Cache::forget('global_institute_settings');

        $this->line('');
        $this->info('✅ Setup completed successfully!');
        $this->table(
            ['Setting Key', 'Configured Value'],
            [
                ['Institute Name', $name],
                ['Operating Mode', strtoupper($type)],
                ['Phone', $phone],
                ['Address', $address],
                ['Currency', $currency],
                ['Current Session', $session],
                ['Primary Account', 'Main Cash Counter'],
            ]
        );

        $this->info("You can now browse the dashboard at your local or hosted domain.");
        return Command::SUCCESS;
    }
}
