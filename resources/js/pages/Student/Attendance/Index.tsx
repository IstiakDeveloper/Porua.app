import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface AttendanceRecord {
    id: number;
    date: string;
    day: string;
    status: string;
    in_time: string | null;
    out_time: string | null;
    reason: string | null;
}

interface Summary {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface YearlySummary {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface Props {
    student: Student;
    attendance: AttendanceRecord[];
    summary: Summary;
    yearlySummary: YearlySummary;
    filters: {
        month: number;
        year: number;
    };
    availableMonths: number[];
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Index({ student, attendance, summary, yearlySummary, filters, availableMonths }: Props) {
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);

    const handleFilterChange = (month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get('/student/attendance', { month, year }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; className: string }> = {
            present: {
                variant: 'default',
                icon: CheckCircle,
                className: 'bg-green-100 text-green-800 border-green-200'
            },
            absent: {
                variant: 'destructive',
                icon: XCircle,
                className: 'bg-red-100 text-red-800 border-red-200'
            },
            late: {
                variant: 'secondary',
                icon: Clock,
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
            },
        };

        const config = variants[status.toLowerCase()] || variants.absent;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 75) return 'text-blue-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const previousMonth = () => {
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        handleFilterChange(newMonth, newYear);
    };

    const nextMonth = () => {
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        handleFilterChange(newMonth, newYear);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        My Attendance
                    </h2>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            }
        >
            <Head title="My Attendance" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Class {student.class_name} - {student.section_name} | Roll: {student.roll_number}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total}</div>
                                <p className="text-xs text-gray-500">This month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{summary.present}</div>
                                <p className="text-xs text-gray-500">{summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0}% attendance</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
                                <p className="text-xs text-gray-500">{summary.total > 0 ? Math.round((summary.absent / summary.total) * 100) : 0}% of days</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Late Arrivals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{summary.late}</div>
                                <p className="text-xs text-gray-500">{summary.total > 0 ? Math.round((summary.late / summary.total) * 100) : 0}% of days</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Overall Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5" />
                                Overall Performance
                            </CardTitle>
                            <CardDescription>Academic year attendance summary</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Total Days:</span>
                                        <span className="font-semibold">{yearlySummary.total}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Present:</span>
                                        <span className="font-semibold text-green-600">{yearlySummary.present}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Absent:</span>
                                        <span className="font-semibold text-red-600">{yearlySummary.absent}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-5xl font-bold ${getPercentageColor(yearlySummary.percentage)}`}>
                                        {yearlySummary.percentage}%
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">Attendance Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Month Navigation */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Attendance Records
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button onClick={previousMonth} variant="outline" size="sm">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium min-w-[150px] text-center">
                                        {months[selectedMonth - 1]} {selectedYear}
                                    </span>
                                    <Button onClick={nextMonth} variant="outline" size="sm">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {attendance.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Day</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">In Time</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Out Time</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map((record) => (
                                                <tr key={record.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm">
                                                        {new Date(record.date).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{record.day}</td>
                                                    <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                                                    <td className="py-3 px-4 text-sm">{record.in_time || '-'}</td>
                                                    <td className="py-3 px-4 text-sm">{record.out_time || '-'}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {record.reason || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        No attendance records for {months[selectedMonth - 1]} {selectedYear}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
