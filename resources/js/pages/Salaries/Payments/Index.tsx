import React, { useState, useRef } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useReactToPrint } from 'react-to-print';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import IndexPagination from '@/Components/IndexPagination';
import PrintSalaryPayments from './PrintSalaryPayments';
import { Plus, Search, DollarSign, User as UserIcon, Calendar, Wallet, Printer, Filter, X, Pencil, RefreshCw, AlertTriangle } from 'lucide-react';
import { useCanEditOrDelete } from '@/hooks/useCanEditOrDelete';

function route(name: string, params?: any): string {
    if (name === 'salary-payments.store') return '/salary-payments';
    if (name === 'salary-payments.index') return '/salary-payments';
    if (name === 'salary-payments.bulk-change-month') return '/salary-payments/bulk-change-month';
    if (name === 'salary-payments.show' && params) return `/salary-payments/${params}`;
    if (name === 'salary-payments.edit' && params) return `/salary-payments/${params}/edit`;
    if (name === 'salary-payments.update' && params) return `/salary-payments/${params}`;
    if (name === 'salary-payments.destroy' && params) return `/salary-payments/${params}`;
    return '/salary-payments';
}

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    salary: number;
    designation: string;
}

interface Account {
    id: number;
    account_name: string;
    account_number: string;
}

interface Payment {
    id: number;
    staff_id?: number;
    staff: {
        user: { name: string };
        employee_id: string;
        designation?: string;
    };
    month: number;
    year: number;
    base_salary: number;
    provident_fund_deduction: number;
    employer_pf_contribution: number;
    net_salary: number;
    total_amount: number;
    payment_date: string;
    account_id?: number;
    account: { account_name: string };
    payment_method: string;
    reference_number?: string | null;
    remarks?: string | null;
}

interface SummaryStats {
    total_count: number;
    total_base_salary: number;
    total_employee_pf: number;
    total_employer_pf: number;
    total_net_salary: number;
    total_paid: number;
}

interface SalaryPaymentsIndexProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from?: number;
        to?: number;
        links?: any[];
    };
    summary?: SummaryStats;
    monthCounts?: Record<number, { count: number; total_amount: number }>;
    availableYears?: number[];
    teachers: Teacher[];
    accounts: Account[];
    filters: {
        search?: string;
        month?: number | string;
        year?: number | string;
        per_page?: number | string;
    };
}

const MONTH_NAMES = [
    { value: 1, name: 'January', short: 'Jan' },
    { value: 2, name: 'February', short: 'Feb' },
    { value: 3, name: 'March', short: 'Mar' },
    { value: 4, name: 'April', short: 'Apr' },
    { value: 5, name: 'May', short: 'May' },
    { value: 6, name: 'June', short: 'Jun' },
    { value: 7, name: 'July', short: 'Jul' },
    { value: 8, name: 'August', short: 'Aug' },
    { value: 9, name: 'September', short: 'Sep' },
    { value: 10, name: 'October', short: 'Oct' },
    { value: 11, name: 'November', short: 'Nov' },
    { value: 12, name: 'December', short: 'Dec' },
];

