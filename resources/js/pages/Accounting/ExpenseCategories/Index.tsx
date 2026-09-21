import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { Plus, Edit, Trash2, TrendingDown } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive';
    transactions_count: number;
}

interface IndexProps {
    categories: Category[];
}

export default function Index({ categories }: IndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        status: 'active',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreate = () => {
        router.post('/accounting/expense-categories', formData, {
            onError: (errors) => setErrors(errors as Record<string, string>),
            onSuccess: () => {
                setIsCreating(false);
                setFormData({ name: '', code: '', description: '', status: 'active' });
                setErrors({});
            },
        });
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            code: category.code,
            description: category.description || '',
            status: category.status,
        });
        setErrors({});
    };

    const handleUpdate = (id: number) => {
        router.put(`/accounting/expense-categories/${id}`, formData, {
            onError: (errors) => setErrors(errors as Record<string, string>),
            onSuccess: () => {
                setEditingId(null);
                setFormData({ name: '', code: '', description: '', status: 'active' });
                setErrors({});
            },
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete expense category "${name}"?`)) {
            router.delete(`/accounting/expense-categories/${id}`);
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({ name: '', code: '', description: '', status: 'active' });
        setErrors({});
    };

    return (
        <AuthenticatedLayout>
            <Head title="Expense Categories" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-emerald-600" />
                            Expense Categories
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Categories for expense transactions</p>
                    </div>
                    {!isCreating && !editingId && (
                        <Button size="sm" onClick={() => setIsCreating(true)} icon={<Plus className="w-4 h-4" />}>
                            Add Category
                        </Button>
                    )}
                </div>

                {(isCreating || editingId) && (
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4">
                        <h2 className="text-sm font-medium text-emerald-800 mb-3">
                            {isCreating ? 'Create New Category' : 'Edit Category'}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Category Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="e.g., Office Supplies"
                            />
                            <Input
                                label="Category Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                error={errors.code}
                                required
                                placeholder="e.g., EXP-001"
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                error={errors.description}
                                placeholder="Optional description"
                            />
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <Button size="sm" onClick={() => isCreating ? handleCreate() : handleUpdate(editingId!)}>
                                {isCreating ? 'Create' : 'Update'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700"><TrendingDown className="w-4 h-4" /></div>
                        <div><p className="text-xs text-gray-500">Total</p><p className="text-sm font-semibold text-gray-900">{categories.length}</p></div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-green-100 text-green-700"><TrendingDown className="w-4 h-4" /></div>
                        <div><p className="text-xs text-gray-500">Active</p><p className="text-sm font-semibold text-gray-900">{categories.filter(c => c.status === 'active').length}</p></div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700"><TrendingDown className="w-4 h-4" /></div>
                        <div><p className="text-xs text-gray-500">Transactions</p><p className="text-sm font-semibold text-gray-900">{categories.reduce((sum, c) => sum + (c.transactions_count ?? 0), 0)}</p></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">Txns</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.name}</td>
                                        <td className="px-4 py-3"><code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{category.code}</code></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{category.description || '—'}</td>
                                        <td className="px-4 py-3 text-center"><span className="text-xs font-medium text-gray-600">{category.transactions_count ?? 0}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{category.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button type="button" onClick={() => handleEdit(category)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                                                <button type="button" onClick={() => handleDelete(category.id, category.name)} disabled={(category.transactions_count ?? 0) > 0} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {categories.length === 0 && (
                            <div className="text-center py-12">
                                <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No expense categories found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
