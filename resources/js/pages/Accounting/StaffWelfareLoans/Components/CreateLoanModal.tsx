import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    designation: string;
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface CreateLoanModalProps {
    show: boolean;
    onClose: () => void;
    teachers: Teacher[];
    welfareFundAccount: Account | null;
}

export default function CreateLoanModal({ show, onClose, teachers, welfareFundAccount }: CreateLoanModalProps) {
    const form = useForm({
        teacher_id: '',
        account_id: welfareFundAccount?.id || '',
        loan_amount: '',
        installment_amount: '1000',
        loan_date: new Date().toISOString().split('T')[0],
        first_installment_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        purpose: '',
        remarks: '',
    });

    // Calculate number of months automatically
    const calculateMonths = () => {
        const loanAmount = parseFloat(form.data.loan_amount);
        const installmentAmount = parseFloat(form.data.installment_amount);

        if (loanAmount && installmentAmount && installmentAmount > 0) {
            return Math.ceil(loanAmount / installmentAmount);
        }
        return 0;
    };

    // Calculate last installment amount
    const calculateLastInstallment = () => {
        const loanAmount = parseFloat(form.data.loan_amount);
        const installmentAmount = parseFloat(form.data.installment_amount);
        const months = calculateMonths();

        if (months > 0) {
            return loanAmount - (installmentAmount * (months - 1));
        }
        return 0;
    };

    const months = calculateMonths();
    const lastInstallmentAmount = calculateLastInstallment();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/accounting/welfare-loans', {
            onSuccess: () => {
                onClose();
                form.reset();
            },
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Loan</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teacher <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.data.teacher_id}
                            onChange={(e) => form.setData('teacher_id', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} - {teacher.employee_id} ({teacher.designation})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account <span className="text-red-500">*</span>
                        </label>
                        {welfareFundAccount ? (
                            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <p className="font-semibold text-gray-900">{welfareFundAccount.account_name}</p>
                                <p className="text-sm text-gray-600">Balance: ৳{formatAmount(welfareFundAccount.current_balance)}</p>
                            </div>
                        ) : (
                            <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50">
                                <p className="text-red-600 font-semibold">⚠️ Staff Welfare Fund account not found!</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.data.loan_amount}
                                onChange={(e) => form.setData('loan_amount', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                                placeholder="Enter total loan amount"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Monthly Installment Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                value={form.data.installment_amount}
                                onChange={(e) => form.setData('installment_amount', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                                placeholder="Amount per month"
                            />
                        </div>
                    </div>

                    {form.data.loan_amount && form.data.installment_amount && months > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800 mb-1">Payment Plan</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {months} {months === 1 ? 'Month' : 'Months'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-blue-800 mb-1">Monthly Payment</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ৳{formatAmount(parseFloat(form.data.installment_amount))}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-xs text-blue-700">
                                    Total loan of ৳{formatAmount(parseFloat(form.data.loan_amount))}
                                    {' '}will be paid in {months} installments
                                </p>
                                {lastInstallmentAmount !== parseFloat(form.data.installment_amount) && (
                                    <p className="text-xs text-purple-700 mt-1 font-semibold">
                                        Note: Last installment will be ৳{formatAmount(lastInstallmentAmount)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.data.loan_date}
                                onChange={(e) => form.setData('loan_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Installment Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.data.first_installment_date}
                                onChange={(e) => form.setData('first_installment_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                        <textarea
                            value={form.data.purpose}
                            onChange={(e) => form.setData('purpose', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                        <textarea
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || !welfareFundAccount}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                        >
                            {form.processing ? 'Creating...' : 'Create Loan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
