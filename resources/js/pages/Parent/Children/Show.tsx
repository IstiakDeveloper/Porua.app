import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { formatTaka, formatWhen } from '@/Components/Parent/format';
import { route } from '@/Components/Parent/route';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    Award,
    Receipt,
    User,
    Phone,
    MapPin,
    HeartPulse,
    Droplet,
    Calendar,
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface ResultRow {
    id: number;
    exam_name: string;
    percentage: number;
    grade: string;
    gpa: number;
}

interface BookRow {
    id: number;
    title: string;
    due_date: string | null;
    is_overdue: boolean;
    fine_amount: number;
}

interface TodayClass {
    name: string;
    teacher_name?: string | null;
    room_no?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}

interface Props {
    student: {
        id: number;
        full_name: string;
        photo: string | null;
        admission_number?: string;
        roll_number: string | null;
        date_of_birth: string | null;
        gender: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        class_name: string;
        section_name: string;
        blood_group: string | null;
        medical_conditions: string | null;
    };
    attendanceStats: { present: number; absent: number; late: number; total_days: number };
    recentResults: ResultRow[];
    feeStats: { total_paid: number; total_due: number; overdue_count: number };
    todayClass: TodayClass | null;
    issuedBooks: BookRow[];
}

function percent(present: number, total: number): string {
    if (!total) return '—';
    return `${Math.round((present / total) * 100)}%`;
}

export default function Show({ student, attendanceStats, recentResults, feeStats, todayClass, issuedBooks }: Props) {
    const attendancePct = attendanceStats.total_days > 0
        ? Math.round((attendanceStats.present / attendanceStats.total_days) * 100)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title={`${student.full_name} - Student Profile`} />

            <ParentPage
                title={student.full_name}
                subtitle={`Class ${student.class_name} • Sec ${student.section_name}${student.roll_number ? ` • Roll: ${student.roll_number}` : ''}`}
                action={
                    <Link
                        href={route('parent.dashboard')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Dashboard
                    </Link>
                }
            >
                {/* 1. Student Identity Hero Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            {student.photo ? (
                                <img
                                    src={student.photo}
                                    alt={student.full_name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-2xs shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center font-bold text-indigo-700 text-lg shrink-0">
                                    {student.full_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                    {student.full_name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                        Class {student.class_name} ({student.section_name})
                                    </span>
                                    {student.roll_number && (
                                        <span className="font-mono text-slate-600">
                                            Roll: {student.roll_number}
                                        </span>
                                    )}
                                    {student.admission_number && (
                                        <span className="font-mono text-slate-600">
                                            Adm: {student.admission_number}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fast Navigation Tabs */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <Link
                                href={route('parent.attendance.index', { student_id: student.id })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                            >
                                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                                Attendance
                            </Link>
                            <Link
                                href={route('parent.exams.index', { student_id: student.id })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                            >
                                <Award className="w-3.5 h-3.5 text-slate-500" />
                                Exam Results
                            </Link>
                            <Link
                                href={route('parent.fees.index', { student_id: student.id })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                            >
                                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                                Fees Log
                            </Link>
                        </div>
                    </div>

                    {/* Personal & Demographic Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                            <p className="font-medium text-slate-800 mt-0.5">{formatWhen(student.date_of_birth)}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gender</p>
                            <p className="font-medium text-slate-800 mt-0.5 capitalize">{student.gender || '—'}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Blood Group</p>
                            <p className="font-semibold text-rose-700 mt-0.5">{student.blood_group || '—'}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact Phone</p>
                            <p className="font-mono text-slate-800 mt-0.5">{student.phone || '—'}</p>
                        </div>
                    </div>

                    {(student.address || student.medical_conditions) && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                            {student.address && (
                                <p className="text-slate-600 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span><strong className="text-slate-700">Residential Address:</strong> {student.address}</span>
                                </p>
                            )}
                            {student.medical_conditions && (
                                <p className="text-amber-800 flex items-start gap-1.5">
                                    <HeartPulse className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span><strong className="text-amber-900">Medical Notes:</strong> {student.medical_conditions}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Key Academic Indicators (4 Metrics) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Annual Attendance</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">{percent(attendanceStats.present, attendanceStats.total_days)}</p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${attendancePct}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{attendanceStats.present} of {attendanceStats.total_days} days recorded</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Absences</p>
                        <p className="text-xl font-bold text-rose-700 mt-0.5">{attendanceStats.absent}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{attendanceStats.late} late arrivals</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding Dues</p>
                        <p className={`text-xl font-bold mt-0.5 ${feeStats.total_due > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {formatTaka(feeStats.total_due)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            {feeStats.overdue_count > 0 ? `${feeStats.overdue_count} overdue invoice(s)` : 'No overdue bills'}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Fees Paid</p>
                        <p className="text-xl font-bold text-emerald-700 mt-0.5">{formatTaka(feeStats.total_paid)}</p>
                        <p className="text-[11px] text-slate-400 mt-1">Cleared to school</p>
                    </div>
                </div>

                {/* 3. Today's Class & Issued Books */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Today's Period */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            Today's Class Schedule
                        </h3>
                        {todayClass ? (
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                <p className="font-bold text-slate-900">{todayClass.name}</p>
                                <p className="text-slate-600 mt-0.5 font-mono">
                                    Time: {todayClass.start_time || '—'} – {todayClass.end_time || '—'}
                                    {todayClass.room_no ? ` • Room ${todayClass.room_no}` : ''}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Teacher: {todayClass.teacher_name || 'Designated faculty'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 py-3">No active batch classes scheduled for today.</p>
                        )}
                    </div>

                    {/* Library Issued Books */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            Library Books Issued
                        </h3>
                        {issuedBooks && issuedBooks.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {issuedBooks.map((book) => (
                                    <div key={book.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{book.title}</p>
                                            <p className="text-[11px] text-slate-500">Due: {book.due_date || '—'}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {book.is_overdue ? (
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    Overdue
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Issued
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 py-3">No borrowed library books currently pending return.</p>
                        )}
                    </div>
                </div>

                {/* 4. Recent Exam Results */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-indigo-600" />
                            Published Academic Results
                        </h3>
                        <Link
                            href={route('parent.exams.index', { student_id: student.id })}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            View All Results →
                        </Link>
                    </div>

                    {recentResults && recentResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {recentResults.map((result) => (
                                <Link
                                    key={result.id}
                                    href={route('parent.exams.result', result.id)}
                                    className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 group"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                                            {result.exam_name}
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            GPA: <span className="font-mono font-semibold text-slate-800">{Number(result.gpa).toFixed(2)}</span> • Grade: <span className="font-semibold text-indigo-600">{result.grade}</span>
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-mono font-bold text-xs text-slate-900 block">
                                            {Number(result.percentage).toFixed(0)}%
                                        </span>
                                        <span className="text-[10px] text-indigo-600 font-semibold group-hover:underline">
                                            Marksheet →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-xs text-slate-500">
                            No published term or semester exam results recorded yet.
                        </div>
                    )}
                </div>
            </ParentPage>
        </AuthenticatedLayout>
    );
}
