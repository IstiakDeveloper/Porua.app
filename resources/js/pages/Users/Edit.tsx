import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
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
    EyeOff,
    Trash2,
    AtSign,
    Sparkles,
    Check,
    Calendar,
    Clock
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    slug?: string;
    description?: string;
}

interface UserData {
    id: number;
    name: string;
    username?: string | null;
    email: string;
    phone?: string | null;
    status: string;
    roles: Role[];
    created_at?: string;
    last_login_at?: string | null;
}

interface EditProps {
    user: UserData;
    roles: Role[];
}

export default function Edit({ user, roles = [] }: EditProps) {
    const [data, setData] = useState({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
        role_ids: user.roles ? user.roles.map((r) => r.id) : [],
        status: user.status || 'active',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const generateUsernameSuggestion = () => {
        let suggestion = '';
        if (data.phone) {
            const digits = data.phone.replace(/[^0-9]/g, '');
            if (digits.length >= 10) suggestion = digits;
        }
        if (!suggestion && data.email) {
            const prefix = data.email.split('@')[0];
            suggestion = prefix.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
        }
        if (!suggestion && data.name) {
            suggestion = data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        }
        if (suggestion) {
            setData((prev) => ({ ...prev, username: suggestion }));
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/users/${user.id}`, data, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    };

    const openDelete = () => setDeleteOpen(true);
    const closeDelete = () => {
        if (deleting) return;
        setDeleteOpen(false);
    };

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(`/users/${user.id}`, {
            onFinish: () => {
                setDeleting(false);
                closeDelete();
            },
        });
    };

    const toggleRoleSelection = (roleId: number) => {
        setData((prev) => ({
            ...prev,
            role_ids: prev.role_ids.includes(roleId)
                ? prev.role_ids.filter((id) => id !== roleId)
                : [...prev.role_ids, roleId],
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit User: ${user.name}`} />

            <div className="max-w-4xl mx-auto space-y-5 pb-10">
                {/* Standardized Form Page Header */}
                <FormPageHeader
                    title={`Edit User: ${user.name}`}
                    subtitle={`Manage account configuration for @${user.username || user.email}`}
                    backUrl="/users"
                    badge="Account Profile"
                    actionSlot={
                        <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            onClick={openDelete}
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            className="text-xs"
                        >
                            Delete User
                        </Button>
                    }
                />

                {/* Account Quick Overview Card */}
                <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-gray-900">{user.name}</h2>
                                    <Badge
                                        variant={user.status === 'active' ? 'success' : 'default'}
                                        size="sm"
                                    >
                                        {user.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2.5 mt-0.5 text-xs text-gray-500 font-mono">
                                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                        <AtSign className="w-3 h-3 text-emerald-600" />
                                        {user.username || 'no-username'}
                                    </span>
                                    <span>•</span>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {user.roles?.map((r, i) => (
                                <Badge key={i} variant="purple" size="sm">
                                    {r.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold">Please fix the following validation errors:</span>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
                                    {Object.entries(errors).map(([key, msg]) => (
                                        <li key={key}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Card 1: Identity & Contact Details */}
                    <FormCard
                        title="Identity & Contact Information"
                        description="User's official name, username handle, email, and contact number"
                        icon={<User className="w-5 h-5 text-emerald-600" />}
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    error={errors.name}
                                    icon={<User className="w-4 h-4" />}
                                    required
                                />

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Username <span className="text-slate-400 font-normal">(for login)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateUsernameSuggestion}
                                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            <Sparkles className="w-3 h-3" /> Auto-suggest
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
                                            @
                                        </div>
                                        <input
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData({ ...data, username: e.target.value.toLowerCase().trim() })}
                                            placeholder="username or phone"
                                            className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 font-mono ${
                                                errors.username ? 'border-rose-400' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Letters, numbers, underscores, dots, or dashes (3-50 chars).
                                    </p>
                                    {errors.username && (
                                        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.username}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    error={errors.email}
                                    icon={<Mail className="w-4 h-4" />}
                                    required
                                />

                                <Input
                                    type="tel"
                                    label="Mobile Phone Number"
                                    value={data.phone}
                                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                                    error={errors.phone}
                                    icon={<Phone className="w-4 h-4" />}
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>
                        </div>
                    </FormCard>

                    {/* Card 2: Role Assignment */}
                    <FormCard
                        title="Assigned Roles & Access Permissions"
                        description="Select the operational roles determining user permissions"
                        icon={<Shield className="w-5 h-5 text-emerald-600" />}
                    >
                        <div className="space-y-3">
                            {errors.role_ids && (
                                <p className="text-xs text-rose-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.role_ids}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {roles.map((role) => {
                                    const isSelected = data.role_ids.includes(role.id);
                                    return (
                                        <div
                                            key={role.id}
                                            onClick={() => toggleRoleSelection(role.id)}
                                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs'
                                                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <span className="text-xs font-semibold text-gray-900 block truncate">
                                                        {role.name}
                                                    </span>
                                                    {role.description && (
                                                        <span className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                                                            {role.description}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                                                        isSelected
                                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                                            : 'border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-gray-400">
                                Currently selected: <span className="font-semibold text-emerald-700">{data.role_ids.length} role(s)</span>
                            </p>
                        </div>
                    </FormCard>

                    {/* Card 3: Password Update (Optional) */}
                    <FormCard
                        title="Update Password"
                        description="Leave fields blank if you do not wish to change the password"
                        icon={<Lock className="w-5 h-5 text-emerald-600" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    New Password <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        placeholder="Leave blank to keep unchanged"
                                        className={`w-full pl-3 pr-10 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 ${
                                            errors.password ? 'border-rose-400' : 'border-gray-200'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                        placeholder="Confirm new password"
                                        className={`w-full pl-3 pr-10 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 ${
                                            errors.password_confirmation ? 'border-rose-400' : 'border-gray-200'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>
                    </FormCard>

                    {/* Card 4: Account Status */}
                    <FormCard
                        title="Account Status"
                        description="Control account access permissions"
                        icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'active', label: 'Active', desc: 'Can sign in and access permitted modules' },
                                { id: 'inactive', label: 'Inactive', desc: 'Account disabled temporarily' },
                                { id: 'suspended', label: 'Suspended', desc: 'Locked out from system' },
                            ].map((st) => {
                                const isSelected = data.status === st.id;
                                return (
                                    <label
                                        key={st.id}
                                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs'
                                                : 'bg-white border-slate-200/80 hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={st.id}
                                            checked={isSelected}
                                            onChange={(e) => setData({ ...data, status: e.target.value })}
                                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <span className="text-xs font-semibold text-gray-900 block">{st.label}</span>
                                            <span className="text-[11px] text-gray-500 block mt-0.5">{st.desc}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </FormCard>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <Link href="/users">
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
                            Update User
                        </Button>
                    </div>
                </form>
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteOpen}
                title="Delete User Account"
                itemName={user.name}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </AuthenticatedLayout>
    );
}
