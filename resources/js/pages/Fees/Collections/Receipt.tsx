import React, { useEffect } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { formatReceiptNumber } from '@/lib/formatReceipt';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Printer, ArrowLeft, Pencil, Plus } from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMonthName(month: number | null): string {
    if (!month) return '';
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

interface FeeType {
    name: string;
}

interface Collection {
    id: number;
    receipt_number: string;
    student: {
        id: number;
        user: { name: string; email?: string; phone?: string };
        admission_number: string;
        roll_number?: string;
        school_class?: { name: string };
        section?: { name: string };
    };
    batch?: {
        id: number;
        name: string;
        course?: { name: string };
    };
    installment_title?: string;
    fee_type: FeeType;
    amount: number;
    late_fee: number;
    discount: number;
    paid_amount: number;
    total_amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    month: number | null;
    year: number | null;
    remarks?: string;
    collector?: { name: string };
    created_at: string;
}

interface RelatedCollection {
    id: number;
    fee_type: FeeType;
    batch?: {
        id: number;
        name: string;
        course?: { name: string };
    };
    installment_title?: string;
    amount: number;
    late_fee: number;
    discount: number;
    paid_amount?: number;
    total_amount: number;
    month: number | null;
    year: number | null;
}

interface Props {
    collection: Collection;
    relatedCollections: RelatedCollection[];
    totalAmount: number;
}

export default function Receipt({ collection, relatedCollections, totalAmount }: Props) {
    const institute = useInstitute();
    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autoprint') === '1' || params.get('auto_print') === '1' || params.get('print') === '1') {
            const timer = setTimeout(() => {
                window.print();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            cash: 'Cash',
            bank_transfer: 'Bank Transfer',
            cheque: 'Cheque',
            mobile_banking: 'Mobile Banking',
            online: 'Online Payment',
        };
        return labels[method] || method?.replace('_', ' ') || 'Cash';
    };

    const actualTotal = totalAmount > 0
        ? totalAmount
        : relatedCollections.reduce((sum, item) => sum + (Number(item.paid_amount) || Number(item.total_amount)), 0);

    const ReceiptContent = ({ copyType }: { copyType: string }) => (
        <div className="receipt-box">
            {/* Header */}
            <div className="receipt-header">
                {institute.logo_url && (
                    <img 
                        src={institute.logo_url} 
                        alt={institute.name} 
                        className="h-12 max-w-[120px] mx-auto mb-1 object-contain" 
                    />
                )}
                <h1 className="school-name">{institute.name}</h1>
                {institute.address && <p className="school-address">{institute.address}</p>}
                {(institute.phone || institute.email) && (
                    <p className="school-contact">
                        {institute.phone ? `Phone: ${institute.phone}` : ''}
                        {institute.phone && institute.email ? ' | ' : ''}
                        {institute.email ? `Email: ${institute.email}` : ''}
                    </p>
                )}
                <div className="title-bar">
                    <span className="title">FEE PAYMENT RECEIPT</span>
                    <span className="copy-badge">{copyType}</span>
                </div>
            </div>

            {/* Receipt Number & Date */}
            <div className="info-bar">
                <div>
                    <span className="info-label">Receipt No: </span>
                    <span className="info-value font-mono font-bold">#{formatReceiptNumber(collection.receipt_number)}</span>
                </div>
                <div>
                    <span className="info-label">Date: </span>
                    <span className="info-value">{formatDate(collection.payment_date)}</span>
                </div>
            </div>

            {/* Student Information */}
            <div className="info-grid">
                <div className="info-item">
                    <span className="info-label">Student Name:</span>
                    <span className="info-value">{collection.student?.user?.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">{collection.batch ? 'Batch / Course:' : 'Class:'}</span>
                    <span className="info-value">
                        {collection.batch 
                            ? `${collection.batch.name}${collection.batch.course ? ` (${collection.batch.course.name})` : ''}`
                            : `${collection.student?.school_class?.name || 'N/A'}${collection.student?.section?.name ? ` (${collection.student.section.name})` : ''}`
                        }
                    </span>
                </div>
                <div className="info-item">
                    <span className="info-label">Roll & ID:</span>
                    <span className="info-value">
                        {collection.student?.roll_number ? `Roll: ${collection.student.roll_number} | ` : ''}
                        ID: {collection.student?.admission_number}
                    </span>
                </div>
                <div className="info-item">
                    <span className="info-label">Payment Method:</span>
                    <span className="info-value">{getPaymentMethodLabel(collection.payment_method)}</span>
                </div>
            </div>

            {/* Fee Table */}
            <table className="fee-table">
                <thead>
                    <tr>
                        <th style={{ width: '28px', textAlign: 'center' }}>#</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'center' }}>Period</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Late Fee</th>
                        <th className="text-right">Discount</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {relatedCollections.map((item, index) => {
                        const periodStr = (item.month && item.year)
                            ? `${getMonthName(item.month)} ${item.year}`
                            : (item.installment_title || 'One-time');
                        const lineAmount = item.paid_amount !== undefined ? item.paid_amount : item.total_amount;

                        return (
                            <tr key={`${copyType}-${index}`}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>
                                    <div>{item.fee_type?.name}</div>
                                    {item.batch && <div style={{ fontSize: '11px', color: '#4b5563' }}>Batch: {item.batch.name}</div>}
                                    {item.installment_title && <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600 }}>{item.installment_title}</div>}
                                </td>
                                <td className="text-center">{periodStr}</td>
                                <td className="text-right">৳{formatAmount(item.amount)}</td>
                                <td className="text-right">{item.late_fee > 0 ? `৳${formatAmount(item.late_fee)}` : '-'}</td>
                                <td className="text-right">{item.discount > 0 ? `-৳${formatAmount(item.discount)}` : '-'}</td>
                                <td className="text-right strong">৳{formatAmount(lineAmount)}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={6} className="text-right strong">TOTAL AMOUNT PAID:</td>
                        <td className="text-right total-amount">৳{formatAmount(actualTotal)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Remarks */}
            {collection.remarks && (
                <div className="remarks">
                    <span className="info-label">Remarks: </span>
                    <span>{collection.remarks}</span>
                </div>
            )}

            {/* Footer with Seal & Signature space */}
            <div className="receipt-footer">
                <div className="footer-left">
                    <div>
                        <span className="info-label">Collected By: </span>
                        <span className="info-value">{collection.collector?.name || 'Cashier'}</span>
                    </div>
                    <p className="footer-note">{institute.invoice_footer_text || 'This is a computer-generated receipt.'}</p>
                </div>
                <div className="footer-center">
                    <div className="seal-area">
                        <span className="seal-text">{institute.type === 'coaching' ? 'Center Seal' : 'Institute Seal'}</span>
                    </div>
                </div>
                <div className="footer-right">
                    <div className="signature-area">
                        <div className="signature-line"></div>
                        <p className="signature-label">Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Receipt - ${collection.receipt_number}`} />

            <div className="receipt-container">
                {/* Modern, Clean Action Buttons */}
                <div className="action-buttons no-print">
                    <div className="action-left">
                        <button
                            type="button"
                            onClick={() => router.visit('/fee-collections')}
                            className="btn-action btn-back"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                            Back to Ledger
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/fee-collections/create')}
                            className="btn-action btn-pos"
                        >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            Collect Next Fee (POS)
                        </button>
                        {collection.status === 'paid' && (
                            <button
                                type="button"
                                onClick={() => router.visit(`/fee-collections/${collection.id}/edit`)}
                                className="btn-action btn-edit"
                            >
                                <Pencil className="w-3.5 h-3.5 shrink-0" />
                                Edit Receipt
                            </button>
                        )}
                    </div>
                    <div className="action-right">
                        <button onClick={handlePrint} className="btn-action btn-print">
                            <Printer className="w-3.5 h-3.5 shrink-0" />
                            Print Receipt (1 Page A4)
                        </button>
                    </div>
                </div>

                {/* Mobile Scroll Hint */}
                <p className="text-[11px] text-slate-500 font-medium text-center mb-2 md:hidden">
                    ← Swipe horizontally to preview full A4 dual receipt →
                </p>

                {/* Receipt Preview (Dual Copy: Student Copy + Office Copy) */}
                <div className="receipt-preview">
                    {/* Top: Student Copy */}
                    <ReceiptContent copyType="Student Copy" />

                    {/* Middle: Dotted Cut Line */}
                    <div className="cut-separator">
                        <span className="cut-text">
                            ✂ ------------------ Cut Here (Student Copy / Office Copy Separator) ------------------ ✂
                        </span>
                    </div>

                    {/* Bottom: Office Copy */}
                    <ReceiptContent copyType="Office Copy" />
                </div>
            </div>

            {/* Original Stylesheet Refined for 1 A4 Page Fit */}
            <style>{`
                @media (max-width: 767px) {
                    .receipt-container {
                        padding: 12px 10px 80px !important;
                    }
                    .action-buttons {
                        flex-direction: column-reverse !important;
                        width: 100% !important;
                        gap: 8px !important;
                    }
                    .action-left {
                        width: 100% !important;
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 8px !important;
                    }
                    .action-left .btn-action {
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .action-right {
                        width: 100% !important;
                    }
                    .btn-print {
                        width: 100% !important;
                        justify-content: center !important;
                        padding: 10px 14px !important;
                        font-size: 13px !important;
                    }
                    .receipt-preview {
                        padding: 8px !important;
                        overflow-x: auto !important;
                        -webkit-overflow-scrolling: touch !important;
                    }
                    .receipt-box {
                        min-width: 600px !important;
                    }
                }

                /* Screen Layout */
                .receipt-container {
                    padding: 16px 20px 40px;
                    background: #f1f5f9;
                    min-height: 100vh;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    max-width: 210mm;
                    margin-left: auto;
                    margin-right: auto;
                    gap: 12px;
                }

                .action-left, .action-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .btn-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: all 0.15s ease-in-out;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .btn-back {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                }
                .btn-back:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                .btn-pos {
                    background: #4f46e5;
                    border: 1px solid #4338ca;
                    color: #ffffff;
                }
                .btn-pos:hover {
                    background: #4338ca;
                }

                .btn-edit {
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    color: #92400e;
                }
                .btn-edit:hover {
                    background: #fef3c7;
                }

                .btn-print {
                    background: #059669;
                    border: 1px solid #047857;
                    color: #ffffff;
                }
                .btn-print:hover {
                    background: #047857;
                }

                /* Receipt Paper Box */
                .receipt-preview {
                    max-width: 210mm;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
                    padding: 4mm;
                    box-sizing: border-box;
                }

                .receipt-box {
                    padding: 10px 14px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #000;
                    border: 1.5px solid #000;
                    background: white;
                    box-sizing: border-box;
                }

                /* Header */
                .receipt-header {
                    text-align: center;
                    border-bottom: 1.5px solid #000;
                    padding-bottom: 5px;
                    margin-bottom: 6px;
                }

                .school-name {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0 0 2px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1.1;
                }

                .school-address {
                    font-size: 10.5px;
                    margin: 1px 0;
                    color: #111;
                }

                .school-contact {
                    font-size: 9.5px;
                    margin: 1px 0 0 0;
                    color: #333;
                }

                .title-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 4px;
                    padding: 2px 0;
                    border-top: 1px solid #000;
                    border-bottom: 1px solid #000;
                }

                .title {
                    font-size: 11px;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                }

                .copy-badge {
                    font-size: 9.5px;
                    font-weight: bold;
                    padding: 1px 6px;
                    border: 1px solid #000;
                    text-transform: uppercase;
                    background: #f8fafc;
                }

                /* Info Bar */
                .info-bar {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    margin-bottom: 5px;
                    border-bottom: 1px solid #000;
                    font-size: 10.5px;
                }

                /* Info Grid */
                .info-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 3px 12px;
                    margin-bottom: 6px;
                    padding: 3px 0 5px;
                    border-bottom: 1px solid #000;
                }

                .info-item {
                    font-size: 10px;
                    line-height: 1.2;
                }

                .info-label {
                    font-weight: normal;
                    color: #222;
                }

                .info-value {
                    font-weight: 600;
                    margin-left: 4px;
                    color: #000;
                }

                /* Fee Table */
                .fee-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5px 0 6px;
                    font-size: 9.5px;
                }

                .fee-table th {
                    background: #f1f5f9;
                    padding: 3px 5px;
                    border: 1px solid #000;
                    font-weight: bold;
                    text-align: left;
                }

                .fee-table td {
                    padding: 3px 5px;
                    border: 1px solid #000;
                    line-height: 1.2;
                }

                .fee-table tbody tr {
                    background: white;
                }

                .fee-table tfoot tr {
                    background: #f8fafc;
                }

                .fee-table tfoot td {
                    padding: 4px 5px;
                    border: 1.5px solid #000;
                    font-weight: bold;
                }

                .text-center {
                    text-align: center;
                }

                .text-right {
                    text-align: right;
                }

                .strong {
                    font-weight: bold;
                }

                .total-amount {
                    font-size: 11px !important;
                    font-weight: bold;
                }

                /* Remarks */
                .remarks {
                    margin: 3px 0 5px;
                    padding: 3px 6px;
                    border: 1px solid #000;
                    background: #f9f9f9;
                    font-size: 9px;
                }

                /* Footer */
                .receipt-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 8px;
                    padding-top: 6px;
                    border-top: 1px solid #000;
                    font-size: 9.5px;
                }

                .footer-left {
                    flex: 1;
                }

                .footer-note {
                    font-size: 8px;
                    color: #555;
                    font-style: italic;
                    margin-top: 3px;
                }

                .footer-center {
                    flex: 1;
                    text-align: center;
                }

                .seal-area {
                    width: 70px;
                    height: 36px;
                    border: 1px dashed #888;
                    border-radius: 4px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .seal-text {
                    font-size: 8px;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .footer-right {
                    flex: 1;
                    text-align: right;
                }

                .signature-area {
                    display: inline-block;
                    text-align: center;
                }

                .signature-line {
                    width: 120px;
                    border-top: 1px solid #000;
                    margin-bottom: 3px;
                }

                .signature-label {
                    font-size: 8.5px;
                    color: #000;
                    font-weight: 600;
                }

                .cut-separator {
                    margin: 6px 0;
                    text-align: center;
                }

                .cut-text {
                    font-size: 9px;
                    color: #64748b;
                    font-family: monospace;
                    display: block;
                    letter-spacing: 0.5px;
                }

                /* Print Styles Guaranteed to strictly fit on 1 A4 Page */
                @media print {
                    body * {
                        visibility: hidden;
                    }

                    .receipt-preview,
                    .receipt-preview * {
                        visibility: visible !important;
                    }

                    aside, nav, header, .sidebar, .no-print, [class*="sidebar"], [class*="Sidebar"] {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    @page {
                        size: A4 portrait;
                        margin: 4mm 6mm;
                    }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                        height: 287mm !important;
                        max-height: 287mm !important;
                        overflow: hidden !important;
                    }

                    body > div,
                    body > div > div,
                    body > div > div > div,
                    main {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        position: static !important;
                        left: 0 !important;
                        top: 0 !important;
                    }

                    .receipt-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        width: 100% !important;
                    }

                    .receipt-preview {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        box-shadow: none !important;
                        max-width: 100% !important;
                        width: 198mm !important;
                        height: 285mm !important;
                        max-height: 285mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .receipt-box {
                        padding: 2.5mm 4mm !important;
                        margin: 0 !important;
                        border: 1.5pt solid #000 !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                        box-sizing: border-box !important;
                        height: 136mm !important;
                        max-height: 136mm !important;
                        overflow: hidden !important;
                    }

                    .cut-separator {
                        margin: 1mm 0 !important;
                        height: 4mm !important;
                    }

                    .school-name {
                        font-size: 14pt !important;
                    }

                    .school-address {
                        font-size: 9pt !important;
                    }

                    .school-contact {
                        font-size: 8pt !important;
                    }

                    .title {
                        font-size: 9.5pt !important;
                    }

                    .copy-badge {
                        font-size: 8pt !important;
                    }

                    .info-bar {
                        font-size: 9pt !important;
                    }

                    .info-item {
                        font-size: 8.5pt !important;
                    }

                    .fee-table {
                        font-size: 8pt !important;
                    }

                    .fee-table th, .fee-table td {
                        padding: 1.2mm 1.5mm !important;
                    }

                    .total-amount {
                        font-size: 9.5pt !important;
                    }

                    .receipt-footer {
                        font-size: 8pt !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
