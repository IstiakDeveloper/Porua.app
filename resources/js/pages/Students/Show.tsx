import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Users,
    GraduationCap,
    FileText,
    Heart,
    Download,
    DollarSign,
    CheckCircle,
    XCircle,
    Printer,
    CreditCard,
    Layers,
    Clock,
    BookOpen,
} from 'lucide-react';
import StudentPrintProfile from './StudentPrintProfile';
import StudentIDCard from './StudentIDCard';

const appName = import.meta.env.VITE_APP_NAME || 'School Management System';

export interface Student {
    id: number;
    user_id: number;
    academic_year_id: number;
    class_id: number;
    section_id: number;
    parent_id: number | null;
    admission_number: string;
    student_id: string | null;
    form_number: string | null;
    monthly_fee: string | null;
    roll_number: string | null;
    admission_date: string;
    first_name: string;
    last_name: string;
    first_name_bengali: string | null;
    last_name_bengali: string | null;
    name_bn: string | null;
    name_en: string | null;
    date_of_birth: string;
    birth_place_district: string | null;
    gender: string;
    blood_group: string | null;
    birth_certificate_no: string | null;
    birth_certificate_number: string | null;
    religion: string | null;
    nationality: string | null;
    minorities: boolean;
    minority_name: string | null;
    handicap: string | null;
    present_address: string | null;
    present_address_division: string | null;
    present_address_district: string | null;
    present_address_upazila: string | null;
    present_address_city: string | null;
    present_address_ward: string | null;
    present_address_village: string | null;
    present_address_house_number: string | null;
    present_address_post: string | null;
    present_address_post_code: string | null;
    permanent_address: string | null;
    permanent_address_division: string | null;
    permanent_address_district: string | null;
    permanent_address_upazila: string | null;
    permanent_address_city: string | null;
    permanent_address_ward: string | null;
    permanent_address_village: string | null;
    permanent_address_house_number: string | null;
    permanent_address_post: string | null;
    permanent_address_post_code: string | null;
    father_name: string | null;
    father_name_bn: string | null;
    father_name_en: string | null;
    father_phone: string | null;
    father_mobile: string | null;
    father_nid: string | null;
    father_dob: string | null;
    father_occupation: string | null;
    father_dead: boolean;
    mother_name: string | null;
    mother_name_bn: string | null;
    mother_name_en: string | null;
    mother_phone: string | null;
    mother_mobile: string | null;
    mother_nid: string | null;
    mother_dob: string | null;
    mother_occupation: string | null;
    mother_dead: boolean;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    previous_school: string | null;
    previous_class: string | null;
    previous_exam_result: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    special_notes: string | null;
    information_correct: boolean;
    photo: string | null;
    photo_url?: string | null;
    status: string;
    email: string;
    phone: string | null;
    user?: {
        name: string;
        email: string;
        phone: string | null;
    };
    academic_year?: {
        name: string;
    };
    school_class?: {
        name: string;
    };
    section?: {
        name: string;
    };
    attendance?: Array<{
        date: string;
        status: string;
    }>;
    fee_collections?: Array<{
        amount: number;
        date: string;
        status: string;
    }>;
    batch_enrollments?: Array<{
        id: number;
        status: string;
        agreed_fee: number | string;
        enrolled_date: string;
        batch?: {
            id: number;
            name: string;
            formatted_schedule?: string;
            course?: { id: number; name: string };
            teacher?: { first_name: string; last_name: string };
        };
    }>;
}

interface ShowProps {
    student: Student;
}

