import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import {
    Trophy,
    Eye,
    CheckCircle2,
    XCircle,
    Search,
    Sparkles,
    Trash2,
    Send,
    Award,
    Calculator,
    BarChart3,
    GraduationCap,
    Printer,
} from 'lucide-react';
import { Result, PaginatedData, ResultFilters, Exam, SchoolClass } from '@/types/exam';

interface IndexProps {
    results: PaginatedData<Result>;
    filters?: ResultFilters;
    exams: Exam[];
    classes: SchoolClass[];
}

export default function Index({ results, filters, exams, classes }: IndexProps) {
    const [examId, setExamId] = useState<string>(filters?.exam_id?.toString() || '');
    const [classId, setClassId] = useState<string>(filters?.class_id?.toString() || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleFilter = (newExamId: string, newClassId: string) => {
        router.get(
            '/results',
            { exam_id: newExamId, class_id: newClassId },
            { preserveState: true }
        );
    };

    const handleGenerate = () => {
        if (!examId || !classId) {
            alert('Please select both an Examination and Class from the dropdowns below.');
            return;
        }
        if (confirm('Calculate and generate GPA/Rank results for the selected exam and class?')) {
            setIsGenerating(true);
            router.post(
                '/results/generate',
                { exam_id: examId, class_id: classId },
                {
                    onFinish: () => setIsGenerating(false),
                }
            );
        }
    };

    const handlePublish = () => {
        if (!examId || !classId) {
            alert('Please select both an Examination and Class from the dropdowns below.');
            return;
        }
        if (confirm('Are you sure you want to publish these results? Students will immediately be able to view their scorecards.')) {
            setIsPublishing(true);
            router.post(
                '/results/publish',
                { exam_id: examId, class_id: classId },
                {
                    onFinish: () => setIsPublishing(false),
                }
            );
        }
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/results/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const data = results.data ?? [];
    const filteredData = data.filter((r) => {
        const query = searchTerm.toLowerCase();
        const studentName = r.student?.user?.name?.toLowerCase() || '';
        const rollStr = r.student?.roll_number?.toString() || '';
        return !searchTerm || studentName.includes(query) || rollStr.includes(query);
    });

    const totalCount = results.total ?? data.length;
    const passCount = data.filter((r) => r.status === 'pass').length;
    const failCount = data.filter((r) => r.status === 'fail').length;
    const avgPercentage =
        data.length > 0
            ? Math.round(
                  (data.reduce((sum, r) => sum + (parseFloat(r.percentage as any) || 0), 0) /
                      data.length) *
                      10
              ) / 10
            : 0;

    const getGradeBadge = (grade: string) => {
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
                    colors[grade] || 'bg-slate-100 text-slate-700'
                }`}
            >
                {grade}
            </span>
        );
    };

    const hasPagination =
        (results.last_page ?? 1) > 1 && Array.isArray(results.links) && results.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Results" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Trophy className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Exam Results & Tabulation
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Auto-calculate GPA, merit rankings, publish scorecards, and review student grades
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/results/tabulation?exam_id=${examId}&class_id=${classId}`}>
                            <Button
                                size="md"
                                variant="outline"
                                icon={<Award className="w-4 h-4 text-indigo-600" />}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                Tabulation Sheet
                            </Button>
                        </Link>
                        <Button
                            size="md"
                            variant="outline"
                            onClick={handleGenerate}
                            loading={isGenerating}
                            icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
                        >
                            Generate Results
                        </Button>
                        <Button
                            size="md"
                            onClick={handlePublish}
                            loading={isPublishing}
                            icon={<Send className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Publish Results
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Evaluated</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Trophy className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Students ranked</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pass Rate</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {data.length > 0 ? Math.round((passCount / data.length) * 100) : 0}%
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">{passCount} students passed</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Needs Attention</p>
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                <XCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{failCount}</p>
                        <p className="text-xs text-red-600 mt-1">Failed in one or more</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Performance</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{avgPercentage}%</p>
                        <p className="text-xs text-blue-600 mt-1">Cohort overall average</p>
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
                                handleFilter(e.target.value, classId);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">Select Examination</option>
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
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Merit / Rank</th>
                                    <th className="px-5 py-4 text-white font-bold">Student</th>
                                    <th className="px-5 py-4 text-white font-bold">Class & Exam</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Total Marks</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">GPA</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Grade</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((result, index) => (
                                        <tr
                                            key={result.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {index === 0 ? (
                                                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                                            1
                                                        </span>
                                                    ) : index === 1 ? (
                                                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                                                            2
                                                        </span>
                                                    ) : index === 2 ? (
                                                        <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                                                            3
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono text-xs text-slate-500">
                                                            #{result.rank || index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {result.student?.user?.name?.charAt(0).toUpperCase() || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {result.student?.user?.name || 'Student'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-mono">
                                                            Roll: {result.student?.roll_number || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {result.school_class?.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {result.exam?.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono text-sm font-bold text-slate-900">
                                                {result.total_marks}
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono text-sm font-bold text-emerald-700">
                                                {parseFloat(result.gpa as any).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {getGradeBadge(result.grade)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge
                                                    variant={result.status === 'pass' ? 'success' : 'danger'}
                                                    className="capitalize text-xs font-medium"
                                                >
                                                    {result.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a
                                                        href={`/results/${result.id}/print`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Print Marksheet"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </a>
                                                    <Link
                                                        href={`/results/${result.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View Scorecard"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                result.id,
                                                                result.student?.user?.name || 'Result'
                                                            )
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Result"
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
                                                    <Trophy className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No results tabulated</p>
                                                <p className="text-xs text-slate-500">
                                                    Select an Exam and Class above, then click &quot;Generate Results&quot; to auto-calculate GPA and rankings.
                                                </p>
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
                                links={results.links!}
                                from={results.from}
                                to={results.to}
                                total={results.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Result"
                message={`Are you sure you want to delete the result record for "${deleteModal.name}"?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
