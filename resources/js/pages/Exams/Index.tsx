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
    Calendar,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    BookOpen,
    Trophy,
    Sparkles,
    Search,
    ChevronRight,
} from 'lucide-react';
import { Exam, PaginatedData, ExamFilters, AcademicYear } from '@/types/exam';
import { formatWhen } from '@/utils/datetime';

interface IndexProps {
    exams: PaginatedData<Exam>;
    filters?: ExamFilters;
    academicYears: AcademicYear[];
}

export default function Index({ exams, filters, academicYears }: IndexProps) {
    const [academicYearId, setAcademicYearId] = useState(filters?.academic_year_id || '');
    const [examType, setExamType] = useState(filters?.exam_type || '');
    const [searchTerm, setSearchTerm] = useState('');
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
            router.delete(`/exams/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handleFilter = (year: string, type: string) => {
        router.get(
            '/exams',
            {
                academic_year_id: year,
                exam_type: type,
            },
            { preserveState: true }
        );
    };

    const getExamTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            first_term: 'First Term Exam',
            mid_term: 'Mid Term Exam',
            final: 'Annual / Final Exam',
            test: 'Class Test / Quiz',
            practical: 'Practical Lab Exam',
        };
        return labels[type] || type.replace(/_/g, ' ');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'upcoming':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Clock className="w-3 h-3 text-blue-500" /> Upcoming
                    </span>
                );
            case 'ongoing':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <AlertCircle className="w-3 h-3 text-amber-500" /> Ongoing
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
                    </span>
                );
            default:
                return (
                    <Badge variant="default" className="capitalize text-xs">
                        {status}
                    </Badge>
                );
        }
    };

    const data = exams.data ?? [];
    const filteredData = data.filter(
        (e) =>
            !searchTerm ||
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.academic_year?.name && e.academic_year.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const upcomingCount = data.filter((e) => e.status === 'upcoming').length;
    const ongoingCount = data.filter((e) => e.status === 'ongoing').length;
    const completedCount = data.filter((e) => e.status === 'completed').length;

    const hasPagination =
        (exams.last_page ?? 1) > 1 && Array.isArray(exams.links) && exams.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exams Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <FileText className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Exams
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Create examinations, schedule test routines, record student marks, and publish results
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                        <Link href="/exam-schedules" className="w-full sm:w-auto">
                            <Button size="md" variant="outline" icon={<Calendar className="w-4 h-4" />} className="w-full justify-center">
                                Routines
                            </Button>
                        </Link>
                        <Link href="/exams/create" className="w-full sm:w-auto">
                            <Button
                                size="md"
                                icon={<Plus className="w-4 h-4" />}
                                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                            >
                                Create Exam
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Exams</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{exams.total ?? data.length}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Recorded sessions</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Upcoming</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{upcomingCount}</p>
                        <p className="text-[11px] sm:text-xs text-blue-600 mt-1">Scheduled to start</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Ongoing</p>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{ongoingCount}</p>
                        <p className="text-[11px] sm:text-xs text-amber-600 mt-1">Active in progress</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{completedCount}</p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1">Ready for results</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search exams by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                        <select
                            value={academicYearId}
                            onChange={(e) => {
                                setAcademicYearId(e.target.value);
                                handleFilter(e.target.value, examType);
                            }}
                            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Academic Years</option>
                            {academicYears.map((ay) => (
                                <option key={ay.id} value={ay.id}>
                                    {ay.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={examType}
                            onChange={(e) => {
                                setExamType(e.target.value);
                                handleFilter(academicYearId, e.target.value);
                            }}
                            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Exam Types</option>
                            <option value="first_term">First Term</option>
                            <option value="mid_term">Mid Term</option>
                            <option value="final">Final Exam</option>
                            <option value="test">Class Test</option>
                            <option value="practical">Practical</option>
                        </select>
                    </div>
                </div>

                {/* Exams Content: Mobile Card Feed + Desktop Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Mobile Card Feed (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((exam) => (
                                <div key={exam.id} className="p-4 space-y-3 active:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/exams/${exam.id}`}
                                                    className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                                                >
                                                    {exam.name}
                                                </Link>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {exam.academic_year?.name || 'Year N/A'} · {getExamTypeLabel(exam.exam_type)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {getStatusBadge(exam.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date Span</span>
                                            <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {exam.start_date ? formatWhen(exam.start_date) : 'TBD'} → {exam.end_date ? formatWhen(exam.end_date) : 'TBD'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Result Date</span>
                                            <span className="font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                                                <Trophy className="w-3 h-3 text-emerald-600" />
                                                {exam.result_publish_date ? formatWhen(exam.result_publish_date) : 'Not set'}
                                            </span>
                                        </div>
                                    </div>

                                    {exam.classes && exam.classes.length > 0 && (
                                        <div className="text-[11px] text-slate-500">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                                {exam.classes.length} classes enrolled
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                        <Link
                                            href={`/exams/${exam.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </Link>
                                        <Link
                                            href={`/exams/${exam.id}/edit`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(exam.id, exam.name)}
                                            className="inline-flex items-center justify-center p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-500">
                                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="font-medium text-slate-700">No exams found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Exam Name</th>
                                    <th className="px-5 py-4 text-white font-bold">Type & Session</th>
                                    <th className="px-5 py-4 text-white font-bold">Date Span</th>
                                    <th className="px-5 py-4 text-white font-bold">Result Date</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((exam) => (
                                        <tr
                                            key={exam.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/exams/${exam.id}`}
                                                            className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                                                        >
                                                            {exam.name}
                                                        </Link>
                                                        {exam.classes && exam.classes.length > 0 && (
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                {exam.classes.length} classes enrolled
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {getExamTypeLabel(exam.exam_type)}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {exam.academic_year?.name || 'Year N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>
                                                        {exam.start_date ? formatWhen(exam.start_date) : 'TBD'} → {exam.end_date ? formatWhen(exam.end_date) : 'TBD'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600">
                                                {exam.result_publish_date ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                                        <Trophy className="w-3 h-3 text-emerald-600" />
                                                        {formatWhen(exam.result_publish_date)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {getStatusBadge(exam.status)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/exams/${exam.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View Exam Dashboard"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/exams/${exam.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Exam"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(exam.id, exam.name)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Exam"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No exams found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm || academicYearId || examType
                                                        ? 'Try clearing the active filters'
                                                        : 'Create your first exam to begin scheduling routines'}
                                                </p>
                                                <Link href="/exams/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Create Exam
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
                                links={exams.links!}
                                from={exams.from}
                                to={exams.to}
                                total={exams.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Examination"
                message={`Are you sure you want to delete "${deleteModal.name}"? This action will remove associated exam schedules, marks, and student result records.`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
