import React from 'react';
import {
    User, Mail, Phone, Calendar, MapPin, GraduationCap, Briefcase,
    DollarSign, BookOpen, Building2, CreditCard, FileText, Heart,
    Globe, Flag, UserCircle, Clock, Home, MapPinned, X
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
}

interface Props {
    teacher: Teacher;
}

export default function TeacherPrintProfile({ teacher }: Props) {
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
        // Auto print when page loads
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const getTeacherImageUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        if (photo.startsWith('storage/')) return `/${photo}`;
        return `/storage/${photo}`;
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: string | number | null; icon?: React.ReactNode }) => (
        <div className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-0">
            <div className="w-1/3 flex items-center gap-1.5">
                {icon && <span className="text-gray-500 text-xs">{icon}</span>}
                <span className="text-[10px] font-medium text-gray-600">{label}</span>
            </div>
            <div className="w-2/3">
                <span className="text-[10px] text-gray-900 font-medium">{value || 'N/A'}</span>
            </div>
        </div>
    );

    return (
        <div className="bg-white">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 8mm;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    .close-button {
                        display: none !important;
                    }
                }

                @media screen {
                    body {
                        background: #f3f4f6;
                        padding: 20px;
                    }
                }

                body {
                    font-family: Arial, sans-serif;
                }
            `}</style>

            {/* Close Button - Only visible on screen */}
            <button
                onClick={() => window.close()}
                className="close-button fixed top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors z-50"
                title="Close"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="max-w-full mx-auto p-3 space-y-2">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded">
                    <div className="flex items-start gap-4">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {teacher.photo && !imageError ? (
                                <img
                                    src={getTeacherImageUrl(teacher.photo) || ''}
                                    alt={teacher.full_name}
                                    className="w-16 h-16 rounded object-cover border-2 border-white"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-16 h-16 rounded bg-white/20 flex items-center justify-center border-2 border-white">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <h1 className="text-xl font-bold mb-0.5">{teacher.full_name}</h1>
                            <p className="text-sm text-blue-100 mb-2">{teacher.designation || 'Teacher'}</p>
                            <div className="flex gap-2 text-xs">
                                <div className="bg-white/20 px-2 py-0.5 rounded">
                                    <span className="font-medium">{teacher.employee_id}</span>
                                </div>
                                <div className="bg-white/20 px-2 py-0.5 rounded">
                                    <span>{teacher.department || 'N/A'}</span>
                                </div>
                                <div className="bg-white/20 px-2 py-0.5 rounded capitalize">
                                    <span>{teacher.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-2">
                            <div className="bg-white/20 rounded p-2 text-center min-w-[60px]">
                                <p className="text-lg font-bold">{teacher.experience_years}</p>
                                <p className="text-[9px] text-blue-100">Years Exp.</p>
                            </div>
                            <div className="bg-white/20 rounded p-2 text-center min-w-[60px]">
                                <p className="text-lg font-bold">{teacher.subjects_count}</p>
                                <p className="text-[9px] text-blue-100">Subjects</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Left Column */}
                    <div className="space-y-2">
                        {/* Contact Information */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-blue-50 px-2 py-1 border-b border-gray-200">
                                <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-blue-600" />
                                    Contact Information
                                </h2>
                            </div>
                            <div className="p-2">
                                <InfoRow label="Email" value={teacher.email} icon={<Mail className="w-2.5 h-2.5" />} />
                                <InfoRow label="Phone" value={teacher.phone} icon={<Phone className="w-2.5 h-2.5" />} />
                                <InfoRow label="Emergency" value={teacher.emergency_contact} icon={<Phone className="w-2.5 h-2.5" />} />
                                <InfoRow label="NID" value={teacher.nid_no} icon={<FileText className="w-2.5 h-2.5" />} />
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-purple-50 px-2 py-1 border-b border-gray-200">
                                <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                    <User className="w-3 h-3 text-purple-600" />
                                    Personal Information
                                </h2>
                            </div>
                            <div className="p-2">
                                <InfoRow label="Date of Birth" value={formatDate(teacher.date_of_birth)} icon={<Calendar className="w-2.5 h-2.5" />} />
                                <InfoRow label="Gender" value={teacher.gender?.charAt(0).toUpperCase() + (teacher.gender?.slice(1) || '')} icon={<UserCircle className="w-2.5 h-2.5" />} />
                                <InfoRow label="Blood Group" value={teacher.blood_group} icon={<Heart className="w-2.5 h-2.5" />} />
                                <InfoRow label="Religion" value={teacher.religion} icon={<Globe className="w-2.5 h-2.5" />} />
                                <InfoRow label="Nationality" value={teacher.nationality} icon={<Flag className="w-2.5 h-2.5" />} />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-green-50 px-2 py-1 border-b border-gray-200">
                                <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-green-600" />
                                    Address Information
                                </h2>
                            </div>
                            <div className="p-2 space-y-1.5">
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <Home className="w-2.5 h-2.5 text-gray-500" />
                                        <span className="text-[9px] font-medium text-gray-600">Present Address</span>
                                    </div>
                                    <p className="text-[9px] text-gray-900 pl-3.5 leading-tight">{teacher.present_address || 'N/A'}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-1.5">
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <MapPinned className="w-2.5 h-2.5 text-gray-500" />
                                        <span className="text-[9px] font-medium text-gray-600">Permanent Address</span>
                                    </div>
                                    <p className="text-[9px] text-gray-900 pl-3.5 leading-tight">{teacher.permanent_address || 'N/A'}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-1.5">
                                    <InfoRow label="City" value={teacher.city} />
                                    <InfoRow label="State" value={teacher.state} />
                                    <InfoRow label="Postal Code" value={teacher.postal_code} />
                                </div>
                            </div>
                        </div>

                        {/* Bank Information */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-teal-50 px-2 py-1 border-b border-gray-200">
                                <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                    <CreditCard className="w-3 h-3 text-teal-600" />
                                    Bank Information
                                </h2>
                            </div>
                            <div className="p-2">
                                <InfoRow label="Bank Name" value={teacher.bank_name} icon={<Building2 className="w-2.5 h-2.5" />} />
                                <InfoRow label="Account No" value={teacher.bank_account_no} icon={<CreditCard className="w-2.5 h-2.5" />} />
                                <InfoRow label="Branch" value={teacher.bank_branch} icon={<MapPin className="w-2.5 h-2.5" />} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                        {/* Professional Information */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-orange-50 px-2 py-1 border-b border-gray-200">
                                <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                    <GraduationCap className="w-3 h-3 text-orange-600" />
                                    Professional Information
                                </h2>
                            </div>
                            <div className="p-2">
                                <InfoRow label="Designation" value={teacher.designation} icon={<Briefcase className="w-2.5 h-2.5" />} />
                                <InfoRow label="Department" value={teacher.department} icon={<Building2 className="w-2.5 h-2.5" />} />
                                <InfoRow label="Qualification" value={teacher.qualification} icon={<GraduationCap className="w-2.5 h-2.5" />} />
                                <InfoRow label="Specialization" value={teacher.specialization} icon={<BookOpen className="w-2.5 h-2.5" />} />
                                <InfoRow label="Experience" value={`${teacher.experience_years} years`} icon={<Clock className="w-2.5 h-2.5" />} />
                                <InfoRow label="Employment Type" value={teacher.employment_type?.replace('_', ' ').toUpperCase()} icon={<Briefcase className="w-2.5 h-2.5" />} />
                                {teacher.previous_experience && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-[9px] font-medium text-gray-600 mb-0.5">Previous Experience</p>
                                        <p className="text-[9px] text-gray-900 whitespace-pre-wrap leading-tight">{teacher.previous_experience}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <div className="bg-indigo-50 px-2 py-1 border-b border-gray-200">
                                <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-indigo-600" />
                                    Employment Details
                                </h2>
                            </div>
                            <div className="p-2">
                                <InfoRow label="Joining Date" value={formatDate(teacher.joining_date)} icon={<Calendar className="w-2.5 h-2.5" />} />
                                <InfoRow label="Leaving Date" value={teacher.leaving_date ? formatDate(teacher.leaving_date) : 'N/A'} icon={<Calendar className="w-2.5 h-2.5" />} />
                                <InfoRow label="Status" value={teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)} />
                                <InfoRow label="Salary" value={`৳${Number(teacher.salary).toLocaleString()}`} icon={<DollarSign className="w-2.5 h-2.5" />} />
                            </div>
                        </div>

                        {/* Assigned Subjects */}
                        {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 && (
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-rose-50 px-2 py-1 border-b border-gray-200">
                                    <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                        <BookOpen className="w-3 h-3 text-rose-600" />
                                        Assigned Subjects ({teacher.teacher_subjects.length})
                                    </h2>
                                </div>
                                <table className="w-full text-[9px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-2 py-1 text-left font-semibold text-gray-900">Subject</th>
                                            <th className="px-2 py-1 text-left font-semibold text-gray-900">Code</th>
                                            <th className="px-2 py-1 text-left font-semibold text-gray-900">Classes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teacher.teacher_subjects.map((ts) => (
                                            <tr key={ts.id}>
                                                <td className="px-2 py-1 font-medium text-gray-900">{ts.subject.name}</td>
                                                <td className="px-2 py-1 text-gray-700 font-mono">{ts.subject.code}</td>
                                                <td className="px-2 py-1">
                                                    {ts.classes && ts.classes.length > 0
                                                        ? ts.classes.map(cls => cls.name).join(', ')
                                                        : 'No classes'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Additional Notes */}
                        {teacher.notes && (
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-violet-50 px-2 py-1 border-b border-gray-200">
                                    <h2 className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-violet-600" />
                                        Additional Notes
                                    </h2>
                                </div>
                                <div className="p-2">
                                    <p className="text-[9px] text-gray-900 whitespace-pre-wrap leading-tight">{teacher.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
