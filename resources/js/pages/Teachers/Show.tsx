import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    ArrowLeft, Edit, Trash2, User, Mail, Phone, Calendar,
    MapPin, GraduationCap, Briefcase, DollarSign, BookOpen,
    Building2, CreditCard, FileText, Heart, Globe, Flag,
    UserCircle, Clock, Home, MapPinned, Printer, CreditCard as IdCard
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface TeacherSubject {
    id: number;
    subject: Subject;
    classes: SchoolClass[];
}

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    blood_group: string | null;
    religion: string | null;
    nationality: string | null;
    designation: string | null;
    department: string | null;
    nid_no: string | null;
    emergency_contact: string | null;
    present_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    qualification: string;
    specialization: string | null;
    experience_years: number;
    previous_experience: string | null;
    joining_date: string;
    leaving_date: string | null;
    salary: number;
    bank_name: string | null;
    bank_account_no: string | null;
    bank_branch: string | null;
    employment_type: string | null;
    status: string;
    photo: string | null;
    notes: string | null;
    subjects_count: number;
    teacher_subjects?: TeacherSubject[];
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface ShowProps {
    teacher: Teacher;
}

export default function Show({ teacher }: ShowProps) {
    const [imageError, setImageError] = React.useState(false);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${teacher.full_name}"?`)) {
            router.delete(`/teachers/${teacher.id}`);
        }
    };

    const handlePrintProfile = () => {
        window.open(`/teachers/${teacher.id}/print-profile`, '_blank');
    };

    const handlePrintIdCard = () => {
        window.open(`/teachers/${teacher.id}/print-id-card`, '_blank');
    };

    const getTeacherImageUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) {
            return photo;
        }
        if (photo.startsWith('storage/')) {
            return `/${photo}`;
        }
        return `/storage/${photo}`;
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: string | number | null; icon?: React.ReactNode }) => (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-1/3 flex items-center gap-2">
                {icon && <span className="text-gray-500">{icon}</span>}
                <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            <div className="w-2/3">
                <span className="text-sm text-gray-900 font-medium">{value || 'N/A'}</span>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`${teacher.full_name} - Teacher Profile`} />

            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft className="w-5 h-5" />}
                        onClick={() => router.visit('/teachers')}
                    >
                        Back to Teachers
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handlePrintProfile}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            icon={<Printer className="w-5 h-5" />}
                        >
                            Print Profile
                        </Button>
                        <Button
                            onClick={handlePrintIdCard}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            icon={<IdCard className="w-5 h-5" />}
                        >
                            Print ID Card
                        </Button>
                        <Link href={`/teachers/${teacher.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit
                            </Button>
                        </Link>
                        <Button
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                            icon={<Trash2 className="w-5 h-5" />}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* CV Header Card */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {teacher.photo && !imageError ? (
                                <img
                                    src={getTeacherImageUrl(teacher.photo) || ''}
                                    alt={teacher.full_name}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-xl">
                                    <User className="w-16 h-16 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold mb-2">{teacher.full_name}</h1>
                            <p className="text-xl text-blue-100 mb-4">{teacher.designation || 'Teacher'}</p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <UserCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">{teacher.employee_id}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <Building2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">{teacher.department || 'N/A'}</span>
                                </div>
                                <Badge
                                    variant={teacher.status === 'active' ? 'success' : 'default'}
                                    className="capitalize bg-white/20 backdrop-blur-sm border-white/30"
                                >
                                    {teacher.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex md:flex-col gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px] border border-white/30">
                                <Clock className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-2xl font-bold">{teacher.experience_years}</p>
                                <p className="text-xs text-blue-100">Years Exp.</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px] border border-white/30">
                                <BookOpen className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-2xl font-bold">{teacher.subjects_count}</p>
                                <p className="text-xs text-blue-100">Subjects</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Contact Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow
                                label="Email Address"
                                value={teacher.email}
                                icon={<Mail className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Phone Number"
                                value={teacher.phone}
                                icon={<Phone className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Emergency Contact"
                                value={teacher.emergency_contact}
                                icon={<Phone className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="NID Number"
                                value={teacher.nid_no}
                                icon={<FileText className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            Personal Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow
                                label="Date of Birth"
                                value={formatDate(teacher.date_of_birth)}
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Gender"
                                value={teacher.gender ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1) : 'N/A'}
                                icon={<UserCircle className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Blood Group"
                                value={teacher.blood_group}
                                icon={<Heart className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Religion"
                                value={teacher.religion}
                                icon={<Globe className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Nationality"
                                value={teacher.nationality}
                                icon={<Flag className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Address Information
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Home className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-600">Present Address</span>
                            </div>
                            <p className="text-sm text-gray-900 pl-6">{teacher.present_address || 'N/A'}</p>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPinned className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-600">Permanent Address</span>
                            </div>
                            <p className="text-sm text-gray-900 pl-6">{teacher.permanent_address || 'N/A'}</p>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InfoRow label="City" value={teacher.city} icon={<MapPin className="w-4 h-4" />} />
                                <InfoRow label="State" value={teacher.state} icon={<MapPin className="w-4 h-4" />} />
                                <InfoRow label="Postal Code" value={teacher.postal_code} icon={<MapPin className="w-4 h-4" />} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-orange-600" />
                            Professional Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow
                                label="Designation"
                                value={teacher.designation}
                                icon={<Briefcase className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Department"
                                value={teacher.department}
                                icon={<Building2 className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Qualification"
                                value={teacher.qualification}
                                icon={<GraduationCap className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Specialization"
                                value={teacher.specialization}
                                icon={<BookOpen className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Experience Years"
                                value={teacher.experience_years}
                                icon={<Clock className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Employment Type"
                                value={teacher.employment_type ? teacher.employment_type.replace('_', ' ').toUpperCase() : 'N/A'}
                                icon={<Briefcase className="w-4 h-4" />}
                            />
                        </div>
                        {teacher.previous_experience && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-600">Previous Experience</span>
                                </div>
                                <p className="text-sm text-gray-900 pl-6 whitespace-pre-wrap">{teacher.previous_experience}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Employment Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Employment Details
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow
                                label="Joining Date"
                                value={formatDate(teacher.joining_date)}
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Leaving Date"
                                value={teacher.leaving_date ? formatDate(teacher.leaving_date) : 'N/A'}
                                icon={<Calendar className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Status"
                                value={teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                                icon={<UserCircle className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Salary"
                                value={`৳${Number(teacher.salary).toLocaleString()}`}
                                icon={<DollarSign className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-teal-600" />
                            Bank Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoRow
                                label="Bank Name"
                                value={teacher.bank_name}
                                icon={<Building2 className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Account Number"
                                value={teacher.bank_account_no}
                                icon={<CreditCard className="w-4 h-4" />}
                            />
                            <InfoRow
                                label="Branch"
                                value={teacher.bank_branch}
                                icon={<MapPin className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Assigned Subjects Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-rose-600" />
                            Assigned Subjects {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 && `(${teacher.teacher_subjects.length})`}
                        </h2>
                    </div>

                    {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject Code</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned Classes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {teacher.teacher_subjects.map((ts) => (
                                        <tr key={ts.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{ts.subject.name}</td>
                                            <td className="px-6 py-4 text-gray-700 font-mono">{ts.subject.code}</td>
                                            <td className="px-6 py-4">
                                                {ts.classes && ts.classes.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {ts.classes.map(cls => (
                                                            <Badge key={cls.id} variant="info" size="sm">
                                                                {cls.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">No classes assigned</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No subjects assigned yet</p>
                        </div>
                    )}
                </div>

                {/* Additional Notes Card */}
                {teacher.notes && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-violet-600" />
                                Additional Notes
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{teacher.notes}</p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
