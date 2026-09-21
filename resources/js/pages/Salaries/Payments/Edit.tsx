import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { ArrowLeft, Save, User } from 'lucide-react';

interface Account {
    id: number;
    account_name: string;
    account_number: string;
}

interface Payment {
    id: number;
    staff_id: number;
    month: number;
    year: number;
    base_salary: number;
    payment_date: string;
    account_id: number;
    payment_method: string;
    reference_number: string | null;
    remarks: string | null;
    staff: {
        user: { name: string };
        employee_id: string;
        designation?: string;
    };
}

interface Props {
    payment: Payment;
    accounts: Account[];
}

function getMonthName(month: number): string {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

function formatDateInput(value: string): string {
    if (!value) return '';
    return value.slice(0, 10);
}

function calcAmounts(baseSalary: number) {
    const employeePF = Math.round(baseSalary * 0.05 * 100) / 100;
    const employerPF = Math.round(baseSalary * 0.05 * 100) / 100;
    const netSalary = Math.round((baseSalary - employeePF) * 100) / 100;
    const totalAmount = Math.round((baseSalary + employerPF) * 100) / 100;
    return { employeePF, employerPF, netSalary, totalAmount };
}

export default function Edit({ payment, accounts }: Props) {
    const form = useForm({
        staff_id: String(payment.staff_id),
        month: payment.month,
        year: payment.year,
        base_salary: String(payment.base_salary),
        payment_date: formatDateInput(payment.payment_date),
        account_id: String(payment.account_id),
        payment_method: payment.payment_method,
        reference_number: payment.reference_number ?? '',
        remarks: payment.remarks ?? '',
    });

    const baseSalaryNum = parseFloat(form.data.base_salary) || 0;
    const { employeePF, employerPF, netSalary, totalAmount } = calcAmounts(baseSalaryNum);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(
            typeof route !== 'undefined'
                ? route('salary-payments.update', payment.id)
                : `/salary-payments/${payment.id}`,
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Salary Payment" />

            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Salary Payment</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Correct posted salary — PF and totals will be recalculated automatically
                        </p>
                    </div>
                    <Link
                        href={
                            typeof route !== 'undefined'
                                ? route('salary-payments.index')
                                : '/salary-payments'
                        }
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>

                <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <User className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900">{payment.staff.user.name}</p>
                            <p className="text-sm text-gray-600">
                                {payment.staff.employee_id}
                                {payment.staff.designation ? ` • ${payment.staff.designation}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.data.month}
                                onChange={(e) => form.setData('month', parseInt(e.target.value, 10))}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                                    <option key={m} value={m}>
                                        {getMonthName(m)}
                                    </option>
                                ))}
                            </select>
                            {form.errors.month && (
                                <p className="text-xs text-red-600 mt-1">{form.errors.month}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.data.year}
                                onChange={(e) => form.setData('year', parseInt(e.target.value, 10))}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {[2023, 2024, 2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            {form.errors.year && (
                                <p className="text-xs text-red-600 mt-1">{form.errors.year}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Salary <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.base_salary}
                            onChange={(e) => form.setData('base_salary', e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {form.errors.base_salary && (
                            <p className="text-xs text-red-600 mt-1">{form.errors.base_salary}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                        <h4 className="font-semibold text-gray-900">Recalculated Summary (5% PF each)</h4>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Employee PF (5%):</span>
                            <span className="font-medium text-red-600">
                                -৳{formatAmount(employeePF)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Employer PF (5%):</span>
                            <span className="font-medium text-blue-600">
                                +৳{formatAmount(employerPF)}
                            </span>
                        </div>
                        <div className="border-t border-blue-300 pt-2 space-y-1">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">Net Salary:</span>
                                <span className="font-bold text-green-600">
                                    ৳{formatAmount(netSalary)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">Total From Account:</span>
                                <span className="font-bold text-gray-900">
                                    ৳{formatAmount(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Account <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.data.account_id}
                            onChange={(e) => form.setData('account_id', e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.account_name} ({account.account_number})
                                </option>
                            ))}
                        </select>
                        {form.errors.account_id && (
                            <p className="text-xs text-red-600 mt-1">{form.errors.account_id}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.data.payment_method}
                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                value={form.data.payment_date}
                                onChange={(e) => form.setData('payment_date', e.target.value)}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {form.errors.payment_date && (
                                <p className="text-xs text-red-600 mt-1">{form.errors.payment_date}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                        <input
                            type="text"
                            value={form.data.reference_number}
                            onChange={(e) => form.setData('reference_number', e.target.value)}
                            placeholder="Cheque / transaction number"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                        <textarea
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={form.processing}
                            icon={<Save className="w-4 h-4" />}
                        >
                            {form.processing ? 'Saving...' : 'Save & Recalculate'}
                        </Button>
                        <Link
                            href={
                                typeof route !== 'undefined'
                                    ? route('salary-payments.index')
                                    : '/salary-payments'
                            }
                        >
                            <Button type="button" variant="ghost" className="border border-gray-300">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
