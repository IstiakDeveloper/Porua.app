import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';

export default function Create() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        account_name: '',
        account_number: '',
        account_type: 'bank',
        bank_name: '',
        branch: '',
        opening_balance: '0',
        description: '',
        status: 'active',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/accounting/accounts', formData, {
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
            <Head title="Create Account" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Create Account</h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Add a new bank, cash or mobile banking account</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.visit('/accounting/accounts')} icon={<ArrowLeft className="w-4 h-4" />}>
                        Back
                    </Button>
                </div>

                <Card className="border-emerald-100">
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
                                    className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="bank">Bank Account</option>
                                    <option value="cash">Cash</option>
                                    <option value="mobile_banking">Mobile Banking</option>
                                </select>
                                {errors.account_type && <p className="text-red-500 text-sm mt-1">{errors.account_type}</p>}
                            </div>

                            <Input
                                label="Opening Balance"
                                type="number"
                                step="0.01"
                                value={formData.opening_balance}
                                onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                                error={errors.opening_balance}
                                required
                                placeholder="0.00"
                            />

                            {(formData.account_type === 'bank' || formData.account_type === 'mobile_banking') && (
                                <>
                                    <Input
                                        label="Bank/Service Name"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        error={errors.bank_name}
                                        placeholder="e.g., Dutch Bangla Bank, bKash"
                                    />

                                    <Input
                                        label="Branch/Details"
                                        value={formData.branch}
                                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        error={errors.branch}
                                        placeholder="e.g., Dhaka Main Branch"
                                    />
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                                rows={4}
                                placeholder="Additional details about this account..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="submit"
                                size="sm"
                                loading={isSubmitting}
                                icon={<Save className="w-4 h-4" />}
                            >
                                Create Account
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
