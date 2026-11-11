import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatWhen } from '@/utils/datetime';
import { ArrowLeft, Award, BookOpen, Printer, Trophy } from 'lucide-react';
import { Result } from '@/types/exam';

interface ShowProps {
    result: Result;
}

function score(value: number | string | null | undefined, digits = 1): string {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : '—';
}

export default function Show({ result }: ShowProps) {
    const studentName = result.student?.full_name || result.student?.user?.name || 'Student';
    const status = (result.result_status || result.status || '').toString();
    const passed = status.toLowerCase() === 'pass';
    const marks = result.student?.marks ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={`Result · ${studentName}`} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Award className="w-3 h-3" />
                            <span>Marksheet</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{studentName}</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {result.exam?.name || 'Examination'}
                            {result.exam?.result_publish_date ? ` · Publish ${formatWhen(result.exam.result_publish_date)}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/results/${result.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Marksheet
                        </a>
                        <button
                            type="button"
                            onClick={() => router.visit('/results')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Obtained</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 font-mono">
                            {score(result.obtained_marks, 0)}
                            <span className="text-sm font-normal text-slate-400"> / {score(result.total_marks, 0)}</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Percentage</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-700 font-mono">{score(result.percentage, 1)}%</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">GPA</p>
                        <p className="mt-1 text-2xl font-bold text-indigo-700 font-mono">
                            {score(result.gpa, 2)} <span className="text-base">({result.grade || '—'})</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                        <p className={`mt-1 text-2xl font-bold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {status ? status.toUpperCase() : 'PENDING'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            Class #{result.class_position ?? '—'} · Section #{result.section_position ?? '—'}
                        </p>
                    </div>
                </div>

                {result.remarks && (
                    <p className="text-sm text-slate-600 bg-white rounded-xl border border-slate-200/80 px-4 py-3">{result.remarks}</p>
                )}

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <h2 className="text-sm font-semibold text-slate-900">Subject-wise marks</h2>
                    </div>
                    {marks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Subject</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Theory</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Practical</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Obtained</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Full</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {marks.map((mark) => (
                                        <tr key={mark.id}>
                                            <td className="px-4 py-3 font-medium text-slate-900">{mark.subject?.name || '—'}</td>
                                            <td className="px-4 py-3 font-mono text-slate-700">{mark.theory_marks ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-slate-700">{mark.practical_marks ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono font-semibold text-slate-900">{mark.obtained_marks ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-slate-700">{mark.total_marks}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                                                    {mark.grade || '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="p-6 text-sm text-slate-500">Subject marks are not loaded for this result.</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
