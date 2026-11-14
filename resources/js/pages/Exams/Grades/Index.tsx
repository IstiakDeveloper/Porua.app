import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import PresetPills from '@/Components/PresetPills';
import {
    Plus,
    Edit,
    Trash2,
    Award,
    Sparkles,
    CheckCircle2,
    Calculator,
    BarChart3,
} from 'lucide-react';
import { GradeSetting } from '@/types/exam';

interface IndexProps {
    grades: GradeSetting[];
}

const GRADE_PRESETS = [
    {
        name: 'A+',
        point: '5.00',
        min: '80',
        max: '100',
        remarks: 'Outstanding (অসাধারণ)',
    },
    {
        name: 'A',
        point: '4.00',
        min: '70',
        max: '79',
        remarks: 'Excellent (চমৎকার)',
    },
    {
        name: 'A-',
        point: '3.50',
        min: '60',
        max: '69',
        remarks: 'Very Good (খুব ভালো)',
    },
    {
        name: 'B',
        point: '3.00',
        min: '50',
        max: '59',
        remarks: 'Good (ভালো)',
    },
    {
        name: 'C',
        point: '2.00',
        min: '40',
        max: '49',
        remarks: 'Satisfactory (সন্তোষজনক)',
    },
    {
        name: 'D',
        point: '1.00',
        min: '33',
        max: '39',
        remarks: 'Passing Threshold (উত্তীর্ণ)',
    },
    {
        name: 'F',
        point: '0.00',
        min: '0',
        max: '32',
        remarks: 'Fail (অনুত্তীর্ণ)',
    },
];

export default function Index({ grades = [] }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<GradeSetting | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        grade_name: '',
        grade_point: '',
        min_marks: '',
        max_marks: '',
        remarks: '',
    });

    const handleOpenCreate = () => {
        setEditingGrade(null);
        setFormData({
            grade_name: '',
            grade_point: '',
            min_marks: '',
            max_marks: '',
            remarks: '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleOpenEdit = (grade: GradeSetting) => {
        setEditingGrade(grade);
        setFormData({
            grade_name: grade.grade_name,
            grade_point: grade.grade_point.toString(),
            min_marks: grade.min_marks.toString(),
            max_marks: grade.max_marks.toString(),
            remarks: grade.remarks || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const applyPreset = (preset: (typeof GRADE_PRESETS)[0]) => {
        setFormData({
            grade_name: preset.name,
            grade_point: preset.point,
            min_marks: preset.min,
            max_marks: preset.max,
            remarks: preset.remarks,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingGrade ? `/grade-settings/${editingGrade.id}` : '/grade-settings';
        const method = editingGrade ? 'put' : 'post';

        router[method](url, formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setShowModal(false);
            },
        });
    };

    const handleDeleteClick = (id: number, grade: string) => {
        setDeleteModal({ isOpen: true, id, name: grade });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/grade-settings/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
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

    return (
        <AuthenticatedLayout>
            <Head title="Grade Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1.5">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>Examination Module</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                            Grade Scales & GPA Settings
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Configure grading scales, mark intervals, GPA conversions, and qualitative remarks
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="md"
                            variant="outline"
                            onClick={() => router.post('/grade-settings/install')}
                        >
                            Install national scale
                        </Button>
                        <Button
                            size="md"
                            onClick={handleOpenCreate}
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            Add Grade Interval
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Configured Grades</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{grades.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Scale tiers</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Tier (A+)</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">5.00 GPA</p>
                        <p className="text-xs text-blue-600 mt-1">80 - 100 Marks</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pass Benchmark</p>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">33 Marks</p>
                        <p className="text-xs text-emerald-600 mt-1">D Grade (1.00 GPA)</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Standard</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Calculator className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">National</p>
                        <p className="text-xs text-slate-500 mt-1">Bangladesh Education Board</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="px-5 py-4 text-white font-bold">Letter Grade</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Grade Point (GPA)</th>
                                    <th className="px-5 py-4 text-center text-white font-bold">Marks Range</th>
                                    <th className="px-5 py-4 text-white font-bold">Performance Remarks</th>
                                    <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {grades.length > 0 ? (
                                    grades.map((grade) => (
                                        <tr
                                            key={grade.id}
                                            className="hover:bg-emerald-50/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-lg text-sm border font-bold ${getGradeColor(
                                                        grade.grade_name
                                                    )}`}
                                                >
                                                    {grade.grade_name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono font-bold text-sm text-slate-800">
                                                {parseFloat(grade.grade_point as any).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs text-slate-700 font-medium">
                                                    {grade.min_marks} - {grade.max_marks}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {grade.remarks || <span className="text-slate-400 italic">None</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(grade)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Grade"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(grade.id, grade.grade_name)
                                                        }
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Grade"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                    <Award className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No grading intervals configured</p>
                                                <p className="text-xs text-slate-500">
                                                    Configure national standard grade intervals (A+, A, B, etc.) to enable automatic result calculation.
                                                </p>
                                                <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
                                                    Add Grade Interval
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Standard Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editingGrade ? `Edit Grade Interval (${editingGrade.grade_name})` : 'Create Grade Interval'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!editingGrade && (
                        <PresetPills
                            title="1-Click BD National Curriculum Grade Scale Presets"
                            options={GRADE_PRESETS.map((p) => ({
                                label: p.name,
                                sublabel: `${p.min}-${p.max} (${p.point})`,
                                active: formData.grade_name === p.name,
                                onClick: () => applyPreset(p),
                            }))}
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Grade Letter"
                            value={formData.grade_name}
                            onChange={(e) =>
                                setFormData({ ...formData, grade_name: e.target.value.toUpperCase() })
                            }
                            error={errors.grade_name}
                            required
                            placeholder="e.g. A+, A, B"
                            className="uppercase font-bold"
                        />

                        <Input
                            label="Grade Point (GPA)"
                            type="number"
                            step="0.01"
                            min="0"
                            max="5"
                            value={formData.grade_point}
                            onChange={(e) =>
                                setFormData({ ...formData, grade_point: e.target.value })
                            }
                            error={errors.grade_point}
                            required
                            placeholder="e.g. 5.00, 4.00"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Minimum Marks"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.min_marks}
                            onChange={(e) =>
                                setFormData({ ...formData, min_marks: e.target.value })
                            }
                            error={errors.min_marks}
                            required
                            placeholder="e.g. 80"
                        />

                        <Input
                            label="Maximum Marks"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.max_marks}
                            onChange={(e) =>
                                setFormData({ ...formData, max_marks: e.target.value })
                            }
                            error={errors.max_marks}
                            required
                            placeholder="e.g. 100"
                        />
                    </div>

                    <Input
                        label="Remarks / Evaluation Qualitative Text (Optional)"
                        value={formData.remarks}
                        onChange={(e) =>
                            setFormData({ ...formData, remarks: e.target.value })
                        }
                        error={errors.remarks}
                        placeholder="e.g. Outstanding, Excellent, Fail"
                    />

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                        >
                            {editingGrade ? 'Update Grade' : 'Save Grade'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Grade Interval"
                message={`Are you sure you want to delete grade tier "${deleteModal.name}"?`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
