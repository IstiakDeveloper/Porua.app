import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Award, Printer } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Exam {
    name: string;
    class_name: string;
    section_name: string;
    total_marks: number;
}

interface Subject {
    name: string;
}

interface Mark {
    student_name: string;
    roll_number: string;
    theory_marks: number | null;
    practical_marks: number | null;
    obtained_marks: number;
    grade: string;
    is_absent: boolean;
}

interface Statistics {
    total_students: number;
    passed: number;
    failed: number;
    absent: number;
    highest: number;
    lowest: number;
    average: number;
}

interface Props {
    exam: Exam;
    subject: Subject;
    marks: Mark[];
    statistics: Statistics;
}

export default function ViewMarks({ exam, subject, marks = [], statistics }: Props) {
    const getGradeBadge = (grade: string) => {
        const g = (grade || '').toUpperCase();
        if (g.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (g.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (g.startsWith('C') || g.startsWith('D')) return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-rose-50 text-rose-700 border-rose-200';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Gradebook - ${subject.name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <div className="print:hidden">
                    <FormPageHeader
                        title={`Verified Gradebook: ${subject.name}`}
                        subtitle={`${exam.name} • Class ${exam.class_name} (${exam.section_name}) • Total Marks: ${exam.total_marks}`}
                        backUrl="/teacher/exams"
                        badges={[
                            { label: `${statistics?.passed ?? 0} Passed / ${statistics?.total_students ?? 0}`, variant: 'success' },
                            { label: `Avg Score: ${statistics?.average ?? 0}`, variant: 'neutral' }
                        ]}
                        actionSlot={
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Gradebook
                            </button>
                        }
                    />
                </div>

                {/* 2. FOUR KPI PERFORMANCE CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-xs font-semibold text-slate-500 block">Total Enrolled</span>
                        <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{statistics?.total_students ?? 0}</p>
                        <span className="text-[11px] text-slate-400">Class strength</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-xs font-semibold text-emerald-600 block">Passed Ratio</span>
                        <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                            {statistics?.passed ?? 0}
                            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {statistics?.failed ?? 0} failed</span>
                        </p>
                        <span className="text-[11px] text-emerald-600">
                            {statistics?.total_students ? Math.round((statistics.passed / statistics.total_students) * 100) : 0}% passing rate
                        </span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-xs font-semibold text-indigo-600 block">Class Average</span>
                        <p className="text-2xl font-bold text-indigo-700 mt-1 font-mono">{statistics?.average ?? 0}</p>
                        <span className="text-[11px] text-indigo-600">Mean score out of {exam.total_marks}</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <span className="text-xs font-semibold text-amber-600 block">Highest vs Lowest</span>
                        <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                            {statistics?.highest ?? 0}
                            <span className="text-xs font-normal text-rose-500 ml-1.5">/ {statistics?.lowest ?? 0}</span>
                        </p>
                        <span className="text-[11px] text-slate-400">{statistics?.absent ?? 0} Absent students</span>
                    </div>
                </div>

                {/* 3. VERIFIED MARKS REGISTER TABLE */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden print:border-none print:shadow-none">
                    <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Student Verified Marks & Grades</h3>
                            <p className="text-xs text-slate-500">{exam.name} • {subject.name}</p>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                            {marks.length} Records
                        </span>
                    </div>

                    {marks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                        <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                                        <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Theory</th>
                                        <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Practical</th>
                                        <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Obtained Total</th>
                                        <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Letter Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {marks.map((m, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                #{m.roll_number}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                {m.student_name}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono text-slate-700">
                                                {m.theory_marks !== null ? m.theory_marks : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono text-slate-700">
                                                {m.practical_marks !== null ? m.practical_marks : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                                                {m.is_absent ? (
                                                    <span className="text-rose-600 font-bold">ABSENT</span>
                                                ) : (
                                                    m.obtained_marks
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadge(m.grade)}`}>
                                                    {m.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No marks entered for this exam yet</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
