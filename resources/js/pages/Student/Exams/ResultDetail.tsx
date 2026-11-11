import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    Printer,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    GraduationCap,
    School,
    FileSpreadsheet
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { useInstitute } from '@/hooks/useInstitute';
import { formatWhen } from '@/utils/datetime';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
    admission_number: string;
}

interface Result {
    id: number;
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

interface Mark {
    id: number;
    subject_name: string;
    theory_marks: number | null;
    practical_marks: number | null;
    total_marks: number;
    obtained_marks: number;
    grade: string;
    grade_point: number;
    is_absent: boolean;
    remarks: string | null;
}

interface Props {
    student: Student;
    result: Result;
    marks: Mark[];
}

export default function ResultDetail({ student, result, marks = [] }: Props) {
    const institute = useInstitute();
    const isPassed = (result?.result_status || '').toLowerCase() === 'pass';

    return (
        <AuthenticatedLayout>
            <Head title={`${result.exam_name} - Marksheet`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <div className="print:hidden">
                    <FormPageHeader
                        title={`${result.exam_name} - Marksheet`}
                        subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number}`}
                        backUrl="/student/results"
                        badges={[
                            { label: isPassed ? 'PASSED' : 'FAILED', variant: isPassed ? 'success' : 'neutral' },
                            { label: `GPA ${Number(result.gpa).toFixed(2)} (${result.grade})`, variant: 'neutral' }
                        ]}
                        actionSlot={
                            <a
                                href={`/student/results/${result.id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Marksheet
                            </a>
                        }
                    />
                </div>

                {/* 2. OFFICIAL MARKSHEET CARD CONTAINER (PRINT-READY) */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs print:border-none print:shadow-none print:p-0">
                    {/* Institutional Header (Shown on print & web) */}
                    <div className="text-center pb-4 mb-4 border-b border-slate-200">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <GraduationCap className="w-6 h-6 text-indigo-600 print:text-black" />
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                {institute.name || 'Institutional Academic Management'}
                            </h1>
                        </div>
                        {institute.address && <p className="text-xs text-slate-500">{institute.address}</p>}
                        <h2 className="text-sm sm:text-base font-bold text-indigo-700 uppercase tracking-widest mt-2 print:text-black">
                            Academic Progress Report / Marksheet
                        </h2>
                        <p className="text-xs text-slate-600 font-semibold">{result.exam_name}</p>
                    </div>

                    {/* Student Metadata Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 mb-5 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                            <strong className="text-slate-900 font-bold">{student.full_name}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                            <strong className="text-slate-800">Class {student.class_name} ({student.section_name})</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll / Student ID</span>
                            <strong className="text-slate-800">Roll #{student.roll_number} • ID: {student.admission_number}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Date</span>
                            <strong className="text-slate-800">{formatWhen(result.exam_date)}</strong>
                        </div>
                    </div>

                    {/* Performance Summary Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="p-3 rounded-lg border border-slate-200/80 bg-white text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Marks</span>
                            <span className="text-lg font-bold text-slate-900 font-mono">
                                {result.obtained_marks} / {result.total_marks}
                            </span>
                            <span className="text-[11px] text-slate-500 block">({Number(result.percentage).toFixed(1)}%)</span>
                        </div>
                        <div className="p-3 rounded-lg border border-slate-200/80 bg-white text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grade & GPA</span>
                            <span className="text-lg font-bold text-indigo-700">
                                {result.grade} ({Number(result.gpa).toFixed(2)})
                            </span>
                            <span className="text-[11px] text-slate-500 block">Scale: 5.00</span>
                        </div>
                        <div className="p-3 rounded-lg border border-slate-200/80 bg-white text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Position</span>
                            <span className="text-lg font-bold text-slate-800">
                                #{result.class_position || 'N/A'}
                            </span>
                            <span className="text-[11px] text-slate-500 block">Section: #{result.section_position || 'N/A'}</span>
                        </div>
                        <div className="p-3 rounded-lg border border-slate-200/80 bg-white text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Final Status</span>
                            <span className={`text-lg font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {result.result_status.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-500 block">{result.remarks || 'Standard Evaluation'}</span>
                        </div>
                    </div>

                    {/* Subject-Wise Marks Breakdown Table */}
                    <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Subject</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-center">Theory</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-center">Practical</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-center">Total Marks</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-center">Obtained</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-center">Grade Point</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-center">Grade</th>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {marks.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-2.5 font-bold text-slate-900">{m.subject_name}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 font-mono">{m.theory_marks ?? '—'}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 font-mono">{m.practical_marks ?? '—'}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 font-mono">{m.total_marks}</td>
                                        <td className="px-4 py-2.5 text-center font-bold text-slate-900 font-mono">
                                            {m.is_absent ? (
                                                <span className="text-rose-600 font-bold">ABSENT</span>
                                            ) : (
                                                m.obtained_marks
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-bold text-slate-800 font-mono">{m.grade_point}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                                {m.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-500">{m.remarks || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Print Signatures Block */}
                    <div className="hidden print:flex items-end justify-between pt-16 px-4 text-xs font-semibold text-slate-700">
                        <div className="text-center">
                            <div className="w-36 border-t border-slate-800 mb-1" />
                            Class Teacher
                        </div>
                        <div className="text-center">
                            <div className="w-36 border-t border-slate-800 mb-1" />
                            Controller of Examinations
                        </div>
                        <div className="text-center">
                            <div className="w-36 border-t border-slate-800 mb-1" />
                            Principal / Headmaster
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
