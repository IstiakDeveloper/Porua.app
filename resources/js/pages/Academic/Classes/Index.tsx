import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    Search,
    Users,
    Layers,
    GraduationCap,
    DollarSign,
    CheckCircle2,
    Filter,
} from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali?: string;
    numeric_value: number;
    order: number;
    status: string;
    sections_count: number;
    students_count: number;
    subjects_count: number;
    fee_structures_count: number;
}

interface IndexProps {
    classes: SchoolClass[];
}

export default function Index({ classes }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const filtered = classes.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.name_bengali && c.name_bengali.toLowerCase().includes(searchTerm.toLowerCase())) ||
            c.numeric_value.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalStudents = classes.reduce((sum, c) => sum + (c.students_count || 0), 0);
    const totalSections = classes.reduce((sum, c) => sum + (c.sections_count || 0), 0);
    const activeClasses = classes.filter((c) => c.status === 'active').length;

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/classes/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Academic Classes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span>Academic Management</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Classes
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Configure academic grades, manage sections, and subject enrollments
                        </p>
                    </div>
                    <Link href="/classes/create">
                        <Button
                            size="md"
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Add New Class
                        </Button>
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Classes</p>
                            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{classes.length}</p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {activeClasses} Active
                        </p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Sections</p>
                            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{totalSections}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Across all grades</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Students</p>
                            <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{totalStudents}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Enrolled in school</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Active Rate</p>
                            <div className="p-1.5 sm:p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">
                            {classes.length > 0 ? Math.round((activeClasses / classes.length) * 100) : 0}%
                        </p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1">Operational rate</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search class by name, Bengali name, or grade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 text-xs font-medium text-slate-600 shrink-0">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                All ({classes.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('active')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    statusFilter === 'active'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Active ({activeClasses})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('inactive')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    statusFilter === 'inactive'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Inactive ({classes.length - activeClasses})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Cards Feed (< 768px) */}
                <div className="block md:hidden space-y-3">
                    {filtered.length > 0 ? (
                        filtered.map((cls) => (
                            <div key={cls.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            {cls.numeric_value}
                                        </div>
                                        <div className="min-w-0">
                                            <Link href={`/classes/${cls.id}`} className="font-semibold text-sm text-slate-900 hover:text-emerald-700 truncate block">
                                                {cls.name}
                                            </Link>
                                            {cls.name_bengali && (
                                                <p className="text-xs text-slate-500 truncate">{cls.name_bengali}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={cls.status === 'active' ? 'success' : 'default'}
                                        className="capitalize text-[10px] shrink-0"
                                    >
                                        {cls.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-100">
                                    <div className="flex items-center justify-between p-2 bg-blue-50/60 rounded-lg text-blue-800">
                                        <span className="text-[11px] text-blue-600">Sections:</span>
                                        <span className="font-bold">{cls.sections_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-100/70 rounded-lg text-slate-800">
                                        <span className="text-[11px] text-slate-500">Students:</span>
                                        <span className="font-bold">{cls.students_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-purple-50/60 rounded-lg text-purple-800">
                                        <span className="text-[11px] text-purple-600">Subjects:</span>
                                        <span className="font-bold">{cls.subjects_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-amber-50/60 rounded-lg text-amber-800">
                                        <span className="text-[11px] text-amber-600">Fee Types:</span>
                                        <span className="font-bold">{cls.fee_structures_count}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-xs text-slate-400 font-mono">Order #{cls.order}</span>
                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            href={`/classes/${cls.id}`}
                                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-98"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/classes/${cls.id}/edit`}
                                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 active:scale-98"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(cls.id, cls.name)}
                                            className="p-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 active:scale-98"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-sm text-slate-500">
                            No classes found.
                        </div>
                    )}
                </div>

                {/* Classes Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Order</th>
                                    <th className="px-5 py-4 text-white font-bold">Class / Grade</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Sections</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Students</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Subjects</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Fee Types</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? (
                                    filtered.map((cls) => (
                                        <tr
                                            key={cls.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4 text-xs font-medium text-slate-400">
                                                #{cls.order}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {cls.numeric_value}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/classes/${cls.id}`}
                                                            className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                                                        >
                                                            {cls.name}
                                                        </Link>
                                                        {cls.name_bengali && (
                                                            <p className="text-xs text-slate-500">{cls.name_bengali}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {cls.sections_count} Sections
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                    {cls.students_count} Students
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    {cls.subjects_count} Subjects
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                    {cls.fee_structures_count} Fees
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge
                                                    variant={cls.status === 'active' ? 'success' : 'default'}
                                                    className="capitalize text-xs font-medium"
                                                >
                                                    {cls.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/classes/${cls.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View Class"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/classes/${cls.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Class"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(cls.id, cls.name)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Class"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No classes found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm
                                                        ? 'Try adjusting your search criteria'
                                                        : 'Get started by creating your first academic class'}
                                                </p>
                                                <Link href="/classes/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Add Class
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Academic Class"
                message={`Are you sure you want to delete class "${deleteModal.name}"? This action cannot be undone and will affect linked sections and students.`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
