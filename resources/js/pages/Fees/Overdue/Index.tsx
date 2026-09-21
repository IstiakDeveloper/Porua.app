import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AlertCircle,
    Clock,
    DollarSign,
    Mail,
    MessageSquare,
    Search,
    Send,
    TrendingUp,
    Filter,
    Download
} from 'lucide-react';

interface OverdueItem {
    id: string;
    student_id: number;
    student_name: string | null;
    student_roll: string | null;
    class_name: string | null;
    fee_type: string | null;
    fee_frequency: string | null;
    fee_period: string | null;
    amount: number;
    due_date: string;
    days_overdue: number;
    academic_year: string | null;
    fee_structure_id: number;
    student_email: string | null;
    student_phone: string | null;
}

interface Stats {
    total_overdue_count: number;
    total_overdue_amount: number;
    critically_overdue: number;
    moderately_overdue: number;
}

interface Props {
    overdueList: OverdueItem[];
    stats: Stats;
}

export default function Index({ overdueList, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDays, setFilterDays] = useState('all');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderType, setReminderType] = useState<'email' | 'sms' | 'both'>('email');

    // Filter overdue list
    const filteredList = overdueList.filter((item) => {
        const matchesSearch =
            item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.student_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.class_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDays =
            filterDays === 'all' ||
            (filterDays === '7' && item.days_overdue >= 7) ||
            (filterDays === '30' && item.days_overdue >= 30) ||
            (filterDays === '60' && item.days_overdue >= 60);

        return matchesSearch && matchesDays;
    });

    // Get severity badge color
    const getSeverityBadge = (days: number) => {
        if (days > 60) return 'bg-red-100 text-red-800 border-red-200';
        if (days > 30) return 'bg-orange-100 text-orange-800 border-orange-200';
        if (days > 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const getSeverityLabel = (days: number) => {
        if (days > 60) return 'Critical';
        if (days > 30) return 'High';
        if (days > 7) return 'Medium';
        return 'Low';
    };

    // Handle single reminder
    const handleSendReminder = (studentId: number, feeStructureId: number) => {
        router.post('/overdue-fees/reminder', {
            student_id: studentId,
            fee_structure_id: feeStructureId,
            reminder_type: reminderType,
        });
    };

    // Handle bulk reminders
    const handleBulkReminders = () => {
        router.post('/overdue-fees/bulk-reminder', {
            reminder_type: reminderType,
            days_filter: filterDays,
        });
        setShowReminderModal(false);
    };

    // Handle mark as paid
    const handleMarkPaid = (studentId: number, feeStructureId: number) => {
        router.get('/fee-collections', {
            student_id: studentId,
            fee_structure_id: feeStructureId,
        });
    };

    // Export to CSV
    const handleExport = () => {
        const csvContent = [
            ['Student Name', 'Roll', 'Class', 'Fee Type', 'Amount', 'Due Date', 'Days Overdue', 'Phone', 'Email'].join(','),
            ...filteredList.map(item => [
                item.student_name,
                item.student_roll,
                item.class_name,
                item.fee_type,
                item.amount,
                item.due_date,
                item.days_overdue,
                item.student_phone || '',
                item.student_email || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `overdue-fees-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Overdue Fees" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Overdue Fees</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage and track overdue fee payments
                        </p>
                    </div>
                    <button
                        onClick={() => setShowReminderModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Send className="w-4 h-4" />
                        Send Bulk Reminders
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_overdue_count}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ৳{stats.total_overdue_amount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Critical (&gt;30d)</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.critically_overdue}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Moderate (7-30d)</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.moderately_overdue}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name, roll, class..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Days Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filterDays}
                                onChange={(e) => setFilterDays(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Overdue</option>
                                <option value="7">7+ Days Overdue</option>
                                <option value="30">30+ Days Overdue</option>
                                <option value="60">60+ Days Overdue</option>
                            </select>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Overdue List */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Class
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fee Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Overdue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium">No overdue fees found</p>
                                            <p className="text-sm mt-2">All fees are up to date!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.student_name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Roll: {item.student_roll || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {item.class_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.fee_type || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.fee_period || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 capitalize">
                                                        {item.fee_frequency || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                ৳{item.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(item.due_date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(
                                                        item.days_overdue
                                                    )}`}
                                                >
                                                    <Clock className="w-3 h-3" />
                                                    {item.days_overdue} days
                                                    <span className="ml-1 font-bold">
                                                        ({getSeverityLabel(item.days_overdue)})
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleSendReminder(
                                                                item.student_id,
                                                                item.fee_structure_id
                                                            )
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Send Reminder"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleMarkPaid(
                                                                item.student_id,
                                                                item.fee_structure_id
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Collect
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bulk Reminder Modal */}
                {showReminderModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Send Bulk Reminders</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reminder Type
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="email"
                                                checked={reminderType === 'email'}
                                                onChange={(e) =>
                                                    setReminderType(e.target.value as any)
                                                }
                                                className="text-indigo-600"
                                            />
                                            <Mail className="w-4 h-4" />
                                            Email Only
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="sms"
                                                checked={reminderType === 'sms'}
                                                onChange={(e) =>
                                                    setReminderType(e.target.value as any)
                                                }
                                                className="text-indigo-600"
                                            />
                                            <MessageSquare className="w-4 h-4" />
                                            SMS Only
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="both"
                                                checked={reminderType === 'both'}
                                                onChange={(e) =>
                                                    setReminderType(e.target.value as any)
                                                }
                                                className="text-indigo-600"
                                            />
                                            <Send className="w-4 h-4" />
                                            Both Email & SMS
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        Reminders will be sent to{' '}
                                        <strong>{filteredList.length} students</strong> based on
                                        your current filter settings.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowReminderModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkReminders}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Send Reminders
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
