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
import { Plus, Search, DollarSign, User as UserIcon, Calendar, Wallet, Printer, Filter, X, Pencil } from 'lucide-react';
import { useCanEditOrDelete } from '@/hooks/useCanEditOrDelete';

function route(name: string, params?: any): string {
    if (name === 'salary-payments.store') return '/salary-payments';
    if (name === 'salary-payments.index') return '/salary-payments';
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
    staff: {
        user: { name: string };
        employee_id: string;
    };
    month: number;
    year: number;
    base_salary: number;
    provident_fund_deduction: number;
    employer_pf_contribution: number;
    net_salary: number;
    total_amount: number;
    payment_date: string;
    account: { account_name: string };
    payment_method: string;
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
    teachers: Teacher[];
    accounts: Account[];
    filters: {
        search?: string;
        month?: number;
        year?: number;
    };
}

export default function Index({ payments, teachers, accounts, filters }: SalaryPaymentsIndexProps) {
    const canMutate = useCanEditOrDelete();
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [filterMonth, setFilterMonth] = useState(filters.month?.toString() || '');
    const [filterYear, setFilterYear] = useState(filters.year?.toString() || '');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [bulkPayment, setBulkPayment] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
    const printRef = useRef<HTMLDivElement>(null);

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

    const handleFilter = () => {
        router.get(route('salary-payments.index'), {
            search: search,
            month: filterMonth,
            year: filterYear,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFilterMonth('');
        setFilterYear('');
        router.get(route('salary-payments.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const totalPaid = payments.data.reduce((sum, p) => sum + parseFloat(p.total_amount.toString()), 0);
    const totalNetSalary = payments.data.reduce((sum, p) => sum + parseFloat(p.net_salary.toString()), 0);
    const totalBaseSalary = payments.data.reduce((sum, p) => sum + parseFloat(p.base_salary.toString()), 0);
    const totalPF = payments.data.reduce((sum, p) => sum + parseFloat(p.provident_fund_deduction.toString()), 0);
    const totalEmployerPF = payments.data.reduce((sum, p) => sum + parseFloat(p.employer_pf_contribution.toString()), 0);

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
                        <div className="flex gap-3">
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

                {/* Stats Cards - Minimal */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Total Payments</p>
                        <p className="text-2xl font-semibold text-gray-900">{payments.total}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Base Salary</p>
                        <p className="text-2xl font-semibold text-gray-900">৳{formatAmount(totalBaseSalary)}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Employee PF (5%)</p>
                        <p className="text-2xl font-semibold text-gray-900">৳{formatAmount(totalPF)}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Employer PF (5%)</p>
                        <p className="text-2xl font-semibold text-gray-900">৳{formatAmount(totalEmployerPF)}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Total Paid</p>
                        <p className="text-2xl font-semibold text-gray-900">৳{formatAmount(totalPaid)}</p>
                    </div>
                </div>

                {/* Filters - Minimal */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Months</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <option key={m} value={m}>{getMonthName(m)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Years</option>
                                {[2023, 2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleFilter}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            >
                                Filter
                            </Button>
                            {(search || filterMonth || filterYear) && (
                                <Button
                                    onClick={handleClearFilters}
                                    size="sm"
                                    variant="ghost"
                                    className="border border-gray-300"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payments Table - Minimal */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
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
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{payment.staff.user.name}</p>
                                                <p className="text-xs text-gray-500">{payment.staff.employee_id}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {getMonthName(payment.month)} {payment.year}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            ৳{formatAmount(parseFloat(payment.base_salary.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                                            ৳{formatAmount(parseFloat(payment.provident_fund_deduction.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            ৳{formatAmount(parseFloat(payment.net_salary.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                            ৳{formatAmount(parseFloat(payment.employer_pf_contribution.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                                            ৳{formatAmount(parseFloat(payment.total_amount.toString()))}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {formatDate(payment.payment_date)}
                                        </td>
                                        {canMutate && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.visit(
                                                            typeof route !== 'undefined'
                                                                ? route('salary-payments.edit', payment.id)
                                                                : `/salary-payments/${payment.id}/edit`
                                                        )
                                                    }
                                                    className="text-amber-700 hover:text-amber-900 p-1.5 hover:bg-amber-50 rounded transition"
                                                    title="Edit salary payment"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={canMutate ? 9 : 8} className="px-4 py-8 text-center text-gray-500">
                                            No salary payments found
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
            </div>
        </AuthenticatedLayout>
    );
}
