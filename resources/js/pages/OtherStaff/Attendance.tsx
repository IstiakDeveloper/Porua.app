import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Select from '@/Components/Select';
import Modal from '@/Components/Modal';
import Badge from '@/Components/Badge';
import IndexPagination from '@/Components/IndexPagination';
import {
    ClipboardCheck,
    Calculator,
    Calendar,
    Clock,
    UserCheck,
    UserX,
    AlertCircle,
    CheckCircle2,
    Search,
    Filter,
    Edit,
    Plus,
    Printer,
    ArrowLeftRight,
    TrendingUp,
    ShieldCheck,
    Users
} from 'lucide-react';

interface StaffItem {
    id: number;
    employee_id: string;
    name: string;
    designation: string | null;
    in_time: string;
    out_time: string;
    weekend: string[] | null;
}

interface AttendanceRecord {
    id: number;
    other_staff_id: number;
    employee_id: string;
    date: string;
    in_time: string | null;
    out_time: string | null;
    status: 'present' | 'late' | 'early_leave' | 'absent' | 'weekend' | 'holiday';
    device_sn: string | null;
    notes: string | null;
    other_staff?: StaffItem;
}

interface DailyStats {
    total_active: number;
    present: number;
    late: number;
    early_leave: number;
    absent: number;
    weekend: number;
}

interface CalculatorSummary {
    total_days: number;
    working_days: number;
    present: number;
    late: number;
    early_leave: number;
    absent: number;
    weekend: number;
    total_worked_hours: number;
    avg_daily_hours: number;
}

interface DailyDetail {
    date: string;
    day_name: string;
    status: 'present' | 'late' | 'early_leave' | 'absent' | 'weekend' | 'holiday';
    in_time: string;
    out_time: string;
    worked_hours: number;
    notes: string | null;
}

interface CalculatorResultItem {
    staff: StaffItem;
    summary: CalculatorSummary;
    daily_details: DailyDetail[];
}

interface OverallStats {
    total_days: number;
    present: number;
    late: number;
    early_leave: number;
    absent: number;
    weekend: number;
    total_worked_hours: number;
}

interface PageProps {
    activeTab: 'daily' | 'calculator';
    attendances?: {
        data: AttendanceRecord[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
        last_page?: number;
    };
    allStaff: StaffItem[];
    stats?: DailyStats;
    calculatorResults?: CalculatorResultItem[];
    overallStats?: OverallStats;
    filters: {
        date?: string;
        start_date?: string;
        end_date?: string;
        other_staff_id?: string | number;
        status?: string;
    };
}

export default function OtherStaffAttendance({
    activeTab,
    attendances,
    allStaff,
    stats,
    calculatorResults,
    overallStats,
    filters,
}: PageProps) {
    const [tab, setTab] = useState<'daily' | 'calculator'>(activeTab || 'daily');

    // Daily Filters
    const [dailyDate, setDailyDate] = useState(filters.date || new Date().toISOString().substring(0, 10));
    const [dailyStaffId, setDailyStaffId] = useState(filters.other_staff_id || '');
    const [dailyStatus, setDailyStatus] = useState(filters.status || '');

    // Calculator Filters
    const [calcStartDate, setCalcStartDate] = useState(
        filters.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10)
    );
    const [calcEndDate, setCalcEndDate] = useState(filters.end_date || new Date().toISOString().substring(0, 10));
    const [calcStaffId, setCalcStaffId] = useState(filters.other_staff_id || '');

    // Manual Entry Modal
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const { data: manualData, setData: setManualData, post: postManual, processing: manualProcessing, errors: manualErrors, reset: resetManual } = useForm({
        other_staff_id: '',
        date: new Date().toISOString().substring(0, 10),
        status: 'present',
        in_time: '08:00',
        out_time: '17:00',
        notes: '',
    });

