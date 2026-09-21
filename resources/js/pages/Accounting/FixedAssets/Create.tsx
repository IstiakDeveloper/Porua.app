import React, { FormEvent, useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Account } from '@/types/accounting';

interface CreateProps {
    accounts: Account[];
    nextAssetCode: string;
}

export default function Create({ accounts, nextAssetCode }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        asset_name: '',
        asset_code: nextAssetCode,
        category: '',
        account_id: '4',
        purchase_date: new Date().toISOString().split('T')[0],
        depreciation_rate: '0',
        description: '',
        status: 'active',
        quantity: '1',
        amount: '',
    });

    useEffect(() => {
        if (accounts.length > 0 && !formData.account_id) {
            setFormData(prev => ({ ...prev, account_id: accounts[0].id.toString() }));
        }
    }, [accounts]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/accounting/fixed-assets', formData, {
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
            <Head title="Add Fixed Asset" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Add Fixed Asset
                        </h1>
                        <p className="text-gray-600 mt-1">Register a new fixed asset with quantity and amount</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/accounting/fixed-assets')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Asset Name"
                                value={formData.asset_name}
                                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                                error={errors.asset_name}
                                required
                                placeholder="e.g., School Chair"
                            />

                            <Input
                                label="Asset Code"
                                value={formData.asset_code}
                                onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                                error={errors.asset_code}
                                required
                                readOnly
                                className="bg-gray-50"
                                placeholder="Auto-generated"
                            />

                            <Input
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                error={errors.category}
                                required
                                placeholder="e.g., Vehicle, Furniture, Equipment"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Account <span className="text-red-500">*</span>
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
                                            {account.account_name} (৳{parseFloat(account.current_balance.toString()).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                                {errors.account_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>
                                )}
                            </div>

                            <Input
                                label="Purchase Date"
                                type="date"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                error={errors.purchase_date}
                                required
                            />

                            <Input
                                label="Depreciation Rate (%)"
                                type="number"
                                step="0.01"
                                value={formData.depreciation_rate}
                                onChange={(e) => setFormData({ ...formData, depreciation_rate: e.target.value })}
                                error={errors.depreciation_rate}
                                placeholder="e.g., 10.00"
                            />

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
                                    <option value="disposed">Disposed</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
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
                                placeholder="Optional asset description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-purple-600" />
                                Quantity & Amount
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Quantity"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    error={errors.quantity}
                                    required
                                    placeholder="e.g., 10"
                                />
                                <Input
                                    label="Total Amount (৳)"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    error={errors.amount}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            {formData.quantity && formData.amount && parseFloat(formData.quantity) > 0 && (
                                <p className="mt-3 text-sm text-gray-600">
                                    Avg. unit price: ৳{formatCurrency(parseFloat(formData.amount) / parseFloat(formData.quantity))}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                loading={isSubmitting}
                                icon={<Save className="w-5 h-5" />}
                            >
                                Add Asset
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/accounting/fixed-assets')}
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
