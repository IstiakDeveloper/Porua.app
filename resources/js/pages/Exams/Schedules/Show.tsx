import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatClock, formatWhen } from '@/utils/datetime';
import { ArrowLeft, Edit, Calendar, Clock, BookOpen, GraduationCap, MapPin, FileText } from 'lucide-react';
import { ExamSchedule } from '@/types/exam';

interface ShowProps {
    schedule: ExamSchedule;
}

function Detail({ label, icon, value }: { label: string; icon?: React.ReactNode; value?: React.ReactNode }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                {icon}
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value || '—'}</p>
        </div>
    );
}

export default function Show({ schedule }: ShowProps) {
    const className = schedule.school_class?.name || schedule.schoolClass?.name;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Schedule" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>Routine slot</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            {schedule.subject?.name || 'Exam paper'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">{schedule.exam?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/exam-schedules/${schedule.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Schedule
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.visit('/exam-schedules')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Detail label="Exam" icon={<BookOpen className="w-3 h-3" />} value={schedule.exam?.name} />
                        <Detail label="Class" icon={<GraduationCap className="w-3 h-3" />} value={className} />
                        <Detail label="Subject" value={schedule.subject?.name} />
                        <Detail label="Date" icon={<Calendar className="w-3 h-3" />} value={formatWhen(schedule.exam_date || schedule.date)} />
                        <Detail label="Start" icon={<Clock className="w-3 h-3" />} value={formatClock(schedule.start_time)} />
                        <Detail label="End" icon={<Clock className="w-3 h-3" />} value={formatClock(schedule.end_time)} />
                        {schedule.room_number && (
                            <Detail label="Room" icon={<MapPin className="w-3 h-3" />} value={schedule.room_number} />
                        )}
                    </div>
                    {schedule.instructions && (
                        <div className="mt-5 pt-5 border-t border-slate-100">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Instructions
                            </p>
                            <p className="mt-1 text-sm text-slate-800">{schedule.instructions}</p>
                        </div>
                    )}
                </div>

                {schedule.invigilators && schedule.invigilators.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <h2 className="text-sm font-semibold text-slate-900 mb-3">Invigilators</h2>
                        <div className="space-y-2">
                            {schedule.invigilators.map((invigilator) => (
                                <div key={invigilator.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                                        {invigilator.teacher?.user?.name?.charAt(0) || 'T'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{invigilator.teacher?.user?.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {formatWhen(invigilator.duty_date)} · {formatClock(invigilator.duty_time)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
