<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\StaffWelfareLoan;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffWelfareLoanLedgerReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->filled('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : now()->copy()->startOfMonth()->startOfDay();
        $endDate = $request->filled('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : now()->copy()->endOfMonth()->endOfDay();

        $teacherId = $request->filled('teacher_id') ? (int) $request->teacher_id : null;

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: config('app.name', 'Mousumi Bidyaniketon');
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        $teachers = Teacher::query()
            ->active()
            ->with('user')
            ->whereHas('user')
            ->whereIn('id', function ($q) {
                $q->select('teacher_id')
                    ->from('staff_welfare_loans')
                    ->where('status', '!=', 'cancelled');
            })
            ->orderBy('employee_id')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->user->name,
                'employee_id' => $t->employee_id,
            ]);

        $loansQuery = StaffWelfareLoan::query()
            ->with([
                'teacher.user',
                'installments' => function ($q) {
                    $q->where('status', 'paid')->whereNotNull('paid_date');
                },
            ])
            ->where('status', '!=', 'cancelled')
            ->whereDate('loan_date', '<=', $endDate->toDateString());

        if ($teacherId) {
            $loansQuery->where('teacher_id', $teacherId);
        }

        $loans = $loansQuery->orderByDesc('loan_date')->orderBy('id')->get();

        $rows = [];
        $summary = [
            'teacher_count' => 0,
            'total_before_due_balance' => 0.0,
            'total_paid_in_period' => 0.0,
            'total_current_due_balance' => 0.0,
        ];

        $loansByTeacher = $loans->groupBy('teacher_id');

        foreach ($loansByTeacher as $tid => $teacherLoans) {
            $currentDueBalance = 0.0;
            $paidInPeriod = 0.0;

            foreach ($teacherLoans as $loan) {
                $loanDate = Carbon::parse($loan->loan_date)->startOfDay();
                if ($loanDate->gt($endDate)) {
                    continue;
                }

                $principal = (float) $loan->loan_amount;
                $installments = $loan->installments;

                $paidThroughEnd = (float) $installments
                    ->filter(fn ($i) => Carbon::parse($i->paid_date)->lte($endDate))
                    ->sum('amount');

                $paidInPeriodLoan = (float) $installments
                    ->filter(function ($i) use ($startDate, $endDate) {
                        $d = Carbon::parse($i->paid_date)->startOfDay();

                        return $d->gte($startDate) && $d->lte($endDate);
                    })
                    ->sum('amount');

                $currentEndLoan = round(max(0, $principal - $paidThroughEnd), 2);

                $currentDueBalance += $currentEndLoan;
                $paidInPeriod += round($paidInPeriodLoan, 2);
            }

            $currentDueBalance = round($currentDueBalance, 2);
            $paidInPeriod = round($paidInPeriod, 2);
            $beforeDueBalance = round($currentDueBalance + $paidInPeriod, 2);

            if ($currentDueBalance < 0.005 && $paidInPeriod < 0.005 && $beforeDueBalance < 0.005) {
                continue;
            }

            $firstLoan = $teacherLoans->first();
            $teacherName = $firstLoan->teacher?->user?->name ?? '—';
            $employeeId = $firstLoan->teacher?->employee_id ?? '';

            $rows[] = [
                'teacher_id' => (int) $tid,
                'name' => $teacherName,
                'employee_id' => $employeeId,
                'before_due_balance' => $beforeDueBalance,
                'paid_in_period' => $paidInPeriod,
                'current_due_balance' => $currentDueBalance,
            ];

            $summary['teacher_count']++;
            $summary['total_before_due_balance'] += $beforeDueBalance;
            $summary['total_paid_in_period'] += $paidInPeriod;
            $summary['total_current_due_balance'] += $currentDueBalance;
        }

        usort($rows, fn (array $a, array $b) => strcmp($a['name'], $b['name']));

        $summary['total_before_due_balance'] = round($summary['total_before_due_balance'], 2);
        $summary['total_paid_in_period'] = round($summary['total_paid_in_period'], 2);
        $summary['total_current_due_balance'] = round($summary['total_current_due_balance'], 2);

        return Inertia::render('Accounting/Reports/StaffWelfareLoanLedger', [
            'rows' => $rows,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'teacher_id' => $teacherId,
            ],
            'teachers' => $teachers,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
        ]);
    }
}
