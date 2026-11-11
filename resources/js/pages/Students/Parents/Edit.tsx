import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import {
    Save,
    Mail,
    Phone,
    MapPin,
    User,
    Briefcase,
    Users,
    Shield
} from 'lucide-react';

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

interface Parent {
    id: number;
    user_id: number;
    father_name: string | null;
    father_phone: string | null;
    father_occupation: string | null;
    mother_name: string | null;
    mother_phone: string | null;
    mother_occupation: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    address: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
        phone: string;
        username?: string | null;
    };
    students: Student[];
}

interface EditProps {
    parent: Parent;
    students: Student[];
}

export default function Edit({ parent, students }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: parent.user?.name || '',
        username: parent.user?.username || '',
        email: parent.user?.email || '',
        phone: parent.user?.phone || '',
        password: '',
        password_confirmation: '',
        father_name: parent.father_name || '',
        father_phone: parent.father_phone || '',
        father_occupation: parent.father_occupation || '',
        mother_name: parent.mother_name || '',
        mother_phone: parent.mother_phone || '',
        mother_occupation: parent.mother_occupation || '',
        guardian_name: parent.guardian_name || '',
        guardian_phone: parent.guardian_phone || '',
        guardian_relation: parent.guardian_relation || '',
        address: parent.address || '',
        student_ids: parent.students.map(s => s.id),
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/student-parents/${parent.id}`);
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
            <Head title={`Edit Parent - ${parent.user?.name || 'Record'}`} />

            <div className="space-y-4 max-w-5xl">
                {/* Standard Admin Header */}
                <FormPageHeader
                    title="Edit Parent Account"
                    subtitle="Update contact details, login credentials, and linked children"
                    backUrl="/student-parents"
                    backLabel="Parents"
                    badgeText={parent.user?.name || 'Parent Record'}
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Account Information Card */}
                    <FormCard
                        title="Account & Portal Login"
                        description="Credentials used by the parent to log in to the portal"
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
                                    placeholder="Username or Phone"
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
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Reset Password / PIN <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    placeholder="New 4-digit PIN"
                                />
                                {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Confirm New Password / PIN
                                </label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    placeholder="Confirm new PIN"
                                />
                            </div>
                        </div>
                    </FormCard>

                    {/* Father Information Card */}
                    <FormCard
                        title="Father Information"
                        description="Father's records for school documentation"
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
                        description="Mother's records for school documentation"
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
                        description="If student is under legal guardianship"
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
                                    placeholder="Relationship"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
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
                        title="Linked Students"
                        description="Select all students that belong to this parent account"
                        icon={<Users className="w-4 h-4 text-emerald-600" />}
                        action={
                            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                {data.student_ids.length} Linked
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
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
