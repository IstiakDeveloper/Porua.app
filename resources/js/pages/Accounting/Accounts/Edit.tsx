import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';
import { Account } from '@/types/accounting';

interface EditProps {
    account: Account;
}

export default function Edit({ account }: EditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        account_name: account.account_name,
        account_number: account.account_number,
        account_type: account.account_type,
        bank_name: account.bank_name || '',
        branch: account.branch || '',
        description: account.description || '',
        status: account.status,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/accounting/accounts/${account.id}`, formData, {
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
            <Head title="Edit Account" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Edit Account</h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Update account information</p>
                    </div>
                    <Button variant="outline" size="sm"
                        onClick={() => router.visit('/accounting/accounts')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Account Name"
                                value={formData.account_name}
                                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                error={errors.account_name}
                                required
                                placeholder="e.g., Main Operating Account"
                            />

                            <Input
                                label="Account Number"
                                value={formData.account_number}
                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                error={errors.account_number}
                                required
                                placeholder="e.g., 1234567890"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.account_type}
                                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="bank">Bank Account</option>
                                    <option value="cash">Cash</option>
                                    <option value="mobile_banking">Mobile Banking</option>
                                </select>
                                {errors.account_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {(formData.account_type === 'bank' || formData.account_type === 'mobile_banking') && (
                                <>
                                    <Input
                                        label="Bank/Service Name"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        error={errors.bank_name}
                                        placeholder="e.g., Islami Bank, bKash"
                                    />

                                    {formData.account_type === 'bank' && (
                                        <Input
                                            label="Branch"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                            error={errors.branch}
                                            placeholder="e.g., Dhaka Main Branch"
                                        />
                                    )}
                                </>
                            )}
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
                                placeholder="Optional description about the account"
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
                                Update Account
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/accounting/accounts')}
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
