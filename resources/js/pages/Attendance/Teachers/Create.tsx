import React, { FormEventHandler, useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import ComboSelect from '@/Components/ComboSelect';
import { AttendancePageHeader, type AttendancePersonType } from '@/Components/TeacherAttendanceNav';
import { Save, Clock } from 'lucide-react';

interface Teacher {
    id: number;
    employee_id: string;
    name?: string;
    designation?: string;
    department?: string;
    user?: {
        name: string;
        email: string;
    };
    attendance?: {
        status: string;
        in_time: string | null;
        out_time: string | null;
        reason: string | null;
    } | null;
}

interface CreateProps {
    teachers: Teacher[];
    date: string;
}

const statuses = ['present', 'absent', 'late', 'early_leave', 'half_day', 'leave', 'holiday'];

const statusStyles: Record<string, string> = {
    present: 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600',
    absent: 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-600',
    late: 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-500',
    early_leave: 'bg-orange-500 text-white shadow-sm ring-1 ring-orange-500',
    half_day: 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600',
    holiday: 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-600',
    leave: 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-600',
};

const fieldLabel = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const dateInput = 'h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

export default function Create({ teachers, date }: CreateProps) {
    const [focusTeacher, setFocusTeacher] = useState('');
    const { data, setData, post, processing, errors } = useForm({
        date: date,
        attendances: teachers.map((teacher) => ({
            teacher_id: teacher.id,
            status: teacher.attendance?.status || 'present',
            in_time: teacher.attendance?.in_time || '',
            out_time: teacher.attendance?.out_time || '',
            reason: teacher.attendance?.reason || '',
        })),
    });

    const updateAttendance = (teacherId: number, field: string, value: string) => {
        setData(
            'attendances',
            data.attendances.map((att) =>
                att.teacher_id === teacherId ? { ...att, [field]: value } : att,
            ),
        );
    };

    const markAll = (status: string) => {
        setData(
            'attendances',
            data.attendances.map((att) => ({
                ...att,
                status: status,
            })),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher-attendance');
    };

    const visibleTeachers = useMemo(() => {
        if (!focusTeacher) return teachers;
        return teachers.filter((teacher) => String(teacher.id) === focusTeacher);
    }, [teachers, focusTeacher]);

    return (
        <AuthenticatedLayout>
            <Head title="Mark Teacher Attendance" />

            <div className="space-y-5">
                <AttendancePageHeader
                    title="Mark Attendance"
                    subtitle="Set status, in time and out time for each teacher"
                    current="create"
                    date={data.date}
                    reportType="teacher"
                    onTypeChange={(type: AttendancePersonType) => {
                        if (type === 'student') {
                            router.get(`/student-attendance/create?date=${data.date}`);
                        }
                    }}
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Control Panel */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                        <div className="grid grid-cols-1 items-end gap-3.5 md:grid-cols-12">
                            <div className="md:col-span-3">
                                <label className={fieldLabel}>Date</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className={dateInput}
                                    required
                                />
                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                            </div>
                            <div className="md:col-span-4">
                                <label className={fieldLabel}>Jump to teacher</label>
                                <ComboSelect
                                    value={focusTeacher || null}
                                    onChange={(next) => setFocusTeacher(next || '')}
                                    items={teachers.map((teacher) => ({
                                        value: String(teacher.id),
                                        label: `${teacher.name || teacher.user?.name || 'Teacher'}${teacher.employee_id ? ` (${teacher.employee_id})` : ''}`,
                                        keywords: `${teacher.employee_id || ''} ${teacher.name || ''} ${teacher.user?.name || ''}`,
                                    }))}
                                    placeholder="Search and select teacher"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 md:col-span-5">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                                    onClick={() => markAll('present')}
                                >
                                    All present
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-9 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                                    onClick={() => markAll('absent')}
                                >
                                    All absent
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                                    onClick={() => markAll('holiday')}
                                >
                                    Holiday
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Marking Ledger */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/[0.02]">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900">Teachers Ledger</h3>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                    {visibleTeachers.length} of {teachers.length}
                                </span>
                            </div>
                            {focusTeacher && (
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                    onClick={() => setFocusTeacher('')}
                                >
                                    Show all teachers
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-slate-100">
                            {visibleTeachers.map((teacher) => {
                                const index = data.attendances.findIndex((att) => att.teacher_id === teacher.id);
                                const row = data.attendances[index];
                                const initial = (teacher.name?.charAt(0) || teacher.employee_id?.charAt(0) || '?').toUpperCase();

                                return (
                                    <div key={teacher.id} className="flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-[200px] flex-1">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-700 ring-1 ring-slate-900/10">
                                                {initial}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{teacher.name || teacher.user?.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {teacher.employee_id}{teacher.department ? ` · ${teacher.department}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {statuses.map((status) => {
                                                const isActive = row?.status === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => updateAttendance(teacher.id, 'status', status)}
                                                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                                                            isActive
                                                                ? statusStyles[status]
                                                                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        {status.replace('_', ' ')}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="relative">
                                                <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="time"
                                                    value={row?.in_time || ''}
                                                    onChange={(e) => updateAttendance(teacher.id, 'in_time', e.target.value)}
                                                    className={`${dateInput} w-28 pl-8 text-xs`}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="time"
                                                    value={row?.out_time || ''}
                                                    onChange={(e) => updateAttendance(teacher.id, 'out_time', e.target.value)}
                                                    className={`${dateInput} w-28 pl-8 text-xs`}
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Remarks"
                                                value={row?.reason || ''}
                                                onChange={(e) => updateAttendance(teacher.id, 'reason', e.target.value)}
                                                className={`${dateInput} w-36 text-xs`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link href="/teacher-attendance">
                            <Button variant="ghost" className="rounded-xl">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-slate-900 px-5 py-2 text-white hover:bg-slate-800 shadow-sm"
                            icon={<Save className="h-4 w-4" />}
                        >
                            {processing ? 'Saving...' : 'Save attendance'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
