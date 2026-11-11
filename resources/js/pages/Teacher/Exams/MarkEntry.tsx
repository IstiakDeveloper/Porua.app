import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Save, ArrowLeft, UserCheck, UserX, Calculator, CheckCircle2 } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Exam {
    id: number;
    name: string;
    class_name: string;
    section_name: string;
    total_marks: number;
}

interface Subject {
    id: number;
    name: string;
}

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
    theory_marks?: number;
    practical_marks?: number;
    is_absent?: boolean;
}

interface Props {
    exam: Exam;
    subject: Subject;
    students: Student[];
}

export default function MarkEntry({ exam, subject, students = [] }: Props) {
    const [marks, setMarks] = useState<{ [key: number]: { theory_marks: string; practical_marks: string; is_absent: boolean } }>(
        students.reduce((acc, student) => {
            acc[student.id] = {
                theory_marks: student.theory_marks !== undefined && student.theory_marks !== null ? student.theory_marks.toString() : '',
                practical_marks: student.practical_marks !== undefined && student.practical_marks !== null ? student.practical_marks.toString() : '',
                is_absent: student.is_absent || false,
            };
            return acc;
        }, {} as any)
    );
    const [totalMarks, setTotalMarks] = useState<string>(exam.total_marks?.toString() || '100');
    const [saving, setSaving] = useState(false);

    const handleMarkChange = (studentId: number, field: 'theory_marks' | 'practical_marks', value: string) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
                is_absent: false,
            },
        }));
    };

    const handleAbsentToggle = (studentId: number) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                is_absent: !prev[studentId].is_absent,
                theory_marks: !prev[studentId].is_absent ? '' : prev[studentId].theory_marks,
                practical_marks: !prev[studentId].is_absent ? '' : prev[studentId].practical_marks,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formattedMarks = Object.entries(marks).map(([studentId, data]) => ({
            student_id: parseInt(studentId),
            theory_marks: data.is_absent ? null : parseFloat(data.theory_marks) || 0,
            practical_marks: data.is_absent ? null : parseFloat(data.practical_marks) || 0,
            is_absent: data.is_absent,
        }));

        router.post('/teacher/exams/marks/store', {
            exam_id: exam.id,
            subject_id: subject.id,
            subject_total_marks: parseFloat(totalMarks) || 100,
            marks: formattedMarks,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
            },
            onError: () => {
                setSaving(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Mark Entry - ${subject.name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title={`Gradebook Entry: ${subject.name}`}
                    subtitle={`${exam.name} • Class ${exam.class_name} (${exam.section_name})`}
                    backUrl="/teacher/exams"
                    badges={[
                        { label: `Max Marks: ${totalMarks}`, variant: 'neutral' },
                        { label: `${students.length} Students`, variant: 'neutral' }
                    ]}
                    actionSlot={
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {saving ? 'Saving...' : 'Submit Gradebook'}
                        </button>
                    }
                />

                {/* 2. SPREADSHEET GRADEBOOK GRID */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Student Scoring Sheet</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-medium">Subject Max Marks:</span>
                            <input
                                type="number"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                                className="w-20 text-xs py-1 px-2 border border-slate-200 rounded-lg text-center font-mono font-bold"
                            />
                        </div>
                    </div>

                    {students && students.length > 0 ? (
                        <>
                            {/* Mobile Card Inputs */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {students.map((student) => {
                                    const entry = marks[student.id] || { theory_marks: '', practical_marks: '', is_absent: false };
                                    const theory = parseFloat(entry.theory_marks) || 0;
                                    const practical = parseFloat(entry.practical_marks) || 0;
                                    const totalObtained = entry.is_absent ? 0 : theory + practical;

                                    return (
                                        <div key={student.id} className="p-3.5 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900">{student.full_name}</span>
                                                    <span className="text-[11px] text-slate-500 font-mono ml-1.5">Roll #{student.roll_number}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAbsentToggle(student.id)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                                        entry.is_absent
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}
                                                >
                                                    {entry.is_absent ? 'Absent' : 'Mark Absent'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-0.5">Theory</label>
                                                    <input
                                                        type="number"
                                                        disabled={entry.is_absent}
                                                        value={entry.theory_marks}
                                                        onChange={(e) => handleMarkChange(student.id, 'theory_marks', e.target.value)}
                                                        className="w-full text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-center font-mono font-bold disabled:bg-slate-100"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-0.5">Practical</label>
                                                    <input
                                                        type="number"
                                                        disabled={entry.is_absent}
                                                        value={entry.practical_marks}
                                                        onChange={(e) => handleMarkChange(student.id, 'practical_marks', e.target.value)}
                                                        className="w-full text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-center font-mono font-bold disabled:bg-slate-100"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-0.5">Total</label>
                                                    <div className="text-xs py-1.5 px-2 border border-slate-100 bg-slate-50 rounded-lg text-center font-mono font-bold text-indigo-700">
                                                        {entry.is_absent ? 'ABS' : totalObtained}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop High-Density Spreadsheet Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Roll</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Theory Score</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Practical Score</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Calculated Total</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {students.map((student) => {
                                            const entry = marks[student.id] || { theory_marks: '', practical_marks: '', is_absent: false };
                                            const theory = parseFloat(entry.theory_marks) || 0;
                                            const practical = parseFloat(entry.practical_marks) || 0;
                                            const totalObtained = entry.is_absent ? 0 : theory + practical;

                                            return (
                                                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">
                                                        #{student.roll_number}
                                                    </td>
                                                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                                                        {student.full_name}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            disabled={entry.is_absent}
                                                            value={entry.theory_marks}
                                                            onChange={(e) => handleMarkChange(student.id, 'theory_marks', e.target.value)}
                                                            className="w-20 text-xs py-1 px-2 border border-slate-200 rounded-lg text-center font-mono font-bold disabled:bg-slate-100"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            disabled={entry.is_absent}
                                                            value={entry.practical_marks}
                                                            onChange={(e) => handleMarkChange(student.id, 'practical_marks', e.target.value)}
                                                            className="w-20 text-xs py-1 px-2 border border-slate-200 rounded-lg text-center font-mono font-bold disabled:bg-slate-100"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center font-mono font-bold text-indigo-700">
                                                        {entry.is_absent ? (
                                                            <span className="text-rose-600 font-bold">ABSENT</span>
                                                        ) : (
                                                            totalObtained
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAbsentToggle(student.id)}
                                                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                                                entry.is_absent
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {entry.is_absent ? 'Absent' : 'Present'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Calculator className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No students enrolled in this section</p>
                        </div>
                    )}

                    <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50/60">
                        <button
                            type="button"
                            onClick={() => router.visit('/teacher/exams')}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {saving ? 'Saving...' : 'Save & Submit Marks'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
