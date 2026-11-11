import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCanEditOrDelete } from '@/hooks/useCanEditOrDelete';
import { useInstitute } from '@/hooks/useInstitute';
import {
    Plus,
    DollarSign,
    AlertCircle,
    Clock,
    CheckCircle2,
    Printer,
    Search,
    X,
    CalendarDays,
    RotateCcw,
    Pencil,
    Receipt,
    TrendingUp,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { formatAmount } from '@/lib/formatCurrency';
import { formatReceiptNumber } from '@/lib/formatReceipt';

function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
    school_class?: { name: string };
}

interface FeeType {
    id: number;
    name: string;
}

interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface StatsProps {
    total_collected: number;
    today_collected?: number;
    today_receipts_count?: number;
    this_month_collected?: number;
    pending_fees: number;
    overdue_fees: number;
    pending_count?: number;
    overdue_count?: number;
}

interface Props {
    collections: PaginatedData<any>;
    activeTab?: 'paid' | 'dues';
    classes: SchoolClass[];
    sections: Section[];
    feeTypes: FeeType[];
    stats: StatsProps;
    filters: {
        tab?: string;
        status?: string;
        search?: string;
        class_id?: number;
        section_id?: number;
        fee_type_id?: number;
        date_from?: string;
        date_to?: string;
        month?: number;
        year?: number;
    };
}

