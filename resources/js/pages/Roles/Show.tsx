import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import DeleteModal from '@/Components/DeleteModal';
import {
    Edit,
    Trash2,
    Shield,
    Users,
    Key,
    Calendar,
    AtSign,
    CheckCircle2,
    Mail,
    ArrowRight
} from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    slug?: string;
    module: string;
}

interface User {
    id: number;
    name: string;
    username?: string | null;
    email: string;
    status: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    permissions: Permission[];
    users?: User[];
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    role: Role;
}

export default function Show({ role }: ShowProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

    // Group permissions by module
    const permissionsList = Array.isArray(role.permissions) ? role.permissions : [];
    const groupedPermissions = permissionsList.reduce((acc, permission) => {
        const mod = permission.module || 'General';
        if (!acc[mod]) {
            acc[mod] = [];
        }
        acc[mod].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const moduleNames = Object.keys(groupedPermissions);

    return (
        <AuthenticatedLayout>
            <Head title={`Role: ${role.name}`} />

            <div className="max-w-5xl mx-auto space-y-5 pb-12">
                {/* Standard Header */}
                <FormPageHeader
                    title={`Role: ${role.name}`}
                    subtitle={`Access control configuration and permissions`}
                    backUrl="/roles"
                    badge="System Role"
                    actionSlot={
                        <div className="flex items-center gap-2">
                            <Link href={`/roles/${role.id}/edit`}>
                                <Button size="sm" icon={<Edit className="w-3.5 h-3.5" />} className="text-xs">
                                    Edit Role
                                </Button>
                            </Link>
                            {role.slug !== 'super-admin' && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleDelete}
                                    icon={<Trash2 className="w-3.5 h-3.5" />}
                                    className="text-xs"
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Hero Overview Card */}
                <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                                <Shield className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-lg font-bold text-gray-900">{role.name}</h1>
                                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                        {role.slug}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {role.description || 'No specific description provided for this role.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                            <Link
                                href={`/users?role=${role.slug}`}
                                className="text-center px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            >
                                <span className="text-[10px] text-emerald-600 font-semibold uppercase block">Assigned</span>
                                <span className="text-base font-bold text-emerald-800 font-mono block">
                                    {role.users_count} users
                                </span>
                            </Link>
                            <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] text-gray-500 font-semibold uppercase block">Permissions</span>
                                <span className="text-base font-bold text-gray-800 font-mono block">
                                    {permissionsList.length} granted
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left 2 Cols: Permissions Breakdown by Module */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Key className="w-4 h-4 text-emerald-600" />
                                    Granted Permissions by Module ({permissionsList.length})
                                </h2>
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                    {moduleNames.length} modules covered
                                </span>
                            </div>

                            <div className="mt-4 space-y-3.5">
                                {moduleNames.length > 0 ? (
                                    moduleNames.map((module) => (
                                        <div
                                            key={module}
                                            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-900">{module}</span>
                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    {groupedPermissions[module].length} permissions
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {groupedPermissions[module].map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-slate-800 border border-slate-200/90 shadow-2xs"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        {p.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-4 text-center">
                                        No permissions have been granted to this role yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Assigned Users Preview */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                    Assigned Users ({role.users_count})
                                </h3>
                                <Link
                                    href={`/users?role=${role.slug}`}
                                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-0.5"
                                >
                                    View All <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                {role.users && role.users.length > 0 ? (
                                    role.users.map((u) => (
                                        <Link
                                            key={u.id}
                                            href={`/users/${u.id}`}
                                            className="p-2.5 rounded-lg border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors flex items-center justify-between gap-2 group block"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-emerald-700">
                                                    {u.name}
                                                </p>
                                                <p className="text-[11px] text-gray-500 font-mono truncate flex items-center gap-0.5">
                                                    <AtSign className="w-3 h-3 text-gray-400" />
                                                    {u.username || u.email}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                                    u.status === 'active'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {u.status}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-4 text-center">
                                        No users currently assigned.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
