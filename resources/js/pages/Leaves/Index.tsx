import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import IndexPagination from '@/Components/IndexPagination';
import {
    CalendarClock,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Users,
    FileText,
    Tag,
    Plus,
    Filter,
    Paperclip,
    ExternalLink,
    AlertTriangle,
    RotateCcw,
    Search,
    Building2
} from 'lucide-react';
import { formatBdDate, formatBdDateRange, formatDays, formatDaysCount } from '@/utils/datetime';

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    employee_id: string | null;
    department: string | null;
    designation: string | null;
    photo_url?: string | null;
    user?: {
        name: string;
        email: string;
    };
}

interface LeaveType {
    id: number;
    name: string;
    code: string;
    color: string;
    is_paid: boolean;
}

interface LeaveApplication {
    id: number;
    teacher_id: number;
    teacher?: Teacher;
    leave_type_id: number;
    leave_type?: LeaveType;
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day: boolean;
    half_day_type: string | null;
    reason: string;
    attachment_path: string | null;
    attachment_url: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    action_by: number | null;
    action_by_user?: {
        name: string;
    };
    action_at: string | null;
    admin_remarks: string | null;
    created_at: string;
}

interface Props {
    applications: {
        data: LeaveApplication[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        status?: string;
        teacher_id?: string | number;
        department?: string;
        leave_type_id?: string | number;
        from_date?: string;
        to_date?: string;
    };
    stats: {
        pending: number;
        approved_this_month: number;
        on_leave_today: number;
        rejected: number;
    };
    teachers: Teacher[];
    departments: string[];
    leaveTypes: LeaveType[];
}

export default function Index({
    applications,
    filters,
    stats,
    teachers = [],
    departments = [],
    leaveTypes = [],
}: Props) {
    const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [remarks, setRemarks] = useState('');

    const createForm = useForm({
        teacher_id: '',
        leave_type_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        is_half_day: false,
        half_day_type: 'first_half',
        reason: '',
        attachment: null as File | null,
        auto_approve: true,
    });

    const handleFilterChange = (key: string, value: string) => {
        const nextFilters = {
            ...filters,
            [key]: value,
        };
        // Reset page on filter change
        router.get('/leave-applications', nextFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const confirmApprove = (app: LeaveApplication) => {
        setSelectedApp(app);
        setRemarks('');
        setApproveModalOpen(true);
    };

    const confirmReject = (app: LeaveApplication) => {
        setSelectedApp(app);
        setRemarks('');
        setRejectModalOpen(true);
    };

    const confirmCancel = (app: LeaveApplication) => {
        setSelectedApp(app);
        setRemarks('');
        setCancelModalOpen(true);
    };

    const submitApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp) return;

        router.post(`/leave-applications/${selectedApp.id}/approve`, {
            admin_remarks: remarks,
        }, {
            onSuccess: () => setApproveModalOpen(false),
        });
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp) return;

        router.post(`/leave-applications/${selectedApp.id}/reject`, {
            admin_remarks: remarks,
        }, {
            onSuccess: () => setRejectModalOpen(false),
        });
    };

