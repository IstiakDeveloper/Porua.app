import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    User,
    Calendar,
    TrendingUp,
    DollarSign,
    MessageSquare,
    Bell,
    Users,
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'parent.children.show': '/parent/children/:id',
        'parent.attendance.index': '/parent/attendance',
        'parent.exams.index': '/parent/exams',
        'parent.fees.index': '/parent/fees',
        'parent.notices.index': '/parent/notices',
        'parent.notices.show': '/parent/notices/:id',
        'parent.messages.index': '/parent/messages',
        'parent.children.index': '/parent/children',
        'parent.profile.show': '/parent/profile',
    };

    if (params) {
        if (name === 'parent.children.show') {
            return `/parent/children/${params}`;
        }
        if (name === 'parent.notices.show') {
            return `/parent/notices/${params}`;
        }
        if (name === 'parent.attendance.index' && params.student_id) {
            return `/parent/attendance?student_id=${params.student_id}`;
        }
        if (name === 'parent.exams.index' && params.student_id) {
            return `/parent/exams?student_id=${params.student_id}`;
        }
        if (name === 'parent.fees.index' && params.student_id) {
            return `/parent/fees?student_id=${params.student_id}`;
        }
    }

    return routes[name] || '/';
}

interface Child {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    class_name: string;
    section_name: string;
    today_attendance: {
        status: string;
        remarks?: string;
    };
    recent_results: any[];
    fee_status: {
        total_due: number;
        overdue_count: number;
    };
}

interface Notice {
    id: number;
    title: string;
    type: string;
    priority: string;
    publish_date: string;
    is_pinned: boolean;
}

interface Props {
    parent: {
        id: number;
        father_name: string;
        mother_name: string;
        phone: string;
        email: string;
    };
    children: Child[];
    recentNotices: Notice[];
    unreadMessages: number;
}

