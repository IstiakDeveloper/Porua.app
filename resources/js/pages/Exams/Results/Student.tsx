import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import { Award, BookOpen, TrendingUp, User } from 'lucide-react';
import { Result } from '@/types/exam';

interface StudentProps {
    result: Result;
}

export default function Student({ result }: StudentProps) {
    return (
        <AuthenticatedLayout>
            <Head title="My Result" />

            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Exam Result
                    </h1>
                    <p className="text-gray-600 mt-2">{result.exam?.name}</p>
                </div>

                <Card>
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{result.student?.full_name || result.student?.user?.name}</h2>
                        <p className="text-gray-600">{result.schoolClass?.name} - Roll: {result.student?.roll_number}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-indigo-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-indigo-600">Total Marks</p>
                            <p className="text-3xl font-bold text-indigo-900 mt-1">{result.total_marks}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-green-600">Obtained</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{result.obtained_marks}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-purple-600">Percentage</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{result.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-blue-600">Grade</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{result.grade}</p>
                        </div>
                    </div>

                    <div className="text-center py-6 border-t border-b border-gray-200">
                        <Badge variant={result.status === 'pass' ? 'success' : 'default'} className="text-2xl px-8 py-3">
                            {result.status.toUpperCase()}
                        </Badge>
                        <p className="text-gray-600 mt-2">{result.remarks}</p>
                    </div>
                </Card>

                {result.student?.marks && result.student.marks.length > 0 && (
                    <Card title="Subject-wise Performance">
                        <div className="space-y-3">
                            {result.student.marks.map((mark) => (
                                <div key={mark.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                        <span className="font-medium text-gray-900">{mark.subject?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-sm">
                                            <span className="text-gray-600">Theory: </span>
                                            <span className="font-semibold">{mark.theory_marks ?? '-'}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Practical: </span>
                                            <span className="font-semibold">{mark.practical_marks ?? '-'}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Total: </span>
                                            <span className="font-semibold text-indigo-600">{mark.total_marks}</span>
                                        </div>
                                        <Badge>{mark.grade}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
