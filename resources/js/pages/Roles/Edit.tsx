import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import {
    Shield,
    ArrowLeft,
    Save,
    CheckCircle,
    Key,
    Trash2
} from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    module: string;
}

interface RoleData {
    id: number;
    name: string;
    permissions: Permission[];
    users_count: number;
}

interface EditProps {
    role: RoleData;
    permissions: Permission[];
}

export default function Edit({ role, permissions }: EditProps) {
    const [data, setData] = useState({
        name: role.name,
        permission_ids: role.permissions.map((p) => p.id),
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/roles/${role.id}`, data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            }
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`)) {
            router.delete(`/roles/${role.id}`);
        }
    };

    // Ensure permissions is always an array
    const permissionsList = Array.isArray(permissions) ? permissions : [];

    const groupedPermissions = permissionsList.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const togglePermission = (permissionId: number) => {
        setData(prev => ({
            ...prev,
            permission_ids: prev.permission_ids.includes(permissionId)
                ? prev.permission_ids.filter(id => id !== permissionId)
                : [...prev.permission_ids, permissionId]
        }));
    };

    const toggleModule = (module: string) => {
        const modulePermissions = groupedPermissions[module];
        const modulePermissionIds = modulePermissions.map(p => p.id);
        const allSelected = modulePermissionIds.every(id => data.permission_ids.includes(id));

        if (allSelected) {
            setData(prev => ({
                ...prev,
                permission_ids: prev.permission_ids.filter(id => !modulePermissionIds.includes(id))
            }));
        } else {
            setData(prev => ({
                ...prev,
                permission_ids: [...new Set([...prev.permission_ids, ...modulePermissionIds])]
            }));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Role" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            icon={<ArrowLeft className="w-5 h-5" />}
                            onClick={() => router.visit('/roles')}
                        >
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Edit Role
                            </h1>
                            <p className="text-gray-600 mt-1">Update role and manage permissions</p>
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        icon={<Trash2 className="w-5 h-5" />}
                    >
                        Delete Role
                    </Button>
                </div>

                {/* Current Role Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Editing: {role.name}</p>
                            <p className="text-xs text-blue-700">{role.users_count} users assigned to this role</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Role Name */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
                        <Input
                            label="Role Name"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            error={errors.name}
                            required
                            placeholder="Enter role name"
                        />
                    </div>

                    {/* Permissions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-purple-600" />
                            Assign Permissions
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Select permissions for this role. You can select all permissions in a module or choose individually.
                        </p>

                        <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                                const allSelected = modulePermissions.every(p => data.permission_ids.includes(p.id));
                                const someSelected = modulePermissions.some(p => data.permission_ids.includes(p.id));

                                return (
                                    <div key={module} className="border border-gray-200 rounded-lg p-4">
                                        {/* Module Header */}
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Key className="w-4 h-4 text-gray-700" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 capitalize">{module}</h4>
                                                    <p className="text-sm text-gray-500">{modulePermissions.length} permissions</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleModule(module)}
                                                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-2"
                                            >
                                                {allSelected ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Select All
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Module Permissions */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {modulePermissions.map((permission) => {
                                                const isSelected = data.permission_ids.includes(permission.id);
                                                return (
                                                    <label
                                                        key={permission.id}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                            isSelected
                                                                ? 'border-purple-500 bg-purple-50'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => togglePermission(permission.id)}
                                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                        />
                                                        <span className={`text-sm font-medium ${
                                                            isSelected ? 'text-purple-900' : 'text-gray-700'
                                                        }`}>
                                                            {permission.name.replace(/_/g, ' ')}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {permissionsList.length === 0 && (
                            <div className="text-center py-12">
                                <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h4 className="text-lg font-semibold text-gray-900">No Permissions Available</h4>
                                <p className="text-gray-600 mt-1">Please create permissions first.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-sm text-gray-600">
                            <strong>{data.permission_ids.length}</strong> permission(s) selected
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/roles')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                            >
                                {processing ? 'Updating...' : 'Update Role'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
