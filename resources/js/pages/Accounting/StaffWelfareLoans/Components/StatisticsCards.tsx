import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { DollarSign, Users, TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';

interface StatisticsCardsProps {
    stats: {
        total_loans: number;
        active_loans: number;
        total_amount_given: number;
        total_recovered: number;
        total_outstanding: number;
        total_donations: number;
        fund_balance: number;
    };
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-100 mb-1">Fund Balance</p>
                        <p className="text-2xl font-bold">৳{formatAmount(stats.fund_balance)}</p>
                        <p className="text-xs text-purple-100 mt-1">Available</p>
                    </div>
                    <Wallet className="w-10 h-10 text-purple-200" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Loans</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_loans}</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-blue-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                        <p className="text-xl font-bold text-purple-600">
                            ৳{formatAmount(stats.total_donations)}
                        </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.active_loans}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Given</p>
                        <p className="text-xl font-bold text-red-600">
                            ৳{formatAmount(stats.total_amount_given)}
                        </p>
                    </div>
                    <TrendingDown className="w-10 h-10 text-red-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Recovered</p>
                        <p className="text-xl font-bold text-green-600">
                            ৳{formatAmount(stats.total_recovered)}
                        </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                        <p className="text-xl font-bold text-orange-600">
                            ৳{formatAmount(stats.total_outstanding)}
                        </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-orange-500" />
                </div>
            </div>
        </div>
    );
}
