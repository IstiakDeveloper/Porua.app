import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useInstitute } from '@/hooks/useInstitute';
import { route } from '@/Components/Parent/route';
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    CalendarDays,
    Calendar,
    BookOpen,
    Receipt,
    Wallet,
    Award,
    Megaphone,
    MessageSquare,
    ChevronRight,
    ArrowUpRight,
    User,
    Sparkles,
    GraduationCap,
    School,
    HelpCircle,
    PhoneCall
} from 'lucide-react';

interface TodayClass {
    name: string;
    teacher_name?: string | null;
    room_no?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}

interface Child {
    id: number;
    full_name: string;
    photo: string | null;
    class_name: string;
    section_name: string;
    roll_number: string | null;
    today_attendance: { status: string };
    today_class: TodayClass | null;
    fee_status: { total_due: number; overdue_count: number };
}

interface Notice {
    id: number;
    title: string;
    type: string;
    priority: string;
    publish_date: string;
}

interface EventItem {
    id: number;
    title: string;
    event_date_formatted: string;
    start_time?: string | null;
    location?: string | null;
}

interface Props {
    parent: {
        id: number;
        father_name: string;
        mother_name: string;
        phone: string;
        email: string;
        account_name: string;
    };
    children: Child[];
    recentNotices: Notice[];
    nextEvent: EventItem | null;
    unreadMessages: number;
}

