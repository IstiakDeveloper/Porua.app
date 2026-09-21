import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import { formatAmount } from '@/lib/formatCurrency';
import {
    DollarSign,
    Receipt,
    Plus,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Layers,
    User,
    ArrowUpRight,
    X,
} from 'lucide-react';

interface FeeCollectionItem {
    id: number;
    receipt_number: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_id: string;
        phone?: string;
    };
    batch?: {
        id: number;
        name: string;
        course?: { name: string };
    };
    installment_title?: string;
    month?: number;
    year?: number;
    amount: number;
    discount: number;
    paid_amount: number;
    payment_date: string;
    payment_method: string;
    account?: { account_name: string };
    collector?: { name: string };
}

interface Batch {
    id: number;
    name: string;
    course?: { name: string; standard_fee: number };
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Props {
    collections: {
        data: FeeCollectionItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    batches: Batch[];
    accounts: Account[];
    filters: {
        batch_id?: string | number;
        month?: string | number;
        year?: string | number;
        search?: string;
    };
    metrics: {
        total_collected: number;
        this_month_collected: number;
    };
}

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function Index({
    collections,
    batches,
    accounts,
    filters,
    metrics,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBatch, setSelectedBatch] = useState(filters.batch_id || '');
    const [selectedMonth, setSelectedMonth] = useState(filters.month || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');

    // Collect Fee Modal
    const [collectModalOpen, setCollectModalOpen] = useState(false);
    const [studentsInBatch, setStudentsInBatch] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [enrollmentInfo, setEnrollmentInfo] = useState<{ agreed_fee?: number; previous_paid?: number } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_id: '',
        student_id: '',
        collection_mode: 'monthly' as 'monthly' | 'installment',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        installment_title: '1st Installment',
        amount: 0,
        discount: 0,
        paid_amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        account_id: accounts[0]?.id || '',
        remarks: '',
    });

    const handleFilterSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/coaching/fees', {
            search: search || undefined,
            batch_id: selectedBatch || undefined,
            month: selectedMonth || undefined,
            year: selectedYear || undefined,
        }, { preserveState: true });
    };

    // When batch changes in modal, load active enrollments for that batch
    const handleBatchSelect = async (batchId: string | number) => {
        setData('batch_id', batchId);
        setData('student_id', '');
        setEnrollmentInfo(null);
        if (!batchId) {
            setStudentsInBatch([]);
            return;
        }

        setLoadingStudents(true);
        try {
            const res = await fetch(`/batches/${batchId}`);
            // If needed, we can also fetch from show route or an endpoint
        } catch (e) {
            // fallback
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStudentSelect = async (studentId: string | number) => {
        setData('student_id', studentId);
        if (!studentId || !data.batch_id) {
            setEnrollmentInfo(null);
            return;
        }

        try {
            const res = await fetch(`/api/coaching/enrollment?student_id=${studentId}&batch_id=${data.batch_id}`);
            if (res.ok) {
                const info = await res.json();
                setEnrollmentInfo(info);
                const suggestedFee = info.agreed_fee || info.course_fee || 0;
                setData((prev) => ({
                    ...prev,
                    student_id: studentId,
                    amount: suggestedFee,
                    paid_amount: suggestedFee,
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAmountChange = (gross: number, discount: number) => {
        const net = Math.max(0, gross - discount);
        setData((prev) => ({
            ...prev,
            amount: gross,
            discount: discount,
            paid_amount: net,
        }));
    };

    const handleFeeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/coaching/fees', {
            onSuccess: () => {
                setCollectModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Coaching Batch Fee Collections" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                            <Receipt className="w-7 h-7 text-indigo-600" />
                            <span>Coaching Batch Fee Collections</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Collect course & monthly tuition fees from enrolled batch students with instant receipt vouchers.
                        </p>
                    </div>

                    <Button
                        onClick={() => setCollectModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Collect Batch Fee</span>
                    </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">This Month's Batch Collections</span>
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-emerald-700">৳{formatAmount(metrics.this_month_collected)}</span>
                            <p className="text-xs text-emerald-600 mt-1">Received from active coaching batches</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">All-Time Batch Collections</span>
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-indigo-700">৳{formatAmount(metrics.total_collected)}</span>
                            <p className="text-xs text-indigo-500 mt-1">Total accumulated revenue across all courses</p>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card>
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Search Student / Receipt
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name, ID, phone, RCP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Filter by Batch
                            </label>
                            <select
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Batches</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.course?.name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Any Month</option>
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Any Year</option>
                                {[2024, 2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-1.5">
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Collections Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <th className="py-3 px-4">Receipt No</th>
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3 px-4">Batch / Course</th>
                                    <th className="py-3 px-4">Period / Title</th>
                                    <th className="py-3 px-4 text-right">Amount Paid</th>
                                    <th className="py-3 px-4">Account</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {collections.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-gray-400">
                                            No batch fee collections match your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    collections.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition">
                                            <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">
                                                {item.receipt_number}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-gray-900">
                                                    {item.student ? `${item.student.first_name} ${item.student.last_name}` : 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">ID: {item.student?.student_id}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-800">{item.batch?.name || 'Batch'}</div>
                                                <div className="text-xs text-gray-500">{item.batch?.course?.name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.month && item.year ? (
                                                    <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                                        {MONTHS.find(m => m.value === item.month)?.label} {item.year}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                                        {item.installment_title || 'Course Installment'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-emerald-700">
                                                ৳{formatAmount(item.paid_amount)}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-600">
                                                <div>{item.account?.account_name || 'Cash'}</div>
                                                <div className="capitalize text-gray-400">{item.payment_method.replace('_', ' ')}</div>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">
                                                {item.payment_date}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Link
                                                    href={`/fee-collections/${item.id}/receipt`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition"
                                                >
                                                    <Receipt className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Collect Batch Fee Modal */}
            <Modal show={collectModalOpen} onClose={() => setCollectModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleFeeSubmit} className="p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Collect Coaching Fee</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Select batch, student, and payment details to record collection and generate receipt
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCollectModalOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Batch & Student Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Select Batch *
                            </label>
                            <select
                                value={data.batch_id}
                                onChange={(e) => handleBatchSelect(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">-- Choose Batch --</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.course?.name})
                                    </option>
                                ))}
                            </select>
                            {errors.batch_id && <p className="text-xs text-red-500 mt-1">{errors.batch_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Student ID or Number *
                            </label>
                            <input
                                type="number"
                                placeholder="Student Database ID"
                                value={data.student_id}
                                onChange={(e) => handleStudentSelect(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            {errors.student_id && <p className="text-xs text-red-500 mt-1">{errors.student_id}</p>}
                        </div>
                    </div>

                    {/* Enrollment details banner if found */}
                    {enrollmentInfo && (
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-900 grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-indigo-600 block">Agreed Batch Fee:</span>
                                <span className="font-bold text-sm">৳{formatAmount(enrollmentInfo.agreed_fee || 0)}</span>
                            </div>
                            <div>
                                <span className="text-indigo-600 block">Previously Paid:</span>
                                <span className="font-bold text-sm text-emerald-700">৳{formatAmount(enrollmentInfo.previous_paid || 0)}</span>
                            </div>
                        </div>
                    )}

                    {/* Mode Toggle: Monthly Tuition vs Course Installment */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Billing Scheme *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setData('collection_mode', 'monthly')}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                                    data.collection_mode === 'monthly'
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Monthly Tuition Fee
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('collection_mode', 'installment')}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                                    data.collection_mode === 'installment'
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Course Installment / Package
                            </button>
                        </div>
                    </div>

                    {/* Conditional fields based on billing scheme */}
                    {data.collection_mode === 'monthly' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Month *
                                </label>
                                <select
                                    value={data.month}
                                    onChange={(e) => setData('month', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Year *
                                </label>
                                <select
                                    value={data.year}
                                    onChange={(e) => setData('year', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                >
                                    {[2024, 2025, 2026, 2027].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Installment Title / Package Description *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 1st Installment, Crash Course Full Fee, Mock Exam Fee"
                                value={data.installment_title}
                                onChange={(e) => setData('installment_title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    )}

                    {/* Amount & Discount */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Gross Fee (BDT) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.amount}
                                onChange={(e) => handleAmountChange(Number(e.target.value), data.discount)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Discount (BDT)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.discount}
                                onChange={(e) => handleAmountChange(data.amount, Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Net Paid (BDT) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.paid_amount}
                                onChange={(e) => setData('paid_amount', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Account & Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Receiving Account *
                            </label>
                            <select
                                value={data.account_id}
                                onChange={(e) => setData('account_id', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.account_name} (Bal: ৳{formatAmount(acc.current_balance)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Payment Method *
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="cash">Cash</option>
                                <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    {/* Payment Date & Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Payment Date *
                            </label>
                            <input
                                type="date"
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Remarks
                            </label>
                            <input
                                type="text"
                                placeholder="Optional note or reference"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => setCollectModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{processing ? 'Processing...' : 'Collect & Print Receipt'}</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
