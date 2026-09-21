import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Edit, DollarSign, TrendingUp, Briefcase, Calendar } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'accounting.investors.index': '/accounting/investors',
        'accounting.investors.edit': '/accounting/investors',
        'accounting.funds.show': '/accounting/funds',
    };
    const baseRoute = routes[name];
    if (!params) return baseRoute;

    // For edit route, append /edit after the ID
    if (name === 'accounting.investors.edit') {
        return `${baseRoute}/${params}/edit`;
    }

    return `${baseRoute}/${params}`;
}

interface Fund {
    id: number;
    fund_code: string;
    current_balance: number;
    status: string;
    description: string | null;
    created_at: string;
    account: {
        account_name: string;
    };
    transactions: Array<{
        id: number;
        transaction_number: string;
        transaction_type: string;
        amount: number;
        transaction_date: string;
        description: string | null;
    }>;
}

interface Investor {
    id: number;
    investor_code: string;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    investor_type: string;
    status: string;
    notes: string | null;
    funds: Fund[];
}

interface Props {
    investor: Investor;
    stats: {
        total_investment: number;
        active_investment: number;
        total_funds: number;
        active_funds: number;
    };
}

export default function Show({ investor, stats }: Props) {
    const investorTypeLabels: Record<string, string> = {
        individual: 'Individual',
        organization: 'Organization',
        institution: 'Institution',
        government: 'Government',
    };

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        matured: 'bg-blue-100 text-blue-800',
        withdrawn: 'bg-gray-100 text-gray-800',
        closed: 'bg-red-100 text-red-800',
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Investor: ${investor.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Investor Details</h2>
                        <div className="flex gap-3">
                            <Link
                                href={route('accounting.investors.edit', investor.id)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Edit
                            </Link>
                            <Link
                                href={route('accounting.investors.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-500 text-sm">Total Investment</p>
                                    <p className="text-xl font-bold text-gray-800">৳{stats.total_investment.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-500 text-sm">Active Investment</p>
                                    <p className="text-xl font-bold text-gray-800">৳{stats.active_investment.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Briefcase className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-500 text-sm">Total Funds</p>
                                    <p className="text-xl font-bold text-gray-800">{stats.total_funds}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <Calendar className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-500 text-sm">Active Funds</p>
                                    <p className="text-xl font-bold text-gray-800">{stats.active_funds}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Investor Information */}
                        <div className="lg:col-span-1 bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Investor Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Investor Code</p>
                                    <p className="font-medium text-gray-900">{investor.investor_code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{investor.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <p className="font-medium text-gray-900">{investorTypeLabels[investor.investor_type]}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${investor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {investor.status}
                                    </span>
                                </div>
                                {investor.contact_person && (
                                    <div>
                                        <p className="text-sm text-gray-500">Contact Person</p>
                                        <p className="font-medium text-gray-900">{investor.contact_person}</p>
                                    </div>
                                )}
                                {investor.email && (
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{investor.email}</p>
                                    </div>
                                )}
                                {investor.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{investor.phone}</p>
                                    </div>
                                )}
                                {investor.address && (
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">{investor.address}</p>
                                    </div>
                                )}
                                {investor.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="font-medium text-gray-900">{investor.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Funds List */}
                        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Funds</h3>
                            {investor.funds.length > 0 ? (
                                <div className="space-y-4">
                                    {investor.funds.map((fund) => (
                                        <div key={fund.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <Link
                                                        href={route('accounting.funds.show', fund.id)}
                                                        className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        {fund.fund_code}
                                                    </Link>
                                                    {fund.description && (
                                                        <p className="text-sm text-gray-500">{fund.description}</p>
                                                    )}
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[fund.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {fund.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Current Balance</p>
                                                    <p className="font-medium text-gray-900">৳{Number(fund.current_balance || 0).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Created Date</p>
                                                    <p className="font-medium text-gray-900">{new Date(fund.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Account</p>
                                                    <p className="font-medium text-gray-900">{fund.account.account_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Transactions</p>
                                                    <p className="font-medium text-gray-900">{fund.transactions?.length || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No funds available for this investor
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