export default function Dashboard({ parent, children, recentNotices, unreadMessages }: Props) {
    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'absent':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'late':
                return <Clock className="h-5 w-5 text-orange-600" />;
            case 'half_day':
                return <Clock className="h-5 w-5 text-blue-600" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getAttendanceLabel = (status: string) => {
        switch (status) {
            case 'present':
                return 'Present';
            case 'absent':
                return 'Absent';
            case 'late':
                return 'Late';
            case 'half_day':
                return 'Half Day';
            default:
                return 'Not Marked';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Parent Dashboard" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="mb-4 sm:mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-sm sm:shadow-md">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-3.5 sm:gap-4">
                                <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl backdrop-blur-xs shrink-0">
                                    <User className="h-7 w-7 sm:h-10 sm:w-10" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg sm:text-2xl font-bold truncate">Welcome, {parent.father_name}</h1>
                                    <p className="text-xs sm:text-sm text-indigo-100">Parent Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
                        <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                            <div className="p-3.5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">Children</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{children.length}</p>
                                    </div>
                                    <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-lg shrink-0">
                                        <Users className="h-5 w-5 sm:h-7 sm:w-7 text-indigo-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                            <div className="p-3.5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">Total Due</p>
                                        <p className="text-xl sm:text-2xl font-bold text-red-600 mt-0.5 truncate">
                                            ৳{children.reduce((sum, c) => sum + c.fee_status.total_due, 0).toFixed(0)}
                                        </p>
                                    </div>
                                    <div className="p-2 sm:p-2.5 bg-red-50 rounded-lg shrink-0">
                                        <DollarSign className="h-5 w-5 sm:h-7 sm:w-7 text-red-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                            <div className="p-3.5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">Messages</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{unreadMessages}</p>
                                    </div>
                                    <div className="p-2 sm:p-2.5 bg-green-50 rounded-lg shrink-0">
                                        <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7 text-green-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                            <div className="p-3.5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">Notices</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{recentNotices.length}</p>
                                    </div>
                                    <div className="p-2 sm:p-2.5 bg-purple-50 rounded-lg shrink-0">
                                        <Bell className="h-5 w-5 sm:h-7 sm:w-7 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Children Cards */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                                <div className="p-4 sm:p-6 border-b border-gray-100 sm:border-gray-200">
                                    <h2 className="text-base sm:text-xl font-bold text-gray-900">My Children</h2>
                                </div>
                                <div className="p-3.5 sm:p-6">
                                    <div className="space-y-3.5 sm:space-y-4">
                                        {children.length === 0 ? (
                                            <div className="text-center py-10 px-4">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-800">No Student Linked Yet</h3>
                                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                                    Welcome to Porua Family Portal! There are currently no students linked to your parent account. Please contact your school administration with your phone number ({parent.phone || 'registered number'}) to link your child's profile.
                                                </p>
                                            </div>
                                        ) : (
                                            children.map((child) => (
                                                <div key={child.id} className="border border-gray-100 rounded-xl shadow-xs bg-gray-50/40 p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        <img
                                                            src={child.photo || '/default-avatar.png'}
                                                            alt={child.full_name}
                                                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shrink-0 border-2 border-white shadow-xs"
                                                        />
                                                        <div className="sm:hidden flex-1 min-w-0">
                                                            <h3 className="font-semibold text-base text-gray-900 truncate">{child.full_name}</h3>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                {getAttendanceIcon(child.today_attendance.status)}
                                                                <span className="text-xs text-gray-600">
                                                                    {getAttendanceLabel(child.today_attendance.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <div className="hidden sm:flex items-center justify-between mb-2">
                                                            <h3 className="font-semibold text-lg text-gray-900 truncate">{child.full_name}</h3>
                                                            <div className="flex items-center gap-2">
                                                                {getAttendanceIcon(child.today_attendance.status)}
                                                                <span className="text-sm text-gray-600">
                                                                    {getAttendanceLabel(child.today_attendance.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600 mb-2.5 sm:mb-3">
                                                            <div>
                                                                <span className="font-medium text-gray-700">Class:</span> {child.class_name} - {child.section_name}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-700">Roll:</span> {child.roll_number}
                                                            </div>
                                                        </div>
                                                        {child.fee_status.overdue_count > 0 && (
                                                            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 mb-2.5">
                                                                {child.fee_status.overdue_count} Overdue Fee(s)
                                                            </span>
                                                        )}
                                                        <div className="grid grid-cols-2 sm:flex gap-2 flex-wrap pt-1">
                                                            <Link href={route('parent.children.show', child.id)}>
                                                                <button className="w-full sm:w-auto inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 active:scale-98">
                                                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-gray-500" />
                                                                    Profile
                                                                </button>
                                                            </Link>
                                                            <Link href={route('parent.attendance.index', { student_id: child.id })}>
                                                                <button className="w-full sm:w-auto inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 active:scale-98">
                                                                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-blue-600" />
                                                                    Attendance
                                                                </button>
                                                            </Link>
                                                            <Link href={route('parent.exams.index', { student_id: child.id })}>
                                                                <button className="w-full sm:w-auto inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 active:scale-98">
                                                                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-green-600" />
                                                                    Results
                                                                </button>
                                                            </Link>
                                                            <Link href={route('parent.fees.index', { student_id: child.id })}>
                                                                <button className="w-full sm:w-auto inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 active:scale-98">
                                                                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-amber-600" />
                                                                    Fees
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Notices & Quick Actions */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                                <div className="p-4 sm:p-6 border-b border-gray-100 sm:border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-xl font-bold text-gray-900">Recent Notices</h2>
                                        <Link href={route('parent.notices.index')}>
                                            <button className="px-2.5 py-1 text-xs text-blue-600 hover:underline">View All</button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-3.5 sm:p-6">
                                    <div className="space-y-2.5 sm:space-y-3">
                                        {recentNotices.length > 0 ? (
                                            recentNotices.map((notice) => (
                                                <Link
                                                    key={notice.id}
                                                    href={route('parent.notices.show', notice.id)}
                                                    className="block p-2.5 sm:p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Bell className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-xs sm:text-sm line-clamp-2 text-gray-900">{notice.title}</h4>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                                                                    {notice.type}
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 text-[10px] rounded ${getPriorityColor(notice.priority)}`}>
                                                                    {notice.priority}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No recent notices</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl shadow-xs sm:shadow-md border border-gray-100">
                                <div className="p-4 sm:p-6 border-b border-gray-100 sm:border-gray-200">
                                    <h2 className="text-base sm:text-xl font-bold text-gray-900">Quick Actions</h2>
                                </div>
                                <div className="p-3.5 sm:p-6">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                                        <Link href={route('parent.messages.index')} className="w-full">
                                            <button className="w-full inline-flex items-center justify-start p-2.5 sm:px-4 sm:py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-xs sm:text-sm font-medium active:scale-98">
                                                <MessageSquare className="h-4 w-4 mr-1.5 text-blue-600 shrink-0" />
                                                <span className="truncate">Messages</span>
                                                {unreadMessages > 0 && (
                                                    <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-indigo-600 text-white rounded-full">{unreadMessages}</span>
                                                )}
                                            </button>
                                        </Link>
                                        <Link href={route('parent.notices.index')} className="w-full">
                                            <button className="w-full inline-flex items-center justify-start p-2.5 sm:px-4 sm:py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-xs sm:text-sm font-medium active:scale-98">
                                                <Bell className="h-4 w-4 mr-1.5 text-amber-500 shrink-0" />
                                                <span className="truncate">Notices</span>
                                            </button>
                                        </Link>
                                        <Link href={route('parent.children.index')} className="w-full">
                                            <button className="w-full inline-flex items-center justify-start p-2.5 sm:px-4 sm:py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-xs sm:text-sm font-medium active:scale-98">
                                                <Users className="h-4 w-4 mr-1.5 text-green-600 shrink-0" />
                                                <span className="truncate">Children</span>
                                            </button>
                                        </Link>
                                        <Link href={route('parent.profile.show')} className="w-full">
                                            <button className="w-full inline-flex items-center justify-start p-2.5 sm:px-4 sm:py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-xs sm:text-sm font-medium active:scale-98">
                                                <User className="h-4 w-4 mr-1.5 text-purple-600 shrink-0" />
                                                <span className="truncate">Profile</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

