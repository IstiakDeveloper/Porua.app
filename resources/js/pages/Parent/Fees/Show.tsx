import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { formatTaka, formatWhen } from '@/Components/Parent/format';
import { route } from '@/Components/Parent/route';
import {
    ArrowLeft,
    Receipt,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Building2,
    CreditCard,
    User,
    Clock,
    FileText,
    Printer
} from 'lucide-react';

interface Fee {
    id: number;
    fee_type: string;
    student_name: string;
    amount: number;
    paid_amount: number;
    remaining: number;
    due_date: string | null;
    payment_date: string | null;
    status: string;
    is_overdue: boolean;
    payment_method: string | null;
    receipt_number: string | null;
    collector_name: string;
    remarks: string | null;
}

export default function Show({ feeCollection }: { feeCollection: Fee }) {
    const isOverdue = feeCollection.is_overdue || feeCollection.status === 'overdue';
    const isPaid = feeCollection.status === 'paid' || feeCollection.remaining <= 0;

    return (
        <AuthenticatedLayout>
            <Head title={`Fee Invoice - ${feeCollection.fee_type}`} />

            <ParentPage
                title={feeCollection.fee_type}
                subtitle={`Student: ${feeCollection.student_name}`}
                action={
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('parent.fees.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Fees
                        </Link>
                        {feeCollection.paid_amount > 0 && feeCollection.receipt_number && (
                            <Link
                                href={route('parent.fees.receipt', feeCollection.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Official Receipt Slip
                            </Link>
                        )}
                    </div>
                }
            >
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* 1. Primary Invoice Banner */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Current Remaining Balance
                                </p>
                                <p className={`text-3xl font-black mt-1 font-mono ${
                                    isPaid ? 'text-emerald-700' : isOverdue ? 'text-rose-700' : 'text-slate-900'
                                }`}>
                                    {formatTaka(feeCollection.remaining)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Total Bill: <span className="font-semibold text-slate-700">{formatTaka(feeCollection.amount)}</span> • Paid: <span className="font-semibold text-emerald-700">{formatTaka(feeCollection.paid_amount)}</span>
                                </p>
                            </div>

                            <div className="shrink-0 self-start sm:self-auto">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                    isPaid
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                        : isOverdue
                                        ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                        : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                }`}>
                                    {isPaid ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                    {isPaid ? 'Fully Paid' : isOverdue ? 'Overdue Invoice' : 'Unpaid Dues'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Structured Line Items Table */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                            <Receipt className="w-4 h-4 text-indigo-600" />
                            Invoice & Collection Specifications
                        </h3>

                        <dl className="divide-y divide-slate-100 text-xs">
                            <DetailRow label="Fee Category" value={feeCollection.fee_type} />
                            <DetailRow label="Due Date" value={formatWhen(feeCollection.due_date)} />
                            <DetailRow label="Payment Date" value={formatWhen(feeCollection.payment_date)} />
                            <DetailRow label="Payment Method" value={feeCollection.payment_method || 'Office Counter / Cash'} />
                            <DetailRow label="Official Receipt #" value={feeCollection.receipt_number || 'Pending generation'} isMono />
                            <DetailRow label="Authorized Collector" value={feeCollection.collector_name || 'School Accounts Officer'} />
                        </dl>

                        {feeCollection.remarks && (
                            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                                <span className="font-semibold text-slate-700 block mb-0.5">Administrative Remarks:</span>
                                {feeCollection.remarks}
                            </div>
                        )}
                    </div>

                    {/* 3. Office Payment Note */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-4 text-xs space-y-1 text-slate-600">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            Counter Clearance Notice
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            To pay this invoice or obtain a stamped physical receipt, please visit the accounts section during normal school office hours.
                        </p>
                    </div>
                </div>
            </ParentPage>
        </AuthenticatedLayout>
    );
}

function DetailRow({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <dt className="text-slate-500 font-medium">{label}</dt>
            <dd className={`font-semibold text-slate-900 ${isMono ? 'font-mono' : ''}`}>{value}</dd>
        </div>
    );
}
