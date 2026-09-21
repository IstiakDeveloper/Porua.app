import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { BookOpen, Edit, Trash2, Award, FileText, Target, BookMarked } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Subject {
    id: number;
    name: string;
    name_bengali: string;
    code: string;
    type: string;
    total_marks: number;
    pass_marks: number;
    description: string;
    status: string;
    classes?: SchoolClass[];
    classes_count?: number;
    teachers?: Teacher[];
}

interface ShowProps {
    subject: Subject;
}

export default function Show({ subject }: ShowProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete Subject "${subject.name}"?`)) {
            router.delete(`/subjects/${subject.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${subject.name} Details`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                {subject.name}
                            </h1>
                            <p className="text-gray-600 mt-1">{subject.name_bengali} • {subject.code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/subjects/${subject.id}/edit`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Edit className="w-5 h-5" />}>
                                Edit Subject
                            </Button>
                        </Link>
                        <Button
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                            icon={<Trash2 className="w-5 h-5" />}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Marks</p>
                                <p className="text-2xl font-bold text-gray-900">{subject.total_marks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pass Marks</p>
                                <p className="text-2xl font-bold text-gray-900">{subject.pass_marks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <BookMarked className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Classes</p>
                                <p className="text-2xl font-bold text-gray-900">{subject.classes_count ?? subject.classes?.length ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Subject Type</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">{subject.type}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Subject Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Subject Name (English)</p>
                            <p className="text-base font-semibold text-gray-900">{subject.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Subject Name (Bengali)</p>
                            <p className="text-base font-semibold text-gray-900">{subject.name_bengali}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Subject Code</p>
                            <p className="text-base font-semibold text-gray-900 font-mono">{subject.code}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Subject Type</p>
                            <Badge variant={subject.type === 'theory' ? 'default' : subject.type === 'practical' ? 'warning' : 'info'} className="capitalize">
                                {subject.type}
                            </Badge>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Marks</p>
                            <p className="text-base font-semibold text-gray-900">{subject.total_marks}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pass Marks</p>
                            <p className="text-base font-semibold text-gray-900">{subject.pass_marks}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <Badge variant={subject.status === 'active' ? 'success' : 'default'} className="capitalize">
                                {subject.status}
                            </Badge>
                        </div>

                        {subject.description && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600 mb-1">Description</p>
                                <p className="text-base text-gray-900">{subject.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Assigned Classes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Assigned Classes ({subject.classes_count ?? subject.classes?.length ?? 0})</h3>

                    {subject.classes && subject.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {subject.classes.map(cls => (
                                <Badge key={cls.id} variant="info" className="px-4 py-2 text-sm">
                                    {cls.name} ({cls.name_bengali})
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BookMarked className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Not assigned to any classes yet</p>
                        </div>
                    )}
                </div>

                {/* Teachers */}
                {subject.teachers && subject.teachers.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Teachers ({subject.teachers.length})</h3>
                        </div>

                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subject.teachers.map((teacher, index) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 30}ms` }}>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{teacher.name}</td>
                                        <td className="px-6 py-4 text-gray-900">{teacher.email}</td>
                                        <td className="px-6 py-4 text-gray-900">{teacher.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
