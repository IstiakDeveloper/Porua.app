import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, XCircle, Clock, Calendar, ArrowLeft, Search, UserCheck } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

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

export default function Mark({ section, date, students = [] }: Props) {
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
        switch ((status || '').toLowerCase()) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Present
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Absent
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Late
                    </span>
                );
            case 'half_day':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Half Day
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {status || 'Not Marked'}
                    </span>
                );
        }
    };

    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const summary = {
        present: students.filter(s => s.attendance_status === 'present').length,
        absent: students.filter(s => s.attendance_status === 'absent').length,
        late: students.filter(s => s.attendance_status === 'late').length,
        half_day: students.filter(s => s.attendance_status === 'half_day').length,
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Class Attendance - ${section.class_name} (${section.name})`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title={`Attendance Register: Class ${section.class_name} (${section.name})`}
                    subtitle={`Recording student attendance for date: ${selectedDate}`}
                    backUrl="/teacher/attendance"
                    badges={[
                        { label: `${students.length} Students Enrolled`, variant: 'neutral' },
                        { label: `${summary.present} Present Today`, variant: 'success' }
                    ]}
                    actionSlot={
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                            />
                        </div>
                    }
                />

                {/* 2. FOUR KPI STAT TILES */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-600">Present</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 tracking-tight mt-1">{summary.present}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">{students.length > 0 ? Math.round((summary.present / students.length) * 100) : 0}% of class</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-rose-600">Absent</span>
                            <XCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-bold text-rose-700 tracking-tight mt-1">{summary.absent}</p>
                        <p className="text-[11px] text-rose-600 mt-0.5">{students.length > 0 ? Math.round((summary.absent / students.length) * 100) : 0}% absent</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-600">Late</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-amber-700 tracking-tight mt-1">{summary.late}</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">Punctuality flags</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-600">Half Day</span>
                            <Calendar className="w-4 h-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-bold text-indigo-700 tracking-tight mt-1">{summary.half_day}</p>
                        <p className="text-[11px] text-indigo-500 mt-0.5">Partial attendance</p>
                    </div>
                </div>

                {/* 3. SEARCH STRIP */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Filter by student name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        />
                    </div>

                    <span className="text-xs font-semibold text-slate-500 self-end sm:self-center">
                        Showing {filteredStudents.length} of {students.length} students
                    </span>
                </div>

                {/* 4. STUDENT REGISTER (DUAL VIEW) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {filteredStudents.length > 0 ? (
                        <>
                            {/* Mobile cards (< 768px) */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredStudents.map((student) => (
                                    <div key={student.id} className="p-3.5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {student.photo ? (
                                                <img
                                                    src={`/storage/${student.photo}`}
                                                    alt={student.full_name}
                                                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-200">
                                                    {student.full_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-slate-900 truncate">{student.full_name}</h4>
                                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Roll #{student.roll_number}</p>
                                                {student.remarks && (
                                                    <p className="text-[10px] text-slate-400 truncate italic mt-0.5">Note: {student.remarks}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {getStatusBadge(student.attendance_status || 'absent')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table (>= 768px) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Teacher Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                    #{student.roll_number}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        {student.photo ? (
                                                            <img
                                                                src={`/storage/${student.photo}`}
                                                                alt={student.full_name}
                                                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] ring-1 ring-indigo-200">
                                                                {student.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-slate-900">{student.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(student.attendance_status || 'absent')}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-[11px]">
                                                    {student.remarks || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No students found matching your search</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
