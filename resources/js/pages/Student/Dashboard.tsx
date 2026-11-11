import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    User,
    Calendar,
    DollarSign,
    BookOpen,
    FileText,
    Bell,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Award,
    ChevronRight,
    ArrowUpRight,
    GraduationCap,
    Sparkles,
    Receipt,
    MessageSquare,
    BookMarked,
    CalendarDays
} from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo_url: string | null;
    class_name: string;
    section_name: string;
    academic_year: string;
    phone?: string;
    email?: string;
    blood_group?: string;
}

interface AttendanceSummary {
    today: {
        status: string;
        in_time: string | null;
        out_time: string | null;
    };
    monthly: {
        total: number;
        present: number;
        absent: number;
        late: number;
        percentage: number;
    };
    yearly: {
        total: number;
        present: number;
        percentage: number;
    };
}

interface FeeStatus {
    total_paid: number;
    total_due: number;
    overdue_count: number;
    recent_payments: Array<{
        id: number;
        receipt_number: string;
        fee_type: string;
        amount: number;
        payment_date: string;
    }>;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
}

interface Result {
    id: number;
    exam_name: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    gpa: number;
    grade: string;
    position: number;
    result_status: string;
}

interface Notice {
    id: number;
    title: string;
    type: string;
    priority: string;
    valid_from?: string;
    valid_to?: string;
    created_at: string;
}

interface Book {
    id: number;
    book: {
        title: string;
        author: string;
    };
    issue_date: string;
    due_date: string;
}

interface Props {
    student: Student;
    attendanceSummary: AttendanceSummary;
    feeStatus: FeeStatus;
    recentExams: Exam[];
    recentResults: Result[];
    recentNotices: Notice[];
    issuedBooks: Book[];
    unreadMessagesCount: number;
}

function formatTaka(amount: number | null | undefined): string {
    const value = Math.round(Number(amount ?? 0));
    return `৳${new Intl.NumberFormat('en-IN').format(value)}`;
}

