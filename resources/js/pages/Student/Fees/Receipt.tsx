import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Receipt as ReceiptIcon,
    Download,
    Printer,
    ArrowLeft,
    Calendar,
    DollarSign,
    User,
    Phone,
    CreditCard,
    CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

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
    payment_date: string;
    payment_method: string;
    transaction_id: string | null;
    remarks: string | null;
    collected_by: string;
    status: string;
}

interface Student {
    full_name: string;
    admission_number: string;
    roll_number: string;
    class_name: string;
    section_name: string;
    father_name: string;
    phone: string | null;
}

interface Props {
    fee: Fee;
    student: Student;
}

export default function Receipt({ fee, student }: Props) {
    const handleDownload = () => {
        // Trigger print dialog which allows saving as PDF
        window.print();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/student/fees">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Fee Receipt
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button size="sm" onClick={handleDownload} title="Save as PDF using Print dialog">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Receipt - ${fee.receipt_number}`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Receipt Card */}
                    <Card className="print:shadow-none">
                        {/* Header */}
                        <CardHeader className="text-center border-b print:border-black">
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">Fee Receipt</h1>
                                <p className="text-sm text-gray-600 mt-1">School Management System</p>
                            </div>

                            <div className="flex items-center justify-between px-6">
                                <div className="text-left">
                                    <p className="text-sm text-gray-600">Receipt No.</p>
                                    <p className="text-lg font-bold text-blue-600">{fee.receipt_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="text-lg font-semibold">{fee.payment_date}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            {/* Student Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                                    Student Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-2">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Student Name</p>
                                            <p className="font-semibold">{student.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Father's Name</p>
                                            <p className="font-semibold">{student.father_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <ReceiptIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Admission Number</p>
                                            <p className="font-semibold">{student.admission_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <ReceiptIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Class & Section</p>
                                            <p className="font-semibold">{student.class_name} - {student.section_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <ReceiptIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Roll Number</p>
                                            <p className="font-semibold">{student.roll_number}</p>
                                        </div>
                                    </div>
                                    {student.phone && (
                                        <div className="flex items-start space-x-2">
                                            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Contact</p>
                                                <p className="font-semibold">{student.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fee Details */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                                    Fee Details
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-700">Fee Type:</span>
                                        <span className="font-semibold">{fee.fee_type}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-700">Period:</span>
                                        <span className="font-semibold">{fee.month} {fee.year}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">Status:</span>
                                        <Badge
                                            variant={fee.status === 'paid' ? 'success' : fee.status === 'partial' ? 'warning' : 'danger'}
                                            className="uppercase"
                                        >
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            {fee.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Amount Breakdown */}
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Description</th>
                                                <th className="text-right p-3 text-sm font-semibold text-gray-700">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-t">
                                                <td className="p-3">Base Fee Amount</td>
                                                <td className="p-3 text-right font-medium">৳{fee.amount.toLocaleString()}</td>
                                            </tr>
                                            {fee.late_fee > 0 && (
                                                <tr className="border-t bg-red-50">
                                                    <td className="p-3">Late Fee</td>
                                                    <td className="p-3 text-right font-medium text-red-600">৳{fee.late_fee.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {fee.discount > 0 && (
                                                <tr className="border-t bg-green-50">
                                                    <td className="p-3">Discount</td>
                                                    <td className="p-3 text-right font-medium text-green-600">- ৳{fee.discount.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            <tr className="border-t bg-gray-100 font-bold">
                                                <td className="p-3">Total Amount</td>
                                                <td className="p-3 text-right text-lg">৳{fee.total_amount.toLocaleString()}</td>
                                            </tr>
                                            <tr className="border-t bg-green-100 font-bold">
                                                <td className="p-3 flex items-center">
                                                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                                                    Amount Paid
                                                </td>
                                                <td className="p-3 text-right text-lg text-green-600">৳{fee.paid_amount.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                                    Payment Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-2">
                                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Payment Date</p>
                                            <p className="font-semibold">{fee.payment_date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Payment Method</p>
                                            <p className="font-semibold capitalize">{fee.payment_method}</p>
                                        </div>
                                    </div>
                                    {fee.transaction_id && (
                                        <div className="flex items-start space-x-2">
                                            <ReceiptIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Transaction ID</p>
                                                <p className="font-semibold">{fee.transaction_id}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-2">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Collected By</p>
                                            <p className="font-semibold">{fee.collected_by}</p>
                                        </div>
                                    </div>
                                </div>

                                {fee.remarks && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Remarks:</p>
                                        <p className="text-sm text-blue-800">{fee.remarks}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-12 pt-6 border-t print:flex print:justify-between">
                                <div className="text-sm text-gray-600">
                                    <p>This is a computer-generated receipt.</p>
                                    <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="mt-8 print:mt-0 text-right">
                                    <div className="inline-block">
                                        <div className="mb-16"></div>
                                        <div className="border-t border-gray-400 pt-2">
                                            <p className="text-sm text-gray-600">Authorized Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Note */}
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg print:hidden">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Please keep this receipt for your records. This receipt is valid proof of payment.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
