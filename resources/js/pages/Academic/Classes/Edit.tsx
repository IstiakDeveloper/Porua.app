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
    BookOpen,
    DollarSign,
    Plus,
    Trash2,
    Layers,
    CheckSquare,
    Square,
    Check,
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code?: string;
}

interface FeeType {
    id: number;
    name: string;
    frequency: string;
}

interface AcademicYear {
    id: number;
    year: string;
    name?: string;
}

interface FeeStructure {
    id?: number;
    fee_type_id?: number;
    academic_year_id?: number;
    amount?: number | string;
    fee_type?: { id: number; name: string };
    academic_year?: { id: number; year: string; name?: string };
}

interface SchoolClass {
    id: number;
    name: string;
    name_bengali?: string;
    numeric_value: number;
    order: number;
    description?: string;
    status: string;
    subjects: Subject[];
    fee_structures: FeeStructure[];
}

interface EditProps {
    class: SchoolClass;
    subjects: Subject[];
    feeTypes: FeeType[];
    academicYears: AcademicYear[];
    currentAcademicYearId?: number;
}

const CLASS_PRESETS = [
    { name: 'Play', name_bengali: 'প্লে', numeric_value: '1', order: '0' },
    { name: 'Nursery', name_bengali: 'নার্সারি', numeric_value: '1', order: '1' },
    { name: 'KG', name_bengali: 'কেজি', numeric_value: '1', order: '2' },
    { name: 'Class 1', name_bengali: 'প্রথম শ্রেণি', numeric_value: '1', order: '3' },
    { name: 'Class 2', name_bengali: 'দ্বিতীয় শ্রেণি', numeric_value: '2', order: '4' },
    { name: 'Class 3', name_bengali: 'তৃতীয় শ্রেণি', numeric_value: '3', order: '5' },
    { name: 'Class 4', name_bengali: 'চতুর্থ শ্রেণি', numeric_value: '4', order: '6' },
    { name: 'Class 5', name_bengali: 'পঞ্চম শ্রেণি', numeric_value: '5', order: '7' },
    { name: 'Class 6', name_bengali: 'ষষ্ঠ শ্রেণি', numeric_value: '6', order: '8' },
    { name: 'Class 7', name_bengali: 'সপ্তম শ্রেণি', numeric_value: '7', order: '9' },
    { name: 'Class 8', name_bengali: 'অষ্টম শ্রেণি', numeric_value: '8', order: '10' },
    { name: 'Class 9', name_bengali: 'নবম শ্রেণি', numeric_value: '9', order: '11' },
    { name: 'Class 10', name_bengali: 'দশম শ্রেণি', numeric_value: '10', order: '12' },
    { name: 'Class 11', name_bengali: 'একাদশ শ্রেণি', numeric_value: '11', order: '13' },
    { name: 'Class 12', name_bengali: 'দ্বাদশ শ্রেণি', numeric_value: '12', order: '14' },
];

