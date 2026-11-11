import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, ClipboardCheck, ArrowUpRight, GraduationCap } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Section {
    id: number;
    name: string;
    class_name: string;
    student_count: number;
}

interface Props {
    sections: Section[];
}

export default function Index({ sections = [] }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Class Attendance Management" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Student Attendance Management"
                    subtitle="Select an assigned classroom section to record and verify daily attendance"
                    backUrl="/teacher/dashboard"
                    badges={[
                        { label: `${sections.length} Class Sections`, variant: 'neutral' }
                    ]}
                    actionSlot={
                        <Link
                            href="/teacher/attendance/my"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                            My Personal Attendance
                        </Link>
                    }
                />

                {/* 2. ASSIGNED CLASS SECTIONS GRID */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Assigned Classroom Sections</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {sections.length} Allocated
                        </span>
                    </div>

                    <div className="p-4 sm:p-5">
                        {sections.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {sections.map((section) => (
                                    <div
                                        key={section.id}
                                        className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between group"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                                                    Class {section.class_name}
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                                                    Section {section.name}
                                                </h4>
                                            </div>
                                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {section.student_count} Enrolled
                                            </span>

                                            <Link
                                                href={`/teacher/attendance/mark?section_id=${section.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                                            >
                                                <ClipboardCheck className="w-3.5 h-3.5" />
                                                Mark Sheet
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-medium text-slate-600">No classes currently assigned to you</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
