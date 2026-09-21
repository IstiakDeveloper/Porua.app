import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, ClipboardCheck, ClipboardList, FileText, GraduationCap, Plus, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TeacherAttendancePage = 'daily' | 'monthly' | 'report' | 'sheet' | 'create';
export type AttendancePersonType = 'teacher' | 'student';

interface NavProps {
    current: TeacherAttendancePage;
    date?: string;
    extra?: React.ReactNode;
    reportType?: AttendancePersonType;
}

interface HeaderProps extends NavProps {
    title: string;
    subtitle: string;
    onTypeChange: (type: AttendancePersonType) => void;
}

const links: Array<{ key: TeacherAttendancePage; href: string; label: string; icon: typeof Calendar }> = [
    { key: 'daily', href: '/teacher-attendance', label: 'Daily', icon: ClipboardCheck },
    { key: 'monthly', href: '/teacher-attendance/monthly', label: 'Monthly', icon: Calendar },
    { key: 'report', href: '/teacher-attendance/report', label: 'Report', icon: FileText },
    { key: 'sheet', href: '/teacher-attendance/sheet-report', label: 'Sheet', icon: ClipboardList },
];

export function withAttendanceType(href: string, reportType?: AttendancePersonType) {
    if (reportType !== 'student') return href;
    return `${href}${href.includes('?') ? '&' : '?'}report_type=student`;
}

export function AttendanceTypeToggle({
    value = 'teacher',
    onChange,
}: {
    value?: AttendancePersonType;
    onChange: (type: AttendancePersonType) => void;
}) {
    return (
        <div className="inline-flex rounded-lg bg-slate-100/90 p-1 border border-slate-200/70 shadow-inner">
            {([
                { key: 'teacher', label: 'Teacher', icon: GraduationCap },
                { key: 'student', label: 'Student', icon: Users },
            ] as const).map((option) => {
                const Icon = option.icon;
                const active = value === option.key;

                return (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => onChange(option.key)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-150',
                            active
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-950/5'
                                : 'text-slate-500 hover:text-slate-800',
                        )}
                    >
                        <Icon className={cn("h-3.5 w-3.5", active ? "text-indigo-600" : "text-slate-400")} />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export default function TeacherAttendanceNav({ current, date, extra, reportType = 'teacher' }: NavProps) {
    const dailyActive = current === 'daily' || current === 'create';
    const markHref = reportType === 'student'
        ? `/student-attendance/create${date ? `?date=${date}` : ''}`
        : `/teacher-attendance/create${date ? `?date=${date}` : ''}`;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/70">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active = link.key === 'daily' ? dailyActive : current === link.key;

                    return (
                        <Link
                            key={link.key}
                            href={withAttendanceType(link.href, reportType)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                                active
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-950/5'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
                            )}
                        >
                            <Icon className={cn("h-3.5 w-3.5", active ? "text-indigo-600" : "text-slate-400")} />
                            {link.label}
                        </Link>
                    );
                })}
            </div>
            <Link
                href="/device-settings"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                Settings
            </Link>
            {(current === 'daily' || current === 'create') && (
                <Link
                    href={markHref}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Mark
                </Link>
            )}
            {extra}
        </div>
    );
}

export function AttendancePageHeader({ title, subtitle, current, date, extra, reportType = 'teacher', onTypeChange }: HeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
                    <AttendanceTypeToggle value={reportType} onChange={onTypeChange} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            </div>
            <TeacherAttendanceNav current={current} date={date} extra={extra} reportType={reportType} />
        </div>
    );
}
