import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import Badge from '@/Components/Badge';
import PresetPills from '@/Components/PresetPills';
import {
    Plus,
    Edit,
    Trash2,
    Building,
    Users,
    Sparkles,
    CheckCircle2,
    Search,
    MapPin,
} from 'lucide-react';
import { ExamHall } from '@/types/exam';

interface IndexProps {
    halls: ExamHall[];
}

const CAPACITY_PRESETS = [
    { label: '30 Benches', value: '30' },
    { label: '50 Benches', value: '50' },
    { label: '100 Benches', value: '100' },
    { label: '150 Benches', value: '150' },
    { label: '200 Benches', value: '200' },
];

export default function Index({ halls = [] }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingHall, setEditingHall] = useState<ExamHall | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        capacity: '50',
        location: '',
        facilities: '',
        status: 'active',
    });

    const generateHallCode = (name: string) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return `HALL_${words[0].substring(0, 4).toUpperCase()}`;
        }
        const initials = words.map((w) => w[0]).join('').substring(0, 4).toUpperCase();
        return `HALL_${initials}`;
    };

    const handleNameChange = (val: string) => {
        const autoCode = generateHallCode(val);
        setFormData((prev) => ({
            ...prev,
            name: val,
            code: !prev.code || prev.code === generateHallCode(prev.name) ? autoCode : prev.code,
        }));
    };

    const handleOpenCreate = () => {
        setEditingHall(null);
        setFormData({
            name: '',
            code: '',
            capacity: '50',
            location: '',
            facilities: '',
            status: 'active',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleOpenEdit = (hall: ExamHall) => {
        setEditingHall(hall);
        setFormData({
            name: hall.name,
            code: hall.code,
            capacity: hall.capacity.toString(),
            location: hall.location || '',
            facilities: hall.facilities || '',
            status: hall.status,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingHall ? `/exam-halls/${editingHall.id}` : '/exam-halls';
        const method = editingHall ? 'put' : 'post';

        router[method](url, formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setShowModal(false);
            },
        });
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/exam-halls/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const filteredHalls = halls.filter((h) => {
        const query = searchTerm.toLowerCase();
        return (
            !searchTerm ||
            h.name.toLowerCase().includes(query) ||
            h.code.toLowerCase().includes(query) ||
            (h.location && h.location.toLowerCase().includes(query))
        );
    });

    const totalCapacity = halls.reduce((sum, h) => sum + (h.capacity || 0), 0);
    const activeCount = halls.filter((h) => h.status === 'active').length;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Halls" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Building className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Exam Halls & Rooms
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Configure physical examination venues, seating capacities, and room facilities
                        </p>
                    </div>
                    <Button
                        size="md"
                        onClick={handleOpenCreate}
                        icon={<Plus className="w-4 h-4" />}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                    >
                        Add Exam Hall
                    </Button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Halls</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Building className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{halls.length}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {activeCount} Active
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Capacity</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalCapacity} seats</p>
                        <p className="text-xs text-slate-500 mt-1">Simultaneous bench space</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Hall Size</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Building className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {halls.length > 0 ? Math.round(totalCapacity / halls.length) : 0} seats
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Per room average</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Operational Rate</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">
                            {halls.length > 0 ? Math.round((activeCount / halls.length) * 100) : 0}%
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">Ready for seating</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search hall name, code, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                {/* Halls Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Code</th>
                                    <th className="px-5 py-4 text-white font-bold">Hall Name & Location</th>
                                    <th className="px-5 py-4 text-white font-bold">Capacity</th>
                                    <th className="px-5 py-4 text-white font-bold">Facilities</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHalls.length > 0 ? (
                                    filteredHalls.map((hall) => (
                                        <tr
                                            key={hall.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                                                    {hall.code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        <Building className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {hall.name}
                                                        </p>
                                                        {hall.location && (
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                                {hall.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                                                    <Users className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                                    {hall.capacity} Seats
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600">
                                                {hall.facilities || <span className="text-slate-400 italic">Standard</span>}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge
                                                    variant={hall.status === 'active' ? 'success' : 'default'}
                                                    className="capitalize text-xs font-medium"
                                                >
                                                    {hall.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(hall)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Hall"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(hall.id, hall.name)
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Hall"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <Building className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No exam halls found</p>
                                                <p className="text-xs text-slate-500">
                                                    Configure exam halls and rooms to assign seat plans.
                                                </p>
                                                <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
                                                    Add Exam Hall
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

            {/* Standard Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editingHall ? `Edit Exam Hall - ${editingHall.name}` : 'Create Exam Hall'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <Input
                            label="Hall / Room Name"
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            error={errors.name}
                            required
                            placeholder="e.g. Main Auditorium, Hall Room 201"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700">
                                    Hall Code <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            code: generateHallCode(prev.name),
                                        }))
                                    }
                                    className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                                >
                                    <Sparkles className="w-3 h-3" /> Auto
                                </button>
                            </div>
                            <Input
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                }
                                error={errors.code}
                                required
                                placeholder="e.g. HALL_AUD, HALL_201"
                                className="font-mono uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Capacity Presets */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Seating Capacity
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {CAPACITY_PRESETS.map((cp) => (
                                <button
                                    key={cp.value}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, capacity: cp.value }))
                                    }
                                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                                        formData.capacity === cp.value
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                                    }`}
                                >
                                    {cp.label}
                                </button>
                            ))}
                        </div>
                        <Input
                            type="number"
                            min="1"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({ ...formData, capacity: e.target.value })
                            }
                            error={errors.capacity}
                            required
                            placeholder="e.g. 50"
                        />
                    </div>

                    <Input
                        label="Building / Floor Location (Optional)"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                        }
                        error={errors.location}
                        placeholder="e.g. Academic Building 1, 2nd Floor"
                    />

                    <Input
                        label="Facilities & Equipment (Optional)"
                        value={formData.facilities}
                        onChange={(e) =>
                            setFormData({ ...formData, facilities: e.target.value })
                        }
                        error={errors.facilities}
                        placeholder="e.g. CCTV, Air Conditioned, Sound System"
                    />

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
                            loading={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            {editingHall ? 'Update Hall' : 'Save Hall'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Exam Hall"
                message={`Are you sure you want to delete hall "${deleteModal.name}"?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
