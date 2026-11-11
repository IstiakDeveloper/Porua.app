import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useInstitute } from '@/hooks/useInstitute';
import { formatAmount } from '@/lib/formatCurrency';
import IndexPagination from '@/Components/IndexPagination';
import Modal from '@/Components/Modal';
import {
    AlertCircle,
    Clock,
    DollarSign,
    Mail,
    MessageSquare,
    Search,
    Send,
    TrendingUp,
    Filter,
    Download,
    Plus,
    RotateCcw,
    Receipt,
    Phone,
    User,
    Calendar,
    ArrowUpDown,
    CheckSquare,
    Square,
    X,
    FileSpreadsheet,
    ShieldAlert,
    CheckCircle2,
    Flame,
    ExternalLink,
} from 'lucide-react';

interface OverdueItem {
    id: string;
    fee_collection_id: number;
    student_id: number;
    student_name: string;
    student_admission: string;
    student_roll: string;
    student_phone: string | null;
    student_email: string | null;
    class_id: number | null;
    class_name: string;
    section_id: number | null;
    section_name: string;
    fee_type_id: number;
    fee_type: string;
    fee_frequency: string;
    fee_period: string;
    amount: number;
    base_amount: number;
    late_fee: number;
    paid_amount: number;
    total_amount: number;
    due_date: string | null;
    due_date_formatted: string;
    days_overdue: number;
    academic_year: string;
}

interface Stats {
    total_overdue_count: number;
    total_overdue_amount: number;
    critically_overdue: number;
    moderately_overdue: number;
    recent_overdue: number;
}

interface FilteredStats {
    count: number;
    amount: number;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface FeeType {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
    links?: PaginationLink[];
}

interface Props {
    overdueList: PaginatedData<OverdueItem>;
    stats: Stats;
    filteredStats?: FilteredStats;
    classes: SchoolClass[];
    sections: Section[];
    feeTypes: FeeType[];
    filters: {
        search?: string;
        class_id?: string;
        section_id?: string;
        fee_type_id?: string;
        days_filter?: string;
        sort_by?: string;
        per_page?: string;
    };
}

export default function Index({
    overdueList,
    stats,
    filteredStats,
    classes = [],
    sections = [],
    feeTypes = [],
    filters = {},
}: Props) {
    const institute = useInstitute();

    // Filters state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterClass, setFilterClass] = useState<string>(filters.class_id || 'all');
    const [filterSection, setFilterSection] = useState<string>(filters.section_id || 'all');
    const [filterFeeType, setFilterFeeType] = useState<string>(filters.fee_type_id || 'all');
    const [filterDays, setFilterDays] = useState<string>(filters.days_filter || 'all');
    const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'days_desc');
    const [perPage, setPerPage] = useState<string>(filters.per_page || '20');

    // Selection state for batch actions
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Reminder Modals state
    const [showBulkReminderModal, setShowBulkReminderModal] = useState(false);
    const [singleReminderTarget, setSingleReminderTarget] = useState<OverdueItem | null>(null);
    const [reminderType, setReminderType] = useState<'sms' | 'email' | 'both'>('sms');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state when props filters change
    useEffect(() => {
        setSearchTerm(filters.search || '');
        setFilterClass(filters.class_id || 'all');
        setFilterSection(filters.section_id || 'all');
        setFilterFeeType(filters.fee_type_id || 'all');
        setFilterDays(filters.days_filter || 'all');
        setSortBy(filters.sort_by || 'days_desc');
        setPerPage(filters.per_page || '20');
    }, [filters]);

    // Apply filters helper
    const applyFilters = useCallback(
        (overrides: Record<string, any> = {}) => {
            const params: Record<string, any> = {
                search: searchTerm || undefined,
                class_id: filterClass !== 'all' ? filterClass : undefined,
                section_id: filterSection !== 'all' ? filterSection : undefined,
                fee_type_id: filterFeeType !== 'all' ? filterFeeType : undefined,
                days_filter: filterDays !== 'all' ? filterDays : undefined,
                sort_by: sortBy !== 'days_desc' ? sortBy : undefined,
                per_page: perPage !== '20' ? perPage : undefined,
                page: 1, // Reset to page 1 on filter change
                ...overrides,
            };

            // Clean undefined values
            Object.keys(params).forEach((key) => {
                if (params[key] === undefined) delete params[key];
            });

            router.get('/overdue-fees', params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [searchTerm, filterClass, filterSection, filterFeeType, filterDays, sortBy, perPage]
    );

    // Debounced search
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            applyFilters({ search: searchTerm || undefined });
        }, 350);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle class filter change and reset section if needed
    const handleClassChange = (newClassId: string) => {
        setFilterClass(newClassId);
        setFilterSection('all');
        applyFilters({
            class_id: newClassId !== 'all' ? newClassId : undefined,
            section_id: undefined,
        });
    };

