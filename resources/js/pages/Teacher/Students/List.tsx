import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Eye, Phone, Mail } from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    phone: string | null;
    email: string | null;
    guardian_name: string;
    guardian_phone: string;
}

interface Section {
    id: number;
    name: string;
    class_name: string;
}

interface Props {
    section: Section;
    students: Student[];
    filters: {
        search: string;
    };
}

export default function List({ section, students, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            `/teacher/students/list?section_id=${section.id}`,
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Students - Class {section.class_name} {section.name}
                </h2>
            }
        >
            <Head title={`Students - Class ${section.class_name} ${section.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Student List ({students.length})</h3>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {students.length > 0 ? (
                                <div className="space-y-3">
                                    {students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="p-5 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-gradient-to-r from-white to-blue-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        {student.photo ? (
                                                            <img
                                                                src={`/storage/${student.photo}`}
                                                                alt={student.full_name}
                                                                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                                                {student.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-gray-900">{student.full_name}</h3>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                            <span className="font-medium">Roll: {student.roll_number}</span>
                                                            <span>Admission: {student.admission_number}</span>
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{student.gender}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                            {student.phone && (
                                                                <span className="flex items-center">
                                                                    <Phone className="mr-1 h-3 w-3 text-blue-600" />
                                                                    {student.phone}
                                                                </span>
                                                            )}
                                                            {student.email && (
                                                                <span className="flex items-center">
                                                                    <Mail className="mr-1 h-3 w-3 text-blue-600" />
                                                                    {student.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Guardian: {student.guardian_name} ({student.guardian_phone})
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/teacher/students/${student.id}`}
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No students found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
