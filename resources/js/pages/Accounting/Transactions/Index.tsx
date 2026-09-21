import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Search, Eye, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Transaction, Account, TransactionFilters, PaginatedData } from '@/types/accounting';

interface IndexProps {
    transactions: PaginatedData<Transaction>;
    filters?: TransactionFilters;
    accounts: Account[];
    stats: { total_income: number; total_expense: number; net: number };
}

export default function Index({ transactions, filters, accounts, stats }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || '');
    const [accountId, setAccountId] = useState(filters?.account_id?.toString() || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const handleFilter = () => {
        router.get('/accounting/transactions', {
            search,
            type,
            account_id: accountId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        setAccountId('');
        setDateFrom('');
        setDateTo('');
        router.get('/accounting/transactions');
    };

    const handleDelete = (id: number, number: string) => {
        if (confirm(`Delete transaction "${number}"?`)) {
            router.delete(`/accounting/transactions/${id}`);
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const categoryName = (t: Transaction) => {
        // Always resolve category based on transaction type to avoid mismatches
        // (e.g., an expense accidentally showing an income category).
        if (t.type === 'income') {
            return (t as any).income_category?.name ?? t.incomeCategory?.name ?? '—';
        }
        if (t.type === 'expense') {
            return (t as any).expense_category?.name ?? t.expenseCategory?.name ?? '—';
        }
        if (t.type === 'asset_purchase') {
            return 'Fixed Assets';
        }
        if (t.type === 'transfer') {
            return 'Transfer';
        }
        return '—';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            Transactions
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Income, expense & transfer</p>
                    </div>
                    <Link href="/accounting/transactions/create" className="w-full sm:w-auto">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />} className="w-full justify-center">
                            New Transaction
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-green-500 shadow-sm px-3.5 py-3 flex items-center gap-3">
                        <div className="p-2 rounded bg-green-100 text-green-700">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Income</p>
                            <p className="text-base font-bold text-green-700 font-mono">৳{formatCurrency(stats.total_income)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-red-500 shadow-sm px-3.5 py-3 flex items-center gap-3">
                        <div className="p-2 rounded bg-red-50 text-red-700">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Expense</p>
                            <p className="text-base font-bold text-red-700 font-mono">৳{formatCurrency(stats.total_expense)}</p>
                        </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-3.5 py-3 flex items-center gap-3">
                        <div className="p-2 rounded bg-emerald-100 text-emerald-700">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Net</p>
                            <p className={`text-base font-bold font-mono ${stats.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                ৳{formatCurrency(Math.abs(stats.net))}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-3.5">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="col-span-2 sm:col-span-1 text-xs sm:text-sm sm:max-w-[160px] w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="text-xs sm:text-sm sm:max-w-[120px] w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="transfer">Transfer</option>
                        </select>
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="text-xs sm:text-sm sm:max-w-[160px] w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">All Accounts</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                            ))}
                        </select>
                        <div className="col-span-2 sm:col-span-1 flex gap-2 pt-1 sm:pt-0">
                            <button
                                type="button"
                                onClick={handleFilter}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                            >
                                <Search className="w-3.5 h-3.5" /> Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden shadow-sm">
                    {/* Mobile Card Feed (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {transactions.data.length > 0 ? (
                            transactions.data.map((transaction) => (
                                <div key={transaction.id} className="p-3.5 space-y-2.5 active:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 font-mono">{transaction.transaction_number}</p>
                                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                {formatDate(transaction.transaction_date)}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span
                                                className={`text-sm font-bold font-mono block ${
                                                    transaction.type === 'income'
                                                        ? 'text-green-600'
                                                        : transaction.type === 'expense'
                                                        ? 'text-red-600'
                                                        : 'text-emerald-600'
                                                }`}
                                            >
                                                {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                            </span>
                                            <span
                                                className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-medium capitalize mt-0.5 ${
                                                    transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.type === 'expense'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span>Account: <b className="text-gray-800">{transaction.account?.account_name ?? '—'}</b></span>
                                        <span>Category: <b className="text-gray-800">{categoryName(transaction)}</b></span>
                                    </div>

                                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                                        <Link
                                            href={`/accounting/transactions/${transaction.id}`}
                                            className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded inline-flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" /> View
                                        </Link>
                                        <Link
                                            href={`/accounting/transactions/${transaction.id}/edit`}
                                            className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded inline-flex items-center gap-1"
                                        >
                                            <Pencil className="w-3 h-3" /> Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(transaction.id, transaction.transaction_number)}
                                            className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs font-medium text-gray-500">No transactions found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Transaction#</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.data.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.transaction_number}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {formatDate(transaction.transaction_date)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                                    transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.type === 'expense'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{transaction.account?.account_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{categoryName(transaction)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={`text-sm font-semibold font-mono ${
                                                    transaction.type === 'income'
                                                        ? 'text-green-600'
                                                        : transaction.type === 'expense'
                                                        ? 'text-red-600'
                                                        : 'text-emerald-600'
                                                }`}
                                            >
                                                {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/accounting/transactions/${transaction.id}`}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                                    title="View"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <Link
                                                    href={`/accounting/transactions/${transaction.id}/edit`}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(transaction.id, transaction.transaction_number)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {transactions.data.length === 0 && (
                        <div className="hidden md:block text-center py-12">
                            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No transactions found</p>
                        </div>
                    )}
                </div>

                <IndexPagination
                    links={transactions.links}
                    from={transactions.from ?? undefined}
                    to={transactions.to ?? undefined}
                    total={transactions.total}
                    lastPage={transactions.last_page}
                />
            </div>
        </AuthenticatedLayout>
    );
}
