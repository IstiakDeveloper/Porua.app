import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    Users,
    Key,
    Search,
    ArrowRight,
    Eye,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { formatBdDate } from '@/utils/datetime';

interface Permission {
    id: number;
    name: string;
    slug?: string;
    module?: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    permissions?: Permission[];
    permissions_count?: number;
    users_count: number;
    created_at: string;
}

interface RolesIndexProps {
    roles: Role[];
    totalPermissions?: number;
}

export default function Index({ roles = [], totalPermissions = 0 }: RolesIndexProps) {
    const [search, setSearch] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

    const filteredRoles = roles.filter((role) => {
        const query = search.toLowerCase();
        return (
            role.name.toLowerCase().includes(query) ||
            role.slug.toLowerCase().includes(query) ||
            (role.description && role.description.toLowerCase().includes(query))
        );
    });

    const totalUsersAcrossRoles = roles.reduce((sum, r) => sum + (r.users_count || 0), 0);

    const openDelete = (role: Role) => {
        if (role.slug === 'super-admin' || role.slug === 'super_admin') {
            alert('The Super Admin role is protected by system policy and cannot be removed.');
            return;
        }
        if (role.users_count > 0) {
            alert(`Cannot delete role "${role.name}" because it is currently assigned to ${role.users_count} user(s). Reassign those users first.`);
            return;
        }
        setDeleteTarget(role);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/roles/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
            },
        });
    };

    const getRoleVariant = (slug: string) => {
        switch (slug) {
            case 'super-admin':
            case 'admin':
                return 'purple';
            case 'teacher':
                return 'success';
            case 'student':
                return 'default';
            case 'parent':
                return 'info';
            case 'accountant':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roles & Permissions" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">Roles & Permissions</h1>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                                {roles.length} roles
                            </span>
                        </div>
                        <p className="text-xs text-emerald-800/80 mt-0.5">
                            Configure operational roles, module access, and granular permission boundaries
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        <Link href="/permissions">
                            <Button size="sm" variant="secondary" icon={<Key className="w-3.5 h-3.5" />}>
                                Permissions Catalog
                            </Button>
                        </Link>
                        <Link href="/roles/create">
                            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                Create Role
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Defined Roles</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{roles.length}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Active Role Assignments</p>
                                <p className="text-xl font-bold text-emerald-700 mt-0.5">{totalUsersAcrossRoles}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">System Permissions</p>
                                <p className="text-xl font-bold text-indigo-700 mt-0.5">{totalPermissions || '—'}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Key className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-2xs">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Filter roles by name, slug or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                        />
                    </div>
                </div>

                {/* Roles Table */}
                <div className="bg-white rounded-xl border border-emerald-100 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Role Name & Slug
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Assigned Users
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Permissions Granted
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-emerald-900 uppercase tracking-wider w-28">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRoles.length > 0 ? (
                                    filteredRoles.map((role) => (
                                        <tr key={role.id} className="hover:bg-emerald-50/20 transition-colors">
                                            {/* Role Name */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/roles/${role.id}`}
                                                                className="text-xs font-bold text-gray-900 hover:text-emerald-700 transition-colors"
                                                            >
                                                                {role.name}
                                                            </Link>
                                                            <span className="font-mono text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                {role.slug}
                                                            </span>
                                                        </div>
                                                        {role.description && (
                                                            <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm line-clamp-1">
                                                                {role.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Users Count with Direct Link to Filtered Users Directory */}
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/users?role=${role.slug}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                    title={`View all users with ${role.name} role`}
                                                >
                                                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>{role.users_count} users</span>
                                                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                                                </Link>
                                            </td>

                                            {/* Permissions Badges */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {(role.permissions || []).slice(0, 3).map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                                                        >
                                                            {p.name}
                                                        </span>
                                                    ))}
                                                    {(role.permissions?.length || role.permissions_count || 0) > 3 && (
                                                        <Link
                                                            href={`/roles/${role.id}`}
                                                            className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200"
                                                        >
                                                            +{(role.permissions?.length || role.permissions_count || 0) - 3} more
                                                        </Link>
                                                    )}
                                                    {(role.permissions?.length || role.permissions_count || 0) === 0 && (
                                                        <span className="text-gray-400 text-xs italic">No permissions</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Created */}
                                            <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                                {formatBdDate(role.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/roles/${role.id}`}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                                        title="View Role & Permissions"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link
                                                        href={`/roles/${role.id}/edit`}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                                        title="Edit Role"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    {role.slug !== 'super-admin' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openDelete(role)}
                                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                            title="Delete Role"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-500">
                                            No roles found matching "{search}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                title="Delete Role"
                itemName={deleteTarget?.name || 'this role'}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </AuthenticatedLayout>
    );
}
