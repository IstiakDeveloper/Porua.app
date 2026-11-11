import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    TrendingUp,
    Medal,
    ChevronRight,
    FileText,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { formatWhen } from '@/utils/datetime';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface Result {
    id: number;
    exam_id: number;
    exam_name: string;
    exam_date: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    gpa: number;
    grade: string;
    class_position: number;
    section_position: number;
    result_status: string;
    remarks: string | null;
}

interface Props {
    student: Student;
    results: Result[];
}

export default function Results({ student, results = [] }: Props) {
    const averagePercentage = results.length > 0
        ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
        : '0.0';

    const averageGPA = results.length > 0
        ? (results.reduce((sum, r) => sum + r.gpa, 0) / results.length).toFixed(2)
        : '0.00';

    const getGradeBadge = (grade: string) => {
        const g = (grade || '').toUpperCase();
        if (g.startsWith('A')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (g.startsWith('B')) {
            return 'bg-blue-50 text-blue-700 border-blue-200';
        }
        if (g.startsWith('C') || g.startsWith('D')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        return 'bg-rose-50 text-rose-700 border-rose-200';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Academic Results" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="My Academic Results"
                    subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number}`}
                    backUrl="/student/exams"
                    badges={[
                        { label: `${results.length} Terms Published`, variant: 'neutral' },
                        { label: `GPA ${averageGPA} Overall`, variant: Number(averageGPA) >= 3.5 ? 'success' : 'neutral' }
                    ]}
                />

                {/* 2. THREE SUMMARY KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">Average Score</span>
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">{averagePercentage}%</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Across all published exams</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-emerald-600">Cumulative GPA</span>
                            <Award className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 tracking-tight">{averageGPA}</div>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Scale: 5.00</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">Exams Completed</span>
                            <Medal className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">{results.length}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Published grade sheets</p>
                    </div>
                </div>

                {/* 3. RESULTS DIRECTORY (DUAL VIEW) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80">
                        <h3 className="text-sm font-semibold text-slate-900">Published Marksheets & Grade Cards</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Select any examination to inspect detailed subject-wise marksheet</p>
                    </div>

                    {results && results.length > 0 ? (
                        <>
                            {/* Mobile Card Feed */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {results.map((result) => (
                                    <div key={result.id} className="p-3.5 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">{result.exam_name}</h4>
                                                <p className="text-[11px] text-slate-500">{formatWhen(result.exam_date)}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadge(result.grade)}`}>
                                                GPA {result.gpa} ({result.grade})
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600">
                                            <div><span className="text-slate-400 block">Marks</span><strong>{result.obtained_marks}/{result.total_marks}</strong></div>
                                            <div><span className="text-slate-400 block">Percentage</span><strong>{result.percentage}%</strong></div>
                                            <div><span className="text-slate-400 block">Position</span><strong>#{result.class_position || 'N/A'}</strong></div>
                                        </div>

                                        <Link
                                            href={`/student/results/${result.id}`}
                                            className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                        >
                                            View Marksheet <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Exam Name</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Exam Date</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Obtained Marks</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Score %</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">GPA & Grade</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {results.map((result) => (
                                            <tr key={result.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{result.exam_name}</td>
                                                <td className="px-4 py-3 text-slate-500">{formatWhen(result.exam_date)}</td>
                                                <td className="px-4 py-3 text-slate-800 font-medium">
                                                    {result.obtained_marks} / {result.total_marks}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-700">{result.percentage}%</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadge(result.grade)}`}>
                                                        GPA {result.gpa} ({result.grade})
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-medium">#{result.class_position || 'N/A'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/student/results/${result.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Marksheet <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No published results available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
