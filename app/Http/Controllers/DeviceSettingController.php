<?php

namespace App\Http\Controllers;

use App\Models\DeviceSetting;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeviceSettingController extends Controller
{
    /**
     * Display device settings page
     */
    public function index()
    {
        $settings = DeviceSetting::current();

        // Format time fields to H:i for frontend
        $settings->teacher_in_time = substr($settings->teacher_in_time, 0, 5);
        $settings->teacher_out_time = substr($settings->teacher_out_time, 0, 5);
        $settings->teacher_late_time = substr($settings->teacher_late_time ?? '08:30:00', 0, 5);
        $settings->student_in_time = substr($settings->student_in_time, 0, 5);
        $settings->student_late_time = substr($settings->student_late_time ?? '09:00:00', 0, 5);

        // Convert device_port to string
        $settings->device_port = (string) $settings->device_port;

        // Ensure weekend_days is an array of strings
        if (is_string($settings->weekend_days)) {
            $settings->weekend_days = json_decode($settings->weekend_days, true);
        }
        $settings->weekend_days = array_map('strval', $settings->weekend_days ?? ['5', '6']);

        $holidays = Holiday::active()
            ->orderBy('date')
            ->get();

        return Inertia::render('Settings/DeviceSettings', [
            'settings' => $settings,
            'holidays' => $holidays,
        ]);
    }

    /**
     * Update device settings
     */
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
            'device_name' => 'required|string|max:255',
            'device_ip' => 'required|ip',
            'device_port' => 'required',

            'teacher_in_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'teacher_out_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'teacher_late_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],

            'student_in_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'student_out_time' => ['nullable', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'student_late_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],

            'weekend_days' => 'nullable|array',
            'weekend_days.*' => 'string',

            'auto_mark_present' => 'boolean',
            'auto_mark_absent' => 'boolean',
            'auto_mark_late' => 'boolean',
            'auto_mark_early_leave' => 'boolean',

            'sms_on_present' => 'boolean',
            'sms_on_absent' => 'boolean',
            'sms_on_late' => 'boolean',
            'sms_on_early_leave' => 'boolean',

            'auto_sync_enabled' => 'boolean',
            'sync_interval_minutes' => 'nullable|integer|min:5|max:1440',
        ]);

        // Normalize time format to H:i:s for database
        foreach (['teacher_in_time', 'teacher_out_time', 'teacher_late_time', 'student_in_time', 'student_out_time', 'student_late_time'] as $field) {
            if (isset($validated[$field]) && strlen($validated[$field]) == 5) {
                $validated[$field] = $validated[$field] . ':00';
            }
        }

        // Convert device_port to integer for database
        if (isset($validated['device_port'])) {
            $validated['device_port'] = (int) $validated['device_port'];
        }

        $settings = DeviceSetting::current();
        $updated = $settings->update($validated);

        if ($updated) {
            return back()->with('success', 'Device settings updated successfully!');
        } else {
            return back()->with('error', 'Failed to update settings');
        }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }

    /**
     * Update device info only
     */
    public function updateDevice(Request $request)
    {
        $validated = $request->validate([
            'device_name' => 'required|string|max:255',
            'device_ip' => 'required|ip',
            'device_port' => 'required',
        ]);

        $validated['device_port'] = (int) $validated['device_port'];

        $settings = DeviceSetting::current();
        $settings->update($validated);

        return back()->with('success', 'Device info updated successfully!');
    }

    /**
     * Update teacher rules only
     */
    public function updateTeacher(Request $request)
    {
        $validated = $request->validate([
            'teacher_in_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'teacher_out_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'teacher_late_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
        ]);

        // Normalize time format
        foreach ($validated as $field => $value) {
            if (strlen($value) == 5) {
                $validated[$field] = $value . ':00';
            }
        }

        $settings = DeviceSetting::current();
        $settings->update($validated);

        return back()->with('success', 'Teacher rules updated successfully!');
    }

    /**
     * Update student rules only
     */
    public function updateStudent(Request $request)
    {
        $validated = $request->validate([
            'student_in_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'student_late_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
        ]);

        // Normalize time format
        foreach ($validated as $field => $value) {
            if (strlen($value) == 5) {
                $validated[$field] = $value . ':00';
            }
        }

        $settings = DeviceSetting::current();
        $settings->update($validated);

        return back()->with('success', 'Student rules updated successfully!');
    }

    /**
     * Update weekend days only
     */
    public function updateWeekend(Request $request)
    {
        $validated = $request->validate([
            'weekend_days' => 'required|array',
            'weekend_days.*' => 'string',
        ]);

        $settings = DeviceSetting::current();
        $settings->update($validated);

        return back()->with('success', 'Weekend days updated successfully!');
    }

    /**
     * Update automation settings only
     */
    public function updateAutomation(Request $request)
    {
        $validated = $request->validate([
            'auto_mark_present' => 'boolean',
            'auto_mark_absent' => 'boolean',
            'auto_mark_late' => 'boolean',
            'auto_mark_early_leave' => 'boolean',
            'sms_on_present' => 'boolean',
            'sms_on_absent' => 'boolean',
            'sms_on_late' => 'boolean',
            'sms_on_early_leave' => 'boolean',
            'auto_sync_enabled' => 'boolean',
            'sync_interval_minutes' => 'nullable|integer|min:5|max:1440',
        ]);

        $settings = DeviceSetting::current();
        $settings->update($validated);

        return back()->with('success', 'Automation settings updated successfully!');
    }

    /**
     * Test device connection
     */
    public function testConnection()
    {
        $settings = DeviceSetting::current();

        // Simple ping test
        $host = $settings->device_ip;
        $port = $settings->device_port;

        $connection = @fsockopen($host, $port, $errno, $errstr, 2);

        if ($connection) {
            fclose($connection);

            return response()->json([
                'success' => true,
                'message' => 'Device is reachable!',
                'device' => [
                    'ip' => $host,
                    'port' => $port,
                    'name' => $settings->device_name,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Cannot reach device at {$host}:{$port}",
            'error' => $errstr
        ], 500);
    }

    /**
     * Get device status and last sync info
     */
    public function getStatus()
    {
        $settings = DeviceSetting::current();

        return response()->json([
            'success' => true,
            'data' => [
                'device_name' => $settings->device_name,
                'device_ip' => $settings->device_ip,
                'device_port' => $settings->device_port,
                'device_status' => $settings->device_status,
                'last_sync_at' => $settings->last_sync_at,
                'last_sync_status' => $settings->last_sync_status,
                'last_sync_message' => $settings->last_sync_message,
                'last_sync_records' => $settings->last_sync_records,
                'last_sync_formatted' => $settings->getLastSyncFormatted(),
            ]
        ]);
    }

    /**
     * Store a new holiday
     */
    public function storeHoliday(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|in:public,optional,school',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $holiday = Holiday::create($validated);

        return back()->with('success', 'Holiday added successfully!');
    }

    /**
     * Update a holiday
     */
    public function updateHoliday(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|in:public,optional,school',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $holiday->update($validated);

        return back()->with('success', 'Holiday updated successfully!');
    }

    /**
     * Delete a holiday
     */
    public function destroyHoliday(Holiday $holiday)
    {
        $holiday->delete();

        return back()->with('success', 'Holiday deleted successfully!');
    }

    /**
     * Get all holidays (API)
     */
    public function getHolidays()
    {
        $holidays = Holiday::active()
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $holidays->count(),
            'data' => $holidays
        ]);
    }

    /**
     * Check if a date is working day
     */
    public function checkWorkingDay(Request $request)
    {
        $date = $request->input('date');
        $settings = DeviceSetting::current();

        $isWeekend = $settings->isWeekend($date);
        $isHoliday = $settings->isHoliday($date);
        $isWorkingDay = $settings->isWorkingDay($date);

        $holiday = null;
        if ($isHoliday) {
            $holiday = Holiday::getHoliday($date);
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'is_weekend' => $isWeekend,
            'is_holiday' => $isHoliday,
            'is_working_day' => $isWorkingDay,
            'holiday' => $holiday,
        ]);
    }
}