export default function Show({ student }: ShowProps) {
    const [showPrintProfile, setShowPrintProfile] = useState(false);
    const [showIDCard, setShowIDCard] = useState(false);

    const InfoItem = ({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {icon && <div className="text-blue-600 mt-1">{icon}</div>}
                <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                    <p className="text-gray-900 mt-1">{value}</p>
                </div>
            </div>
        );
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            passed: 'bg-blue-100 text-blue-800',
            transferred: 'bg-yellow-100 text-yellow-800',
            dropped: 'bg-red-100 text-red-800',
            suspended: 'bg-orange-100 text-orange-800',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFullAddress = (prefix: 'present' | 'permanent') => {
        const parts = [
            student[`${prefix}_address_house_number`],
            student[`${prefix}_address_village`],
            student[`${prefix}_address_ward`] ? `Ward ${student[`${prefix}_address_ward`]}` : null,
            student[`${prefix}_address_upazila`],
            student[`${prefix}_address_district`],
            student[`${prefix}_address_division`],
            student[`${prefix}_address_post`] ? `Post: ${student[`${prefix}_address_post`]}` : null,
            student[`${prefix}_address_post_code`] ? `Postcode: ${student[`${prefix}_address_post_code`]}` : null,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : student[`${prefix}_address`] || 'Not provided';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Student: ${student.first_name} ${student.last_name}`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<ArrowLeft className="w-4 h-4" />}
                            onClick={() => router.visit('/students')}
                        >
                            Back
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                                Student Profile
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View detailed student information</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<Printer className="w-4 h-4" />}
                            onClick={() => setShowPrintProfile(!showPrintProfile)}
                            className="justify-center"
                        >
                            <span className="truncate">Profile</span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<CreditCard className="w-4 h-4" />}
                            onClick={() => setShowIDCard(!showIDCard)}
                            className="justify-center"
                        >
                            <span className="truncate">ID Card</span>
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => router.visit(`/students/${student.id}/edit`)}
                            className="justify-center"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this student?')) {
                                    router.delete(`/students/${student.id}`);
                                }
                            }}
                            className="justify-center"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Photo & Basic Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col items-center">
                                {student.photo_url ? (
                                    <img
                                        src={student.photo_url}
                                        alt={`${student.first_name} ${student.last_name}`}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-blue-200 shadow-lg">
                                        <User className="w-16 h-16 text-blue-400" />
                                    </div>
                                )}

                                <h2 className="text-2xl font-bold text-gray-900 mt-4 text-center">
                                    {student.first_name} {student.last_name}
                                </h2>

                                {(student.first_name_bengali || student.last_name_bengali || student.name_bn) && (
                                    <p className="text-lg text-gray-600 mt-1">
                                        {student.name_bn || `${student.first_name_bengali || ''} ${student.last_name_bengali || ''}`.trim()}
                                    </p>
                                )}

                                <div className="mt-3">
                                    <StatusBadge status={student.status} />
                                </div>

                                <div className="mt-4 w-full space-y-2">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm text-gray-600">Admission No</span>
                                        <span className="font-semibold text-gray-900">{student.admission_number}</span>
                                    </div>
                                    {student.student_id && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Student ID</span>
                                            <span className="font-semibold text-gray-900">{student.student_id}</span>
                                        </div>
                                    )}
                                    {student.roll_number && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Roll Number</span>
                                            <span className="font-semibold text-gray-900">{student.roll_number}</span>
                                        </div>
                                    )}
                                    {student.form_number && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Form Number</span>
                                            <span className="font-semibold text-gray-900">{student.form_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Academic Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                Academic Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Academic Year</span>
                                    <span className="font-semibold text-gray-900">{student.academic_year?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Class</span>
                                    <span className="font-semibold text-gray-900">{student.school_class?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Section</span>
                                    <span className="font-semibold text-gray-900">{student.section?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Admission Date</span>
                                    <span className="font-semibold text-gray-900">{formatDate(student.admission_date)}</span>
                                </div>
                                {student.monthly_fee && (
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="text-sm text-gray-600">Monthly Fee</span>
                                        <span className="font-bold text-blue-600 text-lg">৳ {student.monthly_fee}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coaching Batches Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-indigo-600" />
                                    Enrolled Batches
                                </h3>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                                    {student.batch_enrollments?.length || 0}
                                </span>
                            </div>

                            {student.batch_enrollments && student.batch_enrollments.length > 0 ? (
                                <div className="space-y-3">
                                    {student.batch_enrollments.map((enrollment: any) => (
                                        <div
                                            key={enrollment.id}
                                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={`/batches/${enrollment.batch?.id}`}
                                                    className="font-bold text-gray-900 hover:text-indigo-600 text-sm"
                                                >
                                                    {enrollment.batch?.name}
                                                </Link>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    enrollment.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : (enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')
                                                }`}>
                                                    {enrollment.status.toUpperCase()}
                                                </span>
                                            </div>
                                            {enrollment.batch?.course && (
                                                <p className="text-xs text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    <span>{enrollment.batch.course.name}</span>
                                                </p>
                                            )}
                                            {enrollment.batch?.formatted_schedule && (
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span>{enrollment.batch.formatted_schedule}</span>
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No coaching batches enrolled</p>
                            )}
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <Phone className="w-5 h-5 text-blue-600" />
                                Contact Information
                            </h3>
                            <div className="space-y-3">
                                <InfoItem
                                    label="Email"
                                    value={student.user?.email || student.email}
                                    icon={<Mail className="w-4 h-4" />}
                                />
                                {(student.user?.phone || student.phone) && (
                                    <InfoItem
                                        label="Phone"
                                        value={student.user?.phone || student.phone}
                                        icon={<Phone className="w-4 h-4" />}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-4 border-b">
                                <User className="w-5 h-5 text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <InfoItem
                                    label="Date of Birth"
                                    value={formatDate(student.date_of_birth)}
                                    icon={<Calendar className="w-4 h-4" />}
                                />
                                {student.birth_place_district && (
                                    <InfoItem label="Birth Place" value={student.birth_place_district} />
                                )}
                                <InfoItem label="Gender" value={student.gender.charAt(0).toUpperCase() + student.gender.slice(1)} />
                                {student.blood_group && (
                                    <InfoItem label="Blood Group" value={student.blood_group} />
                                )}
                                {student.religion && (
                                    <InfoItem label="Religion" value={student.religion} />
                                )}
                                <InfoItem label="Nationality" value={student.nationality || 'Bangladeshi'} />
                                {student.birth_certificate_no && (
                                    <InfoItem label="Birth Certificate No." value={student.birth_certificate_no} />
                                )}
                                {student.birth_certificate_number && (
                                    <InfoItem label="Birth Certificate (Alt)" value={student.birth_certificate_number} />
                                )}
                            </div>

                            {student.minorities && (
                                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-semibold text-yellow-800">Minority Community</p>
                                    {student.minority_name && (
                                        <p className="text-yellow-900 mt-1">{student.minority_name}</p>
                                    )}
                                </div>
                            )}

                            {student.handicap && (
                                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-sm font-semibold text-purple-800">Disability / Special Needs</p>
                                    <p className="text-purple-900 mt-1">{student.handicap}</p>
                                </div>
                            )}
                        </div>

                        {/* Address Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-4 border-b">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Address Information
                            </h3>

                            <div className="space-y-6 mt-4">
                                {/* Present Address */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">Present Address</h4>
                                    <p className="text-gray-700">{getFullAddress('present')}</p>
                                </div>

                                {/* Permanent Address */}
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">Permanent Address</h4>
                                    <p className="text-gray-700">{getFullAddress('permanent')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Parent/Guardian Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-4 border-b">
                                <Users className="w-5 h-5 text-blue-600" />
                                Parent/Guardian Information
                            </h3>

                            <div className="space-y-6 mt-4">
                                {/* Father Information */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900">Father's Information</h4>
                                        {student.father_dead && (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Deceased</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(student.father_name_en || student.father_name) && (
                                            <InfoItem label="Name (English)" value={student.father_name_en || student.father_name} />
                                        )}
                                        {student.father_name_bn && (
                                            <InfoItem label="Name (Bengali)" value={student.father_name_bn} />
                                        )}
                                        {student.father_nid && (
                                            <InfoItem label="NID" value={student.father_nid} />
                                        )}
                                        {student.father_dob && (
                                            <InfoItem label="Date of Birth" value={formatDate(student.father_dob)} />
                                        )}
                                        {student.father_occupation && (
                                            <InfoItem label="Occupation" value={student.father_occupation} />
                                        )}
                                        {student.father_phone && (
                                            <InfoItem label="Phone" value={student.father_phone} icon={<Phone className="w-4 h-4" />} />
                                        )}
                                        {student.father_mobile && (
                                            <InfoItem label="Mobile" value={student.father_mobile} icon={<Phone className="w-4 h-4" />} />
                                        )}
                                    </div>
                                </div>

                                {/* Mother Information */}
                                <div className="p-4 bg-pink-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900">Mother's Information</h4>
                                        {student.mother_dead && (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Deceased</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(student.mother_name_en || student.mother_name) && (
                                            <InfoItem label="Name (English)" value={student.mother_name_en || student.mother_name} />
                                        )}
                                        {student.mother_name_bn && (
                                            <InfoItem label="Name (Bengali)" value={student.mother_name_bn} />
                                        )}
                                        {student.mother_nid && (
                                            <InfoItem label="NID" value={student.mother_nid} />
                                        )}
                                        {student.mother_dob && (
                                            <InfoItem label="Date of Birth" value={formatDate(student.mother_dob)} />
                                        )}
                                        {student.mother_occupation && (
                                            <InfoItem label="Occupation" value={student.mother_occupation} />
                                        )}
                                        {student.mother_phone && (
                                            <InfoItem label="Phone" value={student.mother_phone} icon={<Phone className="w-4 h-4" />} />
                                        )}
                                        {student.mother_mobile && (
                                            <InfoItem label="Mobile" value={student.mother_mobile} icon={<Phone className="w-4 h-4" />} />
                                        )}
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                {(student.guardian_name || student.guardian_phone) && (
                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3">Legal Guardian</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {student.guardian_name && (
                                                <InfoItem label="Name" value={student.guardian_name} />
                                            )}
                                            {student.guardian_phone && (
                                                <InfoItem label="Phone" value={student.guardian_phone} icon={<Phone className="w-4 h-4" />} />
                                            )}
                                            {student.guardian_relation && (
                                                <InfoItem label="Relation" value={student.guardian_relation.charAt(0).toUpperCase() + student.guardian_relation.slice(1)} />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Previous Education & Medical */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-4 border-b">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Academic Background & Health
                            </h3>

                            <div className="space-y-6 mt-4">
                                {/* Previous Education */}
                                {(student.previous_school || student.previous_class || student.previous_exam_result) && (
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3">Previous Education</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {student.previous_school && (
                                                <InfoItem label="Previous School" value={student.previous_school} />
                                            )}
                                            {student.previous_class && (
                                                <InfoItem label="Previous Class" value={student.previous_class} />
                                            )}
                                            {student.previous_exam_result && (
                                                <InfoItem label="Previous Result" value={student.previous_exam_result} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Medical Information */}
                                {(student.medical_conditions || student.allergies || student.special_notes) && (
                                    <div className="p-4 bg-red-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-red-600" />
                                            Health & Medical Information
                                        </h4>
                                        <div className="space-y-3">
                                            {student.medical_conditions && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Medical Conditions</p>
                                                    <p className="text-gray-900 mt-1">{student.medical_conditions}</p>
                                                </div>
                                            )}
                                            {student.allergies && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Allergies</p>
                                                    <p className="text-gray-900 mt-1">{student.allergies}</p>
                                                </div>
                                            )}
                                            {student.special_notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Special Notes</p>
                                                    <p className="text-gray-900 mt-1">{student.special_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Information Verification */}
                                <div className={`p-4 rounded-lg ${student.information_correct ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {student.information_correct ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="font-semibold text-green-900">Information Verified</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-gray-600" />
                                                <span className="font-semibold text-gray-900">Information Not Verified</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Components - Show when buttons clicked */}
                {showPrintProfile && (
                    <div className="mt-8">
                        <StudentPrintProfile student={student} appName={appName} />
                    </div>
                )}

                {showIDCard && (
                    <div className="mt-8">
                        <StudentIDCard student={student} appName={appName} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
