import React, { useMemo } from 'react';
import { router, Head, useForm } from '@inertiajs/react';
import {
    Save,
    ArrowLeft,
    BookOpen,
    GraduationCap,
    Users,
    Layers,
    Check,
    CheckSquare,
    Square,
    AlertCircle,
    Calendar,
    Sparkles
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';

interface Props {
    teachers: Array<{ id: number; user: { name: string }; employee_id: string }>;
    classes: Array<{ id: number; name: string }>;
    subjects: Array<{ id: number; name: string; code: string }>;
    sections: Array<{ id: number; name: string; class_id: number }>;
    currentAcademicYear: { id: number; year: string; name: string } | null;
}

export default function Create({ teachers, classes, subjects, sections, currentAcademicYear }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        teacher_id: '',
        subject_ids: [] as number[],
        class_ids: [] as number[],
        section_ids: [] as number[],
    });

    // Filter sections based on selected classes
    const availableSections = useMemo(() => {
        return data.class_ids.length > 0
            ? sections.filter(s => data.class_ids.includes(s.class_id))
            : [];
    }, [data.class_ids, sections]);

    const handleClassToggle = (classId: number) => {
        const currentClasses = [...data.class_ids];
        const index = currentClasses.indexOf(classId);

        if (index > -1) {
            currentClasses.splice(index, 1);
            // Remove sections belonging to this class
            const sectionsToRemove = sections
                .filter(s => s.class_id === classId)
                .map(s => s.id);
            const newSections = data.section_ids.filter(id => !sectionsToRemove.includes(id));
            setData({ ...data, class_ids: currentClasses, section_ids: newSections });
        } else {
            currentClasses.push(classId);
            setData('class_ids', currentClasses);
        }
    };

    const handleSectionToggle = (sectionId: number) => {
        const currentSections = [...data.section_ids];
        const index = currentSections.indexOf(sectionId);

        if (index > -1) {
            currentSections.splice(index, 1);
        } else {
            currentSections.push(sectionId);
        }

        setData('section_ids', currentSections);
    };

    const handleSubjectToggle = (subjectId: number) => {
        const currentSubjects = [...data.subject_ids];
        const index = currentSubjects.indexOf(subjectId);

        if (index > -1) {
            currentSubjects.splice(index, 1);
        } else {
            currentSubjects.push(subjectId);
        }

        setData('subject_ids', currentSubjects);
    };

    const handleSelectAllSubjects = () => {
        if (data.subject_ids.length === subjects.length) {
            setData('subject_ids', []);
        } else {
            setData('subject_ids', subjects.map(s => s.id));
        }
    };

    const handleSelectAllClasses = () => {
        if (data.class_ids.length === classes.length) {
            setData({ ...data, class_ids: [], section_ids: [] });
        } else {
            setData('class_ids', classes.map(c => c.id));
        }
    };

    const handleSelectAllSections = () => {
        if (data.section_ids.length === availableSections.length) {
            setData('section_ids', []);
        } else {
            setData('section_ids', availableSections.map(s => s.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher-subjects');
    };

    const selectedTeacher = teachers.find(t => t.id.toString() === data.teacher_id);

    return (
        <AuthenticatedLayout>
            <Head title="Assign Subject to Faculty" />

            <div className="space-y-4 pb-8 max-w-5xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Assign Subject to Faculty"
                    subtitle="Link curriculum subjects and class sections to teacher"
                    backUrl="/teacher-subjects"
                    badges={[
                        ...(currentAcademicYear ? [{ label: `Academic Year: ${currentAcademicYear.year}`, variant: 'indigo' as const }] : []),
                        { label: `${data.subject_ids.length} Subjects`, variant: data.subject_ids.length > 0 ? 'success' as const : 'neutral' as const },
                        { label: `${data.class_ids.length} Classes`, variant: data.class_ids.length > 0 ? 'success' as const : 'neutral' as const }
                    ]}
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 2. FACULTY SELECTION CARD */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                        <div className="border-b border-slate-100 pb-2.5">
                            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Select Faculty Member <span className="text-rose-500">*</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Choose the teacher who will be designated for these curriculum courses</p>
                        </div>

                        <div className="max-w-md">
                            <select
                                required
                                value={data.teacher_id}
                                onChange={(e) => setData('teacher_id', e.target.value)}
                                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            >
                                <option value="">Select Teacher...</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id.toString()}>
                                        {t.user.name} ({t.employee_id})
                                    </option>
                                ))}
                            </select>
                            {errors.teacher_id && <p className="text-[11px] text-rose-500 mt-1">{errors.teacher_id}</p>}
                        </div>

                        {selectedTeacher && (
                            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {selectedTeacher.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-indigo-900">{selectedTeacher.user.name}</div>
                                    <div className="text-indigo-700 font-mono text-[10px]">Employee ID: {selectedTeacher.employee_id}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. SUBJECT SELECTION SECTION */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Curriculum Subjects <span className="text-rose-500">*</span>
                                    <span className="text-[11px] font-normal text-slate-500">
                                        ({data.subject_ids.length} of {subjects.length} selected)
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">Select one or more subjects taught by this teacher</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleSelectAllSubjects}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                {data.subject_ids.length === subjects.length ? 'Deselect All' : 'Select All Subjects'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                            {subjects.map((subject) => {
                                const isChecked = data.subject_ids.includes(subject.id);
                                return (
                                    <button
                                        type="button"
                                        key={subject.id}
                                        onClick={() => handleSubjectToggle(subject.id)}
                                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                                            isChecked
                                                ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-200'
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="min-w-0 pr-2">
                                            <span className="text-xs font-bold text-slate-800 block truncate">
                                                {subject.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {subject.code}
                                            </span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                            isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                                        }`}>
                                            {isChecked && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.subject_ids && <p className="text-[11px] text-rose-500 mt-1">{errors.subject_ids}</p>}
                    </div>

                    {/* 4. CLASS & SECTION ALLOCATIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Classes Box */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                                        Target Classes <span className="text-rose-500">*</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500">
                                        {data.class_ids.length} of {classes.length} selected
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSelectAllClasses}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                                >
                                    {data.class_ids.length === classes.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                                {classes.map((cls) => {
                                    const isChecked = data.class_ids.includes(cls.id);
                                    return (
                                        <button
                                            type="button"
                                            key={cls.id}
                                            onClick={() => handleClassToggle(cls.id)}
                                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                                                isChecked
                                                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-slate-800">
                                                Class {cls.name}
                                            </span>
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                                isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                                            }`}>
                                                {isChecked && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.class_ids && <p className="text-[11px] text-rose-500 mt-1">{errors.class_ids}</p>}
                        </div>

                        {/* Sections Box */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-violet-600" />
                                        Sections <span className="text-slate-400 font-normal">(Optional)</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500">
                                        {data.section_ids.length} selected
                                    </span>
                                </div>
                                {availableSections.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleSelectAllSections}
                                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                                    >
                                        {data.section_ids.length === availableSections.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                                {availableSections.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        {data.class_ids.length === 0
                                            ? 'Select classes first to view available sections'
                                            : 'No sections configured for the selected classes (will apply to all sections)'}
                                    </div>
                                ) : (
                                    availableSections.map((sec) => {
                                        const isChecked = data.section_ids.includes(sec.id);
                                        const parentClass = classes.find(c => c.id === sec.class_id);
                                        return (
                                            <button
                                                type="button"
                                                key={sec.id}
                                                onClick={() => handleSectionToggle(sec.id)}
                                                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                                                    isChecked
                                                        ? 'bg-violet-50/80 border-violet-300 ring-1 ring-violet-200'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div>
                                                    <span className="text-xs font-bold text-slate-800 block">
                                                        Section {sec.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        Class {parentClass?.name}
                                                    </span>
                                                </div>
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                                    isChecked ? 'bg-violet-600 text-white' : 'border border-slate-300'
                                                }`}>
                                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            {errors.section_ids && <p className="text-[11px] text-rose-500 mt-1">{errors.section_ids}</p>}
                        </div>
                    </div>

                    {/* 5. SUMMARY SNAPSHOT CARD */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>
                                <strong>Assignment Plan:</strong>{' '}
                                {selectedTeacher ? selectedTeacher.user.name : 'No teacher selected'} •{' '}
                                {data.subject_ids.length} subject(s) across {data.class_ids.length} class(es).
                            </span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => router.get('/teacher-subjects')}
                                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.teacher_id || data.subject_ids.length === 0 || data.class_ids.length === 0}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {processing ? 'Assigning...' : 'Confirm Assignments'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