function formatTaka(amount: number | null | undefined): string {
    const value = Math.round(Number(amount ?? 0));
    return `৳${new Intl.NumberFormat('en-IN').format(value)}`;
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function Dashboard({ parent, children = [], recentNotices = [], nextEvent, unreadMessages = 0 }: Props) {
    const institute = useInstitute();
    const greetingName = parent.father_name || parent.mother_name || parent.account_name || 'Guardian';

    // Summary calculations
    const totalDueAcrossChildren = children.reduce((sum, c) => sum + (c.fee_status?.total_due || 0), 0);
    const totalOverdueCount = children.reduce((sum, c) => sum + (c.fee_status?.overdue_count || 0), 0);
    const presentChildrenCount = children.filter(c => c.today_attendance?.status === 'present').length;

    const formattedToday = new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const getAttendanceStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Present
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Absent
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Late
                    </span>
                );
            case 'half_day':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                        Half Day
                    </span>
                );
            case 'leave':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/70">
                        On Leave
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Not Marked
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Parent Portal - ${institute.name || 'Porua'}`} />

            <div className="space-y-4 pb-8">
                {/* 1. EXECUTIVE HEADER & REAL-TIME QUICK ACTION BAR */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                                <span>{getGreeting()}, {greetingName}</span>
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 uppercase tracking-wider">
                                Parent Portal
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {formattedToday}
                            </span>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="text-slate-500 font-medium">
                                {children.length} {children.length === 1 ? 'Child' : 'Children'} Linked
                            </span>
                            {parent.phone && (
                                <>
                                    <span className="hidden sm:inline text-slate-300">•</span>
                                    <span className="text-slate-500 font-mono text-[11px]">
                                        Mobile: {parent.phone}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                        <Link
                            href={route('parent.profile.update')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            My Profile
                        </Link>
                        <Link
                            href={route('parent.messages.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Message School
                            {unreadMessages > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-indigo-700 font-bold text-[10px]">
                                    {unreadMessages}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* 2. STATS & KEY METRICS STRIP */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Stat 1: Total Children */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Enrolled Children
                            </p>
                            <p className="text-xl font-bold text-slate-900 mt-0.5">
                                {children.length}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Active in school
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Stat 2: Today's Attendance */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Today's Attendance
                            </p>
                            <p className="text-xl font-bold text-slate-900 mt-0.5">
                                {presentChildrenCount} / {children.length}
                            </p>
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {presentChildrenCount === children.length && children.length > 0 ? 'All Present' : 'Marked Present'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Stat 3: Total Due Fees */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Outstanding Fees
                            </p>
                            <p className={`text-xl font-bold mt-0.5 ${totalDueAcrossChildren > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                {formatTaka(totalDueAcrossChildren)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {totalOverdueCount > 0 ? `${totalOverdueCount} Overdue Invoice(s)` : 'No Overdue Invoices'}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                            totalDueAcrossChildren > 0
                                ? 'bg-rose-50 border-rose-100/60 text-rose-600'
                                : 'bg-emerald-50 border-emerald-100/60 text-emerald-600'
                        }`}>
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Stat 4: Bulletins & Notices */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Notices & Bulletins
                            </p>
                            <p className="text-xl font-bold text-slate-900 mt-0.5">
                                {recentNotices.length}
                            </p>
                            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                                Recent School Circulars
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-blue-600 shrink-0">
                            <Megaphone className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 3. MAIN WORKSPACE: CHILDREN HUB + SIDEBAR WIDGETS */}
                {children.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Students Linked Yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                            Your parent account is ready! Please contact the school office to link your student profile using phone: <span className="font-semibold text-slate-800">{parent.phone || 'registered phone'}</span>.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* LEFT COLUMN: CHILDREN CARDS (lg:col-span-8) */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                                    Your Children ({children.length})
                                </h2>
                                <span className="text-[11px] text-slate-400">
                                    Click any action below to view detailed records
                                </span>
                            </div>

                            {children.map((child) => {
                                const hasOverdue = child.fee_status.overdue_count > 0;
                                const isAbsent = child.today_attendance.status === 'absent';

                                return (
                                    <div
                                        key={child.id}
                                        className={`bg-white rounded-xl border transition-all p-4 sm:p-5 shadow-2xs space-y-4 ${
                                            hasOverdue || isAbsent
                                                ? 'border-amber-200/90 hover:border-amber-300'
                                                : 'border-slate-200/80 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Child Identity Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {child.photo ? (
                                                    <img
                                                        src={child.photo}
                                                        alt={child.full_name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-2xs shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                                                        {child.full_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                                            {child.full_name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                        <span className="font-semibold text-slate-700">
                                                            Class {child.class_name} • Sec {child.section_name}
                                                        </span>
                                                        {child.roll_number && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                                    Roll: {child.roll_number}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                {getAttendanceStatusBadge(child.today_attendance.status)}
                                            </div>
                                        </div>

                                        {/* Daily Routine & Fee Snapshot */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                                            {/* Today's Class Period */}
                                            <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex items-start gap-2.5">
                                                <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                        Today's Routine
                                                    </p>
                                                    {child.today_class ? (
                                                        <div>
                                                            <p className="font-semibold text-slate-800 truncate">
                                                                {child.today_class.name}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500 font-mono">
                                                                {child.today_class.start_time} - {child.today_class.end_time}
                                                                {child.today_class.room_no ? ` • Room ${child.today_class.room_no}` : ''}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[11px] text-slate-500 font-medium">
                                                            No scheduled classes today
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Fee Dues Summary */}
                                            <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex items-start gap-2.5">
                                                <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                                    child.fee_status.total_due > 0
                                                        ? 'bg-rose-50 border-rose-100/60 text-rose-600'
                                                        : 'bg-emerald-50 border-emerald-100/60 text-emerald-600'
                                                }`}>
                                                    <Receipt className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                        Fee Clearance
                                                    </p>
                                                    {child.fee_status.total_due > 0 ? (
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="font-bold text-rose-700">
                                                                    {formatTaka(child.fee_status.total_due)} Due
                                                                </span>
                                                                {child.fee_status.overdue_count > 0 && (
                                                                    <span className="text-[10px] text-rose-500 block">
                                                                        ({child.fee_status.overdue_count} overdue)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Link
                                                                href={route('parent.fees.index', { student_id: child.id })}
                                                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                                            >
                                                                Pay / Details →
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            All Dues Cleared
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons Grid (4 Actions) */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                                            <Link
                                                href={route('parent.children.show', child.id)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-2xs active:scale-98"
                                            >
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                Profile
                                            </Link>
                                            <Link
                                                href={route('parent.attendance.index', { student_id: child.id })}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-2xs active:scale-98"
                                            >
                                                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                                Attendance
                                            </Link>
                                            <Link
                                                href={route('parent.exams.index', { student_id: child.id })}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-2xs active:scale-98"
                                            >
                                                <Award className="w-3.5 h-3.5 text-slate-400" />
                                                Exam Results
                                            </Link>
                                            <Link
                                                href={route('parent.fees.index', { student_id: child.id })}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-2xs active:scale-98"
                                            >
                                                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                                                Fees & Pay
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* RIGHT COLUMN: BULLETIN, CALENDAR & SUPPORT (lg:col-span-4) */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Widget 1: Next on Calendar */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <CalendarDays className="w-4 h-4 text-indigo-600" />
                                        Next on Calendar
                                    </h3>
                                    <Link
                                        href={route('parent.calendar.index')}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        View Full
                                    </Link>
                                </div>

                                {nextEvent ? (
                                    <Link
                                        href={route('parent.calendar.index')}
                                        className="block p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-indigo-50/40 hover:border-indigo-100 transition-colors group"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                                                    Event
                                                </span>
                                                <Calendar className="w-3.5 h-3.5 text-indigo-600 mt-0.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                                                    {nextEvent.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {nextEvent.event_date_formatted}
                                                    {nextEvent.start_time ? ` • ${nextEvent.start_time}` : ''}
                                                </p>
                                                {nextEvent.location && (
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        Venue: {nextEvent.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="p-4 text-center rounded-lg bg-slate-50 text-xs text-slate-500">
                                        No upcoming events scheduled.
                                    </div>
                                )}
                            </div>

                            {/* Widget 2: School Notices */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Megaphone className="w-4 h-4 text-indigo-600" />
                                        School Bulletins
                                    </h3>
                                    <Link
                                        href={route('parent.notices.index')}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        All Notices
                                    </Link>
                                </div>

                                <div className="space-y-2">
                                    {recentNotices.length > 0 ? (
                                        recentNotices.map((notice) => (
                                            <Link
                                                key={notice.id}
                                                href={route('parent.notices.show', notice.id)}
                                                className="block p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                        {notice.priority || 'Notice'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {notice.publish_date}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-800 line-clamp-2 hover:text-indigo-600">
                                                    {notice.title}
                                                </p>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center rounded-lg bg-slate-50 text-xs text-slate-500">
                                            No recent notices.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Widget 3: School Office & Helpdesk */}
                            <div className="bg-gradient-to-br from-indigo-50/60 to-slate-50 rounded-xl border border-indigo-100/80 p-4 shadow-2xs space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <PhoneCall className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            Need Help or Have Queries?
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Contact your school administration
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    You can send direct queries to your child's teachers or school office through the Messages tab anytime.
                                </p>
                                <Link
                                    href={route('parent.messages.index')}
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Open Messages Box
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
