import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import { formatAmount } from '@/lib/formatCurrency';
import {
    DollarSign,
    Calculator,
    CheckCircle2,
    Clock,
    UserCheck,
    Layers,
    ArrowUpRight,
    Search,
    Filter,
    Calendar,
    AlertCircle,
    Building,
    FileText,
    Trash2,
    X,
} from 'lucide-react';

interface BatchCalculation {
    batch_id: number;
    batch_name: string;
    course_name: string;
    teacher_id: number;
    teacher_name: string;
    remuneration_type: string;
    commission_rate: number;
    total_collection: number;
    calculated_commission: number;
    already_paid: number;
    due_amount: number;
}

interface TeacherPayout {
    id: number;
    payout_voucher_no: string;
    teacher: { id: number; first_name: string; last_name: string; full_name?: string };
    batch?: { id: number; name: string; course?: { name: string } };
    period_month: number;
    period_year: number;
    total_batch_collection: number;
    remuneration_type: string;
    commission_rate: number;
    calculated_amount: number;
    bonus_amount: number;
    deduction_amount: number;
    paid_amount: number;
    payout_date: string;
    payment_method: string;
    account?: { id: number; account_name: string };
    status: string;
    notes?: string;
    creator?: { name: string };
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Props {
    calculationSheet: BatchCalculation[];
    payouts: {
        data: TeacherPayout[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    teachers: Teacher[];
    accounts: Account[];
    filters: {
        month: number;
        year: number;
        teacher_id?: string | number;
    };
    metrics: {
        total_estimated: number;
        total_paid: number;
        total_due: number;
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
    calculationSheet,
    payouts,
    teachers,
    accounts,
    filters,
    metrics,
}: Props) {
    const [activeTab, setActiveTab] = useState<'sheet' | 'ledger'>('sheet');
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);
    const [selectedTeacher, setSelectedTeacher] = useState(filters.teacher_id || '');

    // Disburse modal state
    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [activeTarget, setActiveTarget] = useState<BatchCalculation | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        teacher_id: 0,
        batch_id: 0,
        period_month: filters.month,
        period_year: filters.year,
        total_batch_collection: 0,
        remuneration_type: 'percentage',
        commission_rate: 0,
        calculated_amount: 0,
        bonus_amount: 0,
        deduction_amount: 0,
        paid_amount: 0,
        payout_date: new Date().toISOString().split('T')[0],
        account_id: accounts[0]?.id || '',
        payment_method: 'cash',
        notes: '',
    });

    const handleFilterChange = (m: number, y: number, t: string | number) => {
        router.get('/teacher-payouts', {
            month: m,
            year: y,
            teacher_id: t || undefined,
        }, { preserveState: true });
    };

    const openDisburseModal = (item: BatchCalculation) => {
        setActiveTarget(item);
        const netCalculated = Math.max(0, item.due_amount);
        setData({
            teacher_id: item.teacher_id,
            batch_id: item.batch_id,
            period_month: selectedMonth,
            period_year: selectedYear,
            total_batch_collection: item.total_collection,
            remuneration_type: item.remuneration_type,
            commission_rate: item.commission_rate,
            calculated_amount: item.calculated_commission,
            bonus_amount: 0,
            deduction_amount: 0,
            paid_amount: netCalculated,
            payout_date: new Date().toISOString().split('T')[0],
            account_id: accounts[0]?.id || '',
            payment_method: 'cash',
            notes: '',
        });
        setPayoutModalOpen(true);
    };

    const handleBonusOrDeductionChange = (bonus: number, deduction: number) => {
        if (!activeTarget) return;
        const base = activeTarget.due_amount;
        const adjusted = Math.max(0, base + bonus - deduction);
        setData((prev) => ({
            ...prev,
            bonus_amount: bonus,
            deduction_amount: deduction,
            paid_amount: adjusted,
        }));
    };

