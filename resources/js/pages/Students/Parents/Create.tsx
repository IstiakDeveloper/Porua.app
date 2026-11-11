import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import {
    UserPlus,
    Mail,
    Phone,
    MapPin,
    User,
    Briefcase,
    Users,
    Sparkles,
    Shield,
    Lock,
    RefreshCw
} from 'lucide-react';
import QuickAssignModal from './QuickAssignModal';

interface Student {
    id: number;
    admission_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    school_class?: { name: string };
    section?: { name: string };
    user?: {
        name: string;
        email: string;
    };
}

interface SchoolClass {
    id: number;
    name: string;
    sections?: Array<{ id: number; name: string }>;
}

interface CreateProps {
    students: Student[];
    classes?: SchoolClass[];
}

export default function Create({ students, classes = [] }: CreateProps) {
    const [mode, setMode] = useState<'smart' | 'manual'>('smart');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        father_name: '',
        father_phone: '',
        father_occupation: '',
        mother_name: '',
        mother_phone: '',
        mother_occupation: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_relation: '',
        address: '',
        student_ids: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/student-parents');
    };

    const handleStudentToggle = (studentId: number) => {
        if (data.student_ids.includes(studentId)) {
            setData('student_ids', data.student_ids.filter(id => id !== studentId));
        } else {
            setData('student_ids', [...data.student_ids, studentId]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Parent" />

            <div className="space-y-4 max-w-5xl">
                {/* Standard Admin Header */}
                <FormPageHeader
                    title="Create Parent Account"
                    subtitle="Assign parent credentials or enter custom guardian details"
                    backUrl="/student-parents"
                    backLabel="Parents"
                    badgeText="Parent Portal"
                />

                {/* Mode Segmented Switcher */}
                <div className="flex items-center justify-between">
                    <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => setMode('smart')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                                mode === 'smart'
                                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Smart Mode
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('manual')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                                mode === 'manual'
                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <UserPlus className="w-3.5 h-3.5 text-slate-600" /> Manual Form (20 Fields)
                        </button>
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {mode === 'smart' ? 'Auto-fills name, phone & generates 4-digit PIN' : 'Detailed individual field entry'}
                    </span>
                </div>

                {mode === 'smart' ? (
                    <QuickAssignModal
                        embedded={true}
                        classes={classes}
                        onSuccess={() => router.visit('/student-parents')}
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Account Information Card */}
                        <FormCard
                            title="Account & Portal Login"
                            description="Credentials used by the parent to log in to the web and mobile app"
                            icon={<Shield className="w-4 h-4 text-emerald-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Parent Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Full name"
                                    />
                                    {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Username (Universal Login)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={e => setData('username', e.target.value)}
                                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="e.g. 01712345678 or p_1001"
                                    />
                                    {errors.username && <p className="mt-1 text-[11px] text-red-600">{errors.username}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="01XXXXXXXXX"
                                    />
                                    {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="parent@example.com"
                                    />
                                    {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium text-slate-700">
                                            Password / PIN <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const pin = Math.floor(1000 + Math.random() * 9000).toString();
                                                setData(prev => ({ ...prev, password: pin, password_confirmation: pin }));
                                            }}
                                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" /> Generate 4-Digit PIN
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Min 4 digits (e.g. 1234)"
                                    />
                                    {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Confirm Password / PIN <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Re-enter PIN"
                                    />
                                </div>
                            </div>
                        </FormCard>

                        {/* Father Information Card */}
                        <FormCard
                            title="Father Information"
                            description="Optional detailed records for school files"
                            icon={<User className="w-4 h-4 text-slate-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Father's Name</label>
                                    <input
                                        type="text"
                                        value={data.father_name}
                                        onChange={e => setData('father_name', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Father's Phone</label>
                                    <input
                                        type="text"
                                        value={data.father_phone}
                                        onChange={e => setData('father_phone', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Father's Occupation</label>
                                    <input
                                        type="text"
                                        value={data.father_occupation}
                                        onChange={e => setData('father_occupation', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Occupation"
                                    />
                                </div>
                            </div>
                        </FormCard>

                        {/* Mother Information Card */}
                        <FormCard
                            title="Mother Information"
                            description="Optional detailed records for school files"
                            icon={<User className="w-4 h-4 text-slate-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Mother's Name</label>
                                    <input
                                        type="text"
                                        value={data.mother_name}
                                        onChange={e => setData('mother_name', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Mother's Phone</label>
                                    <input
                                        type="text"
                                        value={data.mother_phone}
                                        onChange={e => setData('mother_phone', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Mother's Occupation</label>
                                    <input
                                        type="text"
                                        value={data.mother_occupation}
                                        onChange={e => setData('mother_occupation', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Occupation"
                                    />
                                </div>
                            </div>
                        </FormCard>

                        {/* Legal Guardian Information Card */}
                        <FormCard
                            title="Legal Guardian Information"
                            description="If student is under legal guardianship other than parents"
                            icon={<Users className="w-4 h-4 text-slate-600" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Name</label>
                                    <input
                                        type="text"
                                        value={data.guardian_name}
                                        onChange={e => setData('guardian_name', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Guardian name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Phone</label>
                                    <input
                                        type="text"
                                        value={data.guardian_phone}
                                        onChange={e => setData('guardian_phone', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
                                    <input
                                        type="text"
                                        value={data.guardian_relation}
                                        onChange={e => setData('guardian_relation', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="e.g. Uncle, Grandfather"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Present Address</label>
                                    <textarea
                                        rows={2}
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="Address line"
                                    />
                                </div>
                            </div>
                        </FormCard>

                        {/* Link Students Card */}
                        <FormCard
                            title="Link Students"
                            description="Select students that belong to this parent"
                            icon={<Users className="w-4 h-4 text-emerald-600" />}
                            action={
                                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    {data.student_ids.length} Selected
                                </span>
                            }
                        >
                            <div className="max-h-64 overflow-y-auto border border-slate-200/80 rounded-xl divide-y divide-slate-100">
                                {students.map((student) => (
                                    <label
                                        key={student.id}
                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                                            data.student_ids.includes(student.id) ? 'bg-indigo-50/40' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.student_ids.includes(student.id)}
                                            onChange={() => handleStudentToggle(student.id)}
                                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                        />
                                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 truncate">
                                                {student.first_name} {student.last_name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate">
                                                {student.admission_number} • {student.school_class?.name} {student.section?.name}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.student_ids && <p className="mt-1 text-[11px] text-red-600">{errors.student_ids}</p>}
                        </FormCard>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <Link href="/student-parents">
                                <Button variant="ghost" size="sm" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {processing ? 'Saving Parent...' : 'Save Parent Account'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
