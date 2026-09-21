import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';
import { Account, IncomeCategory, ExpenseCategory } from '@/types/accounting';

interface CreateProps {
    accounts: Account[];
    incomeCategories: IncomeCategory[];
    expenseCategories: ExpenseCategory[];
}

export default function Create({ accounts, incomeCategories, expenseCategories }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        type: 'income',
        account_id: '4',
        income_category_id: incomeCategories.length > 0 ? incomeCategories[0].id.toString() : '',
        expense_category_id: expenseCategories.length > 0 ? expenseCategories[0].id.toString() : '',
        transfer_to_account_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/accounting/transactions', formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Transaction" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Create Transaction
                        </h1>
                        <p className="text-gray-600 mt-1">Record a new financial transaction</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/accounting/transactions')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.account_id}
                                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.account_name} (৳{account.current_balance})
                                        </option>
                                    ))}
                                </select>
                                {errors.account_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>
                                )}
                            </div>

                            {formData.type === 'income' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Income Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.income_category_id}
                                        onChange={(e) => setFormData({ ...formData, income_category_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={formData.type === 'income'}
                                    >
                                        <option value="">Select Category</option>
                                        {incomeCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.income_category_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.income_category_id}</p>
                                    )}
                                </div>
                            )}

                            {formData.type === 'expense' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expense Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.expense_category_id}
                                        onChange={(e) => setFormData({ ...formData, expense_category_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={formData.type === 'expense'}
                                    >
                                        <option value="">Select Category</option>
                                        {expenseCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.expense_category_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.expense_category_id}</p>
                                    )}
                                </div>
                            )}

                            {formData.type === 'transfer' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transfer To Account <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.transfer_to_account_id}
                                        onChange={(e) => setFormData({ ...formData, transfer_to_account_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={formData.type === 'transfer'}
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.filter(a => a.id.toString() !== formData.account_id).map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.account_name} (৳{account.current_balance})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.transfer_to_account_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.transfer_to_account_id}</p>
                                    )}
                                </div>
                            )}

                            <Input
                                label="Amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                error={errors.amount}
                                required
                                placeholder="0.00"
                            />

                            <Input
                                label="Transaction Date"
                                type="date"
                                value={formData.transaction_date}
                                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                                error={errors.transaction_date}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Optional transaction description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                                loading={isSubmitting}
                                icon={<Save className="w-5 h-5" />}
                            >
                                Create Transaction
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/accounting/transactions')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
