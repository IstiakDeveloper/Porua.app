import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    BookMarked,
    Search,
    BookOpen,
    Layers,
    CheckCircle2,
    CheckSquare,
    Calculator,
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    name_bengali: string;
    code: string;
    type: string;
    total_marks: number;
    pass_marks: number;
    status: string;
    classes_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    subjects: {
        data: Subject[];
        current_page?: number;
        last_page?: number;
        total?: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { search?: string; type?: string };
}

export default function Index({ subjects, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/subjects/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const data = subjects.data ?? [];
    const filteredSubjects = data.filter((subject) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            subject.name.toLowerCase().includes(query) ||
            (subject.name_bengali && subject.name_bengali.toLowerCase().includes(query)) ||
            subject.code.toLowerCase().includes(query);
        const matchesType = typeFilter === 'all' || subject.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalSubjects = subjects.total ?? data.length;
    const theoryCount = data.filter((s) => s.type === 'theory').length;
    const practicalBothCount = data.filter((s) => s.type === 'practical' || s.type === 'both').length;
    const activeCount = data.filter((s) => s.status === 'active').length;

    const lastPage = subjects.last_page ?? 1;
    const hasPagination = lastPage > 1 && Array.isArray(subjects.links) && subjects.links.length > 0;

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'theory':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        Theory
                    </span>
                );
            case 'practical':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        Practical
                    </span>
                );
            case 'both':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        Theory + Lab
                    </span>
                );
            default:
                return <span className="text-xs text-slate-500 capitalize">{type}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Academic Subjects" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <BookMarked className="w-3 h-3 text-emerald-600" />
                            <span>Curriculum Management</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Subjects
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Curriculum catalog, course codes, pass marks, and assigned classes
                        </p>
                    </div>
                    <Link href="/subjects/create">
                        <Button
                            size="md"
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Add New Subject
                        </Button>
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Subjects</p>
                            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <BookMarked className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{totalSubjects}</p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {activeCount} Active
                        </p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Theory Courses</p>
                            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{theoryCount}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Core theory focus</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Practical / Lab</p>
                            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Calculator className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{practicalBothCount}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Hands-on evaluation</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Active Rate</p>
                            <div className="p-1.5 sm:p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">
                            {totalSubjects > 0 ? Math.round((activeCount / totalSubjects) * 100) : 0}%
                        </p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1">Active syllabus</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by subject name, Bengali, or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 text-xs font-medium text-slate-600 shrink-0">
                            <button
                                type="button"
                                onClick={() => setTypeFilter('all')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    typeFilter === 'all'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                All Types
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('theory')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    typeFilter === 'theory'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Theory
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('practical')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    typeFilter === 'practical'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Practical
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('both')}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                                    typeFilter === 'both'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Both
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Cards Feed (< 768px) */}
                <div className="block md:hidden space-y-3">
                    {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((sub) => (
                            <div key={sub.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            <BookMarked className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                                                    {sub.code}
                                                </span>
                                                <Link href={`/subjects/${sub.id}`} className="font-semibold text-sm text-slate-900 hover:text-emerald-700 truncate block">
                                                    {sub.name}
                                                </Link>
                                            </div>
                                            {sub.name_bengali && (
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{sub.name_bengali}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={sub.status === 'active' ? 'success' : 'default'}
                                        className="capitalize text-[10px] shrink-0"
                                    >
                                        {sub.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-400">Type:</span>
                                        {getTypeBadge(sub.type)}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600 justify-end">
                                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="font-medium">{sub.classes_count ?? 0} Classes</span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 p-2 bg-slate-50/70 rounded-lg text-xs">
                                        <span className="text-slate-500 font-medium">Marks:</span>
                                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">
                                            Total {sub.total_marks}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-mono">
                                            Pass {sub.pass_marks}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                                    <Link
                                        href={`/subjects/${sub.id}`}
                                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-98"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/subjects/${sub.id}/edit`}
                                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 active:scale-98"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteClick(sub.id, sub.name)}
                                        className="p-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 active:scale-98"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-sm text-slate-500">
                            No subjects found.
                        </div>
                    )}
                </div>

                {/* Mobile Pagination */}
                {hasPagination && (
                    <div className="block md:hidden bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs">
                        <IndexPagination
                            links={subjects.links!}
                            from={subjects.from}
                            to={subjects.to}
                            total={subjects.total}
                        />
                    </div>
                )}

                {/* Subjects Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Code</th>
                                    <th className="px-5 py-4 text-white font-bold">Subject Name</th>
                                    <th className="px-5 py-4 text-white font-bold">Type</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Marks Scheme</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Assigned Classes</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSubjects.length > 0 ? (
                                    filteredSubjects.map((sub) => (
                                        <tr
                                            key={sub.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">
                                                <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                                                    {sub.code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        <BookMarked className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/subjects/${sub.id}`}
                                                            className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                        {sub.name_bengali && (
                                                            <p className="text-xs text-slate-500">{sub.name_bengali}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">{getTypeBadge(sub.type)}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 text-xs font-medium">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                        Total: {sub.total_marks}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                        Pass: {sub.pass_marks}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Layers className="w-3 h-3 mr-1 text-blue-500" />
                                                    {sub.classes_count ?? 0} Classes
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge
                                                    variant={sub.status === 'active' ? 'success' : 'default'}
                                                    className="capitalize text-xs font-medium"
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/subjects/${sub.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View Subject"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/subjects/${sub.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Subject"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(sub.id, sub.name)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Subject"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <BookMarked className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No subjects found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm
                                                        ? 'Try clearing your search query'
                                                        : 'Start by adding courses to your curriculum'}
                                                </p>
                                                <Link href="/subjects/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Add Subject
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {hasPagination && (
                        <div className="p-4 border-t border-slate-100">
                            <IndexPagination
                                links={subjects.links!}
                                from={subjects.from}
                                to={subjects.to}
                                total={subjects.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Academic Subject"
                message={`Are you sure you want to delete "${deleteModal.name}"? This will remove subject mappings and historical exam schedules.`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
