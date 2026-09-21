import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Badge from '@/Components/Badge';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Users,
    TrendingUp,
    Award
} from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    class_name: string;
    section_name: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string | null;
    guardian_relation: string;
}

interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    total_days: number;
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
    attendanceStats: AttendanceStats;
    recentResults: Result[];
}

export default function Show({ student, attendanceStats, recentResults }: Props) {
    const attendancePercentage = attendanceStats.total_days > 0
        ? ((attendanceStats.present / attendanceStats.total_days) * 100).toFixed(1)
        : 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Student Details
                </h2>
            }
        >
            <Head title={`Student - ${student.full_name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0">
                                    {student.photo ? (
                                        <img
                                            src={`/storage/${student.photo}`}
                                            alt={student.full_name}
                                            className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                                            {student.full_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold">{student.full_name}</h2>
                                    <p className="text-lg text-gray-600 mt-1">
                                        Class {student.class_name} - {student.section_name}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <Badge variant="secondary">Roll: {student.roll_number}</Badge>
                                        <Badge variant="outline">{student.admission_number}</Badge>
                                        <Badge>{student.gender}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{attendancePercentage}%</div>
                                <p className="text-xs text-gray-500">
                                    {attendanceStats.present}/{attendanceStats.total_days} days present
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Recent Exams</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{recentResults.length}</div>
                                <p className="text-xs text-gray-500">Published results</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Avg Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    {recentResults.length > 0
                                        ? (recentResults.reduce((sum, r) => sum + r.percentage, 0) / recentResults.length).toFixed(1)
                                        : 0}%
                                </div>
                                <p className="text-xs text-gray-500">Overall performance</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Date of Birth:</span>
                                        <span className="ml-2 font-medium">{student.date_of_birth}</span>
                                    </div>
                                    {student.phone && (
                                        <div className="flex items-center">
                                            <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Phone:</span>
                                            <span className="ml-2 font-medium">{student.phone}</span>
                                        </div>
                                    )}
                                    {student.email && (
                                        <div className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 font-medium">{student.email}</span>
                                        </div>
                                    )}
                                    {student.address && (
                                        <div className="flex items-start">
                                            <MapPin className="mr-2 h-4 w-4 text-gray-500 mt-1" />
                                            <div>
                                                <span className="text-gray-600">Address:</span>
                                                <p className="font-medium">{student.address}</p>
                                                {student.city && <p className="text-gray-500">{student.city}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guardian Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5" />
                                    Guardian Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <p className="font-medium">{student.guardian_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Relation:</span>
                                        <p className="font-medium">{student.guardian_relation}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="ml-2 font-medium">{student.guardian_phone}</span>
                                    </div>
                                    {student.guardian_email && (
                                        <div className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 font-medium">{student.guardian_email}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    Attendance Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Present Days</span>
                                        <Badge variant="default" className="bg-green-600">{attendanceStats.present}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Absent Days</span>
                                        <Badge variant="destructive">{attendanceStats.absent}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Late Days</span>
                                        <Badge variant="secondary">{attendanceStats.late}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-sm font-semibold">Total Days</span>
                                        <Badge variant="outline">{attendanceStats.total_days}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Results */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Award className="mr-2 h-5 w-5" />
                                    Recent Exam Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentResults.map((result, index) => (
                                            <div key={index} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-sm">{result.exam_name}</h4>
                                                    <Badge variant="default">{result.grade}</Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                                    <div>
                                                        <p className="text-gray-500">Marks</p>
                                                        <p className="font-medium">{result.obtained_marks}/{result.total_marks}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Percentage</p>
                                                        <p className="font-medium">{result.percentage}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">GPA</p>
                                                        <p className="font-medium">{result.gpa}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No results available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
