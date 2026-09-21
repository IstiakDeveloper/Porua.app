import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, Trash2, Shield, Users, Key, Calendar } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    module: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    role: Role;
}

export default function Show({ role }: ShowProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
            router.delete(`/roles/${role.id}`);
        }
    };

    // Group permissions by module
    const permissionsList = Array.isArray(role.permissions) ? role.permissions : [];
    const groupedPermissions = permissionsList.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <AuthenticatedLayout>
            <Head title={`Role: ${role.name}`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            icon={<ArrowLeft className="w-5 h-5" />}
                            onClick={() => router.visit('/roles')}
                            className="hover:bg-purple-50 hover:text-purple-600"
                        >
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Role Details
                            </h1>
                            <p className="text-gray-600 mt-1">View role information and permissions</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/roles/${role.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Role
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            icon={<Trash2 className="w-5 h-5" />}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Role Overview Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-16 px-8 pb-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{role.name}</h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Key className="w-4 h-4" />
                                        <span className="text-sm">{permissionsList.length} permissions</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">{role.users_count} users</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">
                                            Created {new Date(role.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Permissions</p>
                                <p className="text-2xl font-bold text-gray-900">{permissionsList.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Assigned Users</p>
                                <p className="text-2xl font-bold text-gray-900">{role.users_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Modules</p>
                                <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedPermissions).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions by Module */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Permissions</h3>
                    {Object.entries(groupedPermissions).map(([module, permissions]) => (
                        <div key={module} className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                                <Key className="w-5 h-5 text-purple-600" />
                                {module} ({permissions.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {permissions.map((permission) => (
                                    <Badge key={permission.id} variant="purple" size="sm">
                                        {permission.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                    {permissionsList.length === 0 && (
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-12 text-center">
                            <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Permissions</h4>
                            <p className="text-gray-600 mt-1">This role has no permissions assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
