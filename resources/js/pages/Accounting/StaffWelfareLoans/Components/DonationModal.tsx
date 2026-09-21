import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface DonationModalProps {
    show: boolean;
    onClose: () => void;
    welfareFundAccount: Account | null;
}

export default function DonationModal({ show, onClose, welfareFundAccount }: DonationModalProps) {
    const form = useForm({
        account_id: welfareFundAccount?.id || '',
        amount: '',
        donation_date: new Date().toISOString().split('T')[0],
        donor_name: '',
        payment_method: 'cash',
        reference_number: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/accounting/welfare-loans/donations', {
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
                <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-2xl font-bold">Add Donation to Welfare Fund</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Receive to Account <span className="text-red-500">*</span>
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
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Donation Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.data.donation_date}
                                onChange={(e) => form.setData('donation_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Donor Name</label>
                        <input
                            type="text"
                            value={form.data.donor_name}
                            onChange={(e) => form.setData('donor_name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.data.payment_method}
                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                                <option value="mobile_banking">Mobile Banking</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                            <input
                                type="text"
                                value={form.data.reference_number}
                                onChange={(e) => form.setData('reference_number', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                        <textarea
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                        >
                            {form.processing ? 'Adding...' : 'Add Donation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
