import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import {
    ArrowLeft, Edit, Calendar, Clock, FileText,
    BookOpen, Users, MapPin, CheckCircle
} from 'lucide-react';
import { Exam } from '@/types/exam';

interface ShowProps {
    exam: Exam;
}

export default function Show({ exam }: ShowProps) {
    const getExamTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            first_term: 'First Term',
            mid_term: 'Mid Term',
            final: 'Final',
            test: 'Test',
            practical: 'Practical',
        };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout>
            <Head title={exam.name} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {exam.name}
                        </h1>
                        <p className="text-gray-600 mt-1">{exam.academicYear?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/exams/${exam.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Exam
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/exams')}
                            icon={<ArrowLeft className="w-5 h-5" />}
                        >
                            Back
                        </Button>
                    </div>
                </div>

                {/* Exam Details */}
                <Card title="Exam Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Exam Type</label>
                            <div className="mt-1">
                                <Badge variant="default" className="capitalize">
                                    {getExamTypeLabel(exam.exam_type)}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1">
                                <Badge
                                    variant={
                                        exam.status === 'upcoming' ? 'info' :
                                        exam.status === 'ongoing' ? 'warning' :
                                        exam.status === 'completed' ? 'success' :
                                        'default'
                                    }
                                    className="capitalize"
                                >
                                    {exam.status}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Start Date
                            </label>
                            <p className="mt-1 text-gray-900 font-semibold">
                                {new Date(exam.start_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                End Date
                            </label>
                            <p className="mt-1 text-gray-900 font-semibold">
                                {new Date(exam.end_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {exam.result_publish_date && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Result Publish Date
                                </label>
                                <p className="mt-1 text-gray-900 font-semibold">
                                    {new Date(exam.result_publish_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}

                        {exam.description && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <p className="mt-1 text-gray-900">{exam.description}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Applicable Classes */}
                {exam.classes && exam.classes.length > 0 && (
                    <Card title="Applicable Classes">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {exam.classes.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                                >
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-medium text-indigo-900">{cls.name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Exam Schedules */}
                {exam.schedules && exam.schedules.length > 0 && (
                    <Card title="Exam Schedules" subtitle={`${exam.schedules.length} scheduled exams`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                            Class
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                            Subject
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                            Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                            Marks
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                            Room
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {exam.schedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {schedule.schoolClass?.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {schedule.subject?.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(schedule.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {schedule.start_time} - {schedule.end_time}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {schedule.full_marks} ({schedule.pass_marks} pass)
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {schedule.room_number || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card title="Quick Actions">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href={`/exam-schedules?exam_id=${exam.id}`}>
                            <Button variant="ghost" className="w-full justify-start" icon={<Clock className="w-5 h-5" />}>
                                Manage Schedules
                            </Button>
                        </Link>
                        <Link href={`/marks?exam_id=${exam.id}`}>
                            <Button variant="ghost" className="w-full justify-start" icon={<CheckCircle className="w-5 h-5" />}>
                                Enter Marks
                            </Button>
                        </Link>
                        <Link href={`/results?exam_id=${exam.id}`}>
                            <Button variant="ghost" className="w-full justify-start" icon={<FileText className="w-5 h-5" />}>
                                View Results
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