    const submitCancel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp) return;

        router.post(`/leave-applications/${selectedApp.id}/cancel`, {
            admin_remarks: remarks,
        }, {
            onSuccess: () => setCancelModalOpen(false),
        });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/leave-applications', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const statusBadge = (status: LeaveApplication['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 ring-1 ring-rose-600/20">
                        <XCircle className="w-3 h-3" /> Rejected
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 ring-1 ring-slate-500/20">
                        <RotateCcw className="w-3 h-3" /> Cancelled
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Leave Applications" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <CalendarClock className="w-6 h-6 text-emerald-600" />
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Leave Management Desk</h1>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Review, approve, and manage employee leave applications with automatic attendance sheet synchronization.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => router.visit('/leave-types')}
                            className="text-xs"
                        >
                            <Tag className="w-4 h-4 mr-1.5 text-slate-500" />
                            Leave Types
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.visit('/leave-reports')}
                            className="text-xs"
                        >
                            <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                            Leave Reports
                        </Button>
                        <Button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Record Leave
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Requests</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900">{stats.pending}</p>
                        <span className="text-[10px] text-amber-600 font-medium">Requires approval</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Approved (Month)</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900">{stats.approved_this_month}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">Synced with attendance</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-sky-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">On Leave Today</span>
                            <Calendar className="w-4 h-4 text-sky-500" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900">{stats.on_leave_today}</p>
                        <span className="text-[10px] text-sky-600 font-medium">Currently absent on leave</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Rejected Requests</span>
                            <XCircle className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900">{stats.rejected}</p>
                        <span className="text-[10px] text-slate-500 font-medium">All time rejected</span>
                    </div>
                </div>

                {/* Filter and Tab Bar */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-3">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 pb-2">
                        {[
                            { key: 'pending', label: `Pending (${stats.pending})` },
                            { key: 'approved', label: 'Approved' },
                            { key: 'rejected', label: 'Rejected' },
                            { key: 'cancelled', label: 'Cancelled' },
                            { key: 'all', label: 'All Applications' },
                        ].map((tab) => {
                            const active = (filters.status || 'pending') === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleFilterChange('status', tab.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                        active
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Teacher</label>
                            <select
                                value={filters.teacher_id || ''}
                                onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name} ({t.employee_id || 'No ID'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                            <select
                                value={filters.department || ''}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Leave Type</label>
                            <select
                                value={filters.leave_type_id || ''}
                                onChange={(e) => handleFilterChange('leave_type_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 outline-none focus:border-emerald-500"
                            >
                                <option value="">All Types</option>
                                {leaveTypes.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date Range</label>
                            <div className="flex items-center gap-1">
                                <input
                                    type="date"
                                    value={filters.from_date || ''}
                                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                    className="w-1/2 text-xs rounded-xl border border-slate-200 px-2 py-1.5 bg-white text-slate-800 outline-none focus:border-emerald-500"
                                />
                                <span className="text-slate-400 text-xs">to</span>
                                <input
                                    type="date"
                                    value={filters.to_date || ''}
                                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                    className="w-1/2 text-xs rounded-xl border border-slate-200 px-2 py-1.5 bg-white text-slate-800 outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/75">
                            <tr>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Teacher / Employee
                                </th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Leave Type
                                </th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Period & Days
                                </th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th scope="col" className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Attachment
                                </th>
                                <th scope="col" className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="py-3 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {applications.data.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                                    {/* Teacher */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                {app.teacher?.first_name?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">
                                                    {app.teacher ? `${app.teacher.first_name} ${app.teacher.last_name}` : 'Unknown'}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    ID: {app.teacher?.employee_id || '—'} &bull; {app.teacher?.department || 'General'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Leave Type */}
                                    <td className="py-3 px-4">
                                        <span
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                                            style={{
                                                backgroundColor: `${app.leave_type?.color || '#0284c7'}15`,
                                                color: app.leave_type?.color || '#0284c7',
                                            }}
                                        >
                                            {app.leave_type?.name || 'Leave'}
                                            <span className="text-[10px] font-mono">({app.leave_type?.code})</span>
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {app.leave_type?.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                                        </p>
                                    </td>

                                    {/* Period */}
                                    <td className="py-3 px-4">
                                        <p className="text-xs font-bold text-slate-800">
                                            {formatBdDateRange(app.start_date, app.end_date)}
                                        </p>
                                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                            {formatDays(app.total_days)}
                                            {app.is_half_day && (
                                                <span className="ml-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-normal">
                                                    Half Day ({app.half_day_type === 'first_half' ? '1st Half' : '2nd Half'})
                                                </span>
                                            )}
                                        </p>
                                    </td>

                                    {/* Reason */}
                                    <td className="py-3 px-4 max-w-xs">
                                        <p className="text-xs text-slate-700 line-clamp-2" title={app.reason}>
                                            {app.reason}
                                        </p>
                                        {app.admin_remarks && (
                                            <p className="text-[10px] text-slate-400 mt-1 italic">
                                                Admin note: {app.admin_remarks}
                                            </p>
                                        )}
                                    </td>

                                    {/* Attachment */}
                                    <td className="py-3 px-4 text-center">
                                        {app.attachment_url ? (
                                            <a
                                                href={app.attachment_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                                            >
                                                <Paperclip className="w-3.5 h-3.5" />
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-4 text-center">
                                        {statusBadge(app.status)}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right">
                                        {app.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => confirmApprove(app)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmReject(app)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {app.status === 'approved' && (
                                            <button
                                                type="button"
                                                onClick={() => confirmCancel(app)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Revoke / Cancel leave and restore attendance"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Revoke
                                            </button>
                                        )}

                                        {(app.status === 'rejected' || app.status === 'cancelled') && (
                                            <span className="text-[11px] text-slate-400">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {applications.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                                        No leave applications found matching the selected filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {applications.total > applications.per_page && (
                        <div className="p-3 border-t border-slate-100">
                            <IndexPagination
                                pagination={{
                                    current_page: applications.current_page,
                                    last_page: applications.last_page,
                                    per_page: applications.per_page,
                                    total: applications.total,
                                    from: applications.from,
                                    to: applications.to,
                                    links: applications.links,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Approve Modal */}
                <Modal show={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="sm">
                    <form onSubmit={submitApprove} className="p-5 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <h3 className="text-base font-bold text-slate-900">Approve Leave Application</h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Approving this leave will immediately mark the teacher as <span className="font-semibold text-sky-700 bg-sky-50 px-1 py-0.5 rounded">Leave</span> in the daily attendance records, monthly view, and printed attendance sheets for each active working day between <strong>{formatBdDate(selectedApp?.start_date)}</strong> and <strong>{formatBdDate(selectedApp?.end_date)}</strong>.
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Admin Remarks / Note (Optional)
                            </label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Approved by Principal"
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setApproveModalOpen(false)}
                                className="text-xs"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                                Confirm Approval
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Reject Modal */}
                <Modal show={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="sm">
                    <form onSubmit={submitReject} className="p-5 space-y-4">
                        <div className="flex items-center gap-2 text-rose-600">
                            <XCircle className="w-5 h-5" />
                            <h3 className="text-base font-bold text-slate-900">Reject Leave Application</h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Please provide a reason for rejection. This remark will be visible to the teacher in their profile and portal.
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Rejection Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Explain why the leave cannot be approved at this time..."
                                rows={3}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-rose-500"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRejectModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                            >
                                Confirm Rejection
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Cancel / Revoke Modal */}
                <Modal show={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="sm">
                    <form onSubmit={submitCancel} className="p-5 space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                            <h3 className="text-base font-bold text-slate-900">Revoke Approved Leave</h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Revoking this leave will reset the status to <strong>Cancelled</strong> and automatically remove the leave records from the attendance sheet.
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Cancellation Reason (Optional)
                            </label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Teacher reported to duty early"
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setCancelModalOpen(false)}
                                className="text-xs"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                            >
                                Confirm Revoke
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Record Leave Modal (Admin Apply) */}
                <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md">
                    <form onSubmit={submitCreate} className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Record Leave for Employee</h3>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Select Teacher <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={createForm.data.teacher_id}
                                onChange={(e) => createForm.setData('teacher_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                required
                            >
                                <option value="">-- Choose Teacher --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name} ({t.employee_id || 'ID N/A'}) - {t.department || 'General'}
                                    </option>
                                ))}
                            </select>
                            {createForm.errors.teacher_id && <p className="text-[11px] text-rose-500 mt-1">{createForm.errors.teacher_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Leave Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={createForm.data.leave_type_id}
                                onChange={(e) => createForm.setData('leave_type_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                required
                            >
                                <option value="">-- Choose Leave Type --</option>
                                {leaveTypes.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.code}) - {t.is_paid ? 'Paid' : 'Unpaid'}
                                    </option>
                                ))}
                            </select>
                            {createForm.errors.leave_type_id && <p className="text-[11px] text-rose-500 mt-1">{createForm.errors.leave_type_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Start Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={createForm.data.start_date}
                                    onChange={(e) => {
                                        createForm.setData('start_date', e.target.value);
                                        if (createForm.data.end_date < e.target.value) {
                                            createForm.setData('end_date', e.target.value);
                                        }
                                    }}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    End Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={createForm.data.end_date}
                                    min={createForm.data.start_date}
                                    onChange={(e) => createForm.setData('end_date', e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.is_half_day}
                                    onChange={(e) => createForm.setData('is_half_day', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium">Half Day Leave (0.5 day)</span>
                            </label>

                            {createForm.data.is_half_day && (
                                <select
                                    value={createForm.data.half_day_type}
                                    onChange={(e) => createForm.setData('half_day_type', e.target.value)}
                                    className="text-xs rounded-lg border border-slate-200 px-2 py-1 outline-none"
                                >
                                    <option value="first_half">First Half</option>
                                    <option value="second_half">Second Half</option>
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Reason / Note <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={createForm.data.reason}
                                onChange={(e) => createForm.setData('reason', e.target.value)}
                                placeholder="Explain reason for leave..."
                                rows={2}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                required
                            />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={createForm.data.auto_approve}
                                onChange={(e) => createForm.setData('auto_approve', e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-emerald-700">
                                Auto-approve immediately and sync with attendance records
                            </span>
                        </label>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setCreateModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                                Submit Leave
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