export default function Dashboard({
    student,
    attendanceSummary,
    feeStatus,
    recentExams = [],
    recentResults = [],
    recentNotices = [],
    issuedBooks = [],
    unreadMessagesCount = 0,
}: Props) {
    const institute = useInstitute();

    const getAttendanceStatusBadge = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Present Today
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Absent Today
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Late Today
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Not Marked Yet
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch ((priority || '').toLowerCase()) {
            case 'high':
            case 'urgent':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'medium':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const formattedToday = new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <AuthenticatedLayout>
            <Head title={`Student Portal - ${student.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. EXECUTIVE HEADER & STUDENT IDENTITY CARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="relative shrink-0">
                            {student.photo_url ? (
                                <img
                                    src={student.photo_url}
                                    alt={student.full_name}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-indigo-50 border border-slate-200"
                                />
                            ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl border border-indigo-200/70">
                                    {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                                </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" title="Enrolled" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                                    {student.full_name}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <GraduationCap className="w-3 h-3" />
                                    Class {student.class_name} ({student.section_name})
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                    Roll #{student.roll_number || 'N/A'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span>Adm No: <strong className="text-slate-700 font-medium">{student.admission_number}</strong></span>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span>Academic Session: <strong className="text-slate-700 font-medium">{student.academic_year}</strong></span>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span className="text-slate-600 font-medium">{formattedToday}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        {unreadMessagesCount > 0 && (
                            <Link
                                href="/student/messages"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {unreadMessagesCount} Unread
                            </Link>
                        )}
                        <Link
                            href="/student/profile"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            My Profile
                        </Link>
                    </div>
                </div>

                {/* 2. FOUR HIGH-DENSITY METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Today's Attendance */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Today's Attendance</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CalendarDays className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mb-2">
                            {getAttendanceStatusBadge(attendanceSummary?.today?.status)}
                        </div>
                        <p className="text-[11px] text-slate-500">
                            {attendanceSummary?.today?.in_time ? (
                                <>In: <strong className="text-slate-700 font-medium">{attendanceSummary.today.in_time}</strong>{attendanceSummary.today.out_time ? ` | Out: ${attendanceSummary.today.out_time}` : ''}</>
                            ) : (
                                'No check-in record yet'
                            )}
                        </p>
                    </div>

                    {/* Monthly Attendance */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Monthly Attendance</span>
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {attendanceSummary?.monthly?.percentage ?? 0}%
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            <strong className="text-slate-700 font-medium">{attendanceSummary?.monthly?.present ?? 0}</strong> present of {attendanceSummary?.monthly?.total ?? 0} days
                        </p>
                    </div>

                    {/* Fee Status */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Account Balance</span>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${(feeStatus?.total_due || 0) > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                <DollarSign className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className={`text-xl sm:text-2xl font-bold tracking-tight ${(feeStatus?.total_due || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatTaka(feeStatus?.total_due)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {(feeStatus?.total_due || 0) > 0 ? (
                                <span className="text-rose-600 font-medium">{feeStatus?.overdue_count ? `${feeStatus.overdue_count} Overdue Invoice(s)` : 'Outstanding Due'}</span>
                            ) : (
                                <span className="text-emerald-600 font-medium">All dues cleared</span>
                            )}
                        </p>
                    </div>

                    {/* Library Books */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Borrowed Books</span>
                            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {issuedBooks?.length ?? 0}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {(issuedBooks?.length ?? 0) > 0 ? 'Active borrowed items' : 'No books issued'}
                        </p>
                    </div>
                </div>

                {/* 3. QUICK NAVIGATION SHORTCUTS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                    <Link
                        href="/student/attendance"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Attendance</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Daily & monthly log</span>
                    </Link>

                    <Link
                        href="/student/results"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <Award className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Exam Results</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Marks & grade cards</span>
                    </Link>

                    <Link
                        href="/student/fees"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Fees & Ledger</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Ledger & receipts</span>
                    </Link>

                    <Link
                        href="/student/library"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <BookMarked className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Library</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Issued books</span>
                    </Link>

                    <Link
                        href="/student/notices"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <Bell className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Notice Board</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">School circulars</span>
                    </Link>

                    <Link
                        href="/student/messages"
                        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Messages</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Teacher chat</span>
                    </Link>
                </div>

                {/* 4. MAIN 2-COLUMN SECTION: ACADEMIC FOCUS & INSTITUTIONAL UPDATES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column: Recent Exam Results */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Recent Exam Results</h3>
                            </div>
                            <Link
                                href="/student/results"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                All Results <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {recentResults && recentResults.length > 0 ? (
                                <div className="space-y-2.5">
                                    {recentResults.map((result) => (
                                        <div
                                            key={result.id}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {result.exam_name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Score: <strong className="text-slate-700 font-medium">{result.obtained_marks}/{result.total_marks}</strong> ({result.percentage}%) • Position: #{result.position || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    GPA {result.gpa} ({result.grade})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No exam results published yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Recent Circulars & Notices */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-semibold text-slate-900">Latest Notices & Circulars</h3>
                            </div>
                            <Link
                                href="/student/notices"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                All Notices <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {recentNotices && recentNotices.length > 0 ? (
                                <div className="space-y-2.5">
                                    {recentNotices.map((notice) => (
                                        <Link
                                            key={notice.id}
                                            href={`/student/notices/${notice.id}`}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3 group block"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                        {notice.title}
                                                    </p>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(notice.priority)} uppercase tracking-wider shrink-0`}>
                                                        {notice.priority}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    Published: {new Date(notice.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No notices currently published</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. BOTTOM 2-COLUMN SECTION: RECENT PAYMENTS & BORROWED BOOKS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Recent Fee Payments */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Recent Fee Payments</h3>
                            </div>
                            <Link
                                href="/student/fees"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                Fee Ledger <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {feeStatus?.recent_payments && feeStatus.recent_payments.length > 0 ? (
                                <div className="space-y-2.5">
                                    {feeStatus.recent_payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {payment.fee_type}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Receipt: <strong className="text-slate-700 font-medium">{payment.receipt_number}</strong> • {payment.payment_date}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-bold text-emerald-600">
                                                    {formatTaka(payment.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No payment history recorded</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Issued Library Books */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-violet-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Issued Library Books</h3>
                            </div>
                            <Link
                                href="/student/library"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                View Library <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {issuedBooks && issuedBooks.length > 0 ? (
                                <div className="space-y-2.5">
                                    {issuedBooks.map((book) => (
                                        <div
                                            key={book.id}
                                            className="p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {book.book?.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                    Author: {book.book?.author || 'N/A'} • Issued: {book.issue_date}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                    Due: {book.due_date}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No books currently borrowed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
