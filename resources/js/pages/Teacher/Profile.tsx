import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
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
    X
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    class: string;
    section: string;
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
}

export default function Profile({ teacher }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        My Profile
                    </h2>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
