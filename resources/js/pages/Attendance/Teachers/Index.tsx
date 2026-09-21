import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import ComboSelect from '@/Components/ComboSelect';
import IndexPagination from '@/Components/IndexPagination';
import { AttendancePageHeader, type AttendancePersonType } from '@/Components/TeacherAttendanceNav';
import {
    Calendar,
    Users,
    Trash2,
    Clock,
    UserCheck,
    UserX,
    RefreshCw,
    Search,
    Plus,
    Edit,
} from 'lucide-react';

interface Person {
    id: number;
    name: string;
    employee_id: string | null;
    email?: string | null;
    designation?: string | null;
    department?: string | null;
    class_name?: string | null;
    section_name?: string | null;
}

interface AttendanceRow {
    id: number | null;
    teacher_id: number;
    date: string;
    status: string | null;
    in_time: string | null;
    out_time: string | null;
    in_time_formatted: string | null;
    out_time_formatted: string | null;
    hours: string | null;
    remarks: string | null;
    auto_remarks: string | null;
    teacher: Person;
}

interface DeviceSettingInfo {
    device_name: string;
    device_ip: string;
    last_sync_at: string | null;
}

interface ClassOption {
    id: number;
    name: string;
}

interface SectionOption {
    id: number;
    name: string;
    class_id: number;
}

