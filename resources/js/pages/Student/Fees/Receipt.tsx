import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Receipt as ReceiptIcon,
    Printer,
    ArrowLeft,
    CheckCircle2,
    GraduationCap,
    School,
    ShieldCheck
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { useInstitute } from '@/hooks/useInstitute';

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
    payment_date: string;
    payment_method: string;
    transaction_id: string | null;
    remarks: string | null;
    collected_by: string;
    status: string;
}

interface Student {
    full_name: string;
    admission_number: string;
    roll_number: string;
    class_name: string;
    section_name: string;
    father_name: string;
    phone: string | null;
}

interface Props {
    fee: Fee;
    student: Student;
}

function formatTaka(amount: number | null | undefined): string {
    const value = Math.round(Number(amount ?? 0));
    return `৳${new Intl.NumberFormat('en-IN').format(value)}`;
}

export default function Receipt({ fee, student }: Props) {
    const institute = useInstitute();

    return (
        <AuthenticatedLayout>
            <Head title={`Receipt #${fee.receipt_number} - ${student.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER (HIDDEN ON PRINT) */}
                <div className="print:hidden">
                    <FormPageHeader
                        title={`Fee Money Receipt`}
                        subtitle={`Official Payment Voucher • ${student.full_name} (Roll #${student.roll_number})`}
                        backUrl="/student/fees"
                        badges={[
                            { label: `Receipt #${fee.receipt_number}`, variant: 'neutral' },
                            { label: 'PAID & VERIFIED', variant: 'success' }
                        ]}
                        actionSlot={
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Official Receipt
                            </button>
                        }
                    />
                </div>

                {/* 2. OFFICIAL MONEY RECEIPT VOUCHER */}
                <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs print:border-none print:shadow-none print:p-0">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-slate-200">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <GraduationCap className="w-6 h-6 text-indigo-600 print:text-black" />
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                {institute.name || 'Institutional Academic Management'}
                            </h1>
                        </div>
                        {institute.address && <p className="text-xs text-slate-500">{institute.address}</p>}
                        <div className="inline-block mt-2.5 px-4 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-widest print:border-black">
                            Official Money Receipt
                        </div>
                    </div>

                    {/* Meta info strip */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt / Voucher No</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{fee.receipt_number}</span>
                            <span className="text-slate-500 block mt-1">Payment Date: <strong>{fee.payment_date}</strong></span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Period</span>
                            <span className="font-bold text-slate-800">{fee.month} {fee.year}</span>
                            <span className="text-slate-500 block mt-1">Payment Mode: <strong className="uppercase">{fee.payment_method}</strong></span>
                        </div>
                    </div>

                    {/* Student details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/70 my-4 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                            <strong className="text-slate-900 font-bold">{student.full_name}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                            <strong className="text-slate-800">Class {student.class_name} ({student.section_name})</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll / Student ID</span>
                            <strong className="text-slate-800">Roll #{student.roll_number} • ID: {student.admission_number}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Father's Name</span>
                            <strong className="text-slate-800">{student.father_name || 'N/A'}</strong>
                        </div>
                    </div>

                    {/* Fee line items table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden my-4 text-xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <th className="px-4 py-2.5 font-bold text-slate-700">Particulars / Description</th>
                                    <th className="px-4 py-2.5 font-bold text-slate-700 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-4 py-2.5 font-semibold text-slate-800">
                                        {fee.fee_type} ({fee.month} {fee.year})
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-slate-800 text-right">
                                        {formatTaka(fee.amount)}
                                    </td>
                                </tr>
                                {fee.late_fee > 0 && (
                                    <tr>
                                        <td className="px-4 py-2 text-rose-600">Late Fine</td>
                                        <td className="px-4 py-2 font-mono text-rose-600 text-right">+{formatTaka(fee.late_fee)}</td>
                                    </tr>
                                )}
                                {fee.discount > 0 && (
                                    <tr>
                                        <td className="px-4 py-2 text-emerald-600">Waiver / Scholarship Concession</td>
                                        <td className="px-4 py-2 font-mono text-emerald-600 text-right">-{formatTaka(fee.discount)}</td>
                                    </tr>
                                )}
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-2.5 text-slate-900">Total Paid Amount</td>
                                    <td className="px-4 py-2.5 font-mono text-slate-900 text-right text-sm">
                                        {formatTaka(fee.paid_amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment verification block */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-emerald-50/40 border border-emerald-200/80 text-xs">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                                <span className="font-bold text-emerald-900">Payment Status: Verified</span>
                                <span className="text-emerald-700 block text-[11px]">
                                    Transaction ID: {fee.transaction_id || 'Cash Transaction'} • Collected By: {fee.collected_by}
                                </span>
                            </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-200">
                            {formatTaka(fee.paid_amount)} NET PAID
                        </span>
                    </div>

                    {/* Signatures */}
                    <div className="flex items-end justify-between pt-16 px-4 text-xs font-semibold text-slate-700">
                        <div className="text-center">
                            <div className="w-32 border-t border-slate-700 mb-1" />
                            Student / Guardian
                        </div>
                        <div className="text-center">
                            <div className="w-32 border-t border-slate-700 mb-1" />
                            Cashier / Accounts
                        </div>
                        <div className="text-center">
                            <div className="w-32 border-t border-slate-700 mb-1" />
                            Authorised Seal
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
