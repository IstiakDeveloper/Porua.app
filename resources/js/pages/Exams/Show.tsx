import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTimeRange, formatWhen } from '@/utils/datetime';
import {
    ArrowLeft, Edit, Calendar, Clock, FileText,
    BookOpen, CheckCircle2, AlertCircle, Trophy,
} from 'lucide-react';
import { Exam } from '@/types/exam';

interface ShowProps {
    exam: Exam;
}

const typeLabels: Record<string, string> = {
    first_term: 'First Term',
    mid_term: 'Mid Term',
    final: 'Annual / Final',
    test: 'Class Test',
    practical: 'Practical',
};

function statusClass(status: string) {
    if (status === 'upcoming') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (status === 'ongoing') return 'bg-amber-50 text-amber-700 border-amber-100';
    if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function Show({ exam }: ShowProps) {
    const yearName = exam.academic_year?.name || exam.academicYear?.name;

    return (
        <AuthenticatedLayout>
            <Head title={exam.name} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <FileText className="w-3 h-3 text-emerald-600" />
                            <span>Examination</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            {exam.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {yearName || 'Academic year not set'} · {typeLabels[exam.exam_type] || exam.exam_type}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/exams/${exam.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Exam
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.visit('/exams')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                            <span className={`mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusClass(exam.status)}`}>
                                {exam.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {exam.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Starts
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatWhen(exam.start_date)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Ends
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatWhen(exam.end_date)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> Result date
                            </p>
                            <p className="mt-1 text-sm font-semibold text-emerald-700">
                                {exam.result_publish_date ? formatWhen(exam.result_publish_date) : 'Not set'}
                            </p>
                        </div>
                    </div>
                    {exam.description && (
                        <p className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700">{exam.description}</p>
                    )}
                </div>

                {exam.classes && exam.classes.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <h2 className="text-sm font-semibold text-slate-900 mb-3">Applicable classes</h2>
                        <div className="flex flex-wrap gap-2">
                            {exam.classes.map((cls) => (
                                <span
                                    key={cls.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-800"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {cls.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">Exam routine</h2>
                        <span className="text-xs text-slate-500">{exam.schedules?.length || 0} papers</span>
                    </div>
                    {exam.schedules && exam.schedules.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Class</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Subject</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Time</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Marks</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Room</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {exam.schedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-slate-50/70">
                                            <td className="px-4 py-3 text-slate-800">
                                                {schedule.school_class?.name || schedule.schoolClass?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{schedule.subject?.name || '—'}</td>
                                            <td className="px-4 py-3 text-slate-700">{formatWhen(schedule.exam_date || schedule.date)}</td>
                                            <td className="px-4 py-3 text-slate-700 font-mono">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {formatTimeRange(schedule.start_time, schedule.end_time)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-800">
                                                {schedule.full_marks} ({schedule.pass_marks} pass)
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{schedule.room_number || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="p-6 text-sm text-slate-500">No papers scheduled yet.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link href={`/exam-schedules?exam_id=${exam.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                        Manage schedules
                    </Link>
                    <Link href={`/marks?exam_id=${exam.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                        Enter marks
                    </Link>
                    <Link href={`/results?exam_id=${exam.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                        View results
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
