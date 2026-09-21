import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import {
    Award,
    Plus,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    TrendingUp,
    BarChart2,
    Users,
    Edit3,
    Trash2,
    BookOpen,
    X,
} from 'lucide-react';

interface ModelTest {
    id: number;
    title: string;
    test_type: string;
    test_date: string;
    total_marks: number;
    pass_marks: number;
    duration_minutes?: number;
    status: 'upcoming' | 'completed' | 'published' | 'cancelled';
    highest_marks: number;
    average_marks: number;
    passed_count: number;
    failed_count: number;
    results_count: number;
    batch?: {
        id: number;
        name: string;
        course?: { name: string };
    };
    creator?: { name: string };
}

interface Batch {
    id: number;
    name: string;
    course?: { name: string };
}

interface Props {
    tests: {
        data: ModelTest[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    batches: Batch[];
    filters: {
        batch_id?: string | number;
        test_type?: string;
        status?: string;
        search?: string;
    };
    metrics: {
        total_tests: number;
        completed_tests: number;
        overall_average: number;
    };
}

const TEST_TYPES = [
    { value: 'weekly_test', label: 'Weekly Test' },
    { value: 'daily_quiz', label: 'Daily Quiz' },
    { value: 'model_test', label: 'Model Test' },
    { value: 'mock_exam', label: 'Mock Exam' },
    { value: 'monthly_test', label: 'Monthly Assessment' },
];

export default function Index({
    tests,
    batches,
    filters,
    metrics,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBatch, setSelectedBatch] = useState(filters.batch_id || '');
    const [selectedType, setSelectedType] = useState(filters.test_type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Create Modal
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_id: batches[0]?.id || '',
        title: '',
        test_type: 'weekly_test',
        test_date: new Date().toISOString().split('T')[0],
        total_marks: 50,
        pass_marks: 20,
        duration_minutes: 45,
        notes: '',
    });

    const handleFilterSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/model-tests', {
            search: search || undefined,
            batch_id: selectedBatch || undefined,
            test_type: selectedType || undefined,
            status: selectedStatus || undefined,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/model-tests', {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (testId: number, title: string) => {
        if (confirm(`Are you sure you want to delete '${title}' and all its student marks?`)) {
            router.delete(`/model-tests/${testId}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { bg: string; text: string; label: string }> = {
            upcoming: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Upcoming' },
            completed: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Completed' },
            published: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Published' },
            cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Cancelled' },
        };
        const s = map[status] || map.upcoming;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text}`}>
                {s.label}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const found = TEST_TYPES.find((t) => t.value === type);
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                {found?.label || type}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Coaching Model Tests & Merit Ranking" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                            <Award className="w-7 h-7 text-indigo-600" />
                            <span>Model Tests & Merit Ranking</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Conduct batch-wise weekly tests, enter marks quickly, and generate automated merit rank lists.
                        </p>
                    </div>

                    <Button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Model Test</span>
                    </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Total Tests Scheduled</span>
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-gray-900">{metrics.total_tests}</span>
                            <p className="text-xs text-gray-500 mt-1">Across all courses and batches</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Published / Evaluated</span>
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-emerald-700">{metrics.completed_tests}</span>
                            <p className="text-xs text-emerald-600 mt-1">With calculated merit lists</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Average Performance</span>
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-purple-700">{metrics.overall_average}</span>
                            <p className="text-xs text-purple-600 mt-1">Overall average score per assessment</p>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card>
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Search Title
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Chapter, Quiz title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Batch
                            </label>
                            <select
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Batches</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.course?.name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Test Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Types</option>
                                {TEST_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                                <option value="published">Published</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-1.5">
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Tests Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <th className="py-3 px-4">Test Title & Type</th>
                                    <th className="py-3 px-4">Batch & Course</th>
                                    <th className="py-3 px-4">Date & Time</th>
                                    <th className="py-3 px-4 text-center">Marks (Total / Pass)</th>
                                    <th className="py-3 px-4 text-center">Highest / Avg</th>
                                    <th className="py-3 px-4 text-center">Candidates</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {tests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-gray-400">
                                            No model tests found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    tests.data.map((test) => (
                                        <tr key={test.id} className="hover:bg-gray-50/80 transition">
                                            <td className="py-3.5 px-4">
                                                <Link
                                                    href={`/model-tests/${test.id}`}
                                                    className="font-bold text-gray-900 hover:text-indigo-600 transition block"
                                                >
                                                    {test.title}
                                                </Link>
                                                <div className="mt-1">{getTypeBadge(test.test_type)}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-gray-800">{test.batch?.name || 'Batch'}</div>
                                                <div className="text-xs text-gray-500">{test.batch?.course?.name}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600">
                                                <div>{test.test_date}</div>
                                                {test.duration_minutes && (
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{test.duration_minutes} mins</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="font-bold text-gray-900">{Number(test.total_marks)}</span>
                                                <span className="text-xs text-gray-400 block">Pass: {Number(test.pass_marks)}</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {Number(test.highest_marks) > 0 ? (
                                                    <div>
                                                        <span className="font-bold text-emerald-700">Top: {Number(test.highest_marks)}</span>
                                                        <span className="text-xs text-indigo-600 block">Avg: {Number(test.average_marks)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Not evaluated</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="font-semibold text-gray-800">{test.results_count}</span>
                                                <span className="text-xs text-gray-400 block">enrolled</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {getStatusBadge(test.status)}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={`/model-tests/${test.id}/marks`}
                                                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                                                        title="Enter Marks"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/model-tests/${test.id}`}
                                                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition"
                                                        title="View Merit List"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(test.id, test.title)}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                                                        title="Delete Test"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Schedule Test Modal */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Schedule Model Test / Quiz</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Configure test title, batch, marks, and timing
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Batch & Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Target Batch *
                            </label>
                            <select
                                value={data.batch_id}
                                onChange={(e) => setData('batch_id', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.course?.name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Test Type *
                            </label>
                            <select
                                value={data.test_type}
                                onChange={(e) => setData('test_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                {TEST_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Test Title / Topic *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Physics Chapter 3 Motion Weekly Test"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Date & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Test Date *
                            </label>
                            <input
                                type="date"
                                value={data.test_date}
                                onChange={(e) => setData('test_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Duration (Minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                placeholder="45"
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Marks Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Total Marks *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.total_marks}
                                onChange={(e) => setData('total_marks', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Pass Marks *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.pass_marks}
                                onChange={(e) => setData('pass_marks', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Syllabus / Notes
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Specific syllabus topics, question structure, or instructions..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{processing ? 'Creating...' : 'Create & Enroll Students'}</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
