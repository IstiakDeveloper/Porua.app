import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Heart,
    Users,
    BookOpen,
    Camera,
    Edit3,
    Save,
    X,
    GraduationCap,
    Shield,
    CheckCircle2,
    Building2,
    ArrowLeft
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    user_id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    first_name_bengali: string | null;
    last_name_bengali: string | null;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    birth_certificate_no: string;
    religion: string;
    nationality: string;
    phone: string | null;
    email: string | null;
    present_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    admission_number: string;
    roll_number: string;
    class_name: string;
    section_name: string;
    academic_year: string;
    admission_date: string;
    father_name: string;
    father_phone: string;
    mother_name: string;
    mother_phone: string;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    photo_url: string | null;
    previous_school: string | null;
    previous_class: string | null;
    status: string;
}

interface Parent {
    id: number;
    name: string;
    relation: string;
    phone: string;
    email: string | null;
    occupation: string | null;
    is_primary_contact: boolean;
}

interface Props {
    student: Student;
    parents: Parent[];
}

export default function Profile({ student, parents = [] }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        phone: student.phone || '',
        email: student.email || '',
        present_address: student.present_address || '',
        medical_conditions: student.medical_conditions || '',
        allergies: student.allergies || '',
    });

    const photoForm = useForm({
        photo: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/student/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            photoForm.setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = () => {
        photoForm.post('/student/profile/photo', {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
            },
        });
    };

    const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: any }) => (
        <div className="py-2.5 flex items-start justify-between border-b border-slate-100 last:border-b-0 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                {label}
            </span>
            <span className="text-slate-800 font-semibold text-right break-words pl-4">
                {value || '—'}
            </span>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Student Profile - ${student.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Student Profile"
                    subtitle="Personal details, guardian connections, and academic dossier"
                    backUrl="/student/dashboard"
                    badges={[
                        { label: student.academic_year, variant: 'neutral' },
                        { label: student.status === 'active' ? 'Active Enrolment' : student.status, variant: student.status === 'active' ? 'success' : 'neutral' }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* LEFT COLUMN: IDENTITY & AVATAR CARD (4 COLS) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs text-center">
                            <div className="relative inline-block mx-auto mb-3">
                                <div className="w-28 h-28 rounded-2xl bg-indigo-50 border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
                                    {photoPreview || student.photo_url ? (
                                        <img
                                            src={photoPreview || student.photo_url!}
                                            alt={student.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-indigo-400" />
                                    )}
                                </div>
                                <label
                                    htmlFor="student-photo-upload"
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 shadow-xs transition-colors"
                                    title="Change Photo"
                                >
                                    <Camera className="w-4 h-4" />
                                </label>
                                <input
                                    id="student-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            {photoPreview && (
                                <div className="mb-4 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePhotoUpload}
                                        disabled={photoForm.processing}
                                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        Save Photo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPhotoPreview(null)}
                                        className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                {student.full_name}
                            </h2>
                            {student.first_name_bengali && (
                                <p className="text-xs text-slate-500 font-bengali">
                                    {student.first_name_bengali} {student.last_name_bengali}
                                </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <GraduationCap className="w-3 h-3" />
                                    Class {student.class_name} ({student.section_name})
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    Roll #{student.roll_number}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-left text-xs">
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Student ID / Adm No:</span>
                                    <span className="font-semibold text-slate-800">{student.admission_number}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Blood Group:</span>
                                    <span className="font-semibold text-rose-600">{student.blood_group || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Gender / Religion:</span>
                                    <span className="font-semibold text-slate-800">{student.gender} • {student.religion}</span>
                                </div>
                            </div>
                        </div>

                        {/* ACADEMIC SUMMARY CARD */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                Academic Details
                            </h3>
                            <div className="space-y-1 text-xs">
                                <InfoRow label="Academic Session" value={student.academic_year} />
                                <InfoRow label="Admission Date" value={student.admission_date} />
                                <InfoRow label="Previous School" value={student.previous_school} />
                                <InfoRow label="Previous Class" value={student.previous_class} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTACT, MEDICAL & GUARDIAN SECTIONS (8 COLS) */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* 1. CONTACT & MEDICAL INFORMATION (EDITABLE) */}
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-indigo-600" />
                                    <h3 className="text-sm font-semibold text-slate-900">Contact & Health Information</h3>
                                </div>
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit Details
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            reset();
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <div className="p-4 sm:p-5">
                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-3.5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
                                                <input
                                                    type="text"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                                    placeholder="01XXXXXXXXX"
                                                />
                                                {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                                    placeholder="student@example.com"
                                                />
                                                {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Present Address</label>
                                            <textarea
                                                rows={2}
                                                value={data.present_address}
                                                onChange={(e) => setData('present_address', e.target.value)}
                                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                                placeholder="Street address, apartment, road no"
                                            />
                                            {errors.present_address && <p className="text-rose-600 text-[11px] mt-1">{errors.present_address}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Medical Conditions (if any)</label>
                                                <input
                                                    type="text"
                                                    value={data.medical_conditions}
                                                    onChange={(e) => setData('medical_conditions', e.target.value)}
                                                    className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                                    placeholder="e.g. Asthma, None"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Allergies</label>
                                                <input
                                                    type="text"
                                                    value={data.allergies}
                                                    onChange={(e) => setData('allergies', e.target.value)}
                                                    className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                                    placeholder="e.g. Peanuts, Dust"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                                            >
                                                <Save className="w-3.5 h-3.5" />
                                                {processing ? 'Saving...' : 'Update Information'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                        <InfoRow label="Student Phone" value={student.phone} icon={Phone} />
                                        <InfoRow label="Student Email" value={student.email} icon={Mail} />
                                        <InfoRow label="Present Address" value={student.present_address} icon={MapPin} />
                                        <InfoRow label="Permanent Address" value={student.permanent_address} icon={MapPin} />
                                        <InfoRow label="City / Postal Code" value={`${student.city || ''} ${student.postal_code || ''}`.trim() || null} icon={MapPin} />
                                        <InfoRow label="Medical Conditions" value={student.medical_conditions} icon={Heart} />
                                        <InfoRow label="Allergies" value={student.allergies} icon={Heart} />
                                        <InfoRow label="Birth Certificate No" value={student.birth_certificate_no} icon={Shield} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. GUARDIAN & FAMILY CONNECTIONS */}
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <h3 className="text-sm font-semibold text-slate-900">Guardian & Parent Information</h3>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Father */}
                                    <div className="p-3.5 rounded-lg border border-slate-200/70 bg-slate-50/50">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Father's Details</span>
                                        <p className="text-xs font-bold text-slate-800">{student.father_name || 'Not Listed'}</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            {student.father_phone || 'No phone provided'}
                                        </p>
                                    </div>

                                    {/* Mother */}
                                    <div className="p-3.5 rounded-lg border border-slate-200/70 bg-slate-50/50">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mother's Details</span>
                                        <p className="text-xs font-bold text-slate-800">{student.mother_name || 'Not Listed'}</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            {student.mother_phone || 'No phone provided'}
                                        </p>
                                    </div>
                                </div>

                                {student.guardian_name && (
                                    <div className="p-3.5 rounded-lg border border-slate-200/70 bg-slate-50/50">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Local / Legal Guardian</span>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{student.guardian_name} ({student.guardian_relation || 'Guardian'})</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{student.guardian_phone || 'No phone'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {parents.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-700 mb-2">Registered Portal Parent Accounts</h4>
                                        <div className="space-y-2">
                                            {parents.map((parent) => (
                                                <div key={parent.id} className="p-2.5 rounded-lg border border-slate-200/70 bg-white flex items-center justify-between text-xs">
                                                    <div>
                                                        <span className="font-semibold text-slate-800">{parent.name}</span>
                                                        <span className="text-slate-400 mx-1.5">•</span>
                                                        <span className="text-slate-500">{parent.relation}</span>
                                                        <span className="text-slate-400 mx-1.5">•</span>
                                                        <span className="text-slate-500">{parent.phone}</span>
                                                    </div>
                                                    {parent.is_primary_contact && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            Primary Guardian
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
