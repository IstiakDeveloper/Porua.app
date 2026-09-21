import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Select from '@/Components/Select';
import { Plus, Trash2, Search, BookOpen, Users, GraduationCap, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function Index({ assignments, filters, teachers, subjects, classes, currentAcademicYear }: IndexProps) {
    const [teacherFilter, setTeacherFilter] = useState(filters?.teacher_id || '');
    const [subjectFilter, setSubjectFilter] = useState(filters?.subject_id || '');
    const [classFilter, setClassFilter] = useState(filters?.class_id || '');
    const [expandedTeachers, setExpandedTeachers] = useState<number[]>([]);

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

    const handleDelete = (id: number, teacherName: string, subjectName: string) => {
        if (confirm(`Are you sure you want to remove ${subjectName} assignment from ${teacherName}?`)) {
            router.delete(`/teacher-subjects/${id}`);
        }
    };

    const handleFilter = () => {
        router.get('/teacher-subjects', {
            teacher_id: teacherFilter,
            subject_id: subjectFilter,
            class_id: classFilter,
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setTeacherFilter('');
        setSubjectFilter('');
        setClassFilter('');
        router.get('/teacher-subjects');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Subject Assignments" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Teacher Subject Assignments
                        </h1>
                        <p className="text-gray-600 mt-1">Manage teacher subject assignments for classes and sections</p>
                    </div>
                    <Link href="/teacher-subjects/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Assign Subject
                        </Button>
                    </Link>
                </div>

                {/* Current Academic Year */}
                {currentAcademicYear && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                Academic Year: <strong>{currentAcademicYear.year}</strong> ({currentAcademicYear.name})
                            </span>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{assignments.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Teachers with Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{groupedAssignments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Unique Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Set(assignments.data.map(a => a.subject.id)).size}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Unique Classes</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Set(assignments.data.map(a => a.schoolClass.id)).size}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            label="Filter by Teacher"
                            value={teacherFilter}
                            onChange={(e) => setTeacherFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Teachers' },
                                ...teachers.map(t => ({
                                    value: t.id.toString(),
                                    label: `${t.user.name} (${t.employee_id})`,
                                })),
                            ]}
                        />

                        <Select
                            label="Filter by Subject"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Subjects' },
                                ...subjects.map(s => ({
                                    value: s.id.toString(),
                                    label: `${s.name} (${s.code})`,
                                })),
                            ]}
                        />

                        <Select
                            label="Filter by Class"
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Classes' },
                                ...classes.map(c => ({
                                    value: c.id.toString(),
                                    label: `Class ${c.name}`,
                                })),
                            ]}
                        />

                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex-1">
                                <Search className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                            <Button onClick={handleResetFilters} variant="secondary">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Teacher-wise Grouped Table */}
                <div className="space-y-4">
                    {groupedAssignments.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Assignments Found</h4>
                            <p className="text-gray-600 mt-1">Assign subjects to teachers to get started.</p>
                        </div>
                    ) : (
                        groupedAssignments.map((group, groupIndex) => {
                            const isExpanded = expandedTeachers.includes(group.teacher.id);
                            const uniqueSubjects = new Set(group.assignments.map(a => a.subject.id)).size;
                            const uniqueClasses = new Set(group.assignments.map(a => a.schoolClass.id)).size;
                            return (
                                <div key={group.teacher.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: `${groupIndex * 50}ms` }}>
                                    {/* Teacher Header */}
                                    <div
                                        className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 p-4 cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-colors"
                                        onClick={() => toggleTeacher(group.teacher.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                                                    {group.teacher.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{group.teacher.user.name}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                        <span className="font-mono font-semibold">ID: {group.teacher.employee_id}</span>
                                                        <span>📧 {group.teacher.user.email}</span>
                                                        <Badge variant="info">{uniqueSubjects} Subject{uniqueSubjects > 1 ? 's' : ''}</Badge>
                                                        <Badge variant="success">{uniqueClasses} Class{uniqueClasses > 1 ? 'es' : ''}</Badge>
                                                        <Badge variant="warning">{group.assignments.length} Assignment{group.assignments.length > 1 ? 's' : ''}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" icon={isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}>
                                                {isExpanded ? 'Collapse' : 'Expand'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Assignments Table */}
                                    {isExpanded && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Section</th>
                                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {group.assignments.map((assignment) => (
                                                        <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-3">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{assignment.subject.name}</p>
                                                                    <p className="text-sm text-gray-600">Code: {assignment.subject.code}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <Badge variant="info">Class {assignment.schoolClass.name}</Badge>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                {assignment.section ? (
                                                                    <Badge variant="warning">Section {assignment.section.name}</Badge>
                                                                ) : (
                                                                    <Badge variant="default">All Sections</Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(
                                                                        assignment.id,
                                                                        group.teacher.user.name,
                                                                        assignment.subject.name
                                                                    )}
                                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {assignments.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {assignments.current_page} of {assignments.last_page} ({assignments.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => router.get('/teacher-subjects', {
                                        page: assignments.current_page - 1,
                                        teacher_id: teacherFilter,
                                        subject_id: subjectFilter,
                                        class_id: classFilter,
                                    })}
                                    disabled={assignments.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => router.get('/teacher-subjects', {
                                        page: assignments.current_page + 1,
                                        teacher_id: teacherFilter,
                                        subject_id: subjectFilter,
                                        class_id: classFilter,
                                    })}
                                    disabled={assignments.current_page === assignments.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
