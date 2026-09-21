import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Shield, Users, Key } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    users_count: number;
    created_at: string;
}

interface RolesIndexProps {
    roles: Role[];
}

export default function Index({ roles }: RolesIndexProps) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete role "${name}"?`)) router.delete(`/roles/${id}`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roles" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage roles and permissions</p>
                    </div>
                    <Link href="/roles/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Create Role</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Users</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {roles.length > 0 ? roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                                    <Shield className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{role.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {(role.permissions || []).slice(0, 3).map((p, i) => (
                                                    <Badge key={i} variant="purple" size="sm">{p.name}</Badge>
                                                ))}
                                                {(role.permissions?.length || 0) > 3 && (
                                                    <Badge variant="default" size="sm">+{(role.permissions?.length || 0) - 3}</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="info" className="text-xs">{role.users_count} users</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(role.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/roles/${role.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDelete(role.id, role.name)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">No roles found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