export default function Index({ payments, summary, monthCounts, availableYears, teachers, accounts, filters }: SalaryPaymentsIndexProps) {
    const canMutate = useCanEditOrDelete();
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [filterMonth, setFilterMonth] = useState(filters.month?.toString() || '');
    const [filterYear, setFilterYear] = useState(filters.year?.toString() || (new Date().getFullYear()).toString());
    const [perPage, setPerPage] = useState<string>(filters.per_page?.toString() || '50');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [bulkPayment, setBulkPayment] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [shiftData, setShiftData] = useState({
        from_month: filters.month ? Number(filters.month) : 8,
        from_year: filters.year ? Number(filters.year) : new Date().getFullYear(),
        target_month: filters.month ? (Number(filters.month) === 8 ? 7 : Number(filters.month)) : 7,
        target_year: filters.year ? Number(filters.year) : new Date().getFullYear(),
    });
    const [shifting, setShifting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        staff_id: '',
        month: 1,
        year: 2026,
        base_salary: '',
        payment_date: '',
        account_id: '',
        payment_method: 'bank_transfer',
        reference_number: '',
        remarks: '',
    });

    const openEditModal = (p: Payment) => {
        setEditingPayment(p);
        setEditFormData({
            staff_id: String(p.staff_id || ''),
            month: p.month,
            year: p.year,
            base_salary: String(p.base_salary),
            payment_date: p.payment_date ? p.payment_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            account_id: String(p.account_id || (accounts[0]?.id || '')),
            payment_method: p.payment_method || 'bank_transfer',
            reference_number: p.reference_number || '',
            remarks: p.remarks || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPayment) return;
        setEditSubmitting(true);

        router.put(`/salary-payments/${editingPayment.id}`, editFormData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPayment(null);
            },
            onFinish: () => {
                setEditSubmitting(false);
            },
        });
    };

    const editBaseSalary = parseFloat(editFormData.base_salary) || 0;
    const editEmployeePF = editBaseSalary * 0.05;
    const editEmployerPF = editBaseSalary * 0.05;
    const editNetSalary = editBaseSalary - editEmployeePF;
    const editTotalAmount = editBaseSalary + editEmployerPF;

    const [formData, setFormData] = useState({
        staff_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        base_salary: '',
        payment_date: new Date().toISOString().split('T')[0],
        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
        payment_method: 'bank_transfer',
        reference_number: '',
        remarks: '',
    });

    const employeePF = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) * 0.05).toFixed(2)
        : '0.00';

    const employerPF = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) * 0.05).toFixed(2)
        : '0.00';

    const netSalary = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) - parseFloat(employeePF)).toFixed(2)
        : '0.00';

    const totalAmount = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) + parseFloat(employerPF)).toFixed(2)
        : '0.00';

    const handleTeacherChange = (teacherId: string) => {
        const teacher = teachers.find((t: Teacher) => t.id === parseInt(teacherId));
        setSelectedTeacher(teacher || null);
        setFormData({
            ...formData,
            staff_id: teacherId,
            base_salary: teacher?.salary?.toString() || '',
        });
    };

    const handleBulkPaymentToggle = () => {
        setBulkPayment(!bulkPayment);
        setSelectedTeachers([]);
        setSelectedTeacher(null);
        setFormData({
            ...formData,
            staff_id: '',
            base_salary: '',
        });
    };

    const handleTeacherSelect = (teacherId: number) => {
        if (selectedTeachers.includes(teacherId)) {
            setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
        } else {
            setSelectedTeachers([...selectedTeachers, teacherId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedTeachers.length === filteredTeachers.length) {
            setSelectedTeachers([]);
        } else {
            setSelectedTeachers(filteredTeachers.map(t => t.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (bulkPayment) {
            // Process bulk payments
            const bulkData = {
                teacher_ids: selectedTeachers,
                month: formData.month,
                year: formData.year,
                payment_date: formData.payment_date,
                account_id: formData.account_id,
                payment_method: formData.payment_method,
                reference_number: formData.reference_number,
                remarks: formData.remarks,
            };

            router.post('/salary-payments/bulk', bulkData, {
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedTeachers([]);
                    setBulkPayment(false);
                    setFormData({
                        staff_id: '',
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        base_salary: '',
                        payment_date: new Date().toISOString().split('T')[0],
                        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
                        payment_method: 'bank_transfer',
                        reference_number: '',
                        remarks: '',
                    });
                },
                onError: () => {
                    // Close modal on error so flash message is visible
                    setShowModal(false);
                },
            });
        } else {
            // Process single payment
            router.post(route('salary-payments.store'), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedTeacher(null);
                    setFormData({
                        staff_id: '',
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        base_salary: '',
                        payment_date: new Date().toISOString().split('T')[0],
                        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
                        payment_method: 'bank_transfer',
                        reference_number: '',
                        remarks: '',
                    });
                },
                onError: () => {
                    // Close modal on error so flash message is visible
                    setShowModal(false);
                },
            });
        }
    };

    const applyFilters = (overrides?: { search?: string; month?: string; year?: string; per_page?: string }) => {
        const nextSearch = overrides?.search !== undefined ? overrides.search : search;
        const nextMonth = overrides?.month !== undefined ? overrides.month : filterMonth;
        const nextYear = overrides?.year !== undefined ? overrides.year : filterYear;
        const nextPerPage = overrides?.per_page !== undefined ? overrides.per_page : perPage;

        if (overrides?.month !== undefined) setFilterMonth(overrides.month);
        if (overrides?.year !== undefined) setFilterYear(overrides.year);
        if (overrides?.search !== undefined) setSearch(overrides.search);
        if (overrides?.per_page !== undefined) setPerPage(overrides.per_page);

        router.get(route('salary-payments.index'), {
            search: nextSearch || undefined,
            month: nextMonth || undefined,
            year: nextYear || undefined,
            per_page: nextPerPage || undefined,
            page: 1,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = () => {
        applyFilters();
    };

    const handleClearFilters = () => {
        setSearch('');
        setFilterMonth('');
        setFilterYear((new Date().getFullYear()).toString());
        setPerPage('50');
        router.get(route('salary-payments.index'), {
            per_page: '50',
            year: new Date().getFullYear(),
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleSelectAllPayments = () => {
        if (selectedPaymentIds.length === payments.data.length) {
            setSelectedPaymentIds([]);
        } else {
            setSelectedPaymentIds(payments.data.map((p) => p.id));
        }
    };

    const toggleSelectPayment = (id: number) => {
        setSelectedPaymentIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleShiftMonth = (e: React.FormEvent) => {
        e.preventDefault();
        setShifting(true);

        const payload: any = {
            target_month: shiftData.target_month,
            target_year: shiftData.target_year,
            per_page: perPage,
        };

        if (selectedPaymentIds.length > 0) {
            payload.payment_ids = selectedPaymentIds;
        } else {
            payload.from_month = shiftData.from_month;
            payload.from_year = shiftData.from_year;
        }

        router.post('/salary-payments/bulk-change-month', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setShowShiftModal(false);
                setSelectedPaymentIds([]);
                setFilterMonth(shiftData.target_month.toString());
                setFilterYear(shiftData.target_year.toString());
            },
            onError: () => {
                setShowShiftModal(false);
            },
            onFinish: () => {
                setShifting(false);
            },
        });
    };

    const getMonthName = (month?: number | string | null): string => {
        if (month === undefined || month === null || month === '') return '';
        const m = Number(month);
        if (isNaN(m) || m < 1 || m > 12) return '';
        return MONTH_NAMES[m - 1]?.name || '';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const totalPaid = summary ? summary.total_paid : payments.data.reduce((sum, p) => sum + parseFloat(p.total_amount.toString()), 0);
    const totalNetSalary = summary ? summary.total_net_salary : payments.data.reduce((sum, p) => sum + parseFloat(p.net_salary.toString()), 0);
    const totalBaseSalary = summary ? summary.total_base_salary : payments.data.reduce((sum, p) => sum + parseFloat(p.base_salary.toString()), 0);
    const totalPF = summary ? summary.total_employee_pf : payments.data.reduce((sum, p) => sum + parseFloat(p.provident_fund_deduction.toString()), 0);
    const totalEmployerPF = summary ? summary.total_employer_pf : payments.data.reduce((sum, p) => sum + parseFloat(p.employer_pf_contribution.toString()), 0);
    const totalRecords = summary ? summary.total_count : payments.total;

    const filteredTeachers = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.employee_id.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.designation.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Salary_Payments_${filters.month ? getMonthName(filters.month) : 'All'}_${filters.year || 'All'}`,
    });

    return (
        <AuthenticatedLayout>
            <Head title="Salary Payments" />

            {/* Hidden Print Component - positioned off-screen */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <PrintSalaryPayments ref={printRef} payments={payments.data} filters={filters} />
            </div>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Salary Payments</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage teacher salary payments</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            {canMutate && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const currentM = filters.month ? Number(filters.month) : (filterMonth ? Number(filterMonth) : 8);
                                        const currentY = filters.year ? Number(filters.year) : (filterYear ? Number(filterYear) : new Date().getFullYear());
                                        setShiftData({
                                            from_month: currentM,
                                            from_year: currentY,
                                            target_month: currentM === 8 ? 7 : (currentM === 7 ? 8 : (currentM > 1 ? currentM - 1 : 12)),
                                            target_year: currentY,
                                        });
                                        setShowShiftModal(true);
                                    }}
                                    variant="ghost"
                                    className={`border ${selectedPaymentIds.length > 0 ? 'border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold' : 'border-gray-300 hover:bg-gray-50'}`}
                                    icon={<RefreshCw className="w-4 h-4" />}
                                >
                                    {selectedPaymentIds.length > 0
                                        ? `Change Month (${selectedPaymentIds.length})`
                                        : (filters.month && filters.year
                                            ? `Change Month (${getMonthName(filters.month)})`
                                            : 'Change Month')}
                                </Button>
                            )}
                            <Button
                                onClick={handlePrint}
                                variant="ghost"
                                className="border border-gray-300 hover:bg-gray-50"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print
                            </Button>
                            <Button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Pay Salary
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Month Filter Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Salary Month</span>
                            {filterMonth && (
                                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                                    {getMonthName(Number(filterMonth))} {filterYear}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 font-medium">Year:</span>
                            <select
                                value={filterYear}
                                onChange={(e) => applyFilters({ year: e.target.value })}
                                className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                            >
                                {(availableYears && availableYears.length > 0 ? availableYears : [2026, 2025, 2024, 2023]).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
                            <span className="text-gray-500 font-medium hidden sm:inline">Rows:</span>
                            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                                {(['25', '50', '100', 'all'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => applyFilters({ per_page: opt })}
                                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer ${
                                            perPage === opt
                                                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {opt === 'all' ? 'All' : opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Month Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1">
                        <button
                            type="button"
                            onClick={() => applyFilters({ month: '' })}
                            className={`shrink-0 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                !filterMonth
                                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium'
                            }`}
                        >
                            <span>All Months</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                !filterMonth ? 'bg-indigo-700/60 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {summary?.total_count ?? payments.total}
                            </span>
                        </button>

                        {MONTH_NAMES.map((m) => {
                            const isSelected = filterMonth === String(m.value);
                            const count = monthCounts?.[m.value]?.count ?? 0;
                            const hasData = count > 0;

                            return (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => applyFilters({ month: String(m.value) })}
                                    className={`shrink-0 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                                            : hasData
                                                ? 'bg-slate-100 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/60 font-medium'
                                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 border border-dashed border-gray-200 font-normal'
                                    }`}
                                >
                                    <span>{m.short}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                        isSelected
                                            ? 'bg-indigo-700/60 text-white'
                                            : hasData
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-gray-200/80 text-gray-400'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* KPI Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
                        <p className="text-[11px] font-medium text-gray-500 mb-0.5">Total Disbursed</p>
                        <p className="text-xl font-bold text-indigo-700">৳{formatAmount(totalPaid)}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{totalRecords} payment{totalRecords !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
                        <p className="text-[11px] font-medium text-gray-500 mb-0.5">Net Salary Paid</p>
                        <p className="text-xl font-bold text-gray-900">৳{formatAmount(totalNetSalary)}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">To Staff Accounts</span>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
                        <p className="text-[11px] font-medium text-gray-500 mb-0.5">Base Salary</p>
                        <p className="text-xl font-bold text-gray-800">৳{formatAmount(totalBaseSalary)}</p>
                        <span className="text-[10px] text-gray-400 font-medium">Gross Scale</span>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
                        <p className="text-[11px] font-medium text-gray-500 mb-0.5">Employee PF (5%)</p>
                        <p className="text-xl font-bold text-rose-600">৳{formatAmount(totalPF)}</p>
                        <span className="text-[10px] text-rose-500 font-medium">Staff Deduction</span>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
                        <p className="text-[11px] font-medium text-gray-500 mb-0.5">Employer PF (5%)</p>
                        <p className="text-xl font-bold text-blue-600">৳{formatAmount(totalEmployerPF)}</p>
                        <span className="text-[10px] text-blue-500 font-medium">School Match</span>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
                        <p className="text-[11px] font-medium text-gray-500 mb-0.5">Total PF Added</p>
                        <p className="text-xl font-bold text-purple-700">৳{formatAmount(totalPF + totalEmployerPF)}</p>
                        <span className="text-[10px] text-purple-600 font-medium">10% Combined PF</span>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by staff name, employee ID, designation..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters({ search: '' });
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => applyFilters()}
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
                                icon={<Filter className="w-3.5 h-3.5" />}
                            >
                                Search
                            </Button>
                            {(search || filterMonth) && (
                                <Button
                                    type="button"
                                    onClick={handleClearFilters}
                                    size="sm"
                                    variant="ghost"
                                    className="border border-gray-300 text-xs px-3 hover:bg-gray-50"
                                    title="Reset all filters"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    {canMutate && (
                                        <th className="px-4 py-3 text-center w-10">
                                            <input
                                                type="checkbox"
                                                checked={payments.data.length > 0 && selectedPaymentIds.length === payments.data.length}
                                                onChange={toggleSelectAllPayments}
                                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                title="Select all on this page"
                                            />
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-left font-medium text-gray-900">Employee</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-900">Period</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-900">Base Salary</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-900">Employee PF</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-900">Net Salary</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-900">Employer PF</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-900">Total Paid</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-900">Date</th>
                                    {canMutate && (
                                        <th className="px-4 py-3 text-center font-medium text-gray-900 w-16">Edit</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.data.length > 0 ? payments.data.map((payment) => (
                                    <tr key={payment.id} className={`hover:bg-gray-50/80 transition-colors ${selectedPaymentIds.includes(payment.id) ? 'bg-amber-50/60' : ''}`}>
                                        {canMutate && (
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPaymentIds.includes(payment.id)}
                                                    onChange={() => toggleSelectPayment(payment.id)}
                                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                                                    {payment.staff.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 leading-tight">{payment.staff.user.name}</p>
                                                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">{payment.staff.employee_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                                {getMonthName(payment.month)} {payment.year}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                                            ৳{formatAmount(parseFloat(payment.base_salary.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-rose-600 font-medium tabular-nums">
                                            ৳{formatAmount(parseFloat(payment.provident_fund_deduction.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                                            ৳{formatAmount(parseFloat(payment.net_salary.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-blue-600 font-medium tabular-nums">
                                            ৳{formatAmount(parseFloat(payment.employer_pf_contribution.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-indigo-700 tabular-nums">
                                            ৳{formatAmount(parseFloat(payment.total_amount.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {formatDate(payment.payment_date)}
                                        </td>
                                        {canMutate && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(payment)}
                                                    className="text-amber-700 hover:text-amber-900 p-1.5 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                                    title="Edit salary payment"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={canMutate ? 10 : 8} className="py-12 px-4 text-center">
                                            <div className="max-w-md mx-auto space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center border border-slate-200">
                                                    <Calendar className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        {filterMonth
                                                            ? `${getMonthName(Number(filterMonth))} ${filterYear || new Date().getFullYear()} - No salary payments found`
                                                            : 'No salary payments found'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                                        {filterMonth
                                                            ? `Salaries for ${getMonthName(Number(filterMonth))} ${filterYear || ''} have not been disbursed yet.`
                                                            : 'No salary payment records match your current search filters.'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 pt-2">
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                month: filterMonth ? Number(filterMonth) : (new Date().getMonth() + 1),
                                                                year: filterYear ? Number(filterYear) : new Date().getFullYear(),
                                                            }));
                                                            setShowModal(true);
                                                        }}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                                                        icon={<Plus className="w-3.5 h-3.5" />}
                                                    >
                                                        {filterMonth
                                                            ? `Pay Salary for ${getMonthName(Number(filterMonth))}`
                                                            : 'Pay Salary'}
                                                    </Button>
                                                    {(search || filterMonth) && (
                                                        <Button
                                                            type="button"
                                                            onClick={handleClearFilters}
                                                            variant="ghost"
                                                            className="border border-gray-300 text-xs"
                                                        >
                                                            View All Months
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <IndexPagination
                        links={payments.links ?? []}
                        from={payments.from}
                        to={payments.to}
                        total={payments.total}
                        lastPage={payments.last_page}
                    />
                </div>

                {/* Pay Salary Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Pay Teacher Salary
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">Process monthly salary with automatic 5% PF calculation</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Bulk Payment Toggle */}
                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                                        <span className="text-sm font-medium text-gray-700">
                                            Pay Multiple Teachers at Once
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleBulkPaymentToggle}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                bulkPayment ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    bulkPayment ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Teacher Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {bulkPayment ? 'Select Teachers' : 'Teacher'} <span className="text-red-500">*</span>
                                        </label>

                                        {/* Search Teachers */}
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                placeholder="Search by name, ID, or designation..."
                                                value={teacherSearch}
                                                onChange={(e) => setTeacherSearch(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {bulkPayment ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-300">
                                                    <span className="text-sm text-gray-600">
                                                        {selectedTeachers.length} of {filteredTeachers.length} selected
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={handleSelectAll}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        {selectedTeachers.length === filteredTeachers.length ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 rounded border border-gray-300 p-2">
                                                    {filteredTeachers.map((teacher) => (
                                                        <label
                                                            key={teacher.id}
                                                            className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors border border-gray-300"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTeachers.includes(teacher.id)}
                                                                onChange={() => handleTeacherSelect(teacher.id)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                                                                <p className="text-xs text-gray-600">
                                                                    {teacher.employee_id} • {teacher.designation} • Salary: ৳{formatAmount(teacher.salary)}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.staff_id}
                                                onChange={(e) => handleTeacherChange(e.target.value)}
                                                required={!bulkPayment}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                <option value="">Select Teacher</option>
                                                {filteredTeachers.map((teacher) => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.name} ({teacher.employee_id}) - {teacher.designation} - Salary: ৳{formatAmount(teacher.salary)}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Month/Year */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Month <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.month}
                                                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                                required
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                    <option key={m} value={m}>{getMonthName(m)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Year <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                                required
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                {[2023, 2024, 2025, 2026].map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Base Salary - Only for Single Payment (Read-only) */}
                                    {!bulkPayment && selectedTeacher && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Base Salary
                                            </label>
                                            <input
                                                type="text"
                                                value={`৳${formatAmount(parseFloat(formData.base_salary))}`}
                                                disabled
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                            />
                                        </div>
                                    )}

                                    {/* PF Calculation Summary */}
                                    {bulkPayment && selectedTeachers.length > 0 ? (
                                        (() => {
                                            const selectedTeachersList = teachers.filter(t => selectedTeachers.includes(t.id));
                                            const totalBaseSalary = selectedTeachersList.reduce((sum, t) => sum + parseFloat(t.salary.toString()), 0);
                                            const totalEmployeePF = totalBaseSalary * 0.05;
                                            const totalEmployerPF = totalBaseSalary * 0.05;
                                            const totalNetSalary = totalBaseSalary - totalEmployeePF;
                                            const totalAmount = totalBaseSalary + totalEmployerPF;

                                            return (
                                                <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3">
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        Bulk Payment Summary
                                                    </h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between py-1 border-b border-blue-200">
                                                            <span className="text-gray-700">Selected Teachers:</span>
                                                            <span className="font-semibold text-gray-900">{selectedTeachers.length}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1">
                                                            <span className="text-gray-700">Total Base Salary:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                ৳{formatAmount(totalBaseSalary)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between py-1">
                                                            <span className="text-gray-700">Total Employee PF (5%):</span>
                                                            <span className="font-semibold text-red-600">
                                                                -৳{formatAmount(totalEmployeePF)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between py-1">
                                                            <span className="text-gray-700">Total Employer PF (5%):</span>
                                                            <span className="font-semibold text-blue-600">
                                                                +৳{formatAmount(totalEmployerPF)}
                                                            </span>
                                                        </div>
                                                        <div className="border-t border-blue-300 pt-2 mt-2 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold text-gray-900">Total Net Salary (Teachers Receive):</span>
                                                                <span className="font-bold text-green-600">
                                                                    ৳{formatAmount(totalNetSalary)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold text-gray-900">Total Amount (From Account):</span>
                                                                <span className="font-bold text-gray-900">
                                                                    ৳{formatAmount(totalAmount)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : selectedTeacher && formData.base_salary && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
                                            <h4 className="font-semibold text-gray-900 text-sm mb-3">
                                                Provident Fund Calculation (5% each)
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Base Salary:</span>
                                                    <span className="font-medium">৳{formatAmount(parseFloat(formData.base_salary))}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Employee PF (5%):</span>
                                                    <span className="font-medium text-red-600">-৳{formatAmount(parseFloat(employeePF))}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Employer PF (5%):</span>
                                                    <span className="font-medium text-blue-600">+৳{formatAmount(parseFloat(employerPF))}</span>
                                                </div>
                                                <div className="border-t border-blue-300 pt-2 mt-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-900">Net Salary (Teacher Receives):</span>
                                                        <span className="font-bold text-green-600">৳{formatAmount(parseFloat(netSalary))}</span>
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span className="font-semibold text-gray-900">Total Amount (From Account):</span>
                                                        <span className="font-bold text-gray-900">৳{formatAmount(parseFloat(totalAmount))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Details */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Account <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.account_id}
                                            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.account_name} ({account.account_number})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Method <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.payment_method}
                                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cheque">Cheque</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.payment_date}
                                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                                        <input
                                            type="text"
                                            value={formData.reference_number}
                                            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                            placeholder="Cheque/Transaction number..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                                        <textarea
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                                            placeholder="Additional notes..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-300 mt-4">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                            disabled={bulkPayment ? selectedTeachers.length === 0 : !formData.staff_id}
                                        >
                                            {bulkPayment ? `Process ${selectedTeachers.length} Payments` : 'Process Payment'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium border border-gray-400"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Shift Month Modal */}
                {showShiftModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full max-h-[92vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Change Salary Month / Period
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                স্যালারি মাস বা পিরিয়ড এক ক্লিকে পরিবর্তন ও সংশোধন করুন
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => !shifting && setShowShiftModal(false)}
                                        disabled={shifting}
                                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleShiftMonth} className="mt-4 space-y-4">
                                    {selectedPaymentIds.length > 0 ? (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                                            <div className="font-semibold flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                                                <span>Moving {selectedPaymentIds.length} Selected Record(s)</span>
                                            </div>
                                            <p className="text-[11px] text-amber-800">
                                                আপনি টেবিল থেকে মোট <strong>{selectedPaymentIds.length}</strong> টি পেমেন্ট নির্বাচন করেছেন। এগুলো নিচের নতুন মাসে স্থানান্তরিত হবে।
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-900">
                                                <div className="font-semibold flex items-center gap-1.5 mb-1">
                                                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                                                    <span>Bulk Move by Month (পুরো মাসের সকল স্যালারি পরিবর্তন)</span>
                                                </div>
                                                <p className="text-[11px] text-indigo-700">
                                                    বর্তমান ভুল মাসের সমস্ত স্যালারি রেকর্ড একসাথে নতুন সঠিক মাসে স্থানান্তরিত হবে।
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                    1. Source Month (কোন মাসের স্যালারি সরাবেন)
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                                            Current Month <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={shiftData.from_month}
                                                            onChange={(e) => setShiftData({ ...shiftData, from_month: Number(e.target.value) })}
                                                            required
                                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                        >
                                                            {MONTH_NAMES.map((m) => {
                                                                const count = monthCounts?.[m.value]?.count ?? 0;
                                                                return (
                                                                    <option key={m.value} value={m.value}>
                                                                        {m.name} {count > 0 ? `(${count} records)` : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                                            Current Year <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={shiftData.from_year}
                                                            onChange={(e) => setShiftData({ ...shiftData, from_year: Number(e.target.value) })}
                                                            required
                                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                        >
                                                            {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                                            {selectedPaymentIds.length > 0 ? 'Target Period (নতুন মাস ও বছর)' : '2. Target Month (কোন মাসে স্থানান্তর করবেন)'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                                                    Target Month <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={shiftData.target_month}
                                                    onChange={(e) => setShiftData({ ...shiftData, target_month: Number(e.target.value) })}
                                                    required
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                                                >
                                                    {MONTH_NAMES.map((m) => (
                                                        <option key={m.value} value={m.value}>
                                                            {m.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                                                    Target Year <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={shiftData.target_year}
                                                    onChange={(e) => setShiftData({ ...shiftData, target_year: Number(e.target.value) })}
                                                    required
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                                                >
                                                    {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transfer Preview Badge */}
                                    <div className="p-2.5 bg-gray-100 rounded-lg text-xs flex items-center justify-between text-gray-700">
                                        <span className="font-medium">
                                            {selectedPaymentIds.length > 0
                                                ? `${selectedPaymentIds.length} Selected Records`
                                                : `${getMonthName(shiftData.from_month)} ${shiftData.from_year}`}
                                        </span>
                                        <span className="font-bold text-amber-600">➔</span>
                                        <span className="font-semibold text-indigo-700">
                                            {getMonthName(shiftData.target_month)} {shiftData.target_year}
                                        </span>
                                    </div>

                                    <div className="text-[11px] text-gray-500">
                                        * যুক্ত অ্যাকাউন্টিং লেনদেন (Accounting Transactions) এবং ভাউচার বিবরণী স্বয়ংক্রিয়ভাবে আপডেট হবে।
                                    </div>

                                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                                        <Button
                                            type="submit"
                                            disabled={shifting}
                                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2.5"
                                        >
                                            {shifting ? 'Updating Month...' : 'Confirm Month Change'}
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={shifting}
                                            onClick={() => setShowShiftModal(false)}
                                            variant="ghost"
                                            className="px-5 border border-gray-300 text-xs py-2.5"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {/* Edit Single Salary Payment Modal */}
                {editingPayment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-xl w-full max-h-[92vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                                            <Pencil className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Edit Salary Payment
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Modify salary details, month, or account
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => !editSubmitting && setEditingPayment(null)}
                                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                                    {/* Staff Info Banner */}
                                    <div className="flex items-center gap-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                                            {editingPayment.staff?.user?.name ? editingPayment.staff.user.name.charAt(0) : 'S'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {editingPayment.staff?.user?.name || 'Staff Member'}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                ID: {editingPayment.staff?.employee_id || ''}
                                                {editingPayment.staff?.designation ? ` • ${editingPayment.staff.designation}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Month & Year */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Month <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editFormData.month}
                                                onChange={(e) => setEditFormData({ ...editFormData, month: Number(e.target.value) })}
                                                required
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                                                    <option key={m} value={m}>
                                                        {getMonthName(m)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Year <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editFormData.year}
                                                onChange={(e) => setEditFormData({ ...editFormData, year: Number(e.target.value) })}
                                                required
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                            >
                                                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Base Salary */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Base Salary <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={editFormData.base_salary}
                                            onChange={(e) => setEditFormData({ ...editFormData, base_salary: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Recalculated Breakdown */}
                                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 text-xs space-y-1.5">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Employee PF (5% deduction):</span>
                                            <span className="font-semibold text-rose-600">-৳{formatAmount(editEmployeePF)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Employer PF (5% contribution):</span>
                                            <span className="font-semibold text-blue-600">+৳{formatAmount(editEmployerPF)}</span>
                                        </div>
                                        <div className="border-t border-indigo-200/80 pt-1.5 flex justify-between font-bold text-gray-900">
                                            <span>Net Salary (Payable):</span>
                                            <span className="text-emerald-700">৳{formatAmount(editNetSalary)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Total Paid (From Account):</span>
                                            <span className="text-indigo-700">৳{formatAmount(editTotalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Payment Account & Method */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Account <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editFormData.account_id}
                                                onChange={(e) => setEditFormData({ ...editFormData, account_id: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                            >
                                                {accounts.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.account_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Method <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editFormData.payment_method}
                                                onChange={(e) => setEditFormData({ ...editFormData, payment_method: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cash">Cash</option>
                                                <option value="cheque">Cheque</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Date & Ref */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Payment Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={editFormData.payment_date}
                                                onChange={(e) => setEditFormData({ ...editFormData, payment_date: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.reference_number}
                                                onChange={(e) => setEditFormData({ ...editFormData, reference_number: e.target.value })}
                                                placeholder="Cheque / Transaction ID..."
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Remarks
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.remarks}
                                            onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                                            placeholder="Notes or reason for edit..."
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                                        <Button
                                            type="submit"
                                            disabled={editSubmitting}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2.5"
                                        >
                                            {editSubmitting ? 'Saving...' : 'Save & Recalculate'}
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={editSubmitting}
                                            onClick={() => setEditingPayment(null)}
                                            variant="ghost"
                                            className="px-5 border border-gray-300 text-xs py-2.5"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
