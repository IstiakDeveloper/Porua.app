import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, TrendingUp, UserCheck, UserX, CheckCircle2 } from 'lucide-react';

interface AttendanceRecord {
    id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'half_day';
    check_in_time: string | null;
    check_out_time: string | null;
    remarks: string | null;
}

interface Teacher {
    full_name: string;
    employee_id: string;
    designation: string;
}

interface Summary {
    present: number;
    absent: number;
    late: number;
    half_day: number;
    total_days: number;
}

interface Props {
    teacher: Teacher;
    month: number;
    year: number;
    attendanceRecords: AttendanceRecord[];
    summary: Summary;
    yearlySummary: Summary;
}

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
    present: { label: 'Present', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
    absent: { label: 'Absent', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
    late: { label: 'Late', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
    half_day: { label: 'Half Day', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500' },
    leave: { label: 'Leave', badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
};

export default function MyAttendance({ teacher, month, year, attendanceRecords, summary }: Props) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[month - 1];

    const attendancePercentage = summary.total_days > 0
        ? Math.round((summary.present / summary.total_days) * 100)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title="My Attendance" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-5">
                    {/* Header Banner */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-950/[0.02]">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">My Attendance Register</h1>
                                <p className="text-xs text-slate-500 mt-1">
                                    {teacher.full_name} · <span className="font-mono text-slate-700">{teacher.employee_id}</span> · {teacher.designation}
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {currentMonth} {year}
                            </div>
                        </div>
                    </div>

                    {/* KPI Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
                        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Working Days</span>
                                <div className="rounded-md bg-slate-100 p-1 text-slate-600">
                                    <Calendar className="h-3 w-3" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-slate-900">{summary.total_days}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Days Present</span>
                                <div className="rounded-md bg-emerald-50 p-1 text-emerald-600">
                                    <UserCheck className="h-3 w-3" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-emerald-600">{summary.present}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Days Absent</span>
                                <div className="rounded-md bg-rose-50 p-1 text-rose-600">
                                    <UserX className="h-3 w-3" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-rose-600">{summary.absent}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Late Days</span>
                                <div className="rounded-md bg-amber-50 p-1 text-amber-600">
                                    <Clock className="h-3 w-3" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-amber-600">{summary.late}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Attendance Rate</span>
                                <div className="rounded-md bg-indigo-50 p-1 text-indigo-600">
                                    <TrendingUp className="h-3 w-3" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-indigo-600">{attendancePercentage}%</p>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="border-b border-slate-100 bg-white px-4 py-2.5 flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-slate-900">
                                Log for {currentMonth} {year}
                            </h3>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {attendanceRecords.length} records
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            {attendanceRecords.length > 0 ? (
                                <>
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100/90 border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Date</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Status</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Check In</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Check Out</th>
                                                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {attendanceRecords.map((record) => {
                                                const meta = statusConfig[record.status] || {
                                                    label: record.status,
                                                    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
                                                    dot: 'bg-slate-400',
                                                };

                                                return (
                                                    <tr key={record.id} className="border-b border-slate-200/90 hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-3 py-2 text-xs font-semibold text-slate-800 font-mono">
                                                            {record.date}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ring-1 ring-inset ${meta.badge}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                                {meta.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-xs font-mono text-slate-700">
                                                            {record.check_in_time || '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-xs font-mono text-slate-700">
                                                            {record.check_out_time || '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-[11px] text-slate-500 max-w-xs truncate">
                                                            {record.remarks || '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="bg-slate-50/75 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between rounded-b-xl select-none">
                                        <span className="text-xs font-medium text-slate-500">
                                            Total <span className="font-semibold text-slate-800">{attendanceRecords.length}</span> records for this month
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {currentMonth} {year}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700">No attendance records found for this month</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Attendance records will appear here once marked by administration.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
