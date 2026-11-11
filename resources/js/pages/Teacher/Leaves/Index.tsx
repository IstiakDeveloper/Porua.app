import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import {
    CalendarClock,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    Paperclip,
    AlertCircle,
    Calendar,
    FileText,
    HeartPulse,
    Coffee,
} from 'lucide-react';
import { formatBdDate, formatBdDateRange, formatDays, formatDaysCount } from '@/utils/datetime';

interface LeaveBalance {
    leave_type_id: number;
    name: string;
    code: string;
    color: string;
    is_paid: boolean;
    days_allowed: number;
    days_used: number;
    days_remaining: number | null;
}

interface LeaveType {
    id: number;
    name: string;
    code: string;
    color: string;
    is_paid: boolean;
    days_per_year: number;
    requires_attachment: boolean;
}

interface LeaveApplication {
    id: number;
    leave_type_id: number;
    leave_type?: LeaveType;
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day: boolean;
    half_day_type: string | null;
    reason: string;
    attachment_url: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    admin_remarks: string | null;
    action_by_user?: {
        name: string;
    };
    created_at: string;
}

interface Props {
    teacher: {
        id: number;
        full_name: string;
        employee_id: string;
        designation: string;
        department: string;
    };
    balances: LeaveBalance[];
    applications: {
        data: LeaveApplication[];
        links: any[];
        total: number;
    };
    leaveTypes: LeaveType[];
}

export default function Index({
    teacher,
    balances = [],
    applications,
    leaveTypes = [],
}: Props) {
    const [applyModalOpen, setApplyModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type_id: leaveTypes[0]?.id ? String(leaveTypes[0].id) : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        is_half_day: false,
        half_day_type: 'first_half',
        reason: '',
        attachment: null as File | null,
    });

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/leaves', {
            onSuccess: () => {
                setApplyModalOpen(false);
                reset();
            },
        });
    };

    const handleCancel = (app: LeaveApplication) => {
        if (confirm('Are you sure you want to cancel this leave application?')) {
            router.post(`/teacher/leaves/${app.id}/cancel`);
        }
    };

    const selectedType = leaveTypes.find((t) => String(t.id) === data.leave_type_id);

    return (
        <AuthenticatedLayout>
            <Head title="My Leaves & Applications" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <CalendarClock className="w-6 h-6 text-emerald-600" />
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">My Leave Applications</h1>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Apply for official leave, monitor your annual quota balances, and view approval statuses.
                        </p>
                    </div>
                    <Button
                        onClick={() => setApplyModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Apply for Leave
                    </Button>
                </div>

                {/* Balances Grid */}
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Yearly Leave Quota Balances ({new Date().getFullYear()})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {balances.map((b) => (
                            <div
                                key={b.code}
                                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden"
                            >
                                <span
                                    className="absolute top-0 left-0 right-0 h-1"
                                    style={{ backgroundColor: b.color || '#0284c7' }}
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">{b.name}</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {b.code}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900">
                                        {b.days_remaining !== null ? formatDaysCount(b.days_remaining) : '—'}
                                    </span>
                                    {b.days_allowed > 0 && (
                                        <span className="text-xs text-slate-400 font-medium">
                                            / {formatDaysCount(b.days_allowed)} days left
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Used: <strong>{formatDaysCount(b.days_used)}</strong> {Number(b.days_used) === 1 ? 'day' : 'days'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Applications History Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Application History & Status</h3>
                        <span className="text-xs text-slate-500">{applications.total} Records</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/75">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase">Leave Type</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase">Date Range</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase">Total Days</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase">Reason</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase">Attachment</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase">Admin Remarks</th>
                                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {applications.data.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-4">
                                            <span
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                                                style={{
                                                    backgroundColor: `${app.leave_type?.color || '#0284c7'}15`,
                                                    color: app.leave_type?.color || '#0284c7',
                                                }}
                                            >
                                                {app.leave_type?.name} ({app.leave_type?.code})
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs font-bold text-slate-800">
                                                {formatBdDateRange(app.start_date, app.end_date)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-xs font-black text-slate-900">
                                                {formatDays(app.total_days)}
                                            </span>
                                            {app.is_half_day && (
                                                <span className="block text-[10px] text-indigo-600">
                                                    Half Day ({app.half_day_type === 'first_half' ? '1st Half' : '2nd Half'})
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 max-w-xs">
                                            <p className="text-xs text-slate-700 line-clamp-2" title={app.reason}>
                                                {app.reason}
                                            </p>
                                        </td>
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
                                        <td className="py-3 px-4 text-center">
                                            {app.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                            {app.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            )}
                                            {app.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 ring-1 ring-rose-600/20">
                                                    <XCircle className="w-3 h-3" /> Rejected
                                                </span>
                                            )}
                                            {app.status === 'cancelled' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 ring-1 ring-slate-500/20">
                                                    <RotateCcw className="w-3 h-3" /> Cancelled
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-slate-500">
                                            {app.admin_remarks || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {app.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(app)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {applications.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                                            You haven't submitted any leave applications yet. Click "+ Apply for Leave" to submit a request.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Apply Modal */}
                <Modal show={applyModalOpen} onClose={() => setApplyModalOpen(false)} maxWidth="md">
                    <form onSubmit={handleApply} className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Submit Leave Application</h3>
                            <button
                                type="button"
                                onClick={() => setApplyModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Leave Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.leave_type_id}
                                onChange={(e) => setData('leave_type_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                required
                            >
                                {leaveTypes.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.code}) - {t.days_per_year > 0 ? `${formatDaysCount(t.days_per_year)} days/yr` : 'Flexible'}
                                    </option>
                                ))}
                            </select>
                            {errors.leave_type_id && <p className="text-[11px] text-rose-500 mt-1">{errors.leave_type_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Start Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => {
                                        setData('start_date', e.target.value);
                                        if (data.end_date < e.target.value) {
                                            setData('end_date', e.target.value);
                                        }
                                    }}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    required
                                />
                                {errors.start_date && <p className="text-[11px] text-rose-500 mt-1">{errors.start_date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    End Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    min={data.start_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    required
                                />
                                {errors.end_date && <p className="text-[11px] text-rose-500 mt-1">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_half_day}
                                    onChange={(e) => setData('is_half_day', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium">Half Day Leave (0.5 day)</span>
                            </label>

                            {data.is_half_day && (
                                <select
                                    value={data.half_day_type}
                                    onChange={(e) => setData('half_day_type', e.target.value)}
                                    className="text-xs rounded-lg border border-slate-200 px-2 py-1 outline-none"
                                >
                                    <option value="first_half">First Half</option>
                                    <option value="second_half">Second Half</option>
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Reason for Leave <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="State the reason clearly for administration review..."
                                rows={3}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                required
                            />
                            {errors.reason && <p className="text-[11px] text-rose-500 mt-1">{errors.reason}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Attachment (Document / Medical Certificate)
                                {selectedType?.requires_attachment && <span className="text-rose-500"> (Required)</span>}
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            />
                            {errors.attachment && <p className="text-[11px] text-rose-500 mt-1">{errors.attachment}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setApplyModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

