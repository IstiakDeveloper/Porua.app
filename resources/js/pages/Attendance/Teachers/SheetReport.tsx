import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import ComboSelect from '@/Components/ComboSelect';
import { AttendancePageHeader, type AttendancePersonType } from '@/Components/TeacherAttendanceNav';
import { FileText, AlertTriangle } from 'lucide-react';

interface ClassOption {
    id: number;
    name: string;
}

interface SectionOption {
    id: number;
    name: string;
    class_id: number;
}

interface Props {
    reportType?: 'teacher' | 'student';
    departments: string[];
    classes?: ClassOption[];
    sections?: SectionOption[];
    filters: {
        report_type?: string;
        start_date: string;
        end_date: string;
        department?: string;
        class_id?: string | number | null;
        section_id?: string | number | null;
    };
}

const fieldLabel = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const dateInput = 'h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

export default function SheetReport({
    reportType = 'teacher',
    departments,
    classes = [],
    sections = [],
    filters,
}: Props) {
    const [type, setType] = useState<'teacher' | 'student'>(filters.report_type === 'student' || reportType === 'student' ? 'student' : 'teacher');
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [department, setDepartment] = useState(filters.department || '');
    const [classId, setClassId] = useState(filters.class_id ? String(filters.class_id) : '');
    const [sectionId, setSectionId] = useState(filters.section_id ? String(filters.section_id) : '');

    const sectionItems = useMemo(
        () => sections
            .filter((section) => !classId || String(section.class_id) === classId)
            .map((section) => ({ value: String(section.id), label: section.name })),
        [sections, classId],
    );

    const daysDiff = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
        return diff;
    };

    const tooLarge = daysDiff() > 31;

    const switchType = (next: AttendancePersonType) => {
        setType(next);
        setDepartment('');
        setClassId('');
        setSectionId('');
        router.get('/teacher-attendance/sheet-report', {
            report_type: next,
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const generate = () => {
        const params = new URLSearchParams();
        params.set('report_type', type);
        params.set('start_date', startDate);
        params.set('end_date', endDate);
        if (type === 'student') {
            if (classId) params.set('class_id', classId);
            if (sectionId) params.set('section_id', sectionId);
        } else if (department) {
            params.set('department', department);
        }
        window.open(`/teacher-attendance/sheet-report/pdf?${params.toString()}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Attendance Sheet Report" />

            <div className="space-y-5">
                <AttendancePageHeader
                    title="Attendance Sheet Report"
                    subtitle={type === 'student' ? 'Printable date-range sheet for students' : 'Printable date-range sheet for teachers'}
                    current="sheet"
                    reportType={type}
                    onTypeChange={switchType}
                />

                <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="mb-5 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Sheet Parameters</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {type === 'student' ? 'Generate a printable class / section attendance sheet for students.' : 'Generate a printable department attendance sheet for teachers.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={fieldLabel}>Start date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={dateInput} />
                        </div>
                        <div>
                            <label className={fieldLabel}>End date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={dateInput} />
                        </div>
                        {type === 'student' ? (
                            <>
                                <div>
                                    <label className={fieldLabel}>Class</label>
                                    <ComboSelect
                                        value={classId || null}
                                        onChange={(next) => {
                                            setClassId(next || '');
                                            setSectionId('');
                                        }}
                                        items={classes.map((item) => ({ value: String(item.id), label: item.name }))}
                                        placeholder="All classes"
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabel}>Section</label>
                                    <ComboSelect
                                        value={sectionId || null}
                                        onChange={(next) => setSectionId(next || '')}
                                        items={sectionItems}
                                        placeholder="All sections"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="sm:col-span-2">
                                <label className={fieldLabel}>Department</label>
                                <ComboSelect
                                    value={department || null}
                                    onChange={(next) => setDepartment(next || '')}
                                    items={departments.map((dept) => ({ value: dept, label: dept }))}
                                    placeholder="All departments"
                                />
                            </div>
                        )}
                    </div>

                    {tooLarge && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            Date range cannot exceed 31 days. Please shorten the period.
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button
                            size="sm"
                            className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                            onClick={generate}
                            disabled={tooLarge || !startDate || !endDate}
                            icon={<FileText className="h-4 w-4" />}
                        >
                            Generate {type} sheet
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
