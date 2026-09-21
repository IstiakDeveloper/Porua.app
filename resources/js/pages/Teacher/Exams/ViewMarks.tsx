import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Award } from 'lucide-react';

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

export default function ViewMarks({ exam, subject, marks, statistics }: Props) {
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A+': return 'bg-green-100 text-green-800';
            case 'A': return 'bg-green-100 text-green-700';
            case 'A-': return 'bg-blue-100 text-blue-800';
            case 'B': return 'bg-blue-100 text-blue-700';
            case 'C': return 'bg-yellow-100 text-yellow-800';
            case 'D': return 'bg-orange-100 text-orange-800';
            case 'F': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="View Marks" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div>
                        <button
                            onClick={() => router.visit('/teacher/exams')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Exams
                        </button>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">View Marks</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-semibold">Exam:</span> {exam.name}
                                </div>
                                <div>
                                    <span className="font-semibold">Subject:</span> {subject.name}
                                </div>
                                <div>
                                    <span className="font-semibold">Class:</span> {exam.class_name} - {exam.section_name}
                                </div>
                                <div>
                                    <span className="font-semibold">Total Marks:</span> {exam.total_marks}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                                    <p className="text-3xl font-bold text-gray-900">{statistics.total_students}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Highest Marks</p>
                                    <p className="text-3xl font-bold text-green-600">{(Number(statistics.highest) || 0).toFixed(2)}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Average Marks</p>
                                    <p className="text-3xl font-bold text-blue-600">{(Number(statistics.average) || 0).toFixed(2)}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {statistics.total_students > 0 ? ((statistics.passed / statistics.total_students) * 100).toFixed(0) : 0}%
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marks Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll No.</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student Name</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Theory</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Practical</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Total</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Grade</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {marks.length > 0 ? (
                                        marks.map((mark, index) => (
                                            <tr key={index} className={`hover:bg-gray-50 transition-colors ${mark.is_absent ? 'bg-red-50' : ''}`}>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{mark.roll_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{mark.student_name}</td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                    {mark.is_absent ? '-' : (Number(mark.theory_marks) || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                    {mark.is_absent ? '-' : (Number(mark.practical_marks) || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        mark.is_absent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {mark.is_absent ? 'AB' : (Number(mark.obtained_marks) || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {!mark.is_absent && (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(mark.grade)}`}>
                                                            {mark.grade}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        mark.is_absent
                                                            ? 'bg-red-100 text-red-800'
                                                            : mark.grade === 'F'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {mark.is_absent ? 'Absent' : mark.grade === 'F' ? 'Failed' : 'Passed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Award className="w-12 h-12 text-gray-400 mb-3" />
                                                    <p className="text-gray-600">No marks entered yet</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
