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
}

interface IncomeExpenditureItem {
    description: string;
    month_amount: number;
    cumulative_amount: number;
    type: string;
}

interface IncomeExpenditureProps {
    income: IncomeExpenditureItem[];
    expenditure: IncomeExpenditureItem[];
    totalMonthIncome: number;
    totalMonthExpenditure: number;
    totalCumulativeIncome: number;
    totalCumulativeExpenditure: number;
    monthSurplus: number;
    cumulativeSurplus: number;
    filters?: {
        start_date?: string;
        end_date?: string;
        account_id?: string;
    };
    accounts?: Account[];
    schoolName?: string;
    schoolAddress?: string;
}

export default function IncomeExpenditure({
    income,
    expenditure,
    totalMonthIncome,
    totalMonthExpenditure,
    totalCumulativeIncome,
    totalCumulativeExpenditure,
    monthSurplus,
    cumulativeSurplus,
    filters,
    accounts,
    schoolName,
    schoolAddress,
}: IncomeExpenditureProps) {
    const institute = useInstitute();
    const effectiveSchoolName = schoolName || institute.name;
    const effectiveSchoolAddress = schoolAddress || institute.address;
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [accountId, setAccountId] = useState(filters?.account_id || '');

    const handleFilter = () => {
        router.get('/accounting/reports/income-expenditure',
            { start_date: startDate, end_date: endDate, account_id: accountId },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setAccountId('');
        router.get('/accounting/reports/income-expenditure');
    };

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

    // Calculate max rows for balanced layout
    const maxRows = Math.max(income.length, expenditure.length);

    return (
        <AuthenticatedLayout>
            <Head title="Statement of Comprehensive Income & Expenditure" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Statement of Comprehensive Income & Expenditure
                            </h1>
                            <p className="text-gray-600 mt-1">Statement of Comprehensive Income & Expenditure</p>
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
                        <h2 className="text-lg font-bold mb-2 text-gray-800">
                            Statement of Comprehensive Income & Expenditure
                        </h2>
                        <div className="flex items-start justify-between text-sm text-gray-600">
                            <div className="text-left">
                                {selectedAccount && (
                                    <p className="text-xs text-gray-600">
                                        Account: {selectedAccount.account_name}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
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
                                    : ''}
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                <tr>
                                    <th
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-sm"
                                        colSpan={4}
                                    >
                                        Expenditure
                                    </th>
                                    <th
                                        className="border border-gray-400 px-2 py-1.5 text-center font-bold text-sm"
                                        colSpan={4}
                                    >
                                        Income
                                    </th>
                                </tr>
                                <tr>
                                    {/* Expenditure Headers */}
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

                                    {/* Income Headers */}
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
                                {/* Data Rows */}
                                {Array.from({ length: maxRows }).map((_, index) => {
                                    const incomeItem = income[index];
                                    const expenditureItem = expenditure[index];

                                    return (
                                        <tr key={index}>
                                            {/* Expenditure Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-center text-xs">
                                                {expenditureItem ? index + 1 : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {expenditureItem ? expenditureItem.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {expenditureItem ? formatCurrency(expenditureItem.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {expenditureItem ? formatCurrency(expenditureItem.cumulative_amount) : ''}
                                            </td>

                                            {/* Income Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-center text-xs">
                                                {incomeItem ? index + 1 : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {incomeItem ? incomeItem.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {incomeItem ? formatCurrency(incomeItem.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {incomeItem ? formatCurrency(incomeItem.cumulative_amount) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Total Expenditure Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center font-semibold text-xs bg-gray-100" colSpan={2}>
                                        Total Expenditure
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-semibold text-xs bg-gray-100">
                                        {formatCurrency(totalMonthExpenditure)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-semibold text-xs bg-gray-100">
                                        {formatCurrency(totalCumulativeExpenditure)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                </tr>

                                {/* Surplus/Deficit Row with +/- sign */}
                                <tr>
                                    <td className={`border border-gray-400 px-2 py-1.5 text-center font-semibold text-xs ${monthSurplus >= 0 ? 'bg-green-50' : 'bg-red-50'}`} colSpan={2}>
                                        Surplus/Deficit
                                    </td>
                                    <td className={`border border-gray-400 px-2 py-1.5 text-right text-xs ${monthSurplus >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {monthSurplus < 0 ? '-' : ''} {formatCurrency(Math.abs(monthSurplus))}
                                    </td>
                                    <td className={`border border-gray-400 px-2 py-1.5 text-right text-xs ${monthSurplus >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {cumulativeSurplus < 0 ? '-' : ''} {formatCurrency(Math.abs(cumulativeSurplus))}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                {/* Final Total Row - Both sides equal */}
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-xs capitalize" colSpan={2}>
                                        Total
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalMonthIncome)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalCumulativeIncome)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-xs capitalize" colSpan={2}>
                                        Total
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalMonthIncome)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalCumulativeIncome)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(totalMonthIncome)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-gray-600 mb-1">Total Expenditure</p>
                            <p className="text-2xl font-bold text-red-600">৳ {formatCurrency(totalMonthExpenditure)}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${monthSurplus >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                            <p className="text-gray-600 mb-1">{monthSurplus >= 0 ? 'Surplus' : 'Deficit'}</p>
                            <p className={`text-2xl font-bold ${monthSurplus >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                ৳ {formatCurrency(Math.abs(monthSurplus))}
                            </p>
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
                        <h2 className="text-base font-bold mb-0">
                            Statement of Comprehensive Income & Expenditure
                        </h2>
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
                        {/* Expenditure */}
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '11%' }} />
                        <col style={{ width: '11%' }} />
                        {/* Income */}
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
                                Expenditure
                            </th>
                            <th
                                className="border border-black px-2 py-1.5 text-center font-bold"
                                style={{ fontSize: '13px' }}
                                colSpan={4}
                            >
                                Income
                            </th>
                        </tr>
                        <tr>
                            {/* Expenditure Headers */}
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                SL
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Particulars
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                C. Month
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Cumulative
                            </th>

                            {/* Income Headers */}
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                SL
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Particulars
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                C. Month
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}}>
                                Cumulative
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Data Rows */}
                        {Array.from({ length: maxRows }).map((_, index) => {
                            const incomeItem = income[index];
                            const expenditureItem = expenditure[index];

                            return (
                                <tr key={index}>
                                    {/* Expenditure Side */}
                                    <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                        {expenditureItem ? index + 1 : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1"
                                        style={{
                                            fontSize: '11px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.1,
                                        }}
                                        title={expenditureItem ? expenditureItem.description : ''}
                                    >
                                        {expenditureItem ? expenditureItem.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {expenditureItem ? formatCurrency(expenditureItem.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {expenditureItem ? formatCurrency(expenditureItem.cumulative_amount) : ''}
                                    </td>

                                    {/* Income Side */}
                                    <td className="border border-black px-2 py-1 text-center" style={{fontSize: '11px'}}>
                                        {incomeItem ? index + 1 : ''}
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1"
                                        style={{
                                            fontSize: '11px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.1,
                                        }}
                                        title={incomeItem ? incomeItem.description : ''}
                                    >
                                        {incomeItem ? incomeItem.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {incomeItem ? formatCurrency(incomeItem.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right" style={{fontSize: '11px'}}>
                                        {incomeItem ? formatCurrency(incomeItem.cumulative_amount) : ''}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Total Expenditure Row */}
                        <tr>
                            <td className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}} colSpan={2}>
                                Total Expenditure
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-semibold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalMonthExpenditure)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-semibold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalCumulativeExpenditure)}
                            </td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                        </tr>

                        {/* Surplus/Deficit Row with +/- sign */}
                        <tr>
                            <td className="border border-black px-2 py-1.5 text-center font-semibold" style={{fontSize: '11px'}} colSpan={2}>
                                {monthSurplus >= 0 ? 'Surplus (+)' : 'Deficit (-)'}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right" style={{fontSize: '11px'}}>
                                {monthSurplus < 0 ? '-' : ''} {formatCurrency(Math.abs(monthSurplus))}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right" style={{fontSize: '11px'}}>
                                {cumulativeSurplus < 0 ? '-' : ''} {formatCurrency(Math.abs(cumulativeSurplus))}
                            </td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                            <td className="border border-black px-2 py-1.5" style={{fontSize: '11px'}}></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        {/* Final Total Row - Both sides equal */}
                        <tr>
                            <td className="border border-black px-2 py-1.5 text-center font-bold capitalize" style={{fontSize: '11px'}} colSpan={2}>
                                Total
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalMonthIncome)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalCumulativeIncome)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-center font-bold capitalize" style={{fontSize: '11px'}} colSpan={2}>
                                Total
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalMonthIncome)}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right font-bold" style={{fontSize: '11px'}}>
                                {formatCurrency(totalCumulativeIncome)}
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

                    .bg-gray-100 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