export default function Edit({
    class: schoolClass,
    subjects,
    feeTypes,
    academicYears,
    currentAcademicYearId,
}: EditProps) {
    const [data, setData] = useState({
        name: schoolClass.name,
        name_bengali: schoolClass.name_bengali || '',
        numeric_value: schoolClass.numeric_value.toString(),
        order: schoolClass.order.toString(),
        description: schoolClass.description || '',
        status: schoolClass.status,
        subjects: (schoolClass.subjects || []).map((s) => s.id),
        fee_structures: (schoolClass.fee_structures || []).map((f) => ({
            fee_type_id: (f.fee_type_id || f.fee_type?.id || '').toString(),
            academic_year_id: (f.academic_year_id || f.academic_year?.id || '').toString(),
            amount: (f.amount || '').toString(),
        })),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleNameChange = (val: string) => {
        const trimmed = val.trim();
        const match = trimmed.match(/\b(1[0-2]|[1-9])\b/);
        const extractedNum = match ? match[1] : '';

        const matchedPreset = CLASS_PRESETS.find(
            (p) => p.name.toLowerCase() === trimmed.toLowerCase()
        );

        setData((prev) => ({
            ...prev,
            name: val,
            numeric_value: prev.numeric_value || matchedPreset?.numeric_value || extractedNum || prev.numeric_value,
            order: prev.order || matchedPreset?.order || extractedNum || prev.order,
            name_bengali: prev.name_bengali || matchedPreset?.name_bengali || prev.name_bengali,
        }));
    };

    const applyPreset = (preset: (typeof CLASS_PRESETS)[0]) => {
        setData((prev) => ({
            ...prev,
            name: preset.name,
            name_bengali: preset.name_bengali,
            numeric_value: preset.numeric_value,
            order: preset.order,
        }));
    };

    const addFeeStructure = () => {
        setData((prev) => ({
            ...prev,
            fee_structures: [
                ...prev.fee_structures,
                {
                    fee_type_id: feeTypes[0]?.id ? feeTypes[0].id.toString() : '',
                    academic_year_id: currentAcademicYearId ? currentAcademicYearId.toString() : (academicYears[0]?.id?.toString() || ''),
                    amount: '',
                },
            ],
        }));
    };

    const removeFeeStructure = (index: number) => {
        setData((prev) => ({
            ...prev,
            fee_structures: prev.fee_structures.filter((_, i) => i !== index),
        }));
    };

    const updateFeeStructure = (index: number, field: string, value: string) => {
        setData((prev) => ({
            ...prev,
            fee_structures: prev.fee_structures.map((fee, i) =>
                i === index ? { ...fee, [field]: value } : fee
            ),
        }));
    };

    const toggleSubject = (id: number) => {
        setData((prev) => ({
            ...prev,
            subjects: prev.subjects.includes(id)
                ? prev.subjects.filter((s) => s !== id)
                : [...prev.subjects, id],
        }));
    };

    const selectAllSubjects = () => {
        setData((prev) => ({
            ...prev,
            subjects: subjects.map((s) => s.id),
        }));
    };

    const clearAllSubjects = () => {
        setData((prev) => ({
            ...prev,
            subjects: [],
        }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/classes/${schoolClass.id}`, data, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Class - ${schoolClass.name}`} />

            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                <FormPageHeader
                    title={`Edit ${schoolClass.name}`}
                    subtitle="Update class grade metadata, assigned subjects, and fee templates"
                    backUrl="/classes"
                    badgeText="Academic Setup"
                    badgeIcon={<BookOpen className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Class Info */}
                    <FormCard
                        title="Class Information"
                        description="Basic identifying information for this class grade"
                        icon={<BookOpen className="w-5 h-5" />}
                    >
                        <div className="space-y-4">
                            <PresetPills
                                title="1-Click BD Standard Class Presets"
                                options={CLASS_PRESETS.map((p) => ({
                                    label: p.name,
                                    sublabel: p.name_bengali,
                                    active: data.name === p.name,
                                    onClick: () => applyPreset(p),
                                }))}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="Class Name (English)"
                                        value={data.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        error={errors.name}
                                        required
                                        placeholder="e.g. Class 1, Class 10"
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Class Name (Bengali)"
                                        value={data.name_bengali}
                                        onChange={(e) =>
                                            setData({ ...data, name_bengali: e.target.value })
                                        }
                                        error={errors.name_bengali}
                                        placeholder="যেমনঃ প্রথম শ্রেণি, দশম শ্রেণি"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        label="Numeric Grade"
                                        type="number"
                                        value={data.numeric_value}
                                        onChange={(e) =>
                                            setData({ ...data, numeric_value: e.target.value })
                                        }
                                        error={errors.numeric_value}
                                        required
                                        min="1"
                                        max="12"
                                        placeholder="1-12"
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Display Order"
                                        type="number"
                                        value={data.order}
                                        onChange={(e) =>
                                            setData({ ...data, order: e.target.value })
                                        }
                                        error={errors.order}
                                        required
                                        min="0"
                                        placeholder="0, 1, 2..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) =>
                                            setData({ ...data, status: e.target.value })
                                        }
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description / Remarks (Optional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData({ ...data, description: e.target.value })
                                    }
                                    rows={2}
                                    placeholder="Optional notes regarding this class level..."
                                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                />
                            </div>
                        </div>
                    </FormCard>

                    {/* Assigned Subjects Card */}
                    <FormCard
                        title="Assign Subjects to this Class"
                        description="Select the subjects taught in this grade curriculum"
                        icon={<Layers className="w-5 h-5" />}
                        action={
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllSubjects}
                                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center gap-1"
                                >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    Select All ({subjects.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllSubjects}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1"
                                >
                                    <Square className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            </div>
                        }
                    >
                        {subjects.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {subjects.map((sub) => {
                                    const isSelected = data.subjects.includes(sub.id);
                                    return (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => toggleSubject(sub.id)}
                                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/20'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="truncate">
                                                <p className="text-xs font-semibold truncate">
                                                    {sub.name}
                                                </p>
                                                {sub.code && (
                                                    <p className="text-[10px] text-slate-400 font-mono">
                                                        {sub.code}
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
                                No subjects available.
                            </p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                            <span>Selected: {data.subjects.length} of {subjects.length} subjects</span>
                        </div>
                    </FormCard>

                    {/* Fee Structures Card */}
                    <FormCard
                        title="Fee Structures for this Class"
                        description="Configure default fees automatically billed to students enrolled in this class"
                        icon={<DollarSign className="w-5 h-5" />}
                        action={
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addFeeStructure}
                                icon={<Plus className="w-3.5 h-3.5" />}
                            >
                                Add Fee Item
                            </Button>
                        }
                    >
                        {data.fee_structures.length > 0 ? (
                            <div className="space-y-3">
                                {data.fee_structures.map((fee, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 items-end"
                                    >
                                        <div className="sm:col-span-4">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Fee Type
                                            </label>
                                            <select
                                                value={fee.fee_type_id}
                                                onChange={(e) =>
                                                    updateFeeStructure(index, 'fee_type_id', e.target.value)
                                                }
                                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                                            >
                                                <option value="">Select Fee Type</option>
                                                {feeTypes.map((ft) => (
                                                    <option key={ft.id} value={ft.id}>
                                                        {ft.name} ({ft.frequency})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="sm:col-span-4">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Academic Year
                                            </label>
                                            <select
                                                value={fee.academic_year_id}
                                                onChange={(e) =>
                                                    updateFeeStructure(
                                                        index,
                                                        'academic_year_id',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                                            >
                                                <option value="">Select Academic Year</option>
                                                {academicYears.map((ay) => (
                                                    <option key={ay.id} value={ay.id}>
                                                        {ay.name || ay.year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Amount (BDT)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="e.g. 1500"
                                                value={fee.amount}
                                                onChange={(e) =>
                                                    updateFeeStructure(index, 'amount', e.target.value)
                                                }
                                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-mono"
                                            />
                                        </div>

                                        <div className="sm:col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeFeeStructure(index)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Fee Item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                                <p className="text-xs text-slate-500">
                                    No fee structures configured for this class yet.
                                </p>
                                <button
                                    type="button"
                                    onClick={addFeeStructure}
                                    className="mt-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
                                >
                                    + Add standard fee structure now
                                </button>
                            </div>
                        )}
                    </FormCard>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.visit('/classes')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Update Class
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
