import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useInstitute } from '@/hooks/useInstitute';

interface FixedAssetItem {
    asset_name: string;
    asset_code?: string;
    current_value: number;
}

interface BalanceSheetProps {
    fundAndLiabilities: {
        fund: number;
        surplus: number;
        providentFund: number;
        staffWelfareFund: number;
        total: number;
    };
    propertyAndAssets: {
        fixedAssets: FixedAssetItem[];
        totalFixedAssets: number;
        welfareLoanOutstanding: number;
        closingBankBalance: number;
        total: number;
    };
    filters: {
        end_date: string;
    };
    balanceDifference: number;
    schoolName?: string;
    schoolAddress?: string;
}

export default function BalanceSheet({
    fundAndLiabilities,
    propertyAndAssets,
    filters,
    balanceDifference,
    schoolName,
    schoolAddress,
}: BalanceSheetProps) {
    const institute = useInstitute();
    const effectiveSchoolName = schoolName || institute.name;
    const effectiveSchoolAddress = schoolAddress || institute.address;
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilter = () => {
        router.get('/accounting/reports/balance-sheet',
            { end_date: endDate },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setEndDate('');
        router.get('/accounting/reports/balance-sheet');
    };

    const handlePrint = () => {
        window.print();
    };

    const reportDate = new Date(filters.end_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const printDateText = endDate
        ? new Date(endDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          })
        : reportDate;

    const leftRows: Array<{ label: string; value: number; emphasize?: boolean; showSign?: boolean }> = [
        { label: 'Fund', value: fundAndLiabilities.fund },
        { label: 'Surplus/Deficit', value: fundAndLiabilities.surplus, showSign: true },
        { label: 'Provident Fund', value: fundAndLiabilities.providentFund },
        { label: 'Staff Welfare Fund', value: fundAndLiabilities.staffWelfareFund },
    ];

    const rightRows: Array<{ label: string; value: number }> = [
        ...propertyAndAssets.fixedAssets.map((a) => ({
            label: a.asset_code ? `${a.asset_name} (${a.asset_code})` : a.asset_name,
            value: a.current_value,
        })),
        { label: 'Staff Welfare Fund (Loans)', value: propertyAndAssets.welfareLoanOutstanding },
        { label: 'Closing Bank Balance', value: propertyAndAssets.closingBankBalance },
    ];

    const maxRows = Math.max(leftRows.length, rightRows.length);

    return (
        <AuthenticatedLayout>
            <Head title="Balance Sheet" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Balance Sheet
                            </h1>
                            <p className="text-gray-600 mt-1">Statement of financial position</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                As at Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
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
                        <h2 className="text-lg font-bold mb-2 text-gray-800">Statement of Financial Position</h2>
                        <div className="text-sm text-right text-gray-600">
                            Date: {printDateText}
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                <tr>
                                    <th
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-sm"
                                        colSpan={3}
                                    >
                                        Fund and Liabilities
                                    </th>
                                    <th
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-sm"
                                        colSpan={3}
                                    >
                                        Property and Assets
                                    </th>
                                </tr>
                                <tr>
                                    {/* Fund and Liabilities Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '5%'}}>
                                        SL
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '35%'}}>
                                        Particulars
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '15%'}}>
                                        Amount
                                    </th>

                                    {/* Property and Assets Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '5%'}}>
                                        SL
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '35%'}}>
                                        Particulars
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '15%'}}>
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: maxRows }).map((_, index) => {
                                    const left = leftRows[index];
                                    const right = rightRows[index];
                                    const isSurplusRow = left?.label === 'Surplus/Deficit';
                                    const surplusBgClass = fundAndLiabilities.surplus >= 0 ? 'bg-green-50' : 'bg-red-50';

                                    return (
                                        <tr key={index}>
                                            <td className={`border border-gray-400 px-2 py-1 text-center text-xs ${isSurplusRow ? surplusBgClass : ''}`}>
                                                {left ? index + 1 : ''}
                                            </td>
                                            <td className={`border border-gray-400 px-2 py-1 text-xs ${isSurplusRow ? surplusBgClass : ''}`}>
                                                {left ? left.label : ''}
                                            </td>
                                            <td className={`border border-gray-400 px-2 py-1 text-right text-xs ${isSurplusRow ? surplusBgClass : ''}`}>
                                                {left
                                                    ? left.showSign
                                                        ? `${left.value < 0 ? '-' : ''} ${formatCurrency(Math.abs(left.value))}`
                                                        : formatCurrency(left.value)
                                                    : ''}
                                            </td>

                                            <td className="border border-gray-400 px-2 py-1 text-center text-xs">
                                                {right ? index + 1 : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {right ? right.label : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {right ? formatCurrency(right.value) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                {/* Total Row */}
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-xs capitalize" colSpan={2}>
                                        Total
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(fundAndLiabilities.total)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-xs capitalize" colSpan={2}>
                                        Total
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(propertyAndAssets.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Balance Check */}
                    {Math.abs(balanceDifference) > 0.01 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Warning:</strong> Balance Sheet is not balanced. Difference: ৳{formatCurrency(Math.abs(balanceDifference))}
                            </p>
                        </div>
                    )}

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-gray-600 mb-1">Total Fund and Liabilities</p>
                            <p className="text-2xl font-bold text-blue-600">৳ {formatCurrency(fundAndLiabilities.total)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Property and Assets</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(propertyAndAssets.total)}</p>
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
                        <h2 className="text-base font-bold mb-0">Statement of Financial Position</h2>
                    </div>
                    <div className="flex items-start justify-end">
                        <div className="text-right text-xs font-normal mt-2 mb-1">
                            Date: {printDateText}
                        </div>
                    </div>
                </div>

                {/* Main Table - Print Style */}
                <table className="w-full border-collapse border border-black" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        {/* Fund/Liabilities */}
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '31%' }} />
                        <col style={{ width: '15%' }} />
                        {/* Property/Assets */}
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '31%' }} />
                        <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-bold"
                                style={{ fontSize: '13px' }}
                                colSpan={3}
                            >
                                Fund and Liabilities
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-bold"
                                style={{ fontSize: '13px' }}
                                colSpan={3}
                            >
                                Property and Assets
                            </th>
                        </tr>
                        <tr>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                SL
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Particulars
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Amount
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                SL
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Particulars
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxRows }).map((_, index) => {
                            const left = leftRows[index];
                            const right = rightRows[index];

                            return (
                                <tr key={index}>
                                    <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                        {left ? index + 1 : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1"
                                        style={{
                                            fontSize: '11px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.1,
                                        }}
                                        title={left ? left.label : ''}
                                    >
                                        {left ? left.label : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {left
                                            ? left.showSign
                                                ? `${left.value < 0 ? '-' : ''} ${formatCurrency(Math.abs(left.value))}`
                                                : formatCurrency(left.value)
                                            : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                        {right ? index + 1 : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1"
                                        style={{
                                            fontSize: '11px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.1,
                                        }}
                                        title={right ? right.label : ''}
                                    >
                                        {right ? right.label : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {right ? formatCurrency(right.value) : ''}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="border border-black px-2 py-1.5 text-center font-bold capitalize" style={{fontSize: '11px'}} colSpan={2}>
                                Total
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(fundAndLiabilities.total)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-center font-bold capitalize" style={{fontSize: '11px'}} colSpan={2}>
                                Total
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(propertyAndAssets.total)}
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

                }
            `}</style>
        </AuthenticatedLayout>
    );
}
