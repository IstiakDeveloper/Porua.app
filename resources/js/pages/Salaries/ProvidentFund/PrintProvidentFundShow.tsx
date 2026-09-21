import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';

interface Teacher {
    id: number;
    user: { name: string };
    employee_id: string;
    designation: string;
    salary: number;
}

interface Transaction {
    id: number;
    type: 'contribution' | 'opening' | 'withdrawal';
    employee_contribution: number;
    employer_contribution: number;
    total_contribution: number;
    transaction_date: string;
    salaryPayment?: {
        month: number;
        year: number;
        payment_method: string;
    };
}

interface Withdrawal {
    id: number;
    employee_contribution: number;
    employer_contribution: number;
    total_amount: number;
    withdrawal_date: string;
    reason: string;
    remarks: string | null;
    approved_by: string | null;
}

interface Summary {
    total_employee_contribution: number;
    total_employer_contribution: number;
    current_balance: number;
    total_withdrawn: number;
    total_transactions: number;
}

interface PrintProvidentFundShowProps {
    teacher: Teacher;
    transactions: Transaction[];
    withdrawals: Withdrawal[];
    summary: Summary;
}

const PrintProvidentFundShow = React.forwardRef<HTMLDivElement, PrintProvidentFundShowProps>(
    ({ teacher, transactions, withdrawals, summary }, ref) => {
        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-GB');
        };

        const getMonthName = (month: number) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[month - 1];
        };

        const getTransactionTypeLabel = (type: string) => {
            switch (type) {
                case 'contribution': return 'Salary';
                case 'opening': return 'Opening';
                case 'withdrawal': return 'Withdrawal';
                default: return type;
            }
        };

        return (
            <div ref={ref} style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', color: '#000' }}>
                <style>{`
                    @media print {
                        @page {
                            size: A4;
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
                    <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>Provident Fund Statement</h1>
                    <p style={{ fontSize: '10pt', margin: '5px 0 0 0', fontWeight: '600' }}>
                        {teacher.user.name} ({teacher.employee_id})
                    </p>
                    <p style={{ fontSize: '9pt', margin: '2px 0 0 0' }}>
                        {teacher.designation} | Generated: {new Date().toLocaleDateString('en-GB')}
                    </p>
                </div>

                {/* Summary */}
                <div style={{ marginBottom: '15px', fontSize: '9pt', border: '1px solid #000', padding: '10px' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '25%' }}><strong>Employee Contribution:</strong></td>
                                <td style={{ width: '25%' }}>৳{formatAmount(summary.total_employee_contribution)}</td>
                                <td style={{ width: '25%' }}><strong>Employer Contribution:</strong></td>
                                <td style={{ width: '25%' }}>৳{formatAmount(summary.total_employer_contribution)}</td>
                            </tr>
                            <tr>
                                <td><strong>Total Withdrawn:</strong></td>
                                <td>৳{formatAmount(summary.total_withdrawn)}</td>
                                <td><strong>Current Balance:</strong></td>
                                <td style={{ fontWeight: 'bold' }}>৳{formatAmount(summary.current_balance)}</td>
                            </tr>
                            <tr>
                                <td><strong>Total Transactions:</strong></td>
                                <td>{summary.total_transactions}</td>
                                <td><strong>Current Salary:</strong></td>
                                <td>৳{teacher.salary ? formatAmount(teacher.salary) : '0'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Transaction History */}
                <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '15px 0 10px 0' }}>Transaction History</h2>
                <table className="print-table">
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }} className="text-center">SL</th>
                            <th style={{ width: '12%' }} className="text-center">Type</th>
                            <th style={{ width: '15%' }} className="text-center">Period</th>
                            <th style={{ width: '12%' }} className="text-center">Date</th>
                            <th style={{ width: '14%' }} className="text-right">Employee</th>
                            <th style={{ width: '14%' }} className="text-right">Employer</th>
                            <th style={{ width: '14%' }} className="text-right">Total</th>
                            <th style={{ width: '14%' }} className="text-center">Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={transaction.id}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center">
                                    {getTransactionTypeLabel(transaction.type)}
                                </td>
                                <td className="text-center">
                                    {transaction.salaryPayment
                                        ? `${getMonthName(transaction.salaryPayment.month)} ${transaction.salaryPayment.year}`
                                        : '-'
                                    }
                                </td>
                                <td className="text-center" style={{ fontSize: '8pt' }}>
                                    {formatDate(transaction.transaction_date)}
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(transaction.employee_contribution.toString()))}
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(transaction.employer_contribution.toString()))}
                                </td>
                                <td className="text-right" style={{ fontWeight: 'bold' }}>
                                    ৳{formatAmount(parseFloat(transaction.total_contribution.toString()))}
                                </td>
                                <td className="text-center" style={{ fontSize: '8pt' }}>
                                    {transaction.salaryPayment?.payment_method === 'bank_transfer' ? 'Bank' :
                                     transaction.salaryPayment?.payment_method === 'cash' ? 'Cash' :
                                     transaction.salaryPayment?.payment_method === 'cheque' ? 'Cheque' : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                            <td colSpan={4} className="text-right">TOTAL:</td>
                            <td className="text-right">
                                ৳{formatAmount(summary.total_employee_contribution)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(summary.total_employer_contribution)}
                            </td>
                            <td className="text-right">
                                ৳{(summary.total_employee_contribution + formatAmount(summary.total_employer_contribution))}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Withdrawal History */}
                {withdrawals && withdrawals.length > 0 && (
                    <>
                        <div style={{ marginTop: '30px', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, borderBottom: '2px solid #000', paddingBottom: '5px' }}>
                                WITHDRAWAL HISTORY
                            </h3>
                        </div>

                        <table className="print-table">
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                                    <th className="text-center" style={{ width: '8%' }}>SL</th>
                                    <th className="text-left" style={{ width: '15%' }}>Date</th>
                                    <th className="text-left" style={{ width: '20%' }}>Reason</th>
                                    <th className="text-right" style={{ width: '15%' }}>Employee</th>
                                    <th className="text-right" style={{ width: '15%' }}>Employer</th>
                                    <th className="text-right" style={{ width: '15%' }}>Total</th>
                                    <th className="text-left" style={{ width: '12%' }}>Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map((withdrawal, index) => (
                                    <tr key={withdrawal.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>{formatDate(withdrawal.withdrawal_date)}</td>
                                        <td style={{ fontSize: '8pt' }}>{withdrawal.reason}</td>
                                        <td className="text-right">
                                            ৳{formatAmount(parseFloat(withdrawal.employee_contribution.toString()))}
                                        </td>
                                        <td className="text-right">
                                            ৳{formatAmount(parseFloat(withdrawal.employer_contribution.toString()))}
                                        </td>
                                        <td className="text-right" style={{ fontWeight: 'bold' }}>
                                            ৳{formatAmount(parseFloat(withdrawal.total_amount.toString()))}
                                        </td>
                                        <td style={{ fontSize: '8pt' }}>{withdrawal.approved_by || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                    <td colSpan={3} className="text-right">TOTAL WITHDRAWN:</td>
                                    <td className="text-right">
                                        ৳{withdrawals.reduce((sum, w) => sum + parseFloat(w.employee_contribution.toString()), formatAmount(0))}
                                    </td>
                                    <td className="text-right">
                                        ৳{withdrawals.reduce((sum, w) => sum + parseFloat(w.employer_contribution.toString()), formatAmount(0))}
                                    </td>
                                    <td className="text-right">
                                        ৳{formatAmount(summary.total_withdrawn)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                )}

                {/* Footer Note */}
                <div style={{ marginTop: '20px', fontSize: '8pt', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <p style={{ margin: 0 }}>This is a computer-generated statement and does not require a signature.</p>
                    <p style={{ margin: '5px 0 0 0' }}>For any queries, please contact the HR department.</p>
                </div>

                {/* Signature Section */}
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginTop: '40px' }}>
                            Employee Signature
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginTop: '40px' }}>
                            HR Manager
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginTop: '40px' }}>
                            Authorized By
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

PrintProvidentFundShow.displayName = 'PrintProvidentFundShow';

export default PrintProvidentFundShow;
