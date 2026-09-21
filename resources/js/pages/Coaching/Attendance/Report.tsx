import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { useInstitute } from '@/hooks/useInstitute';
import {
    ArrowLeft,
    Calendar,
    Printer,
    Users,
    CheckCircle2,
    Clock,
    UserCheck,
    UserX,
    FileText,
    TrendingUp,
} from 'lucide-react';

interface StudentReport {
    id: number;
    name: string;
    admission_number: string | number;
    records: Record<string, string>;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
}

interface BatchInfo {
    id: number;
    name: string;
    course_name: string;
    teacher_name: string;
    formatted_schedule: string;
}

interface Props {
    batch: BatchInfo;
    month: string;
    dates: string[];
    students: StudentReport[];
    totalClasses: number;
}

export default function AttendanceReport({ batch, month, dates, students, totalClasses }: Props) {
    const institute = useInstitute();

    const handleMonthChange = (newMonth: string) => {
        router.get(
            route('coaching.attendance.report', batch.id),
            { month: newMonth },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    // Calculate batch-wide average attendance percentage
    const avgPercentage =
        students.length > 0
            ? Math.round(students.reduce((acc, s) => acc + s.percentage, 0) / students.length)
            : 0;

    // Format month display (e.g. "September 2026")
    const monthFormatted = new Date(`${month}-01`).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <AuthenticatedLayout>
            <Head title={`Monthly Attendance Register - ${batch.name}`} />

            <div className="space-y-6">
                {/* Screen Header (Hidden on Print) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link
                                href={route('coaching.attendance.index')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Attendance Hub
                            </Link>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {batch.course_name}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            {batch.name} — Monthly Attendance Register
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Complete session log and attendance matrix for {monthFormatted}.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                className="border-0 bg-transparent text-xs font-semibold text-gray-900 dark:text-white focus:ring-0 p-0 cursor-pointer"
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={handlePrint}
                            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs px-4 py-2 inline-flex items-center gap-2 shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print Register
                        </Button>
                    </div>
                </div>

                {/* Performance Summary Cards (Hidden on Print) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
                    <Card className="p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Classes Held</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalClasses}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled Students</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{students.length}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Batch Avg. Attendance</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{avgPercentage}%</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mentor Teacher</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white mt-1 truncate">{batch.teacher_name}</p>
                    </Card>
                </div>

                {/* Printable Matrix Sheet */}
                <Card className="overflow-hidden p-6 print:p-0 print:border-none print:shadow-none bg-white">
                    {/* Official Print Header */}
                    <div className="hidden print:block text-center border-b pb-4 mb-4">
                        {institute.logoUrl && (
                            <img
                                src={institute.logoUrl}
                                alt="Logo"
                                className="h-14 mx-auto mb-2 object-contain"
                            />
                        )}
                        <h2 className="text-xl font-bold uppercase text-gray-900">
                            {institute.name}
                        </h2>
                        {institute.address && (
                            <p className="text-xs text-gray-600">{institute.address}</p>
                        )}
                        <div className="mt-3 pt-2 border-t border-gray-300 flex justify-between items-center text-xs font-semibold text-gray-700">
                            <span>Batch: {batch.name} ({batch.course_name})</span>
                            <span>Month: {monthFormatted}</span>
                            <span>Mentor: {batch.teacher_name}</span>
                            <span>Classes: {totalClasses}</span>
                        </div>
                    </div>

                    {/* Matrix Table */}
                    {totalClasses > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-collapse border-gray-300 dark:border-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center w-10">#</th>
                                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 min-w-[140px]">Student Name</th>
                                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center w-16">ID / Roll</th>
                                        {/* Date Columns */}
                                        {dates.map((dateStr) => {
                                            const dayNum = dateStr.split('-')[2];
                                            return (
                                                <th
                                                    key={dateStr}
                                                    className="border border-gray-300 dark:border-gray-700 px-1.5 py-2 text-center w-8"
                                                    title={dateStr}
                                                >
                                                    {dayNum}
                                                </th>
                                            );
                                        })}
                                        {/* Summaries */}
                                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 w-12">P</th>
                                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 w-12">A</th>
                                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center w-14 bg-gray-50 dark:bg-gray-700">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {students.map((student, idx) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-center font-medium text-gray-500">
                                                {idx + 1}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-1.5 font-semibold text-gray-900 dark:text-white">
                                                {student.name}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-2 py-1.5 text-center font-mono text-gray-600 dark:text-gray-400">
                                                {student.admission_number}
                                            </td>
                                            {/* Daily cells */}
                                            {dates.map((dateStr) => {
                                                const status = student.records[dateStr];
                                                return (
                                                    <td
                                                        key={dateStr}
                                                        className="border border-gray-300 dark:border-gray-700 px-1 py-1.5 text-center font-bold"
                                                    >
                                                        {status === 'present' ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400">P</span>
                                                        ) : status === 'absent' ? (
                                                            <span className="text-rose-600 dark:text-rose-400">A</span>
                                                        ) : status === 'late' ? (
                                                            <span className="text-amber-600 dark:text-amber-400">L</span>
                                                        ) : status === 'excused' ? (
                                                            <span className="text-blue-600 dark:text-blue-400">E</span>
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-600">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            {/* Summary Stats */}
                                            <td className="border border-gray-300 dark:border-gray-700 px-2 py-1.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10">
                                                {student.present}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-2 py-1.5 text-center font-bold text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/10">
                                                {student.absent}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-2 py-1.5 text-center font-bold bg-gray-50 dark:bg-gray-700/50">
                                                <span
                                                    className={
                                                        student.percentage >= 80
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : student.percentage >= 60
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {student.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                No attendance sessions found for {monthFormatted}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Mark attendance for this batch using the Attendance Hub.
                            </p>
                        </div>
                    )}

                    {/* Print Legend & Signature Footer */}
                    <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-xs">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4 text-gray-600">
                                <span><strong>P:</strong> Present</span>
                                <span><strong>A:</strong> Absent</span>
                                <span><strong>L:</strong> Late</span>
                                <span><strong>E:</strong> Excused</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end pt-12">
                            <div className="text-center border-t border-gray-400 pt-1 w-44">
                                Class Teacher / Mentor
                            </div>
                            <div className="text-center border-t border-gray-400 pt-1 w-44">
                                Academic Incharge
                            </div>
                            <div className="text-center border-t border-gray-400 pt-1 w-44">
                                Principal / Director
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
