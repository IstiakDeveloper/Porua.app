import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormCard from '@/Components/FormCard';
import {
    ArrowLeft, BookOpen, User, Calendar, DollarSign,
    CheckCircle2, Clock, AlertTriangle, ShieldCheck,
    Bookmark
} from 'lucide-react';
import { BookIssue } from '@/types/library';

interface ShowProps {
    issue: BookIssue;
}

export default function Show({ issue }: ShowProps) {
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isOverdue = issue.status === 'issued' && new Date(issue.due_date) < new Date();
    const daysOverdue = isOverdue
        ? Math.floor((new Date().getTime() - new Date(issue.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const defaultFine = daysOverdue > 0 ? (daysOverdue * 2).toFixed(2) : '0';

    const [returnData, setReturnData] = useState({
        return_date: new Date().toISOString().split('T')[0],
        fine_amount: defaultFine,
        condition: 'good' as 'good' | 'damaged' | 'lost',
        return_remarks: '',
    });

    const handleReturn = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/book-issues/${issue.id}/return`, returnData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setShowReturnForm(false);
            },
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const borrowerName = issue.student?.user?.name || issue.teacher?.user?.name || 'Unknown';
    const borrowerRole = issue.student ? 'Student' : 'Teacher';
    const borrowerId = issue.student?.admission_number || issue.teacher?.employee_id || '';

    return (
        <AuthenticatedLayout>
            <Head title={`Issue Details - ${issue.book?.title}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Bookmark className="w-3.5 h-3.5" />
                                Circulation Record #{issue.id}
                            </span>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize border ${
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                            Book Circulation File
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Lending tracking for {issue.book?.title}
                        </p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => router.visit('/book-issues')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Issues
                        </button>
                    </div>
                </div>

                {/* Overdue Warning Alert if applicable */}
                {isOverdue && issue.status === 'issued' && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-900">Book Return is Past Due</h4>
                                <p className="text-xs text-rose-700">
                                    This book is {daysOverdue} days overdue. Standard late fine calculated at ৳{defaultFine}.
                                </p>
                            </div>
                        </div>
                        {!showReturnForm && (
                            <button
                                type="button"
                                onClick={() => setShowReturnForm(true)}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                            >
                                Process Return Now
                            </button>
                        )}
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Book Information */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 text-emerald-700 font-bold text-sm">
                            <BookOpen className="w-4 h-4" />
                            Book Information
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Title</span>
                                <Link
                                    href={`/books/${issue.book_id}`}
                                    className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                                >
                                    {issue.book?.title}
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Author</span>
                                    <p className="font-medium text-slate-700">{issue.book?.author}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">ISBN</span>
                                    <p className="font-mono text-xs font-bold text-slate-800">{issue.book?.isbn}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Category & Location</span>
                                <p className="text-xs text-slate-600">
                                    {issue.book?.category} • Shelf: {issue.book?.shelf_location || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Borrower Information */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 text-blue-700 font-bold text-sm">
                            <User className="w-4 h-4" />
                            Borrower Details
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Name</span>
                                <p className="font-bold text-slate-900">{borrowerName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Role</span>
                                    <p className="font-medium text-slate-700">{borrowerRole}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">ID Number</span>
                                    <p className="font-mono text-xs font-bold text-slate-800">{borrowerId || '—'}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Issued By</span>
                                <p className="text-xs text-slate-600">
                                    {issue.issuer?.name || 'Administrator'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule & Return Status */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            Circulation Schedule
                        </div>
                        {issue.status === 'issued' && !showReturnForm && (
                            <button
                                type="button"
                                onClick={() => setShowReturnForm(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Return Book
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Issue Date</span>
                            <p className="font-bold text-slate-800 mt-1">{formatDate(issue.issue_date)}</p>
                        </div>
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Due Date</span>
                            <p className={`font-bold mt-1 ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                {formatDate(issue.due_date)}
                            </p>
                        </div>
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Returned On</span>
                            <p className="font-bold text-emerald-700 mt-1">
                                {issue.return_date ? formatDate(issue.return_date) : 'Not Returned'}
                            </p>
                        </div>
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Late Fine Paid</span>
                            <p className="font-bold text-slate-800 mt-1">
                                {issue.fine_amount ? `৳${parseFloat(issue.fine_amount.toString()).toFixed(2)}` : '৳0.00'}
                            </p>
                        </div>
                    </div>

                    {issue.remarks && (
                        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Remarks:</span> {issue.remarks}
                        </div>
                    )}
                </div>

                {/* Return Form Modal/Card */}
                {showReturnForm && issue.status === 'issued' && (
                    <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-6 shadow-sm animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Receive Book Return</h3>
                                <p className="text-xs text-slate-500">
                                    Record condition inspection, collect any fine, and return copy to library stock
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReturnForm(false)}
                                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>

                        <form onSubmit={handleReturn} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Return Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={returnData.return_date}
                                        onChange={(e) => setReturnData({ ...returnData, return_date: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Book Condition
                                    </label>
                                    <select
                                        value={returnData.condition}
                                        onChange={(e) => setReturnData({ ...returnData, condition: e.target.value as any })}
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="good">Good / Intact</option>
                                        <option value="damaged">Damaged / Torn Pages</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Fine Collected (BDT)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={returnData.fine_amount}
                                        onChange={(e) => setReturnData({ ...returnData, fine_amount: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Return Inspection Notes
                                </label>
                                <input
                                    type="text"
                                    value={returnData.return_remarks}
                                    onChange={(e) => setReturnData({ ...returnData, return_remarks: e.target.value })}
                                    placeholder="Optional note regarding condition or waiver..."
                                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReturnForm(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {isSubmitting ? 'Processing...' : 'Confirm Return & Restore Stock'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
