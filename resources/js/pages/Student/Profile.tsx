import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Heart,
    Users,
    BookOpen,
    Camera,
    Edit,
    Save,
    X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';

interface Student {
    id: number;
    user_id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    first_name_bengali: string | null;
    last_name_bengali: string | null;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    birth_certificate_no: string;
    religion: string;
    nationality: string;
    phone: string | null;
    email: string | null;
    present_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    admission_number: string;
    roll_number: string;
    class_name: string;
    section_name: string;
    academic_year: string;
    admission_date: string;
    father_name: string;
    father_phone: string;
    mother_name: string;
    mother_phone: string;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    photo_url: string | null;
    previous_school: string | null;
    previous_class: string | null;
    status: string;
}

interface Parent {
    id: number;
    name: string;
    relation: string;
    phone: string;
    email: string | null;
    occupation: string | null;
    is_primary_contact: boolean;
}

interface Props {
    student: Student;
    parents: Parent[];
}

export default function Profile({ student, parents }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        phone: student.phone || '',
        email: student.email || '',
        present_address: student.present_address || '',
        medical_conditions: student.medical_conditions || '',
        allergies: student.allergies || '',
    });

    const photoForm = useForm({
        photo: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/student/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            photoForm.setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = () => {
        photoForm.post('/student/profile/photo', {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
            },
        });
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
        <div className="flex items-start space-x-3 py-3 border-b last:border-b-0">
            <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        My Profile
                    </h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white'
                    }`}>
                        {student.status}
                    </span>
                </div>
            }
        >
            <Head title="My Profile" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Profile Picture & Basic Info */}
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Picture</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="h-40 w-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            {photoPreview || student.photo_url ? (
                                                <img
                                                    src={photoPreview || student.photo_url!}
                                                    alt={student.full_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-20 w-20 text-gray-400" />
                                            )}
                                        </div>
                                        <label
                                            htmlFor="photo-upload"
                                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg"
                                        >
                                            <Camera className="h-5 w-5" />
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {photoPreview && (
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={handlePhotoUpload}
                                                disabled={photoForm.processing}
                                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Upload
                                            </button>
                                            <button
                                                onClick={() => setPhotoPreview(null)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-6 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">{student.full_name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Class {student.class_name} - {student.section_name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Roll: {student.roll_number} | ID: {student.admission_number}
                                        </p>
                                    </div>

                                    <div className="mt-4 w-full space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Blood Group:</span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-700">{student.blood_group}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Gender:</span>
                                            <span className="font-medium">{student.gender}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Religion:</span>
                                            <span className="font-medium">{student.religion}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Information */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center">
                                            <User className="mr-2 h-5 w-5" />
                                            Personal Information
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <InfoRow icon={Calendar} label="Date of Birth" value={student.date_of_birth} />
                                        <InfoRow icon={User} label="Birth Certificate No" value={student.birth_certificate_no} />
                                        <InfoRow icon={MapPin} label="Nationality" value={student.nationality} />
                                        <InfoRow icon={Calendar} label="Admission Date" value={student.admission_date} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information - Editable */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center">
                                            <Phone className="mr-2 h-5 w-5" />
                                            Contact Information
                                        </span>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <input
                                                    id="phone"
                                                    type="text"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {errors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="Enter email address"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="present_address" className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
                                                <textarea
                                                    id="present_address"
                                                    value={data.present_address}
                                                    onChange={(e) => setData('present_address', e.target.value)}
                                                    placeholder="Enter present address"
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {errors.present_address && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.present_address}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                                                <textarea
                                                    id="medical_conditions"
                                                    value={data.medical_conditions}
                                                    onChange={(e) => setData('medical_conditions', e.target.value)}
                                                    placeholder="Any medical conditions"
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                                <textarea
                                                    id="allergies"
                                                    value={data.allergies}
                                                    onChange={(e) => setData('allergies', e.target.value)}
                                                    placeholder="Any allergies"
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <InfoRow icon={Phone} label="Phone" value={student.phone} />
                                            <InfoRow icon={Mail} label="Email" value={student.email} />
                                            <InfoRow icon={MapPin} label="Present Address" value={student.present_address} />
                                            <InfoRow icon={MapPin} label="Permanent Address" value={student.permanent_address} />
                                            <InfoRow icon={MapPin} label="City" value={student.city} />
                                            <InfoRow icon={Heart} label="Medical Conditions" value={student.medical_conditions} />
                                            <InfoRow icon={Heart} label="Allergies" value={student.allergies} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Guardian Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="mr-2 h-5 w-5" />
                                        Guardian Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Father's Information</h4>
                                            <div className="space-y-2">
                                                <InfoRow icon={User} label="Name" value={student.father_name} />
                                                <InfoRow icon={Phone} label="Phone" value={student.father_phone} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Mother's Information</h4>
                                            <div className="space-y-2">
                                                <InfoRow icon={User} label="Name" value={student.mother_name} />
                                                <InfoRow icon={Phone} label="Phone" value={student.mother_phone} />
                                            </div>
                                        </div>
                                    </div>

                                    {student.guardian_name && (
                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Guardian Information</h4>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <InfoRow icon={User} label="Name" value={student.guardian_name} />
                                                <InfoRow icon={Phone} label="Phone" value={student.guardian_phone} />
                                                <InfoRow icon={Users} label="Relation" value={student.guardian_relation} />
                                            </div>
                                        </div>
                                    )}

                                    {parents.length > 0 && (
                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Registered Parents</h4>
                                            <div className="space-y-3">
                                                {parents.map((parent) => (
                                                    <div key={parent.id} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-sm">{parent.name}</p>
                                                                <p className="text-xs text-gray-600">
                                                                    {parent.relation} | {parent.phone}
                                                                </p>
                                                            </div>
                                                            {parent.is_primary_contact && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Academic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BookOpen className="mr-2 h-5 w-5" />
                                        Academic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <InfoRow icon={BookOpen} label="Academic Year" value={student.academic_year} />
                                        <InfoRow icon={BookOpen} label="Class" value={`${student.class_name} - ${student.section_name}`} />
                                        <InfoRow icon={BookOpen} label="Previous School" value={student.previous_school} />
                                        <InfoRow icon={BookOpen} label="Previous Class" value={student.previous_class} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
