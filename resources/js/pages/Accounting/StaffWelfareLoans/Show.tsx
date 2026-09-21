import React, { useState } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Calendar, CreditCard, DollarSign, User, FileText, CheckCircle, Clock, AlertCircle, Ban } from 'lucide-react';

// Route helper function
function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'accounting.welfare-loans.index': '/accounting/welfare-loans',
    };

    if (params && name === 'accounting.welfare-loans.installments.pay') {
        return `/accounting/welfare-loans/installments/${params.installment}/pay`;
    }
    if (params && name === 'accounting.welfare-loans.cancel') {
        return `/accounting/welfare-loans/${params.loan}/cancel`;
    }

    return routes[name] || '/';
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

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Installment {
    id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: 'pending' | 'paid' | 'overdue';
    is_overdue: boolean;
    days_overdue: number;
    account: { account_name: string } | null;
    payment_method: string | null;
    reference_number: string | null;
    remarks: string | null;
    paid_by: string | null;
}

interface Loan {
    id: number;
    loan_number: string;
    teacher: {
        id: number;
        name: string;
        employee_id: string;
        designation: string;
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
    purpose: string | null;
    remarks: string | null;
    progress_percentage: number;
    approver: string;
    creator: string;
    created_at: string;
    installments: Installment[];
}

interface Props {
    loan: Loan;
    welfareFundAccount: Account | null;
}

export default function Show({ loan, welfareFundAccount }: Props) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

    const paymentForm = useForm({
        account_id: welfareFundAccount?.id || '',
        payment_method: 'cash',
        reference_number: '',
        paid_date: new Date().toISOString().split('T')[0],
        remarks: '',
    });

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInstallment) return;

        paymentForm.post(route('accounting.welfare-loans.installments.pay', { installment: selectedInstallment.id }), {
            onSuccess: () => {
                setShowPaymentModal(false);
                setSelectedInstallment(null);
                paymentForm.reset();
            },
        });
    };

    const handleCancelLoan = () => {
        if (confirm('Are you sure you want to cancel this loan? This action cannot be undone.')) {
            router.post(route('accounting.welfare-loans.cancel', { loan: loan.id }));
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Loan ${loan.loan_number}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <Link
                                href={route('accounting.welfare-loans.index')}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Loans
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Loan Details</h1>
                            <p className="text-gray-600 mt-1">{loan.loan_number}</p>
                        </div>
                        <div className="flex gap-3">
                            {loan.status === 'active' && loan.total_paid === 0 && (
                                <button
                                    onClick={handleCancelLoan}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition"
                                >
                                    <Ban className="w-5 h-5" />
                                    Cancel Loan
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loan Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-4">
                                <User className="w-12 h-12 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Teacher</p>
                                    <p className="text-xl font-bold text-gray-900">{loan.teacher.name}</p>
                                    <p className="text-sm text-gray-500">{loan.teacher.employee_id} - {loan.teacher.designation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-4">
                                <DollarSign className="w-12 h-12 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Loan Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ৳{formatAmount(loan.loan_amount)}
                                    </p>
                                    <p className="text-sm text-gray-500">{loan.installment_count} installments</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-4">
                                <CheckCircle className="w-12 h-12 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(loan.status)}`}>
                                        {loan.status.toUpperCase()}
                                    </span>
                                    <p className="text-sm text-gray-500 mt-1">{loan.progress_percentage}% Complete</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Loan</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ৳{formatAmount(loan.loan_amount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ৳{formatAmount(loan.total_paid)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ৳{formatAmount(loan.remaining_amount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Installment Amount</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ৳{formatAmount(loan.installment_amount)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{loan.paid_installments} of {loan.installment_count} installments paid</span>
                                <span>{loan.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${loan.progress_percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Information */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Loan Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Loan Date</p>
                                <p className="text-base font-semibold text-gray-900">{formatDate(loan.loan_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">First Installment Date</p>
                                <p className="text-base font-semibold text-gray-900">{formatDate(loan.first_installment_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Account</p>
                                <p className="text-base font-semibold text-gray-900">{loan.account.account_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Approved By</p>
                                <p className="text-base font-semibold text-gray-900">{loan.approver}</p>
                            </div>
                            {loan.purpose && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">Purpose</p>
                                    <p className="text-base text-gray-900">{loan.purpose}</p>
                                </div>
                            )}
                            {loan.remarks && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">Remarks</p>
                                    <p className="text-base text-gray-900">{loan.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Installments */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Installment Schedule</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paid Date
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Details
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loan.installments.map((inst) => (
                                        <tr key={inst.id} className={inst.is_overdue && inst.status === 'pending' ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">#{inst.installment_number}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-semibold text-gray-900">
                                                    ৳{formatAmount(inst.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{formatDate(inst.due_date)}</span>
                                                    {inst.is_overdue && inst.status === 'pending' && (
                                                        <span className="text-xs text-red-600 font-semibold">
                                                            ({inst.days_overdue} days overdue)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {inst.paid_date ? (
                                                    <span className="text-sm text-gray-900">{formatDate(inst.paid_date)}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(inst.is_overdue && inst.status === 'pending' ? 'overdue' : inst.status)}`}>
                                                    {inst.is_overdue && inst.status === 'pending' ? 'OVERDUE' : inst.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inst.status === 'paid' ? (
                                                    <div className="text-sm">
                                                        <p className="text-gray-900">{inst.payment_method?.toUpperCase()}</p>
                                                        {inst.account && (
                                                            <p className="text-gray-500">{inst.account.account_name}</p>
                                                        )}
                                                        {inst.reference_number && (
                                                            <p className="text-gray-500">Ref: {inst.reference_number}</p>
                                                        )}
                                                        {inst.paid_by && (
                                                            <p className="text-gray-400 text-xs">By: {inst.paid_by}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {inst.status === 'pending' && loan.status === 'active' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInstallment(inst);
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Pay Now
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedInstallment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full">
                        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Record Installment Payment</h2>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedInstallment(null);
                                }}
                                className="text-white hover:text-gray-200"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-blue-800">
                                    Installment #{selectedInstallment.installment_number} -
                                    ৳{formatAmount(selectedInstallment.amount)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Due Date: {formatDate(selectedInstallment.due_date)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Receive to Account <span className="text-red-500">*</span>
                                </label>
                                {welfareFundAccount ? (
                                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <p className="font-semibold text-gray-900">{welfareFundAccount.account_name}</p>
                                        <p className="text-sm text-gray-600">Balance: ৳{formatAmount(welfareFundAccount.current_balance)}</p>
                                    </div>
                                ) : (
                                    <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50">
                                        <p className="text-red-600 font-semibold">⚠️ Staff Welfare Fund account not found!</p>
                                        <p className="text-sm text-red-500">Please create an account named "Staff Welfare Fund"</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentForm.data.payment_method}
                                    onChange={(e) => paymentForm.setData('payment_method', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="mobile_banking">Mobile Banking</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reference Number
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.data.reference_number}
                                    onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Transaction/Cheque/Reference number..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={paymentForm.data.paid_date}
                                    onChange={(e) => paymentForm.setData('paid_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remarks
                                </label>
                                <textarea
                                    value={paymentForm.data.remarks}
                                    onChange={(e) => paymentForm.setData('remarks', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Optional remarks..."
                                />
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-800">
                                    ✅ This will add ৳{formatAmount(selectedInstallment.amount)} to the selected account
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedInstallment(null);
                                    }}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentForm.processing || !welfareFundAccount}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {paymentForm.processing ? 'Recording...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
