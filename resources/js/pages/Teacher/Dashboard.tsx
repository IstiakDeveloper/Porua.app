import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    ClipboardCheck,
    FileText,
    Mail,
    Bell,
    Calendar,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Clock,
    ArrowRight,
    Sparkles,
    Award,
    CalendarClock
} from 'lucide-react';

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
    todaySchedule,
    assignedSubjects,
    attendanceSummary,
    pendingMarks,
    recentNotices,
    invigilationDuties,
    unreadMessages,
    myAttendance
}: Props) {
    const attendancePercentage = myAttendance.total_days > 0
        ? ((myAttendance.present / myAttendance.total_days) * 100).toFixed(0)
        : 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Teacher Dashboard
                </h2>
            }
        >
            <Head title="Teacher Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8 animate-fade-in">
                    {/* Welcome Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl sm:shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/10"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex-shrink-0">
                                        {teacher.photo ? (
                                            <img
                                                src={`/storage/${teacher.photo}`}
                                                alt={teacher.full_name}
                                                className="h-14 w-14 sm:h-20 sm:w-20 rounded-full object-cover border-2 sm:border-4 border-white/30 shadow-lg"
                                            />
                                        ) : (
                                            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-white/20 border-2 sm:border-4 border-white/30 flex items-center justify-center text-white text-xl sm:text-3xl font-bold shadow-lg">
                                                {teacher.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
                                            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold drop-shadow-lg">Welcome, {teacher.full_name}!</h1>
                                        </div>
                                        <p className="text-white/90 text-xs sm:text-base font-medium">
                                            {teacher.designation} • {teacher.department} • {teacher.employee_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <Link href="/teacher/leaves" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto bg-emerald-500/90 hover:bg-emerald-500 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border border-white/20 shadow-lg flex items-center justify-center gap-1.5">
                                            <CalendarClock className="w-4 h-4" />
                                            Apply Leave
                                        </button>
                                    </Link>
                                    <Link href="/teacher/profile" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg">
                                            View Profile
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {/* Assigned Subjects */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 group">
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Assigned Subjects</h3>
                            <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                {assignedSubjects.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 sm:mt-2">Active subjects</p>
                        </div>

                        {/* My Attendance */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 group">
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-green-100 text-green-700">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Good
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">My Attendance</h3>
                            <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                {attendancePercentage}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1 sm:mt-2">{myAttendance.present}/{myAttendance.total_days} days</p>
                        </div>

                        {/* Pending Marks */}
                        <div className={`bg-gradient-to-br ${pendingMarks.length > 0 ? 'from-orange-50 to-red-50' : 'from-gray-50 to-gray-100'} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 group`}>
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className={`bg-gradient-to-br ${pendingMarks.length > 0 ? 'from-orange-500 to-red-500' : 'from-gray-400 to-gray-500'} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                {pendingMarks.length > 0 && (
                                    <div className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-orange-100 text-orange-700">
                                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Pending
                                    </div>
                                )}
                            </div>
                            <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Pending Marks</h3>
                            <p className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${pendingMarks.length > 0 ? 'from-orange-500 to-red-500' : 'from-gray-400 to-gray-500'} bg-clip-text text-transparent`}>
                                {pendingMarks.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                                {pendingMarks.length > 0 ? 'Entries pending' : 'All updated'}
                            </p>
                        </div>

                        {/* Unread Messages */}
                        <div className={`bg-gradient-to-br ${unreadMessages > 0 ? 'from-purple-50 to-pink-50' : 'from-gray-50 to-gray-100'} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 group`}>
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className={`bg-gradient-to-br ${unreadMessages > 0 ? 'from-purple-500 to-pink-500' : 'from-gray-400 to-gray-500'} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                {unreadMessages > 0 && (
                                    <div className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-purple-100 text-purple-700">
                                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        New
                                    </div>
                                )}
                            </div>
                            <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Unread Messages</h3>
                            <p className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${unreadMessages > 0 ? 'from-purple-500 to-pink-500' : 'from-gray-400 to-gray-500'} bg-clip-text text-transparent`}>
                                {unreadMessages}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 sm:mt-2">New messages</p>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    {todaySchedule.length > 0 && (
                        <div className="bg-white rounded-xl sm:rounded-3xl shadow-md sm:shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Today's Schedule</h2>
                            </div>
                            <div className="space-y-2.5 sm:space-y-3">
                                {todaySchedule.map((schedule, index) => (
                                    <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-300 border border-gray-100 group">
                                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 sm:p-3 rounded-xl text-white min-w-[70px] sm:min-w-[80px] text-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                                            <p className="text-xs sm:text-sm font-bold">{schedule.time}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">{schedule.subject}</h4>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                                Class {schedule.class} - {schedule.section} • Room {schedule.room}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
                        {/* Pending Mark Entries */}
                        {pendingMarks.length > 0 && (
                            <div className="bg-white rounded-xl sm:rounded-3xl shadow-md sm:shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Pending Mark Entries</h2>
                                        <p className="text-xs sm:text-sm text-gray-600">Complete these mark entries</p>
                                    </div>
                                </div>
                                <div className="space-y-2.5 sm:space-y-3">
                                    {pendingMarks.map((mark, index) => (
                                        <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-300 border border-orange-200 group">
                                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                <div>
                                                    <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-orange-600 transition-colors">{mark.exam_name}</h4>
                                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{mark.subject}</p>
                                                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Class {mark.class} - {mark.section}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-md">
                                                    {mark.pending} pending
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600 flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(mark.entered / mark.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-semibold text-xs">{mark.entered}/{mark.total}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/teacher/exams">
                                    <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-xs sm:text-sm">
                                        Go to Exams
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Today's Attendance Summary */}
                        {attendanceSummary.length > 0 && (
                            <div className="bg-white rounded-xl sm:rounded-3xl shadow-md sm:shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                                        <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Today's Attendance</h2>
                                </div>
                                <div className="space-y-2.5 sm:space-y-3">
                                    {attendanceSummary.map((summary, index) => (
                                        <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-300 border border-gray-100 group">
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div>
                                                    <p className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-green-600 transition-colors">
                                                        Class {summary.class} - {summary.section}
                                                    </p>
                                                </div>
                                                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md">
                                                    {summary.present}/{summary.total}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-green-600 font-semibold">✓ Present: {summary.present}</span>
                                                <span className="text-red-600 font-semibold">✗ Absent: {summary.absent}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invigilation Duties */}
                        {invigilationDuties.length > 0 && (
                            <div className="bg-white rounded-xl sm:rounded-3xl shadow-md sm:shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Invigilation Duties</h2>
                                </div>
                                <div className="space-y-2.5 sm:space-y-3">
                                    {invigilationDuties.map((duty, index) => (
                                        <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-300 border border-purple-200 group">
                                            <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-purple-600 transition-colors mb-1 sm:mb-2">{duty.exam_name}</h4>
                                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{duty.subject}</p>
                                            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                                                    <span className="text-gray-700 truncate">{duty.exam_date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Clock className="w-4 h-4 text-purple-600" />
                                                    <span className="text-gray-700">{duty.start_time} - {duty.end_time}</span>
                                                </div>
                                                <div className="col-span-2 flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                                                    <Award className="w-4 h-4 text-purple-600" />
                                                    <span className="text-gray-700 font-semibold">Hall: {duty.hall_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Notices */}
                        {recentNotices.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl">
                                            <Bell className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Recent Notices</h2>
                                    </div>
                                    <Link href="/teacher/notices">
                                        <button className="text-blue-600 hover:text-purple-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-200">
                                            View All
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {recentNotices.map((notice) => (
                                        <Link
                                            key={notice.id}
                                            href={`/teacher/notices/${notice.id}`}
                                        >
                                            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:shadow-md transition-all duration-300 border border-gray-100 group cursor-pointer">
                                                <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                    <Bell className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                                                            {notice.title}
                                                        </h4>
                                                        {notice.priority === 'urgent' && (
                                                            <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg ml-2">
                                                                Urgent
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {notice.publish_date}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-8 h-8 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            <Link href="/teacher/attendance/mark">
                                <button className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group w-full">
                                    <ClipboardCheck className="w-8 h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-lg">Mark Attendance</p>
                                </button>
                            </Link>
                            <Link href="/teacher/exams/marks/entry">
                                <button className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group w-full">
                                    <FileText className="w-8 h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-lg">Enter Marks</p>
                                </button>
                            </Link>
                            <Link href="/teacher/students">
                                <button className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group w-full">
                                    <Users className="w-8 h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-lg">View Students</p>
                                </button>
                            </Link>
                            <Link href="/teacher/messages">
                                <button className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group w-full relative">
                                    <Mail className="w-8 h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-lg">Messages</p>
                                    {unreadMessages > 0 && (
                                        <div className="absolute top-2 right-2 bg-white text-red-600 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                                            {unreadMessages}
                                        </div>
                                    )}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out both;
                }
                .bg-grid-white\\/10 {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
