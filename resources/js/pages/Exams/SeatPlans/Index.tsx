import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import {
    LayoutGrid,
    Plus,
    Trash2,
    Building,
    BookOpen,
    Users,
    Search,
    Sparkles,
    Printer,
    CheckCircle2,
    Calendar,
    ArrowRight,
} from 'lucide-react';

interface Student {
    id: number;
    roll_number?: string | number;
    user?: { name: string };
}

interface ExamHall {
    id: number;
    name: string;
    capacity: number;
    code?: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Exam {
    id: number;
    name: string;
}

interface ExamSeatPlan {
    id: number;
    exam_id: number;
    student_id: number;
    class_id: number;
    hall_id: number;
    seat_number: number;
    row_number?: number;
    column_number?: number;
    student?: Student;
    exam?: Exam;
    exam_hall?: ExamHall;
    school_class?: SchoolClass;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    seatPlans: {
        data: ExamSeatPlan[];
        current_page?: number;
        last_page?: number;
        total?: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { exam_id?: string; hall_id?: string };
    exams: Exam[];
    halls: ExamHall[];
    classes?: SchoolClass[];
}

export default function Index({
    seatPlans,
    filters,
    exams = [],
    halls = [],
    classes = [],
}: IndexProps) {
    const [examId, setExamId] = useState(filters?.exam_id || (exams[0]?.id?.toString() || ''));
    const [hallId, setHallId] = useState(filters?.hall_id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateErrors, setGenerateErrors] = useState<Record<string, string>>({});
    const [generateForm, setGenerateForm] = useState({
        exam_id: exams[0]?.id?.toString() || '',
        class_id: classes[0]?.id?.toString() || '',
        hall_id: halls[0]?.id?.toString() || '',
        starting_seat_number: '1',
    });

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilter = (newExamId: string, newHallId: string) => {
        router.get(
            '/exam-seat-plans',
            { exam_id: newExamId, hall_id: newHallId },
            { preserveState: true }
        );
    };

    const handleGenerateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        router.post('/exam-seat-plans/generate', generateForm, {
            onError: (errs) => {
                setGenerateErrors(errs as Record<string, string>);
                setIsGenerating(false);
            },
            onSuccess: () => {
                setIsGenerating(false);
                setShowGenerateModal(false);
            },
        });
    };

    const handleClearPlans = () => {
        if (!examId) {
            alert('Please select an exam first to clear its seat plans.');
            return;
        }
        if (confirm('Are you sure you want to clear the generated seat plan for this exam?')) {
            router.post('/exam-seat-plans/clear', { exam_id: examId });
        }
    };