interface IndexProps {
    reportType?: AttendancePersonType;
    attendances: {
        data: AttendanceRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        report_type?: string;
        date: string;
        status?: string;
        search?: string;
        department?: string;
        class_id?: string | number | null;
        section_id?: string | number | null;
        per_page?: number;
    };
    stats: {
        total: number;
        present: number;
        absent: number;
        late: number;
        leave: number;
        early_leave?: number;
        half_day?: number;
        holiday?: number;
        weekend?: number;
    };
    departments: string[];
    classes?: ClassOption[];
    sections?: SectionOption[];
    needsClass?: boolean;
    deviceSetting?: DeviceSettingInfo | null;
}

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
    present: { label: 'Present', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
    absent: { label: 'Absent', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
    late: { label: 'Late', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
    early_leave: { label: 'Early leave', badge: 'bg-orange-50 text-orange-700 ring-orange-600/20', dot: 'bg-orange-500' },
    half_day: { label: 'Half day', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500' },
    holiday: { label: 'Holiday', badge: 'bg-purple-50 text-purple-700 ring-purple-600/20', dot: 'bg-purple-500' },
    leave: { label: 'Leave', badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
    weekend: { label: 'Weekend', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' },
};

const statusItems = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'early_leave', label: 'Early leave' },
    { value: 'half_day', label: 'Half day' },
    { value: 'leave', label: 'Leave' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'weekend', label: 'Weekend' },
];

const fieldLabel = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const dateInput = 'h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

export default function Index({
    reportType = 'teacher',
    attendances,
    filters,
    stats,
    departments,
    classes = [],
    sections = [],
    needsClass = false,
    deviceSetting,
}: IndexProps) {
    const isStudent = reportType === 'student';
    const personLabel = isStudent ? 'student' : 'teacher';
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [search, setSearch] = useState(filters.search || '');
    const [department, setDepartment] = useState(filters.department || '');
    const [classId, setClassId] = useState(filters.class_id ? String(filters.class_id) : '');
    const [sectionId, setSectionId] = useState(filters.section_id ? String(filters.section_id) : '');

    const sectionItems = useMemo(
        () => sections
            .filter((section) => !classId || String(section.class_id) === classId)
            .map((section) => ({ value: String(section.id), label: section.name })),
        [sections, classId],
    );

    const applyFilters = (overrides: Record<string, string | undefined> = {}) => {
        const nextType = (overrides.report_type as AttendancePersonType) || reportType;
        router.get('/teacher-attendance', {
            report_type: nextType,
            date: overrides.date ?? selectedDate,
            status: (overrides.status ?? selectedStatus) || undefined,
            search: (overrides.search ?? search) || undefined,
            department: nextType === 'teacher' ? (overrides.department ?? department) || undefined : undefined,
            class_id: nextType === 'student' ? (overrides.class_id ?? classId) || undefined : undefined,
            section_id: nextType === 'student' ? (overrides.section_id ?? sectionId) || undefined : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const switchType = (next: AttendancePersonType) => {
        setDepartment('');
        setClassId('');
        setSectionId('');
        setSearch('');
        applyFilters({
            report_type: next,
            department: '',
            class_id: '',
            section_id: '',
            search: '',
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this attendance record?')) {
            router.delete(isStudent ? `/student-attendance/${id}` : `/teacher-attendance/${id}`, { preserveScroll: true });
        }
    };

    const markHref = isStudent
        ? `/student-attendance/create?date=${selectedDate}${classId ? `&class_id=${classId}` : ''}${sectionId ? `&section_id=${sectionId}` : ''}`
        : `/teacher-attendance/create?date=${selectedDate}`;

    return (
        <AuthenticatedLayout>
            <Head title="Daily Attendance" />

            <div className="space-y-5">
                <AttendancePageHeader
                    title="Daily Attendance"
                    subtitle={isStudent ? 'All students for the selected date, including unmarked records' : 'All teachers for the selected date, including unmarked records'}
                    current="daily"
                    date={selectedDate}
                    reportType={reportType}
                    onTypeChange={switchType}
                    extra={deviceSetting ? (
                        <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-[11px] text-slate-500 shadow-sm">
                            <span className="font-semibold text-slate-700">{deviceSetting.device_name || 'Device'}</span>
                            {deviceSetting.last_sync_at && (
                                <span>· {new Date(deviceSetting.last_sync_at).toLocaleString()}</span>
                            )}
                        </div>
                    ) : undefined}
                />
                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, bg: 'bg-slate-100 text-slate-700' },
                        { label: 'Present', value: stats.present, icon: UserCheck, bg: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Absent', value: stats.absent, icon: UserX, bg: 'bg-rose-50 text-rose-700' },
                        { label: 'Late', value: stats.late, icon: Clock, bg: 'bg-amber-50 text-amber-700' },
                        { label: 'Early leave', value: stats.early_leave ?? 0, icon: Clock, bg: 'bg-orange-50 text-orange-700' },
                        { label: 'Leave', value: stats.leave, icon: Calendar, bg: 'bg-sky-50 text-sky-700' },
                        { label: 'Holiday', value: stats.holiday ?? 0, icon: Calendar, bg: 'bg-purple-50 text-purple-700' },
                        { label: 'Weekend', value: stats.weekend ?? 0, icon: Calendar, bg: 'bg-slate-100 text-slate-600' },
                    ].map(({ label, value, icon: Icon, bg }) => (
                        <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">{label}</span>
                                <div className={`inline-flex rounded-md p-1 ${bg}`}>
                                    <Icon className="h-3 w-3" />
                                </div>
                            </div>
                            <p className="mt-1 text-base font-bold tracking-tight text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Panel */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                        <div className="md:col-span-2">
                            <label className={fieldLabel}>Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    applyFilters({ date: e.target.value });
                                }}
                                className={dateInput}
                            />
                        </div>
                        <div className={isStudent ? 'md:col-span-2' : 'md:col-span-3'}>
                            <label className={fieldLabel}>Search {personLabel}</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={isStudent ? 'Name, adm or roll...' : 'Search by name or ID...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className={`${dateInput} pl-8`}
                                />
                            </div>
                        </div>
                        {isStudent ? (
                            <>
                                <div className="md:col-span-2">
                                    <label className={fieldLabel}>Class</label>
                                    <ComboSelect
                                        value={classId || null}
                                        onChange={(next) => {
                                            setClassId(next || '');
                                            setSectionId('');
                                            applyFilters({ class_id: next || '', section_id: '' });
                                        }}
                                        items={classes.map((item) => ({ value: String(item.id), label: item.name }))}
                                        placeholder="All classes"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={fieldLabel}>Section</label>
                                    <ComboSelect
                                        value={sectionId || null}
                                        onChange={(next) => {
                                            setSectionId(next || '');
                                            applyFilters({ section_id: next || '' });
                                        }}
                                        items={sectionItems}
                                        placeholder="All sections"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-2">
                                <label className={fieldLabel}>Department</label>
                                <ComboSelect
                                    value={department || null}
                                    onChange={(next) => {
                                        setDepartment(next || '');
                                        applyFilters({ department: next || '' });
                                    }}
                                    items={departments.map((dept) => ({ value: dept, label: dept }))}
                                    placeholder="All departments"
                                />
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className={fieldLabel}>Status</label>
                            <ComboSelect
                                value={selectedStatus || null}
                                onChange={(next) => {
                                    setSelectedStatus(next || '');
                                    applyFilters({ status: next || '' });
                                }}
                                items={statusItems}
                                placeholder="All statuses"
                            />
                        </div>
                        <div className="flex gap-2 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setSelectedDate(today);
                                    applyFilters({ date: today });
                                }}
                            >
                                Today
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="h-9 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800"
                                onClick={() => applyFilters()}
                                icon={<RefreshCw className="h-3.5 w-3.5" />}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-semibold text-slate-900">Attendance Register</h2>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {attendances.total} {personLabel}{attendances.total !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-100/90">
                                <tr>
                                    {[isStudent ? 'Student' : 'Teacher', 'ID', isStudent ? 'Class' : 'Dept', 'Status', 'In', 'Out', 'Hours', 'Remarks', ''].map((heading, i) => (
                                        <th
                                            key={i}
                                            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700 ${heading === '' ? 'text-right' : ''}`}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {attendances.data.length > 0 ? attendances.data.map((row) => {
                                    const person = row.teacher;
                                    const initial = (person?.name?.charAt(0) ?? person?.employee_id?.charAt(0) ?? '?').toUpperCase();
                                    const statusKey = row.status?.toLowerCase() || '';
                                    const meta = statusConfig[statusKey];

                                    return (
                                        <tr key={`${row.teacher_id}-${row.date}`} className="border-b border-slate-200/90 hover:bg-slate-50/80 transition-colors">
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-900/10">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                                            {person?.name}
                                                        </p>
                                                        {person?.designation && (
                                                            <p className="text-[10px] text-slate-400 leading-tight">{person.designation}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                                    {person?.employee_id ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-600">
                                                {person?.department || '—'}
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
                                                        {row.status ? row.status.replace('_', ' ') : 'Unmarked'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-700 font-mono">
                                                {row.in_time_formatted || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-700 font-mono">
                                                {row.out_time_formatted || '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {row.hours || '—'}
                                                </span>
                                            </td>
                                            <td className="max-w-[160px] truncate px-3 py-2 text-[11px] text-slate-500" title={row.auto_remarks || row.remarks || ''}>
                                                {row.auto_remarks || row.remarks || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(row)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center">
                                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700">No attendance records found</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your date or filter options</p>
                                            <Link href={markHref} className="mt-4 inline-block">
                                                <Button size="sm" className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" icon={<Plus className="h-3.5 w-3.5" />}>
                                                    Mark Attendance
                                                </Button>
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
