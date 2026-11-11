import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import StatusToggle from '@/Components/StatusToggle';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Edit, Trash2, Eye, Users, Search, Mail, Phone, Filter, GraduationCap } from 'lucide-react';

interface Student {
    id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    photo: string | null;
    photo_url: string | null;
    status: string;
    session_status?: string;
    academic_year?: { name: string };
    school_class?: { name: string };
    section?: { name: string };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { search?: string; class_id?: string; section_id?: string; academic_year_id?: string; status?: string };
    classes: Array<{ id: number; name: string }>;
    academicYears: Array<{ id: number; name: string; is_current?: boolean }>;
    canToggleStatus?: boolean;
}

const TOGGLEABLE_STUDENT_STATUSES = ['active', 'suspended'];

const isStudentActive = (status: string) => status === 'active';

const canToggleStudentStatus = (status: string) => TOGGLEABLE_STUDENT_STATUSES.includes(status);

export default function Index({ students, filters = {}, classes, academicYears, canToggleStatus = false }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [academicYearId, setAcademicYearId] = useState(filters.academic_year_id || '');
    const [classId, setClassId] = useState(filters.class_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const handleDeleteClick = (id: number, name: string) => setDeleteModal({ isOpen: true, id, name });
    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/students/${deleteModal.id}`, {
                onFinish: () => { setIsDeleting(false); setDeleteModal({ isOpen: false, id: null, name: '' }); },
            });
        }
    };
    const handleDeleteCancel = () => setDeleteModal({ isOpen: false, id: null, name: '' });

    const handleSearch = () => {
        router.get('/students', {
            search: searchTerm,
            class_id: classId || undefined,
            status: status || undefined,
            academic_year_id: academicYearId || undefined,
        }, { preserveState: true });
    };
    const handleReset = () => {
        setSearchTerm(''); setAcademicYearId(''); setClassId(''); setStatus('');
        router.get('/students');
    };

    const handleStatusToggle = (studentId: number) => {
        setTogglingId(studentId);
        router.patch(`/students/${studentId}/toggle-status`, {}, {
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
        });
    };

    const data = students.data;
    const colSpan = 8;

    return (
        <AuthenticatedLayout>
            <Head title="Students" />
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Students Directory</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage student enrolments, profiles, and academic records</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        <Link href="/student-parents">
                            <Button size="sm" variant="secondary" icon={<Users className="w-3.5 h-3.5" />}>
                                Parents Directory
                            </Button>
                        </Link>
                        <Link href="/student-promotions">
                            <Button size="sm" variant="secondary" icon={<GraduationCap className="w-3.5 h-3.5" />}>
                                Promotions
                            </Button>
                        </Link>
                        <Link href="/students/create">
                            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                Add Student
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-2.5">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1 sm:hidden">Search</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search name, admission no..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full text-sm pl-8 pr-2.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:flex items-center gap-2">
                            <select
                                value={academicYearId}
                                onChange={(e) => setAcademicYearId(e.target.value)}
                                className="col-span-2 text-sm px-2.5 py-2 border border-gray-200 rounded-lg sm:w-40 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">All Sessions</option>
                                {academicYears.map(year => (
                                    <option key={year.id} value={year.id}>
                                        {year.name}{year.is_current ? ' (Current)' : ''}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="text-sm px-2.5 py-2 border border-gray-200 rounded-lg sm:w-36 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="text-sm px-2.5 py-2 border border-gray-200 rounded-lg sm:w-32 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Inactive</option>
                                <option value="passed">Passed</option>
                                <option value="transferred">Transferred</option>
                                <option value="dropped">Dropped</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={handleSearch} icon={<Filter className="w-4 h-4" />} className="flex-1 sm:flex-initial justify-center">
                                Filter
                            </Button>
                            <button type="button" onClick={handleReset} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 active:scale-98">
                                Reset
                            </button>
                        </div>
                    </div>
                    {academicYearId && (
                        <p className="text-[11px] text-slate-500 mt-2">
                            Class and roll are from this session, including students promoted since then.
                        </p>
                    )}
                </div>

                {/* Mobile Cards Feed (< 768px) */}
                <div className="block md:hidden space-y-3">
                    {data.length > 0 ? (
                        data.map((student) => (
                            <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-xs space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {student.photo_url ? (
                                            <img src={student.photo_url} alt="" className="h-11 w-11 rounded-full object-cover shrink-0 border border-gray-100" />
                                        ) : (
                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center text-sm font-semibold text-indigo-600 shrink-0">
                                                {student.full_name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <Link href={`/students/${student.id}`} className="font-semibold text-sm text-gray-900 truncate block hover:text-indigo-600">
                                                {student.full_name}
                                            </Link>
                                            <p className="text-xs text-gray-500 truncate">
                                                {student.school_class?.name}{student.section ? ` • Sec ${student.section.name}` : ''}
                                                {student.session_status && student.session_status !== 'enrolled' ? ` • ${student.session_status.replace('_', ' ')}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {canToggleStudentStatus(student.status) ? (
                                            <StatusToggle
                                                checked={isStudentActive(student.status)}
                                                onChange={() => handleStatusToggle(student.id)}
                                                disabled={!canToggleStatus}
                                                loading={togglingId === student.id}
                                            />
                                        ) : (
                                            <Badge
                                                variant={student.status === 'passed' ? 'info' : student.status === 'transferred' ? 'warning' : 'default'}
                                                className="capitalize text-[10px]"
                                            >
                                                {student.status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                                    <div>
                                        <span className="text-gray-400">Adm No:</span> <span className="font-mono font-medium text-gray-800">{student.admission_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Roll:</span> <span className="font-mono font-medium text-gray-800">{student.roll_number || '—'}</span>
                                    </div>
                                    {student.phone && (
                                        <div className="col-span-2 flex items-center gap-1.5 text-gray-600">
                                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                            <a href={`tel:${student.phone}`} className="hover:underline">{student.phone}</a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                    <Link
                                        href={`/students/${student.id}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 active:scale-98"
                                    >
                                        <Eye className="w-3 h-3 text-gray-500" />
                                        View
                                    </Link>
                                    <Link
                                        href={`/students/${student.id}/edit`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 active:scale-98"
                                    >
                                        <Edit className="w-3 h-3 text-indigo-600" />
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteClick(student.id, student.full_name)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 active:scale-98"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
                            No students found.
                        </div>
                    )}
                </div>

                {/* Desktop Table (>= 768px) */}
                <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Adm No</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Roll</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.length > 0 ? data.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            {student.photo_url ? (
                                                <img src={student.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {student.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{student.admission_number}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{student.roll_number}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                                            {student.academic_year && <p className="text-xs text-gray-500">{student.academic_year.name}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            <p>{student.school_class?.name}{student.section ? ` / ${student.section.name}` : ''}</p>
                                            {student.session_status && student.session_status !== 'enrolled' && (
                                                <p className="text-[10px] uppercase tracking-wide text-slate-400">{student.session_status.replace('_', ' ')}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {student.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{student.email}</div>}
                                            {student.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{student.phone}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {canToggleStudentStatus(student.status) ? (
                                                <StatusToggle
                                                    checked={isStudentActive(student.status)}
                                                    onChange={() => handleStatusToggle(student.id)}
                                                    disabled={!canToggleStatus}
                                                    loading={togglingId === student.id}
                                                />
                                            ) : (
                                                <Badge
                                                    variant={student.status === 'passed' ? 'info' : student.status === 'transferred' ? 'warning' : 'default'}
                                                    className="capitalize text-xs"
                                                >
                                                    {student.status}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-3.5 h-3.5" /></Link>
                                                <Link href={`/students/${student.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDeleteClick(student.id, student.full_name)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-500">No students found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={students.links ?? []}
                        from={students.from}
                        to={students.to}
                        total={students.total}
                        lastPage={students.last_page}
                    />
                </div>

                {/* Mobile Pagination */}
                <div className="block md:hidden bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <IndexPagination
                        links={students.links ?? []}
                        from={students.from}
                        to={students.to}
                        total={students.total}
                        lastPage={students.last_page}
                    />
                </div>
            </div>
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Student"
                message="Are you sure you want to delete this student? All associated data will be permanently removed."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
