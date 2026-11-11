import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import StatusToggle from '@/Components/StatusToggle';
import IndexPagination from '@/Components/IndexPagination';
import DeleteModal from '@/Components/DeleteModal';
import { Plus, Edit, Trash2, Eye, Users, Search, Mail, Phone, User, BookOpen, Calendar, Filter, X } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    qualification: string;
    experience_years: number;
    status: string;
    photo: string | null;
    subjects_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    teachers: {
        data: Teacher[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { search?: string; status?: string };
    canToggleStatus?: boolean;
}

const TOGGLEABLE_TEACHER_STATUSES = ['active', 'inactive'];

const isTeacherActive = (status: string) => status === 'active';

const canToggleTeacherStatus = (status: string) => TOGGLEABLE_TEACHER_STATUSES.includes(status);

export default function Index({ teachers, filters = {}, canToggleStatus = false }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const openDeleteModal = (t: Teacher) => {
        setSelectedTeacher(t);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (!selectedTeacher) return;
        router.delete(`/teachers/${selectedTeacher.id}`, {
            onSuccess: () => setDeleteModalOpen(false)
        });
    };

    const handleSearch = () => {
        router.get('/teachers', {
            search: searchTerm || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get('/teachers');
    };

    const handleStatusToggle = (teacherId: number) => {
        setTogglingId(teacherId);
        router.patch(`/teachers/${teacherId}/toggle-status`, {}, {
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
        });
    };

    const getPhotoUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        if (photo.startsWith('storage/')) return `/${photo}`;
        return `/storage/${photo}`;
    };

    const data = teachers.data || [];

    return (
        <AuthenticatedLayout>
            <Head title="Teachers Directory" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Faculty & Teachers Directory"
                    subtitle="Manage institutional teaching staff, recruitments, and workload distribution"
                    badges={[
                        { label: `${teachers.total} Faculty Members`, variant: 'neutral' }
                    ]}
                    actionSlot={
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/teachers/subjects"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                Subject Allocations
                            </Link>
                            <Link
                                href="/teachers/subjects/schedule"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                Weekly Timetable
                            </Link>
                            <Link
                                href="/teachers/create"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Teacher
                            </Link>
                        </div>
                    }
                />

                {/* 2. SEARCH & FILTER STRIP */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, employee ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                router.get('/teachers', {
                                    search: searchTerm || undefined,
                                    status: e.target.value || undefined,
                                }, { preserveState: true });
                            }}
                            className="text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="resigned">Resigned</option>
                            <option value="retired">Retired</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Search
                        </button>

                        {(searchTerm || statusFilter) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. DUAL VIEW: MOBILE CARDS & DESKTOP HIGH-DENSITY TABLE */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {data.length > 0 ? (
                        <>
                            {/* Mobile Card Feed (< 768px) */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {data.map((teacher) => (
                                    <div key={teacher.id} className="p-3.5 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {teacher.photo && !imageErrors[teacher.id] ? (
                                                    <img
                                                        src={getPhotoUrl(teacher.photo) || ''}
                                                        alt=""
                                                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                                                        onError={() => setImageErrors(prev => ({ ...prev, [teacher.id]: true }))}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-200">
                                                        {teacher.full_name?.charAt(0) || 'T'}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 truncate">{teacher.full_name}</h4>
                                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {teacher.employee_id} • {teacher.experience_years}y exp</p>
                                                </div>
                                            </div>

                                            <div>
                                                {canToggleTeacherStatus(teacher.status) ? (
                                                    <StatusToggle
                                                        checked={isTeacherActive(teacher.status)}
                                                        onChange={() => handleStatusToggle(teacher.id)}
                                                        disabled={!canToggleStatus}
                                                        loading={togglingId === teacher.id}
                                                    />
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                                        {teacher.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-0.5">
                                            <p className="truncate">Email: <strong className="text-slate-800">{teacher.email}</strong></p>
                                            {teacher.phone && <p>Phone: <strong className="text-slate-800 font-mono">{teacher.phone}</strong></p>}
                                            <p>Subjects: <strong className="text-indigo-600">{teacher.subjects_count} Courses</strong></p>
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 pt-1">
                                            <Link
                                                href={`/teachers/${teacher.id}`}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                            >
                                                Dossier
                                            </Link>
                                            <Link
                                                href={`/teachers/${teacher.id}/edit`}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(teacher)}
                                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                title="Delete Faculty"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table (>= 768px) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Faculty</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Employee ID</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Qualification</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Subjects</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        {teacher.photo && !imageErrors[teacher.id] ? (
                                                            <img
                                                                src={getPhotoUrl(teacher.photo) || ''}
                                                                alt=""
                                                                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                                                                onError={() => setImageErrors(prev => ({ ...prev, [teacher.id]: true }))}
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-200">
                                                                {teacher.full_name?.charAt(0) || 'T'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-slate-900">{teacher.full_name}</p>
                                                            <p className="text-[11px] text-slate-400">{teacher.experience_years} yrs exp.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono font-medium text-slate-800">{teacher.employee_id}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    <div className="flex items-center gap-1 font-mono text-[11px]">{teacher.email}</div>
                                                    {teacher.phone && <div className="text-slate-400 font-mono text-[11px]">{teacher.phone}</div>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-medium">{teacher.qualification || '—'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {teacher.subjects_count} Subjects
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {canToggleTeacherStatus(teacher.status) ? (
                                                        <StatusToggle
                                                            checked={isTeacherActive(teacher.status)}
                                                            onChange={() => handleStatusToggle(teacher.id)}
                                                            disabled={!canToggleStatus}
                                                            loading={togglingId === teacher.id}
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                                            {teacher.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/teachers/${teacher.id}`}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                                            title="View 360 Dossier"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <Link
                                                            href={`/teachers/${teacher.id}/edit`}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                                            title="Edit Faculty"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal(teacher)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                            title="Delete Faculty"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No teachers found matching your criteria</p>
                        </div>
                    )}

                    <IndexPagination
                        links={teachers.links ?? []}
                        from={teachers.from}
                        to={teachers.to}
                        total={teachers.total}
                        lastPage={teachers.last_page}
                    />
                </div>

                {/* DELETE CONFIRMATION MODAL */}
                <DeleteModal
                    isOpen={deleteModalOpen}
                    title="Delete Teacher Record"
                    itemName={selectedTeacher?.full_name || ''}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleExecuteDelete}
                />
            </div>
        </AuthenticatedLayout>
    );
}
