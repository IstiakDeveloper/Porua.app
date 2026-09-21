import React, { useState } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DollarSign, Users, TrendingUp, TrendingDown, Plus, X, Eye, CheckCircle, XCircle, Calendar, CreditCard, Wallet, Edit, Trash2, Gift } from 'lucide-react';

// Route helper function
function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'accounting.welfare-loans.index': '/accounting/welfare-loans',
        'accounting.welfare-loans.store': '/accounting/welfare-loans',
        'accounting.welfare-loans.donations.store': '/accounting/welfare-loans/donations',
    };

    if (params && name === 'accounting.welfare-loans.show') {
        return `/accounting/welfare-loans/${params.loan}`;
    }
    if (params && name === 'accounting.welfare-loans.update') {
        return `/accounting/welfare-loans/${params.loan}`;
    }
    if (params && name === 'accounting.welfare-loans.donations.destroy') {
        return `/accounting/welfare-loans/donations/${params.donation}`;
    }

    return routes[name] || '/';
}

// Date formatter helper
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

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

interface Loan {
    id: number;
    loan_number: string;
    teacher: {
        id: number;
        name: string;
        employee_id: string;
    };
    account: {
        id: number;
        account_name: string;
    };
    loan_amount: number;
    total_paid: number;
    remaining_amount: number;
    installment_count: number;
    paid_installments: number;
    installment_amount: number;
    loan_date: string;
    first_installment_date: string;
    status: 'active' | 'paid' | 'cancelled';
    progress_percentage: number;
    purpose: string | null;
    remarks: string | null;
    created_at: string;
}

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

interface Props {
    loans: Loan[];
    donations: Donation[];
    teachers: Teacher[];
    welfareFundAccount: Account | null;
    stats: {
        total_loans: number;
        active_loans: number;
        total_amount_given: number;
        total_recovered: number;
        total_outstanding: number;
        total_donations: number;
        fund_balance: number;
    };
}

