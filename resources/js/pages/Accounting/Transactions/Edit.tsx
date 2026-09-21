import React, { FormEvent, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft, Pencil } from 'lucide-react';
import { Account, ExpenseCategory, IncomeCategory, Transaction } from '@/types/accounting';

interface EditProps {
    transaction: Transaction & Record<string, any>;
    accounts: Account[];
    incomeCategories: IncomeCategory[];
    expenseCategories: ExpenseCategory[];
}

export default function Edit({ transaction, accounts, incomeCategories, expenseCategories }: EditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialAccountId = (transaction.account_id ?? transaction.account?.id ?? '').toString();
    const initialType = (transaction.type ?? 'income') as Transaction['type'];
    const initialIncomeCategoryId = (transaction.income_category_id ?? transaction.incomeCategory?.id ?? '').toString();
    const initialExpenseCategoryId = (transaction.expense_category_id ?? transaction.expenseCategory?.id ?? '').toString();
    const initialTransferToAccountId = (transaction.transfer_to_account_id ?? transaction.transferToAccount?.id ?? '').toString();

    const [formData, setFormData] = useState({
        type: initialType,
        account_id: initialAccountId || (accounts[0]?.id?.toString() ?? ''),
        income_category_id: initialIncomeCategoryId || (incomeCategories[0]?.id?.toString() ?? ''),
        expense_category_id: initialExpenseCategoryId || (expenseCategories[0]?.id?.toString() ?? ''),
        transfer_to_account_id: initialTransferToAccountId || '',
        amount: transaction.amount != null ? String(transaction.amount) : '',
        transaction_date: (transaction.transaction_date ?? '').toString().slice(0, 10),
        payment_method: (transaction.payment_method ?? '') as string,
        reference_number: (transaction.reference_number ?? '') as string,
        description: (transaction.description ?? '') as string,
    });

    const availableTransferAccounts = useMemo(() => {
        const fromId = formData.account_id;
        return accounts.filter((a) => a.id.toString() !== fromId);
    }, [accounts, formData.account_id]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/accounting/transactions/${transaction.id}`, formData, {
            onError: (e) => {
                setErrors(e as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Transaction: ${transaction.transaction_number ?? ''}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Pencil className="w-6 h-6 text-emerald-600" />
                            Edit Transaction
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {transaction.transaction_number}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/accounting/transactions/${transaction.id}`}>
                            <Button variant="ghost">
                                View
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/accounting/transactions')}
                            icon={<ArrowLeft className="w-5 h-5" />}
                        >
                            Back
                        </Button>
                    </div>
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
                                    onChange={(e) => {
                                        const nextType = e.target.value as Transaction['type'];
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: nextType,
                                            income_category_id: nextType === 'income' ? (prev.income_category_id || (incomeCategories[0]?.id?.toString() ?? '')) : '',
                                            expense_category_id: nextType === 'expense' ? (prev.expense_category_id || (expenseCategories[0]?.id?.toString() ?? '')) : '',
                                            transfer_to_account_id: nextType === 'transfer' ? prev.transfer_to_account_id : '',
                                        }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.account_id}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        setFormData((prev) => ({
                                            ...prev,
                                            account_id: next,
                                            transfer_to_account_id:
                                                prev.type === 'transfer' && prev.transfer_to_account_id === next ? '' : prev.transfer_to_account_id,
                                        }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.account_name} (৳{account.current_balance})
                                        </option>
                                    ))}
                                </select>
                                {errors.account_id && <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>}
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
                                        required
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
                                        required
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
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {availableTransferAccounts.map((account) => (
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

                            <Input
                                label="Payment Method"
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                error={errors.payment_method}
                                placeholder="Cash / Bank / Mobile Banking (optional)"
                            />

                            <Input
                                label="Reference Number"
                                value={formData.reference_number}
                                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                error={errors.reference_number}
                                placeholder="Cheque / Txn / Ref no (optional)"
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
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                                loading={isSubmitting}
                                icon={<Save className="w-5 h-5" />}
                            >
                                Update Transaction
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit(`/accounting/transactions/${transaction.id}`)}
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

