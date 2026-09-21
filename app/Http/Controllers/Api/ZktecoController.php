<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\DeviceSetting;
use App\Models\OtherStaff;
use App\Models\OtherStaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZktecoController extends Controller
{
    /**
     * Main sync endpoint for ZKTeco Agent
     * Handles the data format from the PHP agent script
     */
    public function syncAttendance(Request $request)
    {
        try {
            Log::info('ZKTeco Sync Request Received', $request->all());

            // Validate the main structure
            $validated = $request->validate([
                'device_id' => 'required',
                'device_name' => 'required|string',
                'device_ip' => 'required|string',
                'serial_number' => 'nullable|string',
                'attendance_data' => 'nullable|array',
                'user_data' => 'nullable|array',
                'absent_teachers' => 'nullable|array',
                'absent_students' => 'nullable|array',
                'absent_other_staff' => 'nullable|array',
                'sync_date' => 'nullable|date',
            ]);

            $successCount = 0;
            $errors = [];
            $attendanceData = $validated['attendance_data'] ?? [];
            $absentTeachers = $validated['absent_teachers'] ?? [];
            $absentStudents = $validated['absent_students'] ?? [];
            $absentOtherStaff = $validated['absent_other_staff'] ?? [];
            $syncDate = $validated['sync_date'] ?? now()->format('Y-m-d');

            $deviceSetting = DeviceSetting::current();

            // Process attendance data
            // Sort attendance data chronologically so punches are processed in time order
            usort($attendanceData, function ($a, $b) {
                $timeA = $a['timestamp'] ?? $a['punch_time'] ?? '';
                $timeB = $b['timestamp'] ?? $b['punch_time'] ?? '';

                return strcmp((string) $timeA, (string) $timeB);
            });

            foreach ($attendanceData as $record) {
                try {
                    // ZKTeco agent format: id, timestamp, state, type
                    $employeeId = $record['id'] ?? $record['uid'] ?? null;
                    $timestamp = $record['timestamp'] ?? null;
                    $state = $record['state'] ?? 0;
                    $type = $record['type'] ?? 'fingerprint';

                    if (! $employeeId || ! $timestamp) {
                        continue;
                    }

                    // Convert to our format
                    $processedRecord = [
                        'employee_id' => (string) $employeeId,
                        'punch_time' => $timestamp,
                        'punch_state' => (int) $state,
                        'punch_type' => $type,
                        'device_sn' => $validated['serial_number'] ?? null,
                    ];

                    // Try to process as teacher first
                    $teacher = Teacher::where('employee_id', $employeeId)->first();
                    if ($teacher) {
                        $this->processTeacherAttendance($processedRecord);
                        $successCount++;

                        continue;
                    }

                    // Then try as student
                    $student = Student::where('admission_number', $employeeId)->first();
                    if ($student) {
                        $this->processStudentAttendance($processedRecord);
                        $successCount++;

                        continue;
                    }

                    // Then try as other staff
                    $otherStaff = OtherStaff::where('employee_id', $employeeId)->first();
                    if ($otherStaff) {
                        $this->processOtherStaffAttendance($processedRecord);
                        $successCount++;

                        continue;
                    }

                    // Not found
                    $errors[] = [
                        'employee_id' => $employeeId,
                        'error' => 'No teacher, student or other staff found with this ID',
                    ];

                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $employeeId ?? 'unknown',
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Sync Record Error: '.$e->getMessage(), $record);
                }
            }

            // Process absent teachers
            $absentMarked = 0;
            $absentErrors = [];

            foreach ($absentTeachers as $employeeId) {
                try {
                    // Weekend/holiday: do not mark absent at all (no record, no absent count)
                    if ($deviceSetting->isWeekend($syncDate) || $deviceSetting->isHoliday($syncDate)) {
                        continue;
                    }

                    $teacher = Teacher::where('employee_id', $employeeId)
                        ->where('status', 'active')
                        ->first();

                    if (! $teacher) {
                        continue;
                    }

                    // Check if already has attendance record for today
                    $existingAttendance = TeacherAttendance::where('teacher_id', $teacher->id)
                        ->whereDate('date', $syncDate)
                        ->exists();

                    if ($existingAttendance) {
                        continue; // Already has record
                    }

                    // Working day: mark as absent
                    TeacherAttendance::create([
                        'teacher_id' => $teacher->id,
                        'date' => $syncDate,
                        'status' => 'absent',
                        'in_time' => null,
                        'out_time' => null,
                        'employee_id' => $employeeId,
                        'device_sn' => $validated['serial_number'] ?? null,
                        'marked_by' => null,
                    ]);

                    $absentMarked++;

                } catch (\Exception $e) {
                    $absentErrors[] = [
                        'employee_id' => $employeeId,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Process absent students
            foreach ($absentStudents as $admissionNumber) {
                try {
                    // Weekend/holiday: do not mark absent at all (no record, no absent count)
                    if ($deviceSetting->isWeekend($syncDate) || $deviceSetting->isHoliday($syncDate)) {
                        continue;
                    }

                    $student = Student::where('admission_number', $admissionNumber)
                        ->where('status', 'active')
                        ->first();

                    if (! $student) {
                        continue;
                    }

                    // Get current academic year
                    $academicYear = AcademicYear::where('is_current', true)->first();
                    if (! $academicYear) {
                        continue;
                    }

                    // Check if already has attendance record for today
                    $existingAttendance = StudentAttendance::where('student_id', $student->id)
                        ->whereDate('date', $syncDate)
                        ->exists();

                    if ($existingAttendance) {
                        continue; // Already has record
                    }

                    // Working day: mark as absent
                    StudentAttendance::create([
                        'student_id' => $student->id,
                        'date' => $syncDate,
                        'status' => 'absent',
                        'in_time' => null,
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'academic_year_id' => $academicYear->id,
                        'employee_id' => $admissionNumber,
                        'device_sn' => $validated['serial_number'] ?? null,
                        'marked_by' => null,
                    ]);

                    $absentMarked++;

                } catch (\Exception $e) {
                    $absentErrors[] = [
                        'employee_id' => $admissionNumber,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Process absent other staff
            foreach ($absentOtherStaff as $employeeId) {
                try {
                    $staff = OtherStaff::where('employee_id', $employeeId)
                        ->where('status', 'active')
                        ->first();

                    if (! $staff) {
                        continue;
                    }

                    // Check if date is staff's weekend or global holiday
                    if ($staff->isWeekend($syncDate) || $deviceSetting->isHoliday($syncDate)) {
                        continue;
                    }

                    // Check if already has attendance record for today
                    $existingAttendance = OtherStaffAttendance::where('other_staff_id', $staff->id)
                        ->whereDate('date', $syncDate)
                        ->exists();

                    if ($existingAttendance) {
                        continue;
                    }

                    // Mark as absent
                    OtherStaffAttendance::create([
                        'other_staff_id' => $staff->id,
                        'employee_id' => $employeeId,
                        'date' => $syncDate,
                        'status' => 'absent',
                        'in_time' => null,
                        'out_time' => null,
                        'device_sn' => $validated['serial_number'] ?? null,
                        'marked_by' => null,
                    ]);

                    $absentMarked++;

                } catch (\Exception $e) {
                    $absentErrors[] = [
                        'employee_id' => $employeeId,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Update device settings last sync
            $deviceSetting = DeviceSetting::first();
            if ($deviceSetting) {
                $deviceSetting->update([
                    'device_name' => $validated['device_name'],
                    'device_ip' => $validated['device_ip'],
                    'last_sync_at' => now(),
                    'last_sync_status' => $successCount > 0 ? 'success' : 'failed',
                    'last_sync_records' => $successCount,
                    'last_sync_message' => count($errors) > 0
                        ? 'Processed with '.count($errors).' errors'
                        : 'Sync successful',
                ]);
            }

            return response()->json([
                'status' => true,
                'success' => true,
                'message' => "Processed {$successCount} attendance records, marked {$absentMarked} absent",
                'summary' => [
                    'processed' => $successCount,
                    'total' => count($attendanceData),
                    'absent_marked' => $absentMarked,
                    'errors' => count($errors) + count($absentErrors),
                ],
                'errors' => array_merge($errors, $absentErrors),
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco syncAttendance Error: '.$e->getMessage());

            return response()->json([
                'status' => false,
                'success' => false,
                'message' => 'Failed to sync attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all teachers with their employee IDs for ZKTeco device
     */
    public function getTeachers(Request $request)
    {
        try {
            $teachers = Teacher::select('id', 'employee_id', 'first_name', 'last_name', 'status')
                ->whereNotNull('employee_id')
                ->where('status', 'active')
                ->get()
                ->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'employee_id' => $teacher->employee_id,
                        'name' => trim($teacher->first_name.' '.($teacher->last_name ?? '')),
                        'type' => 'teacher',
                    ];
                });

            return response()->json([
                'success' => true,
                'count' => $teachers->count(),
                'data' => $teachers,
            ]);
        } catch (\Exception $e) {
            Log::error('ZKTeco getTeachers Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all students with their employee/admission IDs for ZKTeco device
     */
    public function getStudents(Request $request)
    {
        try {
            $academicYear = AcademicYear::where('is_current', true)->first();

            $students = Student::select('id', 'admission_number', 'first_name', 'last_name', 'class_id', 'section_id', 'status')
                ->whereNotNull('admission_number')
                ->where('status', 'active')
                ->when($academicYear, function ($query) use ($academicYear) {
                    return $query->where('academic_year_id', $academicYear->id);
                })
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'employee_id' => $student->admission_number, // Using admission number as employee_id
                        'name' => trim($student->first_name.' '.($student->last_name ?? '')),
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'type' => 'student',
                    ];
                });

            return response()->json([
                'success' => true,
                'count' => $students->count(),
                'data' => $students,
            ]);
        } catch (\Exception $e) {
            Log::error('ZKTeco getStudents Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store attendance data from ZKTeco device (Legacy - supports batch with type)
     */
    public function storeAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendance' => 'required|array',
                'attendance.*.employee_id' => 'required|string',
                'attendance.*.punch_time' => 'required|date',
                'attendance.*.punch_state' => 'required|integer|in:0,1',
                'attendance.*.punch_type' => 'nullable|string',
                'attendance.*.device_sn' => 'nullable|string',
                'attendance.*.type' => 'required|string|in:teacher,student',
            ]);

            $successCount = 0;
            $errors = [];

            $attendanceList = $validated['attendance'];
            usort($attendanceList, function ($a, $b) {
                return strcmp((string) ($a['punch_time'] ?? ''), (string) ($b['punch_time'] ?? ''));
            });

            foreach ($attendanceList as $record) {
                try {
                    if ($record['type'] === 'teacher') {
                        $this->processTeacherAttendance($record);
                    } else {
                        $this->processStudentAttendance($record);
                    }
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $record['employee_id'],
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Attendance Error: '.$e->getMessage(), $record);
                }
            }

            // Update device settings last sync
            $deviceSetting = DeviceSetting::first();
            if ($deviceSetting) {
                $deviceSetting->update([
                    'last_sync_at' => now(),
                    'last_sync_status' => $successCount > 0 ? 'success' : 'failed',
                    'last_sync_records' => $successCount,
                    'last_sync_message' => count($errors) > 0 ? json_encode($errors) : 'Sync successful',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$successCount} attendance records",
                'processed' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco storeAttendance Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to store attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store teacher attendance from ZKTeco device
     */
    public function storeTeacherAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendance' => 'required|array',
                'attendance.*.employee_id' => 'required|string',
                'attendance.*.punch_time' => 'required|date',
                'attendance.*.punch_state' => 'required|integer|in:0,1',
                'attendance.*.punch_type' => 'nullable|string',
                'attendance.*.device_sn' => 'nullable|string',
            ]);

            $successCount = 0;
            $errors = [];

            $attendanceList = $validated['attendance'];
            usort($attendanceList, function ($a, $b) {
                return strcmp((string) ($a['punch_time'] ?? ''), (string) ($b['punch_time'] ?? ''));
            });

            foreach ($attendanceList as $record) {
                try {
                    $this->processTeacherAttendance($record);
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $record['employee_id'],
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Teacher Attendance Error: '.$e->getMessage(), $record);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$successCount} teacher attendance records",
                'processed' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco storeTeacherAttendance Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to store teacher attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store student attendance from ZKTeco device
     */
    public function storeStudentAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendance' => 'required|array',
                'attendance.*.employee_id' => 'required|string',
                'attendance.*.punch_time' => 'required|date',
                'attendance.*.punch_state' => 'required|integer|in:0,1',
                'attendance.*.punch_type' => 'nullable|string',
                'attendance.*.device_sn' => 'nullable|string',
            ]);

            $successCount = 0;
            $errors = [];

            $attendanceList = $validated['attendance'];
            usort($attendanceList, function ($a, $b) {
                return strcmp((string) ($a['punch_time'] ?? ''), (string) ($b['punch_time'] ?? ''));
            });

            foreach ($attendanceList as $record) {
                try {
                    $this->processStudentAttendance($record);
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $record['employee_id'],
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Student Attendance Error: '.$e->getMessage(), $record);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$successCount} student attendance records",
                'processed' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco storeStudentAttendance Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to store student attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process individual teacher attendance record
     * First punch = Check In time, Last punch = Check Out time
     */
    private function processTeacherAttendance(array $record)
    {
        $teacher = Teacher::where('employee_id', $record['employee_id'])->first();

        if (! $teacher) {
            throw new \Exception("Teacher not found with employee_id: {$record['employee_id']}");
        }

        $punchTime = Carbon::parse($record['punch_time']);
        $date = $punchTime->toDateString();
        $deviceSettings = DeviceSetting::first();

        // Get or create attendance record for this date
        $attendance = TeacherAttendance::firstOrCreate(
            [
                'teacher_id' => $teacher->id,
                'date' => $date,
            ],
            [
                'status' => 'present',
                'employee_id' => $record['employee_id'],
                'marked_by' => 1, // System user
            ]
        );

        // Update punch data
        $attendance->punch_time = $punchTime;
        $attendance->punch_state = $record['punch_state'];
        $attendance->punch_type = $record['punch_type'] ?? 'fingerprint';
        $attendance->device_sn = $record['device_sn'] ?? null;

        // Apply punch logic: first punch = In, >= 60m = Out, last punch = final Out
        $this->applyPunchLogic($attendance, $punchTime);

        // Dynamic status from device settings: teacher_in_time, teacher_out_time, teacher_late_time
        $attendance->status = 'present';
        if ($deviceSettings) {
            $lateThresholdMins = 15; // tolerance before considering early leave

            // Early leave: left before (teacher_out_time - tolerance)
            if ($attendance->out_time && $deviceSettings->teacher_out_time) {
                $expectedOutTime = Carbon::parse($date.' '.$deviceSettings->teacher_out_time);
                $actualOutTime = Carbon::parse($attendance->out_time);
                if ($deviceSettings->auto_mark_early_leave && $actualOutTime->lessThan($expectedOutTime->copy()->subMinutes($lateThresholdMins))) {
                    $attendance->status = 'early_leave';
                }
            }

            // Late: arrived after teacher_late_time (exact time from settings)
            if ($attendance->in_time && $deviceSettings->teacher_late_time) {
                $lateCutoff = Carbon::parse($date.' '.$deviceSettings->teacher_late_time);
                $actualInTime = Carbon::parse($attendance->in_time);
                if ($deviceSettings->auto_mark_late && $actualInTime->greaterThan($lateCutoff)) {
                    $attendance->status = 'late';
                }
            }
        }

        $attendance->save();

        Log::info("Teacher attendance updated: {$teacher->full_name} on {$date}");
    }

    /**
     * Process individual student attendance record
     * Students only need to be marked as present
     */
    private function processStudentAttendance(array $record)
    {
        $student = Student::where('admission_number', $record['employee_id'])->first();

        if (! $student) {
            throw new \Exception("Student not found with admission_number: {$record['employee_id']}");
        }

        $punchTime = Carbon::parse($record['punch_time']);
        $date = $punchTime->toDateString();
        $deviceSettings = DeviceSetting::first();
        $academicYear = AcademicYear::where('is_current', true)->first();

        if (! $academicYear) {
            throw new \Exception('No current academic year found');
        }

        // Get or create attendance record for this date
        $attendance = StudentAttendance::firstOrCreate(
            [
                'student_id' => $student->id,
                'date' => $date,
            ],
            [
                'class_id' => $student->class_id,
                'section_id' => $student->section_id,
                'academic_year_id' => $academicYear->id,
                'status' => 'present',
                'employee_id' => $record['employee_id'],
                'marked_by' => 1, // System user
            ]
        );

        // Update punch data
        $attendance->punch_time = $punchTime;
        $attendance->punch_state = $record['punch_state'];
        $attendance->punch_type = $record['punch_type'] ?? 'fingerprint';
        $attendance->device_sn = $record['device_sn'] ?? null;

        $isFirstPunch = ! $attendance->in_time;

        // Apply punch logic: first punch = In, >= 60m = Out, last punch = final Out
        $this->applyPunchLogic($attendance, $punchTime);

        // For students, check if late based on device settings upon first punch
        if ($isFirstPunch && $attendance->in_time && $deviceSettings && $deviceSettings->student_in_time) {
            $expectedInTime = Carbon::parse($date.' '.$deviceSettings->student_in_time);
            $lateThreshold = $deviceSettings->student_late_threshold ?? 15;

            if (Carbon::parse($attendance->in_time)->diffInMinutes($expectedInTime) > $lateThreshold) {
                $attendance->status = 'late';
            }
        }

        $attendance->save();

        Log::info("Student attendance updated: {$student->full_name} on {$date}");
    }

    /**
     * Get all active other staff with their employee IDs for ZKTeco device
     */
    public function getOtherStaff(Request $request)
    {
        try {
            $staff = OtherStaff::select('id', 'employee_id', 'name', 'status')
                ->whereNotNull('employee_id')
                ->where('status', 'active')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'employee_id' => $item->employee_id,
                        'name' => $item->name,
                        'type' => 'other_staff',
                    ];
                });

            return response()->json([
                'success' => true,
                'count' => $staff->count(),
                'data' => $staff,
            ]);
        } catch (\Exception $e) {
            Log::error('ZKTeco getOtherStaff Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch other staff',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process individual other staff attendance record
     * First punch = Check In, Last punch = Check Out
     */
    private function processOtherStaffAttendance(array $record)
    {
        $staff = OtherStaff::where('employee_id', $record['employee_id'])->first();

        if (! $staff) {
            throw new \Exception("Other staff not found with employee_id: {$record['employee_id']}");
        }

        $punchTime = Carbon::parse($record['punch_time']);
        $date = $punchTime->toDateString();

        $defaultStatus = $staff->isWeekend($date) ? 'weekend' : 'present';

        $attendance = OtherStaffAttendance::firstOrCreate(
            [
                'other_staff_id' => $staff->id,
                'date' => $date,
            ],
            [
                'status' => $defaultStatus,
                'employee_id' => $record['employee_id'],
                'marked_by' => null,
            ]
        );

        $attendance->punch_time = $punchTime;
        $attendance->punch_state = $record['punch_state'];
        $attendance->punch_type = $record['punch_type'] ?? 'fingerprint';
        $attendance->device_sn = $record['device_sn'] ?? null;

        // Apply punch logic: first punch = In, >= 60m = Out, last punch = final Out
        $this->applyPunchLogic($attendance, $punchTime);

        // Status calculation
        if ($staff->isWeekend($date)) {
            $attendance->status = 'weekend';
        } else {
            $status = 'present';

            // Check Late
            if ($attendance->in_time && $staff->late_time) {
                $lateCutoff = Carbon::parse($date.' '.$staff->late_time);
                if (Carbon::parse($attendance->in_time)->greaterThan($lateCutoff)) {
                    $status = 'late';
                }
            }

            // Check Early Leave
            if ($attendance->out_time && $staff->out_time) {
                $expectedOut = Carbon::parse($date.' '.$staff->out_time)->subMinutes(15);
                if (Carbon::parse($attendance->out_time)->lessThan($expectedOut)) {
                    if ($status === 'present') {
                        $status = 'early_leave';
                    }
                }
            }

            $attendance->status = $status;
        }

        $attendance->save();

        Log::info("Other staff attendance updated: {$staff->name} on {$date}");
    }

    /**
     * Apply check-in and check-out punch logic:
     * - First punch is Check In (in_time). out_time remains null.
     * - Any punch within 1 hour (< 60 minutes) of in_time is NOT counted as out_time.
     * - Any punch >= 60 minutes after in_time is counted as out_time.
     * - If multiple punches occur >= 60 minutes after in_time, the latest/last punch is kept as out_time.
     */
    private function applyPunchLogic($attendance, Carbon $punchTime): void
    {
        // If existing record has corrupted out_time within 60 minutes of in_time, reset it
        if ($attendance->in_time && $attendance->out_time) {
            $existingIn = Carbon::parse($attendance->in_time);
            $existingOut = Carbon::parse($attendance->out_time);
            if ($existingIn->diffInMinutes($existingOut) < 60) {
                $attendance->out_time = null;
            }
        }

        if (! $attendance->in_time) {
            // First punch of the day: Check In only
            $attendance->in_time = $punchTime;
        } elseif ($punchTime->lt(Carbon::parse($attendance->in_time))) {
            // A punch earlier than current in_time arrived
            $oldInTime = Carbon::parse($attendance->in_time);
            $attendance->in_time = $punchTime;

            // If former in_time is >= 60 minutes after the new in_time, it qualifies as out_time
            if ($punchTime->diffInMinutes($oldInTime) >= 60) {
                if (! $attendance->out_time || $oldInTime->gt(Carbon::parse($attendance->out_time))) {
                    $attendance->out_time = $oldInTime;
                }
            }
        } elseif (Carbon::parse($attendance->in_time)->diffInMinutes($punchTime) >= 60) {
            // Punch is at least 60 minutes after in_time: qualifies as out_time
            if (! $attendance->out_time || $punchTime->gt(Carbon::parse($attendance->out_time))) {
                $attendance->out_time = $punchTime;
            }
        }
        // If punch is >= in_time and < 60 minutes from in_time, ignore for out_time (only keep in_time)
    }
}
