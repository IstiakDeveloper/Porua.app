import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import {
    Edit3,
    ArrowLeft,
    CheckCircle2,
    Save,
    AlertCircle,
    Users,
    Clock,
    Award,
    Sparkles,
} from 'lucide-react';

interface ModelTestResult {
    id: number;
    student_id: number;
    marks_obtained: number | null;
    is_absent: boolean;
    teacher_remarks: string | null;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_id: string;
        roll_number?: string;
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
    status: string;
    batch?: {
        id: number;
        name: string;
        course?: { name: string };
    };
}

interface Props {
    test: ModelTest;
    results: ModelTestResult[];
}

interface EntryState {
    id: number;
    student_id: number;
    marks_obtained: string | number;
    is_absent: boolean;
    teacher_remarks: string;
}

export default function MarkEntry({ test, results }: Props) {
    const [entries, setEntries] = useState<EntryState[]>(
        results.map((r) => ({
            id: r.id,
            student_id: r.student_id,
            marks_obtained: r.is_absent ? '' : (r.marks_obtained !== null ? r.marks_obtained : ''),
            is_absent: Boolean(r.is_absent),
            teacher_remarks: r.teacher_remarks || '',
        }))
    );

    const [publishNow, setPublishNow] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleMarksChange = (index: number, val: string) => {
        const num = val === '' ? '' : Math.min(Number(test.total_marks), Math.max(0, Number(val)));
        setEntries((prev) => {
            const next = [...prev];
            next[index].marks_obtained = num;
            return next;
        });
    };

    const handleAbsentToggle = (index: number) => {
        setEntries((prev) => {
            const next = [...prev];
            const willBeAbsent = !next[index].is_absent;
            next[index].is_absent = willBeAbsent;
            if (willBeAbsent) {
                next[index].marks_obtained = '';
            }
            return next;
        });
    };

    const handleRemarksChange = (index: number, text: string) => {
        setEntries((prev) => {
            const next = [...prev];
            next[index].teacher_remarks = text;
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        router.post(`/model-tests/${test.id}/marks`, {
            results: entries.map((e) => ({
                id: e.id,
                is_absent: e.is_absent,
                marks_obtained: e.marks_obtained !== '' ? Number(e.marks_obtained) : null,
                teacher_remarks: e.teacher_remarks || null,
            })),
            publish_now: publishNow,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    // Quick fill helper
    const handleSetAllAbsent = (isAbsent: boolean) => {
        setEntries((prev) =>
            prev.map((item) => ({
                ...item,
                is_absent: isAbsent,
                marks_obtained: isAbsent ? '' : item.marks_obtained,
            }))
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Mark Entry: ${test.title}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/model-tests/${test.id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Edit3 className="w-6 h-6 text-indigo-600" />
                                <span>Bulk Mark Entry: {test.title}</span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Batch: <strong className="text-gray-700">{test.batch?.name}</strong> | Total Marks:{' '}
                                <strong className="text-indigo-600 font-bold">{Number(test.total_marks)}</strong> | Pass Marks:{' '}
                                <strong className="text-emerald-600 font-bold">{Number(test.pass_marks)}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={`/model-tests/${test.id}`}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-md"
                        >
                            <Save className="w-4 h-4" />
                            <span>{submitting ? 'Calculating Ranks...' : 'Save Marks & Generate Merit List'}</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Action Bar */}
                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-indigo-900 font-medium">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>
                            Enter marks for each candidate below. The system automatically computes highest marks, batch average, pass/fail status, and assigns 1st, 2nd, 3rd merit ranks!
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-900 font-semibold shadow-sm">
                            <input
                                type="checkbox"
                                checked={publishNow}
                                onChange={(e) => setPublishNow(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Publish Results Immediately</span>
                        </label>
                    </div>
                </div>

                {/* Mark Entry Sheet */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <th style={{ width: '45px' }} className="py-3 px-3 text-center">#</th>
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">ID / Roll</th>
                                    <th style={{ width: '100px' }} className="py-3 px-4 text-center">Absent?</th>
                                    <th style={{ width: '160px' }} className="py-3 px-4">
                                        Marks Obtained (Max: {Number(test.total_marks)})
                                    </th>
                                    <th style={{ width: '120px' }} className="py-3 px-4 text-center">Percentage</th>
                                    <th style={{ width: '100px' }} className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4">Teacher Feedback / Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {results.map((r, index) => {
                                    const entry = entries[index];
                                    const marksNum = entry.marks_obtained !== '' ? Number(entry.marks_obtained) : null;
                                    const percentage = marksNum !== null && test.total_marks > 0
                                        ? Math.round((marksNum / Number(test.total_marks)) * 100)
                                        : null;
                                    const isPass = marksNum !== null ? marksNum >= Number(test.pass_marks) : false;

                                    return (
                                        <tr
                                            key={r.id}
                                            className={`transition ${entry.is_absent ? 'bg-gray-50/80 opacity-60' : 'hover:bg-indigo-50/20'}`}
                                        >
                                            <td className="py-3 px-3 text-center font-mono text-xs text-gray-400">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-gray-900">
                                                {r.student?.first_name} {r.student?.last_name}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-xs text-gray-600">
                                                {r.student?.student_id || r.student?.roll_number || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={entry.is_absent}
                                                    onChange={() => handleAbsentToggle(index)}
                                                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                                                    title="Check if student was absent"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={Number(test.total_marks)}
                                                        step="0.5"
                                                        disabled={entry.is_absent}
                                                        placeholder={entry.is_absent ? 'ABS' : '0.0'}
                                                        value={entry.marks_obtained}
                                                        onChange={(e) => handleMarksChange(index, e.target.value)}
                                                        className={`w-full px-3 py-1.5 border rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 ${
                                                            entry.is_absent
                                                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                                                                : marksNum !== null && isPass
                                                                ? 'border-emerald-300 bg-emerald-50/30'
                                                                : marksNum !== null && !isPass
                                                                ? 'border-red-300 bg-red-50/30'
                                                                : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {percentage !== null ? (
                                                    <span className={`text-xs font-bold ${percentage >= 70 ? 'text-emerald-700' : percentage >= 40 ? 'text-amber-700' : 'text-red-600'}`}>
                                                        {percentage}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {entry.is_absent ? (
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Absent</span>
                                                ) : marksNum !== null ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                        {isPass ? 'PASS' : 'FAIL'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Pending</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="text"
                                                    placeholder="Optional feedback..."
                                                    value={entry.teacher_remarks}
                                                    onChange={(e) => handleRemarksChange(index, e.target.value)}
                                                    className="w-full px-2.5 py-1 border border-gray-200 rounded text-xs text-gray-700 focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link href={`/model-tests/${test.id}`}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        <span>{submitting ? 'Calculating Ranks...' : 'Save Marks & Generate Merit List'}</span>
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
