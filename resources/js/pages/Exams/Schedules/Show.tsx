import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, Calendar, Clock, BookOpen, GraduationCap, MapPin, FileText } from 'lucide-react';
import { ExamSchedule } from '@/types/exam';

interface ShowProps {
    schedule: ExamSchedule;
}

export default function Show({ schedule }: ShowProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Exam Schedule Details" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Exam Schedule Details
                        </h1>
                        <p className="text-gray-600 mt-1">{schedule.exam?.name} - {schedule.subject?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/exam-schedules/${schedule.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Schedule
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/exam-schedules')}
                            icon={<ArrowLeft className="w-5 h-5" />}
                        >
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Main Details */}
                    <div>
                        <Card title="Schedule Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Exam
                                    </label>
                                    <p className="mt-1 text-gray-900 font-semibold">{schedule.exam?.name}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        Class
                                    </label>
                                    <p className="mt-1 text-gray-900 font-semibold">{schedule.schoolClass?.name || schedule.school_class?.name}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Subject</label>
                                    <div className="mt-1">
                                        <Badge variant="default">{schedule.subject?.name}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date
                                    </label>
                                    <p className="mt-1 text-gray-900 font-semibold">
                                        {new Date(schedule.exam_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Start Time
                                    </label>
                                    <p className="mt-1 text-gray-900 font-semibold">
                                        {schedule.start_time || '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        End Time
                                    </label>
                                    <p className="mt-1 text-gray-900 font-semibold">
                                        {schedule.end_time || '-'}
                                    </p>
                                </div>

                                {schedule.room_number && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Room Number
                                        </label>
                                        <p className="mt-1 text-gray-900 font-semibold">{schedule.room_number}</p>
                                    </div>
                                )}
                            </div>

                            {schedule.instructions && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Instructions
                                    </label>
                                    <p className="mt-2 text-gray-900">{schedule.instructions}</p>
                                </div>
                            )}
                        </Card>

                        {/* Invigilators */}
                        {schedule.invigilators && schedule.invigilators.length > 0 && (
                            <Card title="Invigilators" className="mt-6">
                                <div className="space-y-3">
                                    {schedule.invigilators.map((invigilator) => (
                                        <div key={invigilator.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <span className="text-indigo-600 font-semibold">
                                                    {invigilator.teacher?.user?.name?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{invigilator.teacher?.user?.name}</p>
                                                <p className="text-sm text-gray-600">{invigilator.duty_time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