    const handleTabChange = (newTab: 'daily' | 'calculator') => {
        setTab(newTab);
        if (newTab === 'daily') {
            router.get('/other-staff-attendance', { tab: 'daily', date: dailyDate, other_staff_id: dailyStaffId, status: dailyStatus }, { preserveState: true });
        } else {
            router.get('/other-staff-attendance', { tab: 'calculator', start_date: calcStartDate, end_date: calcEndDate, other_staff_id: calcStaffId }, { preserveState: true });
        }
    };

    const handleDailyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/other-staff-attendance', { tab: 'daily', date: dailyDate, other_staff_id: dailyStaffId, status: dailyStatus }, { preserveState: true });
    };

    const handleCalcFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/other-staff-attendance', { tab: 'calculator', start_date: calcStartDate, end_date: calcEndDate, other_staff_id: calcStaffId }, { preserveState: true });
    };

    const handleQuickMonthSelect = (monthsAgo: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().substring(0, 10);
        setCalcStartDate(start);
        setCalcEndDate(end);
        router.get('/other-staff-attendance', { tab: 'calculator', start_date: start, end_date: end, other_staff_id: calcStaffId }, { preserveState: true });
    };

    const openManualModal = (record?: AttendanceRecord) => {
        if (record) {
            setManualData({
                other_staff_id: String(record.other_staff_id),
                date: record.date ? record.date.substring(0, 10) : dailyDate,
                status: record.status,
                in_time: record.in_time ? new Date(record.in_time).toTimeString().substring(0, 5) : '08:00',
                out_time: record.out_time ? new Date(record.out_time).toTimeString().substring(0, 5) : '17:00',
                notes: record.notes || '',
            });
        } else {
            resetManual();
            setManualData('date', dailyDate);
        }
        setIsManualModalOpen(true);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postManual('/other-staff-attendance', {
            onSuccess: () => {
                setIsManualModalOpen(false);
                resetManual();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">PRESENT</span>;
            case 'late':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">LATE</span>;
            case 'early_leave':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">EARLY LEAVE</span>;
            case 'absent':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">ABSENT</span>;
            case 'weekend':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">WEEKEND</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">{status.toUpperCase()}</span>;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Other Staff Attendance Portal" />

            <div className="space-y-4 max-w-7xl mx-auto print:space-y-3">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl shadow-xs border border-gray-200/80 print:hidden">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Other Staff Attendance Portal</h1>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Superadmin Only
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Daily biometric logs, manual attendance override, and date range Attendance Calculator.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openManualModal()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Manual Entry / Edit
                        </button>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 pt-1.5 rounded-t-xl shadow-2xs print:hidden">
                    <button
                        onClick={() => handleTabChange('daily')}
                        className={`flex items-center gap-1.5 px-3 py-2 font-semibold text-xs border-b-2 transition-colors ${
                            tab === 'daily'
                                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-md'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ClipboardCheck className="w-3.5 h-3.5" /> Daily Attendance Logs
                    </button>
                    <button
                        onClick={() => handleTabChange('calculator')}
                        className={`flex items-center gap-1.5 px-3 py-2 font-semibold text-xs border-b-2 transition-colors ${
                            tab === 'calculator'
                                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-md'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Calculator className="w-3.5 h-3.5" /> Attendance Calculator
                    </button>
                </div>

                {/* TAB 1: DAILY ATTENDANCE */}
                {tab === 'daily' && (
                    <div className="space-y-4">
                        {/* Daily Stats Summary */}
                        {stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                                <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Active Staff</p>
                                    <h4 className="text-lg font-bold text-gray-900 mt-0.5">{stats.total_active}</h4>
                                </div>
                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs">
                                    <p className="text-[10px] font-semibold text-emerald-700 uppercase">Present</p>
                                    <h4 className="text-lg font-bold text-emerald-900 mt-0.5">{stats.present}</h4>
                                </div>
                                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 shadow-2xs">
                                    <p className="text-[10px] font-semibold text-amber-700 uppercase">Late</p>
                                    <h4 className="text-lg font-bold text-amber-900 mt-0.5">{stats.late}</h4>
                                </div>
                                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 shadow-2xs">
                                    <p className="text-[10px] font-semibold text-purple-700 uppercase">Early Leave</p>
                                    <h4 className="text-lg font-bold text-purple-900 mt-0.5">{stats.early_leave}</h4>
                                </div>
                                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 shadow-2xs">
                                    <p className="text-[10px] font-semibold text-rose-700 uppercase">Absent</p>
                                    <h4 className="text-lg font-bold text-rose-900 mt-0.5">{stats.absent}</h4>
                                </div>
                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 shadow-2xs">
                                    <p className="text-[10px] font-semibold text-blue-700 uppercase">Weekend</p>
                                    <h4 className="text-lg font-bold text-blue-900 mt-0.5">{stats.weekend}</h4>
                                </div>
                            </div>
                        )}

                        {/* Daily Filter Bar */}
                        <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                            <form onSubmit={handleDailyFilter} className="flex flex-wrap items-center gap-2">
                                <div className="w-full sm:w-40">
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Select Date</label>
                                    <Input
                                        type="date"
                                        value={dailyDate}
                                        onChange={(e) => setDailyDate(e.target.value)}
                                        className="text-xs py-1.5"
                                    />
                                </div>
                                <div className="w-full sm:w-52">
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Filter Staff</label>
                                    <Select
                                        value={dailyStaffId}
                                        onChange={(e) => setDailyStaffId(e.target.value)}
                                        className="text-xs py-1.5"
                                    >
                                        <option value="">All Other Staff</option>
                                        {allStaff.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                {st.name} ({st.employee_id})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="w-full sm:w-36">
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Status</label>
                                    <Select
                                        value={dailyStatus}
                                        onChange={(e) => setDailyStatus(e.target.value)}
                                        className="text-xs py-1.5"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="early_leave">Early Leave</option>
                                        <option value="absent">Absent</option>
                                        <option value="weekend">Weekend</option>
                                    </Select>
                                </div>
                                <div className="flex items-end gap-2 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        <Filter className="w-3.5 h-3.5" /> Filter
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Attendance Logs Table */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-2.5 px-3">Date</th>
                                            <th className="py-2.5 px-3">Employee ID</th>
                                            <th className="py-2.5 px-3">Staff Name</th>
                                            <th className="py-2.5 px-3">In Time</th>
                                            <th className="py-2.5 px-3">Out Time</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {attendances && attendances.data.length > 0 ? (
                                            attendances.data.map((record) => (
                                                <tr key={record.id} className="hover:bg-emerald-50/20 transition-colors">
                                                    <td className="py-2.5 px-3 font-mono text-gray-800 text-[11px]">
                                                        {record.date ? record.date.substring(0, 10) : dailyDate}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-[11px]">
                                                        {record.employee_id}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                                                        {record.other_staff?.name || 'Unknown Staff'}
                                                        {record.notes && <p className="text-[10px] text-gray-400 font-normal">{record.notes}</p>}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-gray-900 font-medium text-[11px]">
                                                        {record.in_time ? new Date(record.in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-gray-900 font-medium text-[11px]">
                                                        {record.out_time ? new Date(record.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        {getStatusBadge(record.status)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <button
                                                            onClick={() => openManualModal(record)}
                                                            className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                                            title="Edit Attendance Record"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-8 text-gray-500">
                                                    No attendance logs found for this date. Run ZKTeco agent sync or use "Manual Entry / Edit".
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Bar */}
                            {attendances && (
                                <IndexPagination
                                    links={attendances.links}
                                    from={attendances.from}
                                    to={attendances.to}
                                    total={attendances.total}
                                    lastPage={attendances.last_page || 1}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: ATTENDANCE CALCULATOR */}
                {tab === 'calculator' && (
                    <div className="space-y-4">
                        {/* Calculator Filter Card */}
                        <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-2xs print:hidden">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                    <Calculator className="w-4 h-4 text-emerald-600" /> Attendance Calculator Engine
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <button type="button" onClick={() => handleQuickMonthSelect(0)} className="px-2.5 py-1 rounded text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">
                                        This Month
                                    </button>
                                    <button type="button" onClick={() => handleQuickMonthSelect(1)} className="px-2.5 py-1 rounded text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">
                                        Last Month
                                    </button>
                                    <button type="button" onClick={handlePrint} className="px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                        <Printer className="w-3 h-3" /> Print
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCalcFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Start Date</label>
                                    <Input
                                        type="date"
                                        value={calcStartDate}
                                        onChange={(e) => setCalcStartDate(e.target.value)}
                                        className="text-xs py-1.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">End Date</label>
                                    <Input
                                        type="date"
                                        value={calcEndDate}
                                        onChange={(e) => setCalcEndDate(e.target.value)}
                                        className="text-xs py-1.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Other Staff Member</label>
                                    <Select
                                        value={calcStaffId}
                                        onChange={(e) => setCalcStaffId(e.target.value)}
                                        className="text-xs py-1.5"
                                    >
                                        <option value="">All Other Staff</option>
                                        {allStaff.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                {st.name} ({st.employee_id})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs py-2 shadow-2xs transition-colors">
                                        Calculate Summary
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Overall Stats Banner */}
                        {overallStats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-slate-400">Total Period Days</p>
                                    <h3 className="text-lg font-bold mt-0.5">{overallStats.total_days}</h3>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-emerald-700">Present</p>
                                    <h3 className="text-lg font-bold text-emerald-900 mt-0.5">{overallStats.present}</h3>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-950 rounded-xl border border-amber-200 shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-amber-700">Late</p>
                                    <h3 className="text-lg font-bold text-amber-900 mt-0.5">{overallStats.late}</h3>
                                </div>
                                <div className="p-3 bg-purple-50 text-purple-950 rounded-xl border border-purple-200 shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-purple-700">Early Leave</p>
                                    <h3 className="text-lg font-bold text-purple-900 mt-0.5">{overallStats.early_leave}</h3>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-950 rounded-xl border border-rose-200 shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-rose-700">Absent</p>
                                    <h3 className="text-lg font-bold text-rose-900 mt-0.5">{overallStats.absent}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-950 rounded-xl border border-blue-200 shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-blue-700">Weekend</p>
                                    <h3 className="text-lg font-bold text-blue-900 mt-0.5">{overallStats.weekend}</h3>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-950 rounded-xl border border-indigo-200 shadow-2xs">
                                    <p className="text-[9px] font-semibold uppercase text-indigo-700">Total Worked</p>
                                    <h3 className="text-lg font-bold text-indigo-900 mt-0.5">{overallStats.total_worked_hours} hrs</h3>
                                </div>
                            </div>
                        )}

                        {/* Calculated Results per Staff */}
                        {calculatorResults && calculatorResults.length > 0 ? (
                            calculatorResults.map((item) => (
                                <div key={item.staff.id} className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-4 space-y-3">
                                    {/* Staff Profile Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2.5 border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-gray-900">{item.staff.name}</h3>
                                                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                                    {item.staff.employee_id}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                Designation: {item.staff.designation || 'Staff'} | Shift: {item.staff.in_time ? item.staff.in_time.substring(0, 5) : '08:00'} - {item.staff.out_time ? item.staff.out_time.substring(0, 5) : '17:00'}
                                            </p>
                                        </div>

                                        {/* Summary Pills */}
                                        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                                Present: {item.summary.present}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                                Late: {item.summary.late}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                                                Early Leave: {item.summary.early_leave}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900">
                                                Absent: {item.summary.absent}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                                                Weekend: {item.summary.weekend}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                                                Hours: {item.summary.total_worked_hours}h ({item.summary.avg_daily_hours}h/day)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Daily Matrix Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-[11px]">
                                                    <th className="py-2 px-2.5">Date</th>
                                                    <th className="py-2 px-2.5">Day</th>
                                                    <th className="py-2 px-2.5">In Time</th>
                                                    <th className="py-2 px-2.5">Out Time</th>
                                                    <th className="py-2 px-2.5">Worked Hours</th>
                                                    <th className="py-2 px-2.5">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-[11px]">
                                                {item.daily_details.map((day) => (
                                                    <tr
                                                        key={day.date}
                                                        className={
                                                            day.status === 'weekend'
                                                                ? 'bg-blue-50/20 text-blue-900'
                                                                : day.status === 'absent'
                                                                ? 'bg-rose-50/20'
                                                                : 'hover:bg-gray-50'
                                                        }
                                                    >
                                                        <td className="py-1.5 px-2.5 font-mono font-medium">{day.date}</td>
                                                        <td className="py-1.5 px-2.5 font-medium text-gray-600">{day.day_name}</td>
                                                        <td className="py-1.5 px-2.5 font-mono text-gray-800">{day.in_time}</td>
                                                        <td className="py-1.5 px-2.5 font-mono text-gray-800">{day.out_time}</td>
                                                        <td className="py-1.5 px-2.5 font-mono font-semibold text-indigo-700">
                                                            {day.worked_hours > 0 ? `${day.worked_hours} hrs` : '--'}
                                                        </td>
                                                        <td className="py-1.5 px-2.5">{getStatusBadge(day.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200/80">
                                No calculations available. Select a date range above and click "Calculate Summary".
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Manual Entry / Edit Modal */}
            <Modal show={isManualModalOpen} onClose={() => setIsManualModalOpen(false)}>
                <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2.5 border-gray-100">
                        <h2 className="text-base font-bold text-gray-900">Manual Attendance Entry / Edit</h2>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Select Other Staff <span className="text-rose-500">*</span></label>
                            <Select
                                value={manualData.other_staff_id}
                                onChange={(e) => setManualData('other_staff_id', e.target.value)}
                                required
                                className="text-xs py-1.5"
                            >
                                <option value="">Select Staff...</option>
                                {allStaff.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.name} ({st.employee_id})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Date <span className="text-rose-500">*</span></label>
                                <Input
                                    type="date"
                                    value={manualData.date}
                                    onChange={(e) => setManualData('date', e.target.value)}
                                    required
                                    className="text-xs py-1.5"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Attendance Status <span className="text-rose-500">*</span></label>
                                <Select
                                    value={manualData.status}
                                    onChange={(e) => setManualData('status', e.target.value as any)}
                                    className="text-xs py-1.5"
                                >
                                    <option value="present">Present</option>
                                    <option value="late">Late</option>
                                    <option value="early_leave">Early Leave</option>
                                    <option value="absent">Absent</option>
                                    <option value="weekend">Weekend</option>
                                    <option value="holiday">Holiday</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Check In Time</label>
                                <Input
                                    type="time"
                                    value={manualData.in_time}
                                    onChange={(e) => setManualData('in_time', e.target.value)}
                                    className="text-xs font-mono py-1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Check Out Time</label>
                                <Input
                                    type="time"
                                    value={manualData.out_time}
                                    onChange={(e) => setManualData('out_time', e.target.value)}
                                    className="text-xs font-mono py-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                            <Input
                                type="text"
                                placeholder="Reason for manual entry or override"
                                value={manualData.notes}
                                onChange={(e) => setManualData('notes', e.target.value)}
                                className="text-xs py-1.5"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                            <Button type="button" variant="secondary" onClick={() => setIsManualModalOpen(false)} className="text-xs py-1.5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={manualProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5">
                                Save Attendance Record
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
