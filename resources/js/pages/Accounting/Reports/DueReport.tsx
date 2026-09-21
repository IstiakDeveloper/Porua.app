import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useInstitute } from '@/hooks/useInstitute';
import {
    Printer,
    Users,
    Building2,
    GraduationCap,
    RotateCcw,
    Filter,
    Calendar,
    Receipt,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowRight,
    ArrowRightLeft,
    Search,
    X,
    User,
} from 'lucide-react';
import { formatAmount as formatCurrency } from '@/lib/formatCurrency';
import { formatReceiptNumber } from '@/lib/formatReceipt';

export interface StudentSearchItem {
    id: number;
    name: string;
    student_id: string;
    roll_number: string;
    class_id: number;
    class_name: string;
    section_name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_id: string;
    roll_number: string;
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
    start_date: string;
    end_date: string;
}

interface MonthlySummaryItem {
    month: number;
    month_name: string;
    short_name: string;
    total_amount: number;
    discount_amount: number;
    paid_amount: number;
    due_amount: number;
    student_count: number;
    collection_rate: number;
    due_rate: number;
}

interface OrganizationReportData {
    monthly: MonthlySummaryItem[];
    nonMonthly: {
        total_amount: number;
        discount_amount: number;
        paid_amount: number;
        due_amount: number;
        student_count: number;
        collection_rate: number;
        due_rate: number;
    };
}

interface MonthFeeDetail {
    id: number;
    fee_type: string;
    amount: number;
    discount: number;
    paid_amount: number;
    due_amount: number;
    status: string;
    receipt_number?: string;
    payment_date?: string;
}

interface StudentMonthData {
    month: number;
    short_name: string;
    has_fees: boolean;
    fees: MonthFeeDetail[];
    month_total: number;
    month_paid: number;
    month_due: number;
    month_status: 'paid' | 'partial' | 'due' | 'none';
    receipt_numbers: string[];
}

interface StudentReportItem {
    student_id: number;
    student_id_number: string;
    student_name: string;
    roll_number: string;
    class_name: string;
    section: string;
    father_name?: string;
    phone?: string;
    total_amount: number;
    discount_amount: number;
    paid_amount: number;
    due_amount: number;
    months: Record<number, StudentMonthData>;
    one_time_fees?: MonthFeeDetail[];
}

interface ClassDueReportItem {
    class_name: string;
    students: StudentReportItem[];
    student_count: number;
    due_student_count: number;
    total_gross: number;
    total_discount: number;
    total_paid: number;
    total_remaining: number;
}

interface Summary {
    totalDue: number;
    totalDiscount: number;
    totalPaid: number;
    totalRemaining: number;
    totalRecords: number;
    uniqueStudents: number;
}

interface MonthOption {
    num: number;
    name: string;
    full_name: string;
}

interface DueReportProps {
    reportData: OrganizationReportData | ClassDueReportItem[] | StudentReportItem[];
    summary: Summary;
    filters: {
        academic_year_id: number | null;
        report_type: string;
        class_id: number | null;
        student_id: number | null;
        month_from?: number | null;
        month_to?: number | null;
    };
    activeMonths?: MonthOption[];
    allMonthOptions?: MonthOption[];
    academicYears: AcademicYear[];
    academicYear: AcademicYear | null;
    classes: SchoolClass[];
    students: Student[];
    allStudents?: StudentSearchItem[];
    schoolName?: string;
    schoolAddress?: string;
}

/**
 * Modern circular progress bar with percentage in center
 */
function CircularProgressBar({
    percent,
    size = 36,
    stroke = 3.2,
    color = '#10b981',
    trackColor = '#e2e8f0',
    showText = true,
    className = '',
}: {
    percent: number;
    size?: number;
    stroke?: number;
    color?: string;
    trackColor?: string;
    showText?: boolean;
    className?: string;
}) {
    const validPercent = Math.min(Math.max(isNaN(percent) ? 0 : percent, 0), 100);
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (validPercent / 100) * circumference;

    return (
        <div
            className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
            style={{ width: size, height: size }}
            title={`${validPercent.toFixed(1)}%`}
        >
            <svg width={size} height={size} className="shrink-0 -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showText && (
                <span
                    className="absolute inset-0 flex items-center justify-center font-mono font-bold text-slate-800 leading-none"
                    style={{ fontSize: size <= 26 ? '8px' : size <= 34 ? '9px' : '10px' }}
                >
                    {Math.round(validPercent)}%
                </span>
            )}
        </div>
    );
}

