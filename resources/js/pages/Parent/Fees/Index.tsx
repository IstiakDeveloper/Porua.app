import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import ChildSwitcher, { ChildOption } from '@/Components/Parent/ChildSwitcher';
import EmptyState from '@/Components/Parent/EmptyState';
import { useInstitute } from '@/hooks/useInstitute';
import { formatTaka, formatWhen } from '@/Components/Parent/format';
import { route } from '@/Components/Parent/route';
import {
    Wallet,
    Receipt,
    Calendar,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    Printer,
    FileSpreadsheet,
    FileText,
    ArrowUpRight,
    Building2,
    CreditCard,
    X,
    ShieldCheck
} from 'lucide-react';

interface Fee {
    id: number;
    fee_type: string;
    month?: string | null;
    year?: number | null;
    amount: number;
    original_amount?: number;
    discount?: number;
    paid_amount: number;
    remaining: number;
    due_date: string | null;
    payment_date: string | null;
    created_at?: string | null;
    status: string;
    is_overdue: boolean;
    payment_method: string;
    receipt_number: string | null;
    collector_name: string;
    remarks: string | null;
}

interface Props {
    student: (ChildOption & {
        admission_number?: string;
        father_name?: string;
        phone?: string;
    }) | null;
    children: ChildOption[];
    feeCollections: Fee[];
    summary: {
        total_amount: number;
        total_paid: number;
        total_due: number;
        overdue_amount: number;
        overdue_count: number;
    };
    parent?: {
        father_name: string;
        mother_name: string;
        phone: string;
    };
}

