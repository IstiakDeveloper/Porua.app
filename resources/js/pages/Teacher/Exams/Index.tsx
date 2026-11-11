import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FileText, Calendar, Edit3, Eye, Shield, Award, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';
import { formatTimeRange, formatWhen } from '@/utils/datetime';

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    subject_id: number | null;
    subject_name: string;
    class_name: string;
    section_name: string;
    is_published: boolean;
    total_marks: number;
}

interface InvigilationDuty {
    id: number;
    exam_name: string;
    subject: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    hall_name: string;
}

interface Props {
    exams: Exam[];
    invigilationDuties: InvigilationDuty[];
}

export default function Index({ exams = [], invigilationDuties = [] }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Exams & Grading Management" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Exams & Gradebook Management"
                    subtitle="Record student marks, verify published grade sheets, and inspect hall duties"
                    backUrl="/teacher/dashboard"
                    badges={[
                        { label: `${exams.length} Assigned Papers`, variant: 'neutral' }
                    ]}
                />

                {/* 2. INVIGILATION DUTIES BANNER */}
                {invigilationDuties && invigilationDuties.length > 0 && (
                    <div className="bg-white rounded-xl border border-purple-200/80 bg-purple-50/20 p-4 shadow-2xs">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                                Assigned Exam Hall Invigilation Duties
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {invigilationDuties.map((duty) => (
                                <div key={duty.id} className="p-3 rounded-lg border border-purple-200/70 bg-white text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">{duty.exam_name}</span>
                                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                            Hall: {duty.hall_name}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 font-medium mt-1">{duty.subject}</p>
                                    <div className="flex items-center gap-3 text-slate-500 mt-1.5 text-[11px]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {formatWhen(duty.exam_date)}
                                        </span>
                                        <span className="flex items-center gap-1 font-mono">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {formatTimeRange(duty.start_time, duty.end_time)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. ASSIGNED EXAMS & GRADE ENTRY LIST */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Examinations & Mark Sheets</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {exams.length} Exam Papers
                        </span>
                    </div>

                    {exams && exams.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-xs font-bold text-slate-900 truncate">{exam.name}</h4>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                exam.is_published
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {exam.is_published ? 'Published' : 'Draft / Grading'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-indigo-700">
                                            {exam.subject_name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                            <span>Class {exam.class_name} - {exam.section_name}</span>
                                            <span>•</span>
                                            <span>Date: <strong className="text-slate-700 font-medium">{formatWhen(exam.exam_date)}</strong></span>
                                            <span>•</span>
                                            <span>Max Marks: <strong className="text-slate-700 font-mono">{exam.total_marks}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                        <Link
                                            href={`/teacher/exams/marks/entry?exam_id=${exam.id}&subject_id=${exam.subject_id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            Enter Marks
                                        </Link>
                                        <Link
                                            href={`/teacher/exams/marks/view?exam_id=${exam.id}&subject_id=${exam.subject_id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                                            View Gradebook
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No examination subjects currently assigned</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
