import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    RefreshCw,
    Trash2,
    Key,
    Lock,
    Search,
    Filter
} from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    module: string;
    created_at: string;
}

interface PermissionsIndexProps {
    permissions: Permission[];
}

export default function Index({ permissions }: PermissionsIndexProps) {
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');

    // Ensure permissions is always an array
    const permissionsList = Array.isArray(permissions) ? permissions : [];

    const handleSync = () => {
        if (confirm('This will sync all system permissions. Continue?')) {
            setSyncing(true);
            router.post('/permissions/sync', {}, {
                onFinish: () => setSyncing(false),
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}" permission?`)) {
            router.delete(`/permissions/${id}`);
        }
    };

    // Group permissions by module
    const groupedPermissions = permissionsList.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    // Get unique modules
    const modules = ['all', ...Object.keys(groupedPermissions)];

    // Filter permissions
    const filteredPermissions = permissionsList.filter(permission => {
        const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            permission.module.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = selectedModule === 'all' || permission.module === selectedModule;
        return matchesSearch && matchesModule;
    });

    const getModuleBadgeVariant = (module: string): any => {
        const variants: Record<string, any> = {
            'users': 'info',
            'roles': 'purple',
            'students': 'success',
            'teachers': 'warning',
            'academic': 'indigo',
            'attendance': 'cyan',
            'exams': 'pink',
            'fees': 'orange',
            'library': 'teal',
            'reports': 'purple',
        };
        return variants[module.toLowerCase()] || 'default';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Permissions Management" />

            <div className="space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Permissions Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage system permissions and access control</p>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        icon={syncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    >
                        {syncing ? 'Syncing...' : 'Sync Permissions'}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Permissions</p>
                                <p className="text-2xl font-bold text-gray-900">{permissionsList.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedPermissions).length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                                <Search className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Filtered Results</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredPermissions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search permissions by name or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none bg-white transition-all min-w-[200px]"
                            >
                                {modules.map(mod => (
                                    <option key={mod} value={mod} className="capitalize">
                                        {mod === 'all' ? 'All Modules' : mod}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {(searchTerm || selectedModule !== 'all') && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedModule('all');
                                }}
                                className="border border-gray-300"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Permissions Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Permission Name</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Module</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <span className="text-sm font-semibold text-gray-900">Created Date</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPermissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-100 rounded-full">
                                                    <Search className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">No permissions found</h3>
                                                    <p className="text-gray-600 mt-1">Try adjusting your search or filter criteria</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermissions.map((permission, index) => (
                                        <tr
                                            key={permission.id}
                                            className="hover:bg-purple-50/50 transition-colors duration-150 animate-fade-in"
                                            style={{ animationDelay: `${index * 20}ms` }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <Key className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{permission.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getModuleBadgeVariant(permission.module)} className="capitalize">
                                                    {permission.module}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(permission.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(permission.id, permission.name)}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer with count */}
                    {filteredPermissions.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium text-gray-900">{filteredPermissions.length}</span> of{' '}
                                <span className="font-medium text-gray-900">{permissionsList.length}</span> permissions
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
