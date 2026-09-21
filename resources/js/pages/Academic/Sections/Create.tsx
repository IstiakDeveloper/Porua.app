import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import PresetPills from '@/Components/PresetPills';
import { Save, Layers, Building, Users, BookOpen, UserCheck } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali?: string;
}

interface Teacher {
    id: number;
    user?: { name: string };
}

interface CreateProps {
    classes: SchoolClass[];
    teachers?: Teacher[];
}

const SECTION_NAME_PRESETS = [
    { label: 'A', sublabel: 'Standard' },
    { label: 'B', sublabel: 'Standard' },
    { label: 'C', sublabel: 'Standard' },
    { label: 'D', sublabel: 'Standard' },
    { label: 'Padma', sublabel: 'পদ্মা' },
    { label: 'Meghna', sublabel: 'মেঘনা' },
    { label: 'Jamuna', sublabel: 'যমুনা' },
    { label: 'Surma', sublabel: 'সুরমা' },
    { label: 'Rose', sublabel: 'গোলাপ' },
    { label: 'Lotus', sublabel: 'পদ্ম' },
    { label: 'Lily', sublabel: 'শাপলা' },
];

const CAPACITY_PRESETS = [
    { label: '30 Seats', value: '30' },
    { label: '40 Seats', value: '40' },
    { label: '50 Seats', value: '50' },
    { label: '60 Seats', value: '60' },
];

export default function Create({ classes, teachers = [] }: CreateProps) {
    const [formData, setFormData] = useState({
        class_id: classes[0]?.id ? classes[0].id.toString() : '',
        name: 'A',
        capacity: '40',
        room_number: '',
        teacher_id: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/sections', formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Section" />

            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                <FormPageHeader
                    title="Create Academic Section"
                    subtitle="Create a new class section, assign capacity, room, and class teacher"
                    backUrl="/sections"
                    badgeText="Academic Setup"
                    badgeIcon={<Layers className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormCard
                        title="Section Details"
                        description="Configure class assignment, section name, and capacity limits"
                        icon={<Layers className="w-5 h-5" />}
                    >
                        <div className="space-y-5">
                            {/* Class Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Target Academic Class <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="class_id"
                                    value={formData.class_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                >
                                    <option value="">-- Select Class --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} {cls.name_bengali ? `(${cls.name_bengali})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className="text-xs text-red-600 mt-1">{errors.class_id}</p>
                                )}
                            </div>

                            {/* Section Name Presets */}
                            <div>
                                <PresetPills
                                    title="1-Click Section Name Presets (Letters & BD Rivers/Flowers)"
                                    options={SECTION_NAME_PRESETS.map((p) => ({
                                        label: p.label,
                                        sublabel: p.sublabel,
                                        active: formData.name === p.label,
                                        onClick: () =>
                                            setFormData((prev) => ({ ...prev, name: p.label })),
                                    }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="Section Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                        required
                                        placeholder="e.g. A, B, Padma, Rose"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Identify this specific cohort
                                    </p>
                                </div>

                                <div>
                                    <Input
                                        label="Room / Hall Number (Optional)"
                                        name="room_number"
                                        value={formData.room_number}
                                        onChange={handleChange}
                                        error={errors.room_number}
                                        placeholder="e.g. Room 102, Building A"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Physical room where classes are held
                                    </p>
                                </div>
                            </div>

                            {/* Capacity Presets */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Student Capacity
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {CAPACITY_PRESETS.map((cp) => (
                                        <button
                                            key={cp.value}
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    capacity: cp.value,
                                                }))
                                            }
                                            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                                                formData.capacity === cp.value
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                                            }`}
                                        >
                                            {cp.label}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    error={errors.capacity}
                                    min="1"
                                    max="200"
                                    placeholder="e.g. 40"
                                />
                            </div>

                            {/* Class Teacher (Optional) & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Assigned Class Teacher (Optional)
                                    </label>
                                    <select
                                        name="teacher_id"
                                        value={formData.teacher_id}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="">-- None Assigned --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.user?.name || `Teacher #${t.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </FormCard>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.visit('/sections')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Save Section
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
