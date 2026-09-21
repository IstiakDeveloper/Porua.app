import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Calendar,
    Clock,
    MapPin,
    ArrowLeft,
    Award,
    User,
    BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
    academic_year: string;
}

interface Schedule {
    id: number;
    subject_name: string;
    exam_date: string;
    day: string;
    start_time: string;
    end_time: string;
    duration: number;
    room_number: string | null;
}

interface SeatPlan {
    hall_name: string;
    seat_number: string;
    row_number: number;
}

interface Props {
    student: Student;
    exam: Exam;
    schedules: Schedule[];
    seatPlan: SeatPlan | null;
}

export default function Show({ student, exam, schedules, seatPlan }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href="/student/exams">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Exam Details
                    </h2>
                </div>
            }
        >
            <Head title={`${exam.name} - Details`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Roll Number: {student.roll_number}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exam Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                {exam.name}
                            </CardTitle>
                            <CardDescription>Examination details and schedule</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Exam Date</p>
                                        <p className="font-semibold">{exam.exam_date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Award className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Academic Year</p>
                                        <p className="font-semibold">{exam.academic_year}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Seat Plan Information */}
                    {seatPlan && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center text-blue-900">
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Your Seat Assignment
                                </CardTitle>
                                <CardDescription>Examination hall and seat details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">Exam Hall</p>
                                        <p className="text-lg font-bold text-blue-900">{seatPlan.hall_name}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">Seat Number</p>
                                        <p className="text-lg font-bold text-blue-900">{seatPlan.seat_number}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">Row Number</p>
                                        <p className="text-lg font-bold text-blue-900">{seatPlan.row_number}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Exam Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BookOpen className="mr-2 h-5 w-5" />
                                Exam Schedule
                            </CardTitle>
                            <CardDescription>Subject-wise examination timetable</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {schedules.length > 0 ? (
                                <div className="space-y-4">
                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-100 rounded-lg">
                                                        <span className="text-xs text-indigo-600 font-medium">
                                                            {new Date(schedule.exam_date).toLocaleDateString('en-US', { month: 'short' })}
                                                        </span>
                                                        <span className="text-2xl font-bold text-indigo-600">
                                                            {new Date(schedule.exam_date).getDate()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{schedule.subject_name}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                        <span className="flex items-center">
                                                            <Calendar className="mr-1 h-4 w-4" />
                                                            {schedule.day}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="mr-1 h-4 w-4" />
                                                            {schedule.start_time} - {schedule.end_time}
                                                        </span>
                                                        <Badge variant="outline">
                                                            {schedule.duration} minutes
                                                        </Badge>
                                                        {schedule.room_number && (
                                                            <span className="flex items-center">
                                                                <MapPin className="mr-1 h-4 w-4" />
                                                                Room {schedule.room_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No exam schedule available yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="text-yellow-900">Important Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-yellow-900">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Arrive at the examination hall at least 15 minutes before the scheduled time</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Bring your student ID card and admission slip</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Only blue or black pen is allowed for writing</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Mobile phones and electronic devices are strictly prohibited</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Follow all examination rules and guidelines carefully</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
