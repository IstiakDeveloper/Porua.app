import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    CalendarDays
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface AttendanceRecord {
    id: number;
    date: string;
    day: string;
    status: string;
    in_time: string | null;
    out_time: string | null;
    reason: string | null;
}

interface Summary {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface YearlySummary {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface Props {
    student: Student;
    attendance: AttendanceRecord[];
    summary: Summary;
    yearlySummary: YearlySummary;
    filters: {
        month: number;
        year: number;
    };
    availableMonths: number[];
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Index({ student, attendance = [], summary, yearlySummary, filters }: Props) {
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);

    const handleFilterChange = (month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get('/student/attendance', { month, year }, { preserveState: true });
    };

    const previousMonth = () => {
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        handleFilterChange(newMonth, newYear);
    };

    const nextMonth = () => {
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        handleFilterChange(newMonth, newYear);
    };

    const getStatusBadge = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Present
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Absent
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Late
                    </span>
                );
            case 'half_day':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Half Day
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`My Attendance - ${student.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. PAGE HEADER */}
                <FormPageHeader
                    title="My Attendance Log"
                    subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number}`}
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `${months[selectedMonth - 1]} ${selectedYear}`, variant: 'neutral' },
                        { label: `${yearlySummary?.percentage ?? 0}% Annual Rate`, variant: (yearlySummary?.percentage ?? 0) >= 80 ? 'success' : 'neutral' }
                    ]}
                    actionSlot={
                        <Link
                            href="/student/attendance/summary"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Annual Summary
                        </Link>
                    }
                />

                {/* 2. FOUR KPI CARDS (MONTHLY BREAKDOWN) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">Working Days</span>
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">{summary?.total ?? 0}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recorded this month</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-emerald-600">Present Days</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 tracking-tight">{summary?.present ?? 0}</div>
                        <p className="text-[11px] text-emerald-600 mt-0.5">{summary?.percentage ?? 0}% monthly rate</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-rose-600">Absent Days</span>
                            <XCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold text-rose-700 tracking-tight">{summary?.absent ?? 0}</div>
                        <p className="text-[11px] text-rose-600 mt-0.5">{summary?.total ? Math.round((summary.absent / summary.total) * 100) : 0}% absent rate</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-amber-600">Late Arrivals</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-700 tracking-tight">{summary?.late ?? 0}</div>
                        <p className="text-[11px] text-amber-600 mt-0.5">Punctuality flags</p>
                    </div>
                </div>

                {/* 3. MONTH SELECTOR STRIP */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
                    <button
                        type="button"
                        onClick={previousMonth}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous Month
                    </button>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {months[selectedMonth - 1]} {selectedYear}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={nextMonth}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Next Month
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* 4. DUAL VIEW: MOBILE CARDS FEED (< 768px) & HIGH-DENSITY TABLE (>= 768px) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {attendance && attendance.length > 0 ? (
                        <>
                            {/* Mobile Card Feed */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {attendance.map((record) => (
                                    <div key={record.id} className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-slate-900">
                                                    {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-xs text-slate-500 ml-1.5">({record.day})</span>
                                            </div>
                                            {getStatusBadge(record.status)}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                                            <span>In: <strong className="text-slate-800">{record.in_time || '—'}</strong></span>
                                            <span>Out: <strong className="text-slate-800">{record.out_time || '—'}</strong></span>
                                        </div>

                                        {record.reason && (
                                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                                                Note: {record.reason}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Day</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In Time</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Out Time</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Remarks / Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {attendance.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{record.day}</td>
                                                <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                                                <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">{record.in_time || '—'}</td>
                                                <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">{record.out_time || '—'}</td>
                                                <td className="px-4 py-3 text-slate-500">{record.reason || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No attendance logs found for {months[selectedMonth - 1]} {selectedYear}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