    const handleDisburseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher-payouts', {
            onSuccess: () => {
                setPayoutModalOpen(false);
                reset();
            },
        });
    };

    const handleCancelPayout = (payoutId: number, voucher: string) => {
        if (confirm(`Are you sure you want to cancel payout ${voucher}? This will reverse the expense and restore the account balance.`)) {
            router.delete(`/teacher-payouts/${payoutId}`);
        }
    };

    const getRemunerationBadge = (type: string, rate: number) => {
        if (type === 'percentage') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {rate}% Share
                </span>
            );
        }
        if (type === 'fixed') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    Fixed ৳{formatAmount(rate)}
                </span>
            );
        }
        if (type === 'per_class') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    ৳{formatAmount(rate)} / Class
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                No Commission
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Remuneration & Payouts" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                            <DollarSign className="w-7 h-7 text-indigo-600" />
                            <span>Teacher Remuneration & Payouts</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Calculate batch collections, revenue-share commissions, and disburse vouchers into accounting.
                        </p>
                    </div>

                    {/* Month & Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <select
                            value={selectedMonth}
                            onChange={(e) => {
                                const m = Number(e.target.value);
                                setSelectedMonth(m);
                                handleFilterChange(m, selectedYear, selectedTeacher);
                            }}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                            {MONTHS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                const y = Number(e.target.value);
                                setSelectedYear(y);
                                handleFilterChange(selectedMonth, y, selectedTeacher);
                            }}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                            {[2024, 2025, 2026, 2027].map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedTeacher}
                            onChange={(e) => {
                                const t = e.target.value;
                                setSelectedTeacher(t);
                                handleFilterChange(selectedMonth, selectedYear, t);
                            }}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Teachers</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.first_name} {t.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Calculated Teacher Share</span>
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Calculator className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-gray-900">৳{formatAmount(metrics.total_estimated)}</span>
                            <p className="text-xs text-gray-500 mt-1">Based on batch collections for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Disbursed / Paid</span>
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-emerald-700">৳{formatAmount(metrics.total_paid)}</span>
                            <p className="text-xs text-emerald-600 mt-1">Recorded as accounting expenses</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Pending Payable</span>
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-amber-700">৳{formatAmount(metrics.total_due)}</span>
                            <p className="text-xs text-amber-600 mt-1">Ready for voucher generation</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 flex gap-6">
                    <button
                        onClick={() => setActiveTab('sheet')}
                        className={`pb-3 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
                            activeTab === 'sheet'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Calculator className="w-4 h-4" />
                        <span>Remuneration Sheet ({MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`pb-3 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
                            activeTab === 'ledger'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Disbursed Payouts Ledger</span>
                    </button>
                </div>

                {/* Tab 1: Calculation Sheet */}
                {activeTab === 'sheet' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        <th className="py-3 px-4">Batch & Course</th>
                                        <th className="py-3 px-4">Mentor Teacher</th>
                                        <th className="py-3 px-4">Remuneration Model</th>
                                        <th className="py-3 px-4 text-right">Student Collection</th>
                                        <th className="py-3 px-4 text-right">Calculated Share</th>
                                        <th className="py-3 px-4 text-right">Disbursed</th>
                                        <th className="py-3 px-4 text-right">Payable Due</th>
                                        <th className="py-3 px-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {calculationSheet.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-10 text-center text-gray-400">
                                                No active batches found for this teacher or month.
                                            </td>
                                        </tr>
                                    ) : (
                                        calculationSheet.map((item) => (
                                            <tr key={item.batch_id} className="hover:bg-gray-50/80 transition">
                                                <td className="py-3.5 px-4 font-semibold text-gray-900">
                                                    <div>{item.batch_name}</div>
                                                    <div className="text-xs font-normal text-gray-500">{item.course_name}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-medium text-gray-800">{item.teacher_name}</span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {getRemunerationBadge(item.remuneration_type, item.commission_rate)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-medium text-gray-900">
                                                    ৳{formatAmount(item.total_collection)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-semibold text-indigo-700">
                                                    ৳{formatAmount(item.calculated_commission)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">
                                                    ৳{formatAmount(item.already_paid)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <span className={`font-bold ${item.due_amount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                                                        ৳{formatAmount(item.due_amount)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    {item.due_amount > 0 ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openDisburseModal(item)}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <span>Disburse</span>
                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Settled</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Tab 2: Disbursed Ledger */}
                {activeTab === 'ledger' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        <th className="py-3 px-4">Voucher No</th>
                                        <th className="py-3 px-4">Teacher</th>
                                        <th className="py-3 px-4">Batch / Course</th>
                                        <th className="py-3 px-4">Period</th>
                                        <th className="py-3 px-4 text-right">Paid Amount</th>
                                        <th className="py-3 px-4">Paid From Account</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {payouts.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-10 text-center text-gray-400">
                                                No teacher payouts recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        payouts.data.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-gray-50/80 transition">
                                                <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-600">
                                                    {payout.payout_voucher_no}
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-gray-900">
                                                    {payout.teacher ? `${payout.teacher.first_name} ${payout.teacher.last_name}` : 'N/A'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {payout.batch ? (
                                                        <div>
                                                            <div className="font-medium text-gray-800">{payout.batch.name}</div>
                                                            <div className="text-xs text-gray-500">{payout.batch.course?.name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">General Honorarium</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                        {MONTHS.find(m => m.value === payout.period_month)?.label} {payout.period_year}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                                                    ৳{formatAmount(payout.paid_amount)}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-700">
                                                    <div>{payout.account?.account_name || 'Cash'}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{payout.payment_method.replace('_', ' ')}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-500 text-xs">
                                                    {payout.payout_date}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        onClick={() => handleCancelPayout(payout.id, payout.payout_voucher_no)}
                                                        title="Cancel and reverse accounting entry"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Disburse Payout Modal */}
            <Modal show={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleDisburseSubmit} className="p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Disburse Teacher Commission</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                For {activeTarget?.teacher_name} - {activeTarget?.batch_name}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPayoutModalOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Summary Info Banner */}
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 grid grid-cols-3 gap-2">
                        <div>
                            <span className="block text-indigo-600 font-medium">Batch Collection</span>
                            <span className="font-bold text-sm">৳{formatAmount(activeTarget?.total_collection || 0)}</span>
                        </div>
                        <div>
                            <span className="block text-indigo-600 font-medium">Commission Rate</span>
                            <span className="font-bold text-sm">
                                {activeTarget?.remuneration_type === 'percentage'
                                    ? `${activeTarget.commission_rate}%`
                                    : `৳${formatAmount(activeTarget?.commission_rate || 0)}`}
                            </span>
                        </div>
                        <div>
                            <span className="block text-indigo-600 font-medium">Calculated Share</span>
                            <span className="font-bold text-sm">৳{formatAmount(activeTarget?.calculated_commission || 0)}</span>
                        </div>
                    </div>

                    {/* Adjustment Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Bonus / Incentive (+)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.bonus_amount}
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    handleBonusOrDeductionChange(val, data.deduction_amount);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Deduction (-)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.deduction_amount}
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    handleBonusOrDeductionChange(data.bonus_amount, val);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Final Paid Amount */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Disburse Amount (BDT) *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={data.paid_amount}
                            onChange={(e) => setData('paid_amount', Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-lg font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        {errors.paid_amount && <p className="text-xs text-red-500 mt-1">{errors.paid_amount}</p>}
                    </div>

                    {/* Account & Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Paying Account *
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
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Payout Date *
                            </label>
                            <input
                                type="date"
                                value={data.payout_date}
                                onChange={(e) => setData('payout_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Notes / Remarks
                            </label>
                            <input
                                type="text"
                                placeholder="Optional payment reference or note"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => setPayoutModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{processing ? 'Processing...' : 'Disburse & Deduct Account'}</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
