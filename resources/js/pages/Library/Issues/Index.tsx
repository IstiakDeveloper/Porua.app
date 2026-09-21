import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus, Eye, Trash2, BookOpen, Filter, CheckCircle2,
    Clock, AlertTriangle, Bookmark, User, Calendar,
    Library, ArrowUpRight
} from 'lucide-react';
import { BookIssue, PaginatedData, BookIssueFilters } from '@/types/library';

interface IndexProps {
    issues: PaginatedData<BookIssue>;
    filters?: BookIssueFilters;
}

export default function Index({ issues, filters }: IndexProps) {
    const [status, setStatus] = useState(filters?.status || '');
    const [borrowerType, setBorrowerType] = useState(filters?.borrower_type || '');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/book-issues/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null });
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, id: null });
    };

    const handleFilter = () => {
        router.get('/book-issues', {
            status,
            borrower_type: borrowerType
        }, { preserveState: true });
    };

    const handleReset = () => {
        setStatus('');
        setBorrowerType('');
        router.get('/book-issues');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const issuedCount = issues.data.filter(i => i.status === 'issued').length;
    const returnedCount = issues.data.filter(i => i.status === 'returned').length;
    const overdueCount = issues.data.filter(i => {
        if (i.status === 'issued') {
            return new Date(i.due_date) < new Date();
        }
        return false;
    }).length;

    return (
        <AuthenticatedLayout>
            <Head title="Book Issues & Returns" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Library className="w-3.5 h-3.5" />
                                Library Management
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                            Book Issues & Returns
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Track circulation, student borrowings, returns, and overdue deadlines
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <Link
                            href="/book-issues/overdue"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 text-rose-700 text-xs sm:text-sm font-semibold hover:bg-rose-100/70 transition-all shadow-xs"
                        >
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            Overdue Books
                            {overdueCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                                    {overdueCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/book-issues/create"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <Plus className="w-4 h-4 shrink-0" />
                            Issue Book
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Issues</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <Bookmark className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{issues.total || issues.data.length}</p>
                        <p className="text-xs text-slate-500 mt-0.5">All time records</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently Borrowed</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 mt-2">{issuedCount}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Active issues</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Returned Books</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mt-2">{returnedCount}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Back on shelves</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-rose-600 mt-2">{overdueCount}</p>
                        <p className="text-xs text-rose-600 mt-0.5">Past due date</p>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Statuses</option>
                            <option value="issued">Currently Issued</option>
                            <option value="returned">Returned</option>
                            <option value="overdue">Overdue</option>
                        </select>

                        <select
                            value={borrowerType}
                            onChange={(e) => setBorrowerType(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Borrower Types</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleFilter}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </button>
                        {(status || borrowerType) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold transition-all hover:bg-slate-100"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Table & Mobile Card Feed */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Mobile Card Feed (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {issues.data.length > 0 ? (
                            issues.data.map((issue) => {
                                const borrowerName = issue.student?.user?.name || issue.teacher?.user?.name || 'Unknown';
                                const borrowerRole = issue.student ? 'Student' : 'Teacher';
                                const borrowerId = issue.student?.admission_number || issue.teacher?.employee_id || '';
                                const isOverdue = issue.status === 'issued' && new Date(issue.due_date) < new Date();

                                return (
                                    <div key={issue.id} className="p-4 space-y-3 active:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <Link
                                                    href={`/book-issues/${issue.id}`}
                                                    className="font-bold text-sm text-slate-900 hover:text-emerald-600 line-clamp-1"
                                                >
                                                    {issue.book?.title}
                                                </Link>
                                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                    ISBN: {issue.book?.isbn}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${
                                                    issue.status === 'returned'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : isOverdue
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}
                                            >
                                                {isOverdue && issue.status === 'issued' ? 'Overdue' : issue.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                                    {borrowerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-xs">{borrowerName}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{borrowerRole} {borrowerId ? `• ${borrowerId}` : ''}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400">Due Date</p>
                                                <p className={`text-xs font-mono font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                                                    {formatDate(issue.due_date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                                            <span className="text-slate-400 font-mono">Issued: {formatDate(issue.issue_date)}</span>
                                            <Link
                                                href={`/book-issues/${issue.id}`}
                                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View / Return
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-medium">No book issue records found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Book Title & ISBN</th>
                                    <th className="px-5 py-4 text-white font-bold">Borrower</th>
                                    <th className="px-5 py-4 text-white font-bold">Issue Date</th>
                                    <th className="px-5 py-4 text-white font-bold">Due Date</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {issues.data.length > 0 ? (
                                    issues.data.map((issue) => {
                                        const borrowerName = issue.student?.user?.name || issue.teacher?.user?.name || 'Unknown';
                                        const borrowerRole = issue.student ? 'Student' : 'Teacher';
                                        const borrowerId = issue.student?.admission_number || issue.teacher?.employee_id || '';
                                        const isOverdue = issue.status === 'issued' && new Date(issue.due_date) < new Date();

                                        return (
                                            <tr key={issue.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/book-issues/${issue.id}`}
                                                                className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                                                            >
                                                                {issue.book?.title}
                                                            </Link>
                                                            <p className="text-xs text-slate-500 font-mono">
                                                                ISBN: {issue.book?.isbn}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                                            {borrowerName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{borrowerName}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {borrowerRole} {borrowerId && `• ${borrowerId}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-700">
                                                    {formatDate(issue.issue_date)}
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium">
                                                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                                                        {formatDate(issue.due_date)}
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="block text-[10px] text-rose-500 font-bold">⚠️ OVERDUE</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                                                            issue.status === 'returned'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : isOverdue
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}
                                                    >
                                                        {isOverdue && issue.status === 'issued' ? 'Overdue' : issue.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                                                        <Link
                                                            href={`/book-issues/${issue.id}`}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                                                            title="Details & Return"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(issue.id)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                            title="Delete Record"
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
                                        <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                                            No book issue records found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {issues.last_page > 1 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Showing page {issues.current_page} of {issues.last_page} ({issues.total} total)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.get('/book-issues', { ...filters, page: issues.current_page - 1 })}
                                disabled={issues.current_page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.get('/book-issues', { ...filters, page: issues.current_page + 1 })}
                                disabled={issues.current_page === issues.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Issue Record"
                message="Are you sure you want to delete this issue record? This action cannot be undone."
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
