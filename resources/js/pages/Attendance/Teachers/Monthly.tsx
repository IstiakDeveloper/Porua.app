import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from 'lucide-react';
import Button from '@/Components/Button';
import ComboSelect from '@/Components/ComboSelect';
import IndexPagination from '@/Components/IndexPagination';
import { AttendancePageHeader, type AttendancePersonType } from '@/Components/TeacherAttendanceNav';

interface DayCell {
    status: string | null;
    in_time_formatted: string | null;
    out_time_formatted: string | null;
    auto_remarks: string | null;
    holiday_name: string | null;
    missing_checkout?: boolean;
}

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    designation?: string;
    department?: string;
    attendance: Record<number, DayCell>;
    summary: Record<string, number>;
    present_count: number;
}

interface PaginatedTeachers {
    data: Teacher[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number | null;
    to?: number | null;
    links?: Array<{ url: string | null; label: string; active: boolean }>;
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

interface Props {
    reportType?: AttendancePersonType;
    teachers: PaginatedTeachers;
    month: string;
    year: number;
    month_number: number;
    daysInMonth: number;
    departments: string[];
    classes?: ClassOption[];
    sections?: SectionOption[];
    needsClass?: boolean;
    schoolName?: string;
    filters: {
        report_type?: string;
        search?: string;
        department?: string;
        class_id?: string | number | null;
        section_id?: string | number | null;
        month?: string;
        per_page?: number | string;
    };
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const statusMeta: Record<string, { bg: string; text: string; label: string; border: string }> = {
    present: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'P', border: 'border-emerald-200/70' },
    absent: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'A', border: 'border-rose-200/70' },
    late: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'L', border: 'border-amber-200/70' },
    early_leave: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'EL', border: 'border-orange-200/70' },
    half_day: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'HD', border: 'border-indigo-200/70' },
    leave: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'LV', border: 'border-sky-200/70' },
    holiday: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'H', border: 'border-purple-200/70' },
    weekend: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'W', border: 'border-slate-200/70' },
};

const fieldLabel = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const dateInput = 'h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