    const handleDeleteClick = (id: number, seatNum: number) => {
        setDeleteModal({ isOpen: true, id, name: `Seat #${seatNum}` });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/exam-seat-plans/${deleteModal.id}`, {
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

    const data = seatPlans.data ?? [];
    const filteredData = data.filter((sp) => {
        const query = searchTerm.toLowerCase();
        const studentName = sp.student?.user?.name?.toLowerCase() || '';
        const rollStr = sp.student?.roll_number?.toString() || '';
        const seatStr = sp.seat_number.toString();
        return (
            !searchTerm ||
            studentName.includes(query) ||
            rollStr.includes(query) ||
            seatStr.includes(query)
        );
    });

    const totalAllocated = seatPlans.total ?? data.length;
    const uniqueClassesCount = new Set(data.map((sp) => sp.class_id)).size;
    const uniqueHallsCount = new Set(data.map((sp) => sp.hall_id)).size;

    const hasPagination =
        (seatPlans.last_page ?? 1) > 1 &&
        Array.isArray(seatPlans.links) &&
        seatPlans.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Seat Plans" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <LayoutGrid className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Seat Plans & Bench Slips
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Auto-generate examination bench allocations, print admit slips, and manage hall rosters
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.length > 0 && (
                            <>
                                <Button
                                    size="md"
                                    variant="outline"
                                    onClick={handlePrint}
                                    icon={<Printer className="w-4 h-4" />}
                                >
                                    Print Bench Cards
                                </Button>
                                <Button
                                    size="md"
                                    variant="ghost"
                                    onClick={handleClearPlans}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    icon={<Trash2 className="w-4 h-4" />}
                                >
                                    Clear Plan
                                </Button>
                            </>
                        )}
                        <Button
                            size="md"
                            onClick={() => setShowGenerateModal(true)}
                            icon={<Sparkles className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Auto-Generate Seats
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Seats</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <LayoutGrid className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalAllocated}</p>
                        <p className="text-xs text-slate-500 mt-1">Students arranged</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Halls Utilized</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Building className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{uniqueHallsCount || halls.length}</p>
                        <p className="text-xs text-blue-600 mt-1">Active exam venues</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Classes Arranged</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{uniqueClassesCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Cohorts seated</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {data.length > 0 ? 'Arranged' : 'Empty'}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">Ready for examination</p>
                    </div>
                </div>

                {/* Filters and View Switcher */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by student, roll number, or seat..."
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
                                handleFilter(e.target.value, hallId);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">Select Exam</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={hallId}
                            onChange={(e) => {
                                setHallId(e.target.value);
                                handleFilter(examId, e.target.value);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Halls</option>
                            {halls.map((hall) => (
                                <option key={hall.id} value={hall.id}>
                                    {hall.name} ({hall.capacity} seats)
                                </option>
                            ))}
                        </select>

                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 text-xs font-medium text-slate-600">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Grid Cards
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content: Grid or Table */}
                {filteredData.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                            {filteredData.map((sp) => (
                                <div
                                    key={sp.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all relative group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center border border-emerald-200/60">
                                            #{sp.seat_number}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {sp.exam_hall?.name || 'Hall'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {sp.student?.user?.name || 'Student'}
                                    </p>
                                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                        <span className="font-mono">Roll: {sp.student?.roll_number || 'N/A'}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                                            {sp.school_class?.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteClick(sp.id, sp.seat_number)}
                                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Seat"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                        <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                            <th className="px-5 py-4 text-white font-bold">Seat No</th>
                                            <th className="px-5 py-4 text-white font-bold">Student Name</th>
                                            <th className="px-5 py-4 text-white font-bold">Roll Number</th>
                                            <th className="px-5 py-4 text-white font-bold">Class / Grade</th>
                                            <th className="px-5 py-4 text-white font-bold">Hall Venue</th>
                                            <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredData.map((sp) => (
                                            <tr
                                                key={sp.id}
                                                className="hover:bg-emerald-50/30 transition-colors group"
                                            >
                                                <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                                                        Seat #{sp.seat_number}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {sp.student?.user?.name || 'Student'}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 font-mono text-xs text-slate-600">
                                                    {sp.student?.roll_number || 'N/A'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                        {sp.school_class?.name}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-600">
                                                    {sp.exam_hall?.name}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(sp.id, sp.seat_number)
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Seat"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <p className="text-base font-semibold text-slate-800">No seat plans generated</p>
                            <p className="text-xs text-slate-500">
                                Click &quot;Auto-Generate Seats&quot; to automatically arrange student benches by class, roll number, and exam hall.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setShowGenerateModal(true)}
                                icon={<Sparkles className="w-4 h-4" />}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                Auto-Generate Seats Now
                            </Button>
                        </div>
                    </div>
                )}

                {hasPagination && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                        <IndexPagination
                            links={seatPlans.links!}
                            from={seatPlans.from}
                            to={seatPlans.to}
                            total={seatPlans.total}
                        />
                    </div>
                )}
            </div>

            {/* Auto-Generation Modal */}
            <Modal
                show={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                title="Auto-Generate Examination Seat Plan"
                maxWidth="lg"
            >
                <form onSubmit={handleGenerateSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Automatically allocates sequential bench numbers for all active students in the selected class.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Examination <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={generateForm.exam_id}
                            onChange={(e) =>
                                setGenerateForm({ ...generateForm, exam_id: e.target.value })
                            }
                            required
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                        >
                            <option value="">Select Exam</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>
                        {generateErrors.exam_id && (
                            <p className="text-xs text-red-600 mt-1">{generateErrors.exam_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Target Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={generateForm.class_id}
                            onChange={(e) =>
                                setGenerateForm({ ...generateForm, class_id: e.target.value })
                            }
                            required
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                        {generateErrors.class_id && (
                            <p className="text-xs text-red-600 mt-1">{generateErrors.class_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Exam Hall / Room <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={generateForm.hall_id}
                            onChange={(e) =>
                                setGenerateForm({ ...generateForm, hall_id: e.target.value })
                            }
                            required
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                        >
                            <option value="">Select Hall</option>
                            {halls.map((hall) => (
                                <option key={hall.id} value={hall.id}>
                                    {hall.name} ({hall.capacity} capacity)
                                </option>
                            ))}
                        </select>
                        {generateErrors.hall_id && (
                            <p className="text-xs text-red-600 mt-1">{generateErrors.hall_id}</p>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Starting Seat Number"
                            type="number"
                            min="1"
                            value={generateForm.starting_seat_number}
                            onChange={(e) =>
                                setGenerateForm({
                                    ...generateForm,
                                    starting_seat_number: e.target.value,
                                })
                            }
                            error={generateErrors.starting_seat_number}
                            required
                            placeholder="1"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            Use 1 for the first hall, or continue sequence (e.g. 51, 101) for subsequent halls
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowGenerateModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isGenerating}
                            icon={<Sparkles className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Generate Plan
                        </Button>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Remove Seat Assignment"
                message={`Are you sure you want to remove ${deleteModal.name}?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
