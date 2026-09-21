import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { HandCoins, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useInstitute } from '@/hooks/useInstitute';

interface TeacherOption {
    id: number;
    name: string;
    employee_id: string;
}

interface LedgerRow {
    teacher_id: number;
    name: string;
    employee_id: string;
    before_due_balance: number;
    paid_in_period: number;
    current_due_balance: number;
}

interface Summary {
    teacher_count: number;
    total_before_due_balance: number;
    total_paid_in_period: number;
    total_current_due_balance: number;
}

interface Filters {
    start_date: string;
    end_date: string;
    teacher_id: number | null;
}

interface Props {
    rows: LedgerRow[];
    summary: Summary;
    filters: Filters;
    teachers: TeacherOption[];
    schoolName?: string;
    schoolAddress?: string;
}

function formatPeriodLabel(start: string, end: string): string {
    const a = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const b = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `${a} – ${b}`;
}

export default function StaffWelfareLoanLedger({
    rows,
    summary,
    filters,
    teachers,
    schoolName,
    schoolAddress,
}: Props) {
    const institute = useInstitute();
    const effectiveSchoolName = schoolName || institute.name;
    const effectiveSchoolAddress = schoolAddress || institute.address;
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [teacherId, setTeacherId] = useState(filters.teacher_id?.toString() ?? '');

    useEffect(() => {
        setStartDate(filters.start_date);
        setEndDate(filters.end_date);
        setTeacherId(filters.teacher_id?.toString() ?? '');
    }, [filters]);

    const applyFilters = () => {
        router.get('/accounting/reports/staff-welfare-loan-ledger', {
            start_date: startDate,
            end_date: endDate,
            teacher_id: teacherId || undefined,
        });
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setTeacherId('');
        router.get('/accounting/reports/staff-welfare-loan-ledger');
    };

    const handlePrint = () => window.print();

    const periodLabel = formatPeriodLabel(filters.start_date, filters.end_date);

    const tableBody = (borderCell: string, textSize: string) =>
        rows.length === 0 ? (
            <tr>
                <td colSpan={4} className={`${borderCell} px-2 py-6 text-center text-gray-600 ${textSize}`}>
                    No teachers with welfare loans in this period.
                </td>
            </tr>
        ) : (
            rows.map((r) => (
                <tr key={r.teacher_id}>
                    <td className={`${borderCell} px-2 py-1.5 ${textSize}`}>
                        <div className="font-medium text-gray-900">{r.name}</div>
                        {r.employee_id ? <div className="text-gray-600 text-xs">{r.employee_id}</div> : null}
                    </td>
                    <td className={`${borderCell} px-2 py-1.5 text-right font-mono tabular-nums ${textSize}`}>
                        ৳{formatCurrency(r.before_due_balance)}
                    </td>
                    <td className={`${borderCell} px-2 py-1.5 text-right font-mono tabular-nums ${textSize}`}>
                        ৳{formatCurrency(r.paid_in_period)}
                    </td>
                    <td className={`${borderCell} px-2 py-1.5 text-right font-mono tabular-nums font-semibold ${textSize}`}>
                        ৳{formatCurrency(r.current_due_balance)}
                    </td>
                </tr>
            ))
        );

    const tableFoot = (borderCell: string, textSize: string) =>
        rows.length === 0 ? null : (
            <tfoot>
                <tr className="bg-gray-50">
                    <td className={`${borderCell} px-2 py-2 text-right font-bold ${textSize}`}>
                        Total ({summary.teacher_count} teachers)
                    </td>
                    <td className={`${borderCell} px-2 py-2 text-right font-bold font-mono tabular-nums ${textSize}`}>
                        ৳{formatCurrency(summary.total_before_due_balance)}
                    </td>
                    <td className={`${borderCell} px-2 py-2 text-right font-bold font-mono tabular-nums ${textSize}`}>
                        ৳{formatCurrency(summary.total_paid_in_period)}
                    </td>
                    <td className={`${borderCell} px-2 py-2 text-right font-bold font-mono tabular-nums ${textSize}`}>
                        ৳{formatCurrency(summary.total_current_due_balance)}
                    </td>
                </tr>
            </tfoot>
        );

    return (
        <AuthenticatedLayout>
            <Head title="Staff Welfare Loan Ledger" />

            {/* Screen */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Staff Welfare Loan Ledger
                            </h1>
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <HandCoins className="w-4 h-4 text-emerald-600 shrink-0" />
                                Outstanding by teacher for the selected date range (balances as at end date).
                            </p>
                        </div>
                        <Button
                            onClick={handlePrint}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            icon={<Printer className="w-4 h-4" />}
                        >
                            Print Report
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">From date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">To date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher (optional)</label>
                            <select
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="">All teachers with loans</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.employee_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={applyFilters} className="bg-blue-600 text-white hover:bg-blue-700 flex-1">
                                Apply
                            </Button>
                            <Button onClick={handleReset} className="bg-gray-500 text-white hover:bg-gray-600 flex-1">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center mb-4 border-gray-300">
                        <h3 className="text-2xl font-bold text-gray-800">{schoolName}</h3>
                        {schoolAddress ? <p className="text-sm text-gray-600">{schoolAddress}</p> : null}
                        <h2 className="text-lg font-bold text-gray-800 mt-1">Staff Welfare Loan Ledger</h2>
                        <p className="text-sm text-gray-600 mt-1">Period: {periodLabel}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                <tr>
                                    <th className="border border-gray-400 px-2 py-1.5 text-left font-bold text-sm bg-white">
                                        Name
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-right font-bold text-sm bg-white whitespace-nowrap">
                                        Before due balance
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-right font-bold text-sm bg-white whitespace-nowrap">
                                        Paid in period
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-right font-bold text-sm bg-white whitespace-nowrap">
                                        Current due balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {tableBody('border border-gray-400', 'text-sm')}
                            </tbody>
                            {tableFoot('border border-gray-400', 'text-sm')}
                        </table>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                        Current due balance = principal − all installments paid on or before the &ldquo;To date&rdquo;.
                        Paid in period uses installment paid dates within the range. Before due balance = current due +
                        paid in period.
                    </p>
                </div>
            </div>

            {/* Print */}
            <div className="hidden print:block print-container">
                <div className="mb-1 pb-0">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-1">{effectiveSchoolName}</h1>
                        {effectiveSchoolAddress ? <p className="text-xs mb-0.5">{effectiveSchoolAddress}</p> : null}
                        <h2 className="text-base font-bold mb-0">Staff Welfare Loan Ledger</h2>
                    </div>
                    <div className="flex items-start justify-end">
                        <div className="text-right text-xs font-normal mt-2 mb-1">Period: {periodLabel}</div>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: '40%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="border border-black px-2 py-1.5 text-center font-bold" style={{ fontSize: '13px' }}>
                                Name
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-bold" style={{ fontSize: '13px' }}>
                                Before due balance
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-bold" style={{ fontSize: '13px' }}>
                                Paid in period
                            </th>
                            <th className="border border-black px-2 py-1.5 text-center font-bold" style={{ fontSize: '13px' }}>
                                Current due balance
                            </th>
                        </tr>
                    </thead>
                    <tbody>{tableBody('border border-black', 'text-xs')}</tbody>
                    {tableFoot('border border-black', 'text-xs')}
                </table>

                <div className="mt-8">
                    <div className="grid grid-cols-3 gap-16">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-12">
                                <p className="font-semibold" style={{ fontSize: '11px' }}>
                                    Prepared By
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-12">
                                <p className="font-semibold" style={{ fontSize: '11px' }}>
                                    Checked By
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-12">
                                <p className="font-semibold" style={{ fontSize: '11px' }}>
                                    Approved By
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4 text-gray-600" style={{ fontSize: '11px' }}>
                    <p>
                        Printed on:{' '}
                        {new Date().toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            </div>

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