const MONTH_NAMES = [
    { num: 1, name: 'Jan' },
    { num: 2, name: 'Feb' },
    { num: 3, name: 'Mar' },
    { num: 4, name: 'Apr' },
    { num: 5, name: 'May' },
    { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' },
    { num: 8, name: 'Aug' },
    { num: 9, name: 'Sep' },
    { num: 10, name: 'Oct' },
    { num: 11, name: 'Nov' },
    { num: 12, name: 'Dec' },
];

export default function DueReport({
    reportData,
    summary,
    filters,
    academicYears,
    academicYear,
    activeMonths,
    allMonthOptions,
    classes,
    students,
    allStudents = [],
    schoolName,
    schoolAddress,
}: DueReportProps) {
    const institute = useInstitute();
    const effectiveSchoolName = schoolName || institute.name;
    const effectiveSchoolAddress = schoolAddress || institute.address;

    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(
        filters?.academic_year_id?.toString() || academicYear?.id?.toString() || ''
    );
    const [reportType, setReportType] = useState<string>(filters?.report_type || 'organization');
    const [selectedClass, setSelectedClass] = useState<string>(filters?.class_id?.toString() || '');
    const [selectedStudent, setSelectedStudent] = useState<string>(filters?.student_id?.toString() || '');
    const [selectedMonthFrom, setSelectedMonthFrom] = useState<string>(
        filters?.month_from ? filters.month_from.toString() : ''
    );
    const [selectedMonthTo, setSelectedMonthTo] = useState<string>(
        filters?.month_to ? filters.month_to.toString() : ''
    );

    // Interactive Search & Select Combobox State
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const [tableSearch, setTableSearch] = useState('');
    const studentDropdownRef = useRef<HTMLDivElement>(null);

    // Selected student details from allStudents
    const selectedStudentObj = useMemo(() => {
        if (!selectedStudent || !allStudents) return null;
        return allStudents.find((s) => s.id === Number(selectedStudent)) || null;
    }, [selectedStudent, allStudents]);

    // Filtered students for the search & select combobox
    const filteredStudentList = useMemo(() => {
        if (!allStudents || allStudents.length === 0) return [];
        if (!studentSearchTerm.trim()) {
            if (selectedClass) {
                return allStudents.filter((s) => s.class_id === Number(selectedClass)).slice(0, 25);
            }
            return allStudents.slice(0, 20);
        }
        const q = studentSearchTerm.toLowerCase().trim();
        return allStudents
            .filter((s) => {
                if (selectedClass && s.class_id !== Number(selectedClass)) return false;
                return (
                    s.name.toLowerCase().includes(q) ||
                    s.roll_number.toLowerCase().includes(q) ||
                    s.student_id.toLowerCase().includes(q) ||
                    s.class_name.toLowerCase().includes(q)
                );
            })
            .slice(0, 25);
    }, [allStudents, studentSearchTerm, selectedClass]);

    // Close student dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectStudentFromSearch = (st: StudentSearchItem) => {
        setSelectedStudent(st.id.toString());
        setSelectedClass(st.class_id.toString());
        setReportType('student');
        setStudentSearchTerm('');
        setIsStudentDropdownOpen(false);

        router.get(
            '/accounting/reports/due-report',
            {
                academic_year_id: selectedAcademicYearId || undefined,
                report_type: 'student',
                class_id: st.class_id,
                student_id: st.id,
                month_from: selectedMonthFrom || undefined,
                month_to: selectedMonthTo || undefined,
            },
            { preserveState: true }
        );
    };

    const handleClearSelectedStudent = () => {
        setSelectedStudent('');
        setStudentSearchTerm('');
        router.get(
            '/accounting/reports/due-report',
            {
                academic_year_id: selectedAcademicYearId || undefined,
                report_type: reportType,
                class_id: selectedClass || undefined,
                student_id: undefined,
                month_from: selectedMonthFrom || undefined,
                month_to: selectedMonthTo || undefined,
            },
            { preserveState: true }
        );
    };

    useEffect(() => {
        if (selectedClass && reportType !== 'organization') {
            router.get(
                '/accounting/reports/due-report',
                {
                    academic_year_id: selectedAcademicYearId,
                    report_type: reportType,
                    class_id: selectedClass,
                    student_id: selectedStudent,
                    month_from: selectedMonthFrom || undefined,
                    month_to: selectedMonthTo || undefined,
                },
                { preserveState: true, only: ['students'] }
            );
        }
    }, [selectedClass]);

    const handleFilter = () => {
        router.get(
            '/accounting/reports/due-report',
            {
                academic_year_id: selectedAcademicYearId || undefined,
                report_type: reportType,
                class_id: selectedClass || undefined,
                student_id: selectedStudent || undefined,
                month_from: selectedMonthFrom || undefined,
                month_to: selectedMonthTo || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        const defaultYear = academicYears.find((y) => y.is_current) || academicYears[0];
        setSelectedAcademicYearId(defaultYear ? defaultYear.id.toString() : '');
        setReportType('organization');
        setSelectedClass('');
        setSelectedStudent('');
        setStudentSearchTerm('');
        setTableSearch('');
        setSelectedMonthFrom('');
        setSelectedMonthTo('');
        router.get('/accounting/reports/due-report');
    };

    const handleReportTypeChange = (type: string) => {
        setReportType(type);
        setSelectedClass('');
        setSelectedStudent('');
        router.get(
            '/accounting/reports/due-report',
            {
                academic_year_id: selectedAcademicYearId,
                report_type: type,
                month_from: selectedMonthFrom || undefined,
                month_to: selectedMonthTo || undefined,
            },
            { preserveState: false }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const getPeriodSubtitle = () => {
        const fromNum = parseInt(selectedMonthFrom);
        const toNum = parseInt(selectedMonthTo);
        const monthsList = allMonthOptions || MONTH_NAMES.map((m) => ({ num: m.num, name: m.name, full_name: m.name }));
        if (fromNum && toNum) {
            const fromObj = monthsList.find((m) => m.num === fromNum);
            const toObj = monthsList.find((m) => m.num === toNum);
            const fromName = fromObj?.full_name || fromObj?.name || fromNum;
            const toName = toObj?.full_name || toObj?.name || toNum;
            if (fromNum === toNum) {
                return `Month: ${fromName} (${academicYear?.name})`;
            }
            return `Period: ${fromName} - ${toName} (${academicYear?.name})`;
        }
        return `Full Year: Jan - Dec (${academicYear?.name})`;
    };

    const getReportTitle = () => {
        const periodStr = getPeriodSubtitle();
        switch (reportType) {
            case 'organization':
                return `Organization Due Ledger • ${periodStr}`;
            case 'class':
                return `Class-Wise Due Matrix • ${periodStr}`;
            case 'student':
                return `Student-Wise Due Matrix • ${periodStr}`;
            default:
                return `Due Report • ${periodStr}`;
        }
    };

    // KPI percentage calculations
    const grossTotal = Number(summary.totalDue) || 1;
    const paidPercent = ((Number(summary.totalPaid) || 0) / grossTotal) * 100;
    const duePercent = ((Number(summary.totalRemaining) || 0) / grossTotal) * 100;
    const discountPercent = ((Number(summary.totalDiscount) || 0) / grossTotal) * 100;

    /* ----------------------------------------------------
       1. SCREEN: ORGANIZATION 12-MONTH DUE REPORT
    ---------------------------------------------------- */
    const renderOrganizationMonthlyReport = () => {
        const data = reportData as OrganizationReportData;
        const months = data?.monthly || [];
        const nonMonthly = data?.nonMonthly;

        const totalBilled = months.reduce((s, m) => s + m.total_amount, 0) + (nonMonthly?.total_amount || 0);
        const totalDiscount = months.reduce((s, m) => s + m.discount_amount, 0) + (nonMonthly?.discount_amount || 0);
        const totalPaid = months.reduce((s, m) => s + m.paid_amount, 0) + (nonMonthly?.paid_amount || 0);
        const totalDue = months.reduce((s, m) => s + m.due_amount, 0) + (nonMonthly?.due_amount || 0);
        const overallDueRate = totalBilled > 0 ? (totalDue / totalBilled) * 100 : 0;

        return (
            <div className="space-y-4">
                <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                    <div className="px-3 py-2.5 bg-slate-100 border-b-2 border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            12-Month Due Breakdown (Session {academicYear?.name})
                        </h3>
                        <span className="text-[10px] text-slate-500 font-medium">
                            January to December Financial Cycle
                        </span>
                    </div>

                    <div className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-medium">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Swipe horizontally to view all months & financials</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-200 text-slate-800 font-bold text-[10.5px] uppercase tracking-wider border-b-2 border-slate-400">
                                    <th className="py-2.5 px-3 border-r border-slate-300 w-36">Month Name</th>
                                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-right w-28">Total Billed (৳)</th>
                                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-right w-24 text-amber-700">Discount</th>
                                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-right w-28 text-emerald-700">Collected (৳)</th>
                                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-right w-36 text-rose-700">Due Amount (৳)</th>
                                    <th className="py-2.5 px-2.5 border-r border-slate-300 text-center w-24">Due Students</th>
                                    <th className="py-2.5 px-2.5 text-center w-28">Collection Rate</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-800">
                                {months.map((item) => (
                                    <tr key={item.month} className="border-b border-slate-300 even:bg-slate-50/50 hover:bg-slate-100/70 transition text-[11px]">
                                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold inline-flex items-center justify-center shrink-0 border border-slate-300">
                                                {item.short_name}
                                            </span>
                                            <span>{item.month_name}</span>
                                        </td>
                                        <td className="py-2 px-2.5 border-r border-slate-200 text-right font-mono">
                                            ৳{formatCurrency(item.total_amount)}
                                        </td>
                                        <td className="py-2 px-2.5 border-r border-slate-200 text-right font-mono text-amber-700">
                                            {item.discount_amount > 0 ? `৳${formatCurrency(item.discount_amount)}` : '-'}
                                        </td>
                                        <td className="py-2 px-2.5 border-r border-slate-200 text-right font-mono text-emerald-700 font-semibold">
                                            ৳{formatCurrency(item.paid_amount)}
                                        </td>
                                        <td className="py-2 px-2.5 border-r border-slate-200 text-right font-mono text-rose-700 font-bold">
                                            <div className="inline-flex items-center justify-end gap-2">
                                                {item.total_amount > 0 && (
                                                    <CircularProgressBar
                                                        percent={item.due_rate}
                                                        size={22}
                                                        stroke={2.5}
                                                        color={item.due_rate > 50 ? '#e11d48' : '#d97706'}
                                                        trackColor="#f1f5f9"
                                                        showText={true}
                                                    />
                                                )}
                                                <span>৳{formatCurrency(item.due_amount)}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2.5 border-r border-slate-200 text-center font-mono font-medium">
                                            {item.student_count > 0 ? (
                                                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">
                                                    {item.student_count}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">0</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-2.5 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                <CircularProgressBar
                                                    percent={item.collection_rate}
                                                    size={24}
                                                    stroke={2.8}
                                                    color="#10b981"
                                                    trackColor="#e2e8f0"
                                                    showText={true}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* One-Time / Admission Fees Row if present */}
                                {nonMonthly && nonMonthly.total_amount > 0 && (
                                    <tr className="bg-amber-50/40 text-[11px] font-medium border-t border-amber-200">
                                        <td className="py-2 px-3 border-r border-amber-100 text-amber-900 font-bold">
                                            One-time / Admission Fees
                                        </td>
                                        <td className="py-1.5 px-2.5 border-r border-amber-100 text-right font-mono">
                                            ৳{formatCurrency(nonMonthly.total_amount)}
                                        </td>
                                        <td className="py-1.5 px-2.5 border-r border-amber-100 text-right font-mono text-amber-700">
                                            {nonMonthly.discount_amount > 0 ? `৳${formatCurrency(nonMonthly.discount_amount)}` : '-'}
                                        </td>
                                        <td className="py-1.5 px-2.5 border-r border-amber-100 text-right font-mono text-emerald-700 font-semibold">
                                            ৳{formatCurrency(nonMonthly.paid_amount)}
                                        </td>
                                        <td className="py-1.5 px-2.5 border-r border-amber-100 text-right font-mono text-rose-700 font-bold">
                                            <div className="inline-flex items-center justify-end gap-2">
                                                <CircularProgressBar
                                                    percent={nonMonthly.due_rate}
                                                    size={22}
                                                    stroke={2.5}
                                                    color={nonMonthly.due_rate > 50 ? '#e11d48' : '#d97706'}
                                                    trackColor="#fef3c7"
                                                    showText={true}
                                                />
                                                <span>৳{formatCurrency(nonMonthly.due_amount)}</span>
                                            </div>
                                        </td>
                                        <td className="py-1.5 px-2.5 border-r border-amber-100 text-center font-mono">
                                            {nonMonthly.student_count}
                                        </td>
                                        <td className="py-1.5 px-2.5 text-center">
                                            <CircularProgressBar
                                                percent={nonMonthly.collection_rate}
                                                size={24}
                                                stroke={2.8}
                                                color="#10b981"
                                                trackColor="#e2e8f0"
                                                showText={true}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                                    <td className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-right border-r border-slate-300">
                                        Annual Total ({academicYear?.name})
                                    </td>
                                    <td className="py-2 px-2.5 text-right font-mono text-[11px] border-r border-slate-300">
                                        ৳{formatCurrency(totalBilled)}
                                    </td>
                                    <td className="py-2 px-2.5 text-right font-mono text-amber-700 text-[11px] border-r border-slate-300">
                                        {totalDiscount > 0 ? `৳${formatCurrency(totalDiscount)}` : '-'}
                                    </td>
                                    <td className="py-2 px-2.5 text-right font-mono text-emerald-700 text-[11px] border-r border-slate-300">
                                        ৳{formatCurrency(totalPaid)}
                                    </td>
                                    <td className="py-2 px-2.5 text-right font-mono text-rose-700 text-[11px] border-r border-slate-300">
                                        <div className="inline-flex items-center justify-end gap-2">
                                            <CircularProgressBar
                                                percent={overallDueRate}
                                                size={24}
                                                stroke={2.5}
                                                color="#e11d48"
                                                trackColor="#f1f5f9"
                                                showText={true}
                                            />
                                            <span>৳{formatCurrency(totalDue)}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-2.5 text-center font-mono text-[11px] border-r border-slate-300">
                                        {summary.uniqueStudents}
                                    </td>
                                    <td className="py-2 px-2.5 text-center">
                                        <CircularProgressBar
                                            percent={paidPercent}
                                            size={26}
                                            stroke={3}
                                            color="#059669"
                                            trackColor="#d1fae5"
                                            showText={true}
                                        />
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const monthDataFor = (student: StudentReportItem, monthNum: number): StudentMonthData | undefined => {
        const months = student.months as Record<string | number, StudentMonthData> | undefined;
        return months?.[monthNum] ?? months?.[String(monthNum)];
    };

    const renderFeeChip = (f: MonthFeeDetail, student: StudentReportItem, monthNum?: number) => {
        const isPaid = f.status === 'paid';
        const isPartial = f.status === 'partial';
        const collectHref = monthNum
            ? `/fee-collections/create?student_id=${student.student_id}&month=${monthNum}&fee_id=${f.id}`
            : `/fee-collections/create?student_id=${student.student_id}&fee_id=${f.id}`;

        return (
            <div
                className={`rounded p-1 text-[9px] leading-tight border transition ${
                    isPaid
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : isPartial
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
            >
                <p className="text-[7.5px] font-bold uppercase tracking-wide truncate text-slate-600" title={f.fee_type}>
                    {f.fee_type}
                </p>
                <div className="flex items-center justify-between font-mono font-bold">
                    {isPaid ? (
                        <span className="text-emerald-700">৳{formatCurrency(f.paid_amount)}</span>
                    ) : isPartial ? (
                        <span className="text-amber-700">P:৳{formatCurrency(f.paid_amount)} D:৳{formatCurrency(f.due_amount)}</span>
                    ) : (
                        <span className="text-rose-700">৳{formatCurrency(f.due_amount)}</span>
                    )}

                    {isPaid ? (
                        <span className="text-[8px] font-bold uppercase px-1 rounded bg-emerald-100 text-emerald-800">
                            Paid
                        </span>
                    ) : isPartial ? (
                        <span className="text-[8px] font-bold uppercase px-1 rounded bg-amber-100 text-amber-800">
                            Part
                        </span>
                    ) : (
                        <span className="text-[8px] font-bold uppercase px-1 rounded bg-rose-100 text-rose-800">
                            Due
                        </span>
                    )}
                </div>

                {isPaid && f.receipt_number && (
                    <a
                        href={`/fee-collections/${f.id}/receipt?autoprint=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[8px] font-mono text-emerald-800 hover:text-emerald-950 font-bold mt-1 truncate flex items-center justify-between gap-0.5 bg-emerald-100/90 hover:bg-emerald-200 px-1 py-0.5 rounded transition cursor-pointer"
                        title={`Click to Print Receipt #${formatReceiptNumber(f.receipt_number)}`}
                    >
                        <span className="flex items-center gap-0.5 truncate">
                            <Receipt className="w-2.5 h-2.5 shrink-0 text-emerald-700" />
                            <span>#{formatReceiptNumber(f.receipt_number)}</span>
                        </span>
                        <Printer className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                    </a>
                )}

                {!isPaid && !isPartial && (
                    <a
                        href={collectHref}
                        className="text-[8px] font-bold text-rose-700 hover:text-white mt-1 flex items-center justify-between gap-0.5 bg-rose-100/80 hover:bg-rose-600 px-1 py-0.5 rounded transition cursor-pointer group"
                        title={`Click to collect ${f.fee_type} for ${student.student_name}`}
                    >
                        <span>Collect Fee</span>
                        <ArrowRight className="w-2.5 h-2.5 shrink-0 text-rose-600 group-hover:text-white" />
                    </a>
                )}

                {isPartial && (
                    <div className="space-y-0.5 mt-1">
                        {f.receipt_number && (
                            <a
                                href={`/fee-collections/${f.id}/receipt?autoprint=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[7.5px] font-mono text-amber-800 hover:text-amber-950 font-bold truncate flex items-center justify-between gap-0.5 bg-amber-100 hover:bg-amber-200 px-1 py-0.5 rounded transition cursor-pointer"
                                title={`Click to Print Receipt #${formatReceiptNumber(f.receipt_number)}`}
                            >
                                <span className="flex items-center gap-0.5 truncate">
                                    <Receipt className="w-2 h-2 shrink-0 text-amber-700" />
                                    <span>#{formatReceiptNumber(f.receipt_number)}</span>
                                </span>
                                <Printer className="w-2 h-2 shrink-0 text-amber-600" />
                            </a>
                        )}
                        <a
                            href={collectHref}
                            className="text-[7.5px] font-bold text-amber-800 hover:text-white flex items-center justify-between gap-0.5 bg-amber-200/80 hover:bg-amber-600 px-1 py-0.5 rounded transition cursor-pointer group"
                            title={`Click to collect remaining ${f.fee_type}`}
                        >
                            <span>Collect Due</span>
                            <ArrowRight className="w-2.5 h-2.5 shrink-0 text-amber-700 group-hover:text-white" />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    /* ----------------------------------------------------
       2. REUSABLE 12-MONTH STUDENT MATRIX COMPONENT
    ---------------------------------------------------- */
    const renderStudentMatrixTable = (studentsList: StudentReportItem[]) => {
        const displayMonths = activeMonths && activeMonths.length > 0 ? activeMonths : MONTH_NAMES;
        const showOtherFeesColumn = studentsList.some((s) => (s.one_time_fees?.length ?? 0) > 0);

        const filteredRows = tableSearch.trim()
            ? studentsList.filter((s) => {
                const q = tableSearch.toLowerCase().trim();
                return (
                    s.student_name.toLowerCase().includes(q) ||
                    s.roll_number.toLowerCase().includes(q) ||
                    s.student_id_number.toLowerCase().includes(q) ||
                    (s.phone && s.phone.includes(q))
                );
            })
            : studentsList;

        return (
            <div className="border-2 border-slate-300 rounded-lg shadow-xs bg-white overflow-hidden">
                {studentsList.length > 1 && (
                    <div className="px-3 py-2 bg-slate-100/90 border-b-2 border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 no-print">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Quick search on table (Name, Roll, ID)..."
                                value={tableSearch}
                                onChange={(e) => setTableSearch(e.target.value)}
                                className="w-full text-xs pl-8 pr-7 py-1 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500"
                            />
                            {tableSearch && (
                                <button
                                    type="button"
                                    onClick={() => setTableSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <span className="text-[11px] text-slate-600 font-mono">
                            Showing <strong className="text-slate-900">{filteredRows.length}</strong> of {studentsList.length} students
                        </span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className={`w-full text-left text-xs border-collapse ${displayMonths.length <= 3 ? 'min-w-[750px]' : 'min-w-[1250px]'}`}>
                        <thead>
                            <tr className="bg-slate-200 text-slate-800 font-bold text-[10.5px] uppercase tracking-wider border-b-2 border-slate-400">
                                <th className="py-2.5 px-2.5 border-r border-slate-300 w-14 text-center">Roll</th>
                                <th className="py-2.5 px-3 border-r border-slate-300 w-36">Student Name & ID</th>
                                {displayMonths.map((m) => (
                                    <th key={m.num} className="py-2.5 px-1.5 border-r border-slate-300 text-center min-w-[90px]">
                                        {m.name}
                                    </th>
                                ))}
                                {showOtherFeesColumn && (
                                    <th className="py-2.5 px-1.5 border-r border-slate-300 text-center min-w-[110px] text-amber-800">
                                        Other Fees
                                    </th>
                                )}
                                <th className="py-2.5 px-3 text-right w-28 text-rose-700">Total Due</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-800">
                            {filteredRows.map((student) => {
                            const studentDueRate = student.total_amount > 0
                                ? (student.due_amount / student.total_amount) * 100
                                : 0;

                            return (
                                <tr
                                    key={student.student_id}
                                    className="border-b-2 border-slate-300 even:bg-slate-50/60 hover:bg-indigo-50/40 transition"
                                >
                                    {/* Roll & Section */}
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center font-mono text-[11px] text-slate-700 font-bold bg-slate-100/50">
                                        {student.roll_number || '-'}
                                        <div className="text-[9px] font-normal text-slate-500 font-sans">
                                            Sec: {student.section || '-'}
                                        </div>
                                    </td>

                                    {/* Student Name */}
                                    <td className="py-2.5 px-3 border-r border-slate-200">
                                        <div className="font-bold text-slate-900 text-[11.5px] leading-tight">
                                            {student.student_name}
                                        </div>
                                        <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                                            {student.student_id_number}
                                        </div>
                                        {student.phone && student.phone !== '-' && (
                                            <div className="text-[9px] text-slate-400 mt-0.5">
                                                Ph: {student.phone}
                                            </div>
                                        )}
                                    </td>

                                    {/* Month Cells */}
                                    {displayMonths.map((m) => {
                                        const mData = monthDataFor(student, m.num);

                                        if (!mData || !mData.has_fees) {
                                            return (
                                                <td key={m.num} className="py-2 px-1 border-r border-slate-200 text-center text-slate-300 font-mono text-[10px]">
                                                    <a
                                                        href={`/fee-collections/create?student_id=${student.student_id}&month=${m.num}`}
                                                        className="block text-slate-300 hover:text-indigo-600 hover:bg-indigo-50/80 rounded py-2 transition cursor-pointer"
                                                        title={`Collect advance fee for ${m.name} (${student.student_name})`}
                                                    >
                                                        -
                                                    </a>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={m.num} className="py-2 px-1 border-r border-slate-200 align-top">
                                                <div className="space-y-1">
                                                    {mData.fees.map((f) => (
                                                        <div key={f.id}>{renderFeeChip(f, student, m.num)}</div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {showOtherFeesColumn && (
                                        <td className="py-2 px-1 border-r border-slate-200 align-top bg-amber-50/30">
                                            {(student.one_time_fees?.length ?? 0) > 0 ? (
                                                <div className="space-y-1">
                                                    {student.one_time_fees!.map((f) => (
                                                        <div key={f.id}>{renderFeeChip(f, student)}</div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-300 font-mono text-[10px] py-2">-</div>
                                            )}
                                        </td>
                                    )}

                                    {/* Student Total Due Column */}
                                    <td className="py-2 px-2.5 text-right font-mono text-rose-700 font-bold bg-rose-50/20">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-xs">৳{formatCurrency(student.due_amount)}</span>
                                            {student.total_amount > 0 && (
                                                <CircularProgressBar
                                                    percent={studentDueRate}
                                                    size={22}
                                                    stroke={2.4}
                                                    color={studentDueRate > 50 ? '#e11d48' : '#d97706'}
                                                    trackColor="#f1f5f9"
                                                    showText={true}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            </div>
        );
    };

    const renderPrintStudentTable = (studentsList: StudentReportItem[]) => {
        const displayMonths = activeMonths && activeMonths.length > 0 ? activeMonths : MONTH_NAMES;
        const showOther = studentsList.some((s) => (s.one_time_fees?.length ?? 0) > 0);

        return (
            <table className="w-full border-collapse border border-black text-[7.5px]">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-black p-0.5 text-center w-8">Roll</th>
                        <th className="border border-black p-0.5 text-left w-28">Name & ID</th>
                        {displayMonths.map((m) => (
                            <th key={m.num} className="border border-black p-0.5 text-center">
                                {m.name}
                            </th>
                        ))}
                        {showOther && (
                            <th className="border border-black p-0.5 text-center">Other</th>
                        )}
                        <th className="border border-black p-0.5 text-right w-16">Due</th>
                    </tr>
                </thead>
                <tbody>
                    {studentsList.map((st) => (
                        <tr key={st.student_id}>
                            <td className="border border-black p-0.5 text-center font-mono">{st.roll_number}</td>
                            <td className="border border-black p-0.5 truncate">{st.student_name}</td>
                            {displayMonths.map((m) => {
                                const mData = monthDataFor(st, m.num);
                                return (
                                    <td key={m.num} className="border border-black p-0.5 text-center font-mono">
                                        {mData && mData.has_fees ? (
                                            mData.month_due > 0 ? (
                                                <span className="font-bold">D:{mData.month_due}</span>
                                            ) : (
                                                <span>P:{mData.month_paid}</span>
                                            )
                                        ) : '-'}
                                    </td>
                                );
                            })}
                            {showOther && (
                                <td className="border border-black p-0.5 text-center font-mono">
                                    {(st.one_time_fees ?? []).length > 0
                                        ? (st.one_time_fees ?? []).map((f) => (
                                            <div key={f.id}>
                                                {f.fee_type} {f.due_amount > 0 ? `D:${f.due_amount}` : `P:${f.paid_amount}`}
                                            </div>
                                        ))
                                        : '-'}
                                </td>
                            )}
                            <td className="border border-black p-0.5 text-right font-mono font-bold">
                                ৳{formatCurrency(st.due_amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    /* ----------------------------------------------------
       3. SCREEN: CLASS-WISE REPORT
    ---------------------------------------------------- */
    const renderClassWiseReport = () => {
        if (!Array.isArray(reportData)) {
            return (
                <div className="text-center py-8 text-slate-500 text-xs">
                    No class fee records found for the selected criteria
                </div>
            );
        }
        const data = reportData as ClassDueReportItem[];

        return (
            <div className="space-y-6">
                {data.length > 0 ? (
                    data.map((classData, classIdx) => {
                        const classDueRate = classData.total_gross > 0
                            ? (classData.total_remaining / classData.total_gross) * 100
                            : 0;

                        return (
                            <div key={classIdx} className="space-y-2">
                                {/* Class Header Strip */}
                                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <h3 className="font-bold text-xs text-slate-900">
                                            Class: {classData.class_name}
                                        </h3>
                                        <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                                            {classData.student_count} Enrolled ({classData.due_student_count} with due)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] font-mono">
                                        <span className="text-slate-600">Total Billed: ৳{formatCurrency(classData.total_gross)}</span>
                                        <span className="text-emerald-700 font-semibold">Paid: ৳{formatCurrency(classData.total_paid)}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-rose-700 font-bold">Due: ৳{formatCurrency(classData.total_remaining)}</span>
                                            <CircularProgressBar
                                                percent={classDueRate}
                                                size={22}
                                                stroke={2.4}
                                                color="#e11d48"
                                                trackColor="#fecdd3"
                                                showText={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Matrix Table for this Class */}
                                {renderStudentMatrixTable(classData.students)}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                        No class records found for the selected session
                    </div>
                )}
            </div>
        );
    };

    /* ----------------------------------------------------
       4. SCREEN: STUDENT-WISE REPORT
    ---------------------------------------------------- */
    const renderStudentWiseReport = () => {
        if (!Array.isArray(reportData)) {
            return (
                <div className="text-center py-8 text-slate-500 text-xs">
                    No student fee records found for the selected criteria
                </div>
            );
        }
        const data = reportData as StudentReportItem[];

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        Student-Wise 12-Month Due Ledger ({data.length} Students Listed)
                    </h3>
                </div>

                {data.length > 0 ? (
                    renderStudentMatrixTable(data)
                ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                        No student due records found for the selected filter
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Due Report - ${academicYear?.name || ''} - ${effectiveSchoolName}`} />

            {/* SCREEN VIEW */}
            <div className="space-y-3 pb-8 no-print">
                {/* 1. Header Bar */}
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                            <span>Outstanding Due Report</span>
                            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                                Financial Ledger
                            </span>
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Academic Session: <span className="font-bold text-slate-800">{academicYear?.name || 'Current'}</span>
                            {academicYear?.is_current && <span className="ml-1 text-emerald-600 font-semibold">(Active Year)</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full sm:w-auto justify-center px-3.5 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 shrink-0" />
                            Print Report
                        </button>
                    </div>
                </div>

                {/* 2. Compact Filter & Report Type Card */}
                <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs space-y-2.5">
                    {/* Segmented View Pills */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase text-slate-500 mr-1 hidden sm:inline">View Type:</span>
                            {[
                                { id: 'organization', label: 'Organization (12 Months)', icon: Building2 },
                                { id: 'class', label: 'Class-Wise (12 Months)', icon: GraduationCap },
                                { id: 'student', label: 'Student-Wise (12 Months)', icon: Users },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const isActive = reportType === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => handleReportTypeChange(tab.id)}
                                        className={`flex-1 sm:flex-none justify-center px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-2.5 py-1 text-[11px] rounded text-slate-600 hover:bg-slate-100 font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                                <RotateCcw className="w-3 h-3 shrink-0 text-slate-400" />
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Filter Inputs Grid: Driven by Academic Year & Months */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                        {/* Financial / Academic Year Dropdown */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Financial Year
                            </label>
                            <select
                                value={selectedAcademicYearId}
                                onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                            >
                                {academicYears.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.name} {year.is_current ? '• Current Year' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* From Month Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                From Month
                            </label>
                            <select
                                value={selectedMonthFrom}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedMonthFrom(val);
                                    if (val && (!selectedMonthTo || parseInt(selectedMonthTo) < parseInt(val))) {
                                        setSelectedMonthTo(val);
                                    }
                                    if (!val) {
                                        setSelectedMonthTo('');
                                    }
                                }}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All (Jan - Dec)</option>
                                {(allMonthOptions || MONTH_NAMES.map(m => ({ num: m.num, name: m.name, full_name: m.name }))).map((m) => (
                                    <option key={m.num} value={m.num}>
                                        {m.full_name || m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* To Month Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                To Month
                            </label>
                            <select
                                value={selectedMonthTo}
                                onChange={(e) => setSelectedMonthTo(e.target.value)}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Same as From / All</option>
                                {(allMonthOptions || MONTH_NAMES.map(m => ({ num: m.num, name: m.name, full_name: m.name }))).map((m) => (
                                    <option key={m.num} value={m.num}>
                                        {m.full_name || m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Class Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Class Filter
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                }}
                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search & Select Student Combobox */}
                        <div className="relative">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Search Student
                            </label>

                            {selectedStudent ? (
                                <div className="flex items-center justify-between gap-1 py-1 px-2 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs min-h-[30px]">
                                    <div className="truncate flex items-center gap-1 min-w-0">
                                        <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                        <span className="font-bold truncate text-[11px]">
                                            {selectedStudentObj?.name || `ID #${selectedStudent}`}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearSelectedStudent}
                                        className="text-indigo-400 hover:text-indigo-800 p-0.5 rounded transition cursor-pointer shrink-0"
                                        title="Clear student filter"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Name, roll, ID..."
                                        value={studentSearchTerm}
                                        onChange={(e) => {
                                            setStudentSearchTerm(e.target.value);
                                            setIsStudentDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsStudentDropdownOpen(true)}
                                        className="w-full text-xs pl-7 pr-6 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {studentSearchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentSearchTerm('');
                                                setIsStudentDropdownOpen(false);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}

                                    {/* Dropdown Results Popover */}
                                    {isStudentDropdownOpen && (
                                        <div
                                            ref={studentDropdownRef}
                                            className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg bg-white border-2 border-slate-300 shadow-xl py-1 text-xs"
                                        >
                                            {filteredStudentList.length > 0 ? (
                                                filteredStudentList.map((st) => (
                                                    <button
                                                        key={st.id}
                                                        type="button"
                                                        onClick={() => handleSelectStudentFromSearch(st)}
                                                        className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 transition flex items-center justify-between gap-1.5 border-b border-slate-100 last:border-0 cursor-pointer"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-900 truncate text-[11px]">{st.name}</p>
                                                            <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                                                                Roll: {st.roll_number || '-'} • {st.class_name} • {st.student_id}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="w-3 h-3 text-indigo-600 shrink-0" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-3 text-center text-slate-400 text-xs">
                                                    No matching students found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleFilter}
                                className="w-full py-1.5 px-3 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white transition inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <Filter className="w-3.5 h-3.5 shrink-0" />
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Executive Annual KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {/* Card 1: Students with Due */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Students</p>
                            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                                {summary.uniqueStudents ?? 0}
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                                In Session {academicYear?.name}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 border border-blue-100 inline-flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 shrink-0" />
                        </div>
                    </div>

                    {/* Card 2: Total Billed */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Yearly Billed</p>
                            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                                ৳{formatCurrency(summary.totalDue)}
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                                Gross 12 Months
                            </span>
                        </div>
                        <CircularProgressBar
                            percent={100}
                            size={36}
                            stroke={3.2}
                            color="#64748b"
                            trackColor="#e2e8f0"
                            showText={true}
                        />
                    </div>

                    {/* Card 3: Discount / Waivers */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Discounts</p>
                            <p className="text-base font-bold text-amber-800 font-mono mt-0.5">
                                ৳{formatCurrency(summary.totalDiscount ?? 0)}
                            </p>
                            <span className="text-[10px] text-amber-700 font-medium block">
                                Total Concessions
                            </span>
                        </div>
                        <CircularProgressBar
                            percent={discountPercent}
                            size={36}
                            stroke={3.2}
                            color="#d97706"
                            trackColor="#fef3c7"
                            showText={true}
                        />
                    </div>

                    {/* Card 4: Paid Amount (Collected) */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Yearly Collected</p>
                            <p className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                                ৳{formatCurrency(summary.totalPaid)}
                            </p>
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                                Collection Rate
                            </span>
                        </div>
                        <CircularProgressBar
                            percent={paidPercent}
                            size={36}
                            stroke={3.2}
                            color="#059669"
                            trackColor="#d1fae5"
                            showText={true}
                        />
                    </div>

                    {/* Card 5: Outstanding Due */}
                    <div className="bg-white rounded-lg p-2.5 border border-rose-200 shadow-xs flex items-center justify-between bg-rose-50/20">
                        <div>
                            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Outstanding Due</p>
                            <p className="text-base font-bold text-rose-700 font-mono mt-0.5">
                                ৳{formatCurrency(summary.totalRemaining)}
                            </p>
                            <span className="text-[10px] text-rose-700 font-bold block">
                                Uncollected Balance
                            </span>
                        </div>
                        <CircularProgressBar
                            percent={duePercent}
                            size={36}
                            stroke={3.2}
                            color="#e11d48"
                            trackColor="#fecdd3"
                            showText={true}
                        />
                    </div>
                </div>

                {/* 4. Main Report Data Presentation */}
                <div className="bg-white rounded-lg shadow-xs border border-slate-200 p-3">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                                {getReportTitle()}
                            </h2>
                            <p className="text-[10.5px] text-slate-500">
                                12 Months Financial Performance Ledger
                            </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            Currency: BDT (৳)
                        </span>
                    </div>

                    {reportType === 'organization' && renderOrganizationMonthlyReport()}
                    {reportType === 'class' && renderClassWiseReport()}
                    {reportType === 'student' && renderStudentWiseReport()}
                </div>
            </div>

            {/* PRINT VIEW (Clean, International Standard - Admin layout 100% stripped) */}
            <div className="due-report-print-sheet text-[10px] font-sans text-black">
                {/* Print Header */}
                <div className="text-center pb-2 mb-3 border-b-2 border-black">
                    <h1 className="text-base font-bold uppercase tracking-wide">{effectiveSchoolName}</h1>
                    {effectiveSchoolAddress && <p className="text-[9px] mb-0.5 text-gray-700">{effectiveSchoolAddress}</p>}
                    <h2 className="text-xs font-bold uppercase tracking-wider mt-1">{getReportTitle()}</h2>
                    <p className="text-[9px] font-medium text-gray-600">
                        Financial Session: {academicYear?.name} | Generated: {new Date().toLocaleDateString('en-GB')}
                    </p>
                </div>

                {/* Print KPI Summary Strip */}
                <div className="grid grid-cols-5 gap-1 mb-3 border border-black p-1.5 text-center text-[9px]">
                    <div>
                        <span className="block text-gray-600">Students with Due</span>
                        <b className="font-mono">{summary.uniqueStudents ?? 0}</b>
                    </div>
                    <div>
                        <span className="block text-gray-600">Yearly Billed</span>
                        <b className="font-mono">৳{formatCurrency(summary.totalDue)}</b>
                    </div>
                    <div>
                        <span className="block text-gray-600">Discount</span>
                        <b className="font-mono">৳{formatCurrency(summary.totalDiscount ?? 0)}</b>
                    </div>
                    <div>
                        <span className="block text-gray-600">Collected ({paidPercent.toFixed(0)}%)</span>
                        <b className="font-mono">৳{formatCurrency(summary.totalPaid)}</b>
                    </div>
                    <div>
                        <span className="block text-gray-600">Outstanding Due ({duePercent.toFixed(0)}%)</span>
                        <b className="font-mono font-bold">৳{formatCurrency(summary.totalRemaining)}</b>
                    </div>
                </div>

                {/* PRINT TAB 1: ORGANIZATION 12 MONTHS SUMMARY */}
                {reportType === 'organization' && !Array.isArray(reportData) && (
                    <table className="w-full border-collapse border border-black text-[9px] mb-4">
                        <thead>
                            <tr className="bg-gray-100 font-bold">
                                <th className="border border-black p-1 text-left">Month</th>
                                <th className="border border-black p-1 text-right">Billed (৳)</th>
                                <th className="border border-black p-1 text-right">Discount</th>
                                <th className="border border-black p-1 text-right">Collected (৳)</th>
                                <th className="border border-black p-1 text-right">Due Amount (৳)</th>
                                <th className="border border-black p-1 text-center">Due Students</th>
                                <th className="border border-black p-1 text-center">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {((reportData as OrganizationReportData)?.monthly || []).map((item) => (
                                <tr key={item.month}>
                                    <td className="border border-black p-1 font-bold">{item.month_name}</td>
                                    <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(item.total_amount)}</td>
                                    <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(item.discount_amount)}</td>
                                    <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(item.paid_amount)}</td>
                                    <td className="border border-black p-1 text-right font-mono font-bold">৳{formatCurrency(item.due_amount)}</td>
                                    <td className="border border-black p-1 text-center font-mono">{item.student_count}</td>
                                    <td className="border border-black p-1 text-center font-mono">{item.collection_rate}%</td>
                                </tr>
                            ))}
                            {((reportData as OrganizationReportData)?.nonMonthly?.total_amount || 0) > 0 && (
                                <tr>
                                    <td className="border border-black p-1 font-bold">One-time / Admission Fees</td>
                                    <td className="border border-black p-1 text-right font-mono">৳{formatCurrency((reportData as OrganizationReportData).nonMonthly.total_amount)}</td>
                                    <td className="border border-black p-1 text-right font-mono">৳{formatCurrency((reportData as OrganizationReportData).nonMonthly.discount_amount)}</td>
                                    <td className="border border-black p-1 text-right font-mono">৳{formatCurrency((reportData as OrganizationReportData).nonMonthly.paid_amount)}</td>
                                    <td className="border border-black p-1 text-right font-mono font-bold">৳{formatCurrency((reportData as OrganizationReportData).nonMonthly.due_amount)}</td>
                                    <td className="border border-black p-1 text-center font-mono">{(reportData as OrganizationReportData).nonMonthly.student_count}</td>
                                    <td className="border border-black p-1 text-center font-mono">{(reportData as OrganizationReportData).nonMonthly.collection_rate}%</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 font-bold border-t-2 border-black">
                                <td className="border border-black p-1 text-right uppercase">Annual Total</td>
                                <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(summary.totalDue)}</td>
                                <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(summary.totalDiscount)}</td>
                                <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(summary.totalPaid)}</td>
                                <td className="border border-black p-1 text-right font-mono">৳{formatCurrency(summary.totalRemaining)}</td>
                                <td className="border border-black p-1 text-center font-mono">{summary.uniqueStudents}</td>
                                <td className="border border-black p-1 text-center font-mono">{paidPercent.toFixed(0)}%</td>
                            </tr>
                        </tfoot>
                    </table>
                )}

                {/* PRINT TAB 2 & 3: CLASS & STUDENT PRINT MATRIX */}
                {reportType !== 'organization' && (
                    <div className="text-[8px]">
                        {reportType === 'class' && Array.isArray(reportData) && (reportData as ClassDueReportItem[]).map((cls, cIdx) => (
                            <div key={cIdx} className="mb-4 page-break-inside-avoid">
                                <div className="border border-black bg-gray-100 p-1 font-bold text-[9px] flex justify-between">
                                    <span>Class: {cls.class_name} ({cls.student_count} students)</span>
                                    <span>Total Due: ৳{formatCurrency(cls.total_remaining)}</span>
                                </div>
                                {renderPrintStudentTable(cls.students)}
                            </div>
                        ))}
                        {reportType === 'student' && Array.isArray(reportData) && (
                            <div className="mb-4">
                                {renderPrintStudentTable(reportData as StudentReportItem[])}
                            </div>
                        )}
                    </div>
                )}

                {/* Print Signatures */}
                <div className="pt-8 mt-6 flex justify-between items-end text-[9px] page-break-inside-avoid">
                    <div className="text-center">
                        <div className="w-24 border-t border-black mb-0.5"></div>
                        <span>Prepared By</span>
                    </div>
                    <div className="text-center">
                        <div className="w-24 border-t border-black mb-0.5"></div>
                        <span>Accountant</span>
                    </div>
                    <div className="text-center">
                        <div className="w-24 border-t border-black mb-0.5"></div>
                        <span>Principal / Headmaster</span>
                    </div>
                </div>
            </div>

            {/* Strict Global Print Stylesheet */}
            <style>{`
                .due-report-print-sheet {
                    display: none;
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    .due-report-print-sheet,
                    .due-report-print-sheet * {
                        visibility: visible !important;
                        display: revert;
                    }

                    .due-report-print-sheet {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                    }

                    aside,
                    nav,
                    header,
                    .sidebar,
                    [class*="sidebar"],
                    [class*="Sidebar"],
                    [class*="navbar"],
                    [class*="Navbar"],
                    .no-print {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                    }

                    body > div,
                    body > div > div,
                    body > div > div > div,
                    main,
                    [class*="main"],
                    [class*="Main"],
                    [class*="content"],
                    [class*="Content"] {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        position: static !important;
                        left: 0 !important;
                        top: 0 !important;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 8mm 8mm;
                    }

                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    table {
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
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
