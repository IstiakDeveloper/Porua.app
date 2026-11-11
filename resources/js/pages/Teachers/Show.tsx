import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import DeleteModal from '@/Components/DeleteModal';
import {
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    GraduationCap,
    Briefcase,
    DollarSign,
    BookOpen,
    Building2,
    CreditCard,
    FileText,
    Heart,
    Globe,
    Flag,
    Printer,
    IdCard,
    Clock,
    Home,
    ShieldAlert,
    ExternalLink,
    ChevronRight,
    Layers,
    UserCheck
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface TeacherSubject {
    id: number;
    subject: Subject;
    classes: SchoolClass[];
}

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    blood_group: string | null;
    religion: string | null;
    nationality: string | null;
    designation: string | null;
    department: string | null;
    nid_no: string | null;
    emergency_contact: string | null;
    present_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    qualification: string;
    specialization: string | null;
    experience_years: number;
    previous_experience: string | null;
    joining_date: string;
    leaving_date: string | null;
    salary: number;
    bank_name: string | null;
    bank_account_no: string | null;
    bank_branch: string | null;
    employment_type: string | null;
    status: string;
    photo: string | null;
    notes: string | null;
    subjects_count: number;
    teacher_subjects?: TeacherSubject[];
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface ShowProps {
    teacher: Teacher;
}

export default function Show({ teacher }: ShowProps) {
    const [imageError, setImageError] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'subjects' | 'payroll'>('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        router.delete(`/teachers/${teacher.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        });
    };

    const handlePrintProfile = () => {
        window.open(`/teachers/${teacher.id}/print-profile`, '_blank');
    };

    const handlePrintIdCard = () => {
        window.open(`/teachers/${teacher.id}/print-id-card`, '_blank');
    };

    const getTeacherImageUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        if (photo.startsWith('storage/')) return `/${photo}`;
        return `/storage/${photo}`;
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const teacherDisplayName = teacher.user?.name || teacher.full_name || `${teacher.first_name} ${teacher.last_name}`;

    return (
        <AuthenticatedLayout>
            <Head title={`${teacherDisplayName} - Faculty Record`} />

            <div className="space-y-4 pb-8 max-w-6xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Faculty Dossier"
                    subtitle="Institutional record, academic allocation, and personnel background"
                    backUrl="/teachers"
                    badges={[
                        { label: teacher.employee_id, variant: 'neutral' },
                        { label: teacher.department || 'General', variant: 'indigo' },
                        {
                            label: teacher.status === 'active' ? 'Active' : teacher.status,
                            variant: teacher.status === 'active' ? 'success' : 'warning'
                        }
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrintProfile}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden sm:inline">Print</span> Profile
                            </button>
                            <button
                                type="button"
                                onClick={handlePrintIdCard}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                            >
                                <IdCard className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden sm:inline">Print</span> ID Card
                            </button>
                            <Link
                                href={`/teachers/${teacher.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    }
                />

                {/* 2. FACULTY EXECUTIVE IDENTITY BANNER */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {teacher.photo && !imageError ? (
                                <img
                                    src={getTeacherImageUrl(teacher.photo) || ''}
                                    alt={teacherDisplayName}
                                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-sm"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`} />
                        </div>

                        {/* Name & Primary Meta */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{teacherDisplayName}</h2>
                                <p className="text-xs font-medium text-slate-500">
                                    {teacher.designation || 'Teacher'} • {teacher.department || 'Department N/A'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 font-mono">
                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                    {teacher.employee_id}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {teacher.email || 'No email registered'}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {teacher.phone || 'No phone registered'}
                                </span>
                            </div>
                        </div>

                        {/* 4 Mini Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2 shrink-0 w-full md:w-auto">
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center min-w-[90px]">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                                <span className="text-sm font-bold text-slate-800">{teacher.experience_years || 0} yrs</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center min-w-[90px]">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Subjects</span>
                                <span className="text-sm font-bold text-slate-800">{teacher.subjects_count || 0}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center min-w-[90px]">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Salary</span>
                                <span className="text-sm font-bold text-slate-800">৳{Number(teacher.salary || 0).toLocaleString()}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center min-w-[90px]">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contract</span>
                                <span className="text-xs font-bold text-slate-800 capitalize">
                                    {teacher.employment_type?.replace('_', ' ') || 'Permanent'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. TAB NAVIGATION */}
                <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === 'overview'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Academic & Qualifications
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('personal')}
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === 'personal'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <User className="w-3.5 h-3.5" />
                        Personal & Demographics
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('subjects')}
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === 'subjects'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        Assigned Subjects ({teacher.teacher_subjects?.length || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('payroll')}
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === 'payroll'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CreditCard className="w-3.5 h-3.5" />
                        Employment & Banking
                    </button>
                </div>

                {/* 4. TAB CONTENTS */}
                <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 p-5 shadow-2xs space-y-4">
                    {/* TAB 1: ACADEMIC & QUALIFICATIONS */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Highest Qualification
                                    </span>
                                    <p className="text-xs font-semibold text-slate-800">{teacher.qualification || 'Not specified'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Subject Specialization
                                    </span>
                                    <p className="text-xs font-semibold text-slate-800">{teacher.specialization || 'General'}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Career History & Previous Experience
                                </span>
                                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {teacher.previous_experience || 'No previous institutional experience recorded.'}
                                </p>
                            </div>

                            {teacher.notes && (
                                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Administrative Remarks
                                    </span>
                                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {teacher.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: PERSONAL & DEMOGRAPHICS */}
                    {activeTab === 'personal' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Date of Birth</span>
                                    <span className="text-xs font-semibold text-slate-800">{formatDate(teacher.date_of_birth)}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Gender</span>
                                    <span className="text-xs font-semibold text-slate-800 capitalize">{teacher.gender || 'N/A'}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Blood Group</span>
                                    <span className="text-xs font-semibold text-rose-600">{teacher.blood_group || 'N/A'}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Religion</span>
                                    <span className="text-xs font-semibold text-slate-800">{teacher.religion || 'Islam'}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Nationality</span>
                                    <span className="text-xs font-semibold text-slate-800">{teacher.nationality || 'Bangladeshi'}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">National ID (NID)</span>
                                    <span className="text-xs font-semibold font-mono text-slate-800">{teacher.nid_no || 'N/A'}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Emergency Contact</span>
                                    <span className="text-xs font-semibold text-slate-800">{teacher.emergency_contact || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <Home className="w-3.5 h-3.5 text-indigo-600" />
                                        Present Residential Address
                                    </div>
                                    <p className="text-xs text-slate-600 pl-5">{teacher.present_address || 'No present address recorded.'}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                        Permanent Address
                                    </div>
                                    <p className="text-xs text-slate-600 pl-5">{teacher.permanent_address || 'No permanent address recorded.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ASSIGNED SUBJECTS */}
                    {activeTab === 'subjects' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">Course & Subject Allocations</h4>
                                    <p className="text-[11px] text-slate-500">Subjects assigned across multiple class sections</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/teachers/subjects')}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    Manage Matrix
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>

                            {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 ? (
                                <>
                                    {/* Mobile Cards View */}
                                    <div className="block md:hidden space-y-2.5">
                                        {teacher.teacher_subjects.map((ts) => (
                                            <div key={ts.id} className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/40 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-800">{ts.subject?.name}</span>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                                                        {ts.subject?.code}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {ts.classes && ts.classes.length > 0 ? (
                                                        ts.classes.map((cls) => (
                                                            <span
                                                                key={cls.id}
                                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                                                            >
                                                                {cls.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400">All Sections</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200/80">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                                <tr>
                                                    <th className="px-4 py-2.5">Subject Name</th>
                                                    <th className="px-4 py-2.5">Subject Code</th>
                                                    <th className="px-4 py-2.5">Allocated Classes & Sections</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {teacher.teacher_subjects.map((ts) => (
                                                    <tr key={ts.id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="px-4 py-3 font-semibold text-slate-800">{ts.subject?.name}</td>
                                                        <td className="px-4 py-3 font-mono text-slate-600">{ts.subject?.code}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {ts.classes && ts.classes.length > 0 ? (
                                                                    ts.classes.map((cls) => (
                                                                        <span
                                                                            key={cls.id}
                                                                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                                                                        >
                                                                            {cls.name}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-slate-400">Unassigned</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">No subjects currently assigned to this faculty member.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: EMPLOYMENT & BANKING */}
                    {activeTab === 'payroll' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Joining Date</span>
                                    <span className="text-xs font-semibold text-slate-800">{formatDate(teacher.joining_date)}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Leaving Date</span>
                                    <span className="text-xs font-semibold text-slate-800">{teacher.leaving_date ? formatDate(teacher.leaving_date) : 'Active / Present'}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Contract Status</span>
                                    <span className="text-xs font-semibold text-slate-800 capitalize">{teacher.status}</span>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Basic Salary</span>
                                    <span className="text-xs font-bold text-slate-800">৳{Number(teacher.salary || 0).toLocaleString()} /mo</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3">
                                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                                    Disbursal Bank Coordinates
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Bank Name</span>
                                        <span className="text-xs font-medium text-slate-800">{teacher.bank_name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Branch</span>
                                        <span className="text-xs font-medium text-slate-800">{teacher.bank_branch || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Account Number</span>
                                        <span className="text-xs font-mono font-medium text-slate-800">{teacher.bank_account_no || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. DELETE CONFIRMATION MODAL */}
                <DeleteModal
                    isOpen={showDeleteModal}
                    title="Delete Teacher Record"
                    message={`Are you sure you want to permanently delete "${teacherDisplayName}" (${teacher.employee_id})? This will revoke faculty access and unlink all academic assignments.`}
                    confirmLabel={isDeleting ? 'Deleting...' : 'Delete Faculty'}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setShowDeleteModal(false)}
                />
            </div>
        </AuthenticatedLayout>
    );
}
