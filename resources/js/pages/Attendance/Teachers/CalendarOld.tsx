import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import AttendanceCalendar from '@/Components/AttendanceCalendar';
import { ArrowLeft, List } from 'lucide-react';
import Button from '@/Components/Button';

interface Props {
    attendanceData: Record<string, { status: string; count: number; details: any }>;
    year: number;
    month: number;
}

export default function Calendar({ attendanceData, year, month }: Props) {
    const handleDateSelect = (date: string) => {
        router.get('/teacher-attendance', { date });
    };

    const currentDate = `${year}-${String(month).padStart(2, '0')}-01`;

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Attendance Calendar" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Teacher Attendance Calendar
                        </h1>
                        <p className="text-gray-600 mt-1">Monthly overview of teacher attendance</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/teacher-attendance">
                            <Button variant="outline" icon={<List className="w-5 h-5" />}>
                                List View
                            </Button>
                        </Link>
                        <Link href="/teacher-attendance">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Calendar */}
                <AttendanceCalendar
                    currentDate={currentDate}
                    attendanceData={attendanceData}
                    onDateSelect={handleDateSelect}
                    type="teacher"
                />

                {/* Summary Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600">Total Present Days</p>
                            <p className="text-2xl font-bold text-green-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'present').length}
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-gray-600">Total Absent Days</p>
                            <p className="text-2xl font-bold text-red-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'absent').length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-600">Total Late Days</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'late').length}
                            </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-600">Total Leave Days</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'leave').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
