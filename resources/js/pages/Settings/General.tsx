import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, Building2, Image as ImageIcon, Globe, Phone, Mail, MapPin, DollarSign, Calendar, FileText, GraduationCap, Target, Layers, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
    settings: Record<string, string>;
}

export default function General({ settings }: Props) {
    const [name, setName] = useState(settings.institute_name || settings.school_name || '');
    const [code, setCode] = useState(settings.school_code || '');
    const [email, setEmail] = useState(settings.school_email || '');
    const [phone, setPhone] = useState(settings.school_phone || '');
    const [address, setAddress] = useState(settings.school_address || '');
    const [website, setWebsite] = useState(settings.school_website || '');
    const [establishedYear, setEstablishedYear] = useState(settings.established_year || '');
    const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '৳');
    const [invoiceFooterText, setInvoiceFooterText] = useState(
        settings.invoice_footer_text || 'Thank you for your payment. Please keep this receipt for future reference.'
    );
    const [instituteType, setInstituteType] = useState(settings.institute_type || 'school');

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>(settings.school_logo_url || '/logo.png');

    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string>(settings.school_favicon_url || '/logo.png');

    const [processing, setProcessing] = useState(false);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('school_name', name);
        formData.append('institute_name', name);
        formData.append('school_code', code);
        formData.append('school_email', email);
        formData.append('school_phone', phone);
        formData.append('school_address', address);
        formData.append('school_website', website);
        formData.append('established_year', establishedYear);
        formData.append('currency_symbol', currencySymbol);
        formData.append('invoice_footer_text', invoiceFooterText);
        formData.append('institute_type', instituteType);

        if (logoFile) {
            formData.append('school_logo', logoFile);
        }
        if (faviconFile) {
            formData.append('school_favicon', faviconFile);
        }

        router.post('/settings', formData, {
            onFinish: () => setProcessing(false),
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Institute & General Settings" />
            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Institute & General Settings</h1>
                            <p className="text-gray-600 text-sm">
                                Configure institution name, branding logo, receipt contacts, and defaults
                            </p>
                        </div>
                    </div>
                </div>

                {/* Onboarding Wizard Quick Banner */}
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <Sparkles className="w-6 h-6 text-amber-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-base">New Institute Onboarding Wizard</h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Deploying this system for a new school or coaching client? Launch the guided 4-step wizard to setup branding, operating mode, session, and financial accounts in 2 minutes.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/setup"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition shrink-0"
                    >
                        <span>Launch Setup Wizard</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Branding Section */}
                    <Card title="Institute Branding & Logos">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                            {/* Logo */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                                <div className="w-24 h-24 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                                    <img
                                        src={logoPreview}
                                        alt="Institute Logo Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="space-y-2 flex-1 text-center sm:text-left">
                                    <label className="block text-sm font-semibold text-gray-800">
                                        Primary Institute Logo
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Displayed in navigation, reports, invoices, and ID cards (PNG, JPG, SVG, max 2MB).
                                    </p>
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg cursor-pointer shadow-sm transition">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Change Logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Favicon */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                                <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                                    <img
                                        src={faviconPreview}
                                        alt="Favicon Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="space-y-2 flex-1 text-center sm:text-left">
                                    <label className="block text-sm font-semibold text-gray-800">
                                        Browser Tab Favicon
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Small icon shown in the browser tab and shortcuts (max 1MB).
                                    </p>
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg cursor-pointer shadow-sm transition">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Change Favicon</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFaviconChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Operating Mode Selection */}
                    <Card title="Institute Operating Mode">
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Select how your institution operates. Navigation menus, terminology (Classes vs Batches, Promotions, etc.), and academic workflows will adapt instantly.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                {/* School Mode */}
                                <div
                                    onClick={() => setInstituteType('school')}
                                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        instituteType === 'school'
                                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-lg ${instituteType === 'school' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        {instituteType === 'school' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">School / Madrasah Mode</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Standard academic structure: Academic Years, Classes, Sections, Roll numbers, and annual Student Promotions.
                                    </p>
                                    <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                                        Terms: <strong>Class • Section • Roll No • Promotion</strong>
                                    </div>
                                </div>

                                {/* Coaching Mode */}
                                <div
                                    onClick={() => setInstituteType('coaching')}
                                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        instituteType === 'coaching'
                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-lg ${instituteType === 'coaching' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            <Target className="w-5 h-5" />
                                        </div>
                                        {instituteType === 'coaching' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">Coaching Center Mode</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Modular course structure: Courses, Batches, Day-wise Schedules, Flexible shifts, and multi-batch enrollments.
                                    </p>
                                    <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                                        Terms: <strong>Course • Batch • Student ID • Enrollment</strong>
                                    </div>
                                </div>

                                {/* Hybrid Mode */}
                                <div
                                    onClick={() => setInstituteType('hybrid')}
                                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        instituteType === 'hybrid'
                                            ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-lg ${instituteType === 'hybrid' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        {instituteType === 'hybrid' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">Hybrid Mode (Dual)</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Unified dual operation: Run regular school classes alongside specialized coaching batches under one ERP.
                                    </p>
                                    <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                                        Terms: <strong>Classes & Courses • Batches • Full Access</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Basic Information */}
                    <Card title="Institution Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Institute / School / Coaching Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm font-medium"
                                    placeholder="e.g. Cambridge School / Prime Science Coaching"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This name will appear on all money receipts, student ID cards, headers, and reports.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Institution Code / Short Name
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. PSC-2025"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Established Year
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={establishedYear}
                                        onChange={(e) => setEstablishedYear(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. 2018"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Contact Phone Number *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="+8801700-000000"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="info@institute.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Website URL
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="https://institute.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Currency Symbol
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={currencySymbol}
                                        onChange={(e) => setCurrencySymbol(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="৳ or Tk or $"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Full Address *
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={2}
                                        className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Road/Holding, Post, Upazila, District"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Money Receipt Footer Note
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none text-gray-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <textarea
                                        value={invoiceFooterText}
                                        onChange={(e) => setInvoiceFooterText(e.target.value)}
                                        rows={2}
                                        className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Note printed at the bottom of student fee receipts..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button type="submit" disabled={processing} className="px-6 py-2.5 font-medium shadow-md">
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
