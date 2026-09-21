import React, { useState, useRef } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useReactToPrint } from 'react-to-print';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import PrintProvidentFundShow from './PrintProvidentFundShow';
import { ArrowLeft, Wallet, User, Calendar, DollarSign, TrendingUp, CreditCard, Plus, AlertCircle, LogOut, Printer } from 'lucide-react';

function route(name: string, params?: any): string {
    if (name === 'provident-fund.index') return '/provident-fund';
    return '/provident-fund';
}

interface Teacher {
    id: number;
    user: { name: string };
    employee_id: string;
    designation: string;
    salary: number;
}

interface Transaction {
    id: number;
    type: 'contribution' | 'opening' | 'withdrawal';
    employee_contribution: number;
    employer_contribution: number;
    total_contribution: number;
    transaction_date: string;
    salaryPayment?: {
        month: number;
        year: number;
        payment_method: string;
    };
}

interface Withdrawal {
    id: number;
    employee_contribution: number;
    employer_contribution: number;
    total_amount: number;
    withdrawal_date: string;
    reason: string;
    remarks: string | null;
    approved_by: string | null;
}

interface Summary {
    total_employee_contribution: number;
    total_employer_contribution: number;
    current_balance: number;
    total_withdrawn: number;
    total_transactions: number;
}

interface ShowProps {
    teacher: Teacher;
    transactions: Transaction[];
    withdrawals: Withdrawal[];
    summary: Summary;
    filters: {
        from_date?: string;
        to_date?: string;
    };
}

