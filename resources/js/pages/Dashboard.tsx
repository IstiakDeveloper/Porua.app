import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatReceiptNumber } from '@/lib/formatReceipt';
import { formatWhen } from '@/utils/datetime';
import { useInstitute } from '@/hooks/useInstitute';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Receipt,
    Wallet,
    Calendar,
    Clock,
    ArrowUpRight,
    AlertCircle,
    Printer,
    TrendingUp,
    Landmark,
    UserCheck,
    UserPlus,
    Megaphone,
    FileText,
    ChevronRight,
    ClipboardList,
    CalendarDays,
    BarChart3,
    CheckCircle2,
    Sparkles,
    BadgePercent,
} from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface KPIs {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_receivable?: number;
    total_billed: number;
    total_gross?: number;
    total_discount: number;
    total_net?: number;
    total_collected: number;
    total_due: number;
    collection_rate: number;
    discount_rate?: number;
    due_rate?: number;
    today_collection: number;
    this_month_collection: number;
    liquid_balance: number;
}

interface AttendanceData {
    date: string;
    formatted_date: string;
    is_today: boolean;
    student_present: number;
    student_absent: number;
    student_late: number;
    student_total: number;
    student_rate: number;
    teacher_present: number;
    teacher_absent: number;
    teacher_total: number;
    teacher_rate: number;
}

interface MonthlyTrend {
    month: number;
    name: string;
    gross?: number;
    discount?: number;
    billed: number;
    paid: number;
    due: number;
}

interface RecentCollection {
    id: number;
    short_receipt_number: string;
    receipt_number: string;
    student_name: string;
    student_id: string;
    class_name: string;
    fee_type: string;
    amount: number;
    payment_method: string;
    date: string | null;
}

interface ClassSnapshot {
    id: number;
    name: string;
    student_count: number;
    billed: number;
    discount?: number;
    net?: number;
    paid: number;
    due: number;
    collection_rate: number;
}

interface ExamItem {
    id: number;
    name: string;
    exam_type: string;
    start_date: string | null;
    end_date: string | null;
}

interface NoticeItem {
    id: number;
    title: string;
    published_at: string | null;
}

interface EventItem {
    id: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
    type?: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    roles: string[];
    avatar?: string;
}

interface DashboardProps {
    academicYear: AcademicYear | null;
    kpis: KPIs;
    attendance: AttendanceData;
    monthlyTrends: MonthlyTrend[];
    recentCollections: RecentCollection[];
    classesSnapshot: ClassSnapshot[];
    upcomingExams: ExamItem[];
    recentNotices: NoticeItem[];
    upcomingEvents: EventItem[];
    user: UserData;
}

function formatCurrency(val: number): string {
    return Math.round(val || 0).toLocaleString('en-IN');
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function CircularProgressBar({
    percent,
    size = 38,
    stroke = 3.5,
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
                    style={{ fontSize: size <= 28 ? '8.5px' : '10px' }}
                >
                    {Math.round(validPercent)}%
                </span>
            )}
        </div>
    );
}

