import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import {
    ArrowLeft, Edit, BookOpen, Package, Calendar, DollarSign,
    MapPin, User, Clock, CheckCircle2, XCircle, AlertTriangle,
    Bookmark, History
} from 'lucide-react';
import { Book } from '@/types/library';

interface ShowProps {
    book: Book;
}

export default function Show({ book }: ShowProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const total = book.total_copies ?? book.quantity ?? 0;
    const avail = book.available_copies ?? book.available_quantity ?? 0;
    const borrowed = Math.max(0, total - avail);
    const pct = total > 0 ? Math.round((avail / total) * 100) : 0;

    return (
        <AuthenticatedLayout>
            <Head title={`Book - ${book.title}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <BookOpen className="w-3.5 h-3.5" />
                                Book Details
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                                ISBN: {book.isbn}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                            {book.title}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Written by {book.author}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={`/books/${book.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-xs"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Book
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.visit('/books')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Copies</span>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{total}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Procured volume</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</span>
                        <p className="text-2xl font-bold text-emerald-700 mt-2">{avail}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{pct}% in shelf</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrowed</span>
                        <p className="text-2xl font-bold text-amber-700 mt-2">{borrowed}</p>
                        <p className="text-xs text-slate-500 mt-0.5">With students / teachers</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Price</span>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {book.price ? `৳${parseFloat(book.price.toString()).toFixed(2)}` : 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Acquisition value</p>
                    </div>
                </div>

                {/* Bibliographic Info Grid */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        Bibliographic & Catalog Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</span>
                            <p className="font-semibold text-slate-800">{book.category}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Publisher</span>
                            <p className="font-semibold text-slate-800">{book.publisher || 'Not Specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Publication Year</span>
                            <p className="font-semibold text-slate-800">{book.publication_year || 'Not Specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shelf Location</span>
                            <p className="font-semibold text-emerald-700">{book.shelf_location || 'Not Assigned'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog Status</span>
                            <p className="capitalize font-semibold text-slate-800">{book.status}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accession / ISBN</span>
                            <p className="font-mono text-xs font-bold text-slate-800">{book.isbn}</p>
                        </div>
                    </div>

                    {book.description && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                                Description & Summary
                            </span>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                {book.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Circulation History Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-bold text-slate-900">Borrowing & Circulation History</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {book.issues?.length || 0} Total Records
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Borrower</th>
                                    <th className="px-5 py-4 text-white font-bold">Role</th>
                                    <th className="px-5 py-4 text-white font-bold">Issue Date</th>
                                    <th className="px-5 py-4 text-white font-bold">Due Date</th>
                                    <th className="px-5 py-4 text-white font-bold">Return Date</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {book.issues && book.issues.length > 0 ? (
                                    book.issues.map((issue) => {
                                        const borrowerName = issue.student?.user?.name || issue.teacher?.user?.name || 'Unknown';
                                        const borrowerRole = issue.student ? 'Student' : 'Teacher';

                                        return (
                                            <tr key={issue.id} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-5 py-4 font-semibold text-slate-800 text-sm">
                                                    {borrowerName}
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-500">
                                                    {borrowerRole}
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-700">
                                                    {formatDate(issue.issue_date)}
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-700">
                                                    {formatDate(issue.due_date)}
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-700">
                                                    {issue.return_date ? formatDate(issue.return_date) : '—'}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                                                            issue.status === 'returned'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : issue.status === 'issued'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                    >
                                                        {issue.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                                            No borrowing history recorded yet for this book.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
