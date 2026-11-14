import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    ArrowLeft,
    Printer,
    Award,
    CheckCircle2,
    XCircle,
    Trophy,
    BookOpen,
    FileText
} from 'lucide-react';

interface Mark {
    subject_id?: number;
    subject: string;
    theory_marks: number | null;
    practical_marks: number | null;
    obtained_marks: number | null;
    total_marks: number | null;
    grade: string;
    grade_point: number | string;
    is_absent: boolean;
}

interface Props {
    student: { id?: number; full_name: string; roll_number: string; class_name: string; section_name: string };
    result: {
        id: number;
        exam_id?: number;
        exam_name: string;
        total_marks: number;
        obtained_marks: number;
        percentage: number;
        grade: string;
        gpa: number;
        class_position: number | null;
        section_position: number | null;
        remarks: string | null;
        pass_status: string;
    };
    marks: Mark[];
    pending_subject_ids?: number[];
}

export default function ResultDetail({ student, result, marks = [], pending_subject_ids = [] }: Props) {
    const normalized = (result.pass_status || '').trim().toLowerCase();
    const [subjectId, setSubjectId] = useState(marks.find((mark) => mark.subject_id)?.subject_id ? String(marks.find((mark) => mark.subject_id)?.subject_id) : '');
    const [reason, setReason] = useState('');
    const isPass = normalized === 'pass' || normalized === 'passed';
    const isFail = normalized === 'fail' || normalized === 'failed';
    const statusLabel = result.pass_status?.trim() ? result.pass_status.toUpperCase() : 'PENDING';

    return (
        <AuthenticatedLayout>
            <Head title={`Marksheet - ${result.exam_name}`} />

            <ParentPage
                title={result.exam_name}
                subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll: ${student.roll_number || 'N/A'}`}
                action={
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('parent.exams.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Exams
                        </Link>
                        <a
                            href={route('parent.exams.result.print', result.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Marksheet
                        </a>
                    </div>
                }
            >
                {/* 1. Score Summary KPI Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs text-center sm:text-left">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Final Grade</p>
                        <p className="text-2xl font-black text-indigo-600 mt-0.5">{result.grade}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Overall Performance</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs text-center sm:text-left">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">GPA Score</p>
                        <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{Number(result.gpa).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Scale of 5.00</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs text-center sm:text-left">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Marks</p>
                        <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                            {result.obtained_marks} <span className="text-xs font-normal text-slate-400">/ {result.total_marks}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Marks Secured</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs text-center sm:text-left">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Percentage</p>
                        <p className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">
                            {Number(result.percentage).toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Aggregate Result</p>
                    </div>
                </div>

                {/* 2. Status & Ranking Badge Strip */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${
                            isPass
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                : isFail
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                            {isPass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : isFail ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : null}
                            Result Status: {statusLabel}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600">
                        {result.class_position != null && (
                            <span className="inline-flex items-center gap-1 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                Class Rank: #{result.class_position}
                            </span>
                        )}
                        {result.section_position != null && (
                            <span className="inline-flex items-center gap-1 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                                Section Rank: #{result.section_position}
                            </span>
                        )}
                    </div>
                </div>

                {/* 3. Subject-wise Marks Table */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            Subject-wise Marksheet Breakdown
                        </h3>
                        <span className="text-[11px] text-slate-400">{marks.length} Subjects Assessed</span>
                    </div>

                    {marks.length > 0 ? (
                        <>
                            {/* Mobile Subject Cards (< 768px) */}
                            <div className="block sm:hidden divide-y divide-slate-100">
                                {marks.map((m, idx) => (
                                    <div key={idx} className="p-3.5 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-slate-900">{m.subject}</p>
                                            <span className="px-2 py-0.5 rounded font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
                                                {m.is_absent ? 'F' : m.grade}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                                            <div>
                                                <span className="text-slate-400 block">Theory:</span>
                                                <span className="font-mono font-medium text-slate-800">{m.is_absent ? 'Absent' : m.theory_marks ?? '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Practical:</span>
                                                <span className="font-mono font-medium text-slate-800">{m.is_absent ? '—' : m.practical_marks ?? '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Total:</span>
                                                <span className="font-mono font-bold text-slate-900">{m.is_absent ? 0 : m.obtained_marks ?? '—'} / {m.total_marks ?? '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop ERP Table (>= 768px) */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50/80 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Theory
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Practical
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Obtained Marks
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Full Marks
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Grade
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Point
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {marks.map((m, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {m.subject}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-slate-600">
                                                    {m.is_absent ? <span className="text-rose-600 font-semibold">Absent</span> : m.theory_marks ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-slate-600">
                                                    {m.is_absent ? '—' : m.practical_marks ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                                                    {m.is_absent ? 0 : m.obtained_marks ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-slate-500">
                                                    {m.total_marks ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-block px-2 py-0.5 rounded font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/60 text-[11px]">
                                                        {m.is_absent ? 'F' : m.grade}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-slate-600">
                                                    {m.is_absent ? '0.00' : typeof m.grade_point === 'number' ? m.grade_point.toFixed(2) : m.grade_point || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-xs text-slate-500">
                            No subject marks recorded for this examination.
                        </div>
                    )}
                </div>

                <form
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!student.id || !result.exam_id) return;
                        router.post('/parent/rechecks', {
                            student_id: student.id,
                            exam_id: result.exam_id,
                            subject_id: subjectId,
                            reason,
                        });
                    }}
                >
                    <p className="text-xs font-semibold text-slate-800">Ask for a recheck</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                            {marks.filter((mark) => mark.subject_id).map((mark) => (
                                <option key={mark.subject_id} value={mark.subject_id}>
                                    {mark.subject}
                                    {pending_subject_ids.includes(Number(mark.subject_id)) ? ' (pending)' : ''}
                                </option>
                            ))}
                        </select>
                        <input
                            required
                            minLength={10}
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Why should this subject be checked again?"
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                            Submit
                        </button>
                    </div>
                </form>

                {/* 4. Evaluator Remarks */}
                {result.remarks && (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-1 text-xs">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher's Evaluation & Remarks</p>
                        <p className="text-slate-700 italic leading-relaxed">"{result.remarks}"</p>
                    </div>
                )}
            </ParentPage>
        </AuthenticatedLayout>
    );
}
