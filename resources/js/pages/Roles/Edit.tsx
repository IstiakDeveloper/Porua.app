import React, { FormEvent, useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Shield,
    Save,
    CheckCircle,
    Key,
    Trash2,
    AlertCircle,
    Search,
    Check
} from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    slug?: string;
    module: string;
}

interface RoleData {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    permissions: Permission[];
    users_count: number;
}

interface EditProps {
    role: RoleData;
    permissions: Permission[];
}

export default function Edit({ role, permissions = [] }: EditProps) {
    const [data, setData] = useState({
        name: role.name,
        description: role.description || '',
        permission_ids: role.permissions ? role.permissions.map((p) => p.id) : [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [permissionSearch, setPermissionSearch] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const permissionsList = Array.isArray(permissions) ? permissions : [];

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        return permissionsList.reduce((acc, permission) => {
            const mod = permission.module || 'General';
            if (!acc[mod]) {
                acc[mod] = [];
            }
            acc[mod].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [permissionsList]);

    const moduleNames = Object.keys(groupedPermissions);

    const togglePermission = (permissionId: number) => {
        setData((prev) => ({
            ...prev,
            permission_ids: prev.permission_ids.includes(permissionId)
                ? prev.permission_ids.filter((id) => id !== permissionId)
                : [...prev.permission_ids, permissionId],
        }));
    };

    const toggleModule = (module: string) => {
        const modulePermissions = groupedPermissions[module] || [];
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        const allSelected = modulePermissionIds.every((id) => data.permission_ids.includes(id));

        if (allSelected) {
            setData((prev) => ({
                ...prev,
                permission_ids: prev.permission_ids.filter((id) => !modulePermissionIds.includes(id)),
            }));
        } else {
            setData((prev) => ({
                ...prev,
                permission_ids: [...new Set([...prev.permission_ids, ...modulePermissionIds])],
            }));
        }
    };

    const selectAll = () => {
        setData((prev) => ({
            ...prev,
            permission_ids: permissionsList.map((p) => p.id),
        }));
    };

    const deselectAll = () => {
        setData((prev) => ({
            ...prev,
            permission_ids: [],
        }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/roles/${role.id}`, data, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    };

    const handleDelete = () => {
        if (role.slug === 'super-admin' || role.slug === 'super_admin') {
            alert('The Super Admin role cannot be deleted.');
            return;
        }
        if (role.users_count > 0) {
            alert(`Cannot delete role "${role.name}" because it is currently assigned to ${role.users_count} user(s).`);
            return;
        }
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(`/roles/${role.id}`, {
            onFinish: () => setDeleteModalOpen(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Role: ${role.name}`} />

            <div className="max-w-4xl mx-auto space-y-5 pb-12">
                {/* Standard Header */}
                <FormPageHeader
                    title={`Edit Role: ${role.name}`}
                    subtitle={`Configuring access rights for ${role.users_count} assigned user accounts`}
                    backUrl="/roles"
                    badge="Role Configuration"
                    actionSlot={
                        role.slug !== 'super-admin' ? (
                            <Button
                                variant="danger"
                                size="sm"
                                type="button"
                                onClick={handleDelete}
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                className="text-xs"
                            >
                                Delete Role
                            </Button>
                        ) : undefined
                    }
                />

                <form onSubmit={submit} className="space-y-5">
                    {/* Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold">Please fix the following errors:</span>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
                                    {Object.entries(errors).map(([key, msg]) => (
                                        <li key={key}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Card 1: Role Overview */}
                    <FormCard
                        title="Role Specifications"
                        description="Role identity and internal system description"
                        icon={<Shield className="w-5 h-5 text-emerald-600" />}
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Role Name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    error={errors.name}
                                    required
                                />

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        System Identifier (Slug)
                                    </label>
                                    <input
                                        type="text"
                                        value={role.slug}
                                        disabled
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-100 font-mono text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Generated automatically from role name</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    placeholder="Explain access capabilities and scope of this role..."
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </FormCard>

                    {/* Card 2: Permissions Assignment */}
                    <FormCard
                        title="Grant Module Permissions"
                        description="Check individual capabilities or select entire modules"
                        icon={<Key className="w-5 h-5 text-emerald-600" />}
                        action={
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                                >
                                    Select All ({permissionsList.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={deselectAll}
                                    className="px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                >
                                    Clear All
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            {/* Live Search */}
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Filter permissions by keyword..."
                                    value={permissionSearch}
                                    onChange={(e) => setPermissionSearch(e.target.value)}
                                    className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-slate-50/50"
                                />
                            </div>

                            <div className="text-xs text-emerald-800 font-semibold flex items-center justify-between pb-1 border-b border-gray-100">
                                <span>Selected Permissions</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                                    {data.permission_ids.length} of {permissionsList.length} granted
                                </span>
                            </div>

                            {/* Module Groups */}
                            <div className="space-y-4">
                                {moduleNames.map((module) => {
                                    const allModulePerms = groupedPermissions[module];
                                    const matchingPerms = allModulePerms.filter((p) =>
                                        p.name.toLowerCase().includes(permissionSearch.toLowerCase())
                                    );

                                    if (matchingPerms.length === 0) return null;

                                    const moduleIds = allModulePerms.map((p) => p.id);
                                    const allSelected = moduleIds.every((id) => data.permission_ids.includes(id));

                                    return (
                                        <div
                                            key={module}
                                            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-900">{module}</span>
                                                    <span className="text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                        {allModulePerms.length} total
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleModule(module)}
                                                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                                                >
                                                    {allSelected ? 'Deselect Module' : 'Select All in Module'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {matchingPerms.map((permission) => {
                                                    const isChecked = data.permission_ids.includes(permission.id);
                                                    return (
                                                        <label
                                                            key={permission.id}
                                                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                                                isChecked
                                                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium'
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => togglePermission(permission.id)}
                                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                            <span className="truncate">{permission.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </FormCard>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <Link href="/roles">
                            <Button type="button" variant="outline" size="sm">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            size="sm"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="text-xs"
                        >
                            Update Role
                        </Button>
                    </div>
                </form>
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                title="Delete Role"
                itemName={role.name}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </AuthenticatedLayout>
    );
}
