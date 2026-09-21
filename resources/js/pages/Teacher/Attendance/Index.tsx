import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, ClipboardCheck } from 'lucide-react';

interface Section {
    id: number;
    name: string;
    class_name: string;
    student_count: number;
}

interface Props {
    sections: Section[];
}

export default function Index({ sections }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Attendance Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-5">
                    {/* Header */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-950/[0.02]">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance Management</h1>
                        <p className="text-xs text-slate-500 mt-1">Select an assigned class section to view and monitor student attendance</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/[0.02] overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/75 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-900">Assigned Sections</h2>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                {sections.length} class{sections.length !== 1 ? 'es' : ''}
                            </span>
                        </div>
                        <div className="p-5">
                            {sections.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class {section.class_name}</span>
                                                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                                                        Section {section.name}
                                                    </h3>
                                                </div>
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    {section.student_count} Students
                                                </span>
                                                <Link
                                                    href={`/teacher/attendance/mark?section_id=${section.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                                                >
                                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                                    Attendance
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">No classes assigned</p>
                                    <p className="text-xs text-slate-400 mt-1">Class sections assigned to you will be displayed here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
