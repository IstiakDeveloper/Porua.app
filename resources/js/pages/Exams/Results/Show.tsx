import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import { ArrowLeft, Award, BookOpen, TrendingUp } from 'lucide-react';
import { Result } from '@/types/exam';

interface ShowProps {
    result: Result;
}

export default function Show({ result }: ShowProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Result Details" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Result Details
                        </h1>
                        <p className="text-gray-600 mt-1">{result.student?.full_name || result.student?.user?.name}</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/results')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card title="Overall Performance" className="lg:col-span-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-indigo-50 rounded-lg p-4">
                                <p className="text-sm text-indigo-600">Total Marks</p>
                                <p className="text-2xl font-bold text-indigo-900 mt-1">{result.total_marks}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-green-600">Obtained</p>
                                <p className="text-2xl font-bold text-green-900 mt-1">{result.obtained_marks}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-sm text-purple-600">Percentage</p>
                                <p className="text-2xl font-bold text-purple-900 mt-1">{result.percentage.toFixed(1)}%</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-600">GPA</p>
                                <p className="text-2xl font-bold text-blue-900 mt-1">{result.gpa}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Grade">
                        <div className="text-center py-4">
                            <Badge variant="success" className="text-4xl px-6 py-3">{result.grade}</Badge>
                            <p className="text-gray-600 mt-4">{result.remarks}</p>
                        </div>
                    </Card>
                </div>

                {result.student?.marks && result.student.marks.length > 0 && (
                    <Card title="Subject-wise Marks">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Theory</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Practical</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {result.student.marks.map((mark) => (
                                        <tr key={mark.id}>
                                            <td className="px-4 py-3">{mark.subject?.name}</td>
                                            <td className="px-4 py-3">{mark.theory_marks ?? '-'}</td>
                                            <td className="px-4 py-3">{mark.practical_marks ?? '-'}</td>
                                            <td className="px-4 py-3 font-semibold">{mark.total_marks}</td>
                                            <td className="px-4 py-3"><Badge>{mark.grade}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
