import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';

interface Summary {
    result_id: number;
    exam_name: string;
    term_number: number | null;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    gpa: number;
    grade: string | null;
    result_status: string;
    class_position: number | null;
    section_position: number | null;
    remarks: string | null;
}

interface ClassTestGroup {
    subject_name: string;
    average_percent: number;
    tests: Array<{
        exam_name: string;
        date: string | null;
        obtained_marks: number | null;
        total_marks: number | null;
        grade: string | null;
        is_absent: boolean;
    }>;
}

interface Props {
    backUrl: string;
    student: {
        full_name: string;
        class_name: string;
        section_name: string;
        roll_number: string | null;
    };
    sheet: {
        attendance: { percent: number | null; minimum: number | null; eligible: boolean | null };
        semesters: Summary[];
        annual: Summary | null;
        class_tests: ClassTestGroup[];
        weak_subjects: Array<{
            subject_name: string;
            exam_name: string;
            grade: string;
            obtained_marks: number | null;
            total_marks: number | null;
        }>;
    };
}

function ResultCard({ item, label }: { item: Summary; label: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{item.exam_name}</p>
            <p className="mt-2 text-lg font-bold text-indigo-700">
                {item.grade} · GPA {Number(item.gpa).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">
                {item.obtained_marks}/{item.total_marks} · {item.percentage}% · {item.result_status}
            </p>
            <p className="mt-1 text-xs text-slate-500">
                Class #{item.class_position ?? '—'} · Section #{item.section_position ?? '—'}
            </p>
        </div>
    );
}

export default function YearSheet({ backUrl, student, sheet }: Props) {
    const attendance = sheet.attendance;

    return (
        <AuthenticatedLayout>
            <Head title="Year Sheet" />
            <div className="mx-auto max-w-5xl space-y-4 pb-10">
                <FormPageHeader
                    title="Year Sheet"
                    subtitle={`${student.full_name} · ${student.class_name} (${student.section_name}) · Roll ${student.roll_number || '—'}`}
                    backUrl={backUrl}
                />

                <div className={`rounded-xl border p-4 ${attendance.eligible === false ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Annual attendance bar</p>
                    <p className="mt-1 text-sm text-slate-800">
                        {attendance.percent === null
                            ? 'No attendance has been recorded for this year yet.'
                            : `Attendance ${attendance.percent}%`}
                        {attendance.minimum !== null ? ` · required ${attendance.minimum}%` : ''}
                    </p>
                    {attendance.eligible === false && (
                        <p className="mt-1 text-sm font-medium text-rose-700">
                            Below the annual requirement, so the annual result cannot be a pass.
                        </p>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {[1, 2].map((term) => {
                        const item = sheet.semesters.find((row) => row.term_number === term);
                        return item ? (
                            <ResultCard key={term} item={item} label={`Semester ${term}`} />
                        ) : (
                            <div key={term} className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                                Semester {term} is not published yet.
                            </div>
                        );
                    })}
                    {sheet.annual ? (
                        <ResultCard item={sheet.annual} label="Annual" />
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                            Annual result is not published yet. Next year's roll is assigned from this result.
                        </div>
                    )}
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-sm font-semibold text-slate-900">Class tests</h2>
                    {sheet.class_tests.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No published class test yet.</p>
                    ) : (
                        <div className="mt-3 space-y-4">
                            {sheet.class_tests.map((group) => (
                                <div key={group.subject_name}>
                                    <p className="text-xs font-semibold text-slate-700">
                                        {group.subject_name} · average {group.average_percent}%
                                    </p>
                                    <ul className="mt-1 space-y-1">
                                        {group.tests.map((test) => (
                                            <li key={`${group.subject_name}-${test.exam_name}-${test.date}`} className="text-xs text-slate-600">
                                                {test.exam_name} ({test.date || '—'}) ·{' '}
                                                {test.is_absent ? 'Absent' : `${test.obtained_marks}/${test.total_marks}`} · {test.grade || '—'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-sm font-semibold text-slate-900">Subjects to improve</h2>
                    {sheet.weak_subjects.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No failed or absent subjects on published exams.</p>
                    ) : (
                        <ul className="mt-2 space-y-1">
                            {sheet.weak_subjects.map((row) => (
                                <li key={`${row.exam_name}-${row.subject_name}`} className="text-xs text-slate-700">
                                    {row.subject_name} · {row.exam_name} · {row.grade} ({row.obtained_marks ?? 0}/{row.total_marks ?? 0})
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
