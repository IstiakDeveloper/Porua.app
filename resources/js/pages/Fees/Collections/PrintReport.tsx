import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { useInstitute } from '@/hooks/useInstitute';

interface Collection {
    id: number;
    receipt_number: string;
    student: { user: { name: string }; admission_number: string };
    fee_type: { name: string };
    amount: number;
    paid_amount: number;
    payment_date: string;
    status: string;
    month: number;
    year: number;
}

interface PrintReportProps {
    collections: Collection[];
    onClose: () => void;
}

function getMonthName(month: number) {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PrintReport({ collections, onClose }: PrintReportProps) {
    const institute = useInstitute();
    const printRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const totalAmount = collections.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
    const totalPaid = collections.reduce((sum, c) => sum + parseFloat(c.paid_amount.toString()), 0);

    return (
        <>
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }

                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-close-btn {
                        display: none !important;
                    }

                    .print-overlay {
                        position: static !important;
                        padding: 0 !important;
                        background: transparent !important;
                        margin: 0 !important;
                    }

                    .print-container {
                        box-shadow: none !important;
                        padding: 0 !important;
                        max-width: 100% !important;
                    }

                    .report-header {
                        margin-bottom: 8pt !important;
                        padding-bottom: 5pt !important;
                        border-bottom: 2pt solid #000 !important;
                    }

                    .report-header h1 {
                        font-size: 16pt !important;
                        margin: 0 0 3pt 0 !important;
                    }

                    .report-header h2 {
                        font-size: 12pt !important;
                        margin: 0 0 2pt 0 !important;
                    }

                    .report-header p {
                        font-size: 8pt !important;
                        margin: 0 !important;
                    }

                    .report-table {
                        margin-top: 8pt !important;
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }

                    .report-table th {
                        font-size: 8pt !important;
                        padding: 4pt !important;
                        background-color: #e0e0e0 !important;
                        border: 1pt solid #000 !important;
                    }

                    .report-table td {
                        font-size: 7pt !important;
                        padding: 3pt !important;
                        border: 1pt solid #000 !important;
                    }

                    .report-table tfoot td {
                        font-size: 8pt !important;
                        font-weight: bold !important;
                        background-color: #e0e0e0 !important;
                        padding: 4pt !important;
                    }
                }

                @media screen {
                    .print-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 9999;
                        overflow: auto;
                        padding: 40px;
                    }

                    .print-container {
                        max-width: 900px;
                        margin: 0 auto;
                        background: white;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    }
                }
            `}</style>

            <div className="print-report-wrapper">
                <div className="print-overlay">
                    <button
                        onClick={onClose}
                        className="print-close-btn fixed top-6 right-6 px-6 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-lg z-50"
                    >
                        ✕ Close
                    </button>

                    <div className="print-container p-8">
                        {/* Header */}
                        <div className="report-header text-center mb-6 pb-4 border-b-2 border-gray-800">
                            {institute.logo_url && (
                                <img src={institute.logo_url} alt={institute.name} className="h-14 max-w-[150px] mx-auto mb-2 object-contain" />
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{institute.name}</h1>
                            {institute.address && <p className="text-xs text-gray-600 mb-2">{institute.address}</p>}
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Fee Collection Report</h2>
                            <p className="text-sm text-gray-600">
                                Generated on: {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                    {/* Table */}
                    <table className="report-table w-full border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-black px-3 py-2 text-left text-xs font-bold">Receipt</th>
                                <th className="border border-black px-3 py-2 text-left text-xs font-bold">Student</th>
                                <th className="border border-black px-3 py-2 text-left text-xs font-bold">Fee Type</th>
                                <th className="border border-black px-3 py-2 text-left text-xs font-bold">Month/Year</th>
                                <th className="border border-black px-3 py-2 text-right text-xs font-bold">Amount</th>
                                <th className="border border-black px-3 py-2 text-right text-xs font-bold">Paid</th>
                                <th className="border border-black px-3 py-2 text-left text-xs font-bold">Date</th>
                                <th className="border border-black px-3 py-2 text-center text-xs font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((collection) => (
                                <tr key={collection.id}>
                                    <td className="border border-black px-3 py-2 text-xs">
                                        {collection.receipt_number}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs">
                                        <div className="font-medium">{collection.student.user.name}</div>
                                        <div className="text-gray-600 text-[10px]">{collection.student.admission_number}</div>
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs">
                                        {collection.fee_type.name}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs">
                                        {getMonthName(collection.month)} {collection.year}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs text-right">
                                        ৳{formatAmount(parseFloat(collection.amount.toString()))}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs text-right font-semibold">
                                        ৳{formatAmount(parseFloat(collection.paid_amount.toString()))}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs">
                                        {formatDate(collection.payment_date)}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-xs text-center uppercase font-semibold">
                                        {collection.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100">
                                <td colSpan={4} className="border border-black px-3 py-3 text-xs font-bold text-right">
                                    Total:
                                </td>
                                <td className="border border-black px-3 py-3 text-xs font-bold text-right">
                                    ৳{formatAmount(totalAmount)}
                                </td>
                                <td className="border border-black px-3 py-3 text-xs font-bold text-right">
                                    ৳{formatAmount(totalPaid)}
                                </td>
                                <td colSpan={2} className="border border-black"></td>
                            </tr>
                        </tfoot>
                    </table>
                    </div>
                </div>
            </div>
        </>
    );
}