export default function Index({ student, children, feeCollections = [], summary, parent }: Props) {
    const institute = useInstitute();
    const [activeTab, setActiveTab] = useState<'ledger' | 'dues' | 'receipts'>('ledger');
    const [selectedReceiptFee, setSelectedReceiptFee] = useState<Fee | null>(null);

    // Filter collections by tab
    const pendingDuesList = feeCollections.filter(f => f.remaining > 0);
    const paidReceiptsList = feeCollections.filter(f => f.paid_amount > 0 && f.receipt_number);

    const getStatusPill = (fee: Fee) => {
        if (fee.is_overdue || fee.status === 'overdue') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    Overdue
                </span>
            );
        }
        if (fee.status === 'paid' || fee.remaining <= 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Paid
                </span>
            );
        }
        if (fee.paid_amount > 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Partial
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                Pending
            </span>
        );
    };

    const handlePrintLedger = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Fee Ledger & Receipts" />

            <div className="space-y-4 pb-8 print:p-0">
                {/* 1. Header Toolbar */}
                <div className="print:hidden bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-indigo-600" />
                            Fee Ledger & Receipts
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time student account statement, ledger debits/credits, and money receipts
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handlePrintLedger}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Ledger Statement
                        </button>
                    </div>
                </div>

                {!student ? (
                    <EmptyState
                        icon={<Wallet className="h-7 w-7 text-indigo-500" />}
                        title="No student linked yet"
                        body="Ask the school office to link your student profile before fee ledger records can appear."
                    />
                ) : (
                    <>
                        {/* 2. Child Switcher Bar */}
                        <div className="print:hidden bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <ChildSwitcher children={children} student={student} href={route('parent.fees.index')} />

                            <div className="text-xs text-slate-500 font-medium">
                                Enrolment: <span className="font-semibold text-slate-900 font-mono">Adm #{student.admission_number || 'N/A'}</span>
                            </div>
                        </div>

                        {/* 3. Three Primary Ledger Totals */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
                            {/* Card 1: Billed */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Billed Charges</p>
                                    <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                                        {formatTaka(summary.total_amount)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Total Institutional Debits</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 print:hidden">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Card 2: Paid */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Amount Paid</p>
                                    <p className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                                        {formatTaka(summary.total_paid)}
                                    </p>
                                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Cleared with Money Receipts</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600 print:hidden">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Card 3: Due Balance */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Outstanding Balance</p>
                                    <p className={`text-2xl font-bold font-mono mt-0.5 ${summary.total_due > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                        {formatTaka(summary.total_due)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {summary.overdue_amount > 0 ? `${formatTaka(summary.overdue_amount)} Overdue` : 'Zero Overdue'}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center print:hidden ${
                                    summary.total_due > 0
                                        ? 'bg-rose-50 border-rose-100/60 text-rose-600'
                                        : 'bg-emerald-50 border-emerald-100/60 text-emerald-600'
                                }`}>
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Tab Navigation Bar */}
                        <div className="print:hidden bg-white rounded-xl border border-slate-200/80 p-2 shadow-2xs flex items-center gap-1.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setActiveTab('ledger')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    activeTab === 'ledger'
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                Complete Ledger Statement ({feeCollections.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('dues')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    activeTab === 'dues'
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                Pending Bills & Dues ({pendingDuesList.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('receipts')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    activeTab === 'receipts'
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                Money Receipts ({paidReceiptsList.length})
                            </button>
                        </div>

                        {/* 5. TAB CONTENT 1: COMPLETE STUDENT FEE LEDGER */}
                        {activeTab === 'ledger' && (
                            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                                            Student Fee Ledger Statement
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Account Statement for {student.full_name} • Class {student.class_name} ({student.section_name})
                                        </p>
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        Total Records: <strong className="text-slate-900">{feeCollections.length}</strong>
                                    </div>
                                </div>

                                {feeCollections.length === 0 ? (
                                    <div className="p-12 text-center text-xs text-slate-500">
                                        No fee ledger records found for this student.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-50/90 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Particulars / Fee Head
                                                    </th>
                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Receipt / Inv #
                                                    </th>
                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Billed (Debit)
                                                    </th>
                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Paid (Credit)
                                                    </th>
                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Balance Due
                                                    </th>
                                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider print:hidden">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {feeCollections.map((fee) => (
                                                    <tr key={fee.id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                                                            {formatWhen(fee.payment_date || fee.created_at || fee.due_date)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-semibold text-slate-900">{fee.fee_type}</p>
                                                            {fee.month && (
                                                                <p className="text-[10px] text-slate-400 font-mono">
                                                                    Period: {fee.month} {fee.year || ''}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-[11px]">
                                                            {fee.receipt_number ? (
                                                                <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/70 px-1.5 py-0.5 rounded">
                                                                    #{fee.receipt_number}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                                                            {formatTaka(fee.amount)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                                                            {fee.paid_amount > 0 ? formatTaka(fee.paid_amount) : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold">
                                                            {fee.remaining > 0 ? (
                                                                <span className="text-rose-700">{formatTaka(fee.remaining)}</span>
                                                            ) : (
                                                                <span className="text-slate-400">0.00</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {getStatusPill(fee)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right print:hidden">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {fee.paid_amount > 0 && fee.receipt_number ? (
                                                                    <Link
                                                                        href={route('parent.fees.receipt', fee.id)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors"
                                                                        title="View Official Receipt"
                                                                    >
                                                                        <Printer className="w-3 h-3" />
                                                                        Receipt
                                                                    </Link>
                                                                ) : (
                                                                    <Link
                                                                        href={route('parent.fees.show', fee.id)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                                                        title="View Details"
                                                                    >
                                                                        Details
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-50/90 border-t-2 border-slate-900/20 font-bold">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-left uppercase text-[11px] tracking-wider text-slate-700">
                                                        Total Ledger Summary
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-900 text-sm">
                                                        {formatTaka(summary.total_amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-emerald-700 text-sm">
                                                        {formatTaka(summary.total_paid)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-rose-700 text-sm">
                                                        {formatTaka(summary.total_due)}
                                                    </td>
                                                    <td colSpan={2}></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 6. TAB CONTENT 2: PENDING DUES ONLY */}
                        {activeTab === 'dues' && (
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-rose-600" />
                                        Pending Fees & Overdue Invoices ({pendingDuesList.length})
                                    </h3>
                                    <span className="text-[11px] font-bold text-rose-700">
                                        Total Outstanding: {formatTaka(summary.total_due)}
                                    </span>
                                </div>

                                {pendingDuesList.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-emerald-700 font-semibold bg-emerald-50/50 rounded-xl border border-emerald-100">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                                        All tuition and school fees are currently up to date! No pending dues.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {pendingDuesList.map((fee) => (
                                            <div
                                                key={fee.id}
                                                className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {fee.fee_type}
                                                        </p>
                                                        {getStatusPill(fee)}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        Due by: <span className="font-semibold text-slate-700">{formatWhen(fee.due_date)}</span>
                                                        {fee.month && ` (${fee.month} ${fee.year || ''})`}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-base font-bold font-mono text-rose-700">
                                                            {formatTaka(fee.remaining)} Due
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            Total: {formatTaka(fee.amount)} • Paid: {formatTaka(fee.paid_amount)}
                                                        </p>
                                                    </div>

                                                    <Link
                                                        href={route('parent.fees.show', fee.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                                                    >
                                                        View Bill <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 7. TAB CONTENT 3: MONEY RECEIPTS (PAID FEES GALLERY) */}
                        {activeTab === 'receipts' && (
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Receipt className="w-4 h-4 text-emerald-600" />
                                        Official Money Receipts & Payment Vouchers ({paidReceiptsList.length})
                                    </h3>
                                    <span className="text-[11px] font-bold text-emerald-700">
                                        Total Cleared: {formatTaka(summary.total_paid)}
                                    </span>
                                </div>

                                {paidReceiptsList.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-500">
                                        No cleared money receipts recorded for this student yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {paidReceiptsList.map((fee) => (
                                            <div
                                                key={fee.id}
                                                className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                                                RCP #{fee.receipt_number}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                                <CheckCircle2 className="w-3 h-3" /> Paid
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xs font-bold text-slate-900 mt-2">
                                                            {fee.fee_type}
                                                            {fee.month && ` (${fee.month} ${fee.year || ''})`}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                                            Payment Date: <span className="font-semibold text-slate-700">{formatWhen(fee.payment_date)}</span>
                                                        </p>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <p className="text-base font-black font-mono text-emerald-700">
                                                            {formatTaka(fee.paid_amount)}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            Mode: {fee.payment_method || 'Cash'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        By: {fee.collector_name}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedReceiptFee(fee)}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                                        >
                                                            Quick View
                                                        </button>
                                                        <Link
                                                            href={route('parent.fees.receipt', fee.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                                                        >
                                                            <Printer className="w-3 h-3" />
                                                            Print Slip
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 8. Institutional Payment Counter Instruction */}
                        <div className="print:hidden bg-slate-50 rounded-xl border border-slate-200/70 p-4 text-xs space-y-1.5 text-slate-600">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <Building2 className="w-4 h-4 text-indigo-600" />
                                Payment Notice & Ledger Guidelines
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                All tuition fees, examinations, and transport charges are updated in real-time upon counter clearance. Money receipts are digitally signed and verifiable. For any ledger discrepancies, please present your printed receipt copy to the accounts department.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* QUICK VIEW RECEIPT MODAL */}
            {selectedReceiptFee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Money Receipt Preview #{selectedReceiptFee.receipt_number}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReceiptFee(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            <div className="text-center pb-3 border-b border-slate-100">
                                <h4 className="font-bold text-base text-slate-900">{institute.name || 'Porua Model Academy'}</h4>
                                <p className="text-[11px] text-slate-500">Official Student Fee Payment Voucher</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-slate-700">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Student:</span>
                                    <span className="font-bold text-slate-900">{student?.full_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Class & Roll:</span>
                                    <span className="font-semibold text-slate-800">
                                        Class {student?.class_name} ({student?.section_name}) • Roll {student?.roll_number || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Particulars:</span>
                                    <span className="font-semibold text-slate-900">{selectedReceiptFee.fee_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Payment Date:</span>
                                    <span className="font-mono text-slate-800">{formatWhen(selectedReceiptFee.payment_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Payment Mode:</span>
                                    <span className="font-medium text-emerald-700">{selectedReceiptFee.payment_method || 'Cash'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                                    Amount Received
                                </span>
                                <span className="font-mono font-black text-xl text-emerald-700">
                                    {formatTaka(selectedReceiptFee.paid_amount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReceiptFee(null)}
                                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Close Preview
                                </button>
                                <Link
                                    href={route('parent.fees.receipt', selectedReceiptFee.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    Full Printable Receipt
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
