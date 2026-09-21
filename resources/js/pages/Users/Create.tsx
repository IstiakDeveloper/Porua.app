import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import {
    User,
    Mail,
    Lock,
    Phone,
    ArrowLeft,
    Save,
    Shield,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface CreateProps {
    roles: Role[];
}

export default function Create({ roles }: CreateProps) {
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        role_ids: [] as number[],
        status: 'active',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/users', data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            }
        });
    };

    const toggleRoleSelection = (roleId: number) => {
        setData(prev => ({
            ...prev,
            role_ids: prev.role_ids.includes(roleId)
                ? prev.role_ids.filter(id => id !== roleId)
                : [...prev.role_ids, roleId]
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create User" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={() => router.visit('/users')}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Create User</h1>
                        </div>
                        <p className="text-xs text-gray-500 ml-7">Add a new user and assign roles</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {(errors?.role_ids || errors?.name || errors?.email || errors?.password) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <div>
                                <div className="font-medium">Please fix the highlighted fields.</div>
                                {errors.role_ids && <div className="text-xs mt-1">{errors.role_ids}</div>}
                            </div>
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-600" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <Input
                                label="Full Name"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                error={errors.name}
                                icon={<User className="w-4 h-4" />}
                                placeholder="Enter full name"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    error={errors.email}
                                    icon={<Mail className="w-4 h-4" />}
                                    placeholder="user@example.com"
                                    required
                                />

                                <Input
                                    type="tel"
                                    label="Phone Number"
                                    value={data.phone}
                                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                                    error={errors.phone}
                                    icon={<Phone className="w-4 h-4" />}
                                    placeholder="+880 1XXX-XXXXXX"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-600" />
                                Set Password
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">Minimum 8 characters</p>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    label="Password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    error={errors.password}
                                    icon={<Lock className="w-4 h-4" />}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    label="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                    error={errors.password_confirmation}
                                    icon={<Lock className="w-4 h-4" />}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gray-600" />
                                Roles
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">Select one or more roles</p>
                        </div>
                        <div className="p-4">
                            {errors.role_ids && (
                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                                    {errors.role_ids}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {roles.map((role) => {
                                    const isSelected = data.role_ids.includes(role.id);
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => toggleRoleSelection(role.id)}
                                            className={`p-3 rounded-lg border text-left transition-colors ${
                                                isSelected
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    <h3 className="text-sm font-medium">{role.name}</h3>
                                                </div>
                                                {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                            </div>
                                            {role.description && (
                                                <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {role.description}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {data.role_ids.length > 0 && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                    <span className="text-xs text-green-700">
                                        {data.role_ids.length} role{data.role_ids.length > 1 ? 's' : ''} selected
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Account Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setData({ ...data, status: 'active' })}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                    data.status === 'active'
                                        ? 'border-green-600 bg-green-600 text-white'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <div className="text-sm font-medium">Active</div>
                                </div>
                                <div className={`text-xs ${data.status === 'active' ? 'text-green-100' : 'text-gray-500'}`}>
                                    Can access system
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData({ ...data, status: 'inactive' })}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                    data.status === 'inactive'
                                        ? 'border-gray-600 bg-gray-600 text-white'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <div className="text-sm font-medium">Inactive</div>
                                </div>
                                <div className={`text-xs ${data.status === 'inactive' ? 'text-gray-100' : 'text-gray-500'}`}>
                                    Cannot access system
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/users')}
                            disabled={processing}
                            className="text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="text-sm bg-gray-900 hover:bg-gray-800 text-white"
                            icon={<Save className="w-4 h-4" />}
                        >
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
