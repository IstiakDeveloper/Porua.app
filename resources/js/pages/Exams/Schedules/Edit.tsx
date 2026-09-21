import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import { Save, Calendar, Clock } from 'lucide-react';
import { ExamSchedule, Exam, SchoolClass, Subject } from '@/types/exam';

interface EditProps {
    schedule: ExamSchedule;
    exams: Exam[];
    classes: SchoolClass[];
    subjects: Subject[];
}

const DURATION_PRESETS = [
    { label: '1 Hour', minutes: 60 },
    { label: '1.5 Hours', minutes: 90 },
    { label: '2 Hours', minutes: 120 },
    { label: '2.5 Hours', minutes: 150 },
    { label: '3 Hours', minutes: 180 },
];

export default function Edit({ schedule, exams, classes, subjects }: EditProps) {
    const [formData, setFormData] = useState({
        exam_id: schedule.exam_id.toString(),
        class_id: schedule.class_id.toString(),
        subject_id: schedule.subject_id.toString(),
        date: schedule.exam_date || '',
        start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : '',
        end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : '',
        room_number: schedule.room_number || '',
        instructions: schedule.instructions || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const applyDuration = (minutes: number) => {
        if (!formData.start_time) return;
        const [hours, mins] = formData.start_time.split(':').map(Number);
        const totalMins = hours * 60 + mins + minutes;
        const endHours = Math.floor(totalMins / 60) % 24;
        const endMins = totalMins % 60;
        const formattedEnd = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        setFormData((prev) => ({ ...prev, end_time: formattedEnd }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/exam-schedules/${schedule.id}`, formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Exam Schedule" />

            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                <FormPageHeader
                    title="Edit Routine Slot"
                    subtitle="Update subject date, exam timing, duration, and room assignment"
                    backUrl="/exam-schedules"
                    badgeText="Exam Routines"
                    badgeIcon={<Calendar className="w-3 h-3 text-emerald-600" />}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormCard
                        title="Routine Details"
                        description="Exam session, class, course, and date timing"
                        icon={<Calendar className="w-5 h-5" />}
                    >
                        <div className="space-y-5">
                            {/* Exam & Class */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Target Examination <span className="text-red-500">*</span>
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
                                    {errors.exam_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.exam_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Academic Class <span className="text-red-500">*</span>
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
                                    {errors.class_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.class_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Subject & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Subject / Course <span className="text-red-500">*</span>
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
                                    {errors.subject_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.subject_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="Exam Date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        error={errors.date}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Duration and Timing */}
                            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-slate-700">
                                        Exam Duration Calculator:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {DURATION_PRESETS.map((dp, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => applyDuration(dp.minutes)}
                                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all cursor-pointer shadow-2xs"
                                            >
                                                +{dp.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <Input
                                            label="Start Time"
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) =>
                                                setFormData({ ...formData, start_time: e.target.value })
                                            }
                                            error={errors.start_time}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="End Time"
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) =>
                                                setFormData({ ...formData, end_time: e.target.value })
                                            }
                                            error={errors.end_time}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Room & Instructions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="Room / Hall Number (Optional)"
                                        value={formData.room_number}
                                        onChange={(e) =>
                                            setFormData({ ...formData, room_number: e.target.value })
                                        }
                                        error={errors.room_number}
                                        placeholder="e.g. Hall 101, Main Auditorium"
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Special Instructions (Optional)"
                                        value={formData.instructions}
                                        onChange={(e) =>
                                            setFormData({ ...formData, instructions: e.target.value })
                                        }
                                        error={errors.instructions}
                                        placeholder="e.g. Bring calculator & geometry box"
                                    />
                                </div>
                            </div>
                        </div>
                    </FormCard>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.visit('/exam-schedules')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Update Routine Slot
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
