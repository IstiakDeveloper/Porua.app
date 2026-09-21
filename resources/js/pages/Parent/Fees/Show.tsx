import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    DollarSign,
    Calendar,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

interface FeeCollection {
    id: number;
    fee_type: string;
    student_name: string;
    amount: number;
    paid_amount: number;
    remaining: number;
    due_date: string;
    payment_date: string | null;
    status: string;
    is_overdue: boolean;
    payment_method: string | null;
    receipt_number: string | null;
    collector_name: string;
    remarks: string | null;
    created_at: string;
}

interface Props {
    feeCollection: FeeCollection;
}

export default function Show({ feeCollection }: Props) {
    const getStatusBadge = (status: string) => {
        const variants = {
            paid: 'bg-green-100 text-green-800',
            partial: 'bg-yellow-100 text-yellow-800',
            pending: 'bg-orange-100 text-orange-800',
            overdue: 'bg-red-100 text-red-800',
        };
        return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'partial':
                return <Clock className="h-6 w-6 text-yellow-600" />;
            case 'pending':
                return <XCircle className="h-6 w-6 text-orange-600" />;
            case 'overdue':
                return <XCircle className="h-6 w-6 text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Details" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('parent.fees.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Fees
                            </Button>
                        </Link>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    {getStatusIcon(feeCollection.is_overdue ? 'overdue' : feeCollection.status)}
                                    <div>
                                        <CardTitle className="text-2xl mb-2">{feeCollection.fee_type}</CardTitle>
                                        <Badge className={getStatusBadge(feeCollection.is_overdue ? 'overdue' : feeCollection.status)}>
                                            {feeCollection.is_overdue ? 'OVERDUE' : feeCollection.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Student Name</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <p className="font-semibold">{feeCollection.student_name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Receipt Number</p>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <p className="font-semibold">{feeCollection.receipt_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Collected By</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <p className="font-semibold">{feeCollection.collector_name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Due Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="font-semibold">
                                                {new Date(feeCollection.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="font-semibold">
                                                {feeCollection.payment_date
                                                    ? new Date(feeCollection.payment_date).toLocaleDateString()
                                                    : 'Not Paid'}
                                            </p>
                                        </div>
                                    </div>
                                    {feeCollection.payment_method && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <p className="font-semibold">{feeCollection.payment_method}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card className="border-2">
                                    <CardContent className="p-6 text-center">
                                        <DollarSign className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                        <p className="text-3xl font-bold">৳{feeCollection.amount.toFixed(2)}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-green-200 bg-green-50">
                                    <CardContent className="p-6 text-center">
                                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ৳{feeCollection.paid_amount.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className={`border-2 ${feeCollection.remaining > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                                    <CardContent className="p-6 text-center">
                                        {feeCollection.remaining > 0 ? (
                                            <XCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                        ) : (
                                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        )}
                                        <p className="text-sm text-gray-600 mb-1">Remaining</p>
                                        <p className={`text-3xl font-bold ${feeCollection.remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            ৳{feeCollection.remaining.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {feeCollection.remarks && (
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-2">Remarks</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700">{feeCollection.remarks}</p>
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-6 mt-6">
                                <p className="text-xs text-gray-500">
                                    Record created on {new Date(feeCollection.created_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {feeCollection.remaining > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-900 mb-1">Payment Pending</h3>
                                        <p className="text-sm text-yellow-800">
                                            Please contact the school office to make the payment for the remaining amount.
                                            {feeCollection.is_overdue && (
                                                <span className="font-semibold"> This fee is overdue!</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
