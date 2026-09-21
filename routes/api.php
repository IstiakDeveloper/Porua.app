<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ZktecoController;
use App\Http\Controllers\DeviceSettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ZKTeco Device API Routes
Route::prefix('zkteco')->group(function () {
    Route::get('/teachers', [ZktecoController::class, 'getTeachers']);
    Route::get('/students', [ZktecoController::class, 'getStudents']);
    Route::get('/other-staff', [ZktecoController::class, 'getOtherStaff']);

    // Main sync endpoint (used by ZKTeco Agent)
    Route::post('/sync', [ZktecoController::class, 'syncAttendance']);

    // Old format (batch with type)
    Route::post('/attendance/store', [ZktecoController::class, 'storeAttendance']);

    // New format (separate endpoints)
    Route::post('/attendance/teacher', [ZktecoController::class, 'storeTeacherAttendance']);
    Route::post('/attendance/student', [ZktecoController::class, 'storeStudentAttendance']);

    // Device Status & Settings
    Route::get('/status', [DeviceSettingController::class, 'getStatus']);
    Route::get('/holidays', [DeviceSettingController::class, 'getHolidays']);
    Route::post('/check-working-day', [DeviceSettingController::class, 'checkWorkingDay']);
});
