import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import DeleteModal from '@/Components/DeleteModal';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Users,
    GraduationCap,
    FileText,
    Heart,
    Download,
    DollarSign,
    CheckCircle,
    XCircle,
    Printer,
    CreditCard,
    Layers,
    Clock,
    BookOpen,
    ShieldCheck,
    ExternalLink,
    Sparkles,
    FileCheck
} from 'lucide-react';
import StudentPrintProfile from './StudentPrintProfile';
import StudentIDCard from './StudentIDCard';

const appName = import.meta.env.VITE_APP_NAME || 'School Management System';

export interface Student {
    id: number;
    user_id: number;
    academic_year_id: number;
    class_id: number;
    section_id: number;
    parent_id: number | null;
    admission_number: string;
    student_id: string | null;
    form_number: string | null;
    monthly_fee: string | null;
    roll_number: string | null;
    admission_date: string;
    first_name: string;
    last_name: string;
    first_name_bengali: string | null;
    last_name_bengali: string | null;
    name_bn: string | null;
    name_en: string | null;
    date_of_birth: string;
    birth_place_district: string | null;
    gender: string;
    blood_group: string | null;
    birth_certificate_no: string | null;
    birth_certificate_number: string | null;
    religion: string | null;
    nationality: string | null;
    minorities: boolean;
    minority_name: string | null;
    handicap: string | null;
    present_address: string | null;
    present_address_division: string | null;
    present_address_district: string | null;
    present_address_upazila: string | null;
    present_address_city: string | null;
    present_address_ward: string | null;
    present_address_village: string | null;
    present_address_house_number: string | null;
    present_address_post: string | null;
    present_address_post_code: string | null;
    permanent_address: string | null;
    permanent_address_division: string | null;
    permanent_address_district: string | null;
    permanent_address_upazila: string | null;
    permanent_address_city: string | null;
    permanent_address_ward: string | null;
    permanent_address_village: string | null;
    permanent_address_house_number: string | null;
    permanent_address_post: string | null;
    permanent_address_post_code: string | null;
    father_name: string | null;
    father_name_bn: string | null;
    father_name_en: string | null;
    father_phone: string | null;
    father_mobile: string | null;
    father_nid: string | null;
    father_dob: string | null;
    father_occupation: string | null;
    father_dead: boolean;
    mother_name: string | null;
    mother_name_bn: string | null;
    mother_name_en: string | null;
    mother_phone: string | null;
    mother_mobile: string | null;
    mother_nid: string | null;
    mother_dob: string | null;
    mother_occupation: string | null;
    mother_dead: boolean;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    previous_school: string | null;
    previous_class: string | null;
    previous_exam_result: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    special_notes: string | null;
    status: string;
    information_correct: boolean;
    photo: string | null;
    photo_url: string | null;
    email?: string;
    phone?: string;
    academic_year?: {
        id: number;
        name: string;
    };
    school_class?: {
        id: number;
        name: string;
    };
    section?: {
        id: number;
        name: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    parents?: Array<{
        id: number;
        relation?: string;
        father_name?: string;
        mother_name?: string;
        guardian_name?: string;
        user?: {
            id: number;
            name: string;
            username?: string;
            email: string;
            phone: string;
            status?: string;
        };
    }>;
    parent?: {
        id: number;
        relation?: string;
        user?: {
            id: number;
            name: string;
            username?: string;
            email: string;
            phone: string;
            status?: string;
        };
    };
    documents?: Array<{
        id: number;
        title: string;
        type: string;
        file_path: string;
    }>;
    attendance?: Array<{
        date: string;
        status: string;
    }>;
    fee_collections?: Array<{
        amount: number;
        date: string;
        status: string;
    }>;
    batch_enrollments?: Array<{
        id: number;
        status: string;
        agreed_fee: number | string;
        enrolled_date: string;
        batch?: {
            id: number;
            name: string;
            formatted_schedule?: string;
            course?: { id: number; name: string };
            teacher?: { first_name: string; last_name: string };
        };
    }>;
}

interface ShowProps {
    student: Student;
}

export default function Show({ student }: ShowProps) {
    const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'health' | 'fees'>('personal');
    const [showPrintProfile, setShowPrintProfile] = useState(false);
    const [showIDCard, setShowIDCard] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        router.delete(`/students/${student.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
            },
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getFullAddress = (prefix: 'present' | 'permanent') => {
        const parts = [
            student[`${prefix}_address_house_number`],
            student[`${prefix}_address_village`],
            student[`${prefix}_address_ward`] ? `Ward ${student[`${prefix}_address_ward`]}` : null,
            student[`${prefix}_address_upazila`],
            student[`${prefix}_address_district`],
            student[`${prefix}_address_division`],
            student[`${prefix}_address_post`] ? `Post: ${student[`${prefix}_address_post`]}` : null,
            student[`${prefix}_address_post_code`] ? `Postcode: ${student[`${prefix}_address_post_code`]}` : null,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : student[`${prefix}_address`] || 'Not provided';
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-none text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                    {icon}
                    {label}
                </span>
                <span className="text-slate-900 font-semibold text-right max-w-[65%] truncate">
                    {value}
                </span>
            </div>
        );
    };

    // Resolve linked parent record (either via student.parents array or student.parent)
    const linkedParent = (student.parents && student.parents.length > 0)
        ? student.parents[0]
        : (student.parent ? student.parent : null);

    return (
        <AuthenticatedLayout>
            <Head title={`Student: ${student.first_name} ${student.last_name}`} />

            <div className="space-y-4 max-w-6xl">
                {/* Standard Admin Header */}
                <FormPageHeader
                    title={`${student.first_name} ${student.last_name}`}
                    subtitle={`${student.school_class?.name || 'Class N/A'} • Sec: ${student.section?.name || 'A'} • Roll: ${student.roll_number || 'N/A'} • Adm: ${student.admission_number}`}
                    backUrl="/students"
                    backLabel="Students"
                    badgeText={student.status}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPrintProfile(!showPrintProfile)}
                                icon={<Printer className="w-3.5 h-3.5" />}
                            >
                                Profile Slip
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowIDCard(!showIDCard)}
                                icon={<CreditCard className="w-3.5 h-3.5" />}
                            >
                                ID Card
                            </Button>
                            <Link href={`/students/${student.id}/edit`}>
                                <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                                    icon={<Edit className="w-3.5 h-3.5" />}
                                >
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setDeleteModalOpen(true)}
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                                Delete
                            </Button>
                        </div>
                    }
                />

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* LEFT COLUMN: Identity, Academic Summary & Linked Parent Hub */}
                    <div className="space-y-4">
                        {/* Student Avatar & Basic Identity */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs text-center">
                            <div className="inline-block relative">
                                {student.photo_url ? (
                                    <img
                                        src={student.photo_url}
                                        alt=""
                                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 mx-auto"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-bold text-xl text-slate-700 mx-auto">
                                        {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                                    </div>
                                )}
                                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                                {student.first_name} {student.last_name}
                            </h3>

                            {(student.name_bn || student.first_name_bengali) && (
                                <p className="text-xs text-slate-500">
                                    {student.name_bn || `${student.first_name_bengali || ''} ${student.last_name_bengali || ''}`.trim()}
                                </p>
                            )}

                            <div className="mt-2 flex items-center justify-center gap-1.5">
                                <Badge
                                    variant={student.status === 'active' ? 'success' : 'default'}
                                    className="text-[10px] uppercase font-semibold"
                                >
                                    {student.status}
                                </Badge>
                                {student.information_correct && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">
                                        <CheckCircle className="w-2.5 h-2.5" /> Verified
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 text-left space-y-1">
                                <InfoRow label="Admission No" value={<span className="font-mono">{student.admission_number}</span>} />
                                {student.roll_number && <InfoRow label="Roll Number" value={<span className="font-mono">{student.roll_number}</span>} />}
                                {student.student_id && <InfoRow label="Student ID" value={<span className="font-mono">{student.student_id}</span>} />}
                                {student.form_number && <InfoRow label="Form No" value={<span className="font-mono">{student.form_number}</span>} />}
                            </div>
                        </div>

                        {/* LINKED PARENT PORTAL HUB CARD */}
                        <FormCard
                            title="Linked Parent Portal"
                            description="Family portal account & credentials"
                            icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
                        >
                            {linkedParent ? (
                                <div className="space-y-2 text-xs">
                                    <div className="p-2.5 bg-indigo-50/50 border border-indigo-100/70 rounded-xl space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-indigo-950">
                                                {linkedParent.user?.name || (linkedParent as any).father_name || 'Linked Parent'}
                                            </span>
                                            <span className="text-[10px] text-indigo-700 bg-white border border-indigo-200 px-1.5 py-0.2 rounded font-semibold capitalize">
                                                {linkedParent.relation || 'Parent'}
                                            </span>
                                        </div>

                                        {linkedParent.user?.username && (
                                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-indigo-100/60">
                                                <span className="text-slate-500">Username:</span>
                                                <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                    {linkedParent.user.username}
                                                </span>
                                            </div>
                                        )}

                                        {linkedParent.user?.phone && (
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500">Phone:</span>
                                                <a href={`tel:${linkedParent.user.phone}`} className="font-mono text-indigo-600 hover:underline">
                                                    {linkedParent.user.phone}
                                                </a>
                                            </div>
                                        )}

                                        {linkedParent.user?.email && (
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500">Email:</span>
                                                <span className="text-slate-600 truncate max-w-[150px]">
                                                    {linkedParent.user.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400">Guardian Profile</span>
                                        <Link
                                            href={`/student-parents/${linkedParent.id}`}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                        >
                                            View Parent <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-3 space-y-2">
                                    <div className="p-2.5 bg-amber-50 border border-amber-200/70 rounded-xl text-left">
                                        <p className="text-xs font-semibold text-amber-900">No Parent Account Linked</p>
                                        <p className="text-[11px] text-amber-700 mt-0.5">
                                            This student is not attached to an active parent portal login account yet.
                                        </p>
                                    </div>
                                    <Link href="/student-parents">
                                        <Button
                                            size="sm"
                                            className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs text-xs mt-1"
                                            icon={<Sparkles className="w-3.5 h-3.5" />}
                                        >
                                            Quick Assign Parent
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </FormCard>

                        {/* Academic Details Card */}
                        <FormCard
                            title="Academic Enrolment"
                            icon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
                        >
                            <div className="space-y-1 text-xs">
                                <InfoRow label="Academic Year" value={student.academic_year?.name || 'N/A'} />
                                <InfoRow label="Class" value={student.school_class?.name || 'N/A'} />
                                <InfoRow label="Section" value={student.section?.name || 'N/A'} />
                                <InfoRow label="Admission Date" value={formatDate(student.admission_date)} />
                                {student.monthly_fee && (
                                    <InfoRow
                                        label="Monthly Fee"
                                        value={<span className="font-mono text-emerald-700 font-bold">৳{student.monthly_fee}</span>}
                                    />
                                )}
                            </div>
                        </FormCard>

                        {/* Quick Contact Card */}
                        {(student.email || student.phone || student.user?.email || student.user?.phone) && (
                            <FormCard
                                title="Direct Contact"
                                icon={<Phone className="w-4 h-4 text-slate-600" />}
                            >
                                <div className="space-y-1 text-xs">
                                    {(student.phone || student.user?.phone) && (
                                        <InfoRow
                                            label="Phone"
                                            value={
                                                <a href={`tel:${student.phone || student.user?.phone}`} className="font-mono text-indigo-600 hover:underline">
                                                    {student.phone || student.user?.phone}
                                                </a>
                                            }
                                        />
                                    )}
                                    {(student.email || student.user?.email) && (
                                        <InfoRow
                                            label="Email"
                                            value={
                                                <a href={`mailto:${student.email || student.user?.email}`} className="text-indigo-600 hover:underline truncate">
                                                    {student.email || student.user?.email}
                                                </a>
                                            }
                                        />
                                    )}
                                </div>
                            </FormCard>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Tabbed Detail Sections */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('personal')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === 'personal'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                📋 Personal & Address
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('family')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === 'family'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                👨‍👩‍👧 Family & Guardians
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('health')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === 'health'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                🩺 Education & Health
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('fees')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === 'fees'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                💳 Fees & Batches
                            </button>
                        </div>

                        {/* TAB 1: Personal & Address */}
                        {activeTab === 'personal' && (
                            <div className="space-y-4">
                                <FormCard
                                    title="Personal Details"
                                    icon={<User className="w-4 h-4 text-slate-700" />}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                        <InfoRow label="Date of Birth" value={formatDate(student.date_of_birth)} />
                                        <InfoRow label="Gender" value={student.gender?.toUpperCase()} />
                                        <InfoRow label="Blood Group" value={student.blood_group} />
                                        <InfoRow label="Religion" value={student.religion} />
                                        <InfoRow label="Nationality" value={student.nationality || 'Bangladeshi'} />
                                        <InfoRow label="Birth District" value={student.birth_place_district} />
                                        {student.birth_certificate_no && (
                                            <InfoRow label="Birth Certificate #" value={<span className="font-mono">{student.birth_certificate_no}</span>} />
                                        )}
                                        {student.birth_certificate_number && (
                                            <InfoRow label="Birth Cert (Alt)" value={<span className="font-mono">{student.birth_certificate_number}</span>} />
                                        )}
                                    </div>

                                    {student.minorities && (
                                        <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-900">
                                            <strong>Minority Community:</strong> {student.minority_name || 'Yes'}
                                        </div>
                                    )}

                                    {student.handicap && (
                                        <div className="mt-2 p-2.5 bg-purple-50/70 border border-purple-200/70 rounded-lg text-xs text-purple-900">
                                            <strong>Special Needs / Disability:</strong> {student.handicap}
                                        </div>
                                    )}
                                </FormCard>

                                <FormCard
                                    title="Address Records"
                                    icon={<MapPin className="w-4 h-4 text-slate-700" />}
                                >
                                    <div className="space-y-2.5">
                                        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                                Present Address
                                            </span>
                                            <p className="text-xs text-slate-800">{getFullAddress('present')}</p>
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                                Permanent Address
                                            </span>
                                            <p className="text-xs text-slate-800">{getFullAddress('permanent')}</p>
                                        </div>
                                    </div>
                                </FormCard>
                            </div>
                        )}

                        {/* TAB 2: Family & Guardians */}
                        {activeTab === 'family' && (
                            <div className="space-y-4">
                                {/* Father Information */}
                                <FormCard
                                    title="Father's Information"
                                    icon={<User className="w-4 h-4 text-slate-700" />}
                                    action={
                                        student.father_dead ? (
                                            <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full">Deceased</span>
                                        ) : null
                                    }
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                        <InfoRow label="Name (EN)" value={student.father_name_en || student.father_name} />
                                        <InfoRow label="Name (BN)" value={student.father_name_bn} />
                                        <InfoRow label="Phone" value={student.father_phone || student.father_mobile} />
                                        <InfoRow label="NID" value={student.father_nid} />
                                        <InfoRow label="Date of Birth" value={formatDate(student.father_dob)} />
                                        <InfoRow label="Occupation" value={student.father_occupation} />
                                    </div>
                                </FormCard>

                                {/* Mother Information */}
                                <FormCard
                                    title="Mother's Information"
                                    icon={<User className="w-4 h-4 text-slate-700" />}
                                    action={
                                        student.mother_dead ? (
                                            <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full">Deceased</span>
                                        ) : null
                                    }
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                        <InfoRow label="Name (EN)" value={student.mother_name_en || student.mother_name} />
                                        <InfoRow label="Name (BN)" value={student.mother_name_bn} />
                                        <InfoRow label="Phone" value={student.mother_phone || student.mother_mobile} />
                                        <InfoRow label="NID" value={student.mother_nid} />
                                        <InfoRow label="Date of Birth" value={formatDate(student.mother_dob)} />
                                        <InfoRow label="Occupation" value={student.mother_occupation} />
                                    </div>
                                </FormCard>

                                {/* Legal Guardian */}
                                {(student.guardian_name || student.guardian_phone) && (
                                    <FormCard
                                        title="Legal Guardian (Other than Parents)"
                                        icon={<Users className="w-4 h-4 text-slate-700" />}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                            <InfoRow label="Guardian Name" value={student.guardian_name} />
                                            <InfoRow label="Relation" value={student.guardian_relation} />
                                            <InfoRow label="Phone" value={student.guardian_phone} />
                                        </div>
                                    </FormCard>
                                )}
                            </div>
                        )}

                        {/* TAB 3: Education & Health */}
                        {activeTab === 'health' && (
                            <div className="space-y-4">
                                <FormCard
                                    title="Previous Academic Background"
                                    icon={<BookOpen className="w-4 h-4 text-slate-700" />}
                                >
                                    {(student.previous_school || student.previous_class || student.previous_exam_result) ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Previous School</span>
                                                <p className="text-xs font-bold text-slate-800 mt-0.5">{student.previous_school || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Previous Class</span>
                                                <p className="text-xs font-bold text-slate-800 mt-0.5">{student.previous_class || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Exam Result / GPA</span>
                                                <p className="text-xs font-bold text-slate-800 mt-0.5">{student.previous_exam_result || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No previous academic background recorded.</p>
                                    )}
                                </FormCard>

                                <FormCard
                                    title="Health & Medical Alerts"
                                    icon={<Heart className="w-4 h-4 text-rose-600" />}
                                >
                                    {(student.medical_conditions || student.allergies || student.special_notes) ? (
                                        <div className="space-y-2.5">
                                            {student.medical_conditions && (
                                                <div className="p-2.5 bg-rose-50/70 border border-rose-200/70 rounded-xl">
                                                    <span className="text-[11px] font-bold text-rose-900 block">Medical Conditions</span>
                                                    <p className="text-xs text-rose-800 mt-0.5">{student.medical_conditions}</p>
                                                </div>
                                            )}
                                            {student.allergies && (
                                                <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl">
                                                    <span className="text-[11px] font-bold text-amber-900 block">Allergies</span>
                                                    <p className="text-xs text-amber-800 mt-0.5">{student.allergies}</p>
                                                </div>
                                            )}
                                            {student.special_notes && (
                                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                                    <span className="text-[11px] font-bold text-slate-700 block">Special Staff Notes</span>
                                                    <p className="text-xs text-slate-700 mt-0.5">{student.special_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No medical conditions or allergies reported.</p>
                                    )}
                                </FormCard>
                            </div>
                        )}

                        {/* TAB 4: Fees & Batches */}
                        {activeTab === 'fees' && (
                            <div className="space-y-4">
                                <FormCard
                                    title="Fee Collections History"
                                    icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                                >
                                    {student.fee_collections && student.fee_collections.length > 0 ? (
                                        <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50 border-b border-slate-200/80">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600">Date</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600">Amount</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {student.fee_collections.map((fee, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/70">
                                                            <td className="px-3 py-1.5">{formatDate(fee.date)}</td>
                                                            <td className="px-3 py-1.5 font-bold font-mono text-emerald-700">৳{fee.amount}</td>
                                                            <td className="px-3 py-1.5 capitalize text-slate-700">{fee.status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No fee collection records yet.</p>
                                    )}
                                </FormCard>

                                <FormCard
                                    title="Student Document Vault"
                                    icon={<FileCheck className="w-4 h-4 text-indigo-600" />}
                                    action={
                                        <Link href={`/students/${student.id}/documents`}>
                                            <Button size="sm" variant="outline" className="text-xs">
                                                Manage Documents
                                            </Button>
                                        </Link>
                                    }
                                >
                                    {student.documents && student.documents.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {student.documents.map((doc) => (
                                                <div key={doc.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-slate-800 truncate">{doc.title}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-mono">{doc.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No uploaded documents.</p>
                                    )}
                                </FormCard>
                            </div>
                        )}
                    </div>
                </div>

                {/* Print Profile View Toggle */}
                {showPrintProfile && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <StudentPrintProfile student={student} appName={appName} />
                    </div>
                )}

                {/* ID Card View Toggle */}
                {showIDCard && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <StudentIDCard student={student} appName={appName} />
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Student Record"
                message="Are you sure you want to delete this student? All attendance, document links, and profile history will be permanently deleted."
                itemName={`${student.first_name} ${student.last_name}`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
