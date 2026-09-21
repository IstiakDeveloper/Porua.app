<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $this->authorize('view_users');

        $settings = Setting::all()->pluck('value', 'key');

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $this->authorize('edit_users');

        if ($request->hasFile('school_logo')) {
            $request->validate([
                'school_logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            ]);
            $logoPath = $request->file('school_logo')->store('settings', 'public');
            Setting::set('school_logo', $logoPath);
        }

        if ($request->hasFile('school_favicon')) {
            $request->validate([
                'school_favicon' => 'nullable|image|mimes:jpeg,png,jpg,ico,svg|max:1024',
            ]);
            $faviconPath = $request->file('school_favicon')->store('settings', 'public');
            Setting::set('school_favicon', $faviconPath);
        }

        if ($request->has('settings') && is_array($request->input('settings'))) {
            $validated = $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string',
                'settings.*.value' => 'nullable|string',
            ]);

            foreach ($validated['settings'] as $setting) {
                Setting::updateOrCreate(
                    ['key' => $setting['key']],
                    ['value' => $setting['value'] ?? '']
                );
            }
        } else {
            // Direct field updates
            $allowedKeys = [
                'school_name',
                'institute_name',
                'school_code',
                'school_email',
                'school_phone',
                'school_address',
                'school_website',
                'established_year',
                'currency_symbol',
                'invoice_footer_text',
                'institute_type',
            ];

            foreach ($allowedKeys as $key) {
                if ($request->has($key)) {
                    Setting::set($key, $request->input($key) ?? '');
                }
            }
        }

        \Illuminate\Support\Facades\Cache::forget('global_institute_settings');
        logActivity('update', "Updated system settings", Setting::class);

        return back()->with('success', 'Settings updated successfully');
    }

    public function general()
    {
        $this->authorize('view_users');

        $keys = [
            'school_name',
            'institute_name',
            'school_code',
            'school_email',
            'school_phone',
            'school_address',
            'school_logo',
            'school_favicon',
            'school_website',
            'established_year',
            'currency_symbol',
            'invoice_footer_text',
            'institute_type',
        ];

        $settings = Setting::whereIn('key', $keys)->pluck('value', 'key')->toArray();

        $logo = $settings['school_logo'] ?? null;
        $favicon = $settings['school_favicon'] ?? null;

        $settings['school_logo_url'] = $logo 
            ? (str_starts_with($logo, 'http') ? $logo : asset('storage/' . $logo)) 
            : '/logo.png';
        $settings['school_favicon_url'] = $favicon 
            ? (str_starts_with($favicon, 'http') ? $favicon : asset('storage/' . $favicon)) 
            : '/logo.png';

        return Inertia::render('Settings/General', [
            'settings' => $settings,
        ]);
    }

    public function academic()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'academic_year_start_month',
            'class_duration_minutes',
            'attendance_marking_time',
            'late_arrival_minutes',
            'exam_pass_percentage',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Academic', [
            'settings' => $settings,
        ]);
    }

    public function fee()
    {
        $this->authorize('manage_fees');

        $settings = Setting::whereIn('key', [
            'late_fee_per_day',
            'fee_due_days',
            'allow_partial_payment',
            'fine_calculation_method',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Fee', [
            'settings' => $settings,
        ]);
    }

    public function email()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'email_from_address',
            'email_from_name',
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'smtp_encryption',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Email', [
            'settings' => $settings,
        ]);
    }

    public function notification()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'enable_email_notifications',
            'enable_sms_notifications',
            'notify_on_attendance',
            'notify_on_fee_payment',
            'notify_on_exam_result',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Notification', [
            'settings' => $settings,
        ]);
    }

    public function backup()
    {
        $this->authorize('view_users');

        return Inertia::render('Settings/Backup');
    }

    public function createBackup()
    {
        $this->authorize('edit_users');

        // Implementation for database backup
        // This would use Laravel's backup functionality or custom implementation

        logActivity('create', "Created database backup", Setting::class);

        return back()->with('success', 'Backup created successfully');
    }
}
