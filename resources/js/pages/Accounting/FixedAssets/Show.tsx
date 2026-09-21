import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import { ArrowLeft, Edit, Calendar, TrendingDown, Plus, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Account, FixedAsset } from '@/types/accounting';

interface ShowProps {
    asset: FixedAsset;
    accounts: Account[];
}

export default function Show({ asset, accounts }: ShowProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [addForm, setAddForm] = useState({
        account_id: asset.account_id?.toString() || accounts[0]?.id?.toString() || '',
        purchase_date: new Date().toISOString().split('T')[0],
        quantity: '',
        amount: '',
    });

    const summary = asset.quantity_summary ?? { quantity: 0, amount: 0, unit_price: 0 };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const calculateDepreciation = () => {
        if (!asset.depreciation_rate) return 0;
        return asset.purchase_price - asset.current_value;
    };

    const getDepreciationPercentage = () => {
        if (asset.purchase_price === 0) return 0;
        return ((calculateDepreciation() / asset.purchase_price) * 100).toFixed(2);
    };

    const openAddModal = () => {
        setErrors({});
        setAddForm({
            account_id: asset.account_id?.toString() || accounts[0]?.id?.toString() || '',
            purchase_date: new Date().toISOString().split('T')[0],
            quantity: '',
            amount: '',
        });
        setShowAddModal(true);
    };

    const handleAddQuantity = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/accounting/fixed-assets/${asset.id}/items`, addForm, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setShowAddModal(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Asset: ${asset.asset_name}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {asset.asset_name}
                        </h1>
                        <p className="text-gray-600 mt-1">Fixed Asset Details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            icon={<Plus className="w-5 h-5" />}
                            onClick={openAddModal}
                        >
                            Add Quantity
                        </Button>
                        <Link href={`/accounting/fixed-assets/${asset.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Asset
                            </Button>
                        </Link>
                        <Link href="/accounting/fixed-assets">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Asset Code</p>
                                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{asset.asset_code}</code>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Category</p>
                                    <p className="text-lg font-semibold text-gray-900">{asset.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Purchase Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{formatDate(asset.purchase_date)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <Badge
                                        variant={
                                            asset.status === 'active' ? 'success' :
                                            asset.status === 'disposed' ? 'default' : 'error'
                                        }
                                    >
                                        {asset.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-600" />
                                    Quantity & Amount
                                </h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={openAddModal}
                                >
                                    Add Quantity
                                </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Avg. Unit Price</p>
                                    <p className="text-2xl font-bold text-gray-900">৳{formatCurrency(summary.unit_price)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-purple-700">৳{formatCurrency(summary.amount)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
                                    <p className="text-2xl font-bold text-gray-900">৳{formatCurrency(asset.purchase_price)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                                    <p className="text-2xl font-bold text-blue-600">৳{formatCurrency(asset.current_value)}</p>
                                </div>
                                {asset.depreciation_rate ? (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Depreciation Rate</p>
                                            <p className="text-lg font-semibold text-gray-900">{asset.depreciation_rate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Depreciation</p>
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                                <p className="text-lg font-semibold text-red-600">
                                                    ৳{formatCurrency(calculateDepreciation())} ({getDepreciationPercentage()}%)
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {asset.description && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                                <p className="text-gray-700">{asset.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Asset Status</span>
                                    <Badge
                                        variant={
                                            asset.status === 'active' ? 'success' :
                                            asset.status === 'disposed' ? 'default' : 'error'
                                        }
                                    >
                                        {asset.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Quantity</span>
                                    <span className="font-semibold text-gray-900">{summary.quantity}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Category</span>
                                    <span className="font-semibold text-gray-900">{asset.category}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600">Purchase Price</span>
                                        <span className="font-semibold text-gray-900">৳{formatCurrency(asset.purchase_price)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600">Depreciation</span>
                                        <span className="font-semibold text-red-600">-৳{formatCurrency(calculateDepreciation())}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="font-semibold text-gray-900">Current Value</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ৳{formatCurrency(asset.current_value)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Purchased</p>
                                        <p className="text-xs text-gray-600">{formatDate(asset.purchase_date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Last Updated</p>
                                        <p className="text-xs text-gray-600">{formatDate(asset.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                show={showAddModal}
                onClose={() => !isSubmitting && setShowAddModal(false)}
                title="Add Quantity"
                maxWidth="md"
            >
                <form onSubmit={handleAddQuantity} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Add more quantity and amount to <strong>{asset.asset_name}</strong>.
                        Current: <strong>{summary.quantity}</strong> pcs, ৳<strong>{formatCurrency(summary.amount)}</strong>
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Account <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={addForm.account_id}
                            onChange={(e) => setAddForm({ ...addForm, account_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                        >
                            <option value="">Select Account</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.account_name} (৳{formatCurrency(account.current_balance)})
                                </option>
                            ))}
                        </select>
                        {errors.account_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.account_id}</p>
                        )}
                    </div>

                    <Input
                        label="Purchase Date"
                        type="date"
                        value={addForm.purchase_date}
                        onChange={(e) => setAddForm({ ...addForm, purchase_date: e.target.value })}
                        error={errors.purchase_date}
                    />

                    <Input
                        label="Quantity to Add"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={addForm.quantity}
                        onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                        error={errors.quantity}
                        required
                        placeholder="e.g., 5"
                    />

                    <Input
                        label="Amount to Add (৳)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={addForm.amount}
                        onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                        error={errors.amount}
                        required
                        placeholder="0.00"
                    />

                    {addForm.quantity && addForm.amount && parseFloat(addForm.quantity) > 0 && (
                        <p className="text-sm text-gray-600">
                            After addition: <strong>{summary.quantity + parseFloat(addForm.quantity)}</strong> pcs,
                            ৳<strong>{formatCurrency(summary.amount + parseFloat(addForm.amount || '0'))}</strong>
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            loading={isSubmitting}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