export default function Index({
    collections,
    activeTab = 'paid',
    classes,
    sections,
    feeTypes = [],
    stats,
    filters,
}: Props) {
    const institute = useInstitute();
    const canMutate = useCanEditOrDelete();
    const currentTab = filters.tab || activeTab || 'paid';

    const [filterClass, setFilterClass] = useState<string>(filters.class_id?.toString() || 'all');
    const [filterSection, setFilterSection] = useState<string>(filters.section_id?.toString() || 'all');
    const [filterFeeType, setFilterFeeType] = useState<string>(filters.fee_type_id?.toString() || 'all');
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        setFilterClass(filters.class_id?.toString() || 'all');
        setFilterSection(filters.section_id?.toString() || 'all');
        setFilterFeeType(filters.fee_type_id?.toString() || 'all');
        setFilterStatus(filters.status || 'all');
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
        setSearchTerm(filters.search || '');
    }, [filters]);

    const switchTab = (newTab: 'paid' | 'dues') => {
        router.get(
            '/fee-collections',
            {
                tab: newTab,
                class_id: filterClass !== 'all' ? filterClass : undefined,
                section_id: filterSection !== 'all' ? filterSection : undefined,
                fee_type_id: filterFeeType !== 'all' ? filterFeeType : undefined,
                search: searchTerm || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const applyFilters = useCallback(() => {
        const params: Record<string, any> = { tab: currentTab };

        if (filterClass !== 'all') params.class_id = filterClass;
        if (filterSection !== 'all') params.section_id = filterSection;
        if (filterFeeType !== 'all') params.fee_type_id = filterFeeType;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (searchTerm) params.search = searchTerm;

        router.get('/fee-collections', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [currentTab, dateFrom, dateTo, filterClass, filterFeeType, filterSection, filterStatus, searchTerm]);

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = () => {
        applyFilters();
    };

    const handleResetFilters = () => {
        setFilterClass('all');
        setFilterSection('all');
        setFilterFeeType('all');
        setFilterStatus('all');
        setDateFrom('');
        setDateTo('');
        setSearchTerm('');

        router.get(
            '/fee-collections',
            { tab: currentTab },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDatePreset = (preset: 'today' | 'this_month') => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');

        if (preset === 'today') {
            const todayStr = `${y}-${m}-${d}`;
            setDateFrom(todayStr);
            setDateTo(todayStr);
            router.get(
                '/fee-collections',
                { tab: currentTab, date_from: todayStr, date_to: todayStr },
                { preserveState: true, preserveScroll: true }
            );
        } else if (preset === 'this_month') {
            const firstDay = `${y}-${m}-01`;
            const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
            const lastDayStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
            setDateFrom(firstDay);
            setDateTo(lastDayStr);
            router.get(
                '/fee-collections',
                { tab: currentTab, date_from: firstDay, date_to: lastDayStr },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    const filteredSections = useMemo(() => {
        if (filterClass === 'all') return sections;
        return sections.filter((s) => s.class_id.toString() === filterClass);
    }, [filterClass, sections]);

    const hasActiveFilters = Boolean(
        (filterClass !== 'all') ||
        (filterSection !== 'all') ||
        (filterFeeType !== 'all') ||
        (filterStatus !== 'all') ||
        dateFrom ||
        dateTo ||
        searchTerm
    );

    const getPaymentMethodBadge = (method: string) => {
        const normalized = method?.toLowerCase() || 'cash';
        if (normalized === 'cash') {
            return (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Cash
                </span>
            );
        }
        if (normalized.includes('bank')) {
            return (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Bank
                </span>
            );
        }
        if (normalized.includes('mobile') || normalized.includes('bkash') || normalized.includes('nagad')) {
            return (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    bKash / Nagad
                </span>
            );
        }
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {method}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Fee Management Ledger - ${institute.name}`} />

            <div className="space-y-3 pb-8">
                {/* 1. Executive Top Header */}
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                            <span>Fee Management Ledger</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {currentTab === 'paid' ? 'Cash Collection Register' : 'Outstanding Dues Register'}
                            </span>
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {currentTab === 'paid'
                                ? 'Real-time record of paid receipts entering the cash drawer & accounts'
                                : 'Pending & overdue student fee demands requiring collection'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Link
                            href="/fee-collections/create"
                            className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <Receipt className="w-3.5 h-3.5 shrink-0" />
                            Collect Fee (POS Desk)
                        </Link>
                    </div>
                </div>

                {/* 2. Hero Segmented Tab Switcher (Paid Receipts vs Outstanding Dues) */}
                <div className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="grid grid-cols-2 gap-1.5 sm:w-auto w-full">
                        {/* Tab 1: Paid Receipts */}
                        <button
                            type="button"
                            onClick={() => switchTab('paid')}
                            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                                currentTab === 'paid'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Paid Money Receipts</span>
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                    currentTab === 'paid'
                                        ? 'bg-indigo-700 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                                {stats.today_receipts_count ? `${stats.today_receipts_count} today` : 'Receipts'}
                            </span>
                        </button>

                        {/* Tab 2: Outstanding Dues */}
                        <button
                            type="button"
                            onClick={() => switchTab('dues')}
                            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                                currentTab === 'dues'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>Outstanding Dues (বকেয়া)</span>
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                    currentTab === 'dues'
                                        ? 'bg-rose-700 text-white'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                {(stats.pending_count ?? 0) + (stats.overdue_count ?? 0)}
                            </span>
                        </button>
                    </div>

                    {/* Quick Date Presets (Visible on Paid Tab) */}
                    {currentTab === 'paid' && (
                        <div className="flex items-center gap-1 self-end sm:self-center">
                            <button
                                type="button"
                                onClick={() => handleDatePreset('today')}
                                className="px-2.5 py-1 text-[11px] rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                            >
                                Today's Cash
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDatePreset('this_month')}
                                className="px-2.5 py-1 text-[11px] rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                            >
                                This Month
                            </button>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-2.5 py-1 text-[11px] rounded text-rose-600 hover:bg-rose-50 font-medium inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw className="w-2.5 h-2.5 shrink-0" /> Reset
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Contextual Financial KPI Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {currentTab === 'paid' ? (
                        <>
                            {/* Today Collection */}
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Collection</p>
                                    <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                                        ৳{formatAmount(stats.today_collected ?? 0)}
                                    </p>
                                    <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                                        <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                                        {stats.today_receipts_count ?? 0} receipts today
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 inline-flex items-center justify-center shrink-0">
                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </div>

                            {/* This Month Collection */}
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">This Month Collection</p>
                                    <p className="text-lg font-bold text-indigo-700 font-mono mt-0.5">
                                        ৳{formatAmount(stats.this_month_collected ?? stats.total_collected)}
                                    </p>
                                    <span className="text-[10px] text-slate-500 block">
                                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 inline-flex items-center justify-center shrink-0">
                                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </div>

                            {/* Filtered Period Collection */}
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtered Total</p>
                                    <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                                        ৳{formatAmount(stats.total_collected)}
                                    </p>
                                    <span className="text-[10px] text-slate-500 block">
                                        {collections.total} total receipts
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center justify-center shrink-0">
                                    <Receipt className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </div>

                            {/* Shortcut to Dues */}
                            <button
                                type="button"
                                onClick={() => switchTab('dues')}
                                className="bg-white hover:bg-rose-50/50 rounded-lg p-3 border border-rose-200 shadow-xs flex items-center justify-between text-left transition cursor-pointer"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Total Uncollected Dues</p>
                                    <p className="text-lg font-bold text-rose-600 font-mono mt-0.5">
                                        ৳{formatAmount(stats.pending_fees + stats.overdue_fees)}
                                    </p>
                                    <span className="text-[10px] font-semibold text-rose-600 inline-flex items-center gap-0.5">
                                        View {(stats.pending_count ?? 0) + (stats.overdue_count ?? 0)} dues <ArrowRight className="w-2.5 h-2.5" />
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-600 border border-rose-200 inline-flex items-center justify-center shrink-0">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Current Pending Dues */}
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Dues (Current)</p>
                                    <p className="text-lg font-bold text-amber-600 font-mono mt-0.5">
                                        ৳{formatAmount(stats.pending_fees)}
                                    </p>
                                    <span className="text-[10px] font-medium text-amber-600 block">
                                        {stats.pending_count ?? 0} invoices
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 border border-amber-100 inline-flex items-center justify-center shrink-0">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </div>

                            {/* Overdue Dues */}
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overdue Dues (Expired)</p>
                                    <p className="text-lg font-bold text-rose-600 font-mono mt-0.5">
                                        ৳{formatAmount(stats.overdue_fees)}
                                    </p>
                                    <span className="text-[10px] font-medium text-rose-600 block">
                                        {stats.overdue_count ?? 0} overdue
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 border border-rose-100 inline-flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </div>

                            {/* Total Outstanding Dues */}
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Receivable</p>
                                    <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                                        ৳{formatAmount(stats.pending_fees + stats.overdue_fees)}
                                    </p>
                                    <span className="text-[10px] text-slate-500 block">
                                        {(stats.pending_count ?? 0) + (stats.overdue_count ?? 0)} total dues
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 inline-flex items-center justify-center shrink-0">
                                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </div>

                            {/* Cash Collected Today */}
                            <button
                                type="button"
                                onClick={() => switchTab('paid')}
                                className="bg-white hover:bg-emerald-50/50 rounded-lg p-3 border border-emerald-200 shadow-xs flex items-center justify-between text-left transition cursor-pointer"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Collected Today</p>
                                    <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                                        ৳{formatAmount(stats.today_collected ?? 0)}
                                    </p>
                                    <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                                        View paid receipts <ArrowRight className="w-2.5 h-2.5" />
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200 inline-flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </button>
                        </>
                    )}
                </div>

                {/* 4. Compact Filter Bar */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-3 space-y-2">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                        {/* Search Input */}
                        <div className="col-span-2 lg:col-span-2 relative flex items-center">
                            <div className="absolute left-2.5 pointer-events-none text-slate-400 flex items-center z-10">
                                <Search className="w-3.5 h-3.5 shrink-0" />
                            </div>
                            <input
                                type="text"
                                style={{ paddingLeft: '2.25rem' }}
                                placeholder={
                                    currentTab === 'paid'
                                        ? 'Search by Student name, ID, or Receipt number...'
                                        : 'Search student name, roll, or admission ID...'
                                }
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-7 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600 z-10"
                                >
                                    <X className="w-3 h-3 shrink-0" />
                                </button>
                            )}
                        </div>

                        {/* Class Dropdown */}
                        <div>
                            <select
                                value={filterClass}
                                onChange={(e) => {
                                    setFilterClass(e.target.value);
                                    if (e.target.value === 'all') setFilterSection('all');
                                    handleFilterChange();
                                }}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="all">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section Dropdown */}
                        <div>
                            <select
                                value={filterSection}
                                onChange={(e) => {
                                    setFilterSection(e.target.value);
                                    handleFilterChange();
                                }}
                                disabled={filterClass === 'all'}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="all">All Sections</option>
                                {filteredSections.map((sec) => (
                                    <option key={sec.id} value={sec.id}>
                                        {sec.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fee Type Dropdown */}
                        <div>
                            <select
                                value={filterFeeType}
                                onChange={(e) => {
                                    setFilterFeeType(e.target.value);
                                    handleFilterChange();
                                }}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="all">All Fee Types</option>
                                {feeTypes.map((ft) => (
                                    <option key={ft.id} value={ft.id}>
                                        {ft.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Secondary Filter Row: Date Pickers on Paid Tab OR Status on Dues Tab */}
                    {currentTab === 'paid' ? (
                        <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-slate-400" /> Payment Date Range:
                            </span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    handleFilterChange();
                                }}
                                className="text-xs py-1 px-2 rounded border border-slate-300 bg-white text-slate-800"
                            />
                            <span className="text-slate-400 text-xs">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    handleFilterChange();
                                }}
                                className="text-xs py-1 px-2 rounded border border-slate-300 bg-white text-slate-800"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 text-[11px] font-medium">Due Status:</span>
                            {[
                                { value: 'all', label: 'All Unpaid' },
                                { value: 'pending', label: 'Pending Dues' },
                                { value: 'overdue', label: 'Overdue Dues' },
                            ].map((st) => (
                                <button
                                    key={st.value}
                                    type="button"
                                    onClick={() => {
                                        setFilterStatus(st.value);
                                        handleFilterChange();
                                    }}
                                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                                        filterStatus === st.value
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. Mobile Card Feeds & Desktop Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                    {currentTab === 'paid' ? (
                        <>
                            {/* Mobile Card Feed (< md): Paid Receipts */}
                            <div className="block md:hidden divide-y divide-slate-100">
                                {collections.data.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500">
                                        <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                                        <p className="text-xs font-semibold text-slate-700">No paid receipts found</p>
                                        <p className="text-[11px] text-slate-400">Try adjusting date range or search filters</p>
                                    </div>
                                ) : (
                                    collections.data.map((item) => (
                                        <div key={item.receipt_number || item.id} className="p-3.5 space-y-2.5 active:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            href={`/fee-collections/${item.id}/receipt`}
                                                            className="font-mono font-bold text-sm text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            #{formatReceiptNumber(item.receipt_number)}
                                                        </Link>
                                                        {item.items_count > 1 && (
                                                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {item.items_count} items
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-900 mt-1">{item.student_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">
                                                        Class: {item.class_name} {item.section_name ? `(${item.section_name})` : ''} · ID: {item.admission_number}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-mono font-bold text-sm text-slate-950 block">
                                                        ৳{formatAmount(item.paid_amount)}
                                                    </span>
                                                    {item.discount > 0 && (
                                                        <span className="text-[10px] text-amber-600 block">
                                                            -৳{formatAmount(item.discount)} disc
                                                        </span>
                                                    )}
                                                    <span className="mt-1 inline-block">{getPaymentMethodBadge(item.payment_method)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                                                <span className="truncate max-w-[200px] text-slate-700 font-medium">
                                                    {item.fee_items_summary}
                                                </span>
                                                <span className="font-mono text-[10px] shrink-0 text-slate-400">
                                                    {item.payment_date}{item.created_time ? ` · ${item.created_time}` : ''}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 text-[11px]">
                                                <span className="text-slate-400 text-[10px]">
                                                    Cashier: <span className="text-slate-600 font-medium">{item.collector_name}</span>
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <Link
                                                        href={`/fee-collections/${item.id}/receipt`}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <Printer className="w-3 h-3" /> Receipt
                                                    </Link>
                                                    {canMutate && (
                                                        <Link
                                                            href={`/fee-collections/${item.id}/edit`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                                        >
                                                            <Pencil className="w-3 h-3" /> Edit
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table (>= md): Paid Receipts */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Receipt #</th>
                                            <th className="py-2.5 px-3">Payment Date</th>
                                            <th className="py-2.5 px-3">Student Details</th>
                                            <th className="py-2.5 px-3">Fees Collected</th>
                                            <th className="py-2.5 px-3">Method</th>
                                            <th className="py-2.5 px-3 text-right">Collected (৳)</th>
                                            <th className="py-2.5 px-3">Cashier</th>
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {collections.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-slate-500">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 mx-auto inline-flex items-center justify-center mb-1 shrink-0">
                                                        <Receipt className="w-4 h-4 shrink-0" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-slate-700">No paid receipts found</p>
                                                    <p className="text-[11px] text-slate-400">Try adjusting date range or search filters</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            collections.data.map((item) => (
                                                <tr key={item.receipt_number || item.id} className="hover:bg-slate-50/70 transition">
                                                    {/* Receipt Number */}
                                                    <td className="py-2 px-3">
                                                        <Link
                                                            href={`/fee-collections/${item.id}/receipt`}
                                                            className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                                        >
                                                            #{formatReceiptNumber(item.receipt_number)}
                                                        </Link>
                                                        {item.items_count > 1 && (
                                                            <span className="ml-1 text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {item.items_count} items
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Payment Date */}
                                                    <td className="py-2 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                                                        <div className="font-medium text-slate-900">{item.payment_date}</div>
                                                        {item.created_at && (
                                                            <div className="text-[10px] text-slate-400 font-mono" title={`Recorded at: ${item.created_at}`}>
                                                                {item.created_at}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Student Details */}
                                                    <td className="py-2 px-3">
                                                        <div className="font-semibold text-slate-900 leading-snug">
                                                            {item.student_name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <span>Class: {item.class_name} {item.section_name ? `(${item.section_name})` : ''}</span>
                                                            <span>•</span>
                                                            <span className="font-mono">ID: {item.admission_number}</span>
                                                        </div>
                                                    </td>

                                                    {/* Fee Items Collected */}
                                                    <td className="py-2 px-3">
                                                        <div className="font-medium text-slate-900 leading-tight">
                                                            {item.fee_items_summary}
                                                        </div>
                                                    </td>

                                                    {/* Method */}
                                                    <td className="py-2 px-3">
                                                        {getPaymentMethodBadge(item.payment_method)}
                                                    </td>

                                                    {/* Paid Amount */}
                                                    <td className="py-2 px-3 text-right">
                                                        <span className="font-mono font-bold text-slate-950 text-xs">
                                                            ৳{formatAmount(item.paid_amount)}
                                                        </span>
                                                        {item.discount > 0 && (
                                                            <div className="text-[10px] text-amber-600">
                                                                Disc: -৳{formatAmount(item.discount)}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Cashier */}
                                                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                                                        {item.collector_name}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-2 px-3 text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <Link
                                                                href={`/fee-collections/${item.id}/receipt`}
                                                                className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                                                                title="Print Money Receipt"
                                                            >
                                                                <Printer className="w-3.5 h-3.5 shrink-0" />
                                                            </Link>
                                                            {canMutate && (
                                                                <Link
                                                                    href={`/fee-collections/${item.id}/edit`}
                                                                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                                                                    title="Edit Receipt"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5 shrink-0" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Mobile Card Feed (< md): Outstanding Dues */}
                            <div className="block md:hidden divide-y divide-slate-100">
                                {collections.data.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                                        <p className="text-xs font-semibold text-slate-700">No outstanding dues found</p>
                                        <p className="text-[11px] text-slate-400">All fees for this criteria are up to date!</p>
                                    </div>
                                ) : (
                                    collections.data.map((item) => {
                                        const isOverdue = item.status === 'overdue';
                                        return (
                                            <div key={item.id} className="p-3.5 space-y-2.5 active:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 leading-snug">{item.student_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            Class: {item.class_name} {item.section_name ? `(${item.section_name})` : ''} · ID: {item.admission_number}
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className={`font-mono font-bold text-sm block ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                                                            ৳{formatAmount(item.total_amount)}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider border inline-block mt-0.5 ${
                                                            isOverdue
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    <span className="font-semibold text-slate-800">{item.fee_type_name}</span>
                                                    <span className="text-slate-500 font-mono text-[10px]">
                                                        {item.period} {item.due_date ? `(Due: ${item.due_date})` : ''}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                                    <div className="text-[10px] text-slate-400">
                                                        Fee: ৳{formatAmount(item.amount)} {item.late_fee > 0 ? `+ ৳${formatAmount(item.late_fee)} fine` : ''}
                                                    </div>
                                                    <Link
                                                        href={`/fee-collections/create?student_id=${item.student_id}`}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 transition-colors shadow-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Collect Now
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Desktop Table (>= md): Outstanding Dues */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="py-2.5 px-3">#</th>
                                            <th className="py-2.5 px-3">Student Details</th>
                                            <th className="py-2.5 px-3">Fee Type</th>
                                            <th className="py-2.5 px-3">Due Period</th>
                                            <th className="py-2.5 px-3 text-right">Original Fee</th>
                                            <th className="py-2.5 px-3 text-right">Late Fine</th>
                                            <th className="py-2.5 px-3 text-right">Total Due (৳)</th>
                                            <th className="py-2.5 px-3 text-center">Status</th>
                                            <th className="py-2.5 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {collections.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-8 text-center text-slate-500">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 mx-auto inline-flex items-center justify-center mb-1 shrink-0">
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-slate-700">No outstanding dues found</p>
                                                    <p className="text-[11px] text-slate-400">All fees for this criteria are up to date!</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            collections.data.map((item, idx) => {
                                                const isOverdue = item.status === 'overdue';

                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                                                            {collections.from ? collections.from + idx : idx + 1}
                                                        </td>

                                                        {/* Student Details */}
                                                        <td className="py-2 px-3">
                                                            <div className="font-semibold text-slate-900 leading-snug">
                                                                {item.student_name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                                <span>Class: {item.class_name} {item.section_name ? `(${item.section_name})` : ''}</span>
                                                                <span>•</span>
                                                                <span>Roll: {item.roll_number || 'N/A'}</span>
                                                                <span>•</span>
                                                                <span className="font-mono">ID: {item.admission_number}</span>
                                                            </div>
                                                        </td>

                                                        {/* Fee Type */}
                                                        <td className="py-2 px-3 font-medium text-slate-900">
                                                            {item.fee_type_name}
                                                        </td>

                                                        {/* Due Period */}
                                                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                                                            {item.period}
                                                            {item.due_date && (
                                                                <div className="text-[10px] text-slate-400">
                                                                    Due: {item.due_date}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Amount */}
                                                        <td className="py-2 px-3 text-right font-mono">
                                                            ৳{formatAmount(item.amount)}
                                                        </td>

                                                        {/* Late Fee */}
                                                        <td className="py-2 px-3 text-right font-mono text-rose-600">
                                                            {item.late_fee > 0 ? `+৳${formatAmount(item.late_fee)}` : '-'}
                                                        </td>

                                                        {/* Total Due */}
                                                        <td className="py-2 px-3 text-right">
                                                            <span className={`font-mono font-bold text-xs ${
                                                                isOverdue ? 'text-rose-600' : 'text-amber-600'
                                                            }`}>
                                                                ৳{formatAmount(item.total_amount)}
                                                            </span>
                                                        </td>

                                                        {/* Status Badge */}
                                                        <td className="py-2 px-3 text-center">
                                                            <span
                                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                                                    isOverdue
                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>

                                                        {/* 1-Click Collect Fee Action */}
                                                        <td className="py-2 px-3 text-right">
                                                            <Link
                                                                href={`/fee-collections/create?student_id=${item.student_id}`}
                                                                className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                                                                title="Collect this student's fee in POS counter"
                                                            >
                                                                <Plus className="w-3 h-3 shrink-0" />
                                                                Collect
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* 6. Clean Pagination Footer */}
                    {collections.links && collections.links.length > 3 && (
                        <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/50">
                            <span className="text-[11px] text-slate-500">
                                Showing <span className="font-semibold text-slate-800">{collections.from ?? 0}</span> to{' '}
                                <span className="font-semibold text-slate-800">{collections.to ?? 0}</span> of{' '}
                                <span className="font-semibold text-slate-800">{collections.total}</span>{' '}
                                {currentTab === 'paid' ? 'receipts' : 'dues'}
                            </span>

                            <div className="flex items-center gap-1">
                                {collections.links.map((link, i) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-400 bg-white cursor-not-allowed select-none"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`px-2 py-1 text-xs rounded border transition cursor-pointer ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
