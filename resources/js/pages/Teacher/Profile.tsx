import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    BookOpen,
    Camera,
    Lock,
    Save,
    Edit,
    X,
    CalendarClock,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
    Paperclip,
} from 'lucide-react';
import { formatBdDate, formatBdDateRange, formatDays, formatDaysCount } from '@/utils/datetime';

interface Subject {
    id: number;
    name: string;
    class: string;
    section: string;
}

interface LeaveBalance {
    leave_type_id: number;
    name: string;
    code: string;
    color: string;
    is_paid: boolean;
    days_allowed: number;
    days_used: number;
    days_remaining: number | null;
}

interface RecentLeave {
    id: number;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    admin_remarks: string | null;
    leave_type?: {
        name: string;
        code: string;
        color: string;
    };
}

interface LeaveType {
    id: number;
    name: string;
    code: string;
    days_per_year: number;
}

interface Teacher {
    id: number;
    full_name: string;
    employee_id: string;
    phone: string | null;
    email: string | null;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    designation: string;
    department: string;
    qualification: string;
    experience_years: number;
    joining_date: string;
    employment_status: string;
    bank_name: string | null;
    bank_account_number: string | null;
    basic_salary: number;
    subjects: Subject[];
}

interface Props {
    teacher: Teacher;
    leaveBalances?: LeaveBalance[];
    recentLeaves?: RecentLeave[];
    leaveTypes?: LeaveType[];
}

