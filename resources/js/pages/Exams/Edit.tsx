import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import PresetPills from '@/Components/PresetPills';
import {
    Save,
    FileText,
    Calendar,
    Sparkles,
    CheckSquare,
    Square,
    Check,
    Layers,
} from 'lucide-react';
import { Exam, AcademicYear, SchoolClass } from '@/types/exam';

interface EditProps {
    exam: Exam;
    academicYears: AcademicYear[];
    classes: SchoolClass[];
}

const EXAM_TYPE_PRESETS = [
    { label: 'Semester 1', type: 'first_term', kind: 'semester', term: 1, nameSuffix: 'Semester 1 Examination' },
    { label: 'Semester 2', type: 'mid_term', kind: 'semester', term: 2, nameSuffix: 'Semester 2 Examination' },
    { label: 'Annual', type: 'final', kind: 'annual', term: null, nameSuffix: 'Annual Examination' },
    { label: 'Class Test', type: 'test', kind: 'class_test', term: null, nameSuffix: 'Class Test' },
    { label: 'Practical', type: 'practical', kind: 'semester', term: null, nameSuffix: 'Practical Examination' },
];

export default function Edit({ exam, academicYears, classes }: EditProps) {
    const [formData, setFormData] = useState({
        academic_year_id: exam.academic_year_id.toString(),
        name: exam.name,
        exam_type: exam.exam_type,
        exam_kind: exam.exam_kind || 'semester',
        term_number: exam.term_number ?? null,
        min_attendance_percent: exam.min_attendance_percent ? String(exam.min_attendance_percent) : '',
        start_date: exam.start_date || '',
        end_date: exam.end_date || '',
        result_publish_date: exam.result_publish_date || '',
        status: exam.status,
        description: exam.description || '',
        classes: (exam.classes || []).map((c) => c.id),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const getYearName = (yearId: string) => {
        const found = academicYears.find((y) => y.id.toString() === yearId);
        return found?.name || '';
    };

    const generateExamName = (type: string, yearId: string) => {
        const yearStr = getYearName(yearId);
        const preset = EXAM_TYPE_PRESETS.find((p) => p.type === type);
        const title = preset?.nameSuffix || 'Terminal Examination';
        return yearStr ? `${title} ${yearStr}` : title;
    };

    const handleStartDateChange = (startDateStr: string) => {
        if (!startDateStr) {
            setFormData((prev) => ({ ...prev, start_date: startDateStr }));
            return;
        }

        const start = new Date(startDateStr);
        const end = new Date(start);
        end.setDate(end.getDate() + 10);

        const result = new Date(start);
        result.setDate(result.getDate() + 18);

        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        setFormData((prev) => ({
            ...prev,
            start_date: startDateStr,
            end_date: prev.end_date || formatDate(end),
            result_publish_date: prev.result_publish_date || formatDate(result),
        }));
    };

    const toggleClass = (classId: number) => {
        setFormData((prev) => ({
            ...prev,
            classes: prev.classes.includes(classId)
                ? prev.classes.filter((id) => id !== classId)
                : [...prev.classes, classId],
        }));
    };

    const selectAllClasses = () => {
        setFormData((prev) => ({
            ...prev,
            classes: classes.map((c) => c.id),
        }));
    };

    const clearAllClasses = () => {
        setFormData((prev) => ({
            ...prev,
            classes: [],
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/exams/${exam.id}`, formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${exam.name}`} />

            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                <FormPageHeader
                    title={`Edit ${exam.name}`}
                    subtitle="Modify examination parameters, scheduled dates, and enrolled classes"
                    backUrl="/exams"
                    badgeText="Exam Setup"
                    badgeIcon={<FileText className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormCard
                        title="Examination Details"
                        description="Exam name, type, academic year, and status"
                        icon={<FileText className="w-5 h-5" />}
                    >
                        <div className="space-y-4">
                            <PresetPills
                                title="1-Click Exam Type Presets"
                                options={EXAM_TYPE_PRESETS.map((p) => ({
                                    label: p.label,
                                    active: formData.exam_type === p.type,
                                    onClick: () =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            exam_type: p.type,
                                            exam_kind: p.kind,
                                            term_number: p.term,
                                            min_attendance_percent: p.kind === 'annual' ? (prev.min_attendance_percent || '75') : '',
                                        })),
                                }))}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Academic Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.academic_year_id}
                                        onChange={(e) =>
                                            setFormData({ ...formData, academic_year_id: e.target.value })
                                        }
                                        required
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="">Select Academic Year</option>
                                        {academicYears.map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.academic_year_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.academic_year_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Exam Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.exam_type}
                                        onChange={(e) => {
                                            const preset = EXAM_TYPE_PRESETS.find((item) => item.type === e.target.value);
                                            setFormData({
                                                ...formData,
                                                exam_type: e.target.value,
                                                exam_kind: preset?.kind || 'semester',
                                                term_number: preset?.term ?? null,
                                                min_attendance_percent: preset?.kind === 'annual' ? (formData.min_attendance_percent || '75') : '',
                                            });
                                        }}
                                        required
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="first_term">Semester 1</option>
                                        <option value="mid_term">Semester 2</option>
                                        <option value="final">Annual</option>
                                        <option value="test">Class Test</option>
                                        <option value="practical">Practical</option>
                                    </select>
                                </div>
                            </div>

                            {formData.exam_kind === 'annual' && (
                                <div className="max-w-xs">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Minimum attendance %
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={formData.min_attendance_percent}
                                        onChange={(e) => setFormData({ ...formData, min_attendance_percent: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
                                    />
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Exam Title <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                name: generateExamName(prev.exam_type, prev.academic_year_id),
                                            }))
                                        }
                                        className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                                    >
                                        <Sparkles className="w-3 h-3" /> Auto Generate
                                    </button>
                                </div>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    error={errors.name}
                                    required
                                    placeholder="e.g. First Term Examination 2026"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                                <div>
                                    <Input
                                        label="Start Date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        error={errors.start_date}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="End Date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        error={errors.end_date}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Result Publish Date"
                                        type="date"
                                        value={formData.result_publish_date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, result_publish_date: e.target.value })
                                        }
                                        error={errors.result_publish_date}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <Input
                                        label="Instructions / Guidelines (Optional)"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Special student instructions or notice..."
                                    />
                                </div>
                            </div>
                        </div>
                    </FormCard>

                    {/* Classes */}
                    <FormCard
                        title="Participating Classes"
                        description="Select which classes will participate in this examination"
                        icon={<Layers className="w-5 h-5" />}
                        action={
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllClasses}
                                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    Select All ({classes.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllClasses}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    <Square className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            </div>
                        }
                    >
                        {classes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {classes.map((cls) => {
                                    const isSelected = formData.classes.includes(cls.id);
                                    return (
                                        <button
                                            key={cls.id}
                                            type="button"
                                            onClick={() => toggleClass(cls.id)}
                                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/20'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="truncate">
                                                <p className="text-xs font-semibold truncate">
                                                    {cls.name}
                                                </p>
                                                {cls.name_bengali && (
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {cls.name_bengali}
                                                    </p>
                                                )}
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                                                    isSelected
                                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-6">
                                No classes available.
                            </p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                            <span>Selected: {formData.classes.length} of {classes.length} classes</span>
                        </div>
                    </FormCard>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.visit('/exams')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Update Exam
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
