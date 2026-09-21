import React from 'react';
import { Head } from '@inertiajs/react';
import { User, Mail, Phone, Calendar, Building2, UserCircle, Heart, X } from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

interface Teacher {
    id: number;
    employee_id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    blood_group: string | null;
    designation: string | null;
    department: string | null;
    joining_date: string;
    status: string;
    photo: string | null;
}

interface Props {
    teacher: Teacher;
}

export default function TeacherPrintIDCard({ teacher }: Props) {
    const institute = useInstitute();
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

    return (
        <>
            <Head title={`${teacher.full_name} - ID Card`} />

            <style>{`
                @media print {
                    @page {
                        size: 8.5cm 13.5cm;
                        margin: 0;
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

                    .print-container {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        min-height: auto !important;
                        background: white !important;
                        padding: 0 !important;
                    }

                    .close-button {
                        display: none !important;
                    }
                }

                @media screen {
                    body {
                        background: #f3f4f6;
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

            <div className="print-container min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div style={{ width: '8.5cm', height: '13.5cm' }} className="bg-white rounded-xl shadow-2xl overflow-hidden border-[3px] border-blue-600 relative">
                    {/* Card Header */}
                    <div style={{ background: 'linear-gradient(to right, #2563eb, #0891b2)' }} className="text-white p-3 text-center">
                        <h2 className="text-base font-bold mb-0.5">{institute.type === 'coaching' ? 'FACULTY ID CARD' : 'TEACHER ID CARD'}</h2>
                        <p className="text-[9px] opacity-90 truncate font-medium">{institute.name}</p>
                    </div>

                    {/* Photo Section */}
                    <div className="flex justify-center -mt-10 mb-3 relative z-10">
                        {teacher.photo && !imageError ? (
                            <img
                                src={getTeacherImageUrl(teacher.photo) || ''}
                                alt={teacher.full_name}
                                className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-lg bg-white"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-[3px] border-white shadow-lg">
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Teacher Name */}
                    <div className="text-center px-4 pb-2 border-b-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{teacher.full_name}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{teacher.designation || 'Teacher'}</p>
                    </div>

                    {/* Teacher Info */}
                    <div className="px-4 pt-2 pb-12">
                        <div className="space-y-1.5">
                            {/* Employee ID */}
                            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
                                <UserCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 leading-none">Employee ID</p>
                                    <p className="text-xs font-bold text-gray-900 leading-tight mt-0.5">{teacher.employee_id}</p>
                                </div>
                            </div>

                            {/* Department */}
                            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
                                <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 leading-none">Department</p>
                                    <p className="text-xs font-semibold text-gray-900 leading-tight mt-0.5">{teacher.department || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
                                <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 leading-none">Phone</p>
                                    <p className="text-xs font-semibold text-gray-900 leading-tight mt-0.5">{teacher.phone}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
                                <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 leading-none">Email</p>
                                    <p className="text-[10px] font-semibold text-gray-900 leading-tight mt-0.5 break-all">{teacher.email}</p>
                                </div>
                            </div>

                            {/* Blood Group */}
                            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
                                <Heart className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 leading-none">Blood Group</p>
                                    <p className="text-xs font-semibold text-gray-900 leading-tight mt-0.5">{teacher.blood_group || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Joining Date */}
                            <div className="flex items-center gap-2 py-1.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 leading-none">Joining Date</p>
                                    <p className="text-xs font-semibold text-gray-900 leading-tight mt-0.5">{formatDate(teacher.joining_date)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div style={{ background: 'linear-gradient(to right, #2563eb, #0891b2)' }} className="absolute bottom-0 left-0 right-0 text-white py-2 text-center">
                        <p className="text-[10px] font-bold tracking-wide">
                            {teacher.status === 'active' ? 'AUTHORIZED PERSONNEL' : teacher.status.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
