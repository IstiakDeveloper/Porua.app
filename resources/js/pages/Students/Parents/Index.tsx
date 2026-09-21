import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { ArrowLeft, Plus, Edit, Trash2, Users, User, Mail, Phone } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface Student {
    id: number;
    admission_number: string;
    first_name: string;
    last_name: string;
    user?: {
        name: string;
    };
}

interface Parent {
    id: number;
    user_id: number;
    father_name: string | null;
    mother_name: string | null;
    guardian_name: string | null;
    created_at: string;
    user: User | null;
    students: Student[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    parents: {
        data: Parent[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: PaginationLink[];
    };
    students: Student[];
    filters?: {
        search?: string;
    };
}

export default function Index({ parents, students, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');



    const handleDelete = (parent: Parent) => {
        if (confirm(`Are you sure you want to remove ${parent.user?.name || 'this parent'}?`)) {
            router.delete(`/student-parents/${parent.id}`);
        }
    };

    const handleSearch = () => {
        router.get('/student-parents', { search: searchTerm }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearchTerm('');
        router.get('/student-parents');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Parent Management" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/students')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Parent Management
                            </h1>
                            <p className="text-gray-600 mt-1">Manage student parents and guardians</p>
                        </div>
                    </div>
                    <Link href="/student-parents/create">
                        <Button icon={<Plus className="w-5 h-5" />}>
                            Add Parent
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Parents</p>
                                <p className="text-2xl font-bold text-gray-900">{parents.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {parents.data.reduce((sum, p) => sum + p.students.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Accounts</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {parents.data.filter(p => p.user !== null).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch}>Search</Button>
                        {searchTerm && (
                            <Button variant="ghost" onClick={handleReset}>Reset</Button>
                        )}
                    </div>
                </div>

                {/* Parent List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {parents.data.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                    {parent.user?.name?.charAt(0).toUpperCase() || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{parent.user?.name || 'N/A'}</p>
                                                    <div className="text-xs text-gray-500 space-y-0.5">
                                                        {parent.father_name && <div>F: {parent.father_name}</div>}
                                                        {parent.mother_name && <div>M: {parent.mother_name}</div>}
                                                        {parent.guardian_name && <div>G: {parent.guardian_name}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {parent.user?.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        {parent.user.email}
                                                    </div>
                                                )}
                                                {parent.user?.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        {parent.user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {parent.students && parent.students.length > 0 ? (
                                                <div className="space-y-2">
                                                    {parent.students.map((student) => (
                                                        <div key={student.id} className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-semibold">
                                                                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {student.first_name} {student.last_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{student.admission_number}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic">No students linked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(parent.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/student-parents/${parent.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        icon={<Edit className="w-4 h-4" />}
                                                    />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(parent)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {parents.data.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Parents Found</h3>
                            <p className="text-gray-600 mb-4">Start by adding parent/guardian information.</p>
                            <Link href="/student-parents/create">
                                <Button icon={<Plus className="w-5 h-5" />}>
                                    Add First Parent
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {parents.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{parents.from}</span> to{' '}
                                <span className="font-medium">{parents.to}</span> of{' '}
                                <span className="font-medium">{parents.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                {parents.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-lg ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>


        </AuthenticatedLayout>
    );
}
