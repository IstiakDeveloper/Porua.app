import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Calendar, User, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Transaction } from '@/types/accounting';

interface ShowProps {
    transaction: Transaction;
}

export default function Show({ transaction }: ShowProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Transaction: ${transaction.transaction_number}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Transaction Details
                        </h1>
                        <p className="text-gray-600 mt-1">{transaction.transaction_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/accounting/transactions/${transaction.id}/edit`}>
                            <Button variant="ghost" icon={<Pencil className="w-5 h-5" />}>
                                Edit
                            </Button>
                        </Link>
                        <Link href="/accounting/transactions">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back to Transactions
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Transaction Number</p>
                                    <p className="text-lg font-semibold text-gray-900">{transaction.transaction_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Type</p>
                                    <Badge
                                        variant={
                                            transaction.type === 'income' ? 'success' :
                                            transaction.type === 'expense' ? 'error' : 'info'
                                        }
                                        className="capitalize"
                                    >
                                        {transaction.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                                    <p className={`text-2xl font-bold ${
                                        transaction.type === 'income' ? 'text-green-600' :
                                        transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                        {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{formatDate(transaction.transaction_date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">From Account</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {transaction.account?.account_name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {transaction.account?.account_number}
                                    </p>
                                </div>

                                {transaction.type === 'transfer' && transaction.transfer_to_account && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600 mb-1">To Account</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {transaction.transfer_to_account.account_name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {transaction.transfer_to_account.account_number}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        {(transaction.income_category || transaction.expense_category) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Category</h2>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {transaction.income_category?.name || transaction.expense_category?.name}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Code: {transaction.income_category?.code || transaction.expense_category?.code}
                                    </p>
                                    {(transaction.income_category?.description || transaction.expense_category?.description) && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {transaction.income_category?.description || transaction.expense_category?.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {transaction.description && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                                <p className="text-gray-700">{transaction.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Created By */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Created By</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{transaction.creator?.name}</p>
                                    <p className="text-sm text-gray-600">{transaction.creator?.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                                <p>Created: {formatDate(transaction.created_at)}</p>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Transaction Type</span>
                                    <Badge
                                        variant={
                                            transaction.type === 'income' ? 'success' :
                                            transaction.type === 'expense' ? 'error' : 'info'
                                        }
                                        className="capitalize"
                                    >
                                        {transaction.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <Badge variant="success">Completed</Badge>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-900">Total Amount</span>
                                        <span className={`text-xl font-bold ${
                                            transaction.type === 'income' ? 'text-green-600' :
                                            transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                            ৳{formatCurrency(transaction.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
