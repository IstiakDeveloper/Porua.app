import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, TrendingUp, TrendingDown, ArrowRightLeft, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Account, Transaction, AccountingStats } from '@/types/accounting';

interface ShowProps {
    account: Account & { transactions: Transaction[] };
    stats: {
        total_income: number;
        total_expense: number;
        transfers_in: number;
        transfers_out: number;
    };
}

export default function Show({ account, stats }: ShowProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Account: ${account.account_name}`} />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{account.account_name}</h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Account details & transaction history</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/accounting/accounts/${account.id}/edit`}>
                            <Button size="sm" icon={<Edit className="w-4 h-4" />}>Edit</Button>
                        </Link>
                        <Link href="/accounting/accounts">
                            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Account Number</p>
                            <p className="text-lg font-semibold text-gray-900">{account.account_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Account Type</p>
                            <Badge variant="info" className="capitalize">
                                {account.account_type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                            <p className="text-2xl font-bold text-green-600">৳{formatCurrency(account.current_balance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <Badge variant={account.status === 'active' ? 'success' : 'default'}>
                                {account.status}
                            </Badge>
                        </div>
                    </div>

                    {(account.bank_name || account.branch) && (
                        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                            {account.bank_name && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Bank/Service Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.bank_name}</p>
                                </div>
                            )}
                            {account.branch && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Branch</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.branch}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {account.description && (
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="text-gray-900">{account.description}</p>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.total_income)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Expense</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.total_expense)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Transfers In</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.transfers_in)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Transfers Out</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.transfers_out)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions (Last 50)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {account.transactions && account.transactions.length > 0 ? (
                                    account.transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{transaction.transaction_number}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(transaction.transaction_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        transaction.type === 'income' ? 'success' :
                                                        transaction.type === 'expense' ? 'error' : 'info'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {transaction.type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {transaction.category_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-semibold ${
                                                    transaction.type === 'income' ? 'text-green-600' :
                                                    transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                                }`}>
                                                    {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                {transaction.description || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No transactions found for this account
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
