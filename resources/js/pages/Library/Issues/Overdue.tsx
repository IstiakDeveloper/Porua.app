import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import {
    ArrowLeft, BookOpen, AlertTriangle, Eye, DollarSign,
    Clock, User, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { BookIssue, PaginatedData } from '@/types/library';

interface OverdueProps {
    issues: PaginatedData<BookIssue>;
}

export default function Overdue({ issues }: OverdueProps) {
    const calculateFine = (dueDate: string, finePerDay: number = 2) => {
        const days = Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, days * finePerDay);
    };

    const calculateDaysOverdue = (dueDate: string) => {
        const days = Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, days);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const totalOverdue = issues.data.length;
    const totalFines = issues.data.reduce((sum, issue) => sum + calculateFine(issue.due_date), 0);

    return (
        <AuthenticatedLayout>
            <Head title="Overdue Books" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Circulation Alert
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                            Overdue Books & Fines
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Books that have passed their designated return deadline and accrued late return fines
                        </p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => router.visit('/book-issues')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to All Issues
                        </button>
                    </div>
                </div>

                {/* Overdue KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Overdue</span>
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-rose-600 mt-2">{totalOverdue}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Pending return from borrowers</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accrued Late Fines</span>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-700 mt-2">৳{totalFines.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Calculated at standard rate</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fine Rate Standard</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">৳2.00 / day</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Institutional fine rule</p>
                    </div>
                </div>

                {/* Overdue Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Book Title & ISBN</th>
                                    <th className="px-5 py-4 text-white font-bold">Borrower Details</th>
                                    <th className="px-5 py-4 text-white font-bold">Issue Date</th>
                                    <th className="px-5 py-4 text-white font-bold">Due Date</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Days Late</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Estimated Fine</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {issues.data.length > 0 ? (
                                    issues.data.map((issue) => {
                                        const borrowerName = issue.student?.user?.name || issue.teacher?.user?.name || 'Unknown';
                                        const borrowerRole = issue.student ? 'Student' : 'Teacher';
                                        const borrowerId = issue.student?.admission_number || issue.teacher?.employee_id || '';
                                        const daysLate = calculateDaysOverdue(issue.due_date);
                                        const fine = calculateFine(issue.due_date);

                                        return (
                                            <tr key={issue.id} className="hover:bg-rose-50/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{issue.book?.title}</p>
                                                            <p className="text-xs text-slate-500 font-mono">ISBN: {issue.book?.isbn}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                                            {borrowerName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{borrowerName}</p>
                                                            <p className="text-xs text-slate-500">{borrowerRole} {borrowerId && `• ${borrowerId}`}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-700">
                                                    {formatDate(issue.issue_date)}
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-rose-600">
                                                    {formatDate(issue.due_date)}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                        {daysLate} Days
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-sm text-slate-900">
                                                    ৳{fine.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        href={`/book-issues/${issue.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Process Return
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-500">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            Great news! There are no overdue books at this moment.
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
