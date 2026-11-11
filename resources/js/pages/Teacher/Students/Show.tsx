import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Users,
    TrendingUp,
    Award,
    GraduationCap,
    Clock,
    CheckCircle2
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    class_name: string;
    section_name: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string | null;
    guardian_relation: string;
}

interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    total_days: number;
}

interface Result {
    exam_name: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    grade: string;
    gpa: number;
}

interface Props {
    student: Student;
    attendanceStats: AttendanceStats;
    recentResults: Result[];
}

export default function Show({ student, attendanceStats, recentResults = [] }: Props) {
    const attendancePercentage = attendanceStats.total_days > 0
        ? Math.round((attendanceStats.present / attendanceStats.total_days) * 100)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title={`Student 360 - ${student.full_name}`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title={student.full_name}
                    subtitle={`Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number} • ID: ${student.admission_number}`}
                    backUrl="/teacher/students"
                    badges={[
                        { label: `Class ${student.class_name}`, variant: 'neutral' },
                        { label: `${attendancePercentage}% Attendance Rate`, variant: attendancePercentage >= 80 ? 'success' : 'neutral' }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* LEFT COLUMN: STUDENT IDENTITY CARD (4 COLS) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs text-center">
                            <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-slate-200 overflow-hidden mx-auto mb-3 shadow-xs flex items-center justify-center">
                                {student.photo ? (
                                    <img
                                        src={`/storage/${student.photo}`}
                                        alt={student.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-indigo-700 bg-indigo-100">
                                        {student.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-base font-bold text-slate-900 tracking-tight">{student.full_name}</h2>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {student.admission_number}</p>

                            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Class {student.class_name} ({student.section_name})
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    Roll #{student.roll_number}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Gender</span>
                                    <span className="font-semibold text-slate-800 capitalize">{student.gender}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Date of Birth</span>
                                    <span className="font-semibold text-slate-800">{student.date_of_birth}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">Direct Contact</span>
                                    <span className="font-semibold text-slate-800 font-mono">{student.phone || '—'}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Address</span>
                                    <span className="font-semibold text-slate-800 text-right">{student.address || student.city || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* GUARDIAN DOSSIER CARD */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                Guardian Connection
                            </h3>
                            <div className="space-y-1.5 text-xs">
                                <div className="py-1">
                                    <span className="text-slate-500 block text-[11px]">Guardian Name</span>
                                    <strong className="text-slate-800 font-bold">{student.guardian_name || 'N/A'}</strong>
                                    <span className="text-[10px] text-slate-400">({student.guardian_relation || 'Guardian'})</span>
                                </div>
                                <div className="py-1">
                                    <span className="text-slate-500 block text-[11px]">Primary Phone</span>
                                    <strong className="text-slate-800 font-mono">{student.guardian_phone || 'No phone'}</strong>
                                </div>
                                {student.guardian_email && (
                                    <div className="py-1">
                                        <span className="text-slate-500 block text-[11px]">Email</span>
                                        <span className="text-slate-700">{student.guardian_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ATTENDANCE & ACADEMIC PERFORMANCE (8 COLS) */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* 1. ATTENDANCE OVERVIEW CARDS */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                                    Attendance Record
                                </span>
                                <span className="font-mono text-emerald-700 font-bold">{attendancePercentage}% Overall</span>
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/50 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Days</span>
                                    <span className="text-lg font-bold text-slate-900 font-mono">{attendanceStats.total_days}</span>
                                </div>
                                <div className="p-2.5 rounded-lg border border-emerald-200/70 bg-emerald-50/30 text-center">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Present</span>
                                    <span className="text-lg font-bold text-emerald-700 font-mono">{attendanceStats.present}</span>
                                </div>
                                <div className="p-2.5 rounded-lg border border-rose-200/70 bg-rose-50/30 text-center">
                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Absent</span>
                                    <span className="text-lg font-bold text-rose-700 font-mono">{attendanceStats.absent}</span>
                                </div>
                                <div className="p-2.5 rounded-lg border border-amber-200/70 bg-amber-50/30 text-center">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Late</span>
                                    <span className="text-lg font-bold text-amber-700 font-mono">{attendanceStats.late}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. RECENT EXAM RESULTS */}
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <h3 className="text-sm font-semibold text-slate-900">Academic Examination Performance</h3>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                    {recentResults.length} Exams Recorded
                                </span>
                            </div>

                            {recentResults && recentResults.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                                <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Exam Name</th>
                                                <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Obtained / Total</th>
                                                <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Percentage</th>
                                                <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Grade</th>
                                                <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">GPA</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recentResults.map((res, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-slate-900">{res.exam_name}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                                                        {res.obtained_marks} / {res.total_marks}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-slate-700 font-mono">
                                                        {res.percentage}%
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            {res.grade}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-indigo-700 font-mono">
                                                        {res.gpa}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No published examination results found for this student</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
