import React from 'react';
import { Head } from '@inertiajs/react';
import {
    User, Mail, Phone, Calendar, MapPin, GraduationCap, Briefcase,
    DollarSign, BookOpen, Building2, CreditCard, FileText, Heart,
    Globe, Flag, UserCircle, Clock, Home, MapPinned, X, Printer
} from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

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
    const institute = useInstitute();
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
        // Auto print when page loads
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
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
        <div className="flex items-start gap-2 py-1 border-b border-slate-100 last:border-0">
            <div className="w-1/3 flex items-center gap-1.5">
                {icon && <span className="text-slate-400 text-xs">{icon}</span>}
                <span className="text-[10px] font-medium text-slate-500">{label}</span>
            </div>
            <div className="w-2/3">
                <span className="text-[10px] text-slate-800 font-semibold">{value || 'N/A'}</span>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen">
            <Head title={`${teacher.full_name} - Service Profile`} />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm;
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

                    .no-print {
                        display: none !important;
                    }

                    .print-sheet {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                }

                @media screen {
                    body {
                        background: #f8fafc;
                        padding: 24px 0;
                    }
                    .print-sheet {
                        max-width: 210mm;
                        margin: 0 auto;
                        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
                        border: 1px solid #e2e8f0;
                    }
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
            `}</style>

            {/* Screen Controls */}
            <div className="no-print fixed top-4 right-4 flex items-center gap-2 z-50">
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors"
                >
                    <Printer className="w-3.5 h-3.5" />
                    Print Service Record
                </button>
                <button
                    onClick={() => window.close()}
                    className="bg-slate-800 hover:bg-slate-900 text-white rounded-full p-2 shadow-md transition-colors"
                    title="Close Window"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="print-sheet bg-white p-6 space-y-4">
                {/* 1. INSTITUTIONAL HEADER */}
                <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wide text-slate-900">{institute.name}</h1>
                        <p className="text-[11px] text-slate-600">{institute.address} • Phone: {institute.phone}</p>
                        <p className="text-[10px] text-slate-500">Official Faculty Service Register & Academic Dossier</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                            {teacher.employee_id}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </div>

                {/* 2. FACULTY EXECUTIVE PROFILE BANNER */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start gap-4">
                    <div className="shrink-0">
                        {teacher.photo && !imageError ? (
                            <img
                                src={getTeacherImageUrl(teacher.photo) || ''}
                                alt={teacher.full_name}
                                className="w-20 h-20 rounded-lg object-cover border border-slate-300"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center border border-slate-300">
                                <User className="w-8 h-8 text-slate-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-1">
                        <h2 className="text-base font-bold text-slate-900 leading-tight">{teacher.full_name}</h2>
                        <p className="text-xs font-semibold text-indigo-700">
                            {teacher.designation || 'Teacher'} • {teacher.department || 'Department N/A'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 pt-1">
                            <span><strong>Status:</strong> {teacher.status?.toUpperCase()}</span>
                            <span>•</span>
                            <span><strong>Type:</strong> {teacher.employment_type?.replace('_', ' ')?.toUpperCase() || 'PERMANENT'}</span>
                            <span>•</span>
                            <span><strong>Experience:</strong> {teacher.experience_years} Years</span>
                            <span>•</span>
                            <span><strong>Teaching:</strong> {teacher.subjects_count} Subjects</span>
                        </div>
                    </div>
                </div>

                {/* 3. TWO-COLUMN SERVICE DOSSIER */}
                <div className="grid grid-cols-2 gap-3.5">
                    {/* Left Column */}
                    <div className="space-y-3">
                        {/* Contact Information */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-slate-600" />
                                    Communication Coordinates
                                </h3>
                            </div>
                            <div className="p-2.5">
                                <InfoRow label="Email Address" value={teacher.email} />
                                <InfoRow label="Primary Phone" value={teacher.phone} />
                                <InfoRow label="Emergency Phone" value={teacher.emergency_contact} />
                                <InfoRow label="National ID (NID)" value={teacher.nid_no} />
                            </div>
                        </div>

                        {/* Personal & Demographic */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                    <User className="w-3 h-3 text-slate-600" />
                                    Demographic Details
                                </h3>
                            </div>
                            <div className="p-2.5">
                                <InfoRow label="Date of Birth" value={formatDate(teacher.date_of_birth)} />
                                <InfoRow label="Gender" value={teacher.gender?.toUpperCase()} />
                                <InfoRow label="Blood Group" value={teacher.blood_group} />
                                <InfoRow label="Religion" value={teacher.religion} />
                                <InfoRow label="Nationality" value={teacher.nationality} />
                            </div>
                        </div>

                        {/* Residential Addresses */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-slate-600" />
                                    Residential Addresses
                                </h3>
                            </div>
                            <div className="p-2.5 space-y-2 text-[10px]">
                                <div>
                                    <span className="font-semibold text-slate-500 block">Present Address:</span>
                                    <p className="text-slate-800 font-medium pl-2">{teacher.present_address || 'N/A'}</p>
                                </div>
                                <div className="border-t border-slate-100 pt-1.5">
                                    <span className="font-semibold text-slate-500 block">Permanent Address:</span>
                                    <p className="text-slate-800 font-medium pl-2">{teacher.permanent_address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                        {/* Professional & Academic */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                    <GraduationCap className="w-3 h-3 text-slate-600" />
                                    Academic & Professional
                                </h3>
                            </div>
                            <div className="p-2.5">
                                <InfoRow label="Qualification" value={teacher.qualification} />
                                <InfoRow label="Specialization" value={teacher.specialization} />
                                <InfoRow label="Experience" value={`${teacher.experience_years} years`} />
                                <InfoRow label="Joining Date" value={formatDate(teacher.joining_date)} />
                                <InfoRow label="Leaving Date" value={teacher.leaving_date ? formatDate(teacher.leaving_date) : 'In Service'} />
                                <InfoRow label="Monthly Salary" value={`৳${Number(teacher.salary || 0).toLocaleString()}`} />
                            </div>
                        </div>

                        {/* Bank Coordinates */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                    <CreditCard className="w-3 h-3 text-slate-600" />
                                    Payroll Bank Account
                                </h3>
                            </div>
                            <div className="p-2.5">
                                <InfoRow label="Bank Name" value={teacher.bank_name} />
                                <InfoRow label="Branch Name" value={teacher.bank_branch} />
                                <InfoRow label="Account Number" value={teacher.bank_account_no} />
                            </div>
                        </div>

                        {/* Previous Experience */}
                        {teacher.previous_experience && (
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                    <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                        <Briefcase className="w-3 h-3 text-slate-600" />
                                        Previous Work History
                                    </h3>
                                </div>
                                <div className="p-2.5">
                                    <p className="text-[10px] text-slate-700 leading-snug whitespace-pre-wrap">{teacher.previous_experience}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. ASSIGNED SUBJECTS TABLE */}
                {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                            <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-slate-600" />
                                Allocated Academic Courses & Subjects ({teacher.teacher_subjects.length})
                            </h3>
                        </div>
                        <table className="w-full text-[10px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                                <tr>
                                    <th className="px-3 py-1.5 text-left">Subject Name</th>
                                    <th className="px-3 py-1.5 text-left font-mono">Code</th>
                                    <th className="px-3 py-1.5 text-left">Allocated Classes & Sections</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {teacher.teacher_subjects.map((ts) => (
                                    <tr key={ts.id}>
                                        <td className="px-3 py-1.5 font-semibold">{ts.subject.name}</td>
                                        <td className="px-3 py-1.5 font-mono text-slate-600">{ts.subject.code}</td>
                                        <td className="px-3 py-1.5">
                                            {ts.classes && ts.classes.length > 0
                                                ? ts.classes.map(c => c.name).join(', ')
                                                : 'All Sections'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 5. NOTES (IF ANY) */}
                {teacher.notes && (
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-[10px]">
                        <span className="font-bold text-slate-700 block mb-0.5">Administrative Remarks:</span>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{teacher.notes}</p>
                    </div>
                )}

                {/* 6. OFFICIAL VERIFICATION & SIGNATURES */}
                <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[10px]">
                    <div>
                        <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                            Faculty Signature
                        </div>
                    </div>
                    <div>
                        <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                            Verified By (HR / Admin)
                        </div>
                    </div>
                    <div>
                        <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                            Head of Institution / Principal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
