import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import PresetPills from '@/Components/PresetPills';
import { Save, UserCheck, Calendar, Clock, Building, FileText, Sparkles } from 'lucide-react';

interface Teacher {
    id: number;
    user?: { name: string };
}

interface ExamHall {
    id: number;
    name: string;
    code?: string;
}

interface Exam {
    id: number;
    name: string;
    start_date?: string;
}

interface CreateProps {
    exams: Exam[];
    teachers: Teacher[];
    halls: ExamHall[];
}

const SHIFT_PRESETS = [
    { label: 'Morning Shift (10:00 AM)', time: '10:00' },
    { label: 'Afternoon Shift (02:00 PM)', time: '14:00' },
];

export default function Create({ exams = [], teachers = [], halls = [] }: CreateProps) {
    const defaultExam = exams[0];
    const [formData, setFormData] = useState({
        exam_id: defaultExam?.id ? defaultExam.id.toString() : '',
        teacher_id: teachers[0]?.id ? teachers[0].id.toString() : '',
        hall_id: halls[0]?.id ? halls[0].id.toString() : '',
        duty_date: defaultExam?.start_date || new Date().toISOString().split('T')[0],
        duty_time: '10:00',
        remarks: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleExamChange = (examIdStr: string) => {
        const found = exams.find((e) => e.id.toString() === examIdStr);
        setFormData((prev) => ({
            ...prev,
            exam_id: examIdStr,
            duty_date: found?.start_date || prev.duty_date,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/exam-invigilators', formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assign Invigilator" />

            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                <FormPageHeader
                    title="Assign Invigilator Duty"
                    subtitle="Assign a faculty member to supervise an examination hall during a scheduled shift"
                    backUrl="/exam-invigilators"
                    badgeText="Invigilator Setup"
                    badgeIcon={<UserCheck className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormCard
                        title="Duty Shift Details"
                        description="Select the examination session, teacher, hall venue, and supervision time"
                        icon={<UserCheck className="w-5 h-5" />}
                    >
                        <div className="space-y-5">
                            {/* Exam & Teacher */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Examination <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.exam_id}
                                        onChange={(e) => handleExamChange(e.target.value)}
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
                                    {errors.exam_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.exam_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Invigilator (Teacher) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.teacher_id}
                                        onChange={(e) =>
                                            setFormData({ ...formData, teacher_id: e.target.value })
                                        }
                                        required
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.user?.name || `Teacher #${teacher.id}`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.teacher_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Hall Venue */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Assigned Exam Hall / Room
                                </label>
                                <select
                                    value={formData.hall_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, hall_id: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                                >
                                    <option value="">-- No Specific Room (Floating Supervisor) --</option>
                                    {halls.map((hall) => (
                                        <option key={hall.id} value={hall.id}>
                                            {hall.name} ({hall.capacity} capacity)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Shift Preset Pills */}
                            <PresetPills
                                title="Standard Duty Shift Presets"
                                options={SHIFT_PRESETS.map((p) => ({
                                    label: p.label,
                                    active: formData.duty_time === p.time,
                                    onClick: () =>
                                        setFormData((prev) => ({ ...prev, duty_time: p.time })),
                                }))}
                            />

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Duty Date"
                                    type="date"
                                    value={formData.duty_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duty_date: e.target.value })
                                    }
                                    error={errors.duty_date}
                                    required
                                />

                                <Input
                                    label="Reporting Shift Time"
                                    type="time"
                                    value={formData.duty_time}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duty_time: e.target.value })
                                    }
                                    error={errors.duty_time}
                                    required
                                />
                            </div>

                            {/* Remarks */}
                            <Input
                                label="Special Instructions / Duties (Optional)"
                                value={formData.remarks}
                                onChange={(e) =>
                                    setFormData({ ...formData, remarks: e.target.value })
                                }
                                placeholder="e.g. Head Invigilator, Distribute question packets at 9:50 AM"
                            />
                        </div>
                    </FormCard>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.visit('/exam-invigilators')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Assign Duty
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