export default function Profile({
    teacher,
    leaveBalances = [],
    recentLeaves = [],
    leaveTypes = [],
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const leaveForm = useForm({
        leave_type_id: leaveTypes[0]?.id ? String(leaveTypes[0].id) : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        is_half_day: false,
        half_day_type: 'first_half',
        reason: '',
        attachment: null as File | null,
    });

    const handleApplyLeave = (e: React.FormEvent) => {
        e.preventDefault();
        leaveForm.post('/teacher/leaves', {
            onSuccess: () => {
                setLeaveModalOpen(false);
                leaveForm.reset();
            },
        });
    };

    const { data, setData, put, processing, errors, reset } = useForm({
        phone: teacher.phone || '',
        email: teacher.email || '',
        address: teacher.address || '',
        city: teacher.city || '',
        state: teacher.state || '',
        postal_code: teacher.postal_code || '',
        country: teacher.country || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('teacher.profile.update'), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('photo', file);
            router.post(route('teacher.profile.photo'), formData, {
                forceFormData: true,
                onSuccess: () => setPhotoPreview(null),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        My Profile
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setLeaveModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Apply for Leave
                        </button>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="My Profile" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Profile Header */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-6">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    {photoPreview || teacher.photo ? (
                                        <img
                                            src={photoPreview || `/storage/${teacher.photo}`}
                                            alt={teacher.full_name}
                                            className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200 shadow-lg">
                                            {teacher.full_name.charAt(0)}
                                        </div>
                                    )}
                                    <label
                                        htmlFor="photo-upload"
                                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-md"
                                    >
                                        <Camera className="h-5 w-5 text-gray-600" />
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{teacher.full_name}</h2>
                                    <p className="text-lg text-gray-600 mt-1">{teacher.designation}</p>
                                    <div className="flex items-center space-x-4 mt-3">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                            {teacher.employee_id}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-gray-300 text-gray-700">
                                            {teacher.department}
                                        </span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            teacher.employment_status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {teacher.employment_status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Personal Information */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <User className="mr-2 h-5 w-5 text-blue-600" />
                                        Personal Information
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 text-xs mb-1">Date of Birth</p>
                                            <p className="font-medium text-gray-900">{teacher.date_of_birth}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 text-xs mb-1">Gender</p>
                                            <p className="font-medium text-gray-900">{teacher.gender}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                        />
                                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                        />
                                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                                        Contact Information
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <textarea
                                            id="address"
                                            rows={2}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors resize-none"
                                        />
                                        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                id="city"
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                                State
                                            </label>
                                            <input
                                                id="state"
                                                type="text"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                                                Postal Code
                                            </label>
                                            <input
                                                id="postal_code"
                                                type="text"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <input
                                                id="country"
                                                type="text"
                                                value={data.country}
                                                onChange={(e) => setData('country', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                                        Employment Details
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 text-xs mb-1">Qualification</p>
                                            <p className="font-medium text-gray-900">{teacher.qualification}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 text-xs mb-1">Experience</p>
                                            <p className="font-medium text-gray-900">{teacher.experience_years} years</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 text-xs mb-1">Joining Date</p>
                                            <p className="font-medium text-gray-900">{teacher.joining_date}</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                            <p className="text-gray-600 text-xs mb-1">Basic Salary</p>
                                            <p className="font-semibold text-green-700">৳{teacher.basic_salary.toLocaleString()}</p>
                                        </div>
                                        {teacher.bank_name && (
                                            <>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-600 text-xs mb-1">Bank Name</p>
                                                    <p className="font-medium text-gray-900">{teacher.bank_name}</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-600 text-xs mb-1">Account Number</p>
                                                    <p className="font-medium text-gray-900">{teacher.bank_account_number}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Subjects */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                                        Assigned Subjects
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Subjects you are currently teaching</p>
                                </div>
                                <div className="p-6">
                                    {teacher.subjects.length > 0 ? (
                                        <div className="space-y-2">
                                            {teacher.subjects.map((subject) => (
                                                <div key={subject.id} className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:border-blue-300 transition-colors">
                                                    <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Class {subject.class} - {subject.section}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm text-center py-4">No subjects assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Leave Quota Balances & Recent Applications */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <CalendarClock className="mr-2 h-5 w-5 text-emerald-600" />
                                    Leave Balances & Applications
                                </h3>
                                <p className="text-sm text-gray-600 mt-0.5">Your official yearly leave quotas and recent request history</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/teacher/leaves"
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                                >
                                    Full Leave Portal &rarr;
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setLeaveModalOpen(true)}
                                    className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                                >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    Apply Leave
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Balances */}
                            {leaveBalances.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {leaveBalances.map((b) => (
                                        <div
                                            key={b.code}
                                            className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-800">{b.name}</span>
                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                    {b.code}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xl font-black text-slate-900">
                                                {b.days_remaining !== null ? formatDaysCount(b.days_remaining) : '—'}
                                                {b.days_allowed > 0 && (
                                                    <span className="text-[11px] font-normal text-slate-400 ml-1">/ {formatDaysCount(b.days_allowed)}d</span>
                                                )}
                                            </p>
                                            <span className="text-[10px] text-slate-500">Used: {formatDays(b.days_used)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent Applications */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Requests</h4>
                                {recentLeaves.length > 0 ? (
                                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                                        {recentLeaves.map((leave) => (
                                            <div key={leave.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {leave.leave_type?.name || 'Leave'}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            ({formatBdDateRange(leave.start_date, leave.end_date)} &bull; {formatDays(leave.total_days)})
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{leave.reason}</p>
                                                    {leave.admin_remarks && (
                                                        <p className="text-[10px] text-slate-400 italic">Admin note: {leave.admin_remarks}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    {leave.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                    {leave.status === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                                                            <CheckCircle2 className="w-3 h-3" /> Approved
                                                        </span>
                                                    )}
                                                    {leave.status === 'rejected' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 ring-1 ring-rose-600/20">
                                                            <XCircle className="w-3 h-3" /> Rejected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                                        No recent leave requests on record.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Apply Leave Modal */}
                    <Modal show={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} maxWidth="md">
                        <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-base font-bold text-slate-900">Apply for Leave</h3>
                                <button
                                    type="button"
                                    onClick={() => setLeaveModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Leave Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={leaveForm.data.leave_type_id}
                                    onChange={(e) => leaveForm.setData('leave_type_id', e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    required
                                >
                                    {leaveTypes.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Start Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveForm.data.start_date}
                                        onChange={(e) => {
                                            leaveForm.setData('start_date', e.target.value);
                                            if (leaveForm.data.end_date < e.target.value) {
                                                leaveForm.setData('end_date', e.target.value);
                                            }
                                        }}
                                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        End Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveForm.data.end_date}
                                        min={leaveForm.data.start_date}
                                        onChange={(e) => leaveForm.setData('end_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={leaveForm.data.is_half_day}
                                    onChange={(e) => leaveForm.setData('is_half_day', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium">Half Day Leave (0.5 day)</span>
                            </label>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Reason <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={leaveForm.data.reason}
                                    onChange={(e) => leaveForm.setData('reason', e.target.value)}
                                    placeholder="Explain your reason for leave..."
                                    rows={3}
                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Attachment (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => leaveForm.setData('attachment', e.target.files?.[0] || null)}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setLeaveModalOpen(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={leaveForm.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                >
                                    Submit Application
                                </Button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
