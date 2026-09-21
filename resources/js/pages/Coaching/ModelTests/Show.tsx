import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { useInstitute } from '@/hooks/useInstitute';
import {
    Award,
    Trophy,
    Printer,
    Edit3,
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertCircle,
    UserX,
    BookOpen,
    Medal,
} from 'lucide-react';

interface ModelTestResult {
    id: number;
    student_id: number;
    marks_obtained: number | null;
    is_absent: boolean;
    percentage: number;
    status: 'pass' | 'fail' | 'absent';
    merit_rank: number | null;
    teacher_remarks: string | null;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_id: string;
        roll_number?: string;
        phone?: string;
        user?: { name: string };
    };
}

interface ModelTest {
    id: number;
    title: string;
    test_type: string;
    test_date: string;
    total_marks: number;
    pass_marks: number;
    duration_minutes?: number;
    status: 'upcoming' | 'completed' | 'published' | 'cancelled';
    highest_marks: number;
    average_marks: number;
    passed_count: number;
    failed_count: number;
    notes?: string;
    batch?: {
        id: number;
        name: string;
        course?: { name: string };
        teacher?: { first_name: string; last_name: string };
    };
    creator?: { name: string };
}

interface Props {
    test: ModelTest;
    results: ModelTestResult[];
}

export default function Show({ test, results }: Props) {
    const institute = useInstitute();

    const handlePrint = () => {
        window.print();
    };

    const attendedResults = results.filter((r) => !r.is_absent && r.marks_obtained !== null);
    const absentCount = results.filter((r) => r.is_absent).length;
    const passRate = attendedResults.length > 0
        ? Math.round((test.passed_count / attendedResults.length) * 100)
        : 0;

    const topPerformer = results.find((r) => r.merit_rank === 1 && !r.is_absent);

    const getRankBadge = (rank: number | null, isAbsent: boolean) => {
        if (isAbsent || rank === null) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">
                    ABS
                </span>
            );
        }
        if (rank === 1) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>1st Place</span>
                </span>
            );
        }
        if (rank === 2) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-sm">
                    <Medal className="w-3.5 h-3.5 text-slate-500" />
                    <span>2nd Place</span>
                </span>
            );
        }
        if (rank === 3) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Medal className="w-3.5 h-3.5 text-amber-700" />
                    <span>3rd Place</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                #{rank}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Merit List: ${test.title}`} />

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    nav, header, aside, .no-print, button, a {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .print-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #d1d5db !important;
                        padding: 6px 8px !important;
                        font-size: 11px !important;
                    }
                    .print-table th {
                        background-color: #f3f4f6 !important;
                    }
                }
                .print-only {
                    display: none;
                }
            `}</style>

            <div className="space-y-6">
                {/* Back & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/model-tests"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {test.test_type.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Batch: <strong className="text-gray-700">{test.batch?.name}</strong> ({test.batch?.course?.name})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="flex items-center gap-1.5"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Merit List</span>
                        </Button>
                        <Link href={`/model-tests/${test.id}/marks`}>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm">
                                <Edit3 className="w-4 h-4" />
                                <span>Enter / Update Marks</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Print Header (Only visible on paper) */}
                <div className="print-only text-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold uppercase">{institute.name}</h2>
                    <p className="text-xs text-gray-600">{institute.address} | Phone: {institute.phone}</p>
                    <h3 className="text-base font-bold mt-2 uppercase underline">Official Model Test Merit List</h3>
                    <p className="text-xs mt-1">
                        <strong>Test:</strong> {test.title} | <strong>Batch:</strong> {test.batch?.name} ({test.batch?.course?.name}) | <strong>Date:</strong> {test.test_date}
                    </p>
                    <p className="text-xs">
                        <strong>Total Marks:</strong> {test.total_marks} | <strong>Pass Marks:</strong> {test.pass_marks} | <strong>Highest:</strong> {test.highest_marks} | <strong>Average:</strong> {test.average_marks}
                    </p>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 no-print">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Top Performer (1st)</span>
                            <Trophy className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="mt-2">
                            {topPerformer ? (
                                <>
                                    <div className="font-bold text-gray-900 truncate">
                                        {topPerformer.student.first_name} {topPerformer.student.last_name}
                                    </div>
                                    <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                                        Score: {topPerformer.marks_obtained} / {test.total_marks} ({topPerformer.percentage}%)
                                    </div>
                                </>
                            ) : (
                                <span className="text-xs text-gray-400 italic">No marks recorded</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Highest & Average</span>
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-lg font-bold text-gray-900">
                                Top: {Number(test.highest_marks)} <span className="text-xs font-normal text-gray-400">/ {Number(test.total_marks)}</span>
                            </div>
                            <div className="text-xs text-indigo-600 font-medium mt-0.5">
                                Batch Avg: {Number(test.average_marks)} marks
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Pass Rate</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-lg font-bold text-emerald-700">{passRate}%</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                Passed: {test.passed_count} | Failed: {test.failed_count}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Participation</span>
                            <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-lg font-bold text-gray-900">{attendedResults.length} / {results.length}</div>
                            <div className="text-xs text-amber-600 font-medium mt-0.5">
                                Absent: {absentCount} candidates
                            </div>
                        </div>
                    </div>
                </div>

                {/* Merit List Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse print-table">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <th className="py-3 px-4 text-center w-24">Merit Rank</th>
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">Student ID / Roll</th>
                                    <th className="py-3 px-4 text-right">Marks Obtained</th>
                                    <th className="py-3 px-4 text-center">Score %</th>
                                    <th className="py-3 px-4 text-center">Result</th>
                                    <th className="py-3 px-4">Teacher Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-gray-400">
                                            No enrolled students found for this test.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/80 transition">
                                            <td className="py-3.5 px-4 text-center font-bold">
                                                {getRankBadge(r.merit_rank, r.is_absent)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-gray-900">
                                                    {r.student?.first_name} {r.student?.last_name}
                                                </div>
                                                {r.student?.phone && (
                                                    <div className="text-xs text-gray-400 no-print">{r.student.phone}</div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                                                {r.student?.student_id || r.student?.roll_number || '—'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                                                {r.is_absent ? (
                                                    <span className="text-gray-400 font-normal italic">Absent</span>
                                                ) : r.marks_obtained !== null ? (
                                                    <span>
                                                        {Number(r.marks_obtained)} <span className="text-xs font-normal text-gray-400">/ {Number(test.total_marks)}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 font-normal italic">Pending</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {!r.is_absent && r.marks_obtained !== null ? (
                                                    <div>
                                                        <span className="font-bold text-xs text-gray-800">{Number(r.percentage)}%</span>
                                                        <div className="w-16 bg-gray-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden no-print">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    r.percentage >= 80
                                                                        ? 'bg-emerald-500'
                                                                        : r.percentage >= 60
                                                                        ? 'bg-blue-500'
                                                                        : r.percentage >= 40
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${Math.min(100, r.percentage)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {r.is_absent ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                        ABSENT
                                                    </span>
                                                ) : r.status === 'pass' && r.marks_obtained !== null ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                        PASS
                                                    </span>
                                                ) : r.status === 'fail' ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
                                                        FAIL
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Pending</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-gray-600 italic">
                                                {r.teacher_remarks || '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
