import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, Trash2, BookOpen, Users, Grid, BookMarked, DollarSign, Calendar } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string;
    students_count: number;
}

interface FeeStructure {
    id: number;
    fee_type: { id: number; name: string; frequency: string };
    academic_year: { id: number; year: string };
    amount: number;
    due_date: string;
    status: string;
}

interface SchoolClass {
    id: number;
    name: string;
    name_bengali?: string;
    numeric_value: number;
    order: number;
    description?: string;
    status: string;
    sections: Section[];
    subjects: Subject[];
    fee_structures: FeeStructure[];
    students_count: number;
}

interface ShowProps {
    schoolClass: SchoolClass;
}

export default function Show({ schoolClass }: ShowProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${schoolClass.name}"?`)) {
            router.delete(`/classes/${schoolClass.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Class: ${schoolClass.name}`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/classes')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                {schoolClass.name}
                            </h1>
                            <p className="text-gray-600 mt-1">Class details and information</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/classes/${schoolClass.id}/edit`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Edit className="w-5 h-5" />}>
                                Edit Class
                            </Button>
                        </Link>
                        <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="w-5 h-5" />}>
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Grade</p>
                                <p className="text-2xl font-bold text-gray-900">{schoolClass.numeric_value}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Grid className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Sections</p>
                                <p className="text-2xl font-bold text-gray-900">{schoolClass.sections.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Students</p>
                                <p className="text-2xl font-bold text-gray-900">{schoolClass.students_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <BookMarked className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">{schoolClass.subjects.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Class Name</label>
                            <p className="text-gray-900 mt-1">{schoolClass.name}</p>
                        </div>
                        {schoolClass.name_bengali && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Class Name (Bengali)</label>
                                <p className="text-gray-900 mt-1">{schoolClass.name_bengali}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600">Grade Number</label>
                            <p className="text-gray-900 mt-1">{schoolClass.numeric_value}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Display Order</label>
                            <p className="text-gray-900 mt-1">{schoolClass.order}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1">
                                <Badge variant={schoolClass.status === 'active' ? 'success' : 'default'} className="capitalize">
                                    {schoolClass.status}
                                </Badge>
                            </div>
                        </div>
                        {schoolClass.description && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <p className="text-gray-900 mt-1">{schoolClass.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sections */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
                    {schoolClass.sections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schoolClass.sections.map((section) => (
                                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Section {section.name}</h4>
                                        <Badge variant="info" size="sm">{section.students_count} students</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">Room: {section.room_number}</p>
                                    <p className="text-sm text-gray-600">Capacity: {section.capacity}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center py-4">No sections added yet</p>
                    )}
                </div>

                {/* Subjects */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Subjects</h3>
                    {schoolClass.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {schoolClass.subjects.map((subject) => (
                                <Badge key={subject.id} variant="purple" className="text-sm px-4 py-2">
                                    {subject.name} ({subject.code})
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center py-4">No subjects assigned yet</p>
                    )}
                </div>

                {/* Fee Structures */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Fee Structures
                    </h3>
                    {schoolClass.fee_structures && schoolClass.fee_structures.length > 0 ? (
                        <div className="space-y-3">
                            {schoolClass.fee_structures.map((fee) => (
                                <div key={fee.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-gray-900">{fee.fee_type.name}</h4>
                                                <Badge variant="info" size="sm" className="capitalize">{fee.fee_type.frequency}</Badge>
                                                {fee.status === 'active' ? (
                                                    <Badge variant="success" size="sm">Active</Badge>
                                                ) : (
                                                    <Badge variant="default" size="sm">Inactive</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Academic Year: {fee.academic_year.year}
                                                </span>
                                                <span>Due Date: {new Date(fee.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                                ৳{formatAmount(parseFloat(fee.amount.toString()))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No fee structures configured for this class</p>
                            <Link href={`/classes/${schoolClass.id}/edit`}>
                                <Button variant="outline" size="sm" className="mt-3">
                                    Add Fee Structures
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
