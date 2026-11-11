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
    Lock,
    Camera,
    ChevronRight,
    Check,
    Building2,
    Shield
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

export default function Create() {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState({
        employee_id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        date_of_birth: '',
        gender: 'male',
        blood_group: '',
        religion: 'Islam',
        nationality: 'Bangladeshi',
        designation: '',
        department: '',
        nid_no: '',
        emergency_contact: '',
        present_address: '',
        permanent_address: '',
        qualification: '',
        specialization: '',
        experience_years: '',
        previous_experience: '',
        joining_date: '',
        leaving_date: '',
        salary: '',
        bank_name: '',
        bank_account_no: '',
        bank_branch: '',
        employment_type: 'permanent',
        status: 'active',
        notes: '',
        photo: null as File | null,
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value) {
                formData.append(key, value as File);
            } else if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        router.post('/teachers', formData, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
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

    return (
        <AuthenticatedLayout>
            <Head title="Onboard Teacher" />

            <div className="space-y-4 pb-8 max-w-4xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Faculty Onboarding Form"
                    subtitle="Register new teacher credentials, employment contracts, and academic specialization"
                    backUrl="/teachers"
                    badges={[
                        { label: `Step ${currentStep} of 4`, variant: 'neutral' },
                        { label: data.status === 'active' ? 'Active Status' : data.status, variant: 'success' }
                    ]}
                />

                {/* 2. STEPPER NAVIGATION WIZARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {steps.map((s) => {
                            const isDone = currentStep > s.id;
                            const isCurrent = currentStep === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setCurrentStep(s.id)}
                                    className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2.5 border ${
                                        isCurrent
                                            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-2xs ring-1 ring-indigo-200'
                                            : isDone
                                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                                            : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isCurrent
                                            ? 'bg-indigo-600 text-white'
                                            : isDone
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Step 0{s.id}</p>
                                        <p className="text-xs font-semibold truncate leading-tight">{s.title}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. STEPPER FORM CONTAINER */}
                <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
                    {/* STEP 1: PERSONAL & CONTACT */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <User className="w-4 h-4 text-indigo-600" />
                                Basic Identity & Personal Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Mohammad Aminul Islam"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                    {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Employee ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. EMP-2024-001"
                                        value={data.employee_id}
                                        onChange={(e) => setData({ ...data, employee_id: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                    {errors.employee_id && <p className="text-[11px] text-rose-600 mt-1">{errors.employee_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="teacher@institution.edu"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                    {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Phone Number <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="01XXXXXXXXX"
                                        value={data.phone}
                                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                    {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData({ ...data, gender: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                                        className="w-full text-xs py-2 px-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                                    <select
                                        value={data.blood_group}
                                        onChange={(e) => setData({ ...data, blood_group: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="">Select</option>
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
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Religion</label>
                                    <select
                                        value={data.religion}
                                        onChange={(e) => setData({ ...data, religion: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="Islam">Islam</option>
                                        <option value="Hinduism">Hinduism</option>
                                        <option value="Christianity">Christianity</option>
                                        <option value="Buddhism">Buddhism</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">National ID / Passport No</label>
                                    <input
                                        type="text"
                                        placeholder="National ID or Passport number"
                                        value={data.nid_no}
                                        onChange={(e) => setData({ ...data, nid_no: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Contact Phone</label>
                                    <input
                                        type="text"
                                        placeholder="Relative / Emergency phone"
                                        value={data.emergency_contact}
                                        onChange={(e) => setData({ ...data, emergency_contact: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ACADEMIC & QUALIFICATIONS */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <GraduationCap className="w-4 h-4 text-indigo-600" />
                                Educational & Experience Dossier
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Highest Qualification <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. M.Sc in Mathematics, B.Ed"
                                        value={data.qualification}
                                        onChange={(e) => setData({ ...data, qualification: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Subject Specialization</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Pure Mathematics, Physics, English Lit"
                                        value={data.specialization}
                                        onChange={(e) => setData({ ...data, specialization: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Years of Teaching Experience</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        placeholder="e.g. 5"
                                        value={data.experience_years}
                                        onChange={(e) => setData({ ...data, experience_years: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Previous Institution / Background</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dhaka Residential Model College"
                                        value={data.previous_experience}
                                        onChange={(e) => setData({ ...data, previous_experience: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: EMPLOYMENT & PAYROLL */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                Designation, Department & Payroll Records
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Teacher, Assistant Teacher"
                                        value={data.designation}
                                        onChange={(e) => setData({ ...data, designation: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Academic Department</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Science, Arts, Commerce"
                                        value={data.department}
                                        onChange={(e) => setData({ ...data, department: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
                                    <select
                                        value={data.employment_type}
                                        onChange={(e) => setData({ ...data, employment_type: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="permanent">Permanent</option>
                                        <option value="contractual">Contractual</option>
                                        <option value="part_time">Part Time</option>
                                        <option value="guest">Guest Lecturer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData({ ...data, status: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="resigned">Resigned</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Joining Date</label>
                                    <input
                                        type="date"
                                        value={data.joining_date}
                                        onChange={(e) => setData({ ...data, joining_date: e.target.value })}
                                        className="w-full text-xs py-2 px-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Basic Monthly Salary (৳)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 35000"
                                        value={data.salary}
                                        onChange={(e) => setData({ ...data, salary: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sonali Bank PLC"
                                        value={data.bank_name}
                                        onChange={(e) => setData({ ...data, bank_name: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Bank Account Number</label>
                                    <input
                                        type="text"
                                        placeholder="Account number"
                                        value={data.bank_account_no}
                                        onChange={(e) => setData({ ...data, bank_account_no: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Branch Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Motijheel Branch"
                                        value={data.bank_branch}
                                        onChange={(e) => setData({ ...data, bank_branch: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CREDENTIALS, PHOTO & ADDRESS */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <Lock className="w-4 h-4 text-indigo-600" />
                                Login Password, Avatar & Address
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Initial Login Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Minimum 4 characters"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white font-mono"
                                    />
                                    {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Teacher Photograph</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                    />
                                </div>
                            </div>

                            {photoPreview && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border" />
                                    <span className="text-xs text-slate-600 font-medium">New photo selected for upload</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Present Address</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Current residence address..."
                                        value={data.present_address}
                                        onChange={(e) => setData({ ...data, present_address: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Permanent Address</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Permanent home address..."
                                        value={data.permanent_address}
                                        onChange={(e) => setData({ ...data, permanent_address: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Administrative Notes / Remarks</label>
                                <textarea
                                    rows={2}
                                    placeholder="Internal notes about recruitment or service..."
                                    value={data.notes}
                                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                                    className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP NAVIGATION BUTTONS */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Back: Step 0{currentStep - 1}
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                                >
                                    Next: Step 0{currentStep + 1}
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {processing ? 'Registering Teacher...' : 'Save & Onboard Teacher'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
