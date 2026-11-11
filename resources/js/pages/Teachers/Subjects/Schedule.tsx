import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    BookOpen,
    Users,
    GraduationCap,
    Clock,
    Layers,
    Printer,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';

interface AssignmentItem {
    id: number;
    is_class_teacher?: boolean;
    subject?: { id: number; name: string; code: string };
    schoolClass?: { id: number; name: string };
    class?: { id: number; name: string };
    section?: { id: number; name: string; student_count?: number } | null;
}

interface Props {
    teacher: {
        id: number;
        name?: string;
        first_name?: string;
        last_name?: string;
        employee_id: string;
        department?: string;
        designation?: string;
        user?: {
            name: string;
            email: string;
        };
    };
    assignments?: AssignmentItem[];
    schedule?: AssignmentItem[];
}

export default function Schedule({ teacher, assignments, schedule }: Props) {
    const rawList = assignments || schedule || [];

    const teacherName = teacher.user?.name || teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Teacher';

    const normalizedSchedule = useMemo(() => {
        return rawList.map(item => ({
            id: item.id,
            subject: item.subject || { id: 0, name: 'Curriculum Course', code: 'SUB' },
            schoolClass: item.schoolClass || item.class || { id: 0, name: 'N/A' },
            section: item.section || null,
            isClassTeacher: Boolean(item.is_class_teacher),
        }));
    }, [rawList]);

    const uniqueSubjects = useMemo(() => {
        return new Set(normalizedSchedule.map(s => s.subject.id)).size;
    }, [normalizedSchedule]);

    const uniqueClasses = useMemo(() => {
        return new Set(normalizedSchedule.map(s => s.schoolClass.id)).size;
    }, [normalizedSchedule]);

    const isClassTeacher = normalizedSchedule.some(s => s.isClassTeacher);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Schedule: ${teacherName}`} />

            <style>{`
                @media print {
                    nav, header, aside, .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .print-area {
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>

            <div className="space-y-4 pb-8 max-w-6xl mx-auto print-area">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <div className="no-print">
                    <FormPageHeader
                        title="Faculty Teaching Routine"
                        subtitle={`Classroom timetable and curriculum allocations for ${teacherName}`}
                        backUrl="/teachers"
                        badges={[
                            { label: teacher.employee_id, variant: 'neutral' },
                            { label: `${normalizedSchedule.length} Assigned Periods`, variant: 'indigo' },
                            ...(isClassTeacher ? [{ label: 'Class Teacher', variant: 'success' as const }] : [])
                        ]}
                        actions={
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    Print Routine
                                </button>
                                <Link
                                    href={`/teacher-subjects?teacher_id=${teacher.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                                >
                                    Manage Matrix
                                </Link>
                            </div>
                        }
                    />
                </div>

                {/* Print Title Header (Visible only when printed) */}
                <div className="hidden print:block border-b-2 border-slate-800 pb-3 mb-4">
                    <h1 className="text-xl font-black uppercase text-slate-900">{teacherName} - Teaching Routine</h1>
                    <p className="text-xs text-slate-600">Employee ID: {teacher.employee_id} • Total Allocations: {normalizedSchedule.length}</p>
                </div>

                {/* 2. FACULTY KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 no-print">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Teaching Slots</span>
                            <span className="text-base font-bold text-slate-800">{normalizedSchedule.length} Slots</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Distinct Subjects</span>
                            <span className="text-base font-bold text-slate-800">{uniqueSubjects} Courses</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Covered Classes</span>
                            <span className="text-base font-bold text-slate-800">{uniqueClasses} Grades</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Homeroom Status</span>
                            <span className="text-xs font-bold text-slate-800">
                                {isClassTeacher ? 'Assigned Class Teacher' : 'General Faculty'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. SCHEDULE ROSTER GRID */}
                {normalizedSchedule.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {normalizedSchedule.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-800 leading-snug">
                                                    {item.subject.name}
                                                </h3>
                                                <span className="text-[10px] font-mono text-slate-500">
                                                    {item.subject.code}
                                                </span>
                                            </div>
                                        </div>

                                        {item.isClassTeacher && (
                                            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                Homeroom
                                            </span>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400">Class Grade:</span>
                                            <span className="font-semibold text-slate-800">Class {item.schoolClass.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400">Section:</span>
                                            <span className="font-semibold text-indigo-700">
                                                {item.section ? `Section ${item.section.name}` : 'All Sections'}
                                            </span>
                                        </div>
                                        {item.section?.student_count !== undefined && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400">Enrolled Students:</span>
                                                <span className="font-mono text-slate-700">{item.section.student_count}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Routine Slot</span>
                                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active Allocation
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-slate-800">No Teaching Routine Configured</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No subject or classroom allocations have been assigned to this teacher yet.
                        </p>
                        <div className="mt-4">
                            <Link
                                href={`/teacher-subjects/create`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                            >
                                Assign Subjects Now
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
