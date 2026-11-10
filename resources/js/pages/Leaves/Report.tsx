import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import {
    BarChart3,
    Printer,
    FileSpreadsheet,
    Calendar,
    Users,
    ArrowLeft,
    CheckCircle2,
    CalendarClock,
    Tag,
    Clock,
    Filter
} from 'lucide-react';

interface LeaveType {
    id: number;
    name: string;
    code: string;
    days_per_year: number;
    color: string;
    is_paid: boolean;
}

interface TeacherSummary {
    teacher: {
        id: number;
        full_name: string;
        employee_id: string | null;
        department: string;
        designation: string;
    };
    by_type: Record<string, {
        used: number;
        allowed: number;
        remaining: number | null;
    }>;
    total_days_taken: number;
}

interface DetailedLog {
    id: number;
    teacher: {
        id: number;
        first_name: string;
        last_name: string;
        employee_id: string | null;
        department: string | null;
    };
    leave_type: {
        name: string;
        code: string;
        color: string;
        is_paid: boolean;
    };
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    action_by_user?: {
        name: string;
    };
}

interface Props {
    summaries: TeacherSummary[];
    detailedLogs: DetailedLog[];
    leaveTypes: LeaveType[];
    stats: {
        total_leave_days: number;
        total_approved_requests: number;
        paid_days: number;
        unpaid_days: number;
        teachers_on_leave_count: number;
    };
    filters: {
        year: number;
        month: number | null;
        teacher_id: number | null;
        department: string | null;
        leave_type_id: number | null;
    };
    teachers: Array<{ id: number; first_name: string; last_name: string; employee_id: string | null }>;
    departments: string[];
}

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function Report({
    summaries = [],
    detailedLogs = [],
    leaveTypes = [],
    stats,
    filters,
    teachers = [],
    departments = [],
}: Props) {
    const [year, setYear] = useState<number>(filters.year || new Date().getFullYear());
    const [month, setMonth] = useState<string>(filters.month ? String(filters.month) : '');
    const [teacherId, setTeacherId] = useState<string>(filters.teacher_id ? String(filters.teacher_id) : '');
    const [department, setDepartment] = useState<string>(filters.department || '');
    const [leaveTypeId, setLeaveTypeId] = useState<string>(filters.leave_type_id ? String(filters.leave_type_id) : '');

    const applyFilter = () => {
        router.get('/leave-reports', {
            year,
            month: month || undefined,
            teacher_id: teacherId || undefined,
            department: department || undefined,
            leave_type_id: leaveTypeId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePrint = () => {
        const query = new URLSearchParams({
            year: String(year),
            month: month || '',
            department: department || '',
            print: 'true',
        }).toString();
        window.open(`/leave-reports/print?${query}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Staff Leave Reports" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-emerald-600" />
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Staff Leave Reports & Quotas</h1>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Comprehensive employee leave consumption analytics, remaining balance audits, and print-ready registers.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => router.visit('/leave-applications')}
                            className="text-xs"
                        >
                            <CalendarClock className="w-4 h-4 mr-1.5" />
                            Leave Desk
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                        >
                            <Printer className="w-4 h-4 mr-1.5" />
                            Print Sheet (A4)
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Leave Days Taken</span>
                        <p className="mt-2 text-2xl font-black text-slate-900">{stats.total_leave_days} <span className="text-xs font-normal text-slate-400">days</span></p>
                        <span className="text-[10px] text-emerald-600 font-semibold">{stats.total_approved_requests} approved requests</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Staff on Leave</span>
                        <p className="mt-2 text-2xl font-black text-slate-900">{stats.teachers_on_leave_count}</p>
                        <span className="text-[10px] text-slate-500 font-medium">Distinct employees</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Paid Leave Days</span>
                        <p className="mt-2 text-2xl font-black text-emerald-600">{stats.paid_days} <span className="text-xs font-normal text-slate-400">days</span></p>
                        <span className="text-[10px] text-emerald-600 font-medium">Salaried absence</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unpaid Days</span>
                        <p className="mt-2 text-2xl font-black text-slate-700">{stats.unpaid_days} <span className="text-xs font-normal text-slate-400">days</span></p>
                        <span className="text-[10px] text-slate-500 font-medium">Without pay</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                {[2024, 2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                <option value="">Entire Year</option>
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Teacher</label>
                            <select
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Button
                                onClick={applyFilter}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2"
                            >
                                <Filter className="w-3.5 h-3.5 mr-1" />
                                Apply Filter
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Consumption Matrix Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Staff Leave Consumption Matrix</h3>
                            <p className="text-xs text-slate-500">Shows allowed vs taken vs remaining leave balance for each employee.</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {summaries.length} Employees Listed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/75">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Teacher / Staff
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Department
                                    </th>
                                    {leaveTypes.map((type) => (
                                        <th key={type.code} className="py-3 px-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {type.code}
                                            <span className="block text-[9px] font-normal text-slate-400 lowercase">
                                                (max {type.days_per_year}d)
                                            </span>
                                        </th>
                                    ))}
                                    <th className="py-3 px-4 text-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Total Taken
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {summaries.map((s) => (
                                    <tr key={s.teacher.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-4">
                                            <p className="text-xs font-bold text-slate-900">{s.teacher.full_name}</p>
                                            <p className="text-[11px] text-slate-500">ID: {s.teacher.employee_id || '—'} &bull; {s.teacher.designation}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs text-slate-700">{s.teacher.department}</span>
                                        </td>
                                        {leaveTypes.map((type) => {
                                            const item = s.by_type[type.code];
                                            const used = item?.used || 0;
                                            const allowed = item?.allowed || 0;
                                            const remaining = item?.remaining;

                                            return (
                                                <td key={type.code} className="py-3 px-3 text-center">
                                                    {used > 0 ? (
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {used}d
                                                            </span>
                                                            {remaining !== null && (
                                                                <span className="block text-[10px] text-slate-400">
                                                                    ({remaining} left)
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                                                s.total_days_taken > 0
                                                    ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-600/20'
                                                    : 'text-slate-400'
                                            }`}>
                                                {s.total_days_taken} {s.total_days_taken === 1 ? 'day' : 'days'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {summaries.length === 0 && (
                                    <tr>
                                        <td colSpan={3 + leaveTypes.length} className="py-10 text-center text-xs text-slate-400">
                                            No employee records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detailed Logs */}
                {detailedLogs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Recent Approved Leave History</h3>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/75">
                                <tr>
                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600">Employee</th>
                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600">Type</th>
                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600">Period</th>
                                    <th className="py-2.5 px-4 text-center text-xs font-semibold text-slate-600">Days</th>
                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600">Reason</th>
                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600">Approved By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {detailedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50">
                                        <td className="py-2.5 px-4 text-xs font-medium text-slate-900">
                                            {log.teacher.first_name} {log.teacher.last_name}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs">
                                            <span className="font-semibold text-slate-700">{log.leave_type.name}</span>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-slate-600">
                                            {log.start_date} to {log.end_date}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-center font-bold text-slate-900">
                                            {log.total_days}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                                            {log.reason}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-slate-500">
                                            {log.action_by_user?.name || 'Administrator'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

