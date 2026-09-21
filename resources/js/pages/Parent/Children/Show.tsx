import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    User,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Heart,
    Users,
    TrendingUp,
    CheckCircle,
    BookOpen
} from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    class_name: string;
    section_name: string;
    blood_group: string;
    medical_conditions: string;
}

interface Result {
    exam_name: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    grade: string;
    gpa: number;
}

interface Props {
    student: Student;
    attendanceStats: {
        present: number;
        absent: number;
        late: number;
        total_days: number;
    };
    recentResults: Result[];
    feeStats: {
        total_paid: number;
        total_due: number;
        overdue_count: number;
    };
}

export default function Show({ student, attendanceStats, recentResults, feeStats }: Props) {
    const attendancePercentage = attendanceStats.total_days > 0
        ? ((attendanceStats.present / attendanceStats.total_days) * 100).toFixed(1)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title={student.full_name} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <div className="p-6">
                            <div className="flex items-start gap-6">
                                <img
                                    src={student.photo || '/default-avatar.png'}
                                    alt={student.full_name}
                                    className="h-32 w-32 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold mb-2">{student.full_name}</h1>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Admission No:</span>
                                            <p className="font-medium">{student.admission_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Roll Number:</span>
                                            <p className="font-medium">{student.roll_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Class:</span>
                                            <p className="font-medium">{student.class_name} - {student.section_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Gender:</span>
                                            <p className="font-medium">{student.gender}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Attendance</p>
                                        <p className="text-2xl font-bold">{attendancePercentage}%</p>
                                        <p className="text-xs text-gray-500">
                                            {attendanceStats.present}/{attendanceStats.total_days} days present
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Recent Exams</p>
                                        <p className="text-2xl font-bold">{recentResults.length}</p>
                                        <p className="text-xs text-gray-500">Published results</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Average Performance</p>
                                        <p className="text-2xl font-bold">
                                            {recentResults.length > 0
                                                ? (recentResults.reduce((sum, r) => sum + r.percentage, 0) / recentResults.length).toFixed(1)
                                                : 0}%
                                        </p>
                                        <p className="text-xs text-gray-500">Last {recentResults.length} exams</p>
                                    </div>
                                    <BookOpen className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Date of Birth</p>
                                            <p className="font-medium">
                                                {new Date(student.date_of_birth).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Blood Group</p>
                                            <p className="font-medium">{student.blood_group || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium">{student.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium">{student.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600">Address</p>
                                            <p className="font-medium">{student.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {student.medical_conditions && (
                                        <div className="flex items-start gap-3">
                                            <Heart className="h-5 w-5 text-red-400 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-600">Medical Conditions</p>
                                                <p className="font-medium text-red-600">{student.medical_conditions}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Attendance Summary */}
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Attendance Summary (This Year)</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="font-medium">Present</span>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">
                                            {attendanceStats.present}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="h-5 w-5 text-red-600">✕</span>
                                            <span className="font-medium">Absent</span>
                                        </div>
                                        <span className="text-lg font-bold text-red-600">
                                            {attendanceStats.absent}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="h-5 w-5 text-orange-600">⏰</span>
                                            <span className="font-medium">Late</span>
                                        </div>
                                        <span className="text-lg font-bold text-orange-600">
                                            {attendanceStats.late}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium">Total Days</span>
                                        </div>
                                        <span className="text-lg font-bold text-blue-600">
                                            {attendanceStats.total_days}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Exam Results */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Recent Exam Results</h2>
                            </div>
                            <div className="p-6">
                                {recentResults.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4">Exam Name</th>
                                                    <th className="text-center py-3 px-4">Total Marks</th>
                                                    <th className="text-center py-3 px-4">Obtained</th>
                                                    <th className="text-center py-3 px-4">Percentage</th>
                                                    <th className="text-center py-3 px-4">Grade</th>
                                                    <th className="text-center py-3 px-4">GPA</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentResults.map((result, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">{result.exam_name}</td>
                                                        <td className="text-center py-3 px-4">{result.total_marks}</td>
                                                        <td className="text-center py-3 px-4">{result.obtained_marks}</td>
                                                        <td className="text-center py-3 px-4">
                                                            <span
                                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                                    result.percentage >= 80
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : result.percentage >= 60
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : result.percentage >= 40
                                                                        ? 'bg-orange-100 text-orange-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {result.percentage.toFixed(2)}%
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                                {result.grade}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-4">{result.gpa.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No exam results available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
