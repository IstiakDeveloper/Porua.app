import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, AlertCircle, CalendarClock, Filter } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { formatBdDate, formatClock } from '@/utils/datetime';

interface AttendanceRecord {
    id: number;
    date: string;
    day?: string;
    status: string;
    in_time?: string | null;
    out_time?: string | null;
    in_time_formatted?: string | null;
    out_time_formatted?: string | null;
    check_in_time?: string | null;
    check_out_time?: string | null;
    hours?: string | null;
    remarks?: string | null;
    auto_remarks?: string | null;
    reason?: string | null;
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
    early_leave?: number;
    leave?: number;
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
    present: { label: 'Present', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    absent: { label: 'Absent', badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    late: { label: 'Late', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    early_leave: { label: 'Early Leave', badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    half_day: { label: 'Half Day', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
    leave: { label: 'On Leave', badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    holiday: { label: 'Holiday', badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
    weekend: { label: 'Weekend', badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MyAttendance({ teacher, month, year, attendanceRecords = [], summary }: Props) {
    const currentMonth = monthNames[month - 1];
    const attendedDays = (summary.present || 0) + (summary.late || 0) + (summary.half_day || 0) + (summary.early_leave || 0);
    const attendancePercentage = summary.total_days > 0
        ? Math.round((attendedDays / summary.total_days) * 100)
        : 0;

    const handleMonthChange = (newMonth: number) => {
        router.get('/teacher/attendance/my', { month: newMonth, year }, { preserveState: true });
    };

    const handleYearChange = (newYear: number) => {
        router.get('/teacher/attendance/my', { month, year: newYear }, { preserveState: true });
    };

    const getCheckIn = (r: AttendanceRecord): string | null => {
        return r.check_in_time || r.in_time_formatted || (r.in_time ? formatClock(r.in_time) : null);
    };

    const getCheckOut = (r: AttendanceRecord): string | null => {
        return r.check_out_time || r.out_time_formatted || (r.out_time ? formatClock(r.out_time) : null);
    };

    const getRemarks = (r: AttendanceRecord): string | null => {
        return r.remarks || r.auto_remarks || r.reason || null;
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Attendance Record" />

            <div className="space-y-4 pb-8 max-w-7xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Faculty Biometric & Attendance Log"
                    subtitle={`${teacher.full_name} • ${teacher.designation} • ID: ${teacher.employee_id}`}
                    backUrl="/teacher/attendance"
                    badges={[
                        { label: `${currentMonth} ${year}`, variant: 'neutral' },
                        { label: `${attendancePercentage}% Attended`, variant: attendancePercentage >= 80 ? 'success' : 'neutral' }
                    ]}
                    actions={
                        <Link
                            href="/teacher/leaves"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                            <CalendarClock className="w-3.5 h-3.5 text-emerald-600" />
                            Leave Portal
                        </Link>
                    }
                />

                {/* 2. FIVE KPI STAT CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-[11px] font-semibold text-slate-500 block">Working Days</span>
                        <p className="text-xl font-bold text-slate-900 mt-1">{summary.total_days}</p>
                        <span className="text-[10px] text-slate-400">Excludes weekends & holidays</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-[11px] font-semibold text-emerald-600 block">Days Present</span>
                        <p className="text-xl font-bold text-emerald-700 mt-1">{summary.present}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">{attendancePercentage}% attended</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-[11px] font-semibold text-rose-600 block">Days Absent</span>
                        <p className="text-xl font-bold text-rose-700 mt-1">{summary.absent}</p>
                        <span className="text-[10px] text-rose-500">Unapproved absences</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-[11px] font-semibold text-amber-600 block">Late Arrivals</span>
                        <p className="text-xl font-bold text-amber-700 mt-1">{summary.late}</p>
                        <span className="text-[10px] text-amber-600">Delayed check-ins</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-[11px] font-semibold text-indigo-600 block">Attendance Rate</span>
                        <p className="text-xl font-bold text-indigo-700 mt-1">{attendancePercentage}%</p>
                        <span className="text-[10px] text-indigo-600">Monthly overall</span>
                    </div>
                </div>

                {/* 3. ATTENDANCE LOG TABLE (DUAL VIEW) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Detailed Check-In/Out Register ({currentMonth} {year})
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Verified biometric punch records and computed faculty attendance timeline
                            </p>
                        </div>

                        {/* Month & Year Selectors */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <select
                                value={month}
                                onChange={(e) => handleMonthChange(Number(e.target.value))}
                                className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 outline-none focus:border-emerald-500 shadow-2xs"
                            >
                                {monthNames.map((name, idx) => (
                                    <option key={name} value={idx + 1}>
                                        {name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={year}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 outline-none focus:border-emerald-500 shadow-2xs"
                            >
                                {[2024, 2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {attendanceRecords.length > 0 ? (
                        <>
                            {/* Mobile card feed */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {attendanceRecords.map((record) => {
                                    const meta = statusConfig[record.status] || {
                                        label: record.status ? record.status.replace('_', ' ') : '—',
                                        badge: 'bg-slate-100 text-slate-600 border-slate-200',
                                        dot: 'bg-slate-400',
                                    };
                                    const checkIn = getCheckIn(record);
                                    const checkOut = getCheckOut(record);
                                    const remarks = getRemarks(record);

                                    return (
                                        <div key={record.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 font-mono">
                                                        {formatBdDate(record.date)}
                                                    </span>
                                                    {record.day && (
                                                        <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                                                            {record.day}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${meta.badge}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                    {meta.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Check In</span>
                                                    <span className="font-mono text-slate-800 font-semibold text-xs">
                                                        {checkIn || '—'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Check Out</span>
                                                    <span className="font-mono text-slate-800 font-semibold text-xs">
                                                        {checkOut || '—'}
                                                    </span>
                                                </div>
                                            </div>

                                            {remarks && (
                                                <p className="text-[11px] text-slate-600 italic">
                                                    <span className="font-medium text-slate-400">Note: </span>
                                                    {remarks}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop High-Density Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check In Time</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check Out Time</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {attendanceRecords.map((record) => {
                                            const meta = statusConfig[record.status] || {
                                                label: record.status ? record.status.replace('_', ' ') : '—',
                                                badge: 'bg-slate-100 text-slate-600 border-slate-200',
                                                dot: 'bg-slate-400',
                                            };
                                            const checkIn = getCheckIn(record);
                                            const checkOut = getCheckOut(record);
                                            const remarks = getRemarks(record);

                                            return (
                                                <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono font-bold text-slate-900 block">
                                                            {formatBdDate(record.date)}
                                                        </span>
                                                        {record.day && (
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                {record.day}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${meta.badge}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                            {meta.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                                                        {checkIn ? (
                                                            <span className="text-slate-900 font-bold">{checkIn}</span>
                                                        ) : (
                                                            <span className="text-slate-300 font-normal">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                                                        {checkOut ? (
                                                            <span className="text-slate-900 font-bold">{checkOut}</span>
                                                        ) : (
                                                            <span className="text-slate-300 font-normal">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {record.hours ? (
                                                            <span className="inline-flex items-center font-mono text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-semibold">
                                                                {record.hours}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 text-xs max-w-xs">
                                                        {remarks ? (
                                                            <span className="inline-block text-slate-700 font-medium">
                                                                {remarks}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No attendance logs found for {currentMonth} {year}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
