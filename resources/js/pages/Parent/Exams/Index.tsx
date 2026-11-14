import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import ChildSwitcher, { ChildOption } from '@/Components/Parent/ChildSwitcher';
import StatusPill from '@/Components/Parent/StatusPill';
import EmptyState from '@/Components/Parent/EmptyState';
import { formatClock, formatWhen } from '@/Components/Parent/format';
import { route } from '@/Components/Parent/route';
import {
    Award,
    Calendar,
    Clock,
    ChevronRight,
    GraduationCap,
    FileText,
    CheckCircle2,
    XCircle
} from 'lucide-react';

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
}

interface ResultRow {
    id: number;
    exam: { name: string };
    percentage: number;
    grade: string;
    pass_status: string;
}

interface Props {
    student: ChildOption | null;
    children: ChildOption[];
    upcomingExams: Exam[];
    results: ResultRow[];
}

export default function Index({ student, children, upcomingExams = [], results = [] }: Props) {
    const getPassBadge = (status: string) => {
        const isPass = status?.toLowerCase() === 'pass' || status?.toLowerCase() === 'passed';
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isPass
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
            }`}>
                {isPass ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                {isPass ? 'Passed' : 'Needs Retake'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Exam Results & Schedule" />

            <ParentPage
                title="Exams & Marksheets"
                subtitle="Review upcoming examination schedules and published term marksheets"
            >
                {!student ? (
                    <EmptyState
                        icon={<Award className="h-7 w-7 text-indigo-500" />}
                        title="No student linked yet"
                        body="Ask the school to link your child before exam results can be shown here."
                    />
                ) : (
                    <>
                        {/* Child Switcher Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
                            <ChildSwitcher children={children} student={student} href={route('parent.exams.index')} />
                        </div>

                        {/* 1. Upcoming Exams Schedule */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                Upcoming Exam Schedule ({upcomingExams.length})
                            </h2>

                            {upcomingExams.length === 0 ? (
                                <p className="text-xs text-slate-500 py-3">No upcoming exams currently announced for this class.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {upcomingExams.map((exam) => (
                                        <div key={exam.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Exam</span>
                                                <Calendar className="w-3.5 h-3.5 text-indigo-600 mt-0.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 truncate">{exam.name}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Date: <span className="font-semibold text-slate-700">{formatWhen(exam.exam_date)}</span>
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-mono">
                                                    Time: {formatClock(exam.start_time)} – {formatClock(exam.end_time)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Published Exam Results */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    Published Term Marksheets ({results.length})
                                </h2>
                                {student && (
                                    <Link href={`/parent/exams/year-sheet?student_id=${student.id}`} className="text-[11px] font-semibold text-indigo-700">
                                        Year sheet
                                    </Link>
                                )}
                            </div>

                            {results.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4">No published exam results recorded for this student yet.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {results.map((result) => (
                                        <Link
                                            key={result.id}
                                            href={route('parent.exams.result', result.id)}
                                            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-sm">
                                                    {result.grade}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                                                        {result.exam.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        Percentage: <span className="font-mono font-semibold text-slate-800">{Number(result.percentage).toFixed(1)}%</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                                                {getPassBadge(result.pass_status)}
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                                                    View Details <ChevronRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </ParentPage>
        </AuthenticatedLayout>
    );
}
