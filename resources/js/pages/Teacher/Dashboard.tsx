import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    ClipboardCheck,
    FileText,
    Mail,
    Bell,
    Calendar,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Clock,
    ChevronRight,
    Award,
    CalendarDays,
    CalendarClock,
    User,
    GraduationCap,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

interface Teacher {
    id: number;
    full_name: string;
    employee_id: string;
    designation: string;
    phone: string;
    email: string;
    photo: string | null;
    department: string;
}

interface Subject {
    subject: string;
    class: string;
    section: string;
    time: string;
    room: string;
}

interface AttendanceSummary {
    class: string;
    section: string;
    total: number;
    present: number;
    absent: number;
}

interface PendingMark {
    exam_name: string;
    subject: string;
    class: string;
    section: string;
    entered: number;
    total: number;
    pending: number;
}

interface Notice {
    id: number;
    title: string;
    publish_date: string;
    priority: string;
}

interface InvigilationDuty {
    id: number;
    exam_name: string;
    subject: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    hall_name: string;
}

interface Props {
    teacher: Teacher;
    todaySchedule: Subject[];
    assignedSubjects: any[];
    attendanceSummary: AttendanceSummary[];
    pendingMarks: PendingMark[];
    recentNotices: Notice[];
    invigilationDuties: InvigilationDuty[];
    unreadMessages: number;
    myAttendance: {
        present: number;
        absent: number;
        late: number;
        total_days: number;
    };
}

