import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Calendar,
    Clock,
    Award,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
    academic_year: string;
    has_result: boolean;
    result_id: number | null;
}

interface Schedule {
    id: number;
    exam_name: string;
    subject_name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    duration: number;
    room_number: string | null;
}

interface Props {
    student: Student;
    exams: Exam[];
    upcomingSchedules: Schedule[];
}

export default function Index({ student, exams, upcomingSchedules }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Exams & Schedules
                </h2>
            }
        >
            <Head title="Exams" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Class {student.class_name} - {student.section_name} | Roll: {student.roll_number}
                                    </p>
                                </div>
                                <Link href="/student/results">
                                    <Button>
                                        <Award className="mr-2 h-4 w-4" />
                                        View Results
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Exam Schedules */}
                    {upcomingSchedules.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                                    Upcoming Exam Schedule
                                </CardTitle>
                                <CardDescription>Your upcoming exam timetable</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcomingSchedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            {new Date(schedule.exam_date).toLocaleDateString('en-US', { month: 'short' })}
                                                        </span>
                                                        <span className="text-2xl font-bold text-blue-600">
                                                            {new Date(schedule.exam_date).getDate()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{schedule.subject_name}</h4>
                                                    <p className="text-sm text-gray-600">{schedule.exam_name}</p>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <Clock className="mr-1 h-4 w-4" />
                                                            {schedule.start_time} - {schedule.end_time}
                                                        </span>
                                                        <span>Duration: {schedule.duration} min</span>
                                                        {schedule.room_number && (
                                                            <span>Room: {schedule.room_number}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* All Exams */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                All Exams
                            </CardTitle>
                            <CardDescription>Complete list of your exams</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {exams.length > 0 ? (
                                <div className="space-y-4">
                                    {exams.map((exam) => (
                                        <div
                                            key={exam.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="font-semibold text-gray-900">{exam.name}</h4>
                                                    {exam.has_result && (
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Result Published
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <Calendar className="mr-1 h-4 w-4" />
                                                        {exam.exam_date}
                                                    </span>
                                                    <span>Total Marks: {exam.total_marks}</span>
                                                    <span>Passing: {exam.passing_marks}</span>
                                                    <Badge variant="outline">{exam.academic_year}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link href={`/student/exams/${exam.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                                {exam.has_result && exam.result_id && (
                                                    <Link href={`/student/results/${exam.result_id}`}>
                                                        <Button size="sm">
                                                            <Award className="mr-2 h-4 w-4" />
                                                            View Result
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No exams found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
