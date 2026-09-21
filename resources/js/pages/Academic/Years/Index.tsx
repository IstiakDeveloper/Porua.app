import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Calendar, CheckCircle, Search } from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
    title: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    status: string;
    created_at: string;
}

interface IndexProps {
    years: AcademicYear[];
}

export default function Index({ years }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState<number | null>(null);

    const handleSetCurrent = (id: number) => {
        if (confirm('Set this as the current academic year?')) {
            setProcessing(id);
            router.post(`/academic-years/${id}/set-current`, {}, {
                onFinish: () => setProcessing(null),
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(`/academic-years/${id}`);
        }
    };

    const filteredYears = years.filter(year =>
        year.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        year.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string): any => {
        const badges: Record<string, any> = {
            active: 'success',
            completed: 'default',
            upcoming: 'info',
        };
        return badges[status] || 'default';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Academic Years" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Academic Years
                        </h1>
                        <p className="text-gray-600 mt-1">Manage academic years and sessions</p>
                    </div>
                    <Link href="/academic-years/create">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            icon={<Plus className="w-5 h-5" />}
                        >
                            Create Year
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Years</p>
                                <p className="text-2xl font-bold text-gray-900">{years.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {years.filter(y => y.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Year</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {years.find(y => y.is_current)?.name || 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search academic years..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Academic Year</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duration</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredYears.map((year, index) => (
                                <tr key={year.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{year.name}</p>
                                                {year.title && <p className="text-sm text-gray-600">{year.title}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">
                                            {new Date(year.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {' - '}
                                            {new Date(year.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadge(year.status)} className="capitalize">
                                            {year.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {year.is_current ? (
                                            <Badge variant="success">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Current
                                            </Badge>
                                        ) : (
                                            <button
                                                onClick={() => handleSetCurrent(year.id)}
                                                disabled={processing === year.id}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                                            >
                                                {processing === year.id ? 'Setting...' : 'Set Current'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/academic-years/${year.id}/edit`}>
                                                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(year.id, year.name)}
                                                icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredYears.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Academic Years Found</h4>
                            <p className="text-gray-600 mt-1">Create your first academic year to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