    // Filter available sections by selected class
    const availableSections = useMemo(() => {
        if (filterClass === 'all') return sections;
        return sections.filter((s) => s.class_id.toString() === filterClass);
    }, [filterClass, sections]);

    // Quick filter by card click
    const handleQuickFilterDays = (daysVal: string) => {
        const nextVal = filterDays === daysVal ? 'all' : daysVal;
        setFilterDays(nextVal);
        applyFilters({ days_filter: nextVal !== 'all' ? nextVal : undefined });
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterClass('all');
        setFilterSection('all');
        setFilterFeeType('all');
        setFilterDays('all');
        setSortBy('days_desc');
        setPerPage('20');
        setSelectedIds([]);

        router.get('/overdue-fees', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        searchTerm ||
        filterClass !== 'all' ||
        filterSection !== 'all' ||
        filterFeeType !== 'all' ||
        filterDays !== 'all' ||
        sortBy !== 'days_desc' ||
        perPage !== '20'
    );

    // Row selection logic
    const currentPageIds = useMemo(() => overdueList.data.map((item) => item.fee_collection_id), [overdueList.data]);
    const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
    const isSomeCurrentSelected = currentPageIds.some((id) => selectedIds.includes(id)) && !isAllCurrentSelected;

    const handleToggleSelectAll = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
        }
    };

    const handleToggleSelectRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    // Send Single Reminder
    const handleConfirmSingleReminder = () => {
        if (!singleReminderTarget) return;
        setIsSubmitting(true);
        router.post(
            '/overdue-fees/reminder',
            {
                student_id: singleReminderTarget.student_id,
                fee_collection_id: singleReminderTarget.fee_collection_id,
                reminder_type: reminderType,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setSingleReminderTarget(null);
                },
            }
        );
    };

    // Send Bulk Reminders
    const handleConfirmBulkReminders = () => {
        setIsSubmitting(true);
        router.post(
            '/overdue-fees/bulk-reminder',
            {
                reminder_type: reminderType,
                days_filter: filterDays !== 'all' ? filterDays : undefined,
                class_id: filterClass !== 'all' ? filterClass : undefined,
                section_id: filterSection !== 'all' ? filterSection : undefined,
                fee_type_id: filterFeeType !== 'all' ? filterFeeType : undefined,
                selected_ids: selectedIds.length > 0 ? selectedIds : undefined,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowBulkReminderModal(false);
                    setSelectedIds([]);
                },
            }
        );
    };

    // Build export URL
    const getExportUrl = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (filterClass !== 'all') params.set('class_id', filterClass);
        if (filterSection !== 'all') params.set('section_id', filterSection);
        if (filterFeeType !== 'all') params.set('fee_type_id', filterFeeType);
        if (filterDays !== 'all') params.set('days_filter', filterDays);
        return `/overdue-fees/export?${params.toString()}`;
    };

    // Severity styling helpers
    const getSeverityDetails = (days: number) => {
        if (days > 60) {
            return {
                label: 'Severe',
                badgeCl: 'bg-rose-50 text-rose-700 border-rose-200',
                dotCl: 'bg-rose-500',
            };
        }
        if (days > 30) {
            return {
                label: 'Critical',
                badgeCl: 'bg-rose-50 text-rose-600 border-rose-200',
                dotCl: 'bg-rose-400',
            };
        }
        if (days >= 7) {
            return {
                label: 'Moderate',
                badgeCl: 'bg-amber-50 text-amber-700 border-amber-200',
                dotCl: 'bg-amber-500',
            };
        }
        return {
            label: 'Recent',
            badgeCl: 'bg-blue-50 text-blue-700 border-blue-200',
            dotCl: 'bg-blue-500',
        };
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Overdue Fees Ledger - ${institute.name}`} />

            <div className="space-y-3 pb-8">
                {/* 1. Executive Top Header */}
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                            <span>Overdue Fees Register</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                Recovery Desk
                            </span>
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Real-time tracking of unpaid student fee demands past their scheduled due dates
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Quick link to Collections POS Desk */}
                        <Link
                            href="/fee-collections/create"
                            className="px-3 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <Receipt className="w-3.5 h-3.5 shrink-0" />
                            Collect Fee (POS Desk)
                        </Link>

                        {/* Send Bulk Reminders */}
                        <button
                            type="button"
                            onClick={() => setShowBulkReminderModal(true)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs bg-white"
                        >
                            <Send className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Bulk Reminders</span>
                            {selectedIds.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                    {selectedIds.length}
                                </span>
                            )}
                        </button>

                        {/* Export CSV */}
                        <a
                            href={getExportUrl()}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs bg-white"
                            title="Export filtered overdue fees to CSV"
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Export CSV
                        </a>

                        {/* Link to Full Collections Ledger */}
                        <Link
                            href="/fee-collections"
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 inline-flex items-center gap-1 transition"
                            title="Open main Fee Management Ledger"
                        >
                            <span>Ledger</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                    </div>
                </div>

                {/* 2. Interactive KPI / Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {/* Card 1: Total Overdue Records */}
                    <div
                        onClick={() => handleQuickFilterDays('all')}
                        className={`bg-white p-3 rounded-lg border transition shadow-xs cursor-pointer ${
                            filterDays === 'all'
                                ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                        title="Click to view all overdue fees"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Total Overdue
                            </span>
                            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-bold font-mono text-slate-900">
                                {stats.total_overdue_count.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Active Dues
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Total Outstanding Amount */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Total Amount
                            </span>
                            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-bold font-mono text-slate-900">
                                ৳{formatAmount(stats.total_overdue_amount)}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                                Pending recovery
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Critical (>30 Days) */}
                    <div
                        onClick={() => handleQuickFilterDays('30')}
                        className={`bg-white p-3 rounded-lg border transition shadow-xs cursor-pointer ${
                            filterDays === '30'
                                ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                        title="Click to filter dues older than 30 days"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Critical (&gt;30d)
                            </span>
                            <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                                <Flame className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-bold font-mono text-rose-700">
                                {stats.critically_overdue.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                High Risk
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Moderate (7-30 Days) */}
                    <div
                        onClick={() => handleQuickFilterDays('moderate')}
                        className={`bg-white p-3 rounded-lg border transition shadow-xs cursor-pointer ${
                            filterDays === 'moderate'
                                ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/30'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                        title="Click to filter dues between 7 and 30 days"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Moderate (7-30d)
                            </span>
                            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-bold font-mono text-slate-900">
                                {stats.moderately_overdue.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Action Needed
                            </span>
                        </div>
                    </div>

                    {/* Card 5: Recent (<7 Days) */}
                    <div
                        onClick={() => handleQuickFilterDays('recent')}
                        className={`bg-white p-3 rounded-lg border transition shadow-xs cursor-pointer col-span-2 sm:col-span-1 ${
                            filterDays === 'recent'
                                ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/30'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                        title="Click to filter dues under 7 days overdue"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Recent (&lt;7d)
                            </span>
                            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-bold font-mono text-slate-900">
                                {stats.recent_overdue.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                Follow-up
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Advanced Filter & Search Toolbar */}
                <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {/* Search Input */}
                        <div className="relative col-span-1 sm:col-span-2">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by student name, roll, ID, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Class Dropdown */}
                        <div>
                            <select
                                value={filterClass}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className="w-full py-1.5 px-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 cursor-pointer"
                            >
                                <option value="all">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id.toString()}>
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
                                    applyFilters({
                                        section_id: e.target.value !== 'all' ? e.target.value : undefined,
                                    });
                                }}
                                disabled={availableSections.length === 0}
                                className="w-full py-1.5 px-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 disabled:opacity-50 cursor-pointer"
                            >
                                <option value="all">All Sections</option>
                                {availableSections.map((sec) => (
                                    <option key={sec.id} value={sec.id.toString()}>
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
                                    applyFilters({
                                        fee_type_id: e.target.value !== 'all' ? e.target.value : undefined,
                                    });
                                }}
                                className="w-full py-1.5 px-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 cursor-pointer"
                            >
                                <option value="all">All Fee Types</option>
                                {feeTypes.map((ft) => (
                                    <option key={ft.id} value={ft.id.toString()}>
                                        {ft.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Overdue Age / Severity */}
                        <div>
                            <select
                                value={filterDays}
                                onChange={(e) => {
                                    setFilterDays(e.target.value);
                                    applyFilters({
                                        days_filter: e.target.value !== 'all' ? e.target.value : undefined,
                                    });
                                }}
                                className="w-full py-1.5 px-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 cursor-pointer font-medium"
                            >
                                <option value="all">All Overdue Days</option>
                                <option value="recent">&lt; 7 Days Overdue</option>
                                <option value="7">7+ Days Overdue</option>
                                <option value="15">15+ Days Overdue</option>
                                <option value="30">30+ Days (Critical)</option>
                                <option value="60">60+ Days (Severe)</option>
                            </select>
                        </div>
                    </div>

                    {/* Secondary Row: Sorting, Per Page & Reset */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Sort Selector */}
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        applyFilters({ sort_by: e.target.value });
                                    }}
                                    className="py-1 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="days_desc">Overdue: Oldest First (Highest Days)</option>
                                    <option value="days_asc">Overdue: Most Recent First</option>
                                    <option value="amount_desc">Amount: High to Low</option>
                                    <option value="amount_asc">Amount: Low to High</option>
                                    <option value="due_date_asc">Due Date: Earliest First</option>
                                    <option value="due_date_desc">Due Date: Latest First</option>
                                </select>
                            </div>

                            {/* Per Page Selector */}
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <span className="text-[11px] font-medium">Show:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        applyFilters({ per_page: e.target.value });
                                    }}
                                    className="py-1 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="15">15 rows</option>
                                    <option value="20">20 rows</option>
                                    <option value="25">25 rows</option>
                                    <option value="50">50 rows</option>
                                    <option value="100">100 rows</option>
                                </select>
                            </div>

                            {/* Reset Button */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200 inline-flex items-center gap-1 transition"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset Filters</span>
                                </button>
                            )}
                        </div>

                        {/* Active Filter Summary Pill */}
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            {filteredStats && (
                                <span>
                                    Filtered Total:{' '}
                                    <strong className="text-slate-800 font-mono">
                                        ৳{formatAmount(filteredStats.amount)}
                                    </strong>{' '}
                                    across{' '}
                                    <strong className="text-slate-800 font-mono">
                                        {filteredStats.count.toLocaleString()}
                                    </strong>{' '}
                                    records
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Multi-Select Floating / Sticky Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="bg-indigo-900 text-white rounded-lg px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold text-sm">{selectedIds.length}</span>
                            <span className="text-indigo-200">
                                {selectedIds.length === 1 ? 'student fee item selected' : 'student fee items selected'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowBulkReminderModal(true)}
                                className="px-3 py-1.5 text-xs font-bold rounded bg-indigo-500 hover:bg-indigo-600 text-white inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Remind Selected ({selectedIds.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="px-2.5 py-1.5 text-xs text-indigo-200 hover:text-white transition cursor-pointer"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. Main Overdue Register Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
                                <tr>
                                    {/* Selection Checkbox */}
                                    <th className="py-2.5 px-3 w-9 text-center">
                                        <button
                                            type="button"
                                            onClick={handleToggleSelectAll}
                                            className="text-slate-400 hover:text-slate-700 transition"
                                            title={isAllCurrentSelected ? 'Deselect all on this page' : 'Select all on this page'}
                                        >
                                            {isAllCurrentSelected ? (
                                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                            ) : isSomeCurrentSelected ? (
                                                <Square className="w-4 h-4 text-indigo-500 fill-indigo-100" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-300" />
                                            )}
                                        </button>
                                    </th>

                                    <th className="py-2.5 px-3">Student Details</th>
                                    <th className="py-2.5 px-3">Class &amp; Section</th>
                                    <th className="py-2.5 px-3">Fee Particulars</th>
                                    <th className="py-2.5 px-3">Due Date &amp; Overdue</th>
                                    <th className="py-2.5 px-3 text-right">Outstanding Amount</th>
                                    <th className="py-2.5 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {overdueList.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-14 px-4 text-center">
                                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                No Overdue Fees Found
                                            </h3>
                                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                                {hasActiveFilters
                                                    ? 'No overdue records match your current filter settings. Try clearing some filters.'
                                                    : 'Excellent news! All student fee collections are up to date and no dues are overdue.'}
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="mt-3 px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                                >
                                                    Clear All Filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    overdueList.data.map((item) => {
                                        const isSelected = selectedIds.includes(item.fee_collection_id);
                                        const severity = getSeverityDetails(item.days_overdue);

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`transition-colors hover:bg-slate-50/70 ${
                                                    isSelected ? 'bg-indigo-50/40' : ''
                                                }`}
                                            >
                                                {/* Selection Checkbox */}
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleSelectRow(item.fee_collection_id)}
                                                        className="text-slate-400 hover:text-slate-700 transition"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-slate-300" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Student Details */}
                                                <td className="py-2.5 px-3">
                                                    <div className="font-semibold text-slate-900 leading-snug">
                                                        {item.student_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                                        <span className="font-mono">ID: {item.student_admission}</span>
                                                        <span>•</span>
                                                        <span>Roll: {item.student_roll || 'N/A'}</span>
                                                        {item.student_phone && (
                                                            <>
                                                                <span>•</span>
                                                                <a
                                                                    href={`tel:${item.student_phone}`}
                                                                    className="inline-flex items-center gap-0.5 text-slate-600 hover:text-indigo-600"
                                                                    title="Click to call parent/student"
                                                                >
                                                                    <Phone className="w-2.5 h-2.5" />
                                                                    <span>{item.student_phone}</span>
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Class & Section */}
                                                <td className="py-2.5 px-3">
                                                    <div className="font-medium text-slate-800">
                                                        {item.class_name}
                                                    </div>
                                                    {item.section_name && (
                                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5 inline-block">
                                                            Sec: {item.section_name}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Fee Particulars */}
                                                <td className="py-2.5 px-3">
                                                    <div className="font-medium text-slate-900">
                                                        {item.fee_type}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <span>{item.fee_period}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{item.fee_frequency}</span>
                                                    </div>
                                                </td>

                                                {/* Due Date & Overdue */}
                                                <td className="py-2.5 px-3">
                                                    <div className="text-[11px] text-slate-600 font-medium">
                                                        {item.due_date_formatted}
                                                    </div>
                                                    <div className="mt-0.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${severity.badgeCl}`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${severity.dotCl}`}
                                                            />
                                                            <span>{item.days_overdue} days</span>
                                                            <span className="opacity-80">({severity.label})</span>
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Outstanding Amount */}
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="font-mono font-bold text-xs text-rose-700">
                                                        ৳{formatAmount(item.amount)}
                                                    </div>
                                                    {item.late_fee > 0 && (
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            Incl. ৳{formatAmount(item.late_fee)} late fee
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Quick Reminder Modal Trigger */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSingleReminderTarget(item);
                                                                setReminderType(item.student_phone ? 'sms' : 'email');
                                                            }}
                                                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded border border-indigo-200 transition cursor-pointer"
                                                            title="Send payment reminder to this student/parent"
                                                        >
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* 1-Click Collect Fee Button */}
                                                        <Link
                                                            href={`/fee-collections/create?student_id=${item.student_id}`}
                                                            className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                                                            title="Collect this student's fee at POS counter"
                                                        >
                                                            <Plus className="w-3 h-3 shrink-0" />
                                                            <span>Collect</span>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 6. Clean Professional Pagination Footer */}
                    <IndexPagination
                        links={overdueList.links}
                        from={overdueList.from}
                        to={overdueList.to}
                        total={overdueList.total}
                        lastPage={overdueList.last_page}
                    />
                </div>

                {/* 7. Modal: Send Single Student Reminder */}
                <Modal
                    show={Boolean(singleReminderTarget)}
                    onClose={() => setSingleReminderTarget(null)}
                    title="Send Fee Overdue Reminder"
                    maxWidth="md"
                >
                    {singleReminderTarget && (
                        <div className="p-4 sm:p-5 space-y-4">
                            {/* Student Card Summary */}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 text-sm">
                                        {singleReminderTarget.student_name}
                                    </span>
                                    <span className="font-mono font-bold text-rose-700 text-xs">
                                        Due: ৳{formatAmount(singleReminderTarget.amount)}
                                    </span>
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                    Class: {singleReminderTarget.class_name} • Roll: {singleReminderTarget.student_roll || 'N/A'} • ID: {singleReminderTarget.student_admission}
                                </div>
                                <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60 flex flex-wrap gap-x-4">
                                    <span>Fee: {singleReminderTarget.fee_type} ({singleReminderTarget.fee_period})</span>
                                    <span className="text-rose-600 font-semibold">{singleReminderTarget.days_overdue} days overdue</span>
                                </div>
                            </div>

                            {/* Channel Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Delivery Channel
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <label
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                            reminderType === 'sms'
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="single_reminder_type"
                                            value="sms"
                                            checked={reminderType === 'sms'}
                                            onChange={() => setReminderType('sms')}
                                            className="sr-only"
                                        />
                                        <MessageSquare className="w-4 h-4 mb-1" />
                                        <span>SMS Only</span>
                                        <span className="text-[10px] font-normal text-slate-400 mt-0.5 truncate max-w-full">
                                            {singleReminderTarget.student_phone || 'No Phone'}
                                        </span>
                                    </label>

                                    <label
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                            reminderType === 'email'
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="single_reminder_type"
                                            value="email"
                                            checked={reminderType === 'email'}
                                            onChange={() => setReminderType('email')}
                                            className="sr-only"
                                        />
                                        <Mail className="w-4 h-4 mb-1" />
                                        <span>Email Only</span>
                                        <span className="text-[10px] font-normal text-slate-400 mt-0.5 truncate max-w-full">
                                            {singleReminderTarget.student_email || 'No Email'}
                                        </span>
                                    </label>

                                    <label
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                            reminderType === 'both'
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="single_reminder_type"
                                            value="both"
                                            checked={reminderType === 'both'}
                                            onChange={() => setReminderType('both')}
                                            className="sr-only"
                                        />
                                        <Send className="w-4 h-4 mb-1" />
                                        <span>Both SMS &amp; Mail</span>
                                        <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                                            Multi-channel
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Message Preview Box */}
                            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900">
                                <div className="font-semibold mb-1 flex items-center gap-1 text-amber-800">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Sample Notification Notice</span>
                                </div>
                                <p className="italic text-slate-700">
                                    &quot;Dear Guardian, this is a reminder from {institute.name} regarding overdue fee of ৳{formatAmount(singleReminderTarget.amount)} for {singleReminderTarget.student_name} ({singleReminderTarget.fee_type}). Please clear the dues at your earliest convenience.&quot;
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSingleReminderTarget(null)}
                                    disabled={isSubmitting}
                                    className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSingleReminder}
                                    disabled={isSubmitting}
                                    className="px-4 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{isSubmitting ? 'Sending...' : 'Send Reminder'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* 8. Modal: Send Bulk Reminders */}
                <Modal
                    show={showBulkReminderModal}
                    onClose={() => setShowBulkReminderModal(false)}
                    title="Send Bulk Overdue Reminders"
                    maxWidth="md"
                >
                    <div className="p-4 sm:p-5 space-y-4">
                        {/* Scope summary banner */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3.5 text-xs text-indigo-900">
                            <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-950">
                                <Send className="w-4 h-4 text-indigo-600" />
                                <span>
                                    {selectedIds.length > 0
                                        ? `Targeting ${selectedIds.length} specifically selected students`
                                        : `Targeting all ${filteredStats?.count ?? overdueList.total} students matching current filters`}
                                </span>
                            </div>
                            <p className="text-[11px] text-indigo-800 leading-relaxed">
                                {selectedIds.length > 0
                                    ? `Reminders will only be dispatched to the ${selectedIds.length} student items you checked in the table.`
                                    : `Reminders will be sent to all active overdue students based on your active filters (Class, Fee Type, Days Overdue).`}
                            </p>
                        </div>

                        {/* Channel Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                                Delivery Channel
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <label
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                        reminderType === 'sms'
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="bulk_reminder_type"
                                        value="sms"
                                        checked={reminderType === 'sms'}
                                        onChange={() => setReminderType('sms')}
                                        className="sr-only"
                                    />
                                    <MessageSquare className="w-4 h-4 mb-1" />
                                    <span>SMS Only</span>
                                </label>

                                <label
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                        reminderType === 'email'
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="bulk_reminder_type"
                                        value="email"
                                        checked={reminderType === 'email'}
                                        onChange={() => setReminderType('email')}
                                        className="sr-only"
                                    />
                                    <Mail className="w-4 h-4 mb-1" />
                                    <span>Email Only</span>
                                </label>

                                <label
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                        reminderType === 'both'
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="bulk_reminder_type"
                                        value="both"
                                        checked={reminderType === 'both'}
                                        onChange={() => setReminderType('both')}
                                        className="sr-only"
                                    />
                                    <Send className="w-4 h-4 mb-1" />
                                    <span>Both SMS &amp; Mail</span>
                                </label>
                            </div>
                        </div>

                        {/* Confirmation note */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-800">Institute Notification Notice:</span>
                            <p className="mt-0.5">
                                Automated reminders will use the institute SMS gateway and official email address configured in settings.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowBulkReminderModal(false)}
                                disabled={isSubmitting}
                                className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmBulkReminders}
                                disabled={isSubmitting}
                                className="px-4 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSubmitting ? 'Sending...' : 'Dispatch Reminders'}</span>
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
