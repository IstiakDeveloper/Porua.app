import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { AttendancePageHeader } from '@/Components/TeacherAttendanceNav';
import { Save, Users, Check, X } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    admission_number: string;
    first_name: string;
    last_name: string;
    user?: {
        name: string;
    };
    attendances?: Array<{
        status: string;
    }>;
}

interface CreateProps {
    classes: SchoolClass[];
    sections: Section[];
    date: string;
}

export default function Create({ classes, sections, date }: CreateProps) {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        date: date,
        class_id: '',
        section_id: '',
        attendances: [] as Array<{
            student_id: number;
            status: string;
            remarks: string;
        }>,
    });

    const loadStudents = async () => {
        if (!selectedClass || !selectedSection) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/student-attendance/students?class_id=${selectedClass}&section_id=${selectedSection}&date=${data.date}`,
                {
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const studentsData = await response.json();
            setStudents(studentsData);

            // Initialize attendance data
            const attendances = studentsData.map((student: Student) => ({
                student_id: student.id,
                status: student.attendances && student.attendances.length > 0
                    ? student.attendances[0].status
                    : 'present',
                remarks: '',
            }));
            setData('attendances', attendances);
        } catch (error) {
            console.error('Failed to load students:', error);
            alert('Failed to load students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setData('class_id', classId);
        setStudents([]);
        setSelectedSection('');
        setData('section_id', '');

        // Filter sections based on selected class
        const classSections = sections.filter(s => s.class_id === parseInt(classId));
        setFilteredSections(classSections);
    };

    const handleSectionChange = (sectionId: string) => {
        setSelectedSection(sectionId);
        setData('section_id', sectionId);
    };

    const updateAttendance = (studentId: number, field: 'status' | 'remarks', value: string) => {
        setData(
            'attendances',
            data.attendances.map((att) =>
                att.student_id === studentId ? { ...att, [field]: value } : att
            )
        );
    };

    const markAll = (status: string) => {
        setData(
            'attendances',
            data.attendances.map((att) => ({ ...att, status }))
        );
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/student-attendance');
    };

    const getStatusColor = (status: string) => {
        const colors = {
            present: 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600',
            absent: 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-600',
            late: 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-500',
            half_day: 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600',
            holiday: 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-600',
        };
        return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-600';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mark Student Attendance" />

            <div className="space-y-5">
                <AttendancePageHeader
                    title="Mark Student Attendance"
                    subtitle="Record daily attendance for students"
                    current="create"
                    date={data.date}
                    reportType="student"
                    onTypeChange={(type) => {
                        if (type === 'teacher') {
                            router.get(`/teacher-attendance/create?date=${data.date}`);
                        }
                    }}
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Date and Class Selection */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-950/[0.02]">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4">Select Target Class & Date</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                                    Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    required
                                />
                                {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                                    Class <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && <p className="mt-1 text-xs text-rose-600">{errors.class_id}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                                    Section <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => handleSectionChange(e.target.value)}
                                    className="h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50"
                                    required
                                    disabled={!selectedClass}
                                >
                                    <option value="">Select Section</option>
                                    {filteredSections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.section_id && <p className="mt-1 text-xs text-rose-600">{errors.section_id}</p>}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-start">
                            <Button
                                type="button"
                                size="sm"
                                onClick={loadStudents}
                                disabled={!selectedClass || !selectedSection || loading}
                                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                                icon={<Users className="w-4 h-4" />}
                            >
                                {loading ? 'Loading Students...' : 'Load Students'}
                            </Button>
                        </div>
                    </div>

                    {/* Students List */}
                    {students.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/[0.02]">
                            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Students
                                    </h2>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                        {students.length} students
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => markAll('present')}
                                        className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs font-semibold justify-center"
                                    >
                                        All Present
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => markAll('absent')}
                                        className="h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm text-xs font-semibold justify-center"
                                    >
                                        All Absent
                                    </Button>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {students.map((student, index) => {
                                    const initial = (student.first_name?.charAt(0) || '?').toUpperCase();
                                    const currentStatus = data.attendances[index]?.status;

                                    return (
                                        <div
                                            key={student.id}
                                            className="flex flex-col gap-3 px-3.5 sm:px-5 py-3 sm:py-3.5 lg:flex-row lg:items-center hover:bg-slate-50/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-[200px] flex-1">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-700 ring-1 ring-slate-900/10">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-mono">
                                                        Adm: {student.admission_number}
                                                        {student.roll_number ? ` · Roll ${student.roll_number}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Large Thumb-Friendly Status Toggle Buttons */}
                                            <div className="grid grid-cols-4 sm:flex gap-1.5">
                                                {['present', 'absent', 'late', 'half_day'].map((status) => {
                                                    const isActive = currentStatus === status;
                                                    const labelMap: Record<string, string> = {
                                                        present: 'Present',
                                                        absent: 'Absent',
                                                        late: 'Late',
                                                        half_day: 'Half Day',
                                                    };
                                                    return (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            onClick={() => updateAttendance(student.id, 'status', status)}
                                                            className={`rounded-xl py-2 sm:py-1 px-2.5 sm:px-3 text-xs font-semibold transition-all active:scale-95 text-center ${
                                                                isActive
                                                                    ? getStatusColor(status)
                                                                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            {labelMap[status] || status}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Remarks (optional)"
                                                value={data.attendances[index]?.remarks || ''}
                                                onChange={(e) =>
                                                    updateAttendance(student.id, 'remarks', e.target.value)
                                                }
                                                className="h-9 w-full lg:w-44 rounded-xl border border-slate-200/80 bg-white px-3 text-xs text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sticky Bottom Submit Bar on Mobile */}
                    {students.length > 0 && (
                        <div className="sticky bottom-16 md:static z-20 bg-white/95 backdrop-blur-md p-3 sm:p-0 border border-slate-200/80 sm:border-0 shadow-lg sm:shadow-none flex items-center justify-between sm:justify-end gap-3 rounded-2xl">
                            <Link href="/teacher-attendance?report_type=student">
                                <Button variant="ghost" size="sm" className="rounded-xl">Cancel</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800 shadow-sm font-semibold text-xs sm:text-sm"
                                icon={<Save className="w-4 h-4" />}
                            >
                                {processing ? 'Saving...' : `Save Attendance (${students.length})`}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
