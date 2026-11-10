import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import { Plus, Edit, Trash2, Tag, CheckCircle2, XCircle, AlertCircle, CalendarClock, ArrowLeft } from 'lucide-react';

interface LeaveType {
    id: number;
    name: string;
    code: string;
    days_per_year: number;
    is_paid: boolean;
    color: string;
    requires_attachment: boolean;
    description: string | null;
    status: boolean;
    applications_count?: number;
}

interface Props {
    leaveTypes: LeaveType[];
}

const colorPresets = [
    { label: 'Sky Blue', value: '#0284c7' },
    { label: 'Rose Red', value: '#e11d48' },
    { label: 'Emerald Green', value: '#10b981' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Amber Orange', value: '#f59e0b' },
    { label: 'Slate Gray', value: '#64748b' },
];

export default function Types({ leaveTypes = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        days_per_year: 14,
        is_paid: true,
        color: '#0284c7',
        requires_attachment: false,
        description: '',
        status: true,
    });

    const openCreateModal = () => {
        setEditingType(null);
        reset();
        clearErrors();
        setData({
            name: '',
            code: '',
            days_per_year: 14,
            is_paid: true,
            color: '#0284c7',
            requires_attachment: false,
            description: '',
            status: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (type: LeaveType) => {
        setEditingType(type);
        clearErrors();
        setData({
            name: type.name,
            code: type.code,
            days_per_year: type.days_per_year,
            is_paid: type.is_paid,
            color: type.color || '#0284c7',
            requires_attachment: type.requires_attachment,
            description: type.description || '',
            status: type.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingType) {
            put(`/leave-types/${editingType.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/leave-types', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (type: LeaveType) => {
        if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
            router.delete(`/leave-types/${type.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Leave Types & Quotas" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-emerald-600" />
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Leave Types & Quotas</h1>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Configure standard employee leave policies, yearly day quotas, and paid/unpaid classifications.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => router.visit('/leave-applications')}
                            className="text-xs"
                        >
                            <CalendarClock className="w-4 h-4 mr-1.5" />
                            Leave Applications
                        </Button>
                        <Button
                            onClick={openCreateModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Leave Type
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/75">
                            <tr>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Leave Type
                                </th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Short Code
                                </th>
                                <th scope="col" className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Annual Quota
                                </th>
                                <th scope="col" className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Pay Type
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
                            {leaveTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                                                style={{ backgroundColor: type.color || '#0284c7' }}
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{type.name}</p>
                                                {type.description && (
                                                    <p className="text-[11px] text-slate-500 line-clamp-1">{type.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                                            {type.code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-xs font-bold text-slate-900">
                                            {type.days_per_year > 0 ? `${type.days_per_year} Days` : 'Unlimited / None'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {type.is_paid ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                                                Paid Leave
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-500/20">
                                                Unpaid
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-xs text-slate-600">
                                            {type.requires_attachment ? 'Required' : 'Optional'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {type.status ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                                                <XCircle className="w-3.5 h-3.5" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(type)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(type)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {leaveTypes.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                                        No leave types configured. Click "+ Add Leave Type" to set up your institute policies.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Form */}
                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingType ? 'Edit Leave Type' : 'Add New Leave Type'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Leave Type Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Casual Leave, Sick Leave"
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                required
                            />
                            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Short Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g. CL, SL"
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                                    required
                                    maxLength={10}
                                />
                                {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Days Allowed / Year <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.days_per_year}
                                    onChange={(e) => setData('days_per_year', parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={365}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                                {errors.days_per_year && <p className="text-[11px] text-rose-500 mt-1">{errors.days_per_year}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Color Accent</label>
                            <div className="flex items-center gap-2">
                                {colorPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => setData('color', preset.value)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                                            data.color === preset.value ? 'scale-110 border-slate-900 ring-2 ring-emerald-500/30' : 'border-white hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: preset.value }}
                                        title={preset.label}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-7 h-7 rounded border border-slate-200 cursor-pointer ml-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_paid}
                                    onChange={(e) => setData('is_paid', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium">Paid Leave</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.requires_attachment}
                                    onChange={(e) => setData('requires_attachment', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium">Requires Attachment</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Policy Notes</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Explain when this leave can be granted..."
                                rows={2}
                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={(e) => setData('status', e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-emerald-700">Active Status</span>
                        </label>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                                {editingType ? 'Update Leave Type' : 'Create Leave Type'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