export default function Monthly({
    reportType = 'teacher',
    teachers,
    month,
    year,
    month_number,
    daysInMonth,
    departments,
    classes = [],
    sections = [],
    needsClass = false,
    filters,
}: Props) {
    const isStudent = reportType === 'student';
    const personLabel = isStudent ? 'student' : 'teacher';
    const [search, setSearch] = useState(filters.search || '');
    const [department, setDepartment] = useState(filters.department || '');
    const [classId, setClassId] = useState(filters.class_id ? String(filters.class_id) : '');
    const [sectionId, setSectionId] = useState(filters.section_id ? String(filters.section_id) : '');
    const rows = teachers.data || [];

    const sectionItems = useMemo(
        () => sections
            .filter((section) => !classId || String(section.class_id) === classId)
            .map((section) => ({ value: String(section.id), label: section.name })),
        [sections, classId],
    );

    const apply = (overrides: Record<string, string | number | undefined> = {}) => {
        const nextType = (overrides.report_type as AttendancePersonType) || reportType;
        router.get('/teacher-attendance/monthly', {
            report_type: nextType,
            month: overrides.month ?? month,
            search: overrides.search ?? search,
            department: nextType === 'teacher' ? (overrides.department ?? department) || undefined : undefined,
            class_id: nextType === 'student' ? (overrides.class_id ?? classId) || undefined : undefined,
            section_id: nextType === 'student' ? (overrides.section_id ?? sectionId) || undefined : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const shiftMonth = (delta: number) => {
        const date = new Date(year, month_number - 1 + delta, 1);
        apply({ month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
    };

    const switchType = (next: AttendancePersonType) => {
        setDepartment('');
        setClassId('');
        setSectionId('');
        setSearch('');
        apply({
            report_type: next,
            department: '',
            class_id: '',
            section_id: '',
            search: '',
        });
    };

    const openPdf = () => {
        const params = new URLSearchParams();
        params.set('month', month);
        params.set('report_type', reportType);
        if (search) params.set('search', search);
        if (isStudent) {
            if (classId) params.set('class_id', classId);
            if (sectionId) params.set('section_id', sectionId);
        } else if (department) {
            params.set('department', department);
        }
        window.open(`/teacher-attendance/monthly/pdf?${params.toString()}`, '_blank');
    };

    const cellTitle = (cell?: DayCell) => {
        if (!cell?.status) return '';
        const parts = [cell.status.replace('_', ' ')];
        if (cell.in_time_formatted || cell.out_time_formatted) {
            parts.push(`${cell.in_time_formatted || '—'} – ${cell.out_time_formatted || '—'}`);
        }
        if (cell.auto_remarks) parts.push(cell.auto_remarks);
        return parts.join(' · ');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monthly Attendance" />

            <div className="space-y-5 print:hidden">
                <AttendancePageHeader
                    title="Monthly View"
                    subtitle={isStudent ? 'Status grid for every student in the selected month' : 'Status grid for every teacher in the selected month'}
                    current="monthly"
                    reportType={reportType}
                    onTypeChange={switchType}
                    extra={
                        <Button onClick={openPdf} size="sm" className="h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm" variant="outline" icon={<Printer className="h-3.5 w-3.5" />}>
                            Print / PDF
                        </Button>
                    }
                />

                {/* Filter Panel */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="grid grid-cols-1 items-end gap-3.5 md:grid-cols-12">
                        <div className={isStudent ? 'md:col-span-4' : 'md:col-span-5'}>
                            <label className={fieldLabel}>Search {personLabel}</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={isStudent ? 'Name, admission or roll' : 'Name or employee ID'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && apply()}
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
                                            apply({ class_id: next || '', section_id: '' });
                                        }}
                                        items={classes.map((item) => ({ value: String(item.id), label: item.name }))}
                                        placeholder="All classes"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={fieldLabel}>Section</label>
                                    <ComboSelect
                                        value={sectionId || null}
                                        onChange={(next) => {
                                            setSectionId(next || '');
                                            apply({ section_id: next || '' });
                                        }}
                                        items={sectionItems}
                                        placeholder="All sections"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-4">
                                <label className={fieldLabel}>Department</label>
                                <ComboSelect
                                    value={department || null}
                                    onChange={(next) => {
                                        setDepartment(next || '');
                                        apply({ department: next || '' });
                                    }}
                                    items={departments.map((dept) => ({ value: dept, label: dept }))}
                                    placeholder="All departments"
                                />
                            </div>
                        )}
                        <div className="md:col-span-3">
                            <Button size="sm" className="h-9 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => apply()}>Apply</Button>
                        </div>
                    </div>
                </div>

                {/* Status Legend Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Legend:</span>
                        {Object.entries(statusMeta).map(([key, badge]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                                    {badge.label}
                                </div>
                                <span className="text-xs font-medium capitalize text-slate-600">{key.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Matrix Table Container */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <CalendarIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">{months[month_number - 1]} {year}</h3>
                                <p className="text-xs text-slate-500">{rows.length} {personLabel}{rows.length !== 1 ? 's' : ''} listed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => shiftMonth(-1)}
                                className="rounded-xl border border-slate-200/80 p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                title="Previous Month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-700">{months[month_number - 1]}</span>
                            <button
                                onClick={() => shiftMonth(1)}
                                className="rounded-xl border border-slate-200/80 p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                title="Next Month"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="sticky left-0 z-30 border-r border-slate-200 bg-slate-100 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-800 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]" style={{ minWidth: '160px' }}>
                                        {isStudent ? 'Student' : 'Teacher / Staff'}
                                    </th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const d = new Date(Number(year), Number(month_number) - 1, day);
                                        const dayOfWeek = d.getDay();
                                        const dayName = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek];
                                        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                                        return (
                                            <th
                                                key={day}
                                                className={`border-r border-slate-200/80 px-0.5 py-1 text-center select-none ${isWeekend ? 'bg-rose-50/60' : 'bg-slate-50'}`}
                                                style={{ minWidth: '28px', width: '28px' }}
                                                title={`${dayName}, ${months[month_number - 1]} ${day}`}
                                            >
                                                <div className={`text-[8px] font-semibold uppercase leading-none ${isWeekend ? 'text-rose-600' : 'text-slate-400'}`}>
                                                    {dayName}
                                                </div>
                                                <div className={`text-[11px] font-bold leading-tight mt-0.5 ${isWeekend ? 'text-rose-700' : 'text-slate-700'}`}>
                                                    {day}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    {['P', 'A', 'L', 'EL', 'LV', 'H', 'W'].map((label) => (
                                        <th key={label} className="border-l border-slate-200 bg-slate-100 px-1 py-1 text-center text-[10px] font-bold text-slate-700 uppercase" style={{ minWidth: '28px' }}>
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {rows.length > 0 ? rows.map((teacher) => (
                                    <tr key={teacher.id} className="border-b border-slate-200/90 hover:bg-slate-50/80 transition-colors">
                                        <td className="sticky left-0 z-10 border-r border-b border-slate-200 bg-white group-hover:bg-slate-50 px-2.5 py-1.5 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] transition-colors">
                                            <p className="text-xs font-semibold leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[140px]">{teacher.name}</p>
                                            <p className="font-mono text-[10px] text-slate-500 mt-0.5">{teacher.employee_id}</p>
                                        </td>
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                            const cell = teacher.attendance[day];
                                            const badge = cell?.status ? statusMeta[cell.status] : null;
                                            const d = new Date(Number(year), Number(month_number) - 1, day);
                                            const isWeekend = d.getDay() === 5 || d.getDay() === 6;

                                            return (
                                                <td key={day} className={`border-r border-b border-slate-100 p-0 text-center ${isWeekend ? 'bg-slate-50/40' : ''}`} style={{ height: '28px' }} title={cellTitle(cell)}>
                                                    {badge ? (
                                                        <div className={`${badge.bg} ${badge.text} ${badge.border} border mx-auto flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold shadow-2xs`}>
                                                            {badge.label}
                                                        </div>
                                                    ) : (
                                                        <span className="flex justify-center text-[9px] text-slate-300 font-mono">·</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        {['present', 'absent', 'late', 'early_leave', 'leave', 'holiday', 'weekend'].map((key) => (
                                            <td key={key} className="border-l border-b border-slate-200/60 bg-slate-50/40 px-1 py-1 text-center font-mono text-[11px] font-semibold text-slate-700">
                                                {teacher.summary?.[key] ?? 0}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={daysInMonth + 8} className="px-6 py-12 text-center">
                                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <CalendarIcon className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">
                                                {needsClass ? 'Select a class to load students' : `No ${personLabel} records found`}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">Adjust your filter parameters above to view monthly data.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={teachers.links}
                        from={teachers.from}
                        to={teachers.to}
                        total={teachers.total}
                        lastPage={teachers.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
