import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle2,
    CalendarDays
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { formatTimeRange, formatWhen } from '@/utils/datetime';

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
    academic_year: string;
    attendance?: { percent: number | null; minimum: number | null; eligible: boolean | null } | null;
}

interface Schedule {
    id: number;
    subject_name: string;
    exam_date: string;
    day: string;
    start_time: string;
    end_time: string;
    duration: number;
    room_number: string | null;
}

interface SeatPlan {
    hall_name: string;
    seat_number: string;
    row_number: number;
}

interface Props {
    student: Student;
    exam: Exam;
    schedules: Schedule[];
    seatPlan: SeatPlan | null;
}

export default function Show({ student, exam, schedules = [], seatPlan }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`${exam.name} - Timetable`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title={exam.name}
                    subtitle={`Exam Timetable & Instructions • ${student.full_name} (Roll #${student.roll_number})`}
                    backUrl="/student/exams"
                    badges={[
                        { label: exam.academic_year, variant: 'neutral' },
                        { label: `Passing: ${exam.passing_marks}/${exam.total_marks}`, variant: 'neutral' }
                    ]}
                />

                {exam.attendance?.eligible === false && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                        Attendance is {exam.attendance.percent}% and the annual exam needs {exam.attendance.minimum}%. This student is not eligible to pass the annual exam.
                    </div>
                )}

                {/* 2. SEAT PLAN CARD IF AVAILABLE */}
                {seatPlan && (
                    <div className="bg-white rounded-xl border border-indigo-200/80 bg-indigo-50/30 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Exam Hall & Seat Allocation</h3>
                                <p className="text-sm font-bold text-indigo-900 mt-0.5">
                                    Hall: {seatPlan.hall_name} • Seat No: <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">{seatPlan.seat_number}</span>
                                </p>
                            </div>
                        </div>
                        <span className="text-xs text-indigo-700 font-medium bg-white px-2.5 py-1 rounded-lg border border-indigo-200 self-start sm:self-center">
                            Row #{seatPlan.row_number}
                        </span>
                    </div>
                )}

                {/* 3. SCHEDULE TABLE (DUAL RESPONSIVE VIEW) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Subject Routine & Schedule</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {schedules.length} Papers
                        </span>
                    </div>

                    {schedules && schedules.length > 0 ? (
                        <>
                            {/* Mobile Card Feed (< 768px) */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {schedules.map((item) => (
                                    <div key={item.id} className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-900">{item.subject_name}</h4>
                                            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                                {item.duration} Mins
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                            <span>Date: <strong>{formatWhen(item.exam_date)}</strong> ({item.day})</span>
                                            <span>Time: <strong className="font-mono">{formatTimeRange(item.start_time, item.end_time)}</strong></span>
                                        </div>
                                        {item.room_number && (
                                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" /> Room: {item.room_number}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table (>= 768px) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Day</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Room</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {schedules.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{item.subject_name}</td>
                                                <td className="px-4 py-3 text-slate-700 font-medium">
                                                    {formatWhen(item.exam_date)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{item.day}</td>
                                                <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">{formatTimeRange(item.start_time, item.end_time)}</td>
                                                <td className="px-4 py-3 text-slate-600">{item.duration} min</td>
                                                <td className="px-4 py-3 text-slate-700 font-medium">{item.room_number || 'Main Hall'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No subject timetable released yet for this exam</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
