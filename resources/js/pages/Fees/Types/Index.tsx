import React, { useState, FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import PresetPills from '@/Components/PresetPills';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Tag,
    DollarSign,
    Calendar,
    Sparkles,
    CheckCircle2,
    Receipt,
    Clock,
} from 'lucide-react';

interface FeeType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
    status: 'active' | 'inactive';
}

interface Props {
    feeTypes: FeeType[];
}

const FEE_PRESETS = [
    {
        name: 'Monthly Tuition Fee',
        code: 'TUI_FEE',
        frequency: 'monthly' as const,
        description: 'Regular monthly school tuition fee',
    },
    {
        name: 'Admission / Registration Fee',
        code: 'ADM_FEE',
        frequency: 'one_time' as const,
        description: 'New student admission and registration fee',
    },
    {
        name: 'Annual Session Fee',
        code: 'SES_FEE',
        frequency: 'yearly' as const,
        description: 'Annual academic session charge and development fund',
    },
    {
        name: 'Term Examination Fee',
        code: 'EXAM_FEE',
        frequency: 'quarterly' as const,
        description: 'Terminal examination, question printing, and answer scripts',
    },
    {
        name: 'ID Card & Diary Fee',
        code: 'IDC_FEE',
        frequency: 'yearly' as const,
        description: 'Annual student smart ID card, diary, and badge',
    },
    {
        name: 'Monthly Transport Fee',
        code: 'TRN_FEE',
        frequency: 'monthly' as const,
        description: 'Monthly school bus and transport service charges',
    },
    {
        name: 'Library & Science Lab Fee',
        code: 'LIB_FEE',
        frequency: 'yearly' as const,
        description: 'Library book access and science laboratory equipment fee',
    },
    {
        name: 'Sports & Cultural Fee',
        code: 'SPT_FEE',
        frequency: 'yearly' as const,
        description: 'Annual sports day, athletics, and cultural events',
    },
];

