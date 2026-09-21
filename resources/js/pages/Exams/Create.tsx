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
    Clock,
    Trophy,
} from 'lucide-react';
import { AcademicYear, SchoolClass } from '@/types/exam';

interface CreateProps {
    academicYears: AcademicYear[];
    classes: SchoolClass[];
}

const EXAM_TYPE_PRESETS = [
    { label: 'First Term', type: 'first_term', nameSuffix: 'First Term Examination' },
    { label: 'Mid Term / Half Yearly', type: 'mid_term', nameSuffix: 'Half Yearly Examination' },
    { label: 'Annual / Final', type: 'final', nameSuffix: 'Annual Examination' },
    { label: 'Model Test', type: 'test', nameSuffix: 'Pre-Test / Model Test' },
    { label: 'Class Test 1', type: 'test', nameSuffix: 'Class Assessment Test 1' },
    { label: 'Practical Lab Exam', type: 'practical', nameSuffix: 'Practical Laboratory Examination' },
];

export default function Create({ academicYears, classes }: CreateProps) {
    const defaultYear = academicYears[0];
    const [formData, setFormData] = useState({
        academic_year_id: defaultYear?.id ? defaultYear.id.toString() : '',
        name: '',
        exam_type: 'first_term',
        start_date: '',
        end_date: '',
        result_publish_date: '',
        status: 'upcoming',
        description: '',
        classes: classes.map((c) => c.id), // Default to all classes selected
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const getYearName = (yearId: string) => {
        const found = academicYears.find((y) => y.id.toString() === yearId);
        return found?.name || '';
    };

    // Auto-generate name based on Type and Academic Year
    const generateExamName = (type: string, yearId: string) => {
        const yearStr = getYearName(yearId);
        const preset = EXAM_TYPE_PRESETS.find((p) => p.type === type);
        const title = preset?.nameSuffix || 'Terminal Examination';
        return yearStr ? `${title} ${yearStr}` : title;
    };

    const handleTypeSelect = (preset: (typeof EXAM_TYPE_PRESETS)[0]) => {
        const autoName = generateExamName(preset.type, formData.academic_year_id);
        setFormData((prev) => ({
            ...prev,
            exam_type: preset.type,
            name: autoName,
        }));
    };

    const handleYearChange = (yearId: string) => {
        const autoName = generateExamName(formData.exam_type, yearId);
        setFormData((prev) => ({
            ...prev,
            academic_year_id: yearId,
            name: !prev.name || prev.name === generateExamName(prev.exam_type, prev.academic_year_id) ? autoName : prev.name,
        }));
    };

    // Auto Date calculations (+10 days for end date, +18 days for result)
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

        router.post('/exams', formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Exam" />

            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                <FormPageHeader
                    title="Create Examination"
                    subtitle="Setup exam session, auto-calculate routine span, and assign participating classes"
                    backUrl="/exams"
                    badgeText="Exam Setup"
                    badgeIcon={<FileText className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <FormCard
                        title="Examination Details"
                        description="Exam name, type, academic year, and status"
                        icon={<FileText className="w-5 h-5" />}
                    >
                        <div className="space-y-4">
                            {/* Exam Type Presets */}
                            <PresetPills
                                title="1-Click Exam Type Presets (Auto-Names Exam)"
                                options={EXAM_TYPE_PRESETS.map((p) => ({
                                    label: p.label,
                                    active: formData.exam_type === p.type,
                                    onClick: () => handleTypeSelect(p),
                                }))}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Academic Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.academic_year_id}
                                        onChange={(e) => handleYearChange(e.target.value)}
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
                                            const autoName = generateExamName(e.target.value, formData.academic_year_id);
                                            setFormData({
                                                ...formData,
                                                exam_type: e.target.value,
                                                name: autoName,
                                            });
                                        }}
                                        required
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="first_term">First Term Examination</option>
                                        <option value="mid_term">Mid Term / Half Yearly Examination</option>
                                        <option value="final">Annual / Final Examination</option>
                                        <option value="test">Class Test / Quiz</option>
                                        <option value="practical">Practical Laboratory Exam</option>
                                    </select>
                                </div>
                            </div>

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
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Printed on admit cards, seat slips, marksheets, and report cards
                                </p>
                            </div>

                            {/* Dates with Smart Calculation */}
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
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Auto-suggests end & result dates
                                    </p>
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
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Final day of routines
                                    </p>
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
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        When report cards are released
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Initial Status <span className="text-red-500">*</span>
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

                    {/* Participating Classes Card */}
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
                                No classes created yet.
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
                            Save Exam
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
