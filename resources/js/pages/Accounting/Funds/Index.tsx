import { formatAmount } from '@/lib/formatCurrency';
import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DollarSign, TrendingUp, TrendingDown, Plus, X, ArrowDownCircle, ArrowUpCircle, Eye, FileText, Printer, Edit, Trash2 } from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

// Route helper function
function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'accounting.funds.index': '/accounting/funds',
        'accounting.funds.in': '/accounting/funds/in',
        'accounting.funds.out': '/accounting/funds/out',
    };

    if (params && name === 'accounting.funds.transactions.update') {
        return `/accounting/funds/transactions/${params.transaction}`;
    }
    if (params && name === 'accounting.funds.transactions.delete') {
        return `/accounting/funds/transactions/${params.transaction}`;
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

interface FundTransaction {
    id: number;
    transaction_number: string;
    transaction_type: 'in' | 'out';
    amount: number;
    transaction_date: string;
    description: string | null;
    account: {
        account_name: string;
    };
    created_at: string;
}

interface Investor {
    id: number;
    investor_code: string;
    name: string;
    email: string;
    phone: string;
    investor_type: string;
    status: string;
    current_balance: number;
    transactions?: FundTransaction[];
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Props {
    investors: Investor[];
    accounts: Account[];
    stats: {
        total_investors: number;
        active_investors: number;
        total_balance: number;
        total_in: number;
        total_out: number;
    };
}

export default function Index({ investors, accounts, stats }: Props) {
    const institute = useInstitute();
    const [showFundInModal, setShowFundInModal] = useState(false);
    const [showFundOutModal, setShowFundOutModal] = useState(false);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<FundTransaction | null>(null);
    const [ledgerTransactions, setLedgerTransactions] = useState<FundTransaction[]>([]);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Find bank account (account_type === 'bank') or use first account
    const defaultAccountId = accounts.find(acc => acc.account_name.toLowerCase().includes('bank'))?.id || accounts[0]?.id || '';

    const fundInForm = useForm({
        investor_id: '',
        account_id: defaultAccountId,
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const fundOutForm = useForm({
        investor_id: '',
        account_id: defaultAccountId,
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const editForm = useForm({
        amount: '',
        transaction_date: '',
        description: '',
    });

    const handleFundIn = (e: React.FormEvent) => {
        e.preventDefault();
        fundInForm.post(route('accounting.funds.in'), {
            onSuccess: () => {
                setShowFundInModal(false);
                fundInForm.reset();
            },
        });
    };

    const handleFundOut = (e: React.FormEvent) => {
        e.preventDefault();
        fundOutForm.post(route('accounting.funds.out'), {
            onSuccess: () => {
                setShowFundOutModal(false);
                fundOutForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        editForm.put(route('accounting.funds.transactions.update', { transaction: selectedTransaction.id }), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedTransaction(null);
                editForm.reset();
                // Refresh ledger if it's open
                if (showLedgerModal && selectedInvestor) {
                    fetch(`/accounting/investors/${selectedInvestor.id}/ledger`)
                        .then(res => res.json())
                        .then(data => setLedgerTransactions(data.transactions || []));
                }
            },
        });
    };

    const handleDelete = (transactionId: number) => {
        if (!confirm('Are you sure you want to delete this transaction? This will reverse the balance changes.')) {
            return;
        }

        router.delete(route('accounting.funds.transactions.delete', { transaction: transactionId }), {
            onSuccess: () => {
                // Refresh ledger if it's open
                if (showLedgerModal && selectedInvestor) {
                    fetch(`/accounting/investors/${selectedInvestor.id}/ledger`)
                        .then(res => res.json())
                        .then(data => setLedgerTransactions(data.transactions || []));
                }
            },
        });
    };

    // Filter transactions by date
    const filteredTransactions = ledgerTransactions.filter(transaction => {
        if (!fromDate && !toDate) return true;
        const transDate = new Date(transaction.transaction_date);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from && to) return transDate >= from && transDate <= to;
        if (from) return transDate >= from;
        if (to) return transDate <= to;
        return true;
    });

    // Print function
    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fund Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                Fund Management
                            </h1>
                            <p className="text-xs text-emerald-700/80 mt-0.5">Investor Fund IN / OUT</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFundInModal(true)}
                                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg border border-emerald-700"
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                Fund IN
                            </button>
                            <button
                                onClick={() => setShowFundOutModal(true)}
                                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Fund OUT
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Investors</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total_investors}</p>
                                </div>
                                <DollarSign className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Investors</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.active_investors}</p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Current Balance</p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        ৳{formatAmount(stats.total_balance)}
                                    </p>
                                </div>
                                <DollarSign className="w-10 h-10 text-indigo-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Fund IN</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        ৳{formatAmount(stats.total_in)}
                                    </p>
                                </div>
                                <ArrowDownCircle className="w-10 h-10 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Fund OUT</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">
                                        ৳{formatAmount(stats.total_out)}
                                    </p>
                                </div>
                                <ArrowUpCircle className="w-10 h-10 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Investors Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Investors & Fund Balance</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Investor Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Balance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {investors.map((investor) => (
                                        <tr key={investor.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    {investor.investor_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{investor.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    <div>📧 {investor.email}</div>
                                                    <div>📱 {investor.phone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                                                    {investor.investor_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-lg font-bold text-green-600">
                                                    ৳{formatAmount(investor.current_balance)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                                                    investor.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {investor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvestor(investor);
                                                        setLoadingLedger(true);
                                                        setShowLedgerModal(true);
                                                        // Fetch transactions
                                                        fetch(`/accounting/investors/${investor.id}/ledger`)
                                                            .then(res => res.json())
                                                            .then(data => {
                                                                setLedgerTransactions(data.transactions || []);
                                                                setLoadingLedger(false);
                                                            })
                                                            .catch(() => {
                                                                setLoadingLedger(false);
                                                                setLedgerTransactions([]);
                                                            });
                                                    }}
                                                    className="inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View Ledger
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fund IN Modal */}
            {showFundInModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-green-50">
                            <h3 className="text-2xl font-bold text-green-800 flex items-center">
                                <ArrowDownCircle className="w-6 h-6 mr-2" />
                                Fund IN (Receive Money)
                            </h3>
                            <button
                                onClick={() => setShowFundInModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleFundIn} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Investor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={fundInForm.data.investor_id}
                                    onChange={(e) => fundInForm.setData('investor_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Choose Investor...</option>
                                    {investors.filter(i => i.status === 'active').map((investor) => (
                                        <option key={investor.id} value={investor.id}>
                                            {investor.investor_code} - {investor.name} (Balance: ৳{formatAmount(investor.current_balance)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={fundInForm.data.account_id}
                                    onChange={(e) => fundInForm.setData('account_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.account_name} (৳{formatAmount(account.current_balance)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fundInForm.data.amount}
                                    onChange={(e) => fundInForm.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter amount..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={fundInForm.data.transaction_date}
                                    onChange={(e) => fundInForm.setData('transaction_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={fundInForm.data.description}
                                    onChange={(e) => fundInForm.setData('description', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-800">
                                    ✅ This will ADD money to investor balance and CREDIT the account
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFundInModal(false)}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={fundInForm.processing}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {fundInForm.processing ? 'Processing...' : 'Receive Fund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fund OUT Modal */}
            {showFundOutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-50">
                            <h3 className="text-2xl font-bold text-red-800 flex items-center">
                                <ArrowUpCircle className="w-6 h-6 mr-2" />
                                Fund OUT (Return Money)
                            </h3>
                            <button
                                onClick={() => setShowFundOutModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleFundOut} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Investor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={fundOutForm.data.investor_id}
                                    onChange={(e) => fundOutForm.setData('investor_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Choose Investor...</option>
                                    {investors.filter(i => i.status === 'active' && i.current_balance > 0).map((investor) => (
                                        <option key={investor.id} value={investor.id}>
                                            {investor.investor_code} - {investor.name} (Balance: ৳{formatAmount(investor.current_balance)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={fundOutForm.data.account_id}
                                    onChange={(e) => fundOutForm.setData('account_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.account_name} (৳{formatAmount(account.current_balance)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fundOutForm.data.amount}
                                    onChange={(e) => fundOutForm.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter amount..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={fundOutForm.data.transaction_date}
                                    onChange={(e) => fundOutForm.setData('transaction_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={fundOutForm.data.description}
                                    onChange={(e) => fundOutForm.setData('description', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-800">
                                    ⚠️ This will REMOVE money from investor balance and DEBIT the account
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFundOutModal(false)}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={fundOutForm.processing}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {fundOutForm.processing ? 'Processing...' : 'Return Fund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ledger Modal */}
            {showLedgerModal && selectedInvestor && (
                <>
                    {/* Print CSS */}
                    <style>{`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #printable-ledger, #printable-ledger * {
                                visibility: visible;
                            }
                            #printable-ledger {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                padding: 10mm;
                            }
                            .no-print {
                                display: none !important;
                            }
                            @page {
                                size: A4;
                                margin: 15mm 10mm;
                            }

                            /* Professional Print Styling */
                            #printable-ledger h1 {
                                font-size: 20pt !important;
                                margin-bottom: 5pt !important;
                            }
                            #printable-ledger h2 {
                                font-size: 16pt !important;
                                margin-top: 3pt !important;
                                margin-bottom: 10pt !important;
                            }
                            #printable-ledger p {
                                font-size: 9pt !important;
                                margin: 2pt 0 !important;
                            }
                            #printable-ledger table {
                                width: 100% !important;
                                border-collapse: collapse !important;
                                font-size: 8pt !important;
                                margin-top: 10pt !important;
                            }
                            #printable-ledger th {
                                background-color: #f3f4f6 !important;
                                padding: 5pt !important;
                                font-size: 8pt !important;
                                border: 1pt solid #d1d5db !important;
                                font-weight: bold !important;
                            }
                            #printable-ledger td {
                                padding: 4pt !important;
                                font-size: 8pt !important;
                                border: 1pt solid #e5e7eb !important;
                            }
                            #printable-ledger .summary-box {
                                margin-top: 10pt !important;
                                padding: 8pt !important;
                                font-size: 9pt !important;
                                border: 1pt solid #d1d5db !important;
                                page-break-inside: avoid !important;
                            }
                            #printable-ledger .summary-box p:first-child {
                                font-size: 8pt !important;
                                margin-bottom: 3pt !important;
                            }
                            #printable-ledger .summary-box p:last-child {
                                font-size: 12pt !important;
                                font-weight: bold !important;
                            }
                        }
                    `}</style>

                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header with Print Button */}
                            <div className="p-6 border-b border-gray-200 bg-indigo-50 no-print">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-indigo-800 flex items-center">
                                            <FileText className="w-6 h-6 mr-2" />
                                            Fund Ledger - {selectedInvestor.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedInvestor.investor_code} | Current Balance: ৳{formatAmount(selectedInvestor.current_balance)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePrint}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Print
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowLedgerModal(false);
                                                setSelectedInvestor(null);
                                                setLedgerTransactions([]);
                                                setFromDate('');
                                                setToDate('');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Date Filters */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Printable Section */}
                            <div id="printable-ledger">
                                {/* Print Header */}
                                <div className="text-center mb-6 mt-4 px-6" style={{pageBreakAfter: 'avoid'}}>
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <img src={institute.logo_url || '/logo.png'} alt="Logo" className="w-10 h-10 object-contain" />
                                        <h1 className="text-3xl font-bold text-gray-800">{institute.name}</h1>
                                    </div>
                                    <h2 className="text-xl font-semibold text-emerald-700 mt-1">Fund Ledger Report</h2>
                                    <div className="mt-3 text-sm text-gray-600">
                                        <p><strong>Investor:</strong> {selectedInvestor.name} ({selectedInvestor.investor_code})</p>
                                        <p><strong>Print Date:</strong> {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                        {(fromDate || toDate) && (
                                            <p><strong>Period:</strong> {fromDate ? formatDate(fromDate) : 'Start'} to {toDate ? formatDate(toDate) : 'End'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                            {loadingLedger ? (
                                <div className="text-center py-12 no-print">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                    <p className="mt-4 text-gray-600">Loading transactions...</p>
                                </div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No transactions found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">Transaction #</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">Account</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">Description</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">IN (+)</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">OUT (-)</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300">Balance</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase border-b-2 border-gray-300 no-print">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {(() => {
                                                let runningBalance = 0;
                                                return filteredTransactions.map((transaction, index) => {
                                                    const amount = parseFloat(transaction.amount.toString());
                                                    if (transaction.transaction_type === 'in') {
                                                        runningBalance += amount;
                                                    } else {
                                                        runningBalance -= amount;
                                                    }

                                                    return (
                                                        <tr key={transaction.id} className="hover:bg-gray-50 border-b border-gray-200">
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200">
                                                                {formatDate(transaction.transaction_date)}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                                                                <span className="text-xs font-mono text-gray-700">
                                                                    {transaction.transaction_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                                                                <span className={`px-2 py-1 text-xs font-semibold ${
                                                                    transaction.transaction_type === 'in'
                                                                        ? 'text-green-700'
                                                                        : 'text-red-700'
                                                                }`}>
                                                                    {transaction.transaction_type === 'in' ? 'IN' : 'OUT'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                                {transaction.account.account_name}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                                                                {transaction.description || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right border-r border-gray-200">
                                                                {transaction.transaction_type === 'in' ? (
                                                                    <span className="text-green-600 font-semibold">
                                                                        ৳{formatAmount(transaction.amount)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right border-r border-gray-200">
                                                                {transaction.transaction_type === 'out' ? (
                                                                    <span className="text-red-600 font-semibold">
                                                                        ৳{formatAmount(transaction.amount)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                                <span className="text-gray-900 font-bold">
                                                                    ৳{formatAmount(runningBalance)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-center no-print">
                                                                <div className="flex justify-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedTransaction(transaction);
                                                                            editForm.setData({
                                                                                amount: transaction.amount.toString(),
                                                                                transaction_date: transaction.transaction_date,
                                                                                description: transaction.description || '',
                                                                            });
                                                                            setShowEditModal(true);
                                                                        }}
                                                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                                                        title="Edit Transaction"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(transaction.id)}
                                                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                                                                        title="Delete Transaction"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>

                                    {/* Summary */}
                                    <div className="mt-6 grid grid-cols-3 gap-4 bg-gray-100 p-4 border border-gray-300 summary-box" style={{pageBreakInside: 'avoid'}}>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-700 font-medium">Total Fund IN</p>
                                            <p className="text-xl font-bold text-green-600 mt-1">
                                                ৳{formatAmount(ledgerTransactions
                                                    .filter(t => t.transaction_type === 'in')
                                                    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0))}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-700 font-medium">Total Fund OUT</p>
                                            <p className="text-xl font-bold text-red-600 mt-1">
                                                ৳{formatAmount(filteredTransactions
                                                    .filter(t => t.transaction_type === 'out')
                                                    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0))}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-700 font-medium">Net Balance</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">
                                                ৳{formatAmount(filteredTransactions
                                                    .filter(t => t.transaction_type === 'in')
                                                    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) -
                                                filteredTransactions
                                                    .filter(t => t.transaction_type === 'out')
                                                    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 no-print">
                                <button
                                    onClick={() => {
                                        setShowLedgerModal(false);
                                        setSelectedInvestor(null);
                                        setLedgerTransactions([]);
                                        setFromDate('');
                                        setToDate('');
                                    }}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Edit Transaction Modal */}
            {showEditModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
                            <h3 className="text-2xl font-bold text-blue-800 flex items-center">
                                <Edit className="w-6 h-6 mr-2" />
                                Edit Transaction
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedTransaction(null);
                                    editForm.reset();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Transaction #:</strong> {selectedTransaction.transaction_number}<br />
                                    <strong>Type:</strong> <span className="uppercase font-semibold">{selectedTransaction.transaction_type}</span><br />
                                    <strong>Account:</strong> {selectedTransaction.account.account_name}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.data.amount}
                                    onChange={(e) => editForm.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={editForm.data.transaction_date}
                                    onChange={(e) => editForm.setData('transaction_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-yellow-800">
                                    ⚠️ Editing this transaction will automatically adjust the fund and account balances
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedTransaction(null);
                                        editForm.reset();
                                    }}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Updating...' : 'Update Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
