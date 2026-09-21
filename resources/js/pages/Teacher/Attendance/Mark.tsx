import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Calendar, ArrowLeft, Search } from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
    photo: string | null;
    attendance_status: string;
    remarks: string | null;
}

interface Section {
    id: number;
    name: string;
    class_name: string;
}

interface Props {
    section: Section;
    date: string;
    students: Student[];
}

export default function Mark({ section, date, students }: Props) {
    const [selectedDate, setSelectedDate] = useState(date);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        router.get('/teacher/attendance/mark', {
            section_id: section.id,
            date: newDate
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { badge: string; dot: string; label: string }> = {
            present: {
                badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
                dot: 'bg-emerald-500',
                label: 'Present',
            },
            absent: {
                badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
                dot: 'bg-rose-500',
                label: 'Absent',
            },
            late: {
                badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
                dot: 'bg-amber-500',
                label: 'Late',
            },
            half_day: {
                badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
                dot: 'bg-indigo-500',
                label: 'Half Day',
            },
        };

        const variant = variants[status] || variants.present;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${variant.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${variant.dot}`} />
                {variant.label}
            </span>
        );
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const summary = {
        present: students.filter(s => s.attendance_status === 'present').length,
        absent: students.filter(s => s.attendance_status === 'absent').length,
        late: students.filter(s => s.attendance_status === 'late').length,
        half_day: students.filter(s => s.attendance_status === 'half_day').length,
    };

    return (
        <AuthenticatedLayout>
            <Head title="View Attendance" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-5">
                    {/* Header */}
                    <div>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to attendance
                        </button>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-950/[0.02]">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Class Attendance Records</h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Class: <span className="font-semibold text-slate-700">{section.class_name}</span> · Section: <span className="font-semibold text-slate-700">{section.name}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="h-9 rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Metric Tiles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                            <p className="text-[10px] font-medium text-slate-500">Present</p>
                            <p className="text-base font-bold text-emerald-600 mt-0.5">{summary.present}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                            <p className="text-[10px] font-medium text-slate-500">Absent</p>
                            <p className="text-base font-bold text-rose-600 mt-0.5">{summary.absent}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                            <p className="text-[10px] font-medium text-slate-500">Late</p>
                            <p className="text-base font-bold text-amber-600 mt-0.5">{summary.late}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                            <p className="text-[10px] font-medium text-slate-500">Half Day</p>
                            <p className="text-base font-bold text-indigo-600 mt-0.5">{summary.half_day}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                        <input
                            type="text"
                            placeholder="Search by student name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-8.5 w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-3 text-xs text-slate-800 shadow-2xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        />
                    </div>

                    {/* Attendance List */}
                    <div className="bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
                        <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Student Register
                            </h3>
                            <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {filteredStudents.length} of {students.length} students
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    No students found matching your search.
                                </div>
                            ) : (
                                filteredStudents.map((student) => (
                                    <div key={student.id} className="px-3.5 py-1.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <div className="shrink-0">
                                                {student.photo ? (
                                                    <img
                                                        src={`/storage/${student.photo}`}
                                                        alt={student.full_name}
                                                        className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-900/10"
                                                    />
                                                ) : (
                                                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] ring-1 ring-slate-900/10">
                                                        {student.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-900 leading-tight">{student.full_name}</h4>
                                                <p className="text-[10px] text-slate-500 font-mono leading-tight mt-0.5">Roll: {student.roll_number}</p>
                                                {student.remarks && (
                                                    <p className="text-[10px] text-slate-400 leading-tight truncate max-w-xs">Note: {student.remarks}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {getStatusBadge(student.attendance_status || 'absent')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
