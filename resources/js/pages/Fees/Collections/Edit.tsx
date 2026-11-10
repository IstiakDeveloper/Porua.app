import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Receipt,
    Save,
    User,
} from 'lucide-react';

interface StudentInfo {
    user: { name: string };
    admission_number: string;
    school_class: { name: string };
}

interface LineRow {
    id: number;
    fee_type: { name: string };
    month: number;
    year: number;
    amount: number;
    late_fee: number;
    discount: number;
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Props {
    receipt_number: string;
    student: StudentInfo;
    payment_date: string;
    payment_method: string;
    account_id: number | null;
    remarks: string;
    lines: LineRow[];
    accounts: Account[];
    fee_collection_id: number;
}

function getMonthName(month: number): string {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

function linePaid(row: { amount: number; late_fee: number; discount: number }): number {
    const a = Number(row.amount) || 0;
    const l = Number(row.late_fee) || 0;
    const d = Number(row.discount) || 0;
    return a + l - d;
}

export default function Edit({
    receipt_number,
    student,
    payment_date,
    payment_method,
    account_id,
    remarks,
    lines: initialLines,
    accounts,
    fee_collection_id,
}: Props) {
    const form = useForm({
        payment_date,
        payment_method,
        account_id: account_id != null ? String(account_id) : accounts[0]?.id?.toString() ?? '',
        remarks,
        lines: initialLines.map((row) => ({
            id: row.id,
            amount: row.amount,
            late_fee: row.late_fee,
            discount: row.discount,
            fee_type_name: row.fee_type.name,
            month: row.month,
            year: row.year,
        })),
    });

    const updateLine = (
        index: number,
        field: 'amount' | 'late_fee' | 'discount',
        raw: string
    ) => {
        const num = raw === '' ? 0 : parseFloat(raw);
        const next = [...form.data.lines];
        next[index] = {
            ...next[index],
            [field]: Number.isFinite(num) ? num : 0,
        };
        form.setData('lines', next);
    };

    const grandTotal = form.data.lines.reduce((sum, row) => sum + Math.max(0, linePaid(row)), 0);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            payment_date: data.payment_date,
            payment_method: data.payment_method,
            account_id: data.account_id,
            remarks: data.remarks,
            lines: data.lines.map(({ id, amount, late_fee, discount }) => ({
                id,
                amount,
                late_fee,
                discount,
            })),
        }));
        form.put(
            typeof route !== 'undefined' ? route('fee-collections.update', fee_collection_id) : `/fee-collections/${fee_collection_id}`,
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit receipt ${receipt_number}`} />

            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <Link
                            href={typeof route !== 'undefined' ? route('fee-collections.index') : '/fee-collections'}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to collections
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            <Receipt className="w-7 h-7 text-indigo-600 shrink-0" />
                            Edit fee receipt
                        </h1>
                        <p className="text-sm text-gray-600 mt-1 font-mono">{receipt_number}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
                    <div className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{student.user?.name ?? 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                            {student.admission_number} • Class {student.school_class?.name ?? 'N/A'}
                        </p>
                        <p className="text-xs text-amber-800 mt-2 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                            Corrections update stored amounts and re-sync accounting for this receipt.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-800">Receipt lines</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Adjust base amount, late fee, or discount; paid column updates automatically.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-gray-600 bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3">Fee</th>
                                        <th className="px-4 py-3">Period</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Late fee</th>
                                        <th className="px-4 py-3">Discount</th>
                                        <th className="px-4 py-3 text-right">Paid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {form.data.lines.map((row, index) => {
                                        const paid = linePaid(row);
                                        const invalid = paid < 0;
                                        return (
                                            <tr key={row.id} className={invalid ? 'bg-red-50' : ''}>
                                                <td className="px-4 py-3 font-medium text-gray-900">{row.fee_type_name}</td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {getMonthName(row.month)} {row.year}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={row.amount}
                                                        onChange={(e) => updateLine(index, 'amount', e.target.value)}
                                                        className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={row.late_fee}
                                                        onChange={(e) => updateLine(index, 'late_fee', e.target.value)}
                                                        className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={row.discount}
                                                        onChange={(e) => updateLine(index, 'discount', e.target.value)}
                                                        className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                                    <span className={invalid ? 'text-red-600' : 'text-green-600'}>
                                                        ৳{formatAmount(paid)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex justify-end">
                            <span className="text-sm text-gray-600 mr-3 pt-1">Receipt total</span>
                            <span className="text-lg font-bold text-indigo-800 tabular-nums">
                                ৳{formatAmount(grandTotal)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            Payment details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.data.account_id}
                                    onChange={(e) => form.setData('account_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.account_name} (৳{formatAmount(acc.current_balance)})
                                        </option>
                                    ))}
                                </select>
                                {form.errors.account_id && (
                                    <p className="text-red-600 text-xs mt-1">{form.errors.account_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment method <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.data.payment_method}
                                    onChange={(e) => form.setData('payment_method', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="mobile_banking">Mobile Banking</option>
                                    <option value="online">Online Payment</option>
                                </select>
                                {form.errors.payment_method && (
                                    <p className="text-red-600 text-xs mt-1">{form.errors.payment_method}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.data.payment_date}
                                    onChange={(e) => form.setData('payment_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {form.errors.payment_date && (
                                    <p className="text-red-600 text-xs mt-1">{form.errors.payment_date}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea
                                    value={form.data.remarks}
                                    onChange={(e) => form.setData('remarks', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Optional notes"
                                />
                                {form.errors.remarks && (
                                    <p className="text-red-600 text-xs mt-1">{form.errors.remarks}</p>
                                )}
                            </div>
                        </div>
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 space-y-1">
                                {Object.entries(form.errors).map(([key, msg]) => (
                                    <p key={key}>{msg}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Link
                            href={typeof route !== 'undefined' ? route('fee-collections.index') : '/fee-collections'}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing || form.data.lines.some((row) => linePaid(row) < 0)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {form.processing ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
