import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Lock,
    Shield,
    Camera,
    CheckCircle2,
    Users,
    Briefcase,
    Save,
    Edit3,
    X
} from 'lucide-react';

interface Child {
    id: number;
    full_name: string;
    photo: string | null;
    class_name: string;
    section_name: string;
}

interface Parent {
    father_name: string;
    father_occupation: string;
    father_phone: string;
    mother_name: string;
    mother_occupation: string;
    mother_phone: string;
    phone: string;
    email: string;
    address: string;
    photo: string | null;
}

export default function Profile({ parent, children = [] }: { parent: Parent; children: Child[] }) {
    const [editing, setEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        phone: parent.phone || '',
        email: parent.email || '',
        address: parent.address || '',
        father_phone: parent.father_phone || '',
        mother_phone: parent.mother_phone || '',
    });

    const photoForm = useForm({ photo: null as File | null });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const saveContact: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('parent.profile.update'), {
            onSuccess: () => setEditing(false)
        });
    };

    const uploadPhoto = () => {
        photoForm.post(route('parent.profile.photo'), {
            onSuccess: () => setPhotoPreview(null)
        });
    };

    const savePassword: FormEventHandler = (event) => {
        event.preventDefault();
        passwordForm.put(route('parent.profile.password'), {
            onSuccess: () => {
                passwordForm.reset();
            }
        });
    };

    const displayName = parent.father_name || parent.mother_name || 'Guardian Profile';

    return (
        <AuthenticatedLayout>
            <Head title="Guardian Profile & Security" />

            <ParentPage
                title="Guardian Profile & Security"
                subtitle="Manage registered contact details, residential address, and portal login PIN"
            >
                <div className="max-w-5xl mx-auto space-y-4">
                    {/* 1. Identity & Avatar Header Card */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    {photoPreview || parent.photo ? (
                                        <img
                                            src={photoPreview || parent.photo || ''}
                                            alt={displayName}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-2xs"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xl">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}

                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-indigo-700 transition-colors"
                                        title="Change Photo"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;
                                                photoForm.setData('photo', file);
                                                const reader = new FileReader();
                                                reader.onload = () => setPhotoPreview(String(reader.result || ''));
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                        {displayName}
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {parent.email || parent.phone || 'Authorized Guardian'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {children.map(child => (
                                            <span
                                                key={child.id}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/60"
                                            >
                                                Child: {child.full_name} ({child.class_name})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {photoPreview && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={uploadPhoto}
                                        disabled={photoForm.processing}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {photoForm.processing ? 'Uploading...' : 'Save New Photo'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPhotoPreview(null)}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Family & Contact Records Card */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-4 h-4 text-indigo-600" />
                                Family & Contact Information
                            </h3>
                            {!editing ? (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit Contact Info
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={saveContact} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {/* Father Records */}
                                <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Father's Record</p>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block">Full Name:</span>
                                        <span className="font-semibold text-slate-800">{parent.father_name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block">Occupation:</span>
                                        <span className="font-medium text-slate-700">{parent.father_occupation || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block mb-1">Mobile Phone:</span>
                                        {editing ? (
                                            <input
                                                type="text"
                                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-300"
                                                value={data.father_phone}
                                                onChange={(e) => setData('father_phone', e.target.value)}
                                            />
                                        ) : (
                                            <span className="font-mono font-medium text-slate-800">{parent.father_phone || '—'}</span>
                                        )}
                                        {errors.father_phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.father_phone}</p>}
                                    </div>
                                </div>

                                {/* Mother Records */}
                                <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mother's Record</p>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block">Full Name:</span>
                                        <span className="font-semibold text-slate-800">{parent.mother_name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block">Occupation:</span>
                                        <span className="font-medium text-slate-700">{parent.mother_occupation || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px] block mb-1">Mobile Phone:</span>
                                        {editing ? (
                                            <input
                                                type="text"
                                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-300"
                                                value={data.mother_phone}
                                                onChange={(e) => setData('mother_phone', e.target.value)}
                                            />
                                        ) : (
                                            <span className="font-mono font-medium text-slate-800">{parent.mother_phone || '—'}</span>
                                        )}
                                        {errors.mother_phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.mother_phone}</p>}
                                    </div>
                                </div>

                                {/* Primary Contact Mobile */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Primary Emergency Phone
                                    </label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    ) : (
                                        <p className="font-mono font-semibold text-slate-800 py-1">{parent.phone || '—'}</p>
                                    )}
                                    {errors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.phone}</p>}
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Email Address
                                    </label>
                                    {editing ? (
                                        <input
                                            type="email"
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    ) : (
                                        <p className="font-medium text-slate-800 py-1">{parent.email || '—'}</p>
                                    )}
                                    {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
                                </div>

                                {/* Residential Address */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Residential Address
                                    </label>
                                    {editing ? (
                                        <textarea
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 h-20"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-slate-800 py-1 leading-relaxed">{parent.address || '—'}</p>
                                    )}
                                    {errors.address && <p className="text-[10px] text-rose-600 mt-0.5">{errors.address}</p>}
                                </div>
                            </div>

                            {editing && (
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs disabled:opacity-60"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 3. Portal Security & Password Change */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                        <div className="pb-2 border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-indigo-600" />
                                Change Portal Login Password / PIN
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                You can set an easy 4-digit PIN or a secure password for quick login.
                            </p>
                        </div>

                        <form onSubmit={savePassword} className="space-y-3 max-w-lg">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Current Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="text-[10px] text-rose-600 mt-0.5">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        New Password / PIN <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Min 4 digits"
                                        required
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-[10px] text-rose-600 mt-0.5">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Confirm Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Re-type new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs disabled:opacity-60"
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    {passwordForm.processing ? 'Updating...' : 'Update Login Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </ParentPage>
        </AuthenticatedLayout>
    );
}
