import React from 'react';
import { formatAmount } from '@/lib/formatCurrency';

interface Teacher {
    id: number;
    user: { name: string };
    employee_id: string;
    total_employee_pf: number;
    total_employer_pf: number;
    total_pf: number;
    total_withdrawn: number;
    last_contribution_date: string | null;
    contribution_count: number;
}

interface Summary {
    total_employee_contribution: number;
    total_employer_contribution: number;
    total_contributions: number;
    total_withdrawn: number;
    total_pf_balance: number;
    total_teachers: number;
    total_transactions: number;
}

interface PrintProvidentFundIndexProps {
    teachers: Teacher[];
    summary: Summary;
}

const PrintProvidentFundIndex = React.forwardRef<HTMLDivElement, PrintProvidentFundIndexProps>(
    ({ teachers, summary }, ref) => {
        const formatDate = (date: string | null) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-GB');
        };

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
                    <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>Provident Fund Ledger Report</h1>
                    <p style={{ fontSize: '9pt', margin: '0' }}>
                        Generated: {new Date().toLocaleDateString('en-GB')}
                    </p>
                </div>

                {/* Summary */}
                <div style={{ marginBottom: '15px', fontSize: '9pt' }}>
                    <table style={{ width: '100%', marginBottom: '10px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '14%' }}><strong>Teachers:</strong> {summary.total_teachers}</td>
                                <td style={{ width: '14%' }}><strong>Transactions:</strong> {summary.total_transactions}</td>
                                <td style={{ width: '24%' }}><strong>Employee PF:</strong> ৳{formatAmount(summary.total_employee_contribution)}</td>
                                <td style={{ width: '24%' }}><strong>Employer PF:</strong> ৳{formatAmount(summary.total_employer_contribution)}</td>
                                <td style={{ width: '24%' }}><strong>Current Balance:</strong> ৳{formatAmount(summary.total_pf_balance)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Table */}
                <table className="print-table">
                    <thead>
                        <tr>
                            <th style={{ width: '4%' }} className="text-center">SL</th>
                            <th style={{ width: '22%' }}>Teacher</th>
                            <th style={{ width: '14%' }} className="text-right">Employee PF</th>
                            <th style={{ width: '14%' }} className="text-right">Employer PF</th>
                            <th style={{ width: '14%' }} className="text-right">Withdrawn</th>
                            <th style={{ width: '14%' }} className="text-right">Balance</th>
                            <th style={{ width: '8%' }} className="text-center">Count</th>
                            <th style={{ width: '10%' }} className="text-center">Last Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher, index) => (
                            <tr key={teacher.id}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                    <div style={{ fontWeight: '500' }}>{teacher.user.name}</div>
                                    <div style={{ fontSize: '8pt', color: '#666' }}>{teacher.employee_id}</div>
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(teacher.total_employee_pf.toString()))}
                                </td>
                                <td className="text-right">
                                    ৳{formatAmount(parseFloat(teacher.total_employer_pf.toString()))}
                                </td>
                                <td className="text-right">
                                    ৳{parseFloat((teacher.total_withdrawn || formatAmount(0).toString()))}
                                </td>
                                <td className="text-right" style={{ fontWeight: 'bold' }}>
                                    ৳{formatAmount(parseFloat(teacher.total_pf.toString()))}
                                </td>
                                <td className="text-center">{teacher.contribution_count || 0}</td>
                                <td className="text-center" style={{ fontSize: '8pt' }}>
                                    {formatDate(teacher.last_contribution_date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                            <td colSpan={2} className="text-right">TOTAL:</td>
                            <td className="text-right">
                                ৳{formatAmount(summary.total_employee_contribution)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(summary.total_employer_contribution)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(summary.total_withdrawn)}
                            </td>
                            <td className="text-right">
                                ৳{formatAmount(summary.total_pf_balance)}
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

PrintProvidentFundIndex.displayName = 'PrintProvidentFundIndex';

export default PrintProvidentFundIndex;
