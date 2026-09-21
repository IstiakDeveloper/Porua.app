import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, LogIn, LogOut, TrendingUp } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'parent.attendance.index': '/parent/attendance',
    };
    return routes[name] || '/';
}

interface Child {
    id: number;
    full_name: string;
}

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
    class_name: string;
    section_name: string;
}

interface AttendanceRecord {
    id: number;
    date: string;
    status: string;
    in_time: string | null;
    out_time: string | null;
    reason: string | null;
}

interface Props {
    student: Student;
    children: Child[];
    selectedDate: string;
    attendanceRecord: AttendanceRecord | null;
    monthlySummary: {
        present: number;
        absent: number;
        late: number;
        half_day: number;
        total_days: number;
    };
    yearlySummary: {
        present: number;
        absent: number;
        late: number;
        total_days: number;
    };
}

export default function Index({
    student,
    children,
    selectedDate,
    attendanceRecord,
    monthlySummary,
    yearlySummary
}: Props) {

    const handleStudentChange = (studentId: string) => {
        router.get(route('parent.attendance.index'), {
            student_id: studentId,
            date: selectedDate
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        router.get(route('parent.attendance.index'), {
            student_id: student.id,
            date: newDate
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'absent':
                return <XCircle className="h-6 w-6 text-red-600" />;
            case 'late':
                return <Clock className="h-6 w-6 text-orange-600" />;
            case 'half_day':
                return <Clock className="h-6 w-6 text-blue-600" />;
            case 'leave':
                return <AlertCircle className="h-6 w-6 text-purple-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            present: 'bg-green-100 text-green-800 border-green-300',
            absent: 'bg-red-100 text-red-800 border-red-300',
            late: 'bg-orange-100 text-orange-800 border-orange-300',
            half_day: 'bg-blue-100 text-blue-800 border-blue-300',
            leave: 'bg-purple-100 text-purple-800 border-purple-300',
        };
        return variants[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            present: 'Present',
            absent: 'Absent',
            late: 'Late Arrival',
            half_day: 'Half Day',
            leave: 'On Leave',
        };
        return texts[status] || status;
    };

    const monthlyPercentage = monthlySummary.total_days > 0
        ? ((monthlySummary.present / monthlySummary.total_days) * 100).toFixed(1)
        : 0;

    const yearlyPercentage = yearlySummary.total_days > 0
        ? ((yearlySummary.present / yearlySummary.total_days) * 100).toFixed(1)
        : 0;

    const formatTime = (time: string | null) => {
        if (!time) return 'N/A';
        // Handle both time formats
        try {
            const date = new Date(`2000-01-01 ${time}`);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return time;
        }
    };

    const selectedDateObj = new Date(selectedDate);
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const currentMonth = selectedDateObj.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <AuthenticatedLayout>
            <Head title="Child Attendance" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
                        <p className="text-gray-600 mt-1">View your child's daily attendance information</p>
                    </div>

                    {/* Filters Card */}
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Child Selection */}
                                <div>
                                    <label htmlFor="child-select" className="text-base font-semibold mb-2 block">
                                        Select Child
                                    </label>
                                    <select
                                        id="child-select"
                                        value={student.id.toString()}
                                        onChange={(e) => handleStudentChange(e.target.value)}
                                        className="h-11 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {children.map((child) => (
                                            <option key={child.id} value={child.id.toString()}>
                                                {child.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Selection */}
                                <div>
                                    <label htmlFor="date-select" className="text-base font-semibold mb-2 block">
                                        Select Date
                                    </label>
                                    <input
                                        id="date-select"
                                        type="date"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        className="h-11 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {/* Student Info */}
                                <div className="flex flex-col justify-end">
                                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                                        <p className="text-xs text-gray-600 mb-1">Class & Section</p>
                                        <p className="font-bold text-indigo-900 text-lg">
                                            {student.class_name} - {student.section_name}
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            Roll: {student.roll_number}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Attendance Card */}
                    <div className="bg-white rounded-lg shadow-lg mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="h-6 w-6 text-indigo-600" />
                                        Daily Attendance
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            {attendanceRecord ? (
                                <div className="space-y-6">
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="text-center">
                                            <div className="flex justify-center mb-3">
                                                {getStatusIcon(attendanceRecord.status)}
                                            </div>
                                            <span
                                                className={`${getStatusBadge(attendanceRecord.status)} text-lg px-6 py-2 border-2 inline-block rounded-full`}
                                            >
                                                {getStatusText(attendanceRecord.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Time Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* In Time */}
                                        <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-600 rounded-full">
                                                    <LogIn className="h-5 w-5 text-white" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">Check In Time</h3>
                                            </div>
                                            <p className="text-3xl font-bold text-green-700 ml-12">
                                                {formatTime(attendanceRecord.in_time)}
                                            </p>
                                        </div>

                                        {/* Out Time */}
                                        <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-600 rounded-full">
                                                    <LogOut className="h-5 w-5 text-white" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">Check Out Time</h3>
                                            </div>
                                            <p className="text-3xl font-bold text-blue-700 ml-12">
                                                {formatTime(attendanceRecord.out_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reason/Remarks */}
                                    {attendanceRecord.reason && (
                                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">Remarks</h4>
                                                    <p className="text-gray-700">{attendanceRecord.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Attendance Record</h3>
                                    <p className="text-gray-500">
                                        No attendance has been recorded for this date.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Monthly Summary */}
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <div className="bg-gray-50 border-b p-4">
                            <h2 className="text-xl font-bold">Monthly Summary - {currentMonth}</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Present</p>
                                    <p className="text-2xl font-bold text-green-600">{monthlySummary.present}</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Absent</p>
                                    <p className="text-2xl font-bold text-red-600">{monthlySummary.absent}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Late</p>
                                    <p className="text-2xl font-bold text-orange-600">{monthlySummary.late}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Half Day</p>
                                    <p className="text-2xl font-bold text-blue-600">{monthlySummary.half_day}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                                    <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Attendance %</p>
                                    <p className="text-2xl font-bold text-indigo-600">{monthlyPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Yearly Summary */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="bg-gray-50 border-b p-4">
                            <h2 className="text-xl font-bold">Yearly Overview - {selectedDateObj.getFullYear()}</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Total Present</p>
                                    <p className="text-3xl font-bold text-green-600">{yearlySummary.present}</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-sm text-gray-600 mb-1">Total Absent</p>
                                    <p className="text-3xl font-bold text-red-600">{yearlySummary.absent}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-sm text-gray-600 mb-1">Total Late</p>
                                    <p className="text-3xl font-bold text-orange-600">{yearlySummary.late}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <p className="text-sm text-gray-600 mb-1">Overall %</p>
                                    <p className="text-3xl font-bold text-indigo-600">{yearlyPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
