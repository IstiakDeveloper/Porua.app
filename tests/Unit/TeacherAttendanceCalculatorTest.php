<?php

use App\Support\TeacherAttendanceCalculator;
use Carbon\Carbon;

uses(Tests\TestCase::class);

test('weekend uses carbon day of week friday saturday', function () {
    expect(TeacherAttendanceCalculator::isWeekend('2026-09-04', [5, 6]))->toBeTrue() // Friday
        ->and(TeacherAttendanceCalculator::isWeekend('2026-09-05', [5, 6]))->toBeTrue() // Saturday
        ->and(TeacherAttendanceCalculator::isWeekend('2026-09-03', [5, 6]))->toBeFalse(); // Thursday
});

test('future dates without a record stay blank', function () {
    $status = TeacherAttendanceCalculator::determineStatus(
        now()->addDay()->toDateString(),
        null,
        null,
        [5, 6],
        [],
        true
    );

    expect($status)->toBeNull();
});

test('past dates without a record are absent', function () {
    $status = TeacherAttendanceCalculator::determineStatus(
        '2026-09-01',
        null,
        null,
        [5, 6],
        [],
        false
    );

    expect($status)->toBe('absent');
});

test('holiday map wins when there is no punch', function () {
    $status = TeacherAttendanceCalculator::determineStatus(
        '2026-12-16',
        null,
        null,
        [5, 6],
        ['2026-12-16' => 'Victory Day'],
        false
    );

    expect($status)->toBe('holiday');
});

test('status codes match the monthly grid legend', function () {
    expect(TeacherAttendanceCalculator::statusCode('present'))->toBe('P')
        ->and(TeacherAttendanceCalculator::statusCode('early_leave'))->toBe('EL')
        ->and(TeacherAttendanceCalculator::statusCode('half_day'))->toBe('HD')
        ->and(TeacherAttendanceCalculator::statusCode('leave'))->toBe('LV')
        ->and(TeacherAttendanceCalculator::statusCode(null))->toBe('-');
});

test('working hours formats a punch pair', function () {
    expect(TeacherAttendanceCalculator::workingHours(
        Carbon::parse('2026-09-02 09:00:00'),
        Carbon::parse('2026-09-02 16:30:00')
    ))->toBe('7h 30m');
});

test('resolveDay treats out_time within 60 minutes of in_time as null', function () {
    $record = new \App\Models\TeacherAttendance([
        'in_time' => Carbon::parse('2026-09-02 08:30:00'),
        'out_time' => Carbon::parse('2026-09-02 08:45:00'),
        'status' => 'present',
    ]);

    $settings = new \App\Models\DeviceSetting([
        'teacher_in_time' => '08:00',
        'teacher_out_time' => '16:00',
        'teacher_late_time' => '08:45',
        'auto_mark_early_leave' => true,
        'auto_mark_late' => true,
    ]);

    $resolved = TeacherAttendanceCalculator::resolveDay(
        '2026-09-02',
        $record,
        $settings,
        [5, 6],
        []
    );

    expect($resolved['out_time'])->toBeNull()
        ->and($resolved['out_time_formatted'])->toBeNull()
        ->and($resolved['missing_checkout'])->toBeTrue()
        ->and($resolved['hours'])->toBeNull()
        ->and($resolved['status'])->toBe('present'); // Not early_leave!
});

test('resolveDay accepts valid out_time after 60 minutes', function () {
    $record = new \App\Models\TeacherAttendance([
        'in_time' => Carbon::parse('2026-09-02 08:30:00'),
        'out_time' => Carbon::parse('2026-09-02 16:30:00'),
        'status' => 'present',
    ]);

    $settings = new \App\Models\DeviceSetting([
        'teacher_in_time' => '08:00',
        'teacher_out_time' => '16:00',
        'teacher_late_time' => '08:45',
        'auto_mark_early_leave' => true,
        'auto_mark_late' => true,
    ]);

    $resolved = TeacherAttendanceCalculator::resolveDay(
        '2026-09-02',
        $record,
        $settings,
        [5, 6],
        []
    );

    expect($resolved['out_time'])->not->toBeNull()
        ->and($resolved['out_time_formatted'])->toBe('4:30 PM')
        ->and($resolved['missing_checkout'])->toBeFalse()
        ->and($resolved['hours'])->toBe('8h 0m')
        ->and($resolved['status'])->toBe('present');
});

