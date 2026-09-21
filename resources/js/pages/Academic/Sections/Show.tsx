import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Grid, Edit, Trash2, BookOpen, Users, Home, Info } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    roll_number: string;
    email: string;
    phone: string;
}

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string;
    description: string;
    status: string;
    students_count: number;
    class?: SchoolClass;
    students: Student[];
}

interface ShowProps {
    section: Section;
}

export default function Show({ section }: ShowProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete Section "${section.name}"?`)) {
            router.delete(`/sections/${section.id}`);
        }
    };

    const occupancyPercentage = Math.round((section.students_count / section.capacity) * 100);
    const availableSeats = section.capacity - section.students_count;

    return (
        <AuthenticatedLayout>
            <Head title={`Section ${section.name} Details`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                            <Grid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Section {section.name}
                            </h1>
                            <p className="text-gray-600 mt-1">{section.class?.name || 'N/A'} - Room {section.room_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/sections/${section.id}/edit`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Edit className="w-5 h-5" />}>
                                Edit Section
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
                                <Home className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Room Number</p>
                                <p className="text-2xl font-bold text-gray-900">{section.room_number}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{section.students_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Capacity</p>
                                <p className="text-2xl font-bold text-gray-900">{section.capacity}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Info className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-gray-900">{availableSeats}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Section Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Section Name</p>
                            <p className="text-base font-semibold text-gray-900">Section {section.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Class</p>
                            <p className="text-base font-semibold text-gray-900">
                                {section.class ? `${section.class.name} (${section.class.name_bengali})` : 'N/A'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Room Number</p>
                            <p className="text-base font-semibold text-gray-900">Room {section.room_number}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Capacity</p>
                            <p className="text-base font-semibold text-gray-900">{section.capacity} Students</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Students</p>
                            <p className="text-base font-semibold text-gray-900">{section.students_count} Students</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${occupancyPercentage >= 90 ? 'bg-red-600' : occupancyPercentage >= 75 ? 'bg-orange-600' : 'bg-green-600'}`}
                                        style={{ width: `${occupancyPercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{occupancyPercentage}%</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <Badge variant={section.status === 'active' ? 'success' : 'default'} className="capitalize">
                                {section.status}
                            </Badge>
                        </div>

                        {section.description && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600 mb-1">Description</p>
                                <p className="text-base text-gray-900">{section.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Students ({section.students_count})</h3>
                    </div>

                    {section.students && section.students.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {section.students.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 30}ms` }}>
                                        <td className="px-6 py-4 text-gray-900">{student.roll_number || 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{student.full_name || `${student.first_name} ${student.last_name}`}</td>
                                        <td className="px-6 py-4 text-gray-900">{student.email || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-900">{student.phone || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Students Yet</h4>
                            <p className="text-gray-600 mt-1">Students will appear here once enrolled.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
