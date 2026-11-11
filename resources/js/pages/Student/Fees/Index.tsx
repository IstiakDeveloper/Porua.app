import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    DollarSign,
    Receipt as ReceiptIcon,
    AlertCircle,
    CheckCircle2,
    Clock,
    Gift,
    Printer,
    FileSpreadsheet,
    Wallet,
    Calendar,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
    admission_number: string;
}

interface Fee {
    id: number;
    receipt_number: string;
    fee_type: string;
    month: string;
    year: number;
    amount: number;
    late_fee: number;
    discount: number;
    total_amount: number;
    paid_amount: number;
    remaining: number;
    payment_date: string;
    payment_method: string;
    status: string;
    remarks: string | null;
    collected_by: string;
    is_overdue: boolean;
}

interface Waiver {
    id: number;
    fee_type: string;
    waiver_type: string;
    waiver_amount: number;
    waiver_percentage: number;
    reason: string;
    valid_from: string;
    valid_to: string;
}

interface Props {
    student: Student;
    fees: Fee[];
    summary: {
        total_paid: number;
        total_due: number;
        overdue_count: number;
    };
    waivers: Waiver[];
    filters: {
        status: string | null;
        year: number;
    };
}

function formatTaka(amount: number | null | undefined): string {
    const value = Math.round(Number(amount ?? 0));
    return `৳${new Intl.NumberFormat('en-IN').format(value)}`;
}

export default function Index({ student, fees = [], summary, waivers = [], filters }: Props) {
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedYear, setSelectedYear] = useState(filters.year.toString());
    const [activeTab, setActiveTab] = useState<'ledger' | 'dues' | 'receipts'>('ledger');

    const handleFilter = (status: string, year: string) => {
        const params: any = { year: parseInt(year) };
        if (status !== 'all') {
            params.status = status;
        }
        router.get('/student/fees', params, { preserveState: true });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Compute total billed
    const totalBilled = fees.reduce((sum, f) => sum + (f.total_amount || 0), 0);

    // Filter fees based on active tab
    const displayedFees = fees.filter(fee => {
        if (activeTab === 'dues') return fee.remaining > 0;
        if (activeTab === 'receipts') return (fee.paid_amount || 0) > 0;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Fees & Ledger" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Student Fee Statement & Ledger"
                    subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number} • ID: ${student.admission_number}`}
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `Year ${selectedYear}`, variant: 'neutral' },
                        { label: summary.total_due > 0 ? `Total Due: ${formatTaka(summary.total_due)}` : 'All Cleared', variant: summary.total_due > 0 ? 'neutral' : 'success' }
                    ]}
                    actionSlot={
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    handleFilter(selectedStatus, e.target.value);
                                }}
                                className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                            >
                                {years.map(y => (
                                    <option key={y} value={y.toString()}>{y}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Ledger
                            </button>
                        </div>
                    }
                />

                {/* 2. FOUR HIGH-DENSITY METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">Total Billed</span>
                            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {formatTaka(totalBilled)}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Annual charges</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-emerald-600">Total Paid</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
                            {formatTaka(summary.total_paid)}
                        </div>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Cleared payments</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-rose-600">Outstanding Due</span>
                            <Wallet className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className={`text-xl sm:text-2xl font-bold tracking-tight ${summary.total_due > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {formatTaka(summary.total_due)}
                        </div>
                        <p className="text-[11px] text-rose-600 mt-0.5">
                            {summary.total_due > 0 ? 'Payable balance' : 'Zero balance'}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-amber-600">Overdue Invoices</span>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
                            {summary.overdue_count}
                        </div>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                            {summary.overdue_count > 0 ? 'Past due date' : 'On schedule'}
                        </p>
                    </div>
                </div>

                {/* 3. FEE WAIVERS / SCHOLARSHIPS BANNER */}
                {waivers && waivers.length > 0 && (
                    <div className="bg-white rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-2xs">
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Approved Fee Waivers & Concessions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {waivers.map((waiver) => (
                                <div key={waiver.id} className="p-2.5 rounded-lg border border-emerald-200/70 bg-white text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800">{waiver.fee_type}</span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {waiver.waiver_type === 'percentage' ? `${waiver.waiver_percentage}% OFF` : `৳${waiver.waiver_amount} OFF`}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">{waiver.reason}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Valid: {waiver.valid_from} to {waiver.valid_to}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. SEGMENTED TABS (LEDGER STATEMENT, PENDING DUES, RECEIPTS) */}
                <div className="flex items-center gap-1.5 border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ledger')}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                            activeTab === 'ledger'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Account Ledger ({fees.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('dues')}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                            activeTab === 'dues'
                                ? 'border-rose-600 text-rose-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Pending Bills ({fees.filter(f => f.remaining > 0).length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('receipts')}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                            activeTab === 'receipts'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Money Receipts ({fees.filter(f => (f.paid_amount || 0) > 0).length})
                    </button>
                </div>

                {/* 5. DUAL VIEW: MOBILE CARD FEED (< 768px) & DESKTOP LEDGER TABLE (>= 768px) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {displayedFees && displayedFees.length > 0 ? (
                        <>
                            {/* Mobile Card Feed */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {displayedFees.map((fee) => (
                                    <div key={fee.id} className="p-3.5 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">{fee.fee_type}</h4>
                                                <p className="text-[11px] text-slate-500">Period: {fee.month} {fee.year}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                fee.is_overdue
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : fee.status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {fee.is_overdue ? 'OVERDUE' : fee.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600">
                                            <div><span className="text-slate-400 block">Billed</span><strong>{formatTaka(fee.total_amount)}</strong></div>
                                            <div><span className="text-emerald-600 block">Paid</span><strong>{formatTaka(fee.paid_amount)}</strong></div>
                                            <div><span className="text-rose-600 block">Due</span><strong>{formatTaka(fee.remaining)}</strong></div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                            <span>Receipt: <strong className="text-slate-700 font-mono">{fee.receipt_number}</strong></span>
                                            {fee.status === 'paid' && (
                                                <Link
                                                    href={`/student/fees/${fee.id}/receipt`}
                                                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                                                >
                                                    <ReceiptIcon className="w-3.5 h-3.5" />
                                                    View Receipt
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Receipt / Ref</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fee Particulars</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Billing Period</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Debit (Billed)</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Credit (Paid)</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Balance Due</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {displayedFees.map((fee) => (
                                            <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-mono font-medium text-slate-800">
                                                    {fee.receipt_number}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {fee.fee_type}
                                                    {fee.discount > 0 && (
                                                        <span className="text-[10px] text-emerald-600 block">Waiver: -{formatTaka(fee.discount)}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{fee.month} {fee.year}</td>
                                                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                                                    {formatTaka(fee.total_amount)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600">
                                                    {formatTaka(fee.paid_amount)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold">
                                                    {fee.remaining > 0 ? (
                                                        <span className="text-rose-600">{formatTaka(fee.remaining)}</span>
                                                    ) : (
                                                        <span className="text-slate-400">৳0</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        fee.is_overdue
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : fee.status === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {fee.is_overdue ? 'OVERDUE' : fee.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {fee.status === 'paid' ? (
                                                        <Link
                                                            href={`/student/fees/${fee.id}/receipt`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <ReceiptIcon className="w-3 h-3" />
                                                            Receipt
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400">Unpaid</span>
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
                            <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No fee records found for the selected criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
