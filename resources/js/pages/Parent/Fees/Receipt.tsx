import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { useInstitute } from '@/hooks/useInstitute';
import { formatTaka, formatWhen } from '@/Components/Parent/format';
import { route } from '@/Components/Parent/route';
import {
    Printer,
    ArrowLeft,
    CheckCircle2,
    Building2,
    Calendar,
    Receipt as ReceiptIcon,
    User,
    CreditCard,
    ShieldCheck
} from 'lucide-react';

interface FeeItem {
    id: number;
    fee_type: string;
    month?: string | null;
    year?: number | null;
    amount: number;
    paid_amount: number;
    discount: number;
}

interface Props {
    fee: {
        id: number;
        receipt_number: string;
        fee_type: string;
        month?: string | null;
        year?: number | null;
        amount: number;
        paid_amount: number;
        discount: number;
        remaining: number;
        payment_date: string;
        payment_method: string;
        status: string;
        remarks?: string | null;
        collected_by: string;
    };
    relatedItems: FeeItem[];
    student: {
        id: number;
        full_name: string;
        admission_number: string;
        roll_number: string;
        class_name: string;
        section_name: string;
        father_name: string;
        phone: string;
    };
    parent: {
        father_name: string;
        mother_name: string;
        phone: string;
    };
}

export default function Receipt({ fee, relatedItems = [], student, parent }: Props) {
    const institute = useInstitute();
    const items = relatedItems.length > 0 ? relatedItems : [
        {
            id: fee.id,
            fee_type: fee.fee_type,
            month: fee.month,
            year: fee.year,
            amount: fee.amount,
            paid_amount: fee.paid_amount,
            discount: fee.discount,
        }
    ];

    const totalPaidSum = items.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
    const totalBilledSum = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDiscountSum = items.reduce((sum, item) => sum + (item.discount || 0), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Receipt - ${fee.receipt_number}`} />

            <div className="space-y-4 pb-8 print:p-0 print:m-0">
                {/* Screen-only action header */}
                <div className="print:hidden flex items-center justify-between bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('parent.fees.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Fees Ledger
                        </Link>
                        <div>
                            <h1 className="text-sm sm:text-base font-bold text-slate-900">
                                Official Fee Receipt #{fee.receipt_number}
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Verified institutional cash/bank collection voucher
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print Money Receipt
                    </button>
                </div>

                {/* Printable Official Money Receipt Document */}
                <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 print:shadow-none print:border-none print:p-2 print:max-w-none">
                    {/* 1. Institute Header */}
                    <div className="text-center pb-5 border-b-2 border-slate-900/10 space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                            {institute.name || 'Porua Model Academy'}
                        </h2>
                        {institute.address && (
                            <p className="text-xs text-slate-600 font-medium">
                                {institute.address}
                            </p>
                        )}
                        <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-md print:bg-slate-900">
                            Money Receipt / বেতন ও ফি জমার রসিদ
                        </div>
                    </div>

                    {/* 2. Metadata Bar: Receipt No, Date, Payment Mode */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 text-xs border-b border-slate-100">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt Number</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{fee.receipt_number}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Date</span>
                            <span className="font-semibold text-slate-800">{formatWhen(fee.payment_date)}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {fee.payment_method || 'Cash Counter'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Student & Guardian Info Box */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
                            <span className="font-bold text-slate-900">{student.full_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Class & Section</span>
                            <span className="font-semibold text-slate-800">
                                {student.class_name} ({student.section_name})
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Roll / Adm No</span>
                            <span className="font-mono text-slate-800">
                                Roll: {student.roll_number || '—'} {student.admission_number ? `(${student.admission_number})` : ''}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Guardian Name</span>
                            <span className="font-semibold text-slate-800">
                                {student.father_name || parent.father_name || parent.mother_name || 'Guardian'}
                            </span>
                        </div>
                    </div>

                    {/* 4. Line Items Table */}
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-100/80 border-y border-slate-200 text-slate-600">
                                <tr>
                                    <th className="py-2.5 px-3 text-left font-bold uppercase text-[10px]">#</th>
                                    <th className="py-2.5 px-3 text-left font-bold uppercase text-[10px]">Particulars / Fee Head</th>
                                    <th className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">Billed</th>
                                    <th className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">Waiver</th>
                                    <th className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">Paid Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                                            {item.fee_type}
                                            {item.month ? ` (${item.month}${item.year ? ` ${item.year}` : ''})` : ''}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                                            {formatTaka(item.amount)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                                            {item.discount > 0 ? formatTaka(item.discount) : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                            {formatTaka(item.paid_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-900 font-bold bg-slate-50/50">
                                <tr>
                                    <td colSpan={2} className="py-3 px-3 uppercase text-[11px] tracking-wider text-slate-800">
                                        Total Paid Sum
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                                        {formatTaka(totalBilledSum)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                                        {totalDiscountSum > 0 ? formatTaka(totalDiscountSum) : '—'}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-base text-emerald-700">
                                        {formatTaka(totalPaidSum)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* 5. Remaining Balance Callout */}
                    {fee.remaining > 0 ? (
                        <div className="bg-amber-50 rounded-xl border border-amber-200/80 p-3 text-xs flex items-center justify-between text-amber-900 my-3">
                            <span>Remaining balance due on this fee head:</span>
                            <span className="font-mono font-bold text-sm text-amber-800">{formatTaka(fee.remaining)} Due</span>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 rounded-xl border border-emerald-200/80 p-2.5 text-xs flex items-center gap-2 text-emerald-800 font-semibold my-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>This fee invoice has been 100% paid in full. No dues pending.</span>
                        </div>
                    )}

                    {fee.remarks && (
                        <p className="text-xs text-slate-500 italic mt-2">
                            Remarks: {fee.remarks}
                        </p>
                    )}

                    {/* 6. Signatures Footer */}
                    <div className="pt-14 mt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-100">
                        <div className="text-left">
                            <div className="w-36 border-t border-slate-400 pt-1 text-[11px] font-medium text-slate-600">
                                Guardian's Signature
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <div className="w-44 border-t border-slate-900 pt-1 text-[11px] font-bold text-slate-800">
                                Authorized Accounts Officer
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Verified by: {fee.collected_by}
                            </span>
                        </div>
                    </div>

                    {/* Security Watermark */}
                    <div className="mt-8 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>System Generated Official Receipt • Porua Education Management System</span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