export default function Dashboard({
    teacher,
    todaySchedule = [],
    assignedSubjects = [],
    attendanceSummary = [],
    pendingMarks = [],
    recentNotices = [],
    invigilationDuties = [],
    unreadMessages = 0,
    myAttendance = { present: 0, absent: 0, late: 0, total_days: 0 }
}: Props) {
    const institute = useInstitute();

    const attendancePercentage = myAttendance.total_days > 0
        ? Math.round((myAttendance.present / myAttendance.total_days) * 100)
        : 0;

    const formattedToday = new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <AuthenticatedLayout>
            <Head title={`Faculty Portal - ${teacher.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. EXECUTIVE HEADER & FACULTY IDENTITY CARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="relative shrink-0">
                            {teacher.photo ? (
                                <img
                                    src={`/storage/${teacher.photo}`}
                                    alt={teacher.full_name}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-indigo-50 border border-slate-200"
                                />
                            ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl border border-indigo-200/70">
                                    {teacher.full_name?.charAt(0)?.toUpperCase() || 'T'}
                                </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" title="Active Faculty" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                                    {teacher.full_name}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <GraduationCap className="w-3 h-3" />
                                    {teacher.designation}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                    Dept: {teacher.department || 'General'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span>Employee ID: <strong className="text-slate-700 font-mono font-medium">{teacher.employee_id}</strong></span>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span>Institute: <strong className="text-slate-700 font-medium">{institute.name || 'Porua ERP'}</strong></span>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span className="text-slate-600 font-medium">{formattedToday}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                        {unreadMessages > 0 && (
                            <Link
                                href="/teacher/messages"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                {unreadMessages} Messages
                            </Link>
                        )}
                        <Link
                            href="/teacher/leaves"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                            <CalendarClock className="w-3.5 h-3.5" />
                            Apply Leave
                        </Link>
                        <Link
                            href="/teacher/profile"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            Profile
                        </Link>
                    </div>
                </div>

                {/* 2. FOUR HIGH-DENSITY METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Assigned Subjects</span>
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {assignedSubjects.length}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Active course allocations
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Today's Classes</span>
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {todaySchedule.length}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Scheduled periods today
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Pending Mark Entry</span>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${pendingMarks.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className={`text-xl sm:text-2xl font-bold tracking-tight ${pendingMarks.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {pendingMarks.length}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {pendingMarks.length > 0 ? 'Entries awaiting submission' : 'All gradebooks updated'}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">My Attendance</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ClipboardCheck className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {attendancePercentage}%
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            <strong className="text-emerald-700 font-medium">{myAttendance.present}</strong> present of {myAttendance.total_days} working days
                        </p>
                    </div>
                </div>

                {/* 3. QUICK OPERATIONS BAR */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                    <Link
                        href="/teacher/attendance/mark"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Mark Attendance</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Rapid batch marking</span>
                    </Link>

                    <Link
                        href="/teacher/exams"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Enter Marks</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Gradebook entries</span>
                    </Link>

                    <Link
                        href="/teacher/students"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Class Students</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Rosters & 360 insights</span>
                    </Link>

                    <Link
                        href="/teacher/leaves"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <CalendarClock className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Leaves</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Apply & balances</span>
                    </Link>

                    <Link
                        href="/teacher/attendance/my"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">My Attendance</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Personal check-in log</span>
                    </Link>

                    <Link
                        href="/teacher/messages"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <Mail className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Messages</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Guardian & staff chat</span>
                    </Link>
                </div>

                {/* 4. MAIN 2-COLUMN SECTION: TEACHING OPERATIONS & LOGS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Today's Teaching Schedule */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Today's Class Timetable</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                                {todaySchedule.length} Periods Today
                            </span>
                        </div>
                        <div className="p-4">
                            {todaySchedule && todaySchedule.length > 0 ? (
                                <div className="space-y-2.5">
                                    {todaySchedule.map((schedule, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono shrink-0">
                                                    {schedule.time}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">
                                                        {schedule.subject}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        Class {schedule.class} - {schedule.section} • Room: <strong className="text-slate-700 font-medium">{schedule.room || 'Main Hall'}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href="/teacher/attendance/mark"
                                                className="px-2.5 py-1 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                                            >
                                                Mark Class
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No teaching periods scheduled for today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Pending Mark Entries */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-semibold text-slate-900">Pending Mark Entries</h3>
                            </div>
                            <Link
                                href="/teacher/exams"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                All Exams <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {pendingMarks && pendingMarks.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingMarks.map((mark, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">{mark.exam_name}</h4>
                                                    <p className="text-[11px] text-slate-500">
                                                        {mark.subject} • Class {mark.class} ({mark.section})
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    {mark.pending} Pending
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-600 h-1.5 rounded-full"
                                                        style={{ width: `${mark.total > 0 ? (mark.entered / mark.total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-mono text-slate-600 font-semibold shrink-0">
                                                    {mark.entered}/{mark.total} Marked
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-xs text-slate-600 font-medium">All marks submissions are complete</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. BOTTOM 2-COLUMN SECTION: ATTENDANCE SUMMARY & NOTICES / DUTIES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Today's Classroom Attendance Status */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Today's Class Attendance Status</h3>
                            </div>
                            <Link
                                href="/teacher/attendance/mark"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                Mark Class <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {attendanceSummary && attendanceSummary.length > 0 ? (
                                <div className="space-y-2.5">
                                    {attendanceSummary.map((sum, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900">Class {sum.class} - {sum.section}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    <span className="text-emerald-700 font-semibold">{sum.present} Present</span> • <span className="text-rose-600 font-semibold">{sum.absent} Absent</span>
                                                </p>
                                            </div>
                                            <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
                                                {sum.present} / {sum.total}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No class attendance recorded yet today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Invigilation Duties or Notices */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Faculty Notices & Circulars</h3>
                            </div>
                            <Link
                                href="/teacher/notices"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {recentNotices && recentNotices.length > 0 ? (
                                <div className="space-y-2.5">
                                    {recentNotices.map((notice) => (
                                        <Link
                                            key={notice.id}
                                            href={`/teacher/notices/${notice.id}`}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3 group block"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                        {notice.title}
                                                    </p>
                                                    {notice.priority === 'urgent' && (
                                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 uppercase tracking-wider shrink-0">
                                                            Urgent
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    Published: {notice.publish_date}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No faculty notices published</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
