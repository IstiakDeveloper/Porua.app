import React, { FormEvent, useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import {
    Save,
    PenLine,
    Users,
    Sparkles,
    BookOpen,
    Calculator,
    CheckCircle2,
    RotateCcw,
} from 'lucide-react';
import { Exam, SchoolClass, Subject, Student } from '@/types/exam';

interface CreateProps {
    exams: Exam[];
    classes: SchoolClass[];
    subjects: Subject[];
}

interface StudentMark {
    student_id: number;
    theory_marks: string;
    practical_marks: string;
    total_marks: string;
    grade: string;
    remarks: string;
}

const calculateGrade = (total: number) => {
    if (total >= 80) return 'A+';
    if (total >= 70) return 'A';
    if (total >= 60) return 'A-';
    if (total >= 50) return 'B';
    if (total >= 40) return 'C';
    if (total >= 33) return 'D';
    return 'F';
};

const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'A+':
            return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
        case 'A':
            return 'bg-teal-100 text-teal-800 border-teal-300 font-semibold';
        case 'A-':
            return 'bg-cyan-100 text-cyan-800 border-cyan-300';
        case 'B':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'C':
            return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'D':
            return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'F':
            return 'bg-red-100 text-red-800 border-red-300 font-bold';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

export default function Create({ exams, classes, subjects }: CreateProps) {
    const defaultExam = exams[0];
    const defaultClass = classes[0];
    const defaultSubject = subjects[0];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [students, setStudents] = useState<Student[]>([]);
    const [formData, setFormData] = useState({
        exam_id: defaultExam?.id ? defaultExam.id.toString() : '',
        class_id: defaultClass?.id ? defaultClass.id.toString() : '',
        subject_id: defaultSubject?.id ? defaultSubject.id.toString() : '',
        marks: [] as StudentMark[],
    });

    const fetchStudents = async () => {
        if (!formData.exam_id || !formData.class_id || !formData.subject_id) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/marks/students?exam_id=${formData.exam_id}&class_id=${formData.class_id}&subject_id=${formData.subject_id}`
            );
            const studentData = await response.json();
            setStudents(studentData);

            setFormData((prev) => ({
                ...prev,
                marks: studentData.map((student: Student) => {
                    const existingMark = student.marks && student.marks[0];
                    const theory = existingMark?.theory_marks?.toString() || '';
                    const practical = existingMark?.practical_marks?.toString() || '';
                    const total = existingMark?.total_marks?.toString() || '';
                    const totalNum = parseFloat(total) || 0;
                    const grade = existingMark?.grade || (total ? calculateGrade(totalNum) : '');

                    return {
                        student_id: student.id,
                        theory_marks: theory,
                        practical_marks: practical,
                        total_marks: total,
                        grade: grade,
                        remarks: existingMark?.remarks || '',
                    };
                }),
            }));
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [formData.exam_id, formData.class_id, formData.subject_id]);

    const handleMarkChange = (index: number, field: keyof StudentMark, value: string) => {
        const newMarks = [...formData.marks];
        newMarks[index] = { ...newMarks[index], [field]: value };

        if (field === 'theory_marks' || field === 'practical_marks') {
            const theory = parseFloat(newMarks[index].theory_marks) || 0;
            const practical = parseFloat(newMarks[index].practical_marks) || 0;
            const sum = theory + practical;
            newMarks[index].total_marks = sum > 0 || value !== '' ? sum.toString() : '';
            newMarks[index].grade = newMarks[index].total_marks ? calculateGrade(sum) : '';
        } else if (field === 'total_marks') {
            const totalNum = parseFloat(value) || 0;
            newMarks[index].grade = value ? calculateGrade(totalNum) : '';
        }

        setFormData({ ...formData, marks: newMarks });
    };

    // Bulk action: fill all with pass marks
    const fillPassMarks = () => {
        setFormData((prev) => ({
            ...prev,
            marks: prev.marks.map((m) => ({
                ...m,
                theory_marks: m.theory_marks || '33',
                total_marks: m.total_marks || '33',
                grade: m.grade || 'D',
            })),
        }));
    };

    const clearAll = () => {
        setFormData((prev) => ({
            ...prev,
            marks: prev.marks.map((m) => ({
                ...m,
                theory_marks: '',
                practical_marks: '',
                total_marks: '',
                grade: '',
                remarks: '',
            })),
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const filledMarks = formData.marks.filter(
            (mark) => mark.total_marks && parseFloat(mark.total_marks) >= 0
        );

        if (filledMarks.length === 0) {
            setErrors({ marks: 'Please enter marks for at least one student' });
            setIsSubmitting(false);
            return;
        }

        router.post(
            '/marks',
            { ...formData, marks: filledMarks },
            {
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setIsSubmitting(false);
                },
                onSuccess: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const completedCount = formData.marks.filter(
        (m) => m.total_marks && parseFloat(m.total_marks) >= 0
    ).length;

    return (
        <AuthenticatedLayout>
            <Head title="Enter Student Marks" />

            <div className="space-y-6 max-w-6xl mx-auto pb-12">
                <FormPageHeader
                    title="Student Marks Entry"
                    subtitle="Select cohort, enter theory/practical scores with automatic grade assignment"
                    backUrl="/marks"
                    badgeText="Mark Entry"
                    badgeIcon={<PenLine className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Filter Selection Card */}
                    <FormCard
                        title="Cohort & Subject Selection"
                        description="Choose the exam session, class grade, and subject to evaluate"
                        icon={<BookOpen className="w-5 h-5" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Examination <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.exam_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, exam_id: e.target.value })
                                    }
                                    required
                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                >
                                    <option value="">Select Exam</option>
                                    {exams.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Class / Grade <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.class_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, class_id: e.target.value })
                                    }
                                    required
                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, subject_id: e.target.value })
                                    }
                                    required
                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name} {sub.code ? `(${sub.code})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </FormCard>

                    {/* Student Mark Entry Matrix Card */}
                    <FormCard
                        title="Student Marks Matrix"
                        description={`Active class list (${students.length} students enrolled)`}
                        icon={<Users className="w-5 h-5" />}
                        action={
                            students.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={fillPassMarks}
                                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Fill Pass (33)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Clear
                                    </button>
                                </div>
                            ) : null
                        }
                    >
                        {errors.marks && (
                            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                                {errors.marks}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="py-12 text-center text-slate-400">
                                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs">Loading student roster...</p>
                            </div>
                        ) : students.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                                    <span>
                                        Progress:{' '}
                                        <strong className="text-slate-900 font-semibold">
                                            {completedCount}
                                        </strong>{' '}
                                        of {students.length} completed
                                    </span>
                                    <span className="text-emerald-700 font-medium">
                                        ⚡ Total & Letter Grade are calculated automatically
                                    </span>
                                </div>

                                {/* Mobile Student Grading Cards Feed (< 768px) */}
                                <div className="block md:hidden space-y-3">
                                    {students.map((student, index) => {
                                        const studentMark = formData.marks[index] || {
                                            theory_marks: '',
                                            practical_marks: '',
                                            total_marks: '',
                                            grade: '',
                                            remarks: '',
                                        };

                                        return (
                                            <div
                                                key={student.id}
                                                className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-emerald-100">
                                                            {student.roll_number || index + 1}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-sm text-slate-900 truncate">
                                                                {student.user?.name || 'Student'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 font-mono">
                                                                ID: {student.student_id || student.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-1 text-xs rounded-lg border font-bold shrink-0 ${getGradeColor(
                                                            studentMark.grade
                                                        )}`}
                                                    >
                                                        {studentMark.grade || '—'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                            Theory
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            placeholder="0"
                                                            value={studentMark.theory_marks}
                                                            onChange={(e) =>
                                                                handleMarkChange(
                                                                    index,
                                                                    'theory_marks',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-2 py-1.5 text-center text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                            Practical
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            placeholder="0"
                                                            value={studentMark.practical_marks}
                                                            onChange={(e) =>
                                                                handleMarkChange(
                                                                    index,
                                                                    'practical_marks',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-2 py-1.5 text-center text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-slate-500 mb-1 text-center">
                                                            Total
                                                        </label>
                                                        <div className="w-full py-1.5 text-center text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-lg text-slate-800">
                                                            {studentMark.total_marks || '0'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Teacher remarks (optional)..."
                                                        value={studentMark.remarks}
                                                        onChange={(e) =>
                                                            handleMarkChange(
                                                                index,
                                                                'remarks',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop Table (>= 768px) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                            <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                                <th className="px-4 py-3.5 text-white font-bold">Roll</th>
                                                <th className="px-4 py-3.5 text-white font-bold">Student Name</th>
                                                <th className="px-4 py-3.5 text-center text-white font-bold">Theory Marks</th>
                                                <th className="px-4 py-3.5 text-center text-white font-bold">Practical Marks</th>
                                                <th className="px-4 py-3.5 text-center text-white font-bold">Total (Auto)</th>
                                                <th className="px-4 py-3.5 text-center text-white font-bold">Grade (Auto)</th>
                                                <th className="px-4 py-3.5 text-white font-bold">Teacher Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {students.map((student, index) => {
                                                const studentMark = formData.marks[index] || {
                                                    theory_marks: '',
                                                    practical_marks: '',
                                                    total_marks: '',
                                                    grade: '',
                                                    remarks: '',
                                                };

                                                return (
                                                    <tr
                                                        key={student.id}
                                                        className="hover:bg-emerald-50/20 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                                                            {student.roll_number || index + 1}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {student.user?.name || 'Student'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">
                                                                ID: {student.student_id || student.id}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.5"
                                                                placeholder="0"
                                                                value={studentMark.theory_marks}
                                                                onChange={(e) =>
                                                                    handleMarkChange(
                                                                        index,
                                                                        'theory_marks',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-20 px-2 py-1.5 text-center text-xs font-mono font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.5"
                                                                placeholder="0"
                                                                value={studentMark.practical_marks}
                                                                onChange={(e) =>
                                                                    handleMarkChange(
                                                                        index,
                                                                        'practical_marks',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-20 px-2 py-1.5 text-center text-xs font-mono font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-block w-16 py-1.5 text-xs font-mono font-bold bg-slate-100 text-slate-800 rounded-lg">
                                                                {studentMark.total_marks || '0'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`inline-block w-12 py-1 text-xs rounded border transition-all ${getGradeColor(
                                                                    studentMark.grade
                                                                )}`}
                                                            >
                                                                {studentMark.grade || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Optional remarks..."
                                                                value={studentMark.remarks}
                                                                onChange={(e) =>
                                                                    handleMarkChange(
                                                                        index,
                                                                        'remarks',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-500">
                                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-medium">No active students in this class</p>
                                <p className="text-xs text-slate-400">
                                    Select another class or ensure students are enrolled
                                </p>
                            </div>
                        )}
                    </FormCard>

                    {/* Submit Bar (Sticky on Mobile) */}
                    <div className="sticky bottom-16 md:static z-20 bg-white/95 backdrop-blur-md p-3 sm:p-0 border border-slate-200/80 sm:border-0 shadow-lg sm:shadow-none flex items-center justify-between sm:justify-end gap-3 rounded-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/marks')}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={students.length === 0}
                            icon={<Save className="w-4 h-4" />}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 text-xs sm:text-sm font-semibold"
                        >
                            Save All Marks ({completedCount})
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
