import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import { Save, ArrowLeft, User } from 'lucide-react';
import { Mark, Exam, SchoolClass, Subject } from '@/types/exam';

interface EditProps {
    marks: Mark[];
    exam: Exam;
    class: SchoolClass;
    subject: Subject;
}

export default function Edit({ marks: initialMarks, exam, class: schoolClass, subject }: EditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [marks, setMarks] = useState(
        initialMarks.map(mark => ({
            student_id: mark.student_id,
            theory_marks: mark.theory_marks?.toString() || '',
            practical_marks: mark.practical_marks?.toString() || '',
            total_marks: mark.total_marks.toString(),
            grade: mark.grade || '',
            remarks: mark.remarks || '',
        }))
    );

    const handleMarkChange = (index: number, field: string, value: string) => {
        const newMarks = [...marks];
        newMarks[index] = { ...newMarks[index], [field]: value };

        if (field === 'theory_marks' || field === 'practical_marks') {
            const theory = parseFloat(newMarks[index].theory_marks) || 0;
            const practical = parseFloat(newMarks[index].practical_marks) || 0;
            newMarks[index].total_marks = (theory + practical).toString();
        }

        setMarks(newMarks);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Filter out students with no marks entered
        const filledMarks = marks.filter(mark =>
            mark.total_marks && parseFloat(mark.total_marks) > 0
        );

        if (filledMarks.length === 0) {
            setErrors({ marks: 'Please enter marks for at least one student' });
            setIsSubmitting(false);
            return;
        }

        router.post('/marks', {
            exam_id: exam.id,
            class_id: schoolClass.id,
            subject_id: subject.id,
            marks: filledMarks
        }, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Marks" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Edit Marks
                        </h1>
                        <p className="text-gray-600 mt-1">{exam.name} - {schoolClass.name} - {subject.name}</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/marks')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Roll No</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Theory Marks</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Practical Marks</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Grade</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {initialMarks.map((mark, index) => (
                                        <tr key={mark.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {mark.student?.full_name || mark.student?.user?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{mark.student?.roll_number}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={marks[index]?.theory_marks || ''}
                                                    onChange={(e) => handleMarkChange(index, 'theory_marks', e.target.value)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={marks[index]?.practical_marks || ''}
                                                    onChange={(e) => handleMarkChange(index, 'practical_marks', e.target.value)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-gray-900">
                                                    {marks[index]?.total_marks || '0'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={marks[index]?.grade || ''}
                                                    onChange={(e) => handleMarkChange(index, 'grade', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    maxLength={3}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={marks[index]?.remarks || ''}
                                                    onChange={(e) => handleMarkChange(index, 'remarks', e.target.value)}
                                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Optional"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                                loading={isSubmitting}
                            >
                                Update Marks
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/marks')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
