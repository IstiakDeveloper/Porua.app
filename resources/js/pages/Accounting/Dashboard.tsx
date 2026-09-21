import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Activity,
    Building2,
    LayoutDashboard,
    ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { AccountingStats, Transaction, CategoryBreakdown, AccountSummary } from '@/types/accounting';

interface DashboardProps {
    stats: AccountingStats;
    recentTransactions: Transaction[];
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
    accounts: AccountSummary[];
}

export default function Dashboard({
    stats,
    recentTransactions,
    expenseByCategory,
    incomeByCategory,
    accounts,
}: DashboardProps) {
    const monthlyNet = (stats.monthly_income ?? 0) - (stats.monthly_expense ?? 0);

    return (
        <AuthenticatedLayout>
            <Head title="Accounting Dashboard" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                            Accounting Dashboard
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Financial overview and transactions</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/accounting/transactions/create"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                        >
                            New Transaction
                        </Link>
                        <Link
                            href="/accounting/accounts"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                        >
                            Accounts
                        </Link>
                    </div>
                </div>

                {/* Stats - emerald theme, compact */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Balance</p>
                            <p className="text-sm font-semibold text-gray-900">৳{formatCurrency(stats.total_balance)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-green-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-green-100 text-green-700">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Income</p>
                            <p className="text-sm font-semibold text-green-700">৳{formatCurrency(stats.total_income)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-red-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-red-50 text-red-700">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Expense</p>
                            <p className="text-sm font-semibold text-red-700">৳{formatCurrency(stats.total_expense)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fixed Assets</p>
                            <p className="text-sm font-semibold text-gray-900">৳{formatCurrency(stats.total_assets)}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly row - compact */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-emerald-700" />
                            <p className="text-xs font-medium text-emerald-800">This Month Income</p>
                        </div>
                        <p className="text-lg font-semibold text-emerald-900">৳{formatCurrency(stats.monthly_income ?? 0)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg border border-red-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-red-700" />
                            <p className="text-xs font-medium text-red-800">This Month Expense</p>
                        </div>
                        <p className="text-lg font-semibold text-red-900">৳{formatCurrency(stats.monthly_expense ?? 0)}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <PieChart className="w-4 h-4 text-emerald-600" />
                            <p className="text-xs font-medium text-gray-600">Net (Month)</p>
                        </div>
                        <p className={`text-lg font-semibold ${monthlyNet >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            ৳{formatCurrency(Math.abs(monthlyNet))}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-800">Recent Transactions</span>
                            <Link href="/accounting/transactions" className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5">
                                View all <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {recentTransactions.length > 0 ? (
                                <div className="space-y-2">
                                    {recentTransactions.slice(0, 8).map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/80 text-xs"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{transaction.transaction_number}</p>
                                                <p className="text-gray-500">{transaction.account?.account_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={
                                                        transaction.type === 'income'
                                                            ? 'text-green-600 font-semibold'
                                                            : transaction.type === 'expense'
                                                            ? 'text-red-600 font-semibold'
                                                            : 'text-emerald-600 font-semibold'
                                                    }
                                                >
                                                    {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                                </p>
                                                <p className="text-gray-400 capitalize">{transaction.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-6 text-sm">No recent transactions</p>
                            )}
                        </div>
                    </div>

                    {/* Accounts Summary */}
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-800">Accounts Summary</span>
                            <Link href="/accounting/accounts" className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5">
                                View all <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {accounts.length > 0 ? (
                                <div className="space-y-2">
                                    {accounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/80 text-xs"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{account.name}</p>
                                                <p className="text-gray-500 capitalize">{account.type.replace('_', ' ')}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">৳{formatCurrency(account.balance)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-6 text-sm">No accounts found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category breakdown - compact */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100">
                            <span className="text-sm font-medium text-emerald-800">Income by Category (This Month)</span>
                        </div>
                        <div className="p-4">
                            {incomeByCategory.length > 0 ? (
                                <div className="space-y-2 text-xs">
                                    {incomeByCategory.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-1.5">
                                            <span className="text-gray-700">{item.category}</span>
                                            <span className="font-semibold text-green-600">৳{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4 text-sm">No income data</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100">
                            <span className="text-sm font-medium text-emerald-800">Expense by Category (This Month)</span>
                        </div>
                        <div className="p-4">
                            {expenseByCategory.length > 0 ? (
                                <div className="space-y-2 text-xs">
                                    {expenseByCategory.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-1.5">
                                            <span className="text-gray-700">{item.category}</span>
                                            <span className="font-semibold text-red-600">৳{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4 text-sm">No expense data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
