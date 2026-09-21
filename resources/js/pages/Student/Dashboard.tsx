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
    CheckCircle,
    XCircle,
    AlertCircle,
    Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo_url: string | null;
    class_name: string;
    section_name: string;
    academic_year: string;
    phone: string;
    email: string;
    blood_group: string;
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
    valid_from: string;
    valid_to: string;
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

export default function Dashboard({
    student,
    attendanceSummary,
    feeStatus,
    recentExams,
    recentResults,
    recentNotices,
    issuedBooks,
    unreadMessagesCount,
}: Props) {
    const getAttendanceStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present': return 'text-green-600 bg-green-50 border-green-200';
            case 'absent': return 'text-red-600 bg-red-50 border-red-200';
            case 'late': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getResultStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pass': return 'text-green-600';
            case 'fail': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-blue-100 text-blue-800',
        };
        return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Student Dashboard
                    </h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700 text-sm">
                        {student.academic_year}
                    </span>
                </div>
            }
        >
            <Head title="Student Dashboard" />

            <div className="py-4 sm:py-6">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-xl shadow-xs sm:shadow-lg overflow-hidden border border-gray-100 mb-4 sm:mb-6 border-l-4 border-l-blue-500">
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                        {student.photo_url ? (
                                            <img
                                                src={student.photo_url}
                                                alt={student.full_name}
                                                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                            Welcome back, {student.full_name}!
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                                            Class {student.class_name} - Section {student.section_name} | Roll: {student.roll_number}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-gray-500">
                                            Admission No: {student.admission_number}
                                        </p>
                                    </div>
                                </div>
                                {unreadMessagesCount > 0 && (
                                    <Link href="/student/messages" className="self-start sm:self-auto">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white cursor-pointer shadow-xs">
                                            {unreadMessagesCount} New Messages
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {/* Today's Attendance */}
                        <div className="bg-white rounded-xl shadow-xs sm:shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-100 sm:border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3.5 sm:px-6 py-2.5 sm:py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Today's Attendance</h3>
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            </div>
                            <div className="p-3.5 sm:p-6">
                                <div className={`text-xl sm:text-2xl font-bold ${getAttendanceStatusColor(attendanceSummary.today.status)}`}>
                                    {attendanceSummary.today.status}
                                </div>
                                {attendanceSummary.today.in_time && (
                                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                                        In: {attendanceSummary.today.in_time}
                                        {attendanceSummary.today.out_time && ` | Out: ${attendanceSummary.today.out_time}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Monthly Attendance */}
                        <div className="bg-white rounded-xl shadow-xs sm:shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-100 sm:border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3.5 sm:px-6 py-2.5 sm:py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Monthly</h3>
                                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            </div>
                            <div className="p-3.5 sm:p-6">
                                <div className="text-xl sm:text-2xl font-bold">{attendanceSummary.monthly.percentage}%</div>
                                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                                    {attendanceSummary.monthly.present} / {attendanceSummary.monthly.total} days
                                </p>
                            </div>
                        </div>

                        {/* Fee Status */}
                        <div className="bg-white rounded-xl shadow-xs sm:shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-100 sm:border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3.5 sm:px-6 py-2.5 sm:py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Fee Status</h3>
                                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            </div>
                            <div className="p-3.5 sm:p-6">
                                <div className={`text-xl sm:text-2xl font-bold ${feeStatus.total_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ৳{feeStatus.total_due.toLocaleString()}
                                </div>
                                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                                    {feeStatus.total_due > 0 ? 'Due Amount' : 'All Paid'}
                                    {feeStatus.overdue_count > 0 && ` | ${feeStatus.overdue_count} Overdue`}
                                </p>
                            </div>
                        </div>

                        {/* Library Books */}
                        <div className="bg-white rounded-xl shadow-xs sm:shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-100 sm:border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3.5 sm:px-6 py-2.5 sm:py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Library Books</h3>
                                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            </div>
                            <div className="p-3.5 sm:p-6">
                                <div className="text-xl sm:text-2xl font-bold">{issuedBooks.length}</div>
                                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Books Issued</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Recent Results */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                                <CardTitle className="flex items-center text-base sm:text-lg">
                                    <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                    Recent Results
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Your latest exam results</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                {recentResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentResults.map((result) => (
                                            <div
                                                key={result.id}
                                                className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 sm:p-3 bg-gray-50/50"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-medium text-xs sm:text-sm truncate">{result.exam_name}</p>
                                                    <p className="text-[11px] sm:text-xs text-gray-600">
                                                        {result.obtained_marks} / {result.total_marks} ({result.percentage}%)
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <Badge className={getPriorityBadge(result.result_status)}>
                                                        {result.grade} - {result.gpa}
                                                    </Badge>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                                        Position: {result.position}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/results"
                                            className="block text-center text-xs sm:text-sm text-blue-600 hover:underline pt-1"
                                        >
                                            View All Results →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-xs sm:text-sm text-gray-500 py-4">
                                        No results published yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Notices */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                                <CardTitle className="flex items-center text-base sm:text-lg">
                                    <Bell className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                                    Recent Notices
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Important announcements</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                {recentNotices.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {recentNotices.map((notice) => (
                                            <div
                                                key={notice.id}
                                                className="flex items-start space-x-2.5 rounded-lg border border-gray-100 p-2.5 sm:p-3 bg-gray-50/50"
                                            >
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-medium text-xs sm:text-sm truncate">{notice.title}</p>
                                                        <Badge className={`${getPriorityBadge(notice.priority)} shrink-0 text-[10px]`}>
                                                            {notice.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                                        {new Date(notice.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/notices"
                                            className="block text-center text-xs sm:text-sm text-blue-600 hover:underline pt-1"
                                        >
                                            View All Notices →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-xs sm:text-sm text-gray-500 py-4">
                                        No notices available
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Fee Payments */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                                <CardTitle className="flex items-center text-base sm:text-lg">
                                    <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                    Recent Payments
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Your fee payment history</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                {feeStatus.recent_payments.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {feeStatus.recent_payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 sm:p-3 bg-gray-50/50"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-medium text-xs sm:text-sm truncate">{payment.fee_type}</p>
                                                    <p className="text-[11px] text-gray-500 truncate">
                                                        Receipt: {payment.receipt_number}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-semibold text-xs sm:text-sm text-green-600">
                                                        ৳{payment.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                                        {payment.payment_date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/fees"
                                            className="block text-center text-xs sm:text-sm text-blue-600 hover:underline pt-1"
                                        >
                                            View All Fees →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-xs sm:text-sm text-gray-500 py-4">
                                        No payment history
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Issued Books */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                                <CardTitle className="flex items-center text-base sm:text-lg">
                                    <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                    Library Books
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Currently issued books</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                {issuedBooks.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {issuedBooks.map((book) => (
                                            <div
                                                key={book.id}
                                                className="flex items-start space-x-2.5 rounded-lg border border-gray-100 p-2.5 sm:p-3 bg-gray-50/50"
                                            >
                                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-xs sm:text-sm truncate">{book.book.title}</p>
                                                    <p className="text-[11px] text-gray-600 truncate">{book.book.author}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                                        Due: {book.due_date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/library"
                                            className="block text-center text-xs sm:text-sm text-blue-600 hover:underline pt-1"
                                        >
                                            View Library →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-xs sm:text-sm text-gray-500 py-4">
                                        No books issued
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="mt-4 sm:mt-6">
                        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                                <Link
                                    href="/student/attendance"
                                    className="flex flex-col items-center space-y-2 rounded-xl border border-gray-100 p-3 sm:p-4 hover:bg-blue-50/50 hover:border-blue-200 transition text-center active:scale-98"
                                >
                                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">View Attendance</span>
                                </Link>
                                <Link
                                    href="/student/results"
                                    className="flex flex-col items-center space-y-2 rounded-xl border border-gray-100 p-3 sm:p-4 hover:bg-green-50/50 hover:border-green-200 transition text-center active:scale-98"
                                >
                                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">My Results</span>
                                </Link>
                                <Link
                                    href="/student/fees"
                                    className="flex flex-col items-center space-y-2 rounded-xl border border-gray-100 p-3 sm:p-4 hover:bg-yellow-50/50 hover:border-yellow-200 transition text-center active:scale-98"
                                >
                                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">Fee Status</span>
                                </Link>
                                <Link
                                    href="/student/messages"
                                    className="flex flex-col items-center space-y-2 rounded-xl border border-gray-100 p-3 sm:p-4 hover:bg-purple-50/50 hover:border-purple-200 transition text-center active:scale-98"
                                >
                                    <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">Messages</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
