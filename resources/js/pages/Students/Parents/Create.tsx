import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { ArrowLeft, UserPlus, Mail, Phone, MapPin, User, Briefcase, Users } from 'lucide-react';

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

interface CreateProps {
    students: Student[];
}

export default function Create({ students }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
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

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/student-parents"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Parents
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Create New Parent</h1>
                                <p className="text-gray-600 mt-1">Add a new parent account and link students</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="parent@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="+880 1XXX-XXXXXX"
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Father Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Father Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                                    <input
                                        type="text"
                                        value={data.father_name}
                                        onChange={e => setData('father_name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter father's name"
                                    />
                                    {errors.father_name && <p className="mt-1 text-sm text-red-600">{errors.father_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Phone</label>
                                    <input
                                        type="text"
                                        value={data.father_phone}
                                        onChange={e => setData('father_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="+880 1XXX-XXXXXX"
                                    />
                                    {errors.father_phone && <p className="mt-1 text-sm text-red-600">{errors.father_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Occupation</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.father_occupation}
                                            onChange={e => setData('father_occupation', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Engineer"
                                        />
                                    </div>
                                    {errors.father_occupation && <p className="mt-1 text-sm text-red-600">{errors.father_occupation}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Mother Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-pink-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Mother Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                                    <input
                                        type="text"
                                        value={data.mother_name}
                                        onChange={e => setData('mother_name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter mother's name"
                                    />
                                    {errors.mother_name && <p className="mt-1 text-sm text-red-600">{errors.mother_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Phone</label>
                                    <input
                                        type="text"
                                        value={data.mother_phone}
                                        onChange={e => setData('mother_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="+880 1XXX-XXXXXX"
                                    />
                                    {errors.mother_phone && <p className="mt-1 text-sm text-red-600">{errors.mother_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Occupation</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.mother_occupation}
                                            onChange={e => setData('mother_occupation', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Teacher"
                                        />
                                    </div>
                                    {errors.mother_occupation && <p className="mt-1 text-sm text-red-600">{errors.mother_occupation}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Guardian Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Guardian Information (Optional)</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                                    <input
                                        type="text"
                                        value={data.guardian_name}
                                        onChange={e => setData('guardian_name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter guardian name"
                                    />
                                    {errors.guardian_name && <p className="mt-1 text-sm text-red-600">{errors.guardian_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</label>
                                    <input
                                        type="text"
                                        value={data.guardian_phone}
                                        onChange={e => setData('guardian_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="+880 1XXX-XXXXXX"
                                    />
                                    {errors.guardian_phone && <p className="mt-1 text-sm text-red-600">{errors.guardian_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                                    <input
                                        type="text"
                                        value={data.guardian_relation}
                                        onChange={e => setData('guardian_relation', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Uncle, Aunt"
                                    />
                                    {errors.guardian_relation && <p className="mt-1 text-sm text-red-600">{errors.guardian_relation}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Address</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                                <textarea
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter complete address"
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                            </div>
                        </div>

                        {/* Link Students */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900">Link Students</h2>
                                    <p className="text-sm text-gray-600 mt-1">Select students to link with this parent (Hold Ctrl for multiple)</p>
                                </div>
                                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {data.student_ids.length} selected
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                <div className="divide-y divide-gray-200">
                                    {students.map((student) => (
                                        <label
                                            key={student.id}
                                            className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                data.student_ids.includes(student.id) ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.student_ids.includes(student.id)}
                                                onChange={() => handleStudentToggle(student.id)}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
                                                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {student.admission_number} • {student.school_class?.name} {student.section?.name}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {errors.student_ids && <p className="mt-2 text-sm text-red-600">{errors.student_ids}</p>}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-4">
                            <Link
                                href="/student-parents"
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <Button type="submit" disabled={processing} className="px-6 py-2.5">
                                {processing ? 'Creating...' : 'Create Parent'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
