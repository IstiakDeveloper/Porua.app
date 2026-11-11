import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Calendar,
    Clock,
    Award,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    MapPin,
    CalendarDays
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { dateBadge, formatTimeRange, formatWhen } from '@/utils/datetime';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
    academic_year: string;
    has_result: boolean;
    result_id: number | null;
}

interface Schedule {
    id: number;
    exam_name: string;
    subject_name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    duration: number;
    room_number: string | null;
}

interface Props {
    student: Student;
    exams: Exam[];
    upcomingSchedules: Schedule[];
}

export default function Index({ student, exams = [], upcomingSchedules = [] }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Exams & Schedules" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Exams & Schedules"
                    subtitle={`${student.full_name} • Class ${student.class_name} (${student.section_name}) • Roll #${student.roll_number}`}
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `${exams.length} Exams Recorded`, variant: 'neutral' }
                    ]}
                    actionSlot={
                        <Link
                            href="/student/results"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                        >
                            <Award className="w-3.5 h-3.5" />
                            My Published Results
                        </Link>
                    }
                />

                {/* 2. UPCOMING EXAM SCHEDULE CARDS */}
                {upcomingSchedules && upcomingSchedules.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-semibold text-slate-900">Upcoming Exam Routine</h3>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                {upcomingSchedules.length} Upcoming Papers
                            </span>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {upcomingSchedules.map((schedule) => {
                                const badge = dateBadge(schedule.exam_date);
                                return (
                                <div
                                    key={schedule.id}
                                    className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] uppercase font-bold text-indigo-500">
                                            {badge.month}
                                        </span>
                                        <span className="text-lg font-bold text-indigo-700 leading-none">
                                            {badge.day}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">{schedule.subject_name}</h4>
                                        <p className="text-[11px] text-slate-500">{schedule.exam_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-1.5">
                                            <span className="flex items-center gap-1 font-mono">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                {formatTimeRange(schedule.start_time, schedule.end_time)}
                                            </span>
                                            <span>• {schedule.duration} Mins</span>
                                            {schedule.room_number && (
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    Room {schedule.room_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. ALL EXAMS DIRECTORY */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80">
                        <h3 className="text-sm font-semibold text-slate-900">Academic Examination Directory</h3>
                        <p className="text-xs text-slate-500 mt-0.5">List of registered term tests and final examinations</p>
                    </div>

                    {exams && exams.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-slate-900 truncate">{exam.name}</h4>
                                            {exam.has_result && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Result Published
                                                </span>
                                            )}
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                {exam.academic_year}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                Date: <strong className="text-slate-700 font-medium">{formatWhen(exam.exam_date)}</strong>
                                            </span>
                                            <span>Total Marks: <strong className="text-slate-700 font-medium">{exam.total_marks}</strong></span>
                                            <span>Passing Marks: <strong className="text-slate-700 font-medium">{exam.passing_marks}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                        <Link
                                            href={`/student/exams/${exam.id}`}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            View Timetable
                                        </Link>
                                        {exam.has_result && exam.result_id && (
                                            <Link
                                                href={`/student/results/${exam.result_id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                            >
                                                <Award className="w-3.5 h-3.5" />
                                                View Marksheet
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No exams registered for this session</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
