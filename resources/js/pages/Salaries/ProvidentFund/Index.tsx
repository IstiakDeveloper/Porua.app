import React, { useState, useRef } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, router } from '@inertiajs/react';
import { useReactToPrint } from 'react-to-print';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import IndexPagination from '@/Components/IndexPagination';
import PrintProvidentFundIndex from './PrintProvidentFundIndex';
import { Search, Wallet, TrendingUp, Users, Calendar, DollarSign, Eye, Printer } from 'lucide-react';

function route(name: string, params?: any): string {
    if (name === 'provident-fund.index') return '/provident-fund';
    if (name === 'provident-fund.show' && params) return `/provident-fund/${params}`;
    return '/provident-fund';
}

interface Teacher {
    id: number;
    user: { name: string };
    employee_id: string;
    first_name: string;
    last_name: string;
    total_employee_pf: number;
    total_employer_pf: number;
    total_pf: number;
    total_withdrawn: number;
    last_contribution_date: string | null;
    contribution_count: number;
}

interface Summary {
    total_employee_contribution: number;
    total_employer_contribution: number;
    total_contributions: number;
    total_withdrawn: number;
    total_pf_balance: number;
    total_teachers: number;
    total_transactions: number;
}

interface ProvidentFundIndexProps {
    teacherSummary: {
        data: Teacher[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
    allTeachers: { id: number; name: string; employee_id: string }[];
    filters: {
        search?: string;
        teacher_id?: number;
        from_date?: string;
        to_date?: string;
    };
}

export default function Index({ teacherSummary, summary, allTeachers, filters }: ProvidentFundIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [teacherId, setTeacherId] = useState(filters.teacher_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Provident_Fund_Ledger_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('provident-fund.index'), {
            search,
            teacher_id: teacherId,
            from_date: fromDate,
            to_date: toDate
        }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setTeacherId('');
        setFromDate('');
        setToDate('');
        router.get(route('provident-fund.index'), {}, { preserveState: true });
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Provident Fund Ledger" />

            {/* Hidden Print Component */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <PrintProvidentFundIndex ref={printRef} teachers={teacherSummary.data} summary={summary} />
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            <Wallet className="h-6 w-6" />
                            Provident Fund Ledger
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">View teacher PF contributions and balances</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-50 active:scale-95 transition-all duration-200 text-sm font-semibold shadow-sm shadow-emerald-500/5"
                    >
                        <Printer className="w-4 h-4" />
                        Print Ledger
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-emerald-100/80 rounded-xl p-5 shadow-sm shadow-emerald-500/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-800/70 uppercase tracking-wider">Employee Share (5%)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1.5">
                                ৳{formatAmount(summary.total_employee_contribution)}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white border border-emerald-100/80 rounded-xl p-5 shadow-sm shadow-emerald-500/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-800/70 uppercase tracking-wider">Employer Share (5%)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1.5">
                                ৳{formatAmount(summary.total_employer_contribution)}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white border border-emerald-100/80 rounded-xl p-5 shadow-sm shadow-emerald-500/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-800/70 uppercase tracking-wider">Total Withdrawn</p>
                            <p className="text-2xl font-bold text-red-600 mt-1.5">
                                ৳{formatAmount(summary.total_withdrawn)}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white border border-emerald-100/80 rounded-xl p-5 shadow-sm shadow-emerald-500/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-800/70 uppercase tracking-wider">Available Balance</p>
                            <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">
                                ৳{formatAmount(summary.total_pf_balance)}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/10">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-lg border border-emerald-100 p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold text-emerald-800/70 uppercase tracking-wider mb-2">Search Name/ID</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                    <Input
                                        type="text"
                                        placeholder="Name or Employee ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 w-full text-sm"
                                    />
                                </div>
                            </div>

                            {/* Teacher Filter */}
                            <div>
                                <label className="block text-xs font-semibold text-emerald-800/70 uppercase tracking-wider mb-2">Select Teacher</label>
                                <select
                                    value={teacherId}
                                    onChange={(e) => setTeacherId(e.target.value)}
                                    className="w-full text-sm bg-white"
                                >
                                    <option value="">All Teachers</option>
                                    {allTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name} ({teacher.employee_id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* From Date */}
                            <div>
                                <label className="block text-xs font-semibold text-emerald-800/70 uppercase tracking-wider mb-2">From Date</label>
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full text-sm"
                                />
                            </div>

                            {/* To Date */}
                            <div>
                                <label className="block text-xs font-semibold text-emerald-800/70 uppercase tracking-wider mb-2">To Date</label>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full text-sm"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm shadow-emerald-600/10"
                            >
                                Apply Filters
                            </button>
                            {(search || teacherId || fromDate || toDate) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Teacher PF Table */}
                <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm shadow-emerald-500/5">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left">Teacher</th>
                                    <th className="px-6 py-4 text-right">Employee PF</th>
                                    <th className="px-6 py-4 text-right">Employer PF</th>
                                    <th className="px-6 py-4 text-right">Withdrawn</th>
                                    <th className="px-6 py-4 text-right">Current Balance</th>
                                    <th className="px-6 py-4 text-center">Contributions</th>
                                    <th className="px-6 py-4 text-left">Last Date</th>
                                    <th className="px-6 py-4 text-center w-28"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {teacherSummary.data.length > 0 ? teacherSummary.data.map((teacher) => (
                                    <tr key={teacher.id}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{teacher.user.name}</p>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">{teacher.employee_id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ৳{formatAmount(teacher.total_employee_pf)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ৳{formatAmount(teacher.total_employer_pf)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-red-600">
                                            ৳{parseFloat((teacher.total_withdrawn || formatAmount(0).toString()))}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-700">
                                            ৳{formatAmount(teacher.total_pf)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="success" size="sm">{teacher.contribution_count || 0} times</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-600">
                                            {formatDate(teacher.last_contribution_date)}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <Link
                                                href={route('provident-fund.show', teacher.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-200 active:scale-95 shadow-sm shadow-emerald-500/5"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No PF records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <IndexPagination
                        links={teacherSummary.links ?? []}
                        from={((teacherSummary.current_page - 1) * teacherSummary.per_page) + 1}
                        to={Math.min(teacherSummary.current_page * teacherSummary.per_page, teacherSummary.total)}
                        total={teacherSummary.total}
                        lastPage={teacherSummary.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
