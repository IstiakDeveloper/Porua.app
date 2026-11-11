import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import Input from '@/Components/Input';
import {
    RefreshCw,
    Trash2,
    Key,
    Lock,
    Search,
    Filter,
    Plus,
    Edit,
    Shield,
    RotateCcw,
    Layers,
    CheckCircle2
} from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
    description?: string | null;
    created_at: string;
}

interface PermissionsIndexProps {
    permissions: Permission[];
}

export default function Index({ permissions = [] }: PermissionsIndexProps) {
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');

    // Create / Edit modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        module: 'User Management',
        description: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);

    const permissionsList = Array.isArray(permissions) ? permissions : [];

    const handleSync = () => {
        if (confirm('This will synchronize default system permissions from the catalog. Continue?')) {
            setSyncing(true);
            router.post(
                '/permissions/sync',
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setSyncing(false),
                }
            );
        }
    };

    const openCreateModal = () => {
        setEditingPermission(null);
        setFormData({
            name: '',
            slug: '',
            module: 'User Management',
            description: '',
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const openEditModal = (permission: Permission) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            slug: permission.slug,
            module: permission.module,
            description: permission.description || '',
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_');
        setFormData((prev) => ({
            ...prev,
            name,
            slug: editingPermission ? prev.slug : slug,
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (editingPermission) {
            router.put(`/permissions/${editingPermission.id}`, formData, {
                preserveScroll: true,
                onError: (errs) => {
                    setFormErrors(errs);
                    setSaving(false);
                },
                onSuccess: () => {
                    setSaving(false);
                    setModalOpen(false);
                },
            });
        } else {
            router.post('/permissions', formData, {
                preserveScroll: true,
                onError: (errs) => {
                    setFormErrors(errs);
                    setSaving(false);
                },
                onSuccess: () => {
                    setSaving(false);
                    setModalOpen(false);
                },
            });
        }
    };

    const openDelete = (permission: Permission) => {
        setDeleteTarget(permission);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/permissions/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
            },
        });
    };

    // Group permissions by module
    const groupedPermissions = permissionsList.reduce((acc, permission) => {
        const mod = permission.module || 'General';
        if (!acc[mod]) {
            acc[mod] = [];
        }
        acc[mod].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const modules = ['all', ...Object.keys(groupedPermissions).sort()];

    // Filter permissions
    const filteredPermissions = permissionsList.filter((permission) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            permission.name.toLowerCase().includes(query) ||
            permission.slug.toLowerCase().includes(query) ||
            permission.module.toLowerCase().includes(query);
        const matchesModule = selectedModule === 'all' || permission.module === selectedModule;
        return matchesSearch && matchesModule;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Permissions Management" />

            <div className="space-y-4 pb-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">System Permissions</h1>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                                {permissionsList.length} items
                            </span>
                        </div>
                        <p className="text-xs text-emerald-800/80 mt-0.5">
                            Manage granular system capability keys and access boundary definitions
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        <Link href="/roles">
                            <Button size="sm" variant="secondary" icon={<Shield className="w-3.5 h-3.5" />}>
                                Roles Directory
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleSync}
                            disabled={syncing}
                            icon={<RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />}
                        >
                            {syncing ? 'Syncing...' : 'Sync Standard'}
                        </Button>
                        <Button size="sm" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
                            New Permission
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Permissions</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{permissionsList.length}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Key className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Functional Modules</p>
                                <p className="text-xl font-bold text-emerald-700 mt-0.5">{Object.keys(groupedPermissions).length}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">Filtered View</p>
                                <p className="text-xl font-bold text-indigo-700 mt-0.5">{filteredPermissions.length}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Module Filter */}
                <div className="bg-white rounded-xl border border-emerald-100 p-3 sm:p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search permissions by name, slug or module..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                            >
                                {modules.map((mod) => (
                                    <option key={mod} value={mod}>
                                        {mod === 'all' ? 'All Functional Modules' : mod}
                                    </option>
                                ))}
                            </select>

                            {(searchTerm || selectedModule !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedModule('all');
                                    }}
                                    className="px-2.5 py-2 text-xs text-gray-500 hover:text-gray-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permissions Table */}
                <div className="bg-white rounded-xl border border-emerald-100 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Permission Name & Key
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Module Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-emerald-900 uppercase tracking-wider w-24">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPermissions.length > 0 ? (
                                    filteredPermissions.map((permission) => (
                                        <tr key={permission.id} className="hover:bg-emerald-50/20 transition-colors">
                                            {/* Name & Slug */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                                                        <Key className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-900 block">
                                                            {permission.name}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-gray-500">
                                                            {permission.slug}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Module */}
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {permission.module}
                                                </span>
                                            </td>

                                            {/* Description */}
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {permission.description || '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(permission)}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                                        title="Edit Permission"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDelete(permission)}
                                                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                        title="Delete Permission"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-xs text-gray-500">
                                            No permissions found matching "{searchTerm}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create / Edit Permission Modal */}
            <Modal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="md"
            >
                <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Key className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">
                                {editingPermission ? 'Edit Permission' : 'Create New Permission'}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Input
                            label="Permission Name"
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            error={formErrors.name}
                            placeholder="e.g. Export Exam Marksheet"
                            required
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Slug Identifier
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="export_exam_marksheet"
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 font-mono bg-white"
                                required
                            />
                            {formErrors.slug && <p className="mt-1 text-xs text-rose-600">{formErrors.slug}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Module / Category
                            </label>
                            <input
                                type="text"
                                list="module-suggestions"
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                placeholder="e.g. Examination or Student Management"
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                                required
                            />
                            <datalist id="module-suggestions">
                                {modules.filter((m) => m !== 'all').map((m) => (
                                    <option key={m} value={m} />
                                ))}
                            </datalist>
                            {formErrors.module && <p className="mt-1 text-xs text-rose-600">{formErrors.module}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Description <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief summary of what this permission enables..."
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            loading={saving}
                            className="text-xs"
                        >
                            {editingPermission ? 'Update Permission' : 'Create Permission'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                title="Delete Permission"
                itemName={deleteTarget?.name || 'this permission'}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </AuthenticatedLayout>
    );
}
