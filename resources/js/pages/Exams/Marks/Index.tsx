import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import {
    Plus,
    PenLine,
    BookOpen,
    GraduationCap,
    BookMarked,
    CheckCircle2,
    Search,
    Award,
    Trash2,
    Calculator,
    Trophy,
} from 'lucide-react';
import { Mark, PaginatedData, MarkFilters, Exam, SchoolClass, Subject } from '@/types/exam';

interface IndexProps {
    marks: PaginatedData<Mark>;
    filters?: MarkFilters;
    exams: Exam[];
    classes: SchoolClass[];
    subjects: Subject[];
}

export default function Index({ marks, filters, exams, classes, subjects }: IndexProps) {
    const [examId, setExamId] = useState(filters?.exam_id || '');
    const [classId, setClassId] = useState(filters?.class_id || '');
    const [subjectId, setSubjectId] = useState(filters?.subject_id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilter = (newExamId: string, newClassId: string, newSubjectId: string) => {
        router.get(
            '/marks',
            {
                exam_id: newExamId,
                class_id: newClassId,
                subject_id: newSubjectId,
            },
            { preserveState: true }
        );
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/marks/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const data = marks.data ?? [];
    const filteredData = data.filter((m) => {
        const query = searchTerm.toLowerCase();
        const studentName = m.student?.user?.name?.toLowerCase() || '';
        const rollStr = m.student?.roll_number?.toString() || '';
        return (
            !searchTerm ||
            studentName.includes(query) ||
            rollStr.includes(query) ||
            m.subject?.name?.toLowerCase().includes(query)
        );
    });

    const totalCount = marks.total ?? data.length;
    const avgScore =
        data.length > 0
            ? Math.round(
                  (data.reduce((sum, m) => sum + (parseFloat(m.total_marks) || 0), 0) /
                      data.length) *
                      10
              ) / 10
            : 0;
    const passCount = data.filter((m) => (parseFloat(m.total_marks) || 0) >= 33).length;
    const passPercent = data.length > 0 ? Math.round((passCount / data.length) * 100) : 0;

    const getGradeBadge = (grade: string | null, totalMarks: string | number) => {
        const num = parseFloat(totalMarks as string) || 0;
        const g = grade || (num >= 80 ? 'A+' : num >= 70 ? 'A' : num >= 60 ? 'A-' : num >= 50 ? 'B' : num >= 40 ? 'C' : num >= 33 ? 'D' : 'F');

        const colors: Record<string, string> = {
            'A+': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
            'A': 'bg-teal-100 text-teal-800 border-teal-300 font-semibold',
            'A-': 'bg-cyan-100 text-cyan-800 border-cyan-300',
            'B': 'bg-blue-100 text-blue-800 border-blue-300',
            'C': 'bg-amber-100 text-amber-800 border-amber-300',
            'D': 'bg-orange-100 text-orange-800 border-orange-300',
            'F': 'bg-red-100 text-red-800 border-red-300 font-bold',
        };

        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                    colors[g] || 'bg-slate-100 text-slate-700'
                }`}
            >
                {g}
            </span>
        );
    };

    const hasPagination =
        (marks.last_page ?? 1) > 1 && Array.isArray(marks.links) && marks.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Marks Entry" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <PenLine className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Marks Records
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Record subject marks, calculate letter grades, and review student scorecards
                        </p>
                    </div>
                    <Link href="/marks/create">
                        <Button
                            size="md"
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Enter Marks
                        </Button>
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Recorded</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <PenLine className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Student mark entries</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Score</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Calculator className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{avgScore} / 100</p>
                        <p className="text-xs text-blue-600 mt-1">Overall average</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Passing Rate</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{passPercent}%</p>
                        <p className="text-xs text-emerald-600 mt-1">{passCount} students passing</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Performance</p>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Trophy className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {data.filter((m) => (parseFloat(m.total_marks) || 0) >= 80).length}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">A+ (GPA 5.00) marks</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or roll..."
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
                                handleFilter(e.target.value, classId, subjectId);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Exams</option>
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
                                handleFilter(examId, e.target.value, subjectId);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                handleFilter(examId, classId, e.target.value);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
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
                                    <th className="px-5 py-4 text-white font-bold">Student</th>
                                    <th className="px-5 py-4 text-white font-bold">Exam & Class</th>
                                    <th className="px-5 py-4 text-white font-bold">Subject</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Theory</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Practical</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Total Marks</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Grade</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((mark) => (
                                        <tr
                                            key={mark.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {mark.student?.user?.name?.charAt(0).toUpperCase() || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {mark.student?.user?.name || 'Student'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-mono">
                                                            Roll: {mark.student?.roll_number || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {mark.exam?.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {mark.school_class?.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800">
                                                    <BookMarked className="w-3 h-3 mr-1 text-slate-500" />
                                                    {mark.subject?.name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center text-xs font-mono text-slate-600">
                                                {mark.theory_marks ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-xs font-mono text-slate-600">
                                                {mark.practical_marks ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono text-sm font-bold text-slate-900">
                                                {mark.total_marks}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {getGradeBadge(mark.grade, mark.total_marks)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            mark.id,
                                                            `${mark.student?.user?.name} (${mark.subject?.name})`
                                                        )
                                                    }
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete Mark"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <PenLine className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No marks found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm || examId || classId || subjectId
                                                        ? 'Try clearing the active filters'
                                                        : 'Start entering marks for your student cohorts'}
                                                </p>
                                                <Link href="/marks/create">
                                                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                        Enter Marks
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
                                links={marks.links!}
                                from={marks.from}
                                to={marks.to}
                                total={marks.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Mark Entry"
                message={`Are you sure you want to delete this score record for "${deleteModal.name}"?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
