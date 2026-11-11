import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Users,
    User,
    Mail,
    Phone,
    Sparkles,
    Search,
    Filter,
    ShieldCheck
} from 'lucide-react';
import QuickAssignModal from './QuickAssignModal';
import BulkGenerateModal from './BulkGenerateModal';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    username?: string | null;
}

interface Student {
    id: number;
    admission_number: string;
    first_name: string;
    last_name: string;
    roll_number?: string;
    school_class?: { name: string };
    section?: { name: string };
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

interface SchoolClass {
    id: number;
    name: string;
    sections?: Array<{ id: number; name: string }>;
}

interface IndexProps {
    parents: {
        data: Parent[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links: PaginationLink[];
    };
    students: Student[];
    classes?: SchoolClass[];
    filters?: {
        search?: string;
    };
}

export default function Index({ parents, students, classes = [], filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showQuickAssign, setShowQuickAssign] = useState(false);
    const [showBulkGenerate, setShowBulkGenerate] = useState(false);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
        name: string;
    }>({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (parent: Parent) => {
        setDeleteModal({
            isOpen: true,
            id: parent.id,
            name: parent.user?.name || parent.father_name || 'this parent',
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        router.delete(`/student-parents/${deleteModal.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal({ isOpen: false, id: null, name: '' });
            },
        });
    };

    const handleSearch = () => {
        router.get('/student-parents', { search: searchTerm }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearchTerm('');
        router.get('/student-parents');
    };

    const data = parents.data;

    return (
        <AuthenticatedLayout>
            <Head title="Parent Management" />

            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/students">
                            <button
                                type="button"
                                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
                                title="Back to Students"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Parent Management</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Manage parents, login credentials & linked children</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => setShowQuickAssign(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                            icon={<Sparkles className="w-3.5 h-3.5" />}
                        >
                            Quick Assign
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowBulkGenerate(true)}
                            icon={<Users className="w-3.5 h-3.5 text-slate-600" />}
                        >
                            Bulk Generate
                        </Button>
                        <Link href="/student-parents/create">
                            <Button size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />}>
                                Add Parent
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Total Parents</p>
                            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{parents.total}</p>
                        </div>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100/60">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Linked Students</p>
                            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                                {data.reduce((sum, p) => sum + (p.students?.length || 0), 0)}
                            </p>
                        </div>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/60">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Active Accounts</p>
                            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                                {data.filter(p => p.user !== null).length}
                            </p>
                        </div>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100/60">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name, username, phone or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={handleSearch} icon={<Filter className="w-3.5 h-3.5" />}>
                                Search
                            </Button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Cards Feed (< 768px) */}
                <div className="block md:hidden space-y-3">
                    {data.length > 0 ? (
                        data.map((parent) => (
                            <div key={parent.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-xs font-semibold text-indigo-700 shrink-0">
                                            {parent.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-xs text-slate-900 truncate">
                                                {parent.user?.name || parent.father_name || parent.mother_name || 'N/A'}
                                            </p>
                                            {parent.user?.username && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5">
                                                    @{parent.user.username}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/student-parents/${parent.id}/edit`}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(parent)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                                    {parent.user?.phone && (
                                        <div className="flex items-center gap-1 truncate">
                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span>{parent.user.phone}</span>
                                        </div>
                                    )}
                                    {parent.user?.email && (
                                        <div className="flex items-center gap-1 truncate">
                                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="truncate">{parent.user.email}</span>
                                        </div>
                                    )}
                                </div>

                                {parent.students && parent.students.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                                        <span className="text-[10px] text-slate-400">Children:</span>
                                        {parent.students.map((student) => (
                                            <span
                                                key={student.id}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded text-[10px] text-slate-700 font-medium"
                                            >
                                                {student.first_name} {student.last_name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                            No parents found.
                        </div>
                    )}
                </div>

                {/* Desktop Table (>= 768px) */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-200/80">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Parent Details</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Login / Contact</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Linked Children</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.length > 0 ? (
                                    data.map((parent) => (
                                        <tr key={parent.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Parent Column */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
                                                        {parent.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 truncate">
                                                            {parent.user?.name || 'N/A'}
                                                        </p>
                                                        <div className="text-[11px] text-slate-400 space-x-2">
                                                            {parent.father_name && <span>F: {parent.father_name}</span>}
                                                            {parent.mother_name && <span>M: {parent.mother_name}</span>}
                                                            {parent.guardian_name && <span>G: {parent.guardian_name}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Login & Contact Column */}
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    {parent.user?.username ? (
                                                        <div className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-100/70 px-1.5 py-0.5 rounded">
                                                            <User className="w-3 h-3 text-indigo-500" />
                                                            {parent.user.username}
                                                        </div>
                                                    ) : null}
                                                    {parent.user?.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {parent.user.phone}
                                                        </div>
                                                    )}
                                                    {parent.user?.email && (
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                            <Mail className="w-3 h-3 text-slate-300" />
                                                            {parent.user.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Linked Students Column */}
                                            <td className="px-4 py-3">
                                                {parent.students && parent.students.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {parent.students.map((student) => (
                                                            <div
                                                                key={student.id}
                                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[11px] text-slate-700"
                                                            >
                                                                <span className="font-medium">
                                                                    {student.first_name} {student.last_name}
                                                                </span>
                                                                {student.admission_number && (
                                                                    <span className="font-mono text-[10px] text-slate-400">
                                                                        ({student.admission_number})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No students linked</span>
                                                )}
                                            </td>

                                            {/* Created At */}
                                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(parent.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/student-parents/${parent.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                                        title="Edit Parent"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(parent)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Remove Parent"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-500">
                                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">No Parents Found</p>
                                            <p className="text-slate-400 mt-0.5">Use "Quick Assign" to create credentials from student records.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard Index Pagination */}
                    <IndexPagination
                        links={parents.links}
                        from={parents.from}
                        to={parents.to}
                        total={parents.total}
                        lastPage={parents.last_page}
                    />
                </div>
            </div>

            {/* Modals */}
            <QuickAssignModal
                show={showQuickAssign}
                onClose={() => setShowQuickAssign(false)}
                classes={classes}
                onSuccess={() => router.reload({ only: ['parents'] })}
            />

            <BulkGenerateModal
                show={showBulkGenerate}
                onClose={() => setShowBulkGenerate(false)}
                classes={classes}
                onSuccess={() => router.reload({ only: ['parents'] })}
            />

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Remove Parent Account"
                message="Are you sure you want to remove this parent account? Students linked to this parent will become unlinked."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
