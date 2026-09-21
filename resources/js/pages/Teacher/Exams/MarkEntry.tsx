import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Save, ArrowLeft, UserCheck, UserX } from 'lucide-react';

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

export default function MarkEntry({ exam, subject, students }: Props) {
    const [marks, setMarks] = useState<{ [key: number]: { theory_marks: string; practical_marks: string; is_absent: boolean } }>(
        students.reduce((acc, student) => {
            acc[student.id] = {
                theory_marks: student.theory_marks?.toString() || '',
                practical_marks: student.practical_marks?.toString() || '',
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
            <Head title="Enter Marks" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit('/teacher/exams')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Exams
                        </button>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Marks</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                <div>
                                    <span className="font-semibold">Exam:</span> {exam.name}
                                </div>
                                <div>
                                    <span className="font-semibold">Subject:</span> {subject.name}
                                </div>
                                <div>
                                    <span className="font-semibold">Class:</span> {exam.class_name} - {exam.section_name}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="totalMarks" className="text-sm font-semibold text-gray-900">
                                    Subject Total Marks:
                                </label>
                                <input
                                    id="totalMarks"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    step="1"
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(e.target.value)}
                                    className="w-32 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    required
                                />
                                <span className="text-xs text-gray-500">(Enter total marks for this subject)</span>
                            </div>
                        </div>
                    </div>

                    {/* Marks Entry Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll No.</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student Name</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Theory Marks</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Practical Marks</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Total</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Absent</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((student) => {
                                            const studentMarks = marks[student.id];
                                            const theory = parseFloat(studentMarks.theory_marks) || 0;
                                            const practical = parseFloat(studentMarks.practical_marks) || 0;
                                            const total = studentMarks.is_absent ? 0 : theory + practical;

                                            return (
                                                <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${studentMarks.is_absent ? 'bg-red-50' : ''}`}>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.roll_number}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{student.full_name}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={totalMarks}
                                                            step="0.01"
                                                            value={studentMarks.theory_marks}
                                                            onChange={(e) => handleMarkChange(student.id, 'theory_marks', e.target.value)}
                                                            disabled={studentMarks.is_absent}
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={totalMarks}
                                                            step="0.01"
                                                            value={studentMarks.practical_marks}
                                                            onChange={(e) => handleMarkChange(student.id, 'practical_marks', e.target.value)}
                                                            disabled={studentMarks.is_absent}
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            studentMarks.is_absent
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {studentMarks.is_absent ? 'AB' : total.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAbsentToggle(student.id)}
                                                            className={`p-2 rounded-lg transition-all duration-200 ${
                                                                studentMarks.is_absent
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {studentMarks.is_absent ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/teacher/exams')}
                                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Marks'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
