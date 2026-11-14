import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import Button from '@/Components/Button';

interface Assignment {
    id: number;
    class_name: string;
    section_name: string;
    subject_name: string;
}

interface Props {
    assignments: Assignment[];
}

export default function ClassTest({ assignments }: Props) {
    const [form, setForm] = useState({
        assignment_id: assignments[0] ? String(assignments[0].id) : '',
        name: '',
        exam_date: '',
        full_marks: '20',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        router.post('/teacher/exams/class-tests', form, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="New Class Test" />
            <div className="mx-auto max-w-xl space-y-4 pb-10">
                <FormPageHeader
                    title="New class test"
                    subtitle="One subject, one date. It does not use halls, seats, or exam fees."
                    backUrl="/teacher/exams"
                />
                <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                    <label className="block text-sm text-slate-700">
                        Class and subject
                        <select
                            required
                            value={form.assignment_id}
                            onChange={(event) => setForm({ ...form, assignment_id: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option value="">Select</option>
                            {assignments.map((row) => (
                                <option key={row.id} value={row.id}>
                                    {row.class_name} · {row.section_name} · {row.subject_name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm text-slate-700">
                        Title
                        <input
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            placeholder="Optional. Defaults to the subject name."
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-sm text-slate-700">
                            Date
                            <input
                                type="date"
                                required
                                value={form.exam_date}
                                onChange={(event) => setForm({ ...form, exam_date: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                            {errors.exam_date && <p className="mt-1 text-xs text-rose-600">{errors.exam_date}</p>}
                        </label>
                        <label className="block text-sm text-slate-700">
                            Full marks
                            <input
                                type="number"
                                min={1}
                                required
                                value={form.full_marks}
                                onChange={(event) => setForm({ ...form, full_marks: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>
                    </div>
                    <Button type="submit" loading={processing}>
                        Create and enter marks
                    </Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
