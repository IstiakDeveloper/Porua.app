import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    GraduationCap,
    Calendar,
    DollarSign,
    Briefcase,
    MapPin,
    Camera,
    ChevronRight,
    Check,
    Building2,
    Trash2,
    BookOpen,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import DeleteModal from '@/Components/DeleteModal';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
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
    subjects: Subject[];
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface EditProps {
    teacher: Teacher;
}

export default function Edit({ teacher }: EditProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [data, setData] = useState({
        employee_id: teacher.employee_id || '',
        name: teacher.user?.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
        email: teacher.user?.email || teacher.email || '',
        phone: teacher.user?.phone || teacher.phone || '',
        date_of_birth: teacher.date_of_birth || '',
        gender: teacher.gender || 'male',
        blood_group: teacher.blood_group || '',
        religion: teacher.religion || 'Islam',
        nationality: teacher.nationality || 'Bangladeshi',
        designation: teacher.designation || '',
        department: teacher.department || '',
        nid_no: teacher.nid_no || '',
        emergency_contact: teacher.emergency_contact || '',
        present_address: teacher.present_address || '',
        permanent_address: teacher.permanent_address || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        experience_years: teacher.experience_years ? teacher.experience_years.toString() : '0',
        previous_experience: teacher.previous_experience || '',
        joining_date: teacher.joining_date || '',
        leaving_date: teacher.leaving_date || '',
        salary: teacher.salary ? teacher.salary.toString() : '',
        bank_name: teacher.bank_name || '',
        bank_account_no: teacher.bank_account_no || '',
        bank_branch: teacher.bank_branch || '',
        employment_type: teacher.employment_type || 'permanent',
        status: teacher.status || 'active',
        notes: teacher.notes || '',
        photo: null as File | null,
    });

    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photo);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value) {
                formData.append(key, value as File);
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value.toString());
            }
        });

        router.post(`/teachers/${teacher.id}`, formData, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        router.delete(`/teachers/${teacher.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData({ ...data, photo: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const steps = [
        { id: 1, title: 'Personal & Contact' },
        { id: 2, title: 'Academic & Qualifications' },
        { id: 3, title: 'Employment & Payroll' },
        { id: 4, title: 'Account & Photo' },
    ];

    const teacherFullName = teacher.user?.name || `${teacher.first_name} ${teacher.last_name}`;

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${teacherFullName} - Faculty Profile`} />

            <div className="space-y-4 pb-8 max-w-4xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Edit Faculty Profile"
                    subtitle={`Updating record for ${teacherFullName} (${teacher.employee_id})`}
                    backUrl="/teachers"
                    badges={[
                        { label: teacher.employee_id, variant: 'neutral' },
                        { label: `Step ${currentStep} of 4`, variant: 'indigo' },
                        {
                            label: data.status === 'active' ? 'Active' : data.status,
                            variant: data.status === 'active' ? 'success' : 'warning'
                        }
                    ]}
                    actions={
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Profile
                        </button>
                    }
                />

                {/* 2. STEPPER NAVIGATION WIZARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {steps.map((step) => {
                            const isCompleted = step.id < currentStep;
                            const isCurrent = step.id === currentStep;

                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                                        isCurrent
                                            ? 'bg-indigo-50 border border-indigo-200'
                                            : isCompleted
                                            ? 'hover:bg-slate-50'
                                            : 'hover:bg-slate-50 opacity-70'
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                            isCurrent
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : isCompleted
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-200 text-slate-600'
                                        }`}
                                    >
                                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                                    </div>
                                    <span
                                        className={`text-xs font-medium truncate ${
                                            isCurrent ? 'text-indigo-900 font-semibold' : 'text-slate-600'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. STEPPER FORM CONTAINER */}
                <form onSubmit={submit} className="space-y-4">
                    {/* STEP 1: PERSONAL & CONTACT */}
                    {currentStep === 1 && (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    Personal & Demographic Information
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Primary identity, contact details, and residential record</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData({ ...data, name: e.target.value })}
                                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                            placeholder="e.g. Dr. Mohammad Rafiqul Islam"
                                        />
                                    </div>
                                    {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Official Email <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData({ ...data, email: e.target.value })}
                                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                            placeholder="teacher@school.edu.bd"
                                        />
                                    </div>
                                    {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Phone Number <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone}
                                            onChange={(e) => setData({ ...data, phone: e.target.value })}
                                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                            placeholder="017XXXXXXXX"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Date of Birth <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="date"
                                            required
                                            value={data.date_of_birth}
                                            onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        />
                                    </div>
                                    {errors.date_of_birth && <p className="text-[11px] text-rose-500 mt-1">{errors.date_of_birth}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Gender <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData({ ...data, gender: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-[11px] text-rose-500 mt-1">{errors.gender}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                                    <select
                                        value={data.blood_group}
                                        onChange={(e) => setData({ ...data, blood_group: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="">Not Specified</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Religion</label>
                                    <select
                                        value={data.religion}
                                        onChange={(e) => setData({ ...data, religion: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="Islam">Islam</option>
                                        <option value="Hinduism">Hinduism</option>
                                        <option value="Buddhism">Buddhism</option>
                                        <option value="Christianity">Christianity</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                                    <input
                                        type="text"
                                        value={data.nationality}
                                        onChange={(e) => setData({ ...data, nationality: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="Bangladeshi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">National ID (NID)</label>
                                    <input
                                        type="text"
                                        value={data.nid_no}
                                        onChange={(e) => setData({ ...data, nid_no: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="10 / 17 digit NID or Smart Card No"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact}
                                        onChange={(e) => setData({ ...data, emergency_contact: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="Spouse / Parent contact number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Present Address</label>
                                    <textarea
                                        rows={2}
                                        value={data.present_address}
                                        onChange={(e) => setData({ ...data, present_address: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="House, Road, Area, Thana, District"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Address</label>
                                    <textarea
                                        rows={2}
                                        value={data.permanent_address}
                                        onChange={(e) => setData({ ...data, permanent_address: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="Village, Post Office, Thana, District"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ACADEMIC & QUALIFICATIONS */}
                    {currentStep === 2 && (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                                    Academic Record & Professional Experience
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Highest degree, subject specializations, and career history</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Qualification</label>
                                    <input
                                        type="text"
                                        value={data.qualification}
                                        onChange={(e) => setData({ ...data, qualification: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="e.g. M.Sc in Mathematics (DU), B.Ed"
                                    />
                                    {errors.qualification && <p className="text-[11px] text-rose-500 mt-1">{errors.qualification}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Major Specialization</label>
                                    <input
                                        type="text"
                                        value={data.specialization}
                                        onChange={(e) => setData({ ...data, specialization: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="e.g. Pure Mathematics, Applied Physics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teaching Experience (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.experience_years}
                                        onChange={(e) => setData({ ...data, experience_years: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Institutions & Experience Details</label>
                                <textarea
                                    rows={3}
                                    value={data.previous_experience}
                                    onChange={(e) => setData({ ...data, previous_experience: e.target.value })}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    placeholder="List previous schools, colleges, positions held and dates..."
                                />
                            </div>

                            <div className="pt-1">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes & Remarks</label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    placeholder="Internal remarks regarding performance, special assignments, or skills..."
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: EMPLOYMENT & PAYROLL */}
                    {currentStep === 3 && (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-indigo-600" />
                                    Employment Contract & Payroll Accounts
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Faculty designation, salary scale, and banking coordinates</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Employee ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.employee_id}
                                        onChange={(e) => setData({ ...data, employee_id: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 font-mono"
                                        placeholder="T0001"
                                    />
                                    {errors.employee_id && <p className="text-[11px] text-rose-500 mt-1">{errors.employee_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Designation <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.designation}
                                        onChange={(e) => setData({ ...data, designation: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="">Select Designation...</option>
                                        <option value="Head Teacher">Head Teacher</option>
                                        <option value="Assistant Head Teacher">Assistant Head Teacher</option>
                                        <option value="Senior Teacher">Senior Teacher</option>
                                        <option value="Assistant Teacher">Assistant Teacher</option>
                                        <option value="Junior Teacher">Junior Teacher</option>
                                        <option value="Guest Lecturer">Guest Lecturer</option>
                                        <option value="Physical Education Teacher">Physical Education Teacher</option>
                                        <option value="Computer Teacher">Computer Teacher</option>
                                    </select>
                                    {errors.designation && <p className="text-[11px] text-rose-500 mt-1">{errors.designation}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                                    <select
                                        value={data.department}
                                        onChange={(e) => setData({ ...data, department: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="">Select Department...</option>
                                        <option value="Science">Science</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="English">English</option>
                                        <option value="Bangla">Bangla</option>
                                        <option value="Social Science">Social Science</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Physical Education">Physical Education</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                                    <select
                                        value={data.employment_type}
                                        onChange={(e) => setData({ ...data, employment_type: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="permanent">Permanent / Regular</option>
                                        <option value="contract">Contractual</option>
                                        <option value="part_time">Part-time</option>
                                        <option value="probation">Probationary</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Joining Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={data.joining_date}
                                        onChange={(e) => setData({ ...data, joining_date: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    />
                                    {errors.joining_date && <p className="text-[11px] text-rose-500 mt-1">{errors.joining_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Leaving Date (if applicable)</label>
                                    <input
                                        type="date"
                                        value={data.leaving_date}
                                        onChange={(e) => setData({ ...data, leaving_date: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData({ ...data, status: e.target.value })}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="active">Active Duty</option>
                                        <option value="inactive">Inactive / On Leave</option>
                                        <option value="resigned">Resigned</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Monthly Salary (BDT)</label>
                                    <div className="relative">
                                        <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.salary}
                                            onChange={(e) => setData({ ...data, salary: e.target.value })}
                                            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                            placeholder="e.g. 35000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Account Sub-card */}
                            <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                                    Bank Coordinates for Salary Disbursal
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bank Name</label>
                                        <input
                                            type="text"
                                            value={data.bank_name}
                                            onChange={(e) => setData({ ...data, bank_name: e.target.value })}
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            placeholder="e.g. Sonali Bank PLC"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Branch Name</label>
                                        <input
                                            type="text"
                                            value={data.bank_branch}
                                            onChange={(e) => setData({ ...data, bank_branch: e.target.value })}
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            placeholder="e.g. Dhanmondi Branch"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={data.bank_account_no}
                                            onChange={(e) => setData({ ...data, bank_account_no: e.target.value })}
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                            placeholder="XXXXXXXXXXXXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: ACCOUNT & PHOTO */}
                    {currentStep === 4 && (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-5">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-indigo-600" />
                                    Profile Picture & Subject Allocations
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Update portrait photo and review linked academic responsibilities</p>
                            </div>

                            {/* Photo Upload Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="relative group shrink-0">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Faculty Avatar"
                                            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-400">
                                            <User className="w-8 h-8" />
                                            <span className="text-[10px] font-semibold mt-1">No Photo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center sm:text-left space-y-2">
                                    <div className="text-xs font-semibold text-slate-800">Faculty Portrait Image</div>
                                    <p className="text-[11px] text-slate-500">
                                        Upload a crisp passport-sized color photograph. Recommended 400x400px (Max 2MB, JPG/PNG).
                                    </p>
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg shadow-2xs hover:bg-indigo-50 cursor-pointer transition-colors">
                                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                        Choose New Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {errors.photo && <p className="text-[11px] text-rose-500">{errors.photo}</p>}
                                </div>
                            </div>

                            {/* Subject Assignment Callout */}
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                <div className="flex-1 text-xs">
                                    <h4 className="font-bold text-indigo-900 mb-1">Subject & Routine Allocations</h4>
                                    <p className="text-slate-600 leading-relaxed mb-2">
                                        Class and section-specific subject assignments are managed separately through the Subject Matrix.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => router.visit('/teachers/subjects')}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors shadow-2xs"
                                        >
                                            Open Teacher Subjects
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.visit('/teachers/subjects/schedule')}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
                                        >
                                            Open Timetable Schedule
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Review Card */}
                            <div className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 space-y-2">
                                <div className="text-xs font-bold text-slate-800">Profile Snapshot</div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase">Name</span>
                                        <span className="font-semibold text-slate-700">{data.name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase">Employee ID</span>
                                        <span className="font-mono font-semibold text-slate-700">{data.employee_id || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase">Designation</span>
                                        <span className="font-semibold text-slate-700">{data.designation || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase">Department</span>
                                        <span className="font-semibold text-slate-700">{data.department || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. FORM ACTION BUTTONS */}
                    <div className="flex items-center justify-between pt-2">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                                >
                                    Previous Step
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                                >
                                    Next Step
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {processing ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* 5. DELETE MODAL */}
                <DeleteModal
                    isOpen={showDeleteModal}
                    title="Delete Teacher Record"
                    message={`Are you sure you want to permanently delete "${teacherFullName}" (${teacher.employee_id})? This will remove all linked portal accounts and schedule assignments.`}
                    confirmLabel={isDeleting ? 'Deleting...' : 'Delete Faculty'}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setShowDeleteModal(false)}
                />
            </div>
        </AuthenticatedLayout>
    );
}
