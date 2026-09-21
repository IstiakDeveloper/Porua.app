import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Select from '@/Components/Select';
import { DollarSign, Calendar, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';

interface Child {
    id: number;
    full_name: string;
}

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
    class_name: string;
    section_name: string;
}

interface FeeCollection {
    id: number;
    fee_type: string;
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
}

interface Props {
    student: Student;
    children: Child[];
    feeCollections: FeeCollection[];
    summary: {
        total_amount: number;
        total_paid: number;
        total_due: number;
        overdue_amount: number;
        overdue_count: number;
    };
}

export default function Index({ student, children, feeCollections, summary }: Props) {
    const handleStudentChange = (studentId: string) => {
        router.get(route('parent.fees.index'), { student_id: studentId });
    };

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
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'partial':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'pending':
                return <XCircle className="h-5 w-5 text-orange-600" />;
            case 'overdue':
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Records" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Fee Records</h1>
                        <p className="text-gray-600">View your child's fee payment history</p>
                    </div>

                    {/* Student Selector */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Select
                                        label="Select Child"
                                        value={student.id.toString()}
                                        onChange={(e) => handleStudentChange(e.target.value)}
                                        options={children.map((child) => ({
                                            value: child.id.toString(),
                                            label: child.full_name
                                        }))}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="text-sm">
                                        <p className="text-gray-600">Class</p>
                                        <p className="font-medium">{student.class_name} - {student.section_name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Total Amount</p>
                                        <p className="text-xl font-bold">৳{summary.total_amount.toFixed(2)}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-gray-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Total Paid</p>
                                        <p className="text-xl font-bold text-green-600">৳{summary.total_paid.toFixed(2)}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Total Due</p>
                                        <p className="text-xl font-bold text-orange-600">৳{summary.total_due.toFixed(2)}</p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Overdue</p>
                                        <p className="text-xl font-bold text-red-600">৳{summary.overdue_amount.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{summary.overdue_count} items</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fee Collections */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {feeCollections.length > 0 ? (
                                <div className="space-y-4">
                                    {feeCollections.map((fee) => (
                                        <Card key={fee.id} className="border">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-start gap-3">
                                                        {getStatusIcon(fee.is_overdue ? 'overdue' : fee.status)}
                                                        <div>
                                                            <h4 className="font-semibold text-lg">{fee.fee_type}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                Receipt: {fee.receipt_number || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={getStatusBadge(fee.is_overdue ? 'overdue' : fee.status)}>
                                                        {fee.is_overdue ? 'OVERDUE' : fee.status.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Amount</p>
                                                        <p className="text-lg font-bold">৳{fee.amount.toFixed(2)}</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Paid</p>
                                                        <p className="text-lg font-bold text-green-600">
                                                            ৳{fee.paid_amount.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Remaining</p>
                                                        <p className="text-lg font-bold text-orange-600">
                                                            ৳{fee.remaining.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Due Date</p>
                                                        <p className="text-sm font-semibold text-blue-600">
                                                            {new Date(fee.due_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                                                        <p className="text-sm font-semibold text-purple-600">
                                                            {fee.payment_date
                                                                ? new Date(fee.payment_date).toLocaleDateString()
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                                                    {fee.payment_method && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <span className="font-medium">Payment Method:</span>
                                                            <span>{fee.payment_method}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span className="font-medium">Collected By:</span>
                                                        <span>{fee.collector_name}</span>
                                                    </div>
                                                </div>

                                                {fee.remarks && (
                                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                                        <span className="font-medium">Remarks:</span> {fee.remarks}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 mt-3">
                                                    <Link href={route('parent.fees.show', fee.id)}>
                                                        <Button size="sm" variant="outline">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No fee records available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
