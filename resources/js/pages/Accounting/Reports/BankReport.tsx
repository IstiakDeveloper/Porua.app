import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useInstitute } from '@/hooks/useInstitute';

interface Account {
    id: number;
    account_name: string;
    account_type: string;
}

interface DailyData {
    date: string;
    credits: { [key: string]: number };
    debits: { [key: string]: number };
    total_credit: number;
    total_debit: number;
    balance: number;
}

interface BankReportProps {
    dailyData: DailyData[];
    openingBalance: number;
    closingBalance: number;
    grandTotalCredit: number;
    grandTotalDebit: number;
    creditTotals: { [key: string]: number };
    debitTotals: { [key: string]: number };
    creditCategories: string[];
    debitCategories: string[];
    filters: {
        start_date: string;
        end_date: string;
    };
    schoolName?: string;
    schoolAddress?: string;
}

export default function BankReport({
    dailyData,
    openingBalance,
    closingBalance,
    grandTotalCredit,
    grandTotalDebit,
    creditTotals,
    debitTotals,
    creditCategories,
    debitCategories,
    filters,
    schoolName,
    schoolAddress,
}: BankReportProps) {
    const institute = useInstitute();
    const effectiveSchoolName = schoolName || institute.name;
    const effectiveSchoolAddress = schoolAddress || institute.address;
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilter = () => {
        router.get('/accounting/reports/bank-report',
            { start_date: startDate, end_date: endDate },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        router.get('/accounting/reports/bank-report');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const dateRange = `${new Date(filters.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(filters.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    // Calculate total columns
    const totalCreditCols = creditCategories.length + 1; // +1 for Total
    const totalDebitCols = debitCategories.length + 1; // +1 for Total

    return (
        <AuthenticatedLayout>
            <Head title="Bank Report" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Bank Report
                            </h1>
                            <p className="text-xs text-emerald-700/80 mt-0.5">Category-wise daily credit and debit summary</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={handlePrint}
                                className="w-full sm:w-auto justify-center bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div className="flex items-end gap-2 sm:col-span-2 pt-1 sm:pt-0">
                            <Button onClick={handleFilter} className="flex-1 sm:flex-none justify-center bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                                Apply Filter
                            </Button>
                            <Button onClick={handleReset} className="flex-1 sm:flex-none justify-center bg-gray-500 text-white hover:bg-gray-600 cursor-pointer">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Report Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    {/* Header Info */}
                    <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
                        <h2 className="text-xl font-bold mb-1 text-gray-800">BANK REPORT</h2>
                        <p className="text-sm font-semibold text-gray-600">For the period: {dateRange}</p>
                    </div>

                    {/* Main Table with horizontal scroll for mobile */}
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="min-w-[700px] w-full border-collapse border border-gray-400 table-fixed" style={{ fontSize: '10px' }}>
                        <thead>
                            {/* First header row - grouped headers */}
                            <tr>
                                <th rowSpan={2} className="border border-gray-400 p-1 text-center font-semibold bg-gray-100" style={{ width: '60px' }}>
                                    Date
                                </th>
                                <th colSpan={totalCreditCols} className="border border-gray-400 p-1 text-center font-semibold bg-green-100">
                                    Credit
                                </th>
                                <th colSpan={totalDebitCols} className="border border-gray-400 p-1 text-center font-semibold bg-red-100">
                                    Debit
                                </th>
                                <th rowSpan={2} className="border border-gray-400 p-1 text-center font-semibold bg-blue-100" style={{ width: '70px' }}>
                                    Balance
                                </th>
                            </tr>
                            {/* Second header row - category names with wrapping */}
                            <tr>
                                {/* Credit category headers */}
                                {creditCategories.map((cat) => (
                                    <th
                                        key={`credit-${cat}`}
                                        className="border border-gray-400 p-1 text-center font-medium bg-green-50"
                                        style={{ fontSize: '8px', lineHeight: '1.2' }}
                                    >
                                        {cat}
                                    </th>
                                ))}
                                <th className="border border-gray-400 p-1 text-center font-semibold bg-green-200" style={{ width: '55px', fontSize: '9px' }}>
                                    Total
                                </th>

                                {/* Debit category headers */}
                                {debitCategories.map((cat) => (
                                    <th
                                        key={`debit-${cat}`}
                                        className="border border-gray-400 p-1 text-center font-medium bg-red-50"
                                        style={{ fontSize: '8px', lineHeight: '1.2' }}
                                    >
                                        {cat}
                                    </th>
                                ))}
                                <th className="border border-gray-400 p-1 text-center font-semibold bg-red-200" style={{ width: '55px', fontSize: '9px' }}>
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Opening Balance Row */}
                            <tr className="bg-gray-50">
                                <td className="border border-gray-400 p-1 font-semibold text-center" style={{ fontSize: '9px' }}>
                                    Opening
                                </td>
                                {/* Empty credit columns */}
                                {creditCategories.map((cat) => (
                                    <td key={`open-credit-${cat}`} className="border border-gray-400 p-1 text-center text-gray-400">-</td>
                                ))}
                                <td className="border border-gray-400 p-1 text-center text-gray-400">-</td>
                                {/* Empty debit columns */}
                                {debitCategories.map((cat) => (
                                    <td key={`open-debit-${cat}`} className="border border-gray-400 p-1 text-center text-gray-400">-</td>
                                ))}
                                <td className="border border-gray-400 p-1 text-center text-gray-400">-</td>
                                {/* Opening Balance */}
                                <td className="border border-gray-400 p-1 text-right font-semibold bg-blue-50">
                                    {formatCurrency(openingBalance)}
                                </td>
                            </tr>

                            {/* Daily Data Rows */}
                            {dailyData.length > 0 ? (
                                dailyData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-400 p-1 text-center">
                                            {formatDate(row.date)}
                                        </td>
                                        {/* Credit columns */}
                                        {creditCategories.map((cat) => (
                                            <td key={`row-credit-${cat}`} className="border border-gray-400 p-1 text-right bg-green-50">
                                                {row.credits[cat] > 0 ? formatCurrency(row.credits[cat]) : '-'}
                                            </td>
                                        ))}
                                        <td className="border border-gray-400 p-1 text-right font-medium bg-green-100 text-green-800">
                                            {row.total_credit > 0 ? formatCurrency(row.total_credit) : '-'}
                                        </td>
                                        {/* Debit columns */}
                                        {debitCategories.map((cat) => (
                                            <td key={`row-debit-${cat}`} className="border border-gray-400 p-1 text-right bg-red-50">
                                                {row.debits[cat] > 0 ? formatCurrency(row.debits[cat]) : '-'}
                                            </td>
                                        ))}
                                        <td className="border border-gray-400 p-1 text-right font-medium bg-red-100 text-red-800">
                                            {row.total_debit > 0 ? formatCurrency(row.total_debit) : '-'}
                                        </td>
                                        {/* Balance */}
                                        <td className="border border-gray-400 p-1 text-right font-medium bg-blue-50">
                                            {formatCurrency(row.balance)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={1 + totalCreditCols + totalDebitCols + 1} className="border border-gray-400 p-3 text-center text-gray-500">
                                        No transactions found for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            {/* Total Row */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="border border-gray-400 p-1 text-center" style={{ fontSize: '9px' }}>
                                    TOTAL
                                </td>
                                {/* Credit totals by category */}
                                {creditCategories.map((cat) => (
                                    <td key={`total-credit-${cat}`} className="border border-gray-400 p-1 text-right bg-green-100">
                                        {creditTotals[cat] > 0 ? formatCurrency(creditTotals[cat]) : '-'}
                                    </td>
                                ))}
                                <td className="border border-gray-400 p-1 text-right bg-green-200 text-green-900">
                                    {formatCurrency(grandTotalCredit)}
                                </td>
                                {/* Debit totals by category */}
                                {debitCategories.map((cat) => (
                                    <td key={`total-debit-${cat}`} className="border border-gray-400 p-1 text-right bg-red-100">
                                        {debitTotals[cat] > 0 ? formatCurrency(debitTotals[cat]) : '-'}
                                    </td>
                                ))}
                                <td className="border border-gray-400 p-1 text-right bg-red-200 text-red-900">
                                    {formatCurrency(grandTotalDebit)}
                                </td>
                                {/* Closing Balance */}
                                <td className="border border-gray-400 p-1 text-right bg-blue-200">
                                    {formatCurrency(closingBalance)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    </div>

                    {/* Summary Cards */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-gray-600 text-xs mb-1">Opening Balance</p>
                            <p className="text-lg font-bold text-green-600">৳ {formatCurrency(openingBalance)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-gray-600 text-xs mb-1">Total Credit</p>
                            <p className="text-lg font-bold text-green-600">৳ {formatCurrency(grandTotalCredit)}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-gray-600 text-xs mb-1">Total Debit</p>
                            <p className="text-lg font-bold text-red-600">৳ {formatCurrency(grandTotalDebit)}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-gray-600 text-xs mb-1">Closing Balance</p>
                            <p className="text-lg font-bold text-blue-600">৳ {formatCurrency(closingBalance)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-3 pb-2 border-b-2 border-black">
                    <h1 className="text-base font-bold mb-1">{effectiveSchoolName}</h1>
                    {effectiveSchoolAddress && <p className="text-xs mb-0.5">{effectiveSchoolAddress}</p>}
                    <h2 className="text-sm font-bold mb-1">BANK REPORT</h2>
                    <p style={{ fontSize: '9px' }} className="font-semibold">For the period: {dateRange}</p>
                </div>

                {/* Main Table - Print Style */}
                <table className="w-full border-collapse border border-black table-fixed" style={{ fontSize: '6px' }}>
                    <thead>
                        {/* First header row - grouped headers */}
                        <tr>
                            <th rowSpan={2} className="border border-black p-0.5 text-center font-semibold bg-gray-100" style={{ width: '45px' }}>
                                Date
                            </th>
                            <th colSpan={totalCreditCols} className="border border-black p-0.5 text-center font-semibold bg-green-100">
                                Credit
                            </th>
                            <th colSpan={totalDebitCols} className="border border-black p-0.5 text-center font-semibold bg-red-100">
                                Debit
                            </th>
                            <th rowSpan={2} className="border border-black p-0.5 text-center font-semibold bg-blue-100" style={{ width: '50px' }}>
                                Balance
                            </th>
                        </tr>
                        {/* Second header row - category names */}
                        <tr>
                            {/* Credit category headers */}
                            {creditCategories.map((cat) => (
                                <th
                                    key={`print-credit-${cat}`}
                                    className="border border-black p-0.5 text-center font-medium bg-green-50"
                                    style={{ fontSize: '5px', lineHeight: '1.1' }}
                                >
                                    {cat}
                                </th>
                            ))}
                            <th className="border border-black p-0.5 text-center font-semibold bg-green-200" style={{ width: '40px', fontSize: '5px' }}>
                                Total
                            </th>

                            {/* Debit category headers */}
                            {debitCategories.map((cat) => (
                                <th
                                    key={`print-debit-${cat}`}
                                    className="border border-black p-0.5 text-center font-medium bg-red-50"
                                    style={{ fontSize: '5px', lineHeight: '1.1' }}
                                >
                                    {cat}
                                </th>
                            ))}
                            <th className="border border-black p-0.5 text-center font-semibold bg-red-200" style={{ width: '40px', fontSize: '5px' }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Opening Balance Row */}
                        <tr className="bg-gray-100">
                            <td className="border border-black p-0.5 font-semibold text-center" style={{ fontSize: '5px' }}>
                                Opening
                            </td>
                            {creditCategories.map((cat) => (
                                <td key={`print-open-credit-${cat}`} className="border border-black p-0.5 text-center">-</td>
                            ))}
                            <td className="border border-black p-0.5 text-center">-</td>
                            {debitCategories.map((cat) => (
                                <td key={`print-open-debit-${cat}`} className="border border-black p-0.5 text-center">-</td>
                            ))}
                            <td className="border border-black p-0.5 text-center">-</td>
                            <td className="border border-black p-0.5 text-right font-semibold">
                                {formatCurrency(openingBalance)}
                            </td>
                        </tr>

                        {/* Daily Data Rows */}
                        {dailyData.map((row, index) => (
                            <tr key={index}>
                                <td className="border border-black p-0.5 text-center" style={{ fontSize: '5px' }}>
                                    {formatDate(row.date)}
                                </td>
                                {creditCategories.map((cat) => (
                                    <td key={`print-row-credit-${cat}`} className="border border-black p-0.5 text-right">
                                        {row.credits[cat] > 0 ? formatCurrency(row.credits[cat]) : '-'}
                                    </td>
                                ))}
                                <td className="border border-black p-0.5 text-right font-medium">
                                    {row.total_credit > 0 ? formatCurrency(row.total_credit) : '-'}
                                </td>
                                {debitCategories.map((cat) => (
                                    <td key={`print-row-debit-${cat}`} className="border border-black p-0.5 text-right">
                                        {row.debits[cat] > 0 ? formatCurrency(row.debits[cat]) : '-'}
                                    </td>
                                ))}
                                <td className="border border-black p-0.5 text-right font-medium">
                                    {row.total_debit > 0 ? formatCurrency(row.total_debit) : '-'}
                                </td>
                                <td className="border border-black p-0.5 text-right font-medium">
                                    {formatCurrency(row.balance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {/* Total Row */}
                        <tr className="bg-gray-100">
                            <td className="border border-black p-0.5 text-center font-bold" style={{ fontSize: '5px' }}>
                                TOTAL
                            </td>
                            {creditCategories.map((cat) => (
                                <td key={`print-total-credit-${cat}`} className="border border-black p-0.5 text-right font-bold">
                                    {creditTotals[cat] > 0 ? formatCurrency(creditTotals[cat]) : '-'}
                                </td>
                            ))}
                            <td className="border border-black p-0.5 text-right font-bold">
                                {formatCurrency(grandTotalCredit)}
                            </td>
                            {debitCategories.map((cat) => (
                                <td key={`print-total-debit-${cat}`} className="border border-black p-0.5 text-right font-bold">
                                    {debitTotals[cat] > 0 ? formatCurrency(debitTotals[cat]) : '-'}
                                </td>
                            ))}
                            <td className="border border-black p-0.5 text-right font-bold">
                                {formatCurrency(grandTotalDebit)}
                            </td>
                            <td className="border border-black p-0.5 text-right font-bold">
                                {formatCurrency(closingBalance)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signature Section */}
                <div className="mt-6">
                    <div className="grid grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{ fontSize: '7px' }}>Prepared By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{ fontSize: '7px' }}>Checked By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{ fontSize: '7px' }}>Approved By</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-gray-600" style={{ fontSize: '6px' }}>
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
                        size: A4 landscape;
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
                        table-layout: fixed;
                    }

                    th, td {
                        border: 1px solid #000 !important;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }

                    .bg-green-100,
                    .bg-green-200,
                    .bg-green-50,
                    .bg-red-100,
                    .bg-red-200,
                    .bg-red-50,
                    .bg-blue-100,
                    .bg-gray-100 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
