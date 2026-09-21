import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Link } from '@inertiajs/react';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

interface Loan {
    id: number;
    loan_number: string;
    teacher: {
        id: number;
        name: string;
        employee_id: string;
    };
    account: {
        id: number;
        account_name: string;
    };
    loan_amount: number;
    total_paid: number;
    remaining_amount: number;
    installment_count: number;
    paid_installments: number;
    installment_amount: number;
    loan_date: string;
    first_installment_date: string;
    status: 'active' | 'paid' | 'cancelled';
    progress_percentage: number;
    purpose: string | null;
    remarks: string | null;
    created_at: string;
}

interface LoansTableProps {
    loans: Loan[];
    onEdit: (loan: Loan) => void;
    onDelete?: (loan: Loan) => void;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function getStatusBadge(status: string) {
    const styles = {
        active: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
}

export default function LoansTable({ loans, onEdit, onDelete }: LoansTableProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Loan Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Teacher
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loans.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No loans found
                                </td>
                            </tr>
                        ) : (
                            loans.map((loan) => (
                                <tr key={loan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{loan.loan_number}</p>
                                            <p className="text-sm text-gray-500">Date: {formatDate(loan.loan_date)}</p>
                                            <p className="text-sm text-gray-500">Account: {loan.account.account_name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{loan.teacher.name}</p>
                                            <p className="text-sm text-gray-500">ID: {loan.teacher.employee_id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                ৳{formatAmount(loan.loan_amount)}
                                            </p>
                                            <p className="text-sm text-green-600">
                                                Paid: ৳{formatAmount(loan.total_paid)}
                                            </p>
                                            <p className="text-sm text-red-600">
                                                Due: ৳{formatAmount(loan.remaining_amount)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-700 mb-1">
                                                {loan.paid_installments}/{loan.installment_count} installments
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${loan.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{loan.progress_percentage}%</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(loan.status)}`}>
                                            {loan.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            <Link
                                                href={`/accounting/welfare-loans/${loan.id}`}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>

                                            {loan.status === 'active' && (
                                                <button
                                                    onClick={() => onEdit(loan)}
                                                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-1 rounded transition"
                                                    title="Edit loan amount and schedule (paid installments are kept)"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                            )}

                                            {/* Show Delete button only if no payments made */}
                                            {loan.status === 'active' && Number(loan.total_paid) === 0 && onDelete && (
                                                <button
                                                    onClick={() => onDelete(loan)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition"
                                                    title="Delete this loan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
