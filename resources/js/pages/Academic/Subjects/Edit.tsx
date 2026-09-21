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
    BookMarked,
    Sparkles,
    CheckSquare,
    Square,
    Check,
    Layers,
} from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali?: string;
}

interface Subject {
    id: number;
    name: string;
    name_bengali: string;
    code: string;
    type: string;
    total_marks: number;
    pass_marks: number;
    description: string;
    status: string;
    classes?: SchoolClass[];
}

interface EditProps {
    subject: Subject;
    classes?: SchoolClass[];
}

const SUBJECT_PRESETS = [
    {
        name: 'Bangla 1st Paper',
        name_bengali: 'বাংলা ১ম পত্র',
        code: 'BAN-101',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Bangla 2nd Paper',
        name_bengali: 'বাংলা ২য় পত্র',
        code: 'BAN-102',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'English 1st Paper',
        name_bengali: 'ইংরেজি ১ম পত্র',
        code: 'ENG-101',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'English 2nd Paper',
        name_bengali: 'ইংরেজি ২য় পত্র',
        code: 'ENG-102',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Mathematics',
        name_bengali: 'সাধারণ গণিত',
        code: 'MATH-101',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'General Science',
        name_bengali: 'সাধারণ বিজ্ঞান',
        code: 'SCI-101',
        type: 'both',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Bangladesh & Global Studies',
        name_bengali: 'বাংলাদেশ ও বিশ্বপরিচয়',
        code: 'BGS-101',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Islam & Moral Education',
        name_bengali: 'ইসলাম ও নৈতিক শিক্ষা',
        code: 'ISL-101',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'ICT',
        name_bengali: 'তথ্য ও যোগাযোগ প্রযুক্তি',
        code: 'ICT-101',
        type: 'both',
        total_marks: '50',
        pass_marks: '17',
    },
    {
        name: 'Physics',
        name_bengali: 'পদার্থবিজ্ঞান',
        code: 'PHY-101',
        type: 'both',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Chemistry',
        name_bengali: 'রসায়ন',
        code: 'CHEM-101',
        type: 'both',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Biology',
        name_bengali: 'জীববিজ্ঞান',
        code: 'BIO-101',
        type: 'both',
        total_marks: '100',
        pass_marks: '33',
    },
    {
        name: 'Accounting',
        name_bengali: 'হিসাববিজ্ঞান',
        code: 'ACC-101',
        type: 'theory',
        total_marks: '100',
        pass_marks: '33',
    },
];

export default function Edit({ subject, classes = [] }: EditProps) {
    const [formData, setFormData] = useState({
        name: subject.name,
        name_bengali: subject.name_bengali,
        code: subject.code,
        type: subject.type,
        total_marks: subject.total_marks.toString(),
        pass_marks: subject.pass_marks.toString(),
        description: subject.description || '',
        status: subject.status,
        classes: (subject.classes || []).map((c) => c.id),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const generateCode = (name: string) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 4).toUpperCase() + '-101';
        }
        const initials = words.map((w) => w[0]).join('').substring(0, 4).toUpperCase();
        return `${initials}-101`;
    };

    const handleNameChange = (val: string) => {
        setFormData((prev) => {
            const shouldGenCode = !prev.code || prev.code === generateCode(prev.name);
            return {
                ...prev,
                name: val,
                code: shouldGenCode ? generateCode(val) : prev.code,
            };
        });
    };

    const handleTotalMarksChange = (total: string) => {
        const num = parseFloat(total) || 0;
        const autoPass = Math.ceil(num * 0.33).toString();
        setFormData((prev) => ({
            ...prev,
            total_marks: total,
            pass_marks: autoPass,
        }));
    };

    const applyPreset = (preset: (typeof SUBJECT_PRESETS)[0]) => {
        setFormData((prev) => ({
            ...prev,
            name: preset.name,
            name_bengali: preset.name_bengali,
            code: preset.code,
            type: preset.type,
            total_marks: preset.total_marks,
            pass_marks: preset.pass_marks,
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

        router.put(`/subjects/${subject.id}`, formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Subject - ${subject.name}`} />

            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                <FormPageHeader
                    title={`Edit ${subject.name}`}
                    subtitle="Update curriculum course details, pass mark threshold, and assigned classes"
                    backUrl="/subjects"
                    badgeText="Curriculum Setup"
                    badgeIcon={<BookMarked className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormCard
                        title="Subject Information"
                        description="Course name, code identifier, and marks grading standard"
                        icon={<BookMarked className="w-5 h-5" />}
                    >
                        <div className="space-y-4">
                            <PresetPills
                                title="1-Click National Curriculum Subject Presets"
                                options={SUBJECT_PRESETS.map((p) => ({
                                    label: p.name,
                                    sublabel: p.code,
                                    active: formData.name === p.name,
                                    onClick: () => applyPreset(p),
                                }))}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="Subject Name (English)"
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        error={errors.name}
                                        required
                                        placeholder="e.g. Mathematics, Bangla 1st Paper"
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Subject Name (Bengali)"
                                        value={formData.name_bengali}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name_bengali: e.target.value })
                                        }
                                        error={errors.name_bengali}
                                        required
                                        placeholder="যেমনঃ সাধারণ গণিত, পদার্থবিজ্ঞান"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Subject Code <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    code: generateCode(prev.name),
                                                }))
                                            }
                                            className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                                        >
                                            <Sparkles className="w-3 h-3" /> Auto Generate
                                        </button>
                                    </div>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                        }
                                        error={errors.code}
                                        required
                                        placeholder="e.g. MATH-101, ENG-101"
                                        className="font-mono uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Subject Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, type: e.target.value })
                                        }
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="theory">Theory Only</option>
                                        <option value="practical">Practical Only</option>
                                        <option value="both">Both (Theory + Practical Lab)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Marks & Pass marks */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                                <div>
                                    <Input
                                        label="Total Marks"
                                        type="number"
                                        value={formData.total_marks}
                                        onChange={(e) => handleTotalMarksChange(e.target.value)}
                                        error={errors.total_marks}
                                        required
                                        min="1"
                                        placeholder="100, 50, etc."
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Pass Marks <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                            Auto 33%
                                        </span>
                                    </div>
                                    <Input
                                        type="number"
                                        value={formData.pass_marks}
                                        onChange={(e) =>
                                            setFormData({ ...formData, pass_marks: e.target.value })
                                        }
                                        error={errors.pass_marks}
                                        required
                                        min="1"
                                        placeholder="33"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </FormCard>

                    {/* Class Mapping */}
                    <FormCard
                        title="Assign to Academic Classes"
                        description="Select which classes will study this subject"
                        icon={<Layers className="w-5 h-5" />}
                        action={
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllClasses}
                                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center gap-1"
                                >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    Select All ({classes.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllClasses}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1"
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
                            onClick={() => router.visit('/subjects')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Update Subject
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