export default function Dashboard({
    academicYear,
    kpis,
    attendance,
    monthlyTrends = [],
    recentCollections = [],
    classesSnapshot = [],
    upcomingExams = [],
    recentNotices = [],
    upcomingEvents = [],
    user,
}: DashboardProps) {
    const institute = useInstitute();
    const [bulletinTab, setBulletinTab] = useState<'notices' | 'exams' | 'events'>('notices');

    // Peak monthly value for chart scale
    const maxMonthlyBilled = Math.max(...monthlyTrends.map((m) => m.billed), 1000);

    return (
        <AuthenticatedLayout>
            <Head title={`Executive Dashboard - ${institute.name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. EXECUTIVE HEADER & REAL-TIME QUICK ACTION BAR */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                                <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Administrator'}</span>
                            </h1>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 uppercase tracking-wider">
                                {user?.roles?.[0] || 'Management'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                                <Calendar className="w-3 h-3" />
                                Session {academicYear?.name || 'Active'}
                            </span>
                        </div>
                    </div>

                    {/* Operational Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/fee-collections/create"
                            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <Receipt className="w-4 h-4 shrink-0" />
                            <span>Collect Fee (POS)</span>
                        </Link>
                        <Link
                            href="/teacher-attendance"
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5 border border-slate-200"
                        >
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                            <span>Attendance</span>
                        </Link>
                        <Link
                            href="/accounting/reports/due-report"
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5 border border-slate-200"
                        >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Due Report</span>
                        </Link>
                        <Link
                            href="/students/create"
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5 border border-slate-200"
                        >
                            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                            <span>New Student</span>
                        </Link>
                    </div>
                </div>

                {/* 2. INSTITUTIONAL OVERVIEW (STUDENTS, TEACHERS, BANK BALANCE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Card 1: Students */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group">
                        <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                                Total Students
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                                {kpis.total_students}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-slate-400" />
                                <span>Across {kpis.total_classes} Classes</span>
                            </p>
                        </div>
                        <Link
                            href="/students"
                            className="mt-3 text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between border-t border-slate-100 pt-2"
                        >
                            <span>Student Directory</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Card 2: Faculty & Staff */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition group">
                        <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                                Teachers & Faculty
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                                {kpis.total_teachers}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Active Teaching Staff</span>
                            </p>
                        </div>
                        <Link
                            href="/teachers"
                            className="mt-3 text-[10.5px] font-bold text-purple-600 hover:text-purple-800 flex items-center justify-between border-t border-slate-100 pt-2"
                        >
                            <span>Teacher Directory</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Card 3: Liquid Accounts Balance */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition group sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                                Bank & Cash Balance
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition">
                                <Landmark className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-black text-teal-800 font-mono tracking-tight">
                                ৳{formatCurrency(kpis.liquid_balance)}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Available in Active Accounts
                            </p>
                        </div>
                        <Link
                            href="/accounting/accounts"
                            className="mt-3 text-[10.5px] font-bold text-teal-700 hover:text-teal-900 flex items-center justify-between border-t border-slate-100 pt-2"
                        >
                            <span>View Accounts</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* 3. SESSION FINANCIAL METRICS (TOTAL RECEIVABLE, DISCOUNT, COLLECTION, DUE) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Session {academicYear?.name || 'Active'} Fee Overview</span>
                            </h2>
                            <span className="text-[11px] text-slate-500 font-normal">
                                (আদায়যোগ্য, ছাড়, আদায় ও বকেয়া)
                            </span>
                        </div>
                        <Link
                            href="/accounting/reports/due-report"
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                            <span>Full Due Report</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* 1. Total Receivable (Total আদায়যোগ্য) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block">
                                        Total Demand
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        মোট আদায়যোগ্য (Gross)
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <p className="text-xl font-black text-slate-900 font-mono tracking-tight">
                                    ৳{formatCurrency(kpis.total_receivable ?? kpis.total_billed)}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Net: ৳{formatCurrency(kpis.total_net ?? (kpis.total_billed - kpis.total_discount))} (After Discount)
                                </p>
                            </div>
                            <Link
                                href="/fee-collections"
                                className="mt-3 text-[10.5px] font-bold text-slate-600 hover:text-slate-900 flex items-center justify-between border-t border-slate-100 pt-2"
                            >
                                <span>Collection Ledger</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* 2. Total Discount (ছাড় / ওয়েভার) */}
                        <div className="bg-white rounded-xl border border-amber-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition group bg-amber-50/15">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider block">
                                        Discounts & Waivers
                                    </span>
                                    <span className="text-[10px] text-amber-600 font-medium">
                                        মোট ছাড় / ওয়েভার
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition">
                                    <BadgePercent className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xl font-black text-amber-800 font-mono tracking-tight">
                                        ৳{formatCurrency(kpis.total_discount)}
                                    </p>
                                    <p className="text-[11px] text-amber-700/90 mt-0.5 font-medium">
                                        {kpis.discount_rate ?? Math.round((kpis.total_discount / (kpis.total_billed || 1)) * 100)}% Fee Concession
                                    </p>
                                </div>
                                <CircularProgressBar
                                    percent={kpis.discount_rate ?? Math.round((kpis.total_discount / (kpis.total_billed || 1)) * 100)}
                                    size={36}
                                    stroke={3.2}
                                    color="#d97706"
                                    trackColor="#fef3c7"
                                    showText={true}
                                />
                            </div>
                            <Link
                                href="/accounting/reports/due-report"
                                className="mt-3 text-[10.5px] font-bold text-amber-700 hover:text-amber-900 flex items-center justify-between border-t border-amber-100 pt-2"
                            >
                                <span>Discount Details</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* 3. Fees Collected (মোট আদায়) */}
                        <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition group bg-emerald-50/15">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider block">
                                        Fees Collected
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-medium">
                                        মোট আদায় (Collection)
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xl font-black text-emerald-800 font-mono tracking-tight">
                                        ৳{formatCurrency(kpis.total_collected)}
                                    </p>
                                    <p className="text-[11px] text-emerald-700/90 mt-0.5 font-medium">
                                        {kpis.collection_rate}% Collected
                                    </p>
                                </div>
                                <CircularProgressBar
                                    percent={kpis.collection_rate}
                                    size={36}
                                    stroke={3.2}
                                    color="#059669"
                                    trackColor="#d1fae5"
                                    showText={true}
                                />
                            </div>
                            <Link
                                href="/fee-collections"
                                className="mt-3 text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center justify-between border-t border-emerald-100 pt-2"
                            >
                                <span>Collection Ledger</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* 4. Outstanding Due (মোট বকেয়া) */}
                        <div className="bg-white rounded-xl border border-rose-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition group bg-rose-50/15">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10.5px] font-bold text-rose-800 uppercase tracking-wider block">
                                        Outstanding Due
                                    </span>
                                    <span className="text-[10px] text-rose-600 font-medium">
                                        মোট বকেয়া (Due)
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xl font-black text-rose-800 font-mono tracking-tight">
                                        ৳{formatCurrency(kpis.total_due)}
                                    </p>
                                    <p className="text-[11px] text-rose-700/90 mt-0.5 font-medium">
                                        {kpis.due_rate ?? (100 - kpis.collection_rate)}% Uncollected
                                    </p>
                                </div>
                                <CircularProgressBar
                                    percent={kpis.due_rate ?? (100 - kpis.collection_rate)}
                                    size={36}
                                    stroke={3.2}
                                    color="#e11d48"
                                    trackColor="#ffe4e6"
                                    showText={true}
                                />
                            </div>
                            <Link
                                href="/accounting/reports/due-report"
                                className="mt-3 text-[10.5px] font-bold text-rose-700 hover:text-rose-800 flex items-center justify-between border-t border-rose-100 pt-2"
                            >
                                <span>12-Month Due Matrix</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. MIDDLE SECTION: 12-MONTH COLLECTION TREND & ATTENDANCE PULSE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left 2 Cols: 12-Month Session Financial Trend */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                                    <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Session {academicYear?.name} Monthly Collection Trend</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Monthly Billed vs Collected Fee Performance (January to December)
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-medium">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-200"></span>
                                    <span className="text-slate-600">Billed</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                                    <span className="text-emerald-700 font-bold">Collected</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Bar Graph */}
                        <div className="pt-4 pb-2">
                            <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2">
                                {monthlyTrends.map((m) => {
                                    const billedHeight = Math.max(Math.round((m.billed / maxMonthlyBilled) * 100), 4);
                                    const paidHeight = Math.max(Math.round((m.paid / maxMonthlyBilled) * 100), 4);

                                    return (
                                        <div
                                            key={m.month}
                                            className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                                        >
                                            {/* Hover Tooltip */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono">
                                                <span className="font-bold text-slate-200">{m.name} {academicYear?.name}</span>
                                                <span className="text-slate-300">Demand: ৳{formatCurrency(m.gross ?? m.billed)}</span>
                                                {Boolean(m.discount && m.discount > 0) && (
                                                    <span className="text-amber-300">Discount: ৳{formatCurrency(m.discount!)}</span>
                                                )}
                                                <span className="text-emerald-300 font-bold">Paid: ৳{formatCurrency(m.paid)}</span>
                                                <span className="text-rose-300">Due: ৳{formatCurrency(m.due)}</span>
                                            </div>

                                            {/* Bars Container */}
                                            <div className="w-full h-36 flex items-end justify-center gap-1 bg-slate-50/50 rounded-t p-0.5">
                                                {/* Billed Bar */}
                                                <div
                                                    className="w-1/2 bg-slate-200 group-hover:bg-slate-300 rounded-t transition-all duration-300"
                                                    style={{ height: `${billedHeight}%` }}
                                                />
                                                {/* Paid Bar */}
                                                <div
                                                    className="w-1/2 bg-emerald-500 group-hover:bg-emerald-600 rounded-t transition-all duration-300"
                                                    style={{ height: `${paidHeight}%` }}
                                                />
                                            </div>

                                            {/* Month Label */}
                                            <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">
                                                {m.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Highlights */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Today's Receipts</span>
                                <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                                    ৳{formatCurrency(kpis.today_collection)}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">This Month Receipts</span>
                                <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                                    ৳{formatCurrency(kpis.this_month_collection)}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 col-span-2 sm:col-span-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Annual Realization</span>
                                <p className="font-bold text-emerald-700 font-mono text-sm mt-0.5">
                                    {kpis.collection_rate}% Achieved
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Attendance Overview Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Attendance Overview</span>
                                </h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    attendance.is_today
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {attendance.is_today ? 'Today' : `Last: ${attendance.formatted_date}`}
                                </span>
                            </div>

                            {/* Students Attendance Meter */}
                            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Student Attendance</span>
                                    </span>
                                    <span className="font-mono text-xs font-bold text-slate-700">
                                        {attendance.student_present} / {attendance.student_total}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${attendance.student_rate}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-2">
                                    <span className="text-emerald-700 font-medium">Present: {attendance.student_present}</span>
                                    <span className="text-rose-600 font-medium">Absent: {attendance.student_absent}</span>
                                    <span className="font-bold text-indigo-700">{attendance.student_rate}%</span>
                                </div>
                            </div>

                            {/* Teachers Attendance Meter */}
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Teacher Attendance</span>
                                    </span>
                                    <span className="font-mono text-xs font-bold text-slate-700">
                                        {attendance.teacher_present} / {attendance.teacher_total}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${attendance.teacher_rate}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-2">
                                    <span className="text-emerald-700 font-medium">Present: {attendance.teacher_present}</span>
                                    <span className="text-rose-600 font-medium">Absent: {attendance.teacher_absent}</span>
                                    <span className="font-bold text-emerald-700">{attendance.teacher_rate}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                            <Link
                                href="/teacher-attendance"
                                className="flex-1 py-1.5 px-2.5 text-center text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                            >
                                Take Attendance
                            </Link>
                            <Link
                                href="/attendance/students"
                                className="flex-1 py-1.5 px-2.5 text-center text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                            >
                                Monthly Log
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4. OPERATIONS & ACTIVITY: LIVE COLLECTIONS & CLASS PERFORMANCE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left 2 Cols: Live Recent Collections Feed */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                                    <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Recent Live Fee Collections</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Real-time payment transactions with click-to-print receipts
                                </p>
                            </div>
                            <Link
                                href="/fee-collections"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                <span>View Ledger</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                        <th className="py-2 px-2">Receipt</th>
                                        <th className="py-2 px-2.5">Student & Class</th>
                                        <th className="py-2 px-2">Fee Type</th>
                                        <th className="py-2 px-2 text-right">Amount (৳)</th>
                                        <th className="py-2 px-2 text-center">Method</th>
                                        <th className="py-2 px-2 text-right">Date</th>
                                        <th className="py-2 px-1 text-center w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800">
                                    {recentCollections.length > 0 ? (
                                        recentCollections.map((rcp) => (
                                            <tr key={rcp.id} className="hover:bg-slate-50/70 transition">
                                                {/* Receipt */}
                                                <td className="py-2 px-2 font-mono font-bold text-emerald-700 text-[11px]">
                                                    <a
                                                        href={`/fee-collections/${rcp.id}/receipt?autoprint=1`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[10.5px] transition"
                                                        title="Click to print receipt"
                                                    >
                                                        <Receipt className="w-2.5 h-2.5" />
                                                        <span>#{formatReceiptNumber(rcp.receipt_number)}</span>
                                                    </a>
                                                </td>

                                                {/* Student & Class */}
                                                <td className="py-2 px-2.5">
                                                    <div className="font-bold text-slate-900 text-[11.5px] leading-tight">
                                                        {rcp.student_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        {rcp.class_name} • {rcp.student_id}
                                                    </div>
                                                </td>

                                                {/* Fee Type */}
                                                <td className="py-2 px-2 text-slate-600 text-[11px]">
                                                    {rcp.fee_type}
                                                </td>

                                                {/* Amount */}
                                                <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700 text-xs">
                                                    ৳{formatCurrency(rcp.amount)}
                                                </td>

                                                {/* Method */}
                                                <td className="py-2 px-2 text-center">
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                                                        {rcp.payment_method}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-2 px-2 text-right text-[10.5px] text-slate-500 font-mono">
                                                    {rcp.date || '-'}
                                                </td>

                                                {/* Action */}
                                                <td className="py-2 px-1 text-center">
                                                    <a
                                                        href={`/fee-collections/${rcp.id}/receipt?autoprint=1`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition inline-flex items-center justify-center"
                                                        title="Print A4 Receipt"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                                                No recent fee collection records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right 1 Col: Class Performance Snapshot */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                                    <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                                    <span>Class Collection Health</span>
                                </h3>
                                <Link
                                    href="/accounting/reports/due-report?report_type=class"
                                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
                                >
                                    <span>All Classes</span>
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100 mt-2">
                                {classesSnapshot.slice(0, 5).map((cls) => (
                                    <div key={cls.id} className="py-2.5">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-900">{cls.name}</span>
                                            <span className="font-mono text-emerald-700">
                                                ৳{formatCurrency(cls.paid)}
                                                <span className="text-slate-400 font-normal"> / ৳{formatCurrency(cls.billed)}</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    cls.collection_rate > 70
                                                        ? 'bg-emerald-500'
                                                        : cls.collection_rate > 40
                                                        ? 'bg-amber-500'
                                                        : 'bg-rose-500'
                                                }`}
                                                style={{ width: `${cls.collection_rate}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                            <span>{cls.student_count} Students</span>
                                            <span className="text-rose-600 font-medium">Due: ৳{formatCurrency(cls.due)}</span>
                                            <span className="font-bold text-slate-700">{cls.collection_rate}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100">
                            <Link
                                href="/fee-collections/create"
                                className="w-full py-1.5 px-3 text-center text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition block cursor-pointer"
                            >
                                Open Fee Collection Counter ➔
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 5. BULLETIN BOARD: NOTICES, EXAMS & EVENTS */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setBulletinTab('notices')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                                    bulletinTab === 'notices'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                                <span>Recent Notices ({recentNotices.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setBulletinTab('exams')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                                    bulletinTab === 'exams'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Upcoming Exams ({upcomingExams.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setBulletinTab('events')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                                    bulletinTab === 'events'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Upcoming Events ({upcomingEvents.length})</span>
                            </button>
                        </div>

                        {/* View All Route Link */}
                        <Link
                            href={bulletinTab === 'notices' ? '/notices' : bulletinTab === 'exams' ? '/exams' : '/events'}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            <span>Manage {bulletinTab.charAt(0).toUpperCase() + bulletinTab.slice(1)}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-3">
                        {bulletinTab === 'notices' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {recentNotices.length > 0 ? (
                                    recentNotices.map((n) => (
                                        <div
                                            key={n.id}
                                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-2.5"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                                <FileText className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/notices/${n.id}`}
                                                    className="text-xs font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                                                >
                                                    {n.title}
                                                </Link>
                                                <p className="text-[10.5px] text-slate-500 mt-1 font-mono">
                                                    {n.published_at || 'Recently published'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                                        No recent published notices available.
                                    </div>
                                )}
                            </div>
                        )}

                        {bulletinTab === 'exams' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {upcomingExams.length > 0 ? (
                                    upcomingExams.map((e) => (
                                        <div
                                            key={e.id}
                                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-2.5"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                                                <ClipboardList className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {e.name}
                                                </p>
                                                <p className="text-[10.5px] text-indigo-700 font-semibold mt-0.5 uppercase">
                                                    {e.exam_type || 'Examination'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                                    Starts: {e.start_date ? formatWhen(e.start_date) : 'TBD'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                                        No upcoming exams scheduled.
                                    </div>
                                )}
                            </div>
                        )}

                        {bulletinTab === 'events' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((ev) => (
                                        <div
                                            key={ev.id}
                                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-2.5"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {ev.title}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                                    Date: {ev.start_date || 'TBD'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                                        No upcoming school events scheduled.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
