import React from 'react';
import { Head } from '@inertiajs/react';
import { User, Mail, Phone, Calendar, Building2, UserCircle, Heart, X, ShieldCheck } from 'lucide-react';
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

    return (
        <>
            <Head title={`${teacher.full_name} - Faculty ID Card`} />

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

                    .close-button, .screen-controls {
                        display: none !important;
                    }
                }

                @media screen {
                    body {
                        background: #f1f5f9;
                    }
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
            `}</style>

            {/* Close Button - Only visible on screen */}
            <div className="screen-controls fixed top-4 right-4 flex items-center gap-2 z-50">
                <button
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md transition-colors"
                >
                    Print ID Card
                </button>
                <button
                    onClick={() => window.close()}
                    className="close-button bg-slate-800 hover:bg-slate-900 text-white rounded-full p-2 shadow-md transition-colors"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="print-container min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div
                    style={{ width: '8.5cm', height: '13.5cm' }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 relative flex flex-col justify-between"
                >
                    {/* Top Institutional Banner */}
                    <div className="bg-slate-900 text-white pt-4 pb-12 px-3 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 to-slate-900/90 pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                                {institute.type === 'coaching' ? 'Faculty Identity Card' : 'Faculty ID Card'}
                            </p>
                            <h2 className="text-xs font-extrabold text-white mt-0.5 truncate px-2">
                                {institute.name}
                            </h2>
                        </div>
                    </div>

                    {/* Photo Container */}
                    <div className="flex justify-center -mt-10 relative z-20">
                        {teacher.photo && !imageError ? (
                            <img
                                src={getTeacherImageUrl(teacher.photo) || ''}
                                alt={teacher.full_name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white ring-1 ring-slate-200"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md ring-1 ring-slate-200">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                        )}
                    </div>

                    {/* Teacher Identity Name */}
                    <div className="text-center px-4 pt-1.5 pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{teacher.full_name}</h3>
                        <p className="text-[11px] font-medium text-indigo-600 mt-0.5">
                            {teacher.designation || 'Faculty Member'}
                        </p>
                    </div>

                    {/* Credential Data Rows */}
                    <div className="px-4 py-2 flex-1 space-y-1.5 text-slate-800">
                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Employee ID</span>
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {teacher.employee_id}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Department</span>
                            <span className="font-semibold text-slate-800 text-[11px]">{teacher.department || 'General'}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Phone</span>
                            <span className="font-semibold text-slate-800 text-[11px]">{teacher.phone || '—'}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Blood Group</span>
                            <span className="font-bold text-rose-600 text-[11px]">{teacher.blood_group || 'N/A'}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Joining Date</span>
                            <span className="font-medium text-slate-700 text-[11px]">{formatDate(teacher.joining_date)}</span>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className="px-5 pb-3 pt-1 flex items-end justify-between">
                        <div className="text-center">
                            <div className="h-6 flex items-end justify-center">
                                <span className="text-[9px] font-script italic text-slate-500">Holder</span>
                            </div>
                            <div className="border-t border-slate-400 w-16 pt-0.5">
                                <span className="text-[8px] text-slate-400 uppercase font-semibold">Teacher</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="h-6 flex items-end justify-center">
                                <ShieldCheck className="w-5 h-5 text-indigo-700 opacity-60" />
                            </div>
                            <div className="border-t border-slate-400 w-20 pt-0.5">
                                <span className="text-[8px] text-slate-400 uppercase font-semibold">Principal Seal</span>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div className="bg-slate-900 text-white py-1.5 px-3 text-center">
                        <p className="text-[9px] font-bold tracking-wider text-slate-300">
                            {teacher.status === 'active' ? 'OFFICIAL FACULTY PASS' : teacher.status.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
