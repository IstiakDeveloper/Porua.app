import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    DollarSign,
    Download,
    Receipt,
    AlertCircle,
    CheckCircle,
    Clock,
    Gift
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
    admission_number: string;
}

interface Fee {
    id: number;
    receipt_number: string;
    fee_type: string;
    month: string;
    year: number;
    amount: number;
    late_fee: number;
    discount: number;
    total_amount: number;
    paid_amount: number;
    remaining: number;
    payment_date: string;
    payment_method: string;
    status: string;
    remarks: string | null;
    collected_by: string;
    is_overdue: boolean;
}

interface Waiver {
    id: number;
    fee_type: string;
    waiver_type: string;
    waiver_amount: number;
    waiver_percentage: number;
    reason: string;
    valid_from: string;
    valid_to: string;
}

interface Props {
    student: Student;
    fees: Fee[];
    summary: {
        total_paid: number;
        total_due: number;
        overdue_count: number;
    };
    waivers: Waiver[];
    filters: {
        status: string | null;
        year: number;
    };
}

export default function Index({ student, fees, summary, waivers, filters }: Props) {
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedYear, setSelectedYear] = useState(filters.year.toString());

    const handleFilter = (status: string, year: string) => {
        const params: any = { year: parseInt(year) };
        if (status !== 'all') {
            params.status = status;
        }
        router.get('/student/fees', params, { preserveState: true });
    };

    const getStatusBadge = (fee: Fee) => {
        if (fee.is_overdue) {
            return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Overdue</Badge>;
        }

        switch (fee.status.toLowerCase()) {
            case 'paid':
                return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
            case 'partial':
                return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Partial</Badge>;
            case 'pending':
                return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" />Pending</Badge>;
            default:
                return <Badge>{fee.status}</Badge>;
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Fee Management
                </h2>
            }
        >
            <Head title="Fee Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div>
                                <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                <p className="text-sm text-gray-600">
                                    {student.admission_number} | Class {student.class_name} - {student.section_name}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">৳{summary.total_paid.toLocaleString()}</div>
                                <p className="text-xs text-gray-500">All time payments</p>
                            </CardContent>
                        </Card>

                        <Card className={summary.total_due > 0 ? 'border-red-200 bg-red-50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Due</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${summary.total_due > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    ৳{summary.total_due.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {summary.total_due > 0 ? 'Outstanding amount' : 'All cleared!'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={summary.overdue_count > 0 ? 'border-orange-200 bg-orange-50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Overdue Fees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${summary.overdue_count > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {summary.overdue_count}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {summary.overdue_count > 0 ? 'Requires attention' : 'On track'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fee Waivers */}
                    {waivers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Gift className="mr-2 h-5 w-5 text-green-600" />
                                    Fee Waivers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {waivers.map((waiver) => (
                                        <div key={waiver.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-sm">{waiver.fee_type}</p>
                                                    <p className="text-xs text-gray-600">{waiver.reason}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Valid: {waiver.valid_from} to {waiver.valid_to}
                                                    </p>
                                                </div>
                                                <Badge variant="default" className="bg-green-600">
                                                    {waiver.waiver_type === 'percentage'
                                                        ? `${waiver.waiver_percentage}% OFF`
                                                        : `৳${waiver.waiver_amount} OFF`}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Fee Records</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => {
                                            setSelectedStatus(e.target.value);
                                            handleFilter(e.target.value, selectedYear);
                                        }}
                                        className="w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                    </select>

                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            handleFilter(selectedStatus, e.target.value);
                                        }}
                                        className="w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year.toString()}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {fees.length > 0 ? (
                                <div className="space-y-3">
                                    {fees.map((fee) => (
                                        <div
                                            key={fee.id}
                                            className={`p-4 border rounded-lg ${
                                                fee.is_overdue ? 'border-red-200 bg-red-50' :
                                                fee.status === 'paid' ? 'border-green-200 bg-green-50' :
                                                'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="font-semibold">{fee.fee_type}</h4>
                                                        {getStatusBadge(fee)}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">Period</p>
                                                            <p className="font-medium">{fee.month} {fee.year}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Amount</p>
                                                            <p className="font-medium">৳{fee.total_amount.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Paid</p>
                                                            <p className="font-medium text-green-600">৳{fee.paid_amount.toLocaleString()}</p>
                                                        </div>
                                                        {fee.remaining > 0 && (
                                                            <div>
                                                                <p className="text-gray-600">Remaining</p>
                                                                <p className="font-medium text-red-600">৳{fee.remaining.toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                        {fee.payment_date && (
                                                            <span>Payment: {fee.payment_date}</span>
                                                        )}
                                                        <span>Method: {fee.payment_method}</span>
                                                        <span>Receipt: {fee.receipt_number}</span>
                                                    </div>

                                                    {fee.remarks && (
                                                        <p className="mt-2 text-xs text-gray-600 italic">{fee.remarks}</p>
                                                    )}
                                                </div>

                                                {fee.status === 'paid' && (
                                                    <div className="ml-4 flex flex-col space-y-2">
                                                        <Link href={`/student/fees/${fee.id}/receipt`}>
                                                            <Button size="sm" variant="outline">
                                                                <Receipt className="mr-2 h-4 w-4" />
                                                                View Receipt
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/student/fees/${fee.id}/download`}>
                                                            <Button size="sm">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No fee records found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