export default function Show({ teacher, transactions, withdrawals, summary, filters }: ShowProps) {
    const [showOpeningModal, setShowOpeningModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `PF_Statement_${teacher?.user?.name?.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`,
    });

    const openingForm = useForm({
        employee_contribution: '',
        employer_contribution: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const withdrawalForm = useForm({
        reason: '',
        remarks: '',
        withdrawal_date: new Date().toISOString().split('T')[0],
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getMonthName = (month: number) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    };

    const handleOpeningSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        openingForm.post(`/provident-fund/${teacher.id}/opening-entry`, {
            onSuccess: () => {
                setShowOpeningModal(false);
                openingForm.reset();
            },
        });
    };

    const handleWithdrawalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to process this withdrawal? This action cannot be undone.')) {
            withdrawalForm.post(`/provident-fund/${teacher.id}/withdraw`, {
                onSuccess: () => {
                    setShowWithdrawalModal(false);
                    withdrawalForm.reset();
                },
            });
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/provident-fund/${teacher.id}`, {
            from_date: fromDate,
            to_date: toDate,
        }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        router.get(`/provident-fund/${teacher.id}`, {}, { preserveState: true });
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'contribution': return 'Salary';
            case 'opening': return 'Opening';
            case 'withdrawal': return 'Withdrawal';
            default: return type;
        }
    };

    const getTransactionBadgeVariant = (type: string) => {
        switch (type) {
            case 'contribution': return 'primary';
            case 'opening': return 'success';
            case 'withdrawal': return 'danger';
            default: return 'default';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`PF Ledger - ${teacher?.user?.name || 'Teacher'}`} />

            {/* Hidden Print Component */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <PrintProvidentFundShow ref={printRef} teacher={teacher} transactions={transactions} withdrawals={withdrawals} summary={summary} />
            </div>

            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('provident-fund.index')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </Link>
                                <div className="p-3 bg-green-600 rounded-lg">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Provident Fund Details
                                    </h1>
                                    <p className="text-gray-600 mt-1">{teacher?.user?.name || 'N/A'} - {teacher?.employee_id || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                                <button
                                    onClick={() => setShowOpeningModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Opening Entry
                                </button>
                                <button
                                    onClick={() => setShowWithdrawalModal(true)}
                                    disabled={summary.current_balance <= 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Withdraw PF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Info Card */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <User className="w-8 h-8 text-gray-700" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{teacher?.user?.name || 'N/A'}</h2>
                                <p className="text-gray-600">{teacher?.designation || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Employee ID</p>
                                <p className="text-lg font-semibold text-gray-900">{teacher?.employee_id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Salary</p>
                                <p className="text-lg font-semibold text-gray-900">৳{teacher?.salary ? formatAmount(parseFloat(teacher.salary.toString())) : '0'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Employee Contribution</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                ৳{formatAmount(summary.total_employee_contribution)}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Employer Contribution</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                ৳{formatAmount(summary.total_employer_contribution)}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Total Withdrawn</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                ৳{formatAmount(summary.total_withdrawn)}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                ৳{formatAmount(summary.current_balance)}
                            </p>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                            <p className="text-sm text-gray-600 mt-1">All provident fund transactions including contributions, opening entries, and withdrawals</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-sm font-semibold text-gray-900">Type</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-sm font-semibold text-gray-900">Period</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-sm font-semibold text-gray-900">Date</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Employee (5%)</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Employer (5%)</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Total (10%)</span>
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-900">Method</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.length > 0 ? transactions.map((transaction, index) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <Badge variant={getTransactionBadgeVariant(transaction.type) as any} size="sm">
                                                    {getTransactionTypeLabel(transaction.type)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {transaction.salaryPayment ? (
                                                    <Badge variant="info" size="sm">
                                                        {getMonthName(transaction.salaryPayment.month)} {transaction.salaryPayment.year}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(transaction.transaction_date)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                ৳{formatAmount(transaction.employee_contribution)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                ৳{formatAmount(transaction.employer_contribution)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                ৳{formatAmount(transaction.total_contribution)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {transaction.salaryPayment ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-700 capitalize">
                                                            {transaction.salaryPayment.payment_method.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                No PF transactions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Withdrawal History */}
                    {withdrawals && withdrawals.length > 0 && (
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Withdrawal History</h2>
                                <p className="text-sm text-gray-600 mt-1">All PF withdrawals</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-sm font-semibold text-gray-900">Date</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-sm font-semibold text-gray-900">Reason</span>
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                <span className="text-sm font-semibold text-gray-900">Employee Share</span>
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                <span className="text-sm font-semibold text-gray-900">Employer Share</span>
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-sm font-semibold text-gray-900">Approved By</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {withdrawals.map((withdrawal, index) => (
                                            <tr
                                                key={withdrawal.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {formatDate(withdrawal.withdrawal_date)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <Badge variant="danger" size="sm" className="mb-1">
                                                            {withdrawal.reason}
                                                        </Badge>
                                                        {withdrawal.remarks && (
                                                            <p className="text-xs text-gray-600 mt-1">{withdrawal.remarks}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-blue-600">
                                                    ৳{formatAmount(withdrawal.employee_contribution)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-purple-600">
                                                    ৳{formatAmount(withdrawal.employer_contribution)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-red-600">
                                                    ৳{formatAmount(withdrawal.total_amount)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {withdrawal.approved_by || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Opening Entry Modal */}
                    {showOpeningModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Plus className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Add Opening Entry</h2>
                                </div>

                                <form onSubmit={handleOpeningSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Employee Contribution (৳)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={openingForm.data.employee_contribution}
                                            onChange={(e) => openingForm.setData('employee_contribution', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {openingForm.errors.employee_contribution && (
                                            <p className="text-red-600 text-sm mt-1">{openingForm.errors.employee_contribution}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Employer Contribution (৳)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={openingForm.data.employer_contribution}
                                            onChange={(e) => openingForm.setData('employer_contribution', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {openingForm.errors.employer_contribution && (
                                            <p className="text-red-600 text-sm mt-1">{openingForm.errors.employer_contribution}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Transaction Date
                                        </label>
                                        <input
                                            type="date"
                                            value={openingForm.data.transaction_date}
                                            onChange={(e) => openingForm.setData('transaction_date', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-900">
                                            <strong>Total Opening Balance: ৳{formatAmount(parseFloat(openingForm.data.employee_contribution || '0') + parseFloat(openingForm.data.employer_contribution || '0'))}</strong>
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOpeningModal(false);
                                                openingForm.reset();
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={openingForm.processing}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {openingForm.processing ? 'Adding...' : 'Add Entry'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Withdrawal Modal */}
                    {showWithdrawalModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <LogOut className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Process PF Withdrawal</h2>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-900">
                                            <p className="font-semibold mb-1">Warning: This will withdraw the entire PF balance</p>
                                            <p>Current Balance: <strong>৳{formatAmount(parseFloat(summary.current_balance.toString()))}</strong></p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason for Withdrawal
                                        </label>
                                        <select
                                            value={withdrawalForm.data.reason}
                                            onChange={(e) => withdrawalForm.setData('reason', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select reason</option>
                                            <option value="resignation">Resignation</option>
                                            <option value="retirement">Retirement</option>
                                            <option value="termination">Termination</option>
                                            <option value="emergency">Emergency</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {withdrawalForm.errors.reason && (
                                            <p className="text-red-600 text-sm mt-1">{withdrawalForm.errors.reason}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remarks (Optional)
                                        </label>
                                        <textarea
                                            value={withdrawalForm.data.remarks}
                                            onChange={(e) => withdrawalForm.setData('remarks', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Additional notes..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Withdrawal Date
                                        </label>
                                        <input
                                            type="date"
                                            value={withdrawalForm.data.withdrawal_date}
                                            onChange={(e) => withdrawalForm.setData('withdrawal_date', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowWithdrawalModal(false);
                                                withdrawalForm.reset();
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={withdrawalForm.processing}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {withdrawalForm.processing ? 'Processing...' : 'Process Withdrawal'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
