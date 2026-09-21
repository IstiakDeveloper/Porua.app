import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FileText, Calendar, Edit, Eye, Shield } from 'lucide-react';

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    subject_id: number | null;
    subject_name: string;
    class_name: string;
    section_name: string;
    is_published: boolean;
    total_marks: number;
}

interface InvigilationDuty {
    id: number;
    exam_name: string;
    subject: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    hall_name: string;
}

interface Props {
    exams: Exam[];
    invigilationDuties: InvigilationDuty[];
}

export default function Index({ exams, invigilationDuties }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Exams & Marks Management
                </h2>
            }
        >
            <Head title="Exams & Marks" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* My Exams */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                                    My Exams
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Exams for your assigned subjects</p>
                            </div>
                            <div className="p-6">
                                {exams.length > 0 ? (
                                    <div className="space-y-3">
                                        {exams.map((exam) => (
                                            <div key={exam.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{exam.name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {exam.subject_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Class {exam.class_name} - {exam.section_name}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        exam.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {exam.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                                    <Calendar className="mr-1 h-4 w-4 text-blue-600" />
                                                    {exam.exam_date}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/teacher/exams/marks/entry?exam_id=${exam.id}&subject_id=${exam.subject_id}`}
                                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Enter Marks
                                                    </Link>
                                                    <Link
                                                        href={`/teacher/exams/marks/view?exam_id=${exam.id}&subject_id=${exam.subject_id}`}
                                                        className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">No exams assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invigilation Duties */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Shield className="mr-2 h-5 w-5 text-purple-600" />
                                    Invigilation Duties
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Your exam invigilation schedule</p>
                            </div>
                            <div className="p-6">
                                {invigilationDuties.length > 0 ? (
                                    <div className="space-y-3">
                                        {invigilationDuties.map((duty) => (
                                            <div key={duty.id} className="p-4 border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-300 transition-colors">
                                                <h4 className="font-semibold mb-1 text-gray-900">{duty.exam_name}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{duty.subject}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Date</p>
                                                        <p className="font-medium text-gray-900">{duty.exam_date}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Time</p>
                                                        <p className="font-medium text-gray-900">{duty.start_time} - {duty.end_time}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500">Hall</p>
                                                        <p className="font-medium text-gray-900">{duty.hall_name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">No invigilation duties</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
