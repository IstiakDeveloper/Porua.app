<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DueReportController extends Controller
{
    private array $monthNames = [
        1 => 'January',
        2 => 'February',
        3 => 'March',
        4 => 'April',
        5 => 'May',
        6 => 'June',
        7 => 'July',
        8 => 'August',
        9 => 'September',
        10 => 'October',
        11 => 'November',
        12 => 'December',
    ];

    private array $shortMonthNames = [
        1 => 'Jan',
        2 => 'Feb',
        3 => 'Mar',
        4 => 'Apr',
        5 => 'May',
        6 => 'Jun',
        7 => 'Jul',
        8 => 'Aug',
        9 => 'Sep',
        10 => 'Oct',
        11 => 'Nov',
        12 => 'Dec',
    ];

    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $academicYears = AcademicYear::orderByDesc('start_date')->get(['id', 'name', 'is_current', 'start_date', 'end_date']);
        $currentAcademicYear = $academicYears->firstWhere('is_current', true) ?: $academicYears->first();

        $academicYearId = $request->academic_year_id ? (int) $request->academic_year_id : ($currentAcademicYear?->id);
        $selectedAcademicYear = $academicYears->firstWhere('id', $academicYearId) ?: $currentAcademicYear;

        $reportType = $request->report_type ?? 'organization';
        $classId = $request->class_id ? (int) $request->class_id : null;
        $studentId = $request->student_id ? (int) $request->student_id : null;

        // Auto switch to student report if student_id is specified
        if ($studentId && $reportType === 'organization') {
            $reportType = 'student';
        }

        if ($studentId && ! $classId) {
            $foundStudent = Student::find($studentId);
            if ($foundStudent) {
                $classId = $foundStudent->class_id;
            }
        }

        $monthFrom = $request->month_from ? (int) $request->month_from : ($request->month ? (int) $request->month : null);
        $monthTo = $request->month_to ? (int) $request->month_to : ($request->month ? (int) $request->month : null);

        if ($monthFrom && ! $monthTo) {
            $monthTo = $monthFrom;
        } elseif ($monthTo && ! $monthFrom) {
            $monthFrom = 1;
        }

        if ($monthFrom && $monthTo && $monthFrom > $monthTo) {
            [$monthFrom, $monthTo] = [$monthTo, $monthFrom];
        }

        $classes = SchoolClass::active()->ordered()->get(['id', 'name']);

        // All active students for instant search & select combobox
        $allStudents = Student::with(['schoolClass', 'section', 'user'])
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'student_id', 'roll_number', 'class_id', 'section_id'])
            ->map(function ($s) {
                $name = trim(($s->first_name ?? '').' '.($s->last_name ?? ''));
                if ($name === '') {
                    $name = $s->user->name ?? 'Student #'.$s->id;
                }

                return [
                    'id' => $s->id,
                    'name' => $name,
                    'student_id' => $s->student_id ?? '',
                    'roll_number' => $s->roll_number ?? '',
                    'class_id' => $s->class_id,
                    'class_name' => $s->schoolClass->name ?? '',
                    'section_name' => $s->section->name ?? '',
                ];
            });

        $students = [];
        if ($classId) {
            $students = Student::where('class_id', $classId)
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'student_id', 'roll_number']);
        }

        $baseQuery = $this->buildYearFeeQuery($selectedAcademicYear, $monthFrom, $monthTo);

        $summary = [
            'totalDue' => 0,
            'totalDiscount' => 0,
            'totalPaid' => 0,
            'totalRemaining' => 0,
            'totalRecords' => 0,
            'uniqueStudents' => 0,
        ];

        $reportData = [];

        switch ($reportType) {
            case 'organization':
                $reportData = $this->getOrganizationMonthlyReport($baseQuery->clone(), $summary, $monthFrom, $monthTo);
                break;
            case 'class':
                $reportData = $this->getClassWiseMonthlyReport($baseQuery->clone(), $classId, $summary, $monthFrom, $monthTo);
                break;
            case 'student':
                $reportData = $this->getStudentWiseMonthlyReport($baseQuery->clone(), $classId, $studentId, $summary, $monthFrom, $monthTo);
                break;
        }

        $startMonth = $monthFrom ?? 1;
        $endMonth = $monthTo ?? 12;
        $activeMonths = [];
        for ($m = $startMonth; $m <= $endMonth; $m++) {
            $activeMonths[] = [
                'num' => $m,
                'name' => $this->shortMonthNames[$m],
                'full_name' => $this->monthNames[$m],
            ];
        }

        $allMonthOptions = [];
        for ($m = 1; $m <= 12; $m++) {
            $allMonthOptions[] = [
                'num' => $m,
                'name' => $this->shortMonthNames[$m],
                'full_name' => $this->monthNames[$m],
            ];
        }

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon');
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        return Inertia::render('Accounting/Reports/DueReport', [
            'reportData' => $reportData,
            'summary' => $summary,
            'filters' => [
                'academic_year_id' => $selectedAcademicYear?->id,
                'report_type' => $reportType,
                'class_id' => $classId,
                'student_id' => $studentId,
                'month_from' => $monthFrom,
                'month_to' => $monthTo,
            ],
            'activeMonths' => $activeMonths,
            'allMonthOptions' => $allMonthOptions,
            'academicYears' => $academicYears,
            'academicYear' => $selectedAcademicYear,
            'classes' => $classes,
            'students' => $students,
            'allStudents' => $allStudents,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
        ]);
    }

    /**
     * Build base query for the selected Academic/Financial Year and optional month range.
     */
    private function buildYearFeeQuery(?AcademicYear $selectedAcademicYear, ?int $monthFrom = null, ?int $monthTo = null): Builder
    {
        $query = FeeCollection::with(['student.schoolClass', 'student.section', 'student.user', 'feeType'])
            ->whereHas('student', function (Builder $q) {
                $q->where('status', 'active');
            })
            ->where('status', '!=', 'cancelled');

        if ($selectedAcademicYear) {
            $yearName = (int) $selectedAcademicYear->name;
            $query->where(function (Builder $q) use ($selectedAcademicYear, $yearName) {
                $q->where('academic_year_id', $selectedAcademicYear->id);
                if ($yearName > 0) {
                    $q->orWhere('year', $yearName);
                }
            });
        }

        if ($monthFrom !== null && $monthTo !== null) {
            $query->where(function (Builder $q) use ($monthFrom, $monthTo) {
                $q->whereBetween('month', [$monthFrom, $monthTo])
                    ->orWhere(function (Builder $oq) use ($monthFrom, $monthTo) {
                        $oq->whereNull('month')
                            ->whereMonth('payment_date', '>=', $monthFrom)
                            ->whereMonth('payment_date', '<=', $monthTo);
                    });
            });
        }

        return $query;
    }

    private function applyStudentFilters(Builder $query, ?int $classId, ?int $studentId): Builder
    {
        if ($classId) {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        if ($studentId) {
            $query->where('student_id', $studentId);
        }

        return $query;
    }

    private function feeAmounts(FeeCollection $record): array
    {
        $total = (float) $record->amount + (float) $record->late_fee;
        $discount = (float) $record->discount;
        $paid = (float) $record->paid_amount;
        $due = max($total - $discount - $paid, 0);

        return compact('total', 'discount', 'paid', 'due');
    }

    private function studentDisplayName(Student $student): string
    {
        if (! empty($student->full_name)) {
            return $student->full_name;
        }

        $name = trim(($student->first_name ?? '').' '.($student->last_name ?? ''));

        return $name !== '' ? $name : ($student->user->name ?? 'Unknown');
    }

    private function accumulateSummary(array &$summary, float $total, float $discount, float $paid, float $due, ?int $studentId = null): void
    {
        $summary['totalDue'] += $total;
        $summary['totalDiscount'] += $discount;
        $summary['totalPaid'] += $paid;
        $summary['totalRemaining'] += $due;
        $summary['totalRecords']++;

        if ($studentId !== null && $due > 0) {
            if (! isset($summary['_studentIds'])) {
                $summary['_studentIds'] = [];
            }
            $summary['_studentIds'][$studentId] = true;
        }
    }

    private function finalizeSummary(array &$summary): void
    {
        $summary['uniqueStudents'] = isset($summary['_studentIds']) ? count($summary['_studentIds']) : 0;
        unset($summary['_studentIds']);
    }

    /**
     * 1. ORGANIZATION DUE REPORT: MONTHS ROWS
     */
    private function getOrganizationMonthlyReport(Builder $query, array &$summary, ?int $monthFrom = null, ?int $monthTo = null): array
    {
        $records = $query->get();

        $startMonth = $monthFrom ?? 1;
        $endMonth = $monthTo ?? 12;

        // Initialize months structure for the active range
        $monthlyData = [];
        for ($m = $startMonth; $m <= $endMonth; $m++) {
            $monthlyData[$m] = [
                'month' => $m,
                'month_name' => $this->monthNames[$m],
                'short_name' => $this->shortMonthNames[$m],
                'total_amount' => 0.0,
                'discount_amount' => 0.0,
                'paid_amount' => 0.0,
                'due_amount' => 0.0,
                'student_count' => 0,
                '_student_ids' => [],
            ];
        }

        $nonMonthly = [
            'total_amount' => 0.0,
            'discount_amount' => 0.0,
            'paid_amount' => 0.0,
            'due_amount' => 0.0,
            'student_count' => 0,
            '_student_ids' => [],
        ];

        foreach ($records as $record) {
            if (! $record->student) {
                continue;
            }

            ['total' => $total, 'discount' => $discount, 'paid' => $paid, 'due' => $due] = $this->feeAmounts($record);
            $studentId = (int) $record->student_id;

            $month = $record->month ? (int) $record->month : null;

            if ($month >= $startMonth && $month <= $endMonth) {
                $monthlyData[$month]['total_amount'] += $total;
                $monthlyData[$month]['discount_amount'] += $discount;
                $monthlyData[$month]['paid_amount'] += $paid;
                $monthlyData[$month]['due_amount'] += $due;

                if ($due > 0) {
                    $monthlyData[$month]['_student_ids'][$studentId] = true;
                }

                $this->accumulateSummary($summary, $total, $discount, $paid, $due, $studentId);
            } elseif ($month === null) {
                // One-time or admission fee
                $pm = $record->payment_date ? (int) $record->payment_date->month : null;
                if ($monthFrom === null || ($pm >= $startMonth && $pm <= $endMonth)) {
                    $nonMonthly['total_amount'] += $total;
                    $nonMonthly['discount_amount'] += $discount;
                    $nonMonthly['paid_amount'] += $paid;
                    $nonMonthly['due_amount'] += $due;

                    if ($due > 0) {
                        $nonMonthly['_student_ids'][$studentId] = true;
                    }

                    $this->accumulateSummary($summary, $total, $discount, $paid, $due, $studentId);
                }
            }
        }

        $this->finalizeSummary($summary);

        // Process student counts and rates
        foreach ($monthlyData as $m => &$mData) {
            $mData['student_count'] = count($mData['_student_ids']);
            unset($mData['_student_ids']);
            $mData['collection_rate'] = $mData['total_amount'] > 0
                ? round(($mData['paid_amount'] / $mData['total_amount']) * 100, 1)
                : 0;
            $mData['due_rate'] = $mData['total_amount'] > 0
                ? round(($mData['due_amount'] / $mData['total_amount']) * 100, 1)
                : 0;
        }

        $nonMonthly['student_count'] = count($nonMonthly['_student_ids']);
        unset($nonMonthly['_student_ids']);
        $nonMonthly['collection_rate'] = $nonMonthly['total_amount'] > 0
            ? round(($nonMonthly['paid_amount'] / $nonMonthly['total_amount']) * 100, 1)
            : 0;
        $nonMonthly['due_rate'] = $nonMonthly['total_amount'] > 0
            ? round(($nonMonthly['due_amount'] / $nonMonthly['total_amount']) * 100, 1)
            : 0;

        return [
            'monthly' => array_values($monthlyData),
            'nonMonthly' => $nonMonthly,
        ];
    }

    /**
     * Helper to initialize month slots for a student.
     */
    private function initStudentMonths(?int $monthFrom = null, ?int $monthTo = null): array
    {
        $startMonth = $monthFrom ?? 1;
        $endMonth = $monthTo ?? 12;

        $months = [];
        for ($m = $startMonth; $m <= $endMonth; $m++) {
            $months[$m] = [
                'month' => $m,
                'short_name' => $this->shortMonthNames[$m],
                'month_name' => $this->monthNames[$m],
                'has_fees' => false,
                'fees' => [],
                'month_total' => 0.0,
                'month_paid' => 0.0,
                'month_due' => 0.0,
                'month_status' => 'none',
                'receipt_numbers' => [],
            ];
        }

        return $months;
    }

    /**
     * Attach a fee collection record to a student's monthly structure.
     */
    private function attachFeeToStudent(array &$student, FeeCollection $record, float $total, float $discount, float $paid, float $due, ?int $monthFrom = null, ?int $monthTo = null): void
    {
        $month = $record->month ? (int) $record->month : null;
        $receipt = $record->receipt_number;

        $feeItem = [
            'id' => $record->id,
            'fee_type' => $record->feeType->name ?? 'Fee',
            'amount' => $total,
            'discount' => $discount,
            'paid_amount' => $paid,
            'due_amount' => $due,
            'status' => $record->status,
            'receipt_number' => $receipt,
            'payment_date' => $record->payment_date ? $record->payment_date->format('d M Y') : null,
        ];

        $startMonth = $monthFrom ?? 1;
        $endMonth = $monthTo ?? 12;

        if ($month >= $startMonth && $month <= $endMonth) {
            $student['months'][$month]['has_fees'] = true;
            $student['months'][$month]['fees'][] = $feeItem;
            $student['months'][$month]['month_total'] += $total;
            $student['months'][$month]['month_paid'] += $paid;
            $student['months'][$month]['month_due'] += $due;

            if (! empty($receipt) && ! in_array($receipt, $student['months'][$month]['receipt_numbers'])) {
                $student['months'][$month]['receipt_numbers'][] = $receipt;
            }

            // Determine month status
            if ($student['months'][$month]['month_due'] <= 0 && $student['months'][$month]['month_paid'] > 0) {
                $student['months'][$month]['month_status'] = 'paid';
            } elseif ($student['months'][$month]['month_paid'] > 0 && $student['months'][$month]['month_due'] > 0) {
                $student['months'][$month]['month_status'] = 'partial';
            } else {
                $student['months'][$month]['month_status'] = 'due';
            }

            $student['total_amount'] += $total;
            $student['discount_amount'] += $discount;
            $student['paid_amount'] += $paid;
            $student['due_amount'] += $due;
        } elseif ($month === null) {
            // One-time / Admission fee
            $pm = $record->payment_date ? (int) $record->payment_date->month : null;
            if ($monthFrom === null || ($pm >= $startMonth && $pm <= $endMonth)) {
                $student['one_time_fees'][] = $feeItem;
                $student['total_amount'] += $total;
                $student['discount_amount'] += $discount;
                $student['paid_amount'] += $paid;
                $student['due_amount'] += $due;
            }
        }
    }

    /**
     * 2. CLASS WISE REPORT: Grouped by class, each student with months boxes
     */
    private function getClassWiseMonthlyReport(Builder $query, ?int $classId, array &$summary, ?int $monthFrom = null, ?int $monthTo = null): array
    {
        $this->applyStudentFilters($query, $classId, null);

        $records = $query->get();
        $classData = [];

        foreach ($records as $record) {
            if (! $record->student) {
                continue;
            }

            ['total' => $total, 'discount' => $discount, 'paid' => $paid, 'due' => $due] = $this->feeAmounts($record);

            $classKey = (int) ($record->student->class_id ?? 0);
            $studentId = (int) $record->student_id;

            if (! isset($classData[$classKey])) {
                $classData[$classKey] = [
                    'class_name' => $record->student->schoolClass->name ?? 'Unknown',
                    'students' => [],
                    'total_gross' => 0.0,
                    'total_discount' => 0.0,
                    'total_paid' => 0.0,
                    'total_remaining' => 0.0,
                ];
            }

            if (! isset($classData[$classKey]['students'][$studentId])) {
                $classData[$classKey]['students'][$studentId] = [
                    'student_id' => $studentId,
                    'student_id_number' => $record->student->student_id ?? '-',
                    'student_name' => $this->studentDisplayName($record->student),
                    'roll_number' => $record->student->roll_number ?? '-',
                    'section' => $record->student->section->name ?? '-',
                    'total_amount' => 0.0,
                    'discount_amount' => 0.0,
                    'paid_amount' => 0.0,
                    'due_amount' => 0.0,
                    'months' => $this->initStudentMonths($monthFrom, $monthTo),
                    'one_time_fees' => [],
                ];
            }

            $this->attachFeeToStudent($classData[$classKey]['students'][$studentId], $record, $total, $discount, $paid, $due, $monthFrom, $monthTo);

            $classData[$classKey]['total_gross'] += $total;
            $classData[$classKey]['total_discount'] += $discount;
            $classData[$classKey]['total_paid'] += $paid;
            $classData[$classKey]['total_remaining'] += $due;

            $this->accumulateSummary($summary, $total, $discount, $paid, $due, $studentId);
        }

        $this->finalizeSummary($summary);

        $result = [];
        foreach ($classData as $class) {
            $studentList = array_values($class['students']);

            usort($studentList, function (array $a, array $b) {
                $rollA = is_numeric($a['roll_number']) ? (int) $a['roll_number'] : PHP_INT_MAX;
                $rollB = is_numeric($b['roll_number']) ? (int) $b['roll_number'] : PHP_INT_MAX;

                if ($rollA === $rollB) {
                    return strcmp($a['student_name'], $b['student_name']);
                }

                return $rollA <=> $rollB;
            });

            $class['students'] = $studentList;
            $class['student_count'] = count($studentList);
            $class['due_student_count'] = count(array_filter($studentList, fn ($s) => $s['due_amount'] > 0));
            $result[] = $class;
        }

        usort($result, fn (array $a, array $b) => strcmp($a['class_name'], $b['class_name']));

        return $result;
    }

    /**
     * 3. STUDENT WISE REPORT: Months matrix per student
     */
    private function getStudentWiseMonthlyReport(Builder $query, ?int $classId, ?int $studentId, array &$summary, ?int $monthFrom = null, ?int $monthTo = null): array
    {
        $this->applyStudentFilters($query, $classId, $studentId);

        $records = $query->get();
        $studentData = [];

        foreach ($records as $record) {
            if (! $record->student) {
                continue;
            }

            ['total' => $total, 'discount' => $discount, 'paid' => $paid, 'due' => $due] = $this->feeAmounts($record);
            $sid = (int) $record->student_id;

            if (! isset($studentData[$sid])) {
                $studentData[$sid] = [
                    'student_id' => $sid,
                    'student_id_number' => $record->student->student_id ?? '-',
                    'student_name' => $this->studentDisplayName($record->student),
                    'roll_number' => $record->student->roll_number ?? '-',
                    'class_name' => $record->student->schoolClass->name ?? 'Unknown',
                    'section' => $record->student->section->name ?? '-',
                    'father_name' => $record->student->father_name ?? '-',
                    'phone' => $record->student->phone ?? $record->student->father_phone ?? '-',
                    'total_amount' => 0.0,
                    'discount_amount' => 0.0,
                    'paid_amount' => 0.0,
                    'due_amount' => 0.0,
                    'months' => $this->initStudentMonths($monthFrom, $monthTo),
                    'one_time_fees' => [],
                ];
            }

            $this->attachFeeToStudent($studentData[$sid], $record, $total, $discount, $paid, $due, $monthFrom, $monthTo);
            $this->accumulateSummary($summary, $total, $discount, $paid, $due, $sid);
        }

        $this->finalizeSummary($summary);

        $result = array_values($studentData);

        usort($result, function (array $a, array $b) {
            $classCmp = strcmp($a['class_name'], $b['class_name']);
            if ($classCmp !== 0) {
                return $classCmp;
            }

            $rollA = is_numeric($a['roll_number']) ? (int) $a['roll_number'] : PHP_INT_MAX;
            $rollB = is_numeric($b['roll_number']) ? (int) $b['roll_number'] : PHP_INT_MAX;

            if ($rollA === $rollB) {
                return strcmp($a['student_name'], $b['student_name']);
            }

            return $rollA <=> $rollB;
        });

        return $result;
    }
}
