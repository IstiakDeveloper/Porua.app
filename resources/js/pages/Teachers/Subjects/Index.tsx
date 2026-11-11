import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus,
    Trash2,
    Search,
    BookOpen,
    Users,
    GraduationCap,
    Calendar,
    ChevronDown,
    ChevronUp,
    Filter,
    RotateCcw,
    Layers,
    UserCheck,
    CheckCircle2,
    CalendarDays
} from 'lucide-react';

interface Assignment {
    id: number;
    teacher: {
        id: number;
        employee_id: string;
        user: {
            name: string;
            email: string;
        };
    };
    subject: {
        id: number;
        name: string;
        code: string;
    };
    schoolClass: {
        id: number;
        name: string;
    };
    section: {
        id: number;
        name: string;
    } | null;
}

interface Teacher {
    id: number;
    employee_id: string;
    user: {
        name: string;
        email: string;
    };
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

interface IndexProps {
    assignments: {
        data: Assignment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        teacher_id?: string;
        subject_id?: string;
        class_id?: string;
    };
    teachers: Teacher[];
    subjects: Subject[];
    classes: SchoolClass[];
    sections: Section[];
    currentAcademicYear: { id: number; year: string; name: string } | null;
}

export default function Index({
    assignments,
    filters,
    teachers,
    subjects,
    classes,
    currentAcademicYear
}: IndexProps) {
    const [teacherFilter, setTeacherFilter] = useState(filters?.teacher_id || '');
    const [subjectFilter, setSubjectFilter] = useState(filters?.subject_id || '');
    const [classFilter, setClassFilter] = useState(filters?.class_id || '');
    const [expandedTeachers, setExpandedTeachers] = useState<number[]>([]);

    // Deletion Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        assignmentId: number | null;
        teacherName: string;
        subjectName: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        assignmentId: null,
        teacherName: '',
        subjectName: '',
        isDeleting: false,
    });

    // Group assignments by teacher
    const groupedAssignments = useMemo(() => {
        const grouped = new Map<number, {
            teacher: Assignment['teacher'];
            assignments: Assignment[];
        }>();

        assignments.data.forEach(assignment => {
            const teacherId = assignment.teacher.id;
            if (!grouped.has(teacherId)) {
                grouped.set(teacherId, {
                    teacher: assignment.teacher,
                    assignments: []
                });
            }
            grouped.get(teacherId)!.assignments.push(assignment);
        });

        return Array.from(grouped.values());
    }, [assignments.data]);

    const toggleTeacher = (teacherId: number) => {
        setExpandedTeachers(prev =>
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const expandAll = () => {
        setExpandedTeachers(groupedAssignments.map(g => g.teacher.id));
    };

    const collapseAll = () => {
        setExpandedTeachers([]);
    };

    const handleDeleteClick = (id: number, teacherName: string, subjectName: string) => {
        setDeleteModal({
            isOpen: true,
            assignmentId: id,
            teacherName,
            subjectName,
            isDeleting: false,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteModal.assignmentId) return;
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        router.delete(`/teacher-subjects/${deleteModal.assignmentId}`, {
            onFinish: () => {
                setDeleteModal({
                    isOpen: false,
                    assignmentId: null,
                    teacherName: '',
                    subjectName: '',
                    isDeleting: false,
                });
            }
        });
    };

    const handleFilter = () => {
        router.get('/teacher-subjects', {
            teacher_id: teacherFilter || undefined,
            subject_id: subjectFilter || undefined,
            class_id: classFilter || undefined,
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setTeacherFilter('');
        setSubjectFilter('');
        setClassFilter('');
        router.get('/teacher-subjects');
    };

    const uniqueSubjectsCount = useMemo(() => {
        return new Set(assignments.data.map(a => a.subject.id)).size;
    }, [assignments.data]);

    const uniqueClassesCount = useMemo(() => {
        return new Set(assignments.data.map(a => a.schoolClass.id)).size;
    }, [assignments.data]);

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Subject Matrix" />

            <div className="space-y-4 pb-8 max-w-7xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Teacher Subject Matrix"
                    subtitle="Classroom curriculum allocations and weekly teaching responsibilities"
                    backUrl="/teachers"
                    badges={[
                        ...(currentAcademicYear ? [{ label: `AY: ${currentAcademicYear.year}`, variant: 'indigo' as const }] : []),
                        { label: `${assignments.total} Allocations`, variant: 'neutral' as const },
                        { label: `${groupedAssignments.length} Assigned Teachers`, variant: 'success' as const }
                    ]}
                    actions={
                        <Link
                            href="/teacher-subjects/create"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Assign Subject
                        </Link>
                    }
                />

                {/* 2. KPI METRICS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Assignments</span>
                            <span className="text-base font-bold text-slate-800">{assignments.total}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Assigned Teachers</span>
                            <span className="text-base font-bold text-slate-800">{groupedAssignments.length}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Curriculum Subjects</span>
                            <span className="text-base font-bold text-slate-800">{uniqueSubjectsCount}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Covered Classes</span>
                            <span className="text-base font-bold text-slate-800">{uniqueClassesCount}</span>
                        </div>
                    </div>
                </div>

                {/* 3. HIGH-DENSITY FILTER TOOLBAR */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Filter by Teacher</label>
                            <select
                                value={teacherFilter}
                                onChange={(e) => setTeacherFilter(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id.toString()}>
                                        {t.user.name} ({t.employee_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Filter by Subject</label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>
                                        {s.name} ({s.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Filter by Class</label>
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">All Classes</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id.toString()}>
                                        Class {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleFilter}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                            >
                                <Search className="w-3.5 h-3.5" />
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                title="Reset Filters"
                                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. EXPAND / COLLAPSE CONTROLS & GROUPED DIRECTORY */}
                <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700">
                        Faculty Allocation Groups ({groupedAssignments.length})
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={expandAll}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Expand All
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                            type="button"
                            onClick={collapseAll}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Collapse All
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {groupedAssignments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <h4 className="text-sm font-bold text-slate-800">No Subject Assignments Found</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                No teacher allocations match your filter criteria. Click "Assign Subject" to assign a curriculum to a faculty member.
                            </p>
                        </div>
                    ) : (
                        groupedAssignments.map((group) => {
                            const isExpanded = expandedTeachers.includes(group.teacher.id);
                            const teacherSubjects = new Set(group.assignments.map(a => a.subject.id)).size;
                            const teacherClasses = new Set(group.assignments.map(a => a.schoolClass.id)).size;

                            return (
                                <div
                                    key={group.teacher.id}
                                    className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
                                >
                                    {/* Faculty Header Strip */}
                                    <div
                                        onClick={() => toggleTeacher(group.teacher.id)}
                                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                                                {group.teacher.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xs font-bold text-slate-800">
                                                        {group.teacher.user.name}
                                                    </h3>
                                                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                                                        {group.teacher.employee_id}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-[11px] text-slate-500">
                                                        {group.teacher.user.email}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                                        {teacherSubjects} Subject{teacherSubjects > 1 ? 's' : ''}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                        {teacherClasses} Class{teacherClasses > 1 ? 'es' : ''}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                                        {group.assignments.length} Allocation{group.assignments.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                href={`/teachers/${group.teacher.id}/schedule`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
                                            >
                                                <CalendarDays className="w-3 h-3" />
                                                <span className="hidden sm:inline">View Routine</span>
                                            </Link>
                                            <button
                                                type="button"
                                                className="p-1 rounded text-slate-400 hover:text-slate-600"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Assignments Table */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/40 p-3 sm:p-4">
                                            {/* Mobile Card Layout */}
                                            <div className="block md:hidden space-y-2">
                                                {group.assignments.map((assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-800 block">
                                                                    {assignment.subject.name}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-slate-500">
                                                                    {assignment.subject.code}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteClick(
                                                                    assignment.id,
                                                                    group.teacher.user.name,
                                                                    assignment.subject.name
                                                                )}
                                                                className="text-rose-600 hover:text-rose-700 p-1"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                                                                Class {assignment.schoolClass.name}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                                                                {assignment.section ? `Sec: ${assignment.section.name}` : 'All Sections'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Desktop Table Layout */}
                                            <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200/80 bg-white">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                                        <tr>
                                                            <th className="px-4 py-2.5">Subject</th>
                                                            <th className="px-4 py-2.5 font-mono">Code</th>
                                                            <th className="px-4 py-2.5">Class</th>
                                                            <th className="px-4 py-2.5">Section</th>
                                                            <th className="px-4 py-2.5 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {group.assignments.map((assignment) => (
                                                            <tr key={assignment.id} className="hover:bg-slate-50/60 transition-colors">
                                                                <td className="px-4 py-2.5 font-semibold text-slate-800">
                                                                    {assignment.subject.name}
                                                                </td>
                                                                <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                                                                    {assignment.subject.code}
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                        Class {assignment.schoolClass.name}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                        {assignment.section ? `Section ${assignment.section.name}` : 'All Sections'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteClick(
                                                                            assignment.id,
                                                                            group.teacher.user.name,
                                                                            assignment.subject.name
                                                                        )}
                                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* 5. PAGINATION FOOTER */}
                {assignments.last_page > 1 && (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                            Showing page {assignments.current_page} of {assignments.last_page} ({assignments.total} total)
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={assignments.current_page === 1}
                                onClick={() => router.get('/teacher-subjects', {
                                    page: assignments.current_page - 1,
                                    teacher_id: teacherFilter || undefined,
                                    subject_id: subjectFilter || undefined,
                                    class_id: classFilter || undefined,
                                })}
                                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="px-2 text-slate-400 font-mono text-[11px]">
                                {assignments.current_page} / {assignments.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={assignments.current_page === assignments.last_page}
                                onClick={() => router.get('/teacher-subjects', {
                                    page: assignments.current_page + 1,
                                    teacher_id: teacherFilter || undefined,
                                    subject_id: subjectFilter || undefined,
                                    class_id: classFilter || undefined,
                                })}
                                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* 6. DELETE CONFIRMATION MODAL */}
                <DeleteModal
                    isOpen={deleteModal.isOpen}
                    title="Remove Subject Assignment"
                    message={`Are you sure you want to remove the subject "${deleteModal.subjectName}" from "${deleteModal.teacherName}"?`}
                    confirmLabel={deleteModal.isDeleting ? 'Removing...' : 'Remove Assignment'}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </AuthenticatedLayout>
    );
}
