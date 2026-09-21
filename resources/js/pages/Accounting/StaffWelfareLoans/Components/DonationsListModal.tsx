import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { router } from '@inertiajs/react';
import { X, Trash2 } from 'lucide-react';

interface Donation {
    id: number;
    donation_number: string;
    account: {
        id: number;
        account_name: string;
    };
    amount: number;
    donation_date: string;
    donor_name: string | null;
    payment_method: string;
    reference_number: string | null;
    remarks: string | null;
    created_at: string;
}

interface DonationsListModalProps {
    show: boolean;
    onClose: () => void;
    donations: Donation[];
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getPaymentMethodBadge(method: string) {
    const methods: Record<string, string> = {
        cash: 'Cash',
        bank_transfer: 'Bank Transfer',
        cheque: 'Cheque',
        mobile_banking: 'Mobile Banking',
    };
    return methods[method] || method;
}

export default function DonationsListModal({ show, onClose, donations }: DonationsListModalProps) {
    const handleDelete = (donationId: number) => {
        if (confirm('Are you sure you want to delete this donation? This will reduce the fund balance.')) {
            router.delete(`/accounting/welfare-loans/donations/${donationId}`);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-purple-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-2xl font-bold">Donation History</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donation #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Method</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No donations found
                                        </td>
                                    </tr>
                                ) : (
                                    donations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-gray-900">{donation.donation_number}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-700">{formatDate(donation.donation_date)}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-900">{donation.donor_name || 'Anonymous'}</p>
                                                {donation.reference_number && (
                                                    <p className="text-xs text-gray-500">Ref: {donation.reference_number}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="font-semibold text-purple-600">
                                                    ৳{formatAmount(donation.amount)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                    {getPaymentMethodBadge(donation.payment_method)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(donation.id)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