export default function Index({ feeTypes }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm({
        name: '',
        code: '',
        description: '',
        frequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | 'one_time',
        status: 'active' as 'active' | 'inactive',
    });

    const generateCode = (name: string) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 4).toUpperCase() + '_FEE';
        }
        const clean = words
            .slice(0, 3)
            .map((w) => w.substring(0, 3).toUpperCase())
            .join('_');
        return `${clean}_FEE`;
    };

    const handleNameChange = (val: string) => {
        const autoCode = generateCode(val);
        form.setData({
            ...form.data,
            name: val,
            code: !form.data.code || form.data.code === generateCode(form.data.name) ? autoCode : form.data.code,
        });
    };

    const applyPreset = (preset: (typeof FEE_PRESETS)[0]) => {
        form.setData({
            ...form.data,
            name: preset.name,
            code: preset.code,
            frequency: preset.frequency,
            description: preset.description,
        });
    };

    const openCreateModal = () => {
        setEditingFeeType(null);
        form.reset();
        form.clearErrors();
        setShowModal(true);
    };

    const openEditModal = (feeType: FeeType) => {
        setEditingFeeType(feeType);
        form.setData({
            name: feeType.name,
            code: feeType.code,
            description: feeType.description || '',
            frequency: feeType.frequency,
            status: feeType.status,
        });
        form.clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingFeeType) {
            form.put(`/fee-types/${editingFeeType.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingFeeType(null);
                    form.reset();
                },
            });
        } else {
            form.post('/fee-types', {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                },
            });
        }
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/fee-types/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const filteredFeeTypes = feeTypes.filter((ft) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            ft.name.toLowerCase().includes(query) ||
            ft.code.toLowerCase().includes(query);
        const matchesFrequency =
            frequencyFilter === 'all' || ft.frequency === frequencyFilter;
        return matchesSearch && matchesFrequency;
    });

    const totalCount = feeTypes.length;
    const monthlyCount = feeTypes.filter((f) => f.frequency === 'monthly').length;
    const yearlyCount = feeTypes.filter((f) => f.frequency === 'yearly').length;
    const activeCount = feeTypes.filter((f) => f.status === 'active').length;

    const getFrequencyBadge = (frequency: string) => {
        switch (frequency) {
            case 'monthly':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        Monthly
                    </span>
                );
            case 'quarterly':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        Quarterly / Term
                    </span>
                );
            case 'yearly':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Annual / Yearly
                    </span>
                );
            case 'one_time':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        One-Time
                    </span>
                );
            default:
                return <span className="text-xs text-slate-500 capitalize">{frequency}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Types" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            <span>Fees & Accounts</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Fee Types
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Configure standard fee categories, billing frequencies, and code identifiers
                        </p>
                    </div>
                    <Button
                        size="md"
                        onClick={openCreateModal}
                        icon={<Plus className="w-4 h-4" />}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                    >
                        Add Fee Type
                    </Button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Categories</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {activeCount} Active
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Monthly Fees</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{monthlyCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Recurring every month</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yearly / Session</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{yearlyCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Charged once per academic year</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Operational Rate</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">Active collection types</p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by fee name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 text-xs font-medium text-slate-600">
                            <button
                                type="button"
                                onClick={() => setFrequencyFilter('all')}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    frequencyFilter === 'all'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                All ({feeTypes.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequencyFilter('monthly')}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    frequencyFilter === 'monthly'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequencyFilter('yearly')}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    frequencyFilter === 'yearly'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                Yearly
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequencyFilter('one_time')}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    frequencyFilter === 'one_time'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                One-Time
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Fee Code</th>
                                    <th className="px-5 py-4 text-white font-bold">Fee Name & Description</th>
                                    <th className="px-5 py-4 text-white font-bold">Frequency</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFeeTypes.length > 0 ? (
                                    filteredFeeTypes.map((feeType) => (
                                        <tr
                                            key={feeType.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                                                    {feeType.code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        <DollarSign className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {feeType.name}
                                                        </p>
                                                        {feeType.description && (
                                                            <p className="text-xs text-slate-500 line-clamp-1">
                                                                {feeType.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">{getFrequencyBadge(feeType.frequency)}</td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge
                                                    variant={feeType.status === 'active' ? 'success' : 'default'}
                                                    className="capitalize text-xs font-medium"
                                                >
                                                    {feeType.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(feeType)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Fee Type"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(feeType.id, feeType.name)
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Fee Type"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No fee types found</p>
                                                <p className="text-xs text-slate-500">
                                                    {searchTerm
                                                        ? 'Try clearing the search term'
                                                        : 'Get started by creating your standard school fee categories'}
                                                </p>
                                                <Button size="sm" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
                                                    Add Fee Type
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Standardized Create / Edit Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editingFeeType ? `Edit Fee Type - ${editingFeeType.name}` : 'Create Fee Type'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Presets */}
                    {!editingFeeType && (
                        <PresetPills
                            title="1-Click Standard School Fee Presets"
                            options={FEE_PRESETS.map((p) => ({
                                label: p.name,
                                sublabel: p.frequency,
                                active: form.data.name === p.name,
                                onClick: () => applyPreset(p),
                            }))}
                        />
                    )}

                    <div>
                        <Input
                            label="Fee Type Name"
                            value={form.data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            error={form.errors.name}
                            required
                            placeholder="e.g. Monthly Tuition Fee, Exam Fee"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            Clear name printed on receipts and student bills
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700">
                                    Fee Code <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        form.setData('code', generateCode(form.data.name))
                                    }
                                    className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                                >
                                    <Sparkles className="w-3 h-3" /> Auto
                                </button>
                            </div>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value.toUpperCase())
                                }
                                error={form.errors.code}
                                required
                                placeholder="e.g. TUI_FEE, ADM_FEE"
                                className="font-mono uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Frequency <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.data.frequency}
                                onChange={(e) =>
                                    form.setData(
                                        'frequency',
                                        e.target.value as 'monthly' | 'quarterly' | 'yearly' | 'one_time'
                                    )
                                }
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly / Term</option>
                                <option value="yearly">Yearly / Session</option>
                                <option value="one_time">One-Time Only</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData('status', e.target.value as 'active' | 'inactive')
                            }
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description / Ledger Notes (Optional)
                        </label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={2}
                            placeholder="Optional notes for accountant or receipts..."
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={form.processing}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            {editingFeeType ? 'Update Fee Type' : 'Save Fee Type'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Fee Type"
                message={`Are you sure you want to delete "${deleteModal.name}"? This fee type will no longer be available for assigning to class structures or collecting payments.`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
