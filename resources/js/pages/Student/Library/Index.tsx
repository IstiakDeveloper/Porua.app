import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    AlertTriangle,
    Calendar,
    Clock,
    Search,
    CheckCircle2,
    BookMarked,
    DollarSign
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface IssuedBook {
    id: number;
    book_title: string;
    book_author: string;
    isbn: string;
    accession_number: string;
    issue_date: string;
    due_date: string;
    return_date: string | null;
    fine_amount: number;
    status: string;
    is_overdue: boolean;
    days_overdue: number;
}

interface Props {
    student: Student;
    issuedBooks: IssuedBook[];
    summary: {
        currently_issued: number;
        total_returned: number;
        overdue_count: number;
        total_fines: number;
    };
}

export default function Index({ student, issuedBooks = [], summary }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'returned'>('all');

    const filteredBooks = issuedBooks.filter(book => {
        const matchesSearch =
            book.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.book_author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;
        if (statusFilter === 'issued') return book.status === 'issued';
        if (statusFilter === 'returned') return book.status === 'returned';
        return true;
    });

    const getStatusBadge = (book: IssuedBook) => {
        if (book.status === 'returned') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Returned
                </span>
            );
        }

        if (book.is_overdue) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue ({book.days_overdue}d)
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Clock className="w-3 h-3" />
                Issued
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Library - My Books" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Library - Borrowed Books"
                    subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number}`}
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `${summary.currently_issued} Books in Hand`, variant: 'neutral' },
                        { label: summary.overdue_count > 0 ? `${summary.overdue_count} Overdue` : 'Zero Overdue', variant: summary.overdue_count > 0 ? 'neutral' : 'success' }
                    ]}
                />

                {/* 2. FOUR HIGH-DENSITY METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">Currently Issued</span>
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">{summary.currently_issued}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Active borrow quota</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-emerald-600">Total Returned</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 tracking-tight">{summary.total_returned}</div>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Returned safely</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-rose-600">Overdue Books</span>
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold text-rose-700 tracking-tight">{summary.overdue_count}</div>
                        <p className="text-[11px] text-rose-600 mt-0.5">Requires immediate return</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-amber-600">Overdue Fines</span>
                            <DollarSign className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-700 tracking-tight">৳{summary.total_fines}</div>
                        <p className="text-[11px] text-amber-600 mt-0.5">Pending fine balance</p>
                    </div>
                </div>

                {/* 3. SEARCH & FILTER CONTROLS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search book title, author, ISBN..."
                            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                statusFilter === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All ({issuedBooks.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('issued')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                statusFilter === 'issued'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Issued ({summary.currently_issued})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('returned')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                statusFilter === 'returned'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Returned ({summary.total_returned})
                        </button>
                    </div>
                </div>

                {/* 4. DUAL VIEW: MOBILE CARDS & DESKTOP HIGH-DENSITY TABLE */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {filteredBooks && filteredBooks.length > 0 ? (
                        <>
                            {/* Mobile Card Feed */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredBooks.map((book) => (
                                    <div key={book.id} className="p-3.5 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">{book.book_title}</h4>
                                                <p className="text-[11px] text-slate-500">Author: {book.book_author}</p>
                                            </div>
                                            {getStatusBadge(book)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600">
                                            <div><span className="text-slate-400 block">Issued</span><strong>{book.issue_date}</strong></div>
                                            <div><span className="text-slate-400 block">Due Date</span><strong>{book.due_date}</strong></div>
                                        </div>

                                        {book.fine_amount > 0 && (
                                            <p className="text-xs font-bold text-rose-600">
                                                Fine: ৳{book.fine_amount}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Book Title</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acc / ISBN</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Issue Date</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Fine</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredBooks.map((book) => (
                                            <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{book.book_title}</td>
                                                <td className="px-4 py-3 text-slate-600">{book.book_author}</td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{book.accession_number || book.isbn || '—'}</td>
                                                <td className="px-4 py-3 text-slate-600">{book.issue_date}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{book.due_date}</td>
                                                <td className="px-4 py-3">{getStatusBadge(book)}</td>
                                                <td className="px-4 py-3 text-right font-mono font-bold">
                                                    {book.fine_amount > 0 ? (
                                                        <span className="text-rose-600">৳{book.fine_amount}</span>
                                                    ) : (
                                                        <span className="text-slate-400">৳0</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No books found matching criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
