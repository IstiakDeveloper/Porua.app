import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Search, Eye, Edit, Trash2, Building2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { FixedAsset, PaginatedData } from '@/types/accounting';

interface IndexProps {
    assets: PaginatedData<FixedAsset>;
    filters?: { search?: string; category?: string; status?: string };
    stats: { total_value: number; total_assets: number };
}

export default function Index({ assets, filters, stats }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [status, setStatus] = useState(filters?.status || '');

    const handleFilter = () => {
        router.get('/accounting/fixed-assets', { search, category, status }, { preserveState: true });
    };
    const handleReset = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        router.get('/accounting/fixed-assets');
    };
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete fixed asset "${name}"?`)) router.delete(`/accounting/fixed-assets/${id}`);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <AuthenticatedLayout>
            <Head title="Fixed Assets" />
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            Fixed Assets
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">School assets & equipment</p>
                    </div>
                    <Link href="/accounting/fixed-assets/create">
                        <button type="button" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                            <Plus className="w-4 h-4" /> Add Asset
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Value</p>
                            <p className="text-sm font-semibold text-gray-900">৳{formatCurrency(stats.total_value)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Assets</p>
                            <p className="text-sm font-semibold text-gray-900">{stats.total_assets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="text-sm max-w-[160px] w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                            type="text"
                            placeholder="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="text-sm max-w-[140px] w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-sm max-w-[120px] w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="disposed">Disposed</option>
                            <option value="damaged">Damaged</option>
                        </select>
                        <button type="button" onClick={handleFilter} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100">
                            <Search className="w-3.5 h-3.5" /> Filter
                        </button>
                        <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            <RefreshCw className="w-3.5 h-3.5" /> Reset
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Purchase</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Current</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.asset_name}</td>
                                        <td className="px-4 py-3"><code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{asset.asset_code}</code></td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{asset.category}</td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-600">{asset.total_quantity ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{formatDate(asset.purchase_date)}</td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">৳{formatCurrency(asset.purchase_price)}</td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">৳{formatCurrency(asset.current_value)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                asset.status === 'active' ? 'bg-green-100 text-green-800' :
                                                asset.status === 'disposed' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'
                                            }`}>{asset.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/accounting/fixed-assets/${asset.id}`} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="View"><Eye className="w-3.5 h-3.5" /></Link>
                                                <Link href={`/accounting/fixed-assets/${asset.id}/edit`} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Edit"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDelete(asset.id, asset.asset_name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {assets.data.length === 0 && (
                        <div className="text-center py-12">
                            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No fixed assets found</p>
                        </div>
                    )}
                </div>
                <IndexPagination links={assets.links} from={assets.from ?? undefined} to={assets.to ?? undefined} total={assets.total} lastPage={assets.last_page} />
            </div>
        </AuthenticatedLayout>
    );
}