export default function Index({ loans, donations, teachers, welfareFundAccount, stats }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showDonationsListModal, setShowDonationsListModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

    const createForm = useForm({
        teacher_id: '',
        account_id: welfareFundAccount?.id || '',
        loan_amount: '',
        installment_count: '12',
        loan_date: new Date().toISOString().split('T')[0],
        first_installment_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        purpose: '',
        remarks: '',
    });

    const editForm = useForm({
        loan_amount: '',
        installment_count: '',
        loan_date: '',
        first_installment_date: '',
        purpose: '',
        remarks: '',
    });

    const donationForm = useForm({
        account_id: welfareFundAccount?.id || '',
        amount: '',
        donation_date: new Date().toISOString().split('T')[0],
        donor_name: '',
        payment_method: 'cash',
        reference_number: '',
        remarks: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('accounting.welfare-loans.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (loan: Loan) => {
        setEditingLoan(loan);
        editForm.setData({
            loan_amount: loan.loan_amount.toString(),
            installment_count: loan.installment_count.toString(),
            loan_date: loan.loan_date,
            first_installment_date: loan.first_installment_date,
            purpose: loan.purpose || '',
            remarks: loan.remarks || '',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLoan) return;

        const totalPaid = Number(editingLoan.total_paid) || 0;
        const paidSlots = Number(editingLoan.paid_installments) || 0;
        const newAmount = parseFloat(String(editForm.data.loan_amount));
        const newCount = parseInt(String(editForm.data.installment_count), 10);

        if (Number.isNaN(newAmount) || newAmount < totalPaid) {
            alert(
                `Loan amount must be at least the total already paid (৳${formatAmount(totalPaid)}).`
            );
            return;
        }

        if (Number.isNaN(newCount) || newCount < paidSlots) {
            alert(`Total installments must be at least ${paidSlots} (already paid or recorded).`);
            return;
        }

        const remaining = Math.round((newAmount - totalPaid) * 100) / 100;
        const pendingSlots = newCount - paidSlots;

        if (remaining > 0.01 && pendingSlots < 1) {
            alert('Increase total installments so there is at least one pending row for the remaining balance.');
            return;
        }

        if (remaining <= 0.01 && pendingSlots > 0) {
            alert(
                'This loan is already fully covered by payments. Either set total installments equal to the number paid or increase the loan amount.'
            );
            return;
        }

        editForm.put(route('accounting.welfare-loans.update', { loan: editingLoan.id }), {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingLoan(null);
                editForm.reset();
            },
        });
    };

    const handleDonation = (e: React.FormEvent) => {
        e.preventDefault();
        donationForm.post(route('accounting.welfare-loans.donations.store'), {
            onSuccess: () => {
                setShowDonationModal(false);
                donationForm.reset();
            },
        });
    };

    const handleDeleteDonation = (donationId: number) => {
        if (confirm('Are you sure you want to delete this donation? This will reduce the fund balance.')) {
            router.delete(route('accounting.welfare-loans.donations.destroy', { donation: donationId }));
        }
    };

    // Filter loans
    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentMethodBadge = (method: string) => {
        const methods: Record<string, string> = {
            cash: 'Cash',
            bank_transfer: 'Bank Transfer',
            cheque: 'Cheque',
            mobile_banking: 'Mobile Banking',
        };
        return methods[method] || method;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Staff Welfare Loans" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Staff Welfare Fund Management</h1>
                            <p className="text-gray-600 mt-1">Manage donations, loans and installments</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDonationsListModal(true)}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
                            >
                                <Gift className="w-5 h-5" />
                                View Donations
                            </button>
                            <button
                                onClick={() => setShowDonationModal(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                            >
                                <Plus className="w-5 h-5" />
                                Add Donation
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
                            >
                                <Plus className="w-5 h-5" />
                                New Loan
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-100 mb-1">Fund Balance</p>
                                    <p className="text-2xl font-bold">৳{formatAmount(stats.fund_balance)}</p>
                                    <p className="text-xs text-purple-100 mt-1">Available</p>
                                </div>
                                <Wallet className="w-10 h-10 text-purple-200" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Loans</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_loans}</p>
                                </div>
                                <CreditCard className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        ৳{formatAmount(stats.total_donations)}
                                    </p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.active_loans}</p>
                                </div>
                                <Users className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Given</p>
                                    <p className="text-xl font-bold text-red-600">
                                        ৳{formatAmount(stats.total_amount_given)}
                                    </p>
                                </div>
                                <TrendingDown className="w-10 h-10 text-red-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Recovered</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ৳{formatAmount(stats.total_recovered)}
                                    </p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        ৳{formatAmount(stats.total_outstanding)}
                                    </p>
                                </div>
                                <DollarSign className="w-10 h-10 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search by loan number, teacher name, or employee ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Loans Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teacher
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredLoans.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No loans found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLoans.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{loan.loan_number}</p>
                                                        <p className="text-sm text-gray-500">Date: {formatDate(loan.loan_date)}</p>
                                                        <p className="text-sm text-gray-500">Account: {loan.account.account_name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{loan.teacher.name}</p>
                                                        <p className="text-sm text-gray-500">ID: {loan.teacher.employee_id}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            ৳{formatAmount(loan.loan_amount)}
                                                        </p>
                                                        <p className="text-sm text-green-600">
                                                            Paid: ৳{formatAmount(loan.total_paid)}
                                                        </p>
                                                        <p className="text-sm text-red-600">
                                                            Due: ৳{formatAmount(loan.remaining_amount)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-700 mb-1">
                                                            {loan.paid_installments}/{loan.installment_count} installments
                                                        </p>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{ width: `${loan.progress_percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">{loan.progress_percentage}%</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(loan.status)}`}>
                                                        {loan.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Link
                                                            href={route('accounting.welfare-loans.show', { loan: loan.id })}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </Link>
                                                        {loan.status === 'active' && (
                                                            <button
                                                                onClick={() => handleEdit(loan)}
                                                                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-1 rounded transition"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
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

            {/* Donations List Modal */}
            {showDonationsListModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-purple-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                            <h2 className="text-2xl font-bold">Donation History</h2>
                            <button
                                onClick={() => setShowDonationsListModal(false)}
                                className="text-white hover:text-gray-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Donation #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Donor
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                Method
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
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
                                                            onClick={() => handleDeleteDonation(donation.id)}
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
            )}

            {/* Create Loan Modal - Original modal code here */}
            {/* Edit Loan Modal */}
            {showEditModal && editingLoan && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-orange-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                            <h2 className="text-2xl font-bold">Edit Loan - {editingLoan.loan_number}</h2>
                            <button
                                onClick={() => { setShowEditModal(false); setEditingLoan(null); }}
                                className="text-white hover:text-gray-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {(Number(editingLoan.total_paid) > 0 || editingLoan.paid_installments > 0) && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                                    <p className="font-medium">Payments already recorded</p>
                                    <p className="mt-1">
                                        Paid: ৳{formatAmount(editingLoan.total_paid)}{' '}
                                        ({editingLoan.paid_installments} installment{editingLoan.paid_installments !== 1 ? 's' : ''}). Loan
                                        amount cannot be below this; unpaid installments will be rebuilt.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={Number(editingLoan.total_paid) || 0}
                                        value={editForm.data.loan_amount}
                                        onChange={(e) => editForm.setData('loan_amount', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Installments <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={Math.max(1, editingLoan.paid_installments)}
                                        value={editForm.data.installment_count}
                                        onChange={(e) => editForm.setData('installment_count', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            {editForm.data.loan_amount && editForm.data.installment_count && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-800">
                                        Monthly Installment: ৳{(parseFloat(editForm.data.loan_amount) / formatAmount(parseInt(editForm.data.installment_count)))}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.data.loan_date}
                                        onChange={(e) => editForm.setData('loan_date', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Installment Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.data.first_installment_date}
                                        onChange={(e) => editForm.setData('first_installment_date', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purpose
                                </label>
                                <textarea
                                    value={editForm.data.purpose}
                                    onChange={(e) => editForm.setData('purpose', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remarks
                                </label>
                                <textarea
                                    value={editForm.data.remarks}
                                    onChange={(e) => editForm.setData('remarks', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-yellow-800">
                                    Loan amount changes adjust the welfare fund account by the difference from the previous
                                    principal. Remaining balance is recalculated as loan amount minus total paid.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingLoan(null); }}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Updating...' : 'Update Loan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Donation Modal - Original modal code here */}
            {/* I'll include the Create and Donation modals in a follow-up message due to length */}
        </AuthenticatedLayout>
    );
}
