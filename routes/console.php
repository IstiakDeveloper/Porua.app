<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-generate monthly fee records on the 1st of each month
Schedule::command('fees:generate-monthly')->monthlyOn(1, '00:05');

// Daily: mark overdue any pending fees whose due date has passed
Schedule::command('fees:update-overdue')->dailyAt('00:10');
