import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Gift } from 'lucide-react';
import StatisticsCards from './Components/StatisticsCards';
import LoansTable from './Components/LoansTable';
import CreateLoanModal from './Components/CreateLoanModal';
import EditLoanModal from './Components/EditLoanModal';
import DonationModal from './Components/DonationModal';
import DonationsListModal from './Components/DonationsListModal';

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

    const handleEdit = (loan: Loan) => {
        setEditingLoan(loan);
        setShowEditModal(true);
    };

    const handleDelete = (loan: Loan) => {
        if (confirm(`Are you sure you want to delete loan ${loan.loan_number}?\n\nThis action cannot be undone and will restore the account balance.`)) {
            router.post(`/accounting/welfare-loans/${loan.id}/cancel`, {}, {
                onSuccess: () => {
                    alert('Loan cancelled successfully!');
                },
                onError: () => {
                    alert('Failed to cancel loan. Please try again.');
                }
            });
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

    return (
        <AuthenticatedLayout>
            <Head title="Staff Welfare Loans" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-emerald-600" />
                            Staff Welfare Fund
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Donations, loans & installments</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDonationsListModal(true)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
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
                    <StatisticsCards stats={stats} />

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
                    <LoansTable
                        loans={filteredLoans}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
            </div>

            {/* Modals */}
            <CreateLoanModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                teachers={teachers}
                welfareFundAccount={welfareFundAccount}
            />

            <EditLoanModal
                show={showEditModal}
                loan={editingLoan}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingLoan(null);
                }}
            />

            <DonationModal
                show={showDonationModal}
                onClose={() => setShowDonationModal(false)}
                welfareFundAccount={welfareFundAccount}
            />

            <DonationsListModal
                show={showDonationsListModal}
                onClose={() => setShowDonationsListModal(false)}
                donations={donations}
            />
        </AuthenticatedLayout>
    );
}
