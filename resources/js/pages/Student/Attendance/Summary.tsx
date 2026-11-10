import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    Calendar,
    ChevronLeft,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    BarChart3
} from 'lucide-react';

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

export default function AttendanceSummary({ student, monthlySummary, yearlyStats, year }: Props) {
    const [selectedYear, setSelectedYear] = useState(year);

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        router.get('/student/attendance/summary', { year: newYear }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/student/attendance"
                                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-emerald-700"
                            >
                                <ChevronLeft className="w-4 h-4 mr-0.5" />
                                Back to Attendance
                            </Link>
                        </div>
                        <h2 className="font-semibold text-xl text-slate-800 leading-tight flex items-center gap-2 mt-1">
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                            Annual Attendance Summary
                        </h2>
                        <p className="text-xs text-slate-500">
                            {student.full_name} • {student.class_name} ({student.section_name})
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(parseInt(e.target.value))}
                            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {[year - 1, year, year + 1].map((y) => (
                                <option key={y} value={y}>
                                    Year {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Attendance Summary" />

            <div className="space-y-6">
                {/* Yearly Overview Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-slate-200/80 shadow-xs">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Days</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{yearlyStats.total}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Recorded in {selectedYear}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200/80 bg-emerald-50/30 shadow-xs">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Present</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">{yearlyStats.present}</p>
                            <p className="text-[11px] text-emerald-600 mt-0.5">{yearlyStats.percentage}% Attendance</p>
                        </CardContent>
                    </Card>

                    <Card className="border-rose-200/80 bg-rose-50/30 shadow-xs">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-rose-700 uppercase tracking-wider">Absent</p>
                            <p className="text-2xl font-bold text-rose-700 mt-1">{yearlyStats.absent}</p>
                            <p className="text-[11px] text-rose-600 mt-0.5">Days Missed</p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200/80 bg-amber-50/30 shadow-xs">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Late</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">{yearlyStats.late}</p>
                            <p className="text-[11px] text-amber-600 mt-0.5">Punctuality Flags</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Month-by-Month Breakdown */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-slate-800">
                            Month-by-Month Attendance Breakdown
                        </CardTitle>
                        <CardDescription>
                            Detailed breakdown of your presence and absence across each month of {selectedYear}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                                        <th className="py-3 px-4">Month</th>
                                        <th className="py-3 px-4">Working Days</th>
                                        <th className="py-3 px-4">Present</th>
                                        <th className="py-3 px-4">Absent</th>
                                        <th className="py-3 px-4">Late</th>
                                        <th className="py-3 px-4">Rate</th>
                                        <th className="py-3 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {monthlySummary.map((m) => (
                                        <tr key={m.month_number} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-slate-800">{m.month}</td>
                                            <td className="py-3 px-4 text-slate-600">{m.total} days</td>
                                            <td className="py-3 px-4 text-emerald-700 font-medium">{m.present}</td>
                                            <td className="py-3 px-4 text-rose-600 font-medium">{m.absent}</td>
                                            <td className="py-3 px-4 text-amber-600 font-medium">{m.late}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                                            <td className="py-3 px-4 text-right">
                                                {m.total === 0 ? (
                                                    <span className="text-[11px] text-slate-400">No records</span>
                                                ) : m.percentage >= 85 ? (
                                                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                                        Excellent
                                                    </Badge>
                                                ) : m.percentage >= 70 ? (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                                        Average
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-rose-200">
                                                        Low
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

