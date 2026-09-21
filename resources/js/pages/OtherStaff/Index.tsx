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
    Users,
    UserPlus,
    Search,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Terminal,
    Phone,
    Briefcase,
    ShieldCheck,
    Cpu,
    Filter
} from 'lucide-react';

interface OtherStaffItem {
    id: number;
    employee_id: string;
    name: string;
    phone: string | null;
    designation: string | null;
    in_time: string;
    out_time: string;
    late_time: string | null;
    weekend: string[] | null;
    status: 'active' | 'inactive';
    notes: string | null;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
}

interface PageProps {
    staff: {
        data: OtherStaffItem[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
        last_page?: number;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
    };
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function OtherStaffIndex({ staff, stats, filters }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<OtherStaffItem | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showPushGuide, setShowPushGuide] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        employee_id: '',
        name: '',
        phone: '',
        designation: '',
        in_time: '08:00',
        out_time: '17:00',
        late_time: '08:15',
        weekend: ['Friday'] as string[],
        status: 'active' as 'active' | 'inactive',
        notes: '',
    });

    const openCreateModal = () => {
        setEditingStaff(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (item: OtherStaffItem) => {
        setEditingStaff(item);
        clearErrors();
        setData({
            employee_id: item.employee_id,
            name: item.name,
            phone: item.phone || '',
            designation: item.designation || '',
            in_time: item.in_time ? item.in_time.substring(0, 5) : '08:00',
            out_time: item.out_time ? item.out_time.substring(0, 5) : '17:00',
            late_time: item.late_time ? item.late_time.substring(0, 5) : '08:15',
            weekend: item.weekend || ['Friday'],
            status: item.status,
            notes: item.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStaff) {
            put(`/other-staff/${editingStaff.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/other-staff', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (item: OtherStaffItem) => {
        if (confirm(`Are you sure you want to delete ${item.name} (${item.employee_id})?`)) {
            router.delete(`/other-staff/${item.id}`);
        }
    };

    const handleToggleStatus = (item: OtherStaffItem) => {
        router.patch(`/other-staff/${item.id}/toggle-status`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/other-staff', { search: searchQuery, status: statusFilter }, { preserveState: true });
    };

    const toggleWeekendDay = (day: string) => {
        if (data.weekend.includes(day)) {
            setData('weekend', data.weekend.filter((d) => d !== day));
        } else {
            setData('weekend', [...data.weekend, day]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Other Staff Management" />

            <div className="space-y-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl shadow-xs border border-gray-200/80">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Other Staff Directory</h1>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Superadmin Only
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage staff profiles, biometric IDs, shift timings, and device sync settings.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowPushGuide(!showPushGuide)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                            <Cpu className="w-3.5 h-3.5" />
                            {showPushGuide ? 'Hide Push Guide' : 'ZKTeco Push Guide'}
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Add Other Staff
                        </button>
                    </div>
                </div>

                {/* ZKTeco Push Guide Box */}
                {showPushGuide && (
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl shadow-xs border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <Terminal className="w-4 h-4" /> How to Push Other Staff to Biometric Device
                        </div>
                        <p className="text-[11px] text-slate-300">
                            Run the script below on your local biometric agent machine to enroll newly added staff without losing any existing teacher/student records.
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded-md font-mono text-[11px] text-emerald-300 border border-slate-800">
                            cd "C:\ZKTeco-Agent Mbn" && php push_other_staff.php
                        </div>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between shadow-2xs">
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Staff</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between shadow-2xs">
                        <div>
                            <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">Active Staff</p>
                            <h3 className="text-xl font-bold text-green-700 mt-0.5">{stats.active}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between shadow-2xs">
                        <div>
                            <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Inactive Staff</p>
                            <h3 className="text-xl font-bold text-rose-700 mt-0.5">{stats.inactive}</h3>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                        <div className="flex items-center gap-2 w-full">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, ID, designation, phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 text-xs py-1.5 w-full"
                                />
                            </div>
                            <div className="w-36 shrink-0">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs py-1.5"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive Only</option>
                                </Select>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 shrink-0 transition-colors"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Staff List Table */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="py-2.5 px-3">Employee ID</th>
                                    <th className="py-2.5 px-3">Staff Name</th>
                                    <th className="py-2.5 px-3">Designation & Contact</th>
                                    <th className="py-2.5 px-3">Shift Hours</th>
                                    <th className="py-2.5 px-3">Weekend</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {staff.data.length > 0 ? (
                                    staff.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-[11px]">
                                                {item.employee_id}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-gray-900">
                                                {item.name}
                                                {item.notes && (
                                                    <p className="text-[10px] text-gray-400 font-normal truncate max-w-xs">{item.notes}</p>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1 text-gray-800">
                                                    <Briefcase className="w-3 h-3 text-gray-400" />
                                                    {item.designation || 'Staff'}
                                                </div>
                                                {item.phone && (
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {item.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                    <Clock className="w-3 h-3 text-emerald-600" />
                                                    <span>In: <strong className="text-gray-900">{item.in_time ? item.in_time.substring(0, 5) : '--'}</strong></span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>Out: <strong className="text-gray-900">{item.out_time ? item.out_time.substring(0, 5) : '--'}</strong></span>
                                                </div>
                                                {item.late_time && (
                                                    <p className="text-[10px] text-amber-600 font-mono mt-0.5">
                                                        Late cutoff: {item.late_time.substring(0, 5)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.weekend && item.weekend.length > 0 ? (
                                                        item.weekend.map((d) => (
                                                            <span key={d} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                                                                {d}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px]">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <button onClick={() => handleToggleStatus(item)} title="Click to toggle status">
                                                    <Badge variant={item.status === 'active' ? 'success' : 'danger'}>
                                                        {item.status.toUpperCase()}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                                        title="Edit Staff Details"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                                        title="Delete Staff"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            No staff records found. Click "Add Other Staff" to add staff.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <IndexPagination
                        links={staff.links}
                        from={staff.from}
                        to={staff.to}
                        total={staff.total}
                        lastPage={staff.last_page || 1}
                    />
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2.5 border-gray-100">
                        <h2 className="text-base font-bold text-gray-900">
                            {editingStaff ? 'Edit Other Staff Profile' : 'Add New Other Staff Member'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                    Machine Staff ID / Employee ID <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g. STF001"
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    required
                                    className="text-xs font-mono py-1.5"
                                />
                                {errors.employee_id && <p className="text-rose-500 text-[10px] mt-1">{errors.employee_id}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Staff Full Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="text-xs py-1.5"
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Designation</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Guard, Office Assistant"
                                    value={data.designation}
                                    onChange={(e) => setData('designation', e.target.value)}
                                    className="text-xs py-1.5"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Phone Number</label>
                                <Input
                                    type="text"
                                    placeholder="017xxxxxxxx"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="text-xs py-1.5"
                                />
                            </div>
                        </div>

                        {/* Shift Timings */}
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2">
                            <h4 className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-600" /> Attendance Shift Timings
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">In Time</label>
                                    <Input
                                        type="time"
                                        value={data.in_time}
                                        onChange={(e) => setData('in_time', e.target.value)}
                                        required
                                        className="text-xs font-mono py-1 px-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Late Cutoff</label>
                                    <Input
                                        type="time"
                                        value={data.late_time}
                                        onChange={(e) => setData('late_time', e.target.value)}
                                        className="text-xs font-mono py-1 px-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Out Time</label>
                                    <Input
                                        type="time"
                                        value={data.out_time}
                                        onChange={(e) => setData('out_time', e.target.value)}
                                        required
                                        className="text-xs font-mono py-1 px-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Weekend Selection */}
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-blue-600" /> Select Weekend Days
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {WEEKDAYS.map((day) => {
                                    const isSelected = data.weekend.includes(day);
                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => toggleWeekendDay(day)}
                                            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status</label>
                                <Select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                    className="text-xs py-1.5"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Notes</label>
                                <Input
                                    type="text"
                                    placeholder="Optional notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="text-xs py-1.5"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="text-xs py-1.5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5">
                                {editingStaff ? 'Update Staff' : 'Save Staff'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
