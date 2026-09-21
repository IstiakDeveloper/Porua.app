import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { useInstitute } from '@/hooks/useInstitute';
import { BookOpen, ArrowLeft, Save, Calendar, Tag } from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    code: string | null;
    academic_year_id: number | null;
    fee_type: 'monthly' | 'one_time';
    standard_fee: string | number;
    description: string | null;
    status: 'active' | 'inactive';
}

interface Props {
    course: Course;
    academicYears: AcademicYear[];
}

export default function Edit({ course, academicYears }: Props) {
    const institute = useInstitute();

    const [name, setName] = useState(course.name || '');
    const [code, setCode] = useState(course.code || '');
    const [academicYearId, setAcademicYearId] = useState<string | number>(course.academic_year_id || '');
    const [feeType, setFeeType] = useState<'monthly' | 'one_time'>(course.fee_type || 'monthly');
    const [standardFee, setStandardFee] = useState(String(course.standard_fee) || '');
    const [description, setDescription] = useState(course.description || '');
    const [status, setStatus] = useState<'active' | 'inactive'>(course.status || 'active');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/courses/${course.id}`, {
            name,
            code: code || null,
            academic_year_id: academicYearId || null,
            fee_type: feeType,
            standard_fee: standardFee || 0,
            description: description || null,
            status,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Course: ${course.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/courses"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                            <p className="text-sm text-gray-500">
                                Update coaching course settings and standard fee rates
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card title="Course Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Course / Subject Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Course Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Academic Session
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={academicYearId}
                                        onChange={(e) => setAcademicYearId(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All / Any Session</option>
                                        {academicYears.map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Fee Billing Type *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setFeeType('monthly')}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                            feeType === 'monthly'
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-900">Monthly Recurring Fee</span>
                                            {feeType === 'monthly' && (
                                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                    Selected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Students pay tuition fees every month (মাসিক বেতন / টিউশন ফি).
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => setFeeType('one_time')}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                            feeType === 'one_time'
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-900">One-Time Course Package</span>
                                            {feeType === 'one_time' && (
                                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                    Selected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Fixed total course fee, payable at enrollment or in installments.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Standard Course Fee ({institute.currency_symbol}) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
                                        {institute.currency_symbol}
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={standardFee}
                                        onChange={(e) => setStandardFee(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Status *
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                                    className="w-full py-2.5 px-3.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Course Description & Syllabus Note
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href="/courses">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Update Course'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
