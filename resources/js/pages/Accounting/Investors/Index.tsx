import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { UserPlus, Users, Briefcase, Search, Filter } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'accounting.investors.index': '/accounting/investors',
        'accounting.investors.create': '/accounting/investors/create',
        'accounting.investors.show': '/accounting/investors',
        'accounting.investors.edit': '/accounting/investors',
    };
    const baseRoute = routes[name];
    if (!baseRoute) return `/${name.replace(/\./g, '/')}`;
    if (params) {
        if (typeof params === 'object' && !Array.isArray(params)) {
            const queryString = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined) as [string, string][]).toString();
            return queryString ? `${baseRoute}?${queryString}` : baseRoute;
        }
        // For edit route, append /edit after the ID
        if (name === 'accounting.investors.edit') {
            return `${baseRoute}/${params}/edit`;
        }
        return `${baseRoute}/${params}`;
    }
    return baseRoute;
}

// Date formatter helper
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

interface Investor {
    id: number;
    investor_code: string;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    investor_type: string;
    status: string;
    funds_count: number;
    total_investment: number;
    active_investment: number;
    created_at: string;
}

interface Props {
    investors: {
        data: Investor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        investor_type?: string;
        status?: string;
    };
    stats: {
        total_investors: number;
        active_investors: number;
        total_funds: number;
    };
}

export default function Index({ investors, filters, stats }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [investorType, setInvestorType] = React.useState(filters.investor_type || '');
    const [status, setStatus] = React.useState(filters.status || '');

    const handleFilter = () => {
        router.get(route('accounting.investors.index'), {
            search,
            investor_type: investorType,
            status,
        });
    };

    const handleReset = () => {
        setSearch('');
        setInvestorType('');
        setStatus('');
        router.get(route('accounting.investors.index'));
    };

    const investorTypeLabels: Record<string, string> = {
        individual: 'Individual',
        organization: 'Organization',
        institution: 'Institution',
        government: 'Government',
    };

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Investors" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-emerald-600" />
                            Fund Investors
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Manage investors and fund allocations</p>
                    </div>
                    <Link
                        href={route('accounting.investors.create')}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Investor
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700"><Users className="w-4 h-4" /></div>
                        <div><p className="text-xs text-gray-500">Total Investors</p><p className="text-sm font-semibold text-gray-900">{stats.total_investors}</p></div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-green-100 text-green-700"><UserPlus className="w-4 h-4" /></div>
                        <div><p className="text-xs text-gray-500">Active</p><p className="text-sm font-semibold text-gray-900">{stats.active_investors}</p></div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700"><Briefcase className="w-4 h-4" /></div>
                        <div><p className="text-xs text-gray-500">With Funds</p><p className="text-sm font-semibold text-gray-900">{stats.total_funds}</p></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name, code, email..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Investor Type</label>
                                <select
                                    value={investorType}
                                    onChange={(e) => setInvestorType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="individual">Individual</option>
                                    <option value="organization">Organization</option>
                                    <option value="institution">Institution</option>
                                    <option value="government">Government</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                                >
                                    <Filter className="w-5 h-5 inline mr-2" />
                                    Filter
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Funds</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {investors.data.map((investor) => (
                                    <tr key={investor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-semibold text-indigo-600">{investor.name}</div>
                                                <div className="text-xs text-gray-500">{investor.investor_code}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm text-gray-900">{investor.contact_person || '-'}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    {investor.email ? `✉️ ${investor.email}` : investor.phone ? `📱 ${investor.phone}` : '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {investorTypeLabels[investor.investor_type]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">৳{formatAmount(investor.total_investment)}</div>
                                            <div className="text-xs text-gray-500">{investor.funds_count} funds</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-green-600">৳{formatAmount(investor.active_investment)}</div>
                                            <div className="text-xs text-gray-500">Active</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[investor.status]}`}>
                                                {investor.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={route('accounting.investors.show', investor.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 hover:underline transition"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('accounting.investors.edit', investor.id)}
                                                    className="text-blue-600 hover:text-blue-900 hover:underline transition"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {investors.last_page > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing page {investors.current_page} of {investors.last_page}
                                    </div>
                                    <div className="flex gap-2">
                                        {investors.current_page > 1 && (
                                            <Link
                                                href={route('accounting.investors.index', { ...filters, page: investors.current_page - 1 })}
                                                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {investors.current_page < investors.last_page && (
                                            <Link
                                                href={route('accounting.investors.index', { ...filters, page: investors.current_page + 1 })}
                                                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
