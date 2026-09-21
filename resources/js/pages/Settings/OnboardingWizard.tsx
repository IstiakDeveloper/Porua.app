import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import {
    Sparkles,
    Building2,
    BookOpen,
    GraduationCap,
    Layers,
    Calendar,
    Wallet,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Phone,
    Mail,
    MapPin,
    Globe,
    DollarSign,
    ShieldCheck,
    Check,
    User,
    Lock,
} from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
}

interface Account {
    id: number;
    account_name: string;
    account_type: string;
    current_balance: number;
}

interface Props {
    currentSettings: Record<string, string>;
    currentYear?: AcademicYear;
    primaryAccount?: Account;
    adminUser?: { name: string; email: string } | null;
    isFreshSetup?: boolean;
}

export default function OnboardingWizard({ currentSettings, currentYear, primaryAccount, adminUser, isFreshSetup = false }: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Institute Identity & Mode
    const [instituteType, setInstituteType] = useState<'school' | 'coaching' | 'hybrid'>(
        (currentSettings.institute_type as any) || 'coaching'
    );
    const [schoolName, setSchoolName] = useState(currentSettings.school_name || currentSettings.institute_name || '');
    const [schoolCode, setSchoolCode] = useState(currentSettings.school_code || '');
    const [schoolPhone, setSchoolPhone] = useState(currentSettings.school_phone || '');
    const [schoolEmail, setSchoolEmail] = useState(currentSettings.school_email || '');
    const [schoolAddress, setSchoolAddress] = useState(currentSettings.school_address || '');
    const [schoolWebsite, setSchoolWebsite] = useState(currentSettings.school_website || '');
    const [establishedYear, setEstablishedYear] = useState(currentSettings.established_year || '');
    const [currencySymbol, setCurrencySymbol] = useState(currentSettings.currency_symbol || '৳');
    const [invoiceFooter, setInvoiceFooter] = useState(
        currentSettings.invoice_footer_text || 'Thank you for your payment. Please preserve this computer-generated receipt.'
    );

    // Logo / Favicon
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>(
        currentSettings.school_logo ? `/storage/${currentSettings.school_logo}` : ''
    );
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string>(
        currentSettings.school_favicon ? `/storage/${currentSettings.school_favicon}` : ''
    );

    // Step 2: Academic Session
    const [sessionName, setSessionName] = useState(currentYear?.name || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    const [sessionStart, setSessionStart] = useState(currentYear?.start_date || `${new Date().getFullYear()}-01-01`);
    const [sessionEnd, setSessionEnd] = useState(currentYear?.end_date || `${new Date().getFullYear()}-12-31`);

    // Step 3: Operating Account
    const [accountName, setAccountName] = useState(primaryAccount?.account_name || 'Main Cash Counter');
    const [accountType, setAccountType] = useState(primaryAccount?.account_type || 'cash');
    const [openingBalance, setOpeningBalance] = useState(primaryAccount ? String(primaryAccount.current_balance) : '0');

    // Step 4: Super Admin Account
    const [adminName, setAdminName] = useState(adminUser?.name || '');
    const [adminEmail, setAdminEmail] = useState(adminUser?.email || '');
    const [adminPassword, setAdminPassword] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const setupError = errors.setup;
    const fieldErrors = Object.entries(errors).filter(([field]) => field !== 'setup');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFaviconFile(file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!schoolName.trim()) {
                alert('Please enter your Institute Name before continuing.');
                return;
            }
        }
        if (currentStep === 2) {
            if (!sessionName.trim()) {
                alert('Please enter an Academic Session Name.');
                return;
            }
        }
        if (currentStep === 3) {
            if (!accountName.trim()) {
                alert('Please provide a Primary Account Name.');
                return;
            }
        }
        setCurrentStep((prev) => Math.min(4, prev + 1));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!adminName.trim() || !adminEmail.trim()) {
            alert('Please specify Super Administrator name and email.');
            return;
        }
        if (!adminUser && adminPassword.length < 6) {
            alert('Admin password must be at least 6 characters.');
            return;
        }
        if (adminUser && adminPassword.length > 0 && adminPassword.length < 6) {
            alert('Admin password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append('institute_type', instituteType);
        formData.append('school_name', schoolName);
        formData.append('school_code', schoolCode);
        formData.append('school_phone', schoolPhone);
        formData.append('school_email', schoolEmail);
        formData.append('school_address', schoolAddress);
        formData.append('school_website', schoolWebsite);
        formData.append('established_year', establishedYear);
        formData.append('currency_symbol', currencySymbol);
        formData.append('invoice_footer_text', invoiceFooter);

        if (logoFile) formData.append('school_logo', logoFile);
        if (faviconFile) formData.append('school_favicon', faviconFile);

        formData.append('session_name', sessionName);
        formData.append('session_start', sessionStart);
        formData.append('session_end', sessionEnd);

        formData.append('account_name', accountName);
        formData.append('account_type', accountType);
        formData.append('opening_balance', openingBalance);

        formData.append('admin_name', adminName);
        formData.append('admin_email', adminEmail);
        formData.append('admin_password', adminPassword);

        router.post('/setup', formData, {
            forceFormData: true,
            onSuccess: () => {
                // Server will redirect to dashboard after Auth::login()
                setSubmitting(false);
            },
            onError: () => {
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const steps = [
        { num: 1, title: 'Identity & Mode', subtitle: 'Type, branding & contact' },
        { num: 2, title: 'Academic Session', subtitle: 'Current active year' },
        { num: 3, title: 'Financial Account', subtitle: 'Cash or bank counter' },
        { num: 4, title: 'Admin & Launch', subtitle: 'Credentials & initialize' },
    ];

    const wizardBody = (
        <div className="max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-6">
                {setupError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
                        {setupError}
                    </div>
                )}
                {fieldErrors.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                        <p className="font-semibold">Please correct the following fields before completing setup:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            {fieldErrors.map(([field, message]) => (
                                <li key={field}>{message}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* Wizard Header Banner (Clean Modern Light Theme) */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-3">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Multi-Institute White-Label Engine</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                Institute Setup & Onboarding Wizard
                            </h1>
                            <p className="text-slate-600 text-sm mt-1 max-w-xl">
                                Configure your school or coaching center branding, operating mode, academic calendar, and accounting in 4 simple steps.
                            </p>
                        </div>

                        <div className="hidden sm:block shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
                                <Building2 className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Step Progress Tracker (High Contrast Numbers) */}
                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {steps.map((s) => {
                            const isActive = s.num === currentStep;
                            const isCompleted = s.num < currentStep;
                            return (
                                <div
                                    key={s.num}
                                    onClick={() => isCompleted && setCurrentStep(s.num)}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                                        isCompleted ? 'cursor-pointer hover:bg-slate-50' : ''
                                    } ${isActive ? 'bg-indigo-50/80 border border-indigo-200/80 shadow-xs' : 'border border-transparent'}`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                            isActive
                                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                                                : isCompleted
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                                        }`}
                                    >
                                        {isCompleted ? <Check className="w-4 h-4 text-white stroke-[3]" /> : s.num}
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className={`text-xs font-bold truncate ${
                                                isActive
                                                    ? 'text-indigo-950'
                                                    : isCompleted
                                                    ? 'text-slate-900'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {s.title}
                                        </p>
                                        <p className={`text-[11px] truncate hidden md:block ${
                                            isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400'
                                        }`}>
                                            {s.subtitle}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step 1: Institute Identity & Mode */}
                {currentStep === 1 && (
                    <Card title="Step 1: Institute Mode & Identity">
                        <div className="space-y-6">
                            {/* Mode Cards */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Select Operating Mode *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* School Mode */}
                                    <div
                                        onClick={() => setInstituteType('school')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            instituteType === 'school'
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            {instituteType === 'school' && (
                                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">School / Madrasah</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Standard class & section promotions, terminal examinations, academic sessions, and library.
                                        </p>
                                    </div>

                                    {/* Coaching Mode */}
                                    <div
                                        onClick={() => setInstituteType('coaching')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            instituteType === 'coaching'
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            {instituteType === 'coaching' && (
                                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">Coaching Center</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Subject-based courses, batch enrollments, seat limits, teacher profit sharing, model tests & merit ranking.
                                        </p>
                                    </div>

                                    {/* Hybrid Mode */}
                                    <div
                                        onClick={() => setInstituteType('hybrid')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            instituteType === 'hybrid'
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            {instituteType === 'hybrid' && (
                                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">Hybrid (Dual Mode)</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Both School classes and Coaching batches run side-by-side with separate ledgers and shared biometric attendance.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Name & Code */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Institution / Coaching Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Focus Admission Coaching or Ideal School & College"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-base font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Short Code / Prefix
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. FOCUS-DHK"
                                        value={schoolCode}
                                        onChange={(e) => setSchoolCode(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-mono font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                    />
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Contact Phone
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="01700000000"
                                            value={schoolPhone}
                                            onChange={(e) => setSchoolPhone(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        />
                                        <Phone className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Official Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="info@institution.com"
                                            value={schoolEmail}
                                            onChange={(e) => setSchoolEmail(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        />
                                        <Mail className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Currency Symbol *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={currencySymbol}
                                            onChange={(e) => setCurrencySymbol(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                            required
                                        />
                                        <DollarSign className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Address & Established Year */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Campus Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Road #4, Farmgate, Dhaka"
                                            value={schoolAddress}
                                            onChange={(e) => setSchoolAddress(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        />
                                        <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Established Year
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2012"
                                        value={establishedYear}
                                        onChange={(e) => setEstablishedYear(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                    />
                                </div>
                            </div>

                            {/* Logo and Favicon Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Institute Logo (PNG, JPG, SVG)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Upload Logo</span>
                                            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Favicon (Browser Tab Icon)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                            {faviconPreview ? (
                                                <img src={faviconPreview} alt="Favicon Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <Globe className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Upload Favicon</span>
                                            <input type="file" accept="image/*" onChange={handleFaviconChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 2: Academic Session */}
                {currentStep === 2 && (
                    <Card title="Step 2: Academic Session / Operating Year">
                        <div className="space-y-5">
                            <p className="text-sm text-gray-600">
                                All student enrollments, batches, classes, and financial dues are anchored to an active session.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Active Session Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2026-2027 or Session 2026"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-base font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Session Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={sessionStart}
                                        onChange={(e) => setSessionStart(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Session End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={sessionEnd}
                                        onChange={(e) => setSessionEnd(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 3: Financial Account */}
                {currentStep === 3 && (
                    <Card title="Step 3: Initial Operating Financial Account">
                        <div className="space-y-5">
                            <p className="text-sm text-gray-600">
                                Porua.app includes built-in double-entry accounting. Specify the primary cash counter or bank account where student fee payments will initially be received.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Account Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Main Cash Drawer or Sonali Bank Principal Branch"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Account Type *
                                    </label>
                                    <select
                                        value={accountType}
                                        onChange={(e) => setAccountType(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                    >
                                        <option value="cash">Cash in Hand / Drawer</option>
                                        <option value="bank">Bank Account</option>
                                        <option value="mobile_banking">Mobile Banking (bKash / Nagad / Rocket)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Initial Opening Balance ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white text-emerald-800 border border-gray-300 rounded-lg text-base font-extrabold focus:bg-white focus:text-emerald-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                />
                                <p className="text-xs text-gray-400 mt-1">Starting cash/bank balance for your ledger.</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 4: Admin Account & Review Launch */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <Card title="Step 4: Create Master Administrator Account">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Define the Super Administrator account used to log in and manage your institution.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                            Admin Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                value={adminName}
                                                onChange={(e) => setAdminName(e.target.value)}
                                                className="w-full pl-9 pr-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                                placeholder="e.g. Principal / Director Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                            Admin Login Email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="email"
                                                value={adminEmail}
                                                onChange={(e) => setAdminEmail(e.target.value)}
                                                className="w-full pl-9 pr-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                                placeholder="e.g. admin@yourdomain.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                            Admin Password * (minimum 6 characters)
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="password"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                                className="w-full pl-9 pr-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-bold focus:bg-white focus:text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                                                placeholder="Enter secure password"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-amber-600 font-medium mt-1">
                                            Keep note of these credentials. You will be logged in automatically after setup.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Review Institute Configuration">
                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-emerald-900">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm">Everything is ready!</h4>
                                        <p className="text-xs text-emerald-700">
                                            Review your configuration below. Clicking &quot;Launch ERP&quot; will save all settings, establish the academic year, configure the operating account, create your admin profile, and redirect you to the portal.
                                        </p>
                                    </div>
                                </div>

                                {/* Summary Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs font-medium text-gray-500 block">Operating Mode</span>
                                        <span className="font-bold text-indigo-700 uppercase">{instituteType} Mode</span>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs font-medium text-gray-500 block">Institution Name</span>
                                        <span className="font-bold text-gray-900">{schoolName}</span>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs font-medium text-gray-500 block">Active Academic Session</span>
                                        <span className="font-bold text-gray-900">{sessionName}</span>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs font-medium text-gray-500 block">Primary Account</span>
                                        <span className="font-bold text-emerald-700">
                                            {accountName} (Balance: {currencySymbol}{openingBalance})
                                        </span>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 sm:col-span-2">
                                        <span className="text-xs font-medium text-gray-500 block">Master Admin Account</span>
                                        <span className="font-bold text-gray-900">
                                            {adminName} &bull; <span className="text-indigo-600">{adminEmail}</span>
                                        </span>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 sm:col-span-2">
                                        <span className="text-xs font-medium text-gray-500 block">Campus Address & Phone</span>
                                        <span className="font-medium text-gray-800">
                                            {schoolAddress || 'N/A'} {schoolPhone ? `| Tel: ${schoolPhone}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Previous Step</span>
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 px-6 shadow-md"
                            >
                                <span>Next: Step {currentStep + 1}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-2 px-8 py-3 text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                            >
                                <Sparkles className="w-5 h-5 text-amber-300" />
                                <span>{submitting ? 'Initializing ERP...' : 'Complete Setup & Launch ERP'}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
    );

    if (isFreshSetup) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
                <Head title="System Setup & Initialization - Porua ERP" />
                <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-tight text-slate-900">PORUA</span>
                            <span className="text-xs text-indigo-700 font-semibold ml-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                                Fresh System Setup
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-600 hidden sm:flex items-center gap-2 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Unconfigured Environment &bull; Complete wizard to launch</span>
                    </div>
                </header>

                <main className="flex-1 py-4">
                    {wizardBody}
                </main>

                <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
                    Porua Multi-Institute ERP Engine &bull; Self-Hosted Setup Wizard &bull; Light Theme
                </footer>
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Institute Setup & Onboarding Wizard" />
            {wizardBody}
        </AuthenticatedLayout>
    );
}
