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
    Clock,
    BookOpen,
    GraduationCap,
    FileText,
    Building,
    CheckCircle2,
    Search,
    BookMarked,
} from 'lucide-react';
import { ExamSchedule, PaginatedData, ScheduleFilters, Exam, SchoolClass } from '@/types/exam';
import { formatTimeRange, formatWhen } from '@/utils/datetime';

interface IndexProps {
    schedules: PaginatedData<ExamSchedule>;
    filters?: ScheduleFilters;
    exams: Exam[];
    classes: SchoolClass[];
}

export default function Index({ schedules, filters, exams, classes }: IndexProps) {
    const [examId, setExamId] = useState(filters?.exam_id || '');
    const [classId, setClassId] = useState(filters?.class_id || '');
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
            router.delete(`/exam-schedules/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handleFilter = (newExamId: string, newClassId: string) => {
        router.get(
            '/exam-schedules',
            {
                exam_id: newExamId,
                class_id: newClassId,
            },
            { preserveState: true }
        );
    };

    const data = schedules.data ?? [];
    const filteredData = data.filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
            !searchTerm ||
            s.subject?.name?.toLowerCase().includes(query) ||
            s.exam?.name?.toLowerCase().includes(query) ||
            s.school_class?.name?.toLowerCase().includes(query) ||
            (s.room_number && s.room_number.toLowerCase().includes(query))
        );
    });

    const totalCount = schedules.total ?? data.length;
    const uniqueExams = new Set(data.map((s) => s.exam_id)).size;
    const uniqueClasses = new Set(data.map((s) => s.class_id)).size;
    const uniqueSubjects = new Set(data.map((s) => s.subject_id)).size;

    const hasPagination =
        (schedules.last_page ?? 1) > 1 &&
        Array.isArray(schedules.links) &&
        schedules.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Routines & Schedules" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Exam Routines & Schedules
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Manage subject exam dates, exam session timings, rooms, and invigilator duties
                        </p>
                    </div>
                    <Link href="/exam-schedules/create" className="w-full sm:w-auto">
                        <Button
                            size="md"
                            icon={<Plus className="w-4 h-4" />}
                            className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Schedule Exam Slot
                        </Button>
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Total Slots</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Scheduled routine slots</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Active Exams</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{uniqueExams}</p>
                        <p className="text-[11px] sm:text-xs text-blue-600 mt-1">Exam sessions with routines</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Classes Covered</p>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{uniqueClasses}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Grades with routine slots</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Subjects</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <BookMarked className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{uniqueSubjects}</p>
                        <p className="text-[11px] sm:text-xs text-emerald-600 mt-1">Courses scheduled</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by subject, class, or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                        <select
                            value={examId}
                            onChange={(e) => {
                                setExamId(e.target.value);
                                handleFilter(e.target.value, classId);
                            }}
                            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Examinations</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={classId}
                            onChange={(e) => {
                                setClassId(e.target.value);
                                handleFilter(examId, e.target.value);
                            }}
                            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Routines Table & Mobile Card Feed */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Mobile Card Feed (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((schedule) => (
                                <div key={schedule.id} className="p-4 space-y-2.5 active:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                                {schedule.subject?.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                {schedule.subject?.code ? `Code: ${schedule.subject.code} · ` : ''}{schedule.exam?.name}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                                            {schedule.school_class?.name}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                        <span className="inline-flex items-center gap-1 font-mono">
                                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                            {formatWhen(schedule.exam_date)}
                                        </span>
                                        <span className="text-slate-300">|</span>
                                        <span className="inline-flex items-center gap-1 font-mono">
                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                            {formatTimeRange(schedule.start_time, schedule.end_time)}
                                        </span>
                                        {schedule.room_number && (
                                            <>
                                                <span className="text-slate-300">|</span>
                                                <span className="inline-flex items-center gap-1 text-slate-600">
                                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                                    Room {schedule.room_number}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                        <Link
                                            href={`/exam-schedules/${schedule.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </Link>
                                        <Link
                                            href={`/exam-schedules/${schedule.id}/edit`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteClick(
                                                    schedule.id,
                                                    `${schedule.subject?.name} (${formatWhen(schedule.exam_date)})`
                                                )
                                            }
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
                                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="font-medium text-slate-700">No exam slots found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Date</th>
                                    <th className="px-5 py-4 text-white font-bold">Time & Duration</th>
                                    <th className="px-5 py-4 text-white font-bold">Subject & Code</th>
                                    <th className="px-5 py-4 text-white font-bold">Class / Grade</th>
                                    <th className="px-5 py-4 text-white font-bold">Room</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((schedule) => (
                                        <tr
                                            key={schedule.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 font-mono">
                                                            {formatWhen(schedule.exam_date)}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {schedule.exam?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs text-slate-700 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatTimeRange(schedule.start_time, schedule.end_time)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {schedule.subject?.name}
                                                    </p>
                                                    {schedule.subject?.code && (
                                                        <p className="text-xs font-mono text-slate-400">
                                                            {schedule.subject.code}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    <BookOpen className="w-3 h-3 mr-1 text-blue-500" />
                                                    {schedule.school_class?.name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                                {schedule.room_number ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-700">
                                                        <Building className="w-3.5 h-3.5 text-slate-400" />
                                                        {schedule.room_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/exam-schedules/${schedule.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View Routine Slot"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/exam-schedules/${schedule.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Routine Slot"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                schedule.id,
                                                                `${schedule.subject?.name} (${formatWhen(schedule.exam_date)})`
                                                            )
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Routine Slot"
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
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No exam slots found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm || examId || classId
                                                        ? 'Try clearing the active filters'
                                                        : 'Schedule your first subject exam routine'}
                                                </p>
                                                <Link href="/exam-schedules/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Schedule Slot
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
                                links={schedules.links!}
                                from={schedules.from}
                                to={schedules.to}
                                total={schedules.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Exam Schedule"
                message={`Are you sure you want to delete this routine slot for "${deleteModal.name}"?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
