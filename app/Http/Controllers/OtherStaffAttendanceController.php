<?php

namespace App\Http\Controllers;

use App\Models\OtherStaff;
use App\Models\OtherStaffAttendance;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherStaffAttendanceController extends Controller
{
    /**
     * Display daily attendance records and attendance calculator portal.
     */
    public function index(Request $request)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access. Only Super Admin can access Other Staff Attendance.');

        $activeTab = $request->input('tab', 'daily');

        $allStaff = OtherStaff::where('status', 'active')->orderBy('name')->get();

        if ($activeTab === 'calculator') {
            return $this->renderCalculator($request, $allStaff);
        }

        // Daily Attendance View
        $date = $request->input('date', now()->toDateString());
        $staffId = $request->input('other_staff_id');
        $status = $request->input('status');

        $query = OtherStaffAttendance::with('otherStaff')
            ->whereDate('date', $date);

        if ($staffId) {
            $query->where('other_staff_id', $staffId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $attendances = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        $stats = [
            'total_active' => $allStaff->count(),
            'present' => OtherStaffAttendance::whereDate('date', $date)->where('status', 'present')->count(),
            'late' => OtherStaffAttendance::whereDate('date', $date)->where('status', 'late')->count(),
            'early_leave' => OtherStaffAttendance::whereDate('date', $date)->where('status', 'early_leave')->count(),
            'absent' => OtherStaffAttendance::whereDate('date', $date)->where('status', 'absent')->count(),
            'weekend' => OtherStaffAttendance::whereDate('date', $date)->where('status', 'weekend')->count(),
        ];

        return Inertia::render('OtherStaff/Attendance', [
            'activeTab' => 'daily',
            'attendances' => $attendances,
            'allStaff' => $allStaff,
            'stats' => $stats,
            'filters' => [
                'date' => $date,
                'other_staff_id' => $staffId,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store or update manual attendance record for Other Staff.
     */
    public function store(Request $request)
    {
        abort_unless(auth()->user()?->isSuperAdmin(), 403, 'Unauthorized access.');

        $validated = $request->validate([
            'other_staff_id' => 'required|exists:other_staff,id',
            'date' => 'required|date',
            'status' => 'required|in:present,late,early_leave,absent,weekend,holiday',
            'in_time' => 'nullable|string',
            'out_time' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $staff = OtherStaff::findOrFail($validated['other_staff_id']);
        $dateStr = Carbon::parse($validated['date'])->toDateString();

        $inTime = !empty($validated['in_time']) ? Carbon::parse($dateStr . ' ' . $validated['in_time']) : null;
        $outTime = !empty($validated['out_time']) ? Carbon::parse($dateStr . ' ' . $validated['out_time']) : null;

        OtherStaffAttendance::updateOrCreate(
            [
                'other_staff_id' => $staff->id,
                'date' => $dateStr,
            ],
            [
                'employee_id' => $staff->employee_id,
                'status' => $validated['status'],
                'in_time' => $inTime,
                'out_time' => $outTime,
                'marked_by' => auth()->id(),
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Attendance record saved successfully.');
    }

    /**
     * Render the Attendance Calculator data.
     */
    protected function renderCalculator(Request $request, $allStaff)
    {
        $startDateStr = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDateStr = $request->input('end_date', Carbon::now()->toDateString());
        $selectedStaffId = $request->input('other_staff_id');

        $startDate = Carbon::parse($startDateStr)->startOfDay();
        $endDate = Carbon::parse($endDateStr)->endOfDay();

        $staffQuery = OtherStaff::query();
        if ($selectedStaffId) {
            $staffQuery->where('id', $selectedStaffId);
        }
        $staffMembers = $staffQuery->orderBy('name')->get();

        // Calculate metrics per staff member
        $calculatorResults = [];
        $overallStats = [
            'total_days' => (int) Carbon::parse($startDateStr)->diffInDays(Carbon::parse($endDateStr)) + 1,
            'present' => 0,
            'late' => 0,
            'early_leave' => 0,
            'absent' => 0,
            'weekend' => 0,
            'total_worked_minutes' => 0,
        ];

        foreach ($staffMembers as $staff) {
            $records = OtherStaffAttendance::where('other_staff_id', $staff->id)
                ->whereBetween('date', [$startDateStr, $endDateStr])
                ->get()
                ->keyBy(function ($item) {
                    return Carbon::parse($item->date)->toDateString();
                });

            $period = CarbonPeriod::create($startDateStr, $endDateStr);

            $staffPresent = 0;
            $staffLate = 0;
            $staffEarlyLeave = 0;
            $staffAbsent = 0;
            $staffWeekend = 0;
            $staffWorkMinutes = 0;

            $dailyDetails = [];

            foreach ($period as $dt) {
                $dayStr = $dt->toDateString();
                $isStaffWeekend = $staff->isWeekend($dayStr);

                $rec = $records->get($dayStr);

                $status = $rec ? $rec->status : ($isStaffWeekend ? 'weekend' : 'absent');
                $inTimeFormatted = $rec && $rec->in_time ? Carbon::parse($rec->in_time)->format('h:i A') : '-';
                $outTimeFormatted = $rec && $rec->out_time ? Carbon::parse($rec->out_time)->format('h:i A') : '-';

                $workedMinutes = 0;
                if ($rec && $rec->in_time && $rec->out_time) {
                    $workedMinutes = Carbon::parse($rec->in_time)->diffInMinutes(Carbon::parse($rec->out_time));
                }

                $staffWorkMinutes += $workedMinutes;

                switch ($status) {
                    case 'present':
                        $staffPresent++;
                        break;
                    case 'late':
                        $staffLate++;
                        break;
                    case 'early_leave':
                        $staffEarlyLeave++;
                        break;
                    case 'absent':
                        $staffAbsent++;
                        break;
                    case 'weekend':
                        $staffWeekend++;
                        break;
                }

                $dailyDetails[] = [
                    'date' => $dayStr,
                    'day_name' => $dt->format('l'),
                    'status' => $status,
                    'in_time' => $inTimeFormatted,
                    'out_time' => $outTimeFormatted,
                    'worked_hours' => round($workedMinutes / 60, 2),
                    'notes' => $rec ? $rec->notes : null,
                ];
            }

            $totalWorkingDays = count($dailyDetails) - $staffWeekend;

            $calculatorResults[] = [
                'staff' => [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'employee_id' => $staff->employee_id,
                    'designation' => $staff->designation,
                    'in_time' => $staff->in_time,
                    'out_time' => $staff->out_time,
                    'weekend' => $staff->weekend,
                ],
                'summary' => [
                    'total_days' => count($dailyDetails),
                    'working_days' => $totalWorkingDays,
                    'present' => $staffPresent,
                    'late' => $staffLate,
                    'early_leave' => $staffEarlyLeave,
                    'absent' => $staffAbsent,
                    'weekend' => $staffWeekend,
                    'total_worked_hours' => round($staffWorkMinutes / 60, 2),
                    'avg_daily_hours' => $totalWorkingDays > 0 ? round(($staffWorkMinutes / 60) / $totalWorkingDays, 2) : 0,
                ],
                'daily_details' => $dailyDetails,
            ];

            $overallStats['present'] += $staffPresent;
            $overallStats['late'] += $staffLate;
            $overallStats['early_leave'] += $staffEarlyLeave;
            $overallStats['absent'] += $staffAbsent;
            $overallStats['weekend'] += $staffWeekend;
            $overallStats['total_worked_minutes'] += $staffWorkMinutes;
        }

        $overallStats['total_worked_hours'] = round($overallStats['total_worked_minutes'] / 60, 2);

        return Inertia::render('OtherStaff/Attendance', [
            'activeTab' => 'calculator',
            'allStaff' => $allStaff,
            'calculatorResults' => $calculatorResults,
            'overallStats' => $overallStats,
            'filters' => [
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
                'other_staff_id' => $selectedStaffId,
            ],
        ]);
    }
}
