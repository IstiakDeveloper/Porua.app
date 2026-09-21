import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';

interface Payment {
    id: number;
    staff: {
        user: { name: string };
        employee_id: string;
    };
    month: number;
    year: number;
    base_salary: number;
    provident_fund_deduction: number;
    employer_pf_contribution: number;
    net_salary: number;
    total_amount: number;
    payment_date: string;
    payment_method: string;
}

interface PrintSalaryPaymentsProps {
    payments: Payment[];
    filters?: {
        search?: string;
        month?: number;
        year?: number;
    };
}

const PrintSalaryPayments = React.forwardRef<HTMLDivElement, PrintSalaryPaymentsProps>(
    ({ payments, filters }, ref) => {
        const getMonthName = (month: number) => {
            return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
        };

        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const totalBaseSalary = payments.reduce((sum, p) => sum + parseFloat(p.base_salary.toString()), 0);
        const totalPF = payments.reduce((sum, p) => sum + parseFloat(p.provident_fund_deduction.toString()), 0);
        const totalEmployerPF = payments.reduce((sum, p) => sum + parseFloat(p.employer_pf_contribution.toString()), 0);
        const totalNetSalary = payments.reduce((sum, p) => sum + parseFloat(p.net_salary.toString()), 0);
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.total_amount.toString()), 0);

        return (
            <div ref={ref} style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', color: '#000' }}>
                <style>{`
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 15mm;
                        }
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }

                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 9pt;
                    }

                    .print-table th,
                    .print-table td {
                        border: 1px solid #000;
                        padding: 4px 6px;
                    }

                    .print-table th {
                        background-color: #f0f0f0;
                        font-weight: 600;
                        text-align: left;
                    }

                    .print-table .text-right {
                        text-align: right;
                    }

                    .print-table .text-center {
                        text-align: center;
                    }
                `}</style>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                    <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>Salary Payment Report</h1>
                    <p style={{ fontSize: '9pt', margin: '0' }}>
                        Generated: {new Date().toLocaleDateString('en-GB')}
                        {filters?.month && ` | Month: ${getMonthName(filters.month)}`}
                        {filters?.year && ` | Year: ${filters.year}`}
                    </p>
                </div>

                {/* Summary */}
                <div style={{ marginBottom: '15px', fontSize: '9pt' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '25%' }}><strong>Total Records:</strong> {payments.length}</td>
                                <td style={{ width: '25%' }}><strong>Base Salary:</strong> ৳{formatAmount(totalBaseSalary)}</td>
                                <td style={{ width: '25%' }}><strong>PF Deduction:</strong> ৳{formatAmount(totalPF)}</td>
                                <td style={{ width: '25%' }}><strong>Total Paid:</strong> ৳{formatAmount(totalPaid)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Table */}
                <table className="print-table">
                    <thead>
                        <tr>
                            <th style={{ width: '3%' }} className="text-center">SL</th>
                            <th style={{ width: '16%' }}>Employee</th>
                            <th style={{ width: '8%' }} className="text-center">Period</th>
                            <th style={{ width: '10%' }} className="text-right">Base Salary</th>
                            <th style={{ width: '10%' }} className="text-right">Employee PF</th>
                            <th style={{ width: '10%' }} className="text-right">Net Salary</th>
                            <th style={{ width: '10%' }} className="text-right">Employer PF</th>
                            <th style={{ width: '11%' }} className="text-right">Total Paid</th>
                            <th style={{ width: '8%' }} className="text-center">Date</th>
                            <th style={{ width: '8%' }} className="text-center">Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, index) => (
                            <tr key={payment.id}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                    {payment.staff.user.name} <span style={{ fontSize: '8pt', color: '#666' }}>({payment.staff.employee_id})</span>
                                </td>
                                <td className="text-center">
                                    {getMonthName(payment.month).substring(0, 3)} {payment.year}
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(payment.base_salary.toString()))}
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(payment.provident_fund_deduction.toString()))}
                                </td>
                                <td className="text-right" style={{ fontWeight: '500' }}>
                                    ৳{formatAmount(parseFloat(payment.net_salary.toString()))}
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(payment.employer_pf_contribution.toString()))}
                                </td>
                                <td className="text-right" style={{ fontWeight: 'bold' }}>
                                    ৳{formatAmount(parseFloat(payment.total_amount.toString()))}
                                </td>
                                <td className="text-center" style={{ fontSize: '8pt' }}>
                                    {new Date(payment.payment_date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="text-center" style={{ fontSize: '8pt' }}>
                                    {payment.payment_method === 'bank_transfer' ? 'Bank' :
                                     payment.payment_method === 'cash' ? 'Cash' : 'Cheque'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                            <td colSpan={3} className="text-right">TOTAL:</td>
                            <td className="text-right">
                                ৳{formatAmount(totalBaseSalary)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(totalPF)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(totalNetSalary)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(totalEmployerPF)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(totalPaid)}
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signature Section */}
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginTop: '40px' }}>
                            Prepared By
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginTop: '40px' }}>
                            Verified By
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginTop: '40px' }}>
                            Approved By
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

PrintSalaryPayments.displayName = 'PrintSalaryPayments';

export default PrintSalaryPayments;
