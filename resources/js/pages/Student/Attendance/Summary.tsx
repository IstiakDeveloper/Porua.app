import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface MonthlyRecord {
    month: string;
    month_number: number;
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface YearlyStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface Props {
    student: {
        id: number;
        full_name: string;
        class_name: string;
        section_name: string;
    };
    monthlySummary: MonthlyRecord[];
    yearlyStats: YearlyStats;
    year: number;
}

export default function AttendanceSummary({ student, monthlySummary = [], yearlyStats, year }: Props) {
    const [selectedYear, setSelectedYear] = useState(year);

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get('/student/attendance/summary', { year: newYear }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Annual Attendance Summary - ${student.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Annual Attendance Summary"
                    subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name})`}
                    backUrl="/student/attendance"
                    badges={[
                        { label: `Year ${selectedYear}`, variant: 'neutral' },
                        { label: `${yearlyStats?.percentage ?? 0}% Overall Attendance`, variant: (yearlyStats?.percentage ?? 0) >= 80 ? 'success' : 'neutral' }
                    ]}
                    actionSlot={
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(parseInt(e.target.value))}
                            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        >
                            {[year - 1, year, year + 1].map((y) => (
                                <option key={y} value={y}>
                                    Academic Year {y}
                                </option>
                            ))}
                        </select>
                    }
                />

                {/* 2. YEARLY OVERVIEW STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Days</span>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{yearlyStats?.total ?? 0}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recorded in {selectedYear}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Present</span>
                        <p className="text-2xl font-bold text-emerald-700 tracking-tight mt-1">{yearlyStats?.present ?? 0}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">{yearlyStats?.percentage ?? 0}% attendance rate</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">Absent</span>
                        <p className="text-2xl font-bold text-rose-700 tracking-tight mt-1">{yearlyStats?.absent ?? 0}</p>
                        <p className="text-[11px] text-rose-600 mt-0.5">Days missed</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Late</span>
                        <p className="text-2xl font-bold text-amber-700 tracking-tight mt-1">{yearlyStats?.late ?? 0}</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">Late entries</p>
                    </div>
                </div>

                {/* 3. MONTH-BY-MONTH BREAKDOWN (DUAL VIEW) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Month-by-Month Attendance Breakdown ({selectedYear})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Monthly attendance rate and distribution across the school calendar
                        </p>
                    </div>

                    {/* Mobile cards (< 768px) */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {monthlySummary.map((m) => (
                            <div key={m.month_number} className="p-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900">{m.month}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                        m.percentage >= 85
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : m.percentage >= 70
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                        {m.percentage}%
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <div><span className="text-slate-400 block">Total</span><strong>{m.total}</strong></div>
                                    <div><span className="text-emerald-600 block">Present</span><strong>{m.present}</strong></div>
                                    <div><span className="text-rose-600 block">Absent</span><strong>{m.absent}</strong></div>
                                    <div><span className="text-amber-600 block">Late</span><strong>{m.late}</strong></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table (>= 768px) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Working Days</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Absent</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Late</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {monthlySummary.map((m) => (
                                    <tr key={m.month_number} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-900">{m.month}</td>
                                        <td className="px-4 py-3 text-slate-600">{m.total} days</td>
                                        <td className="px-4 py-3 text-emerald-700 font-semibold">{m.present}</td>
                                        <td className="px-4 py-3 text-rose-600 font-semibold">{m.absent}</td>
                                        <td className="px-4 py-3 text-amber-600 font-semibold">{m.late}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            m.percentage >= 85
                                                                ? 'bg-emerald-500'
                                                                : m.percentage >= 70
                                                                ? 'bg-amber-500'
                                                                : 'bg-rose-500'
                                                        }`}
                                                        style={{ width: `${Math.min(m.percentage, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-slate-700">{m.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {m.total === 0 ? (
                                                <span className="text-[11px] text-slate-400">No records</span>
                                            ) : m.percentage >= 85 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Excellent
                                                </span>
                                            ) : m.percentage >= 70 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    Average
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    Low
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
