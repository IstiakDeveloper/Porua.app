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
    Layers,
    Search,
    Users,
    BookOpen,
    Building,
    CheckCircle2,
    GraduationCap,
} from 'lucide-react';

interface Teacher {
    id: number;
    user?: { name: string };
}

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string;
    status: string;
    students_count: number;
    school_class?: { id: number; name: string };
    teacher?: Teacher;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    sections: {
        data: Section[];
        current_page?: number;
        last_page?: number;
        total?: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    classes: Array<{ id: number; name: string }>;
    filters?: { class_id?: string };
}

export default function Index({ sections, classes, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classId, setClassId] = useState(filters?.class_id ?? '');
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
            router.delete(`/sections/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handleClassFilter = (value: string) => {
        setClassId(value);
        router.get('/sections', value ? { class_id: value } : {}, { preserveState: true });
    };

    const data = sections.data ?? [];
    const displayData = data.filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
            !searchTerm ||
            s.name.toLowerCase().includes(query) ||
            s.school_class?.name?.toLowerCase().includes(query) ||
            (s.room_number && s.room_number.toLowerCase().includes(query))
        );
    });

    const totalCapacity = data.reduce((sum, s) => sum + (s.capacity || 0), 0);
    const totalEnrolled = data.reduce((sum, s) => sum + (s.students_count || 0), 0);
    const activeCount = data.filter((s) => s.status === 'active').length;

    const lastPage = sections.last_page ?? 1;
    const hasPagination = lastPage > 1 && Array.isArray(sections.links) && sections.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Academic Sections" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Layers className="w-3 h-3 text-emerald-600" />
                            <span>Academic Management</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Sections
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Organize student cohorts, section capacities, class teachers, and rooms
                        </p>
                    </div>
                    <Link href="/sections/create">
                        <Button
                            size="md"
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Add New Section
                        </Button>
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Sections</p>
                            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{sections.total ?? data.length}</p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {activeCount} Active
                        </p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Capacity</p>
                            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{totalCapacity} seats</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Available across sections</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Enrolled</p>
                            <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{totalEnrolled}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Assigned students</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Occupancy Rate</p>
                            <div className="p-1.5 sm:p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <Building className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">
                            {totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%
                        </p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1">Class utilization</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search section name, class, or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={classId}
                            onChange={(e) => handleClassFilter(e.target.value)}
                            className="w-full sm:w-auto px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Mobile Cards Feed (< 768px) */}
                <div className="block md:hidden space-y-3">
                    {displayData.length > 0 ? (
                        displayData.map((s) => {
                            const capacity = s.capacity || 40;
                            const enrolled = s.students_count || 0;
                            const percent = Math.min(Math.round((enrolled / capacity) * 100), 100);

                            return (
                                <div key={s.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/sections/${s.id}`} className="font-semibold text-sm text-slate-900 hover:text-emerald-700 truncate block">
                                                    Section {s.name}
                                                </Link>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 mt-0.5">
                                                    <BookOpen className="w-3 h-3 mr-1 text-emerald-600" />
                                                    {s.school_class?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={s.status === 'active' ? 'success' : 'default'}
                                            className="capitalize text-[10px] shrink-0"
                                        >
                                            {s.status}
                                        </Badge>
                                    </div>

                                    {/* Capacity Progress */}
                                    <div className="p-2.5 bg-slate-50/70 rounded-xl space-y-1.5 border border-slate-100">
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span className="font-medium">{enrolled} students enrolled</span>
                                            <span className="text-slate-400">max {capacity} ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    percent > 90
                                                        ? 'bg-amber-500'
                                                        : percent > 60
                                                        ? 'bg-emerald-500'
                                                        : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Building className="w-3.5 h-3.5 text-slate-400" />
                                            {s.room_number ? `Room ${s.room_number}` : 'Room —'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/sections/${s.id}`}
                                                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-98"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/sections/${s.id}/edit`}
                                                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 active:scale-98"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(s.id, s.name)}
                                                className="p-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 active:scale-98"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-sm text-slate-500">
                            No sections found.
                        </div>
                    )}
                </div>

                {/* Mobile Pagination */}
                {hasPagination && (
                    <div className="block md:hidden bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs">
                        <IndexPagination
                            links={sections.links!}
                            from={sections.from}
                            to={sections.to}
                            total={sections.total}
                        />
                    </div>
                )}

                {/* Sections Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Section</th>
                                    <th className="px-5 py-4 text-white font-bold">Class / Grade</th>
                                    <th className="px-5 py-4 text-white font-bold">Room</th>
                                    <th className="px-5 py-4 text-white font-bold">Capacity & Enrolled</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayData.length > 0 ? (
                                    displayData.map((s) => {
                                        const capacity = s.capacity || 40;
                                        const enrolled = s.students_count || 0;
                                        const percent = Math.min(Math.round((enrolled / capacity) * 100), 100);

                                        return (
                                            <tr
                                                key={s.id}
                                                className="hover:bg-emerald-50/30 transition-colors group"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/sections/${s.id}`}
                                                                className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                                                            >
                                                                Section {s.name}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                                                        <BookOpen className="w-3 h-3 mr-1 text-emerald-600" />
                                                        {s.school_class?.name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                                    {s.room_number ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Building className="w-3.5 h-3.5 text-slate-400" />
                                                            {s.room_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Not set</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="space-y-1.5 max-w-[180px]">
                                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                                            <span className="font-medium">{enrolled} students</span>
                                                            <span className="text-slate-400">max {capacity}</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${
                                                                    percent > 90
                                                                        ? 'bg-amber-500'
                                                                        : percent > 60
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-blue-500'
                                                                }`}
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <Badge
                                                        variant={s.status === 'active' ? 'success' : 'default'}
                                                        className="capitalize text-xs font-medium"
                                                    >
                                                        {s.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/sections/${s.id}`}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="View Section"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/sections/${s.id}/edit`}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Section"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(s.id, s.name)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Section"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <Layers className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No sections found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm || classId
                                                        ? 'Try clearing the search filter'
                                                        : 'Get started by creating your first academic section'}
                                                </p>
                                                <Link href="/sections/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Add Section
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
                                links={sections.links!}
                                from={sections.from}
                                to={sections.to}
                                total={sections.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Academic Section"
                message={`Are you sure you want to delete section "${deleteModal.name}"? This action will remove the section and disassociate any enrolled students.`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
