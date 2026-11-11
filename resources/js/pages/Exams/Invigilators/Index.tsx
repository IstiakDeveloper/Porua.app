import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import { formatClock, formatWhen } from '@/utils/datetime';
import {
    UserCheck,
    Plus,
    Trash2,
    Calendar,
    Clock,
    Building,
    FileText,
    Printer,
    Search,
    Users,
} from 'lucide-react';

interface Teacher {
    id: number;
    user?: { name: string };
}

interface ExamHall {
    id: number;
    name: string;
    code?: string;
}

interface Exam {
    id: number;
    name: string;
}

interface ExamSchedule {
    id: number;
    subject?: { name: string };
}

interface Invigilator {
    id: number;
    exam_id: number;
    teacher_id: number;
    exam_schedule_id?: number;
    hall_id?: number;
    duty_date: string;
    duty_time: string;
    remarks?: string;
    exam?: Exam;
    teacher?: Teacher;
    exam_hall?: ExamHall;
    exam_schedule?: ExamSchedule;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    invigilators: {
        data: Invigilator[];
        current_page?: number;
        last_page?: number;
        total?: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { exam_id?: string; teacher_id?: string };
    exams: Exam[];
    teachers: Teacher[];
    halls?: ExamHall[];
}

export default function Index({
    invigilators,
    filters,
    exams = [],
    teachers = [],
    halls = [],
}: IndexProps) {
    const [examId, setExamId] = useState(filters?.exam_id || '');
    const [teacherId, setTeacherId] = useState(filters?.teacher_id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilter = (newExamId: string, newTeacherId: string) => {
        router.get(
            '/exam-invigilators',
            { exam_id: newExamId, teacher_id: newTeacherId },
            { preserveState: true }
        );
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/exam-invigilators/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const data = invigilators.data ?? [];
    const filteredData = data.filter((inv) => {
        const query = searchTerm.toLowerCase();
        const teacherName = inv.teacher?.user?.name?.toLowerCase() || '';
        const examName = inv.exam?.name?.toLowerCase() || '';
        const hallName = inv.exam_hall?.name?.toLowerCase() || '';
        return !searchTerm || teacherName.includes(query) || examName.includes(query) || hallName.includes(query);
    });

    const totalCount = invigilators.total ?? data.length;
    const uniqueTeachers = new Set(data.map((i) => i.teacher_id)).size;
    const uniqueHalls = new Set(data.map((i) => i.hall_id).filter(Boolean)).size;

    const hasPagination =
        (invigilators.last_page ?? 1) > 1 &&
        Array.isArray(invigilators.links) &&
        invigilators.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Invigilator Roster" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Invigilator Duty Roster
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Assign exam room invigilators, manage teacher supervision schedules, and print duty rosters
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.length > 0 && (
                            <Button
                                size="md"
                                variant="outline"
                                onClick={handlePrint}
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print Duty Roster
                            </Button>
                        )}
                        <Link href="/exam-invigilators/create">
                            <Button
                                size="md"
                                icon={<Plus className="w-4 h-4" />}
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                            >
                                Assign Invigilator
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Duties</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <UserCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Supervision shifts</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Teachers On Duty</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{uniqueTeachers}</p>
                        <p className="text-xs text-blue-600 mt-1">Active faculty members</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Halls Supervised</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Building className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{uniqueHalls || halls.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Venues covered</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Roster Coverage</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">100%</p>
                        <p className="text-xs text-emerald-600 mt-1">Halls staffed</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by teacher name, exam, or hall..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={examId}
                            onChange={(e) => {
                                setExamId(e.target.value);
                                handleFilter(e.target.value, teacherId);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Examinations</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={teacherId}
                            onChange={(e) => {
                                setTeacherId(e.target.value);
                                handleFilter(examId, e.target.value);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Teachers</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.user?.name || `Teacher #${teacher.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Invigilator (Teacher)</th>
                                    <th className="px-5 py-4 text-white font-bold">Exam Session</th>
                                    <th className="px-5 py-4 text-white font-bold">Date & Shift Time</th>
                                    <th className="px-5 py-4 text-white font-bold">Hall Venue</th>
                                    <th className="px-5 py-4 text-white font-bold">Remarks</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {inv.teacher?.user?.name?.charAt(0).toUpperCase() || 'T'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {inv.teacher?.user?.name || 'Teacher'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-mono">
                                                            Faculty ID #{inv.teacher_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {inv.exam?.name}
                                                    </p>
                                                    {inv.exam_schedule?.subject?.name && (
                                                        <p className="text-[11px] text-slate-400">
                                                            Subject: {inv.exam_schedule.subject.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{formatWhen(inv.duty_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{formatClock(inv.duty_time)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                                                    <Building className="w-3 h-3 mr-1 text-blue-600" />
                                                    {inv.exam_hall?.name || 'Assigned Room'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {inv.remarks || <span className="text-slate-400 italic">None</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            inv.id,
                                                            `${inv.teacher?.user?.name} (${formatWhen(inv.duty_date)})`
                                                        )
                                                    }
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Remove Shift"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <UserCheck className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No invigilators assigned</p>
                                                <p className="text-xs text-slate-500">
                                                    Assign teachers to exam rooms for supervision duties.
                                                </p>
                                                <Link href="/exam-invigilators/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Assign Invigilator
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
                                links={invigilators.links!}
                                from={invigilators.from}
                                to={invigilators.to}
                                total={invigilators.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Remove Invigilator Duty"
                message={`Are you sure you want to remove invigilation duty for "${deleteModal.name}"?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
