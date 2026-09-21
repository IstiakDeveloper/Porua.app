import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import ComboSelect from '@/Components/ComboSelect';
import { AttendancePageHeader, type AttendancePersonType } from '@/Components/TeacherAttendanceNav';
import { Download, FileText, Calendar, UserRound, Printer } from 'lucide-react';

interface TeacherOption {
    id: number;
    name: string;
    employee_id: string | null;
}

interface StudentOption {
    id: number;
    name: string;
    admission_number?: string | null;
    roll_number?: string | null;
    class_name?: string | null;
    section_name?: string | null;
}

interface PersonInfo {
    id: number;
    name: string;
    employee_id: string | null;
    designation?: string | null;
    department?: string | null;
    roll_number?: string | null;
    class_name?: string | null;
    section_name?: string | null;
}

interface DayRow {
    date: string;
    day: string;
    status: string | null;
    in_time_formatted: string | null;
    out_time_formatted: string | null;
    hours: string | null;
    remarks: string | null;
    auto_remarks: string | null;
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
    reportType?: 'teacher' | 'student';
    teachers: TeacherOption[];
    students?: StudentOption[];
    classes?: ClassOption[];
    sections?: SectionOption[];
    person?: PersonInfo | null;
    teacher: PersonInfo | null;
    days: DayRow[];
    stats: {
        present: number;
        absent: number;
        late: number;
        early_leave: number;
        half_day: number;
        leave: number;
        holiday: number;
        weekend: number;
        total?: number;
        percentage?: number;
    };
    filters: {
        report_type?: string;
        teacher_id: number | null;
        student_id?: number | null;
        class_id?: number | null;
        section_id?: number | null;
        from_date: string;
        to_date: string;
    };
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

const fieldLabel = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const dateInput = 'h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

export default function Report({
    reportType = 'teacher',
    teachers,
    students = [],
    classes = [],
    sections = [],
    person,
    teacher,
    days,
    stats,
    filters,
}: Props) {
    const selectedPerson = person || teacher;
    const [type, setType] = useState<'teacher' | 'student'>(reportType === 'student' ? 'student' : 'teacher');
    const [teacherId, setTeacherId] = useState(filters.teacher_id ? String(filters.teacher_id) : '');
    const [studentId, setStudentId] = useState(filters.student_id ? String(filters.student_id) : '');
    const [classId, setClassId] = useState(filters.class_id ? String(filters.class_id) : '');
    const [sectionId, setSectionId] = useState(filters.section_id ? String(filters.section_id) : '');
    const [fromDate, setFromDate] = useState(filters.from_date);
    const [toDate, setToDate] = useState(filters.to_date);

    const sectionItems = useMemo(
        () => sections
            .filter((section) => !classId || String(section.class_id) === classId)
            .map((section) => ({ value: String(section.id), label: section.name })),
        [sections, classId],
    );

    const visit = (overrides: Record<string, string | number | undefined> = {}) => {
        const nextType = (overrides.report_type as string) || type;
        const query: Record<string, string | number | undefined> = {
            report_type: nextType,
            from_date: overrides.from_date ?? fromDate,
            to_date: overrides.to_date ?? toDate,
        };

        if (nextType === 'student') {
            query.student_id = overrides.student_id ?? (studentId || undefined);
            query.class_id = overrides.class_id ?? (classId || undefined);
            query.section_id = overrides.section_id ?? (sectionId || undefined);
        } else {
            query.teacher_id = overrides.teacher_id ?? (teacherId || undefined);
        }

        router.get('/teacher-attendance/report', query, { preserveState: true, preserveScroll: true });
    };

    const switchType = (next: AttendancePersonType) => {
        setType(next);
        setTeacherId('');
        setStudentId('');
        setClassId('');
        setSectionId('');
        visit({
            report_type: next,
            teacher_id: '',
            student_id: '',
            class_id: '',
            section_id: '',
        });
    };

    const openPdf = () => {
        const params = new URLSearchParams();
        params.set('report_type', type);
        params.set('from_date', fromDate);
        params.set('to_date', toDate);
        if (type === 'student') {
            if (studentId) params.set('student_id', studentId);
            if (classId) params.set('class_id', classId);
            if (sectionId) params.set('section_id', sectionId);
        } else if (teacherId) {
            params.set('teacher_id', teacherId);
        }
        window.open(`/teacher-attendance/report/pdf?${params.toString()}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Attendance Report" />

            <div className="space-y-5 print:hidden">
                <AttendancePageHeader
                    title="Attendance Report"
                    subtitle={type === 'student' ? 'Individual student attendance summary and log' : 'Individual teacher attendance summary and log'}
                    current="report"
                    reportType={type}
                    onTypeChange={switchType}
                    extra={selectedPerson ? (
                        <Button onClick={openPdf} size="sm" className="h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm" variant="outline" icon={<Printer className="h-3.5 w-3.5" />}>
                            Print / PDF
                        </Button>
                    ) : undefined}
                />

                {/* Filter Panel */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="grid grid-cols-1 items-end gap-3.5 md:grid-cols-12">
                        {type === 'student' && (
                            <>
                                <div className="md:col-span-2">
                                    <label className={fieldLabel}>Class</label>
                                    <ComboSelect
                                        value={classId || null}
                                        onChange={(next) => {
                                            setClassId(next || '');
                                            setSectionId('');
                                            setStudentId('');
                                            visit({ class_id: next || '', section_id: '', student_id: '' });
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
                                            setStudentId('');
                                            visit({ section_id: next || '', student_id: '' });
                                        }}
                                        items={sectionItems}
                                        placeholder="All sections"
                                    />
                                </div>
                            </>
                        )}
                        <div className={type === 'student' ? 'md:col-span-4' : 'md:col-span-5'}>
                            <label className={fieldLabel}>{type === 'student' ? 'Student' : 'Teacher'}</label>
                            {type === 'student' ? (
                                <ComboSelect
                                    value={studentId || null}
                                    onChange={(next) => setStudentId(next || '')}
                                    items={students.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.name}${item.admission_number ? ` (${item.admission_number})` : ''}${item.class_name ? ` · ${item.class_name}` : ''}${item.section_name ? `-${item.section_name}` : ''}`,
                                        keywords: `${item.admission_number || ''} ${item.roll_number || ''} ${item.name}`,
                                    }))}
                                    placeholder="Search and select student"
                                />
                            ) : (
                                <ComboSelect
                                    value={teacherId || null}
                                    onChange={(next) => setTeacherId(next || '')}
                                    items={teachers.map((item) => ({
                                        value: String(item.id),
                                        label: item.employee_id ? `${item.name} (${item.employee_id})` : item.name,
                                        keywords: `${item.employee_id || ''} ${item.name}`,
                                    }))}
                                    placeholder="Search and select teacher"
                                />
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className={fieldLabel}>From</label>
                            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={dateInput} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={fieldLabel}>To</label>
                            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={dateInput} />
                        </div>
                        <div className="md:col-span-2">
                            <Button size="sm" className="h-9 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => visit()} icon={<FileText className="h-3.5 w-3.5" />}>
                                Generate
                            </Button>
                        </div>
                    </div>
                </div>

                {selectedPerson ? (
                    <>
                        {/* Person Profile Header */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 ring-1 ring-slate-900/10">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-900">{selectedPerson.name}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{selectedPerson.employee_id || 'No ID'}</span>
                                            {selectedPerson.roll_number && <span>· Roll: {selectedPerson.roll_number}</span>}
                                            {selectedPerson.designation && <span>· {selectedPerson.designation}</span>}
                                            {selectedPerson.department && !selectedPerson.class_name && <span>· {selectedPerson.department}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {fromDate} to {toDate}
                                </div>
                            </div>
                        </div>

                        {/* KPI Metrics */}
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-9">
                            {[
                                { label: 'Present', value: stats.present, tone: 'text-emerald-700' },
                                { label: 'Absent', value: stats.absent, tone: 'text-rose-700' },
                                { label: 'Late', value: stats.late, tone: 'text-amber-700' },
                                { label: 'Early leave', value: stats.early_leave, tone: 'text-orange-700' },
                                { label: 'Half day', value: stats.half_day, tone: 'text-indigo-700' },
                                { label: 'Leave', value: stats.leave, tone: 'text-sky-700' },
                                { label: 'Holiday', value: stats.holiday, tone: 'text-purple-700' },
                                { label: 'Weekend', value: stats.weekend, tone: 'text-slate-600' },
                                { label: 'Attendance %', value: `${stats.percentage ?? 0}%`, tone: 'text-slate-900' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                                    <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
                                    <p className={`mt-1 text-base font-bold tracking-tight ${item.tone}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Attendance Ledger Table */}
                        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
                                <h3 className="text-xs font-semibold text-slate-900">Attendance Records</h3>
                                <span className="text-[10px] font-medium text-slate-500">{days.length} entries</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 bg-slate-100/90">
                                        <tr>
                                            {['Date', 'Day', 'Status', 'In', 'Out', 'Hours', 'Remarks'].map((heading) => (
                                                <th key={heading} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {days.map((row) => {
                                            const statusKey = row.status?.toLowerCase() || '';
                                            const meta = statusConfig[statusKey];

                                            return (
                                                <tr key={row.date} className="border-b border-slate-200/90 hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-3 py-2 text-xs font-semibold text-slate-800 font-mono">{row.date}</td>
                                                    <td className="px-3 py-2 text-[11px] text-slate-500 font-medium">{row.day}</td>
                                                    <td className="px-3 py-2">
                                                        {meta ? (
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${meta.badge}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                                                {meta.label}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                                {row.status ? row.status.replace('_', ' ') : '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-xs font-mono text-slate-700">{row.in_time_formatted || '—'}</td>
                                                    <td className="px-3 py-2 text-xs font-mono text-slate-700">{row.out_time_formatted || '—'}</td>
                                                    <td className="px-3 py-2">
                                                        <span className="inline-flex items-center font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                                            {row.hours || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-[11px] text-slate-500 max-w-[200px] truncate">{row.auto_remarks || row.remarks || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-slate-50/75 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between rounded-b-xl select-none">
                                <span className="text-xs font-medium text-slate-500">
                                    Total <span className="font-semibold text-slate-800">{days.length}</span> days evaluated
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">
                                    Period: {fromDate} to {toDate}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200/90 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <UserRound className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                            Select a {type === 'student' ? 'student' : 'teacher'} to generate the report
                        </p>
                        <p className="mt-1 text-xs text-slate-400">Choose a person using the search box above, then click Generate.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
