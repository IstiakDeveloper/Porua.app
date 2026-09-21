<?php

use App\Http\Controllers\Api\ZktecoController;
use App\Models\TeacherAttendance;
use Carbon\Carbon;

uses(Tests\TestCase::class);

function callPunchLogic(TeacherAttendance $att, string $timeStr): void
{
    $controller = new ZktecoController();
    $method = new ReflectionMethod($controller, 'applyPunchLogic');
    $method->setAccessible(true);
    $method->invoke($controller, $att, Carbon::parse($timeStr));
}

test('first punch sets in_time and leaves out_time as null', function () {
    $att = new TeacherAttendance();

    callPunchLogic($att, '2026-09-02 08:30:00');

    expect($att->in_time)->not->toBeNull()
        ->and(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:30:00')
        ->and($att->out_time)->toBeNull();
});

test('punches within 1 hour of in_time do not set or update out_time', function () {
    $att = new TeacherAttendance();

    // First punch: 08:30
    callPunchLogic($att, '2026-09-02 08:30:00');

    // Second punch: 08:45 (15 mins later)
    callPunchLogic($att, '2026-09-02 08:45:00');

    // Third punch: 09:20 (50 mins later)
    callPunchLogic($att, '2026-09-02 09:20:00');

    // Fourth punch: 09:29 (59 mins later)
    callPunchLogic($att, '2026-09-02 09:29:00');

    expect(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:30:00')
        ->and($att->out_time)->toBeNull();
});

test('punch at or after 60 minutes sets out_time and subsequent punch updates to latest', function () {
    $att = new TeacherAttendance();

    // In-time: 08:00
    callPunchLogic($att, '2026-09-02 08:00:00');

    // Out-time: 09:00 (exact 60 minutes later)
    callPunchLogic($att, '2026-09-02 09:00:00');

    expect(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:00:00')
        ->and($att->out_time)->not->toBeNull()
        ->and(Carbon::parse($att->out_time)->format('H:i:s'))->toBe('09:00:00');

    // Later out punch: 13:00 (5 hours later)
    callPunchLogic($att, '2026-09-02 13:00:00');

    expect(Carbon::parse($att->out_time)->format('H:i:s'))->toBe('13:00:00');

    // Final punch: 17:15
    callPunchLogic($att, '2026-09-02 17:15:00');

    expect(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:00:00')
        ->and(Carbon::parse($att->out_time)->format('H:i:s'))->toBe('17:15:00');
});

test('earlier punch updates in_time and former punch becomes out_time if 60m apart', function () {
    $att = new TeacherAttendance();

    // Punch 1 arrives first: 17:00
    callPunchLogic($att, '2026-09-02 17:00:00');

    // Punch 2 arrives second: 08:00 (earlier)
    callPunchLogic($att, '2026-09-02 08:00:00');

    expect(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:00:00')
        ->and(Carbon::parse($att->out_time)->format('H:i:s'))->toBe('17:00:00');
});

test('corrupted existing out_time within 60 minutes is cleared', function () {
    $att = new TeacherAttendance([
        'in_time' => Carbon::parse('2026-09-02 08:30:00'),
        'out_time' => Carbon::parse('2026-09-02 08:30:00'), // Same as in_time from old bug
    ]);

    // Next punch arrives at 08:40 (10 mins later)
    callPunchLogic($att, '2026-09-02 08:40:00');

    expect(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:30:00')
        ->and($att->out_time)->toBeNull();

    // Later punch arrives at 16:30
    callPunchLogic($att, '2026-09-02 16:30:00');

    expect(Carbon::parse($att->in_time)->format('H:i:s'))->toBe('08:30:00')
        ->and(Carbon::parse($att->out_time)->format('H:i:s'))->toBe('16:30:00');
});
