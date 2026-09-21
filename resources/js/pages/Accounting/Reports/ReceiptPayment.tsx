import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';
import { formatAmount } from '@/lib/formatCurrency';
import { useInstitute } from '@/hooks/useInstitute';

interface Account {
    id: number;
    account_name: string;
}

interface ReceiptPaymentItem {
    description: string;
    month_amount: number | null;
    cumulative_amount: number | null;
    type: string;
}

interface ReceiptPaymentProps {
    receipts: ReceiptPaymentItem[];
    payments: ReceiptPaymentItem[];
    openingBalance: number;
    openingBalanceCumulative?: number;
    totalMonthReceipts: number;
    totalMonthPayments: number;
    totalCumulativeReceipts: number;
    totalCumulativePayments: number;
    closingBalance: number;
    cumulativeClosingBalance: number;
    filters?: {
        start_date?: string;
        end_date?: string;
        account_id?: string;
    };
    accounts?: Account[];
    schoolName?: string;
    schoolAddress?: string;
}

export default function ReceiptPayment({
    receipts,
    payments,
    openingBalance,
    openingBalanceCumulative = 0,
    totalMonthReceipts,
    totalMonthPayments,
    totalCumulativeReceipts,
    totalCumulativePayments,
    closingBalance,
    cumulativeClosingBalance,
    filters,
    accounts = [],
    schoolName,
    schoolAddress,
}: ReceiptPaymentProps) {
    const institute = useInstitute();
    const effectiveSchoolName = schoolName || institute.name;
    const effectiveSchoolAddress = schoolAddress || institute.address;
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [accountId, setAccountId] = useState(filters?.account_id || '');

    const handleFilter = () => {
        router.get('/accounting/reports/receipt-payment',
            { start_date: startDate, end_date: endDate, account_id: accountId },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setAccountId('');
        router.get('/accounting/reports/receipt-payment');
    };

    const formatCurrency = (amount: number | null | undefined) =>
        amount === null || amount === undefined ? '' : formatAmount(amount);

    const handlePrint = () => {
        window.print();
    };

    const selectedAccount = accounts.find(a => a.id == accountId);
    const dateRange = `${new Date(filters.start_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })} to ${new Date(filters.end_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })}`;
    const printDateText =
        startDate && endDate
            ? `${new Date(startDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
              })} to ${new Date(endDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
              })}`
            : dateRange;

    const isMeaningfulItem = (item: ReceiptPaymentItem | undefined) => {
        if (!item) return false;
        const desc = (item.description ?? '').trim();
        const month = Number(item.month_amount ?? 0);
        const cumulative = Number(item.cumulative_amount ?? 0);
        return desc.length > 0 || month !== 0 || cumulative !== 0;
    };

    const meaningfulReceipts = receipts.filter(isMeaningfulItem);
    const meaningfulPayments = payments.filter(isMeaningfulItem);

    // Calculate max rows for balanced layout
    // Payments should start opposite of Opening Balance row (shift by 1)
    const firstPayment = meaningfulPayments[0];
    const hasFirstPayment = Boolean(firstPayment);
    const paymentsAfterOpening = meaningfulPayments.slice(1);
    const maxRows = Math.max(meaningfulReceipts.length, paymentsAfterOpening.length);
    const receiptClosingSl = meaningfulReceipts.length + 2;
    const paymentClosingSl = (hasFirstPayment ? meaningfulPayments.length + 1 : 1);

    return (
        <AuthenticatedLayout>
            <Head title="Receipt & Payment Report" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                               Statement of Receipt & Payments
                            </h1>
                            <p className="text-gray-600 mt-1">Detailed receipt and payment account</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrint}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Account
                            </label>
                            <select
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="">All Accounts</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter} className="bg-blue-600 text-white hover:bg-blue-700 flex-1">
                                Apply
                            </Button>
                            <Button onClick={handleReset} className="bg-gray-500 text-white hover:bg-gray-600 flex-1">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Screen Report Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Header Info */}
                    <div className="text-center mb-2 border-gray-300">
                        <h3 className="text-2xl font-bold text-gray-800">{schoolName}</h3>
                        {schoolAddress && <p className="text-sm text-gray-600">{schoolAddress}</p>}
                        <h2 className="text-lg font-bold mb-2 text-gray-800">Statement of Receipt & Payments</h2>
                        <p className="text-sm text-right text-gray-600">
                            Date: {startDate && endDate
                                ? `${new Date(startDate).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                  })} to ${new Date(endDate).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                  })}`
                                : ''
                            }
                        </p>

                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                {/* Main Head */}
                                <tr>
                                    <th
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-sm"
                                        colSpan={4}
                                    >
                                        Receipt
                                    </th>
                                    <th
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-sm"
                                        colSpan={4}
                                    >
                                        Payment
                                    </th>
                                </tr>
                                {/* Sub-Head (particulars, month, cumulative each side) */}
                                <tr>
                                    {/* Receipts Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '5%'}}>
                                        SL
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '25%'}}>
                                        Particulars
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Current Month
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Cumulative
                                    </th>
                                    {/* Payments Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '5%'}}>
                                        SL
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '25%'}}>
                                        Particulars
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Current Month
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Cumulative
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Opening Balance Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center text-xs">1</td>
                                    <td className="border border-gray-400 px-2 py-1.5 font-semibold text-xs">
                                        Opening Balance
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(openingBalance)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(openingBalanceCumulative)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1 text-center text-xs">
                                        {hasFirstPayment ? 1 : ''}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        {hasFirstPayment ? firstPayment.description : ''}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                        {hasFirstPayment ? formatCurrency(firstPayment.month_amount) : ''}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                        {hasFirstPayment ? formatCurrency(firstPayment.cumulative_amount) : ''}
                                    </td>
                                </tr>

                                {/* Data Rows */}
                                {Array.from({ length: maxRows }).map((_, index) => {
                                    const receipt = meaningfulReceipts[index];
                                    const payment = paymentsAfterOpening[index];
                                    const hasReceipt = isMeaningfulItem(receipt);
                                    const hasPayment = isMeaningfulItem(payment);

                                    // Avoid rendering completely empty rows (prevents visual "gaps")
                                    if (!hasReceipt && !hasPayment) return null;

                                    return (
                                        <tr key={index}>
                                            {/* Receipt Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-center text-xs">
                                                {hasReceipt ? index + 2 : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {hasReceipt ? receipt.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {hasReceipt ? formatCurrency(receipt.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {hasReceipt ? formatCurrency(receipt.cumulative_amount) : ''}
                                            </td>

                                            {/* Payment Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-center text-xs">
                                                {hasPayment ? index + (hasFirstPayment ? 2 : 1) : ''}
                                            </td>
                                            <td
                                                className="border border-gray-400 px-2 py-1 text-xs"
                                            >
                                                {hasPayment ? payment.description : ''}
                                            </td>
                                            <td
                                                className="border border-gray-400 px-2 py-1 text-right text-xs"
                                            >
                                                {hasPayment ? formatCurrency(payment.month_amount) : ''}
                                            </td>
                                            <td
                                                className="border border-gray-400 px-2 py-1 text-right text-xs"
                                            >
                                                {hasPayment ? formatCurrency(payment.cumulative_amount) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Closing Balance Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center text-xs"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center text-xs">
                                        {paymentClosingSl}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 font-semibold text-xs">
                                        Closing Balance
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(closingBalance)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(cumulativeClosingBalance)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                {/* Total Row */}
                                <tr className="bg-gray-50">
                                    <td
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-xs capitalize"
                                        colSpan={2}
                                    >
                                        Total
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(openingBalance + totalMonthReceipts)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(openingBalanceCumulative + totalCumulativeReceipts)}
                                    </td>
                                    <td
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-xs capitalize"
                                        colSpan={2}
                                    >
                                        Total
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalMonthPayments + closingBalance)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalCumulativePayments + cumulativeClosingBalance)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>


                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Month Receipts</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(totalMonthReceipts)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-gray-600 mb-1">Total Month Payments</p>
                            <p className="text-2xl font-bold text-red-600">৳ {formatCurrency(totalMonthPayments)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="mb-1 pb-0">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-1">{effectiveSchoolName}</h1>
                        {effectiveSchoolAddress && <p className="text-xs mb-0.5">{effectiveSchoolAddress}</p>}
                        <h2 className="text-base font-bold mb-0">Statement of Receipt & Payments</h2>
                    </div>
                    <div className="flex items-start justify-between">
                        <div className="text-xs">
                            {selectedAccount && (
                                <p>Account: {selectedAccount.account_name}</p>
                            )}
                        </div>
                        <div className="text-right text-xs font-normal mt-2 mb-1">
                            Date: {printDateText}
                        </div>
                    </div>
                </div>

                {/* Main Table - Print Style */}
                <table className="w-full border-collapse border border-black" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        {/* Receipt */}
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '11%' }} />
                        <col style={{ width: '11%' }} />
                        {/* Payment */}
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '11%' }} />
                        <col style={{ width: '11%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-bold"
                                style={{ fontSize: '13px' }}
                                colSpan={4}
                            >
                                Receipt
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-bold"
                                style={{ fontSize: '13px' }}
                                colSpan={4}
                            >
                                Payment
                            </th>
                        </tr>
                        <tr>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                SL
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                Particulars
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                C. Month
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                Cumulative
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                SL
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                Particulars
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                C. Month
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-semibold"
                                style={{ fontSize: '11px' }}
                            >
                                Cumulative
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Opening Balance Row */}
                        <tr>
                            <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>1</td>
                            <td className="border border-black px-2 py-1 font-semibold" style={{fontSize: '11px'}}>
                                Opening Balance
                            </td>
                            <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                {formatCurrency(openingBalance)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                {formatCurrency(openingBalanceCumulative)}
                            </td>
                            <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                {hasFirstPayment ? 1 : ''}
                            </td>
                            <td
                                className="border border-black px-2 py-1"
                                style={{
                                    fontSize: '11px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.1,
                                }}
                                title={hasFirstPayment ? firstPayment.description : ''}
                            >
                                {hasFirstPayment ? firstPayment.description : ''}
                            </td>
                            <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                {hasFirstPayment ? formatCurrency(firstPayment.month_amount) : ''}
                            </td>
                            <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                {hasFirstPayment ? formatCurrency(firstPayment.cumulative_amount) : ''}
                            </td>
                        </tr>

                        {/* Data Rows */}
                        {Array.from({ length: maxRows }).map((_, index) => {
                            const receipt = meaningfulReceipts[index];
                            const payment = paymentsAfterOpening[index];
                            const hasReceipt = isMeaningfulItem(receipt);
                            const hasPayment = isMeaningfulItem(payment);

                            // Avoid rendering completely empty rows (prevents visual "gaps")
                            if (!hasReceipt && !hasPayment) return null;

                            return (
                                <tr key={index}>
                                    {/* Receipt Side */}
                                    <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                        {hasReceipt ? index + 2 : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1"
                                        style={{
                                            fontSize: '11px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.1,
                                        }}
                                        title={hasReceipt ? receipt.description : ''}
                                    >
                                        {hasReceipt ? receipt.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {hasReceipt ? formatCurrency(receipt.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {hasReceipt ? formatCurrency(receipt.cumulative_amount) : ''}
                                    </td>

                                    {/* Payment Side */}
                                    <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                        {hasPayment ? index + (hasFirstPayment ? 2 : 1) : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1"
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 'normal',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.1,
                                        }}
                                        title={hasPayment ? payment.description : ''}
                                    >
                                        {hasPayment ? payment.description : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1 text-right"
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 'normal',
                                        }}
                                    >
                                        {hasPayment ? formatCurrency(payment.month_amount) : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1 text-right"
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 'normal',
                                        }}
                                    >
                                        {hasPayment ? formatCurrency(payment.cumulative_amount) : ''}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Closing Balance Row */}
                        <tr>
                            <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                {paymentClosingSl}
                            </td>
                            <td className="border border-black px-2 py-1 font-semibold" style={{fontSize: '11px'}}>
                                Closing Balance
                            </td>
                            <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                {formatCurrency(closingBalance)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                {formatCurrency(cumulativeClosingBalance)}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        {/* Total Row */}
                        <tr>
                            <td
                                className="border border-black px-2 py-1.5 text-center font-bold text-xs capitalize"
                                colSpan={2}
                            >
                                Total
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(openingBalance + totalMonthReceipts)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(openingBalanceCumulative + totalCumulativeReceipts)}
                            </td>
                            <td
                                className="border border-black px-2 py-1.5 text-center font-bold text-xs capitalize"
                                colSpan={2}
                            >
                                Total
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalMonthPayments + closingBalance)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalCumulativePayments + cumulativeClosingBalance)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signature Section */}
                <div className="mt-8">
                    <div className="grid grid-cols-3 gap-16">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-12">
                                <p className="font-semibold" style={{fontSize: '11px'}}>Prepared By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-12">
                                <p className="font-semibold" style={{fontSize: '11px'}}>Checked By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-12">
                                <p className="font-semibold" style={{fontSize: '11px'}}>Approved By</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-gray-600" style={{fontSize: '11px'}}>
                    <p>Printed on: {new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 6mm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .print-container,
                    .print-container * {
                        visibility: visible;
                    }

                    .print-container {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white;
                    }

                    table {
                        border-collapse: collapse !important;
                        width: 100%;
                    }

                    th, td {
                        border: 1px solid #000 !important;
                    }

                    .bg-gray-800,
                    .bg-gray-100,
                    .bg-blue-50 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
