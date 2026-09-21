import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import {
    Plus, Calendar, Users, Trash2, Clock, UserCheck, UserX,
    RefreshCw, Download, AlertCircle
} from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    admission_number: string;
    roll_number?: string;
    user?: { name: string; email: string } | null;
}

interface Attendance {
    id: number;
    date: string;
    status: string;
    in_time: string | null;
    out_time: string | null;
    reason: string | null;
    student: Student;
    school_class: SchoolClass;
    section: Section;
}

interface IndexProps {
    attendances: {
        data: Attendance[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { date: string; class_id?: string; section_id?: string; status?: string };
    stats: { total: number; present: number; absent: number; late: number; excused: number };
    classes: SchoolClass[];
    sections: Section[];
}

export default function Index({ attendances, filters, stats, classes, sections }: IndexProps) {
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const applyFilters = (updates: Partial<{ date: string; class_id: string; section_id: string; status: string }> = {}) => {
        const date = updates.date ?? selectedDate;
        const classId = updates.class_id ?? selectedClass;
        const sectionId = updates.section_id ?? selectedSection;
        const status = updates.status ?? selectedStatus;
        router.get('/student-attendance', {
            date,
            class_id: classId || undefined,
            section_id: sectionId || undefined,
            status: status || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        applyFilters({ date });
    };

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        applyFilters({ class_id: classId, section_id: '' });
    };

    const handleSectionChange = (sectionId: string) => {
        setSelectedSection(sectionId);
        applyFilters({ section_id: sectionId });
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        applyFilters({ status });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this attendance record?')) {
            router.delete(`/student-attendance/${id}`, { preserveScroll: true });
        }
    };

    const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
        present: { label: 'Present', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
        absent: { label: 'Absent', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
        late: { label: 'Late', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
        excused: { label: 'Excused', badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
        half_day: { label: 'Half day', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500' },
    };

    const formatTime = (time: string | null) => {
        if (!time) return '—';
        try {
            return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return time;
        }
    };

    const calcHours = (inTime: string | null, outTime: string | null) => {
        if (!inTime || !outTime) return '—';
        try {
            const d = new Date(outTime).getTime() - new Date(inTime).getTime();
            const h = Math.floor(d / (1000 * 60 * 60));
            const m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
            return `${h}h ${m}m`;
        } catch {
            return '—';
        }
    };

    const filteredSections = selectedClass
        ? sections.filter(s => s.class_id.toString() === selectedClass)
        : sections;

    const data = attendances.data;

    return (
        <AuthenticatedLayout>
            <Head title="Student Attendance" />

            <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Attendance</h1>
                        <p className="text-xs text-slate-500 mt-0.5">View, filter and manage student attendance records</p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                        <Link href="/student-attendance/calendar" className="w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm justify-center" icon={<Calendar className="w-4 h-4" />}>
                                Calendar
                            </Button>
                        </Link>
                        <Link href={`/student-attendance/create?date=${selectedDate}${selectedClass ? `&class_id=${selectedClass}` : ''}${selectedSection ? `&section_id=${selectedSection}` : ''}`} className="w-full sm:w-auto">
                            <Button size="sm" className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm justify-center" icon={<Plus className="w-4 h-4" />}>
                                Mark
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, bg: 'bg-slate-100 text-slate-700' },
                        { label: 'Present', value: stats.present, icon: UserCheck, bg: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Absent', value: stats.absent, icon: UserX, bg: 'bg-rose-50 text-rose-700' },
                        { label: 'Late', value: stats.late, icon: Clock, bg: 'bg-amber-50 text-amber-700' },
                        { label: 'Excused', value: stats.excused, icon: AlertCircle, bg: 'bg-sky-50 text-sky-700' },
                    ].map(({ label, value, icon: Icon, bg }) => (
                        <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">{label}</span>
                                <div className={`p-1 rounded-md ${bg}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full sm:w-auto h-8.5 rounded-xl border border-slate-200/80 bg-white px-2.5 text-xs text-slate-800 shadow-2xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className="w-full h-8.5 rounded-xl border border-slate-200/80 bg-white px-2.5 text-xs text-slate-800 shadow-2xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 sm:min-w-[120px]"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Section</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => handleSectionChange(e.target.value)}
                                disabled={!selectedClass}
                                className="w-full h-8.5 rounded-xl border border-slate-200/80 bg-white px-2.5 text-xs text-slate-800 shadow-2xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 sm:min-w-[110px] disabled:bg-slate-50"
                            >
                                <option value="">All Sections</option>
                                {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full h-8.5 rounded-xl border border-slate-200/80 bg-white px-2.5 text-xs text-slate-800 shadow-2xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 sm:min-w-[110px]"
                            >
                                <option value="">All Statuses</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex gap-1.5 pt-1 sm:pt-0">
                            <button
                                type="button"
                                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                                className="flex-1 sm:flex-none h-8.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors justify-center flex items-center"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFilters()}
                                className="flex-1 sm:flex-none h-8.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 inline-flex items-center justify-center gap-1 shadow-2xs transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Apply
                            </button>
                        </div>
                        <p className="col-span-2 sm:col-span-1 text-[11px] font-medium text-slate-400 sm:ml-auto self-center text-center sm:text-right">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-slate-900">Student Register</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {data.length} record{data.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Link href="/student-attendance/report" className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                            <Download className="w-3.5 h-3.5 text-slate-400" /> Report
                        </Link>
                    </div>

                    {/* Mobile Card Feed (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((att) => {
                                const name = att.student?.user?.name ?? att.student?.admission_number ?? '—';
                                const initial = (att.student?.user?.name?.charAt(0) ?? att.student?.admission_number?.charAt(0) ?? '?').toUpperCase();
                                const statusKey = att.status?.toLowerCase() || '';
                                const meta = statusConfig[statusKey];

                                return (
                                    <div key={att.id} className="p-3 space-y-2.5 active:bg-slate-50/60 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-900/10 flex items-center justify-center text-xs font-bold">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-900 truncate">{name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">Adm: {att.student?.admission_number ?? '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {meta ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${meta.badge}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                        {meta.label}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        {att.status}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(att.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-50">
                                            <span className="inline-flex items-center font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                                {att.school_class?.name} · {att.section?.name}
                                            </span>
                                            <div className="flex items-center gap-2 font-mono text-[10px]">
                                                <span>In: {formatTime(att.in_time)}</span>
                                                <span>Out: {formatTime(att.out_time)}</span>
                                                <span className="font-semibold text-indigo-600 bg-indigo-50 px-1 rounded">
                                                    {calcHours(att.in_time, att.out_time)}
                                                </span>
                                            </div>
                                        </div>

                                        {att.reason && (
                                            <p className="text-[10px] text-slate-500 bg-slate-50 rounded-md p-1.5 italic">
                                                Reason: {att.reason}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-medium text-slate-600">No attendance records for this date.</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100/90 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Student</th>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Class</th>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Status</th>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">In</th>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Out</th>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Duration</th>
                                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">Reason</th>
                                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-700 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {data.length > 0 ? data.map((att) => {
                                    const name = att.student?.user?.name ?? att.student?.admission_number ?? '—';
                                    const initial = (att.student?.user?.name?.charAt(0) ?? att.student?.admission_number?.charAt(0) ?? '?').toUpperCase();
                                    const statusKey = att.status?.toLowerCase() || '';
                                    const meta = statusConfig[statusKey];

                                    return (
                                        <tr key={att.id} className="border-b border-slate-200/90 hover:bg-slate-50/80 transition-colors">
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-900/10 flex items-center justify-center text-[10px] font-bold">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono leading-tight mt-0.5">Adm: {att.student?.admission_number ?? '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-medium text-slate-600">
                                                {att.school_class?.name} · {att.section?.name}
                                            </td>
                                            <td className="px-3 py-2">
                                                {meta ? (
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${meta.badge}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                        {meta.label}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        {att.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-700">{formatTime(att.in_time)}</td>
                                            <td className="px-3 py-2 text-xs font-mono text-slate-700">{formatTime(att.out_time)}</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                                    {calcHours(att.in_time, att.out_time)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-[11px] text-slate-500 max-w-[140px] truncate">{att.reason || '—'}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(att.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 mb-1">No student attendance records for this date.</p>
                                            <p className="text-xs text-slate-400 mb-4">You can record attendance using the button below.</p>
                                            <Link href={`/student-attendance/create?date=${selectedDate}${selectedClass ? `&class_id=${selectedClass}` : ''}${selectedSection ? `&section_id=${selectedSection}` : ''}`}>
                                                <Button size="sm" className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" icon={<Plus className="w-4 h-4" />}>Mark attendance</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={attendances.links}
                        from={attendances.from}
                        to={attendances.to}
                        total={attendances.total}
                        lastPage={attendances.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
