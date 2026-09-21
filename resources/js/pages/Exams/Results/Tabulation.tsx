import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Select from '@/Components/Select';
import {
    Table,
    Printer,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    XCircle,
    Award,
    FileSpreadsheet,
} from 'lucide-react';

interface Exam {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
    sections?: Section[];
}

interface Subject {
    id: number;
    name: string;
}

interface SubjectMark {
    subject_name: string;
    theory_marks: number | null;
    practical_marks: number | null;
    obtained_marks: number | null;
    full_marks: number;
    grade: string;
    grade_point: number | string;
    is_absent: boolean;
}

interface TabulationRow {
    student_id: number;
    roll_number: string | number;
    student_name: string;
    section_name: string;
    subject_marks: Record<string, SubjectMark>;
    total_marks: number | null;
    obtained_marks: number | null;
    percentage: number | null;
    gpa: number | null;
    grade: string | null;
    class_position: number | null;
    section_position: number | null;
    result_status: string | null;
}

interface TabulationData {
    exam: Exam;
    schoolClass: SchoolClass;
    subjects: Subject[];
    rows: TabulationRow[];
    section_id: number | null;
}

interface TabulationProps {
    exams: Exam[];
    classes: SchoolClass[];
    filters: {
        exam_id: string;
        class_id: string;
        section_id: string;
    };
    tabulation: TabulationData | null;
}

export default function Tabulation({ exams, classes, filters, tabulation }: TabulationProps) {
    const [selectedExam, setSelectedExam] = useState(filters.exam_id || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');

    const currentClass = classes.find((c) => c.id.toString() === selectedClass);
    const sections = currentClass?.sections || [];

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/results/tabulation',
            {
                exam_id: selectedExam,
                class_id: selectedClass,
                section_id: selectedSection,
            },
            { preserveState: true }
        );
    };

    const printUrl = `/results/tabulation/print?exam_id=${selectedExam}&class_id=${selectedClass}&section_id=${selectedSection}`;

    return (
        <AuthenticatedLayout>
            <Head title="Tabulation Sheet - Results" />

            <div className="py-6">
                <div className="max-w-[98%] mx-auto px-2 sm:px-4 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <Link href="/results">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back to Results
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileSpreadsheet className="h-7 w-7 text-indigo-600" />
                                    Academic Tabulation Sheet
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Comprehensive class-wide broadsheet with marks, GPA, and merit ranking
                                </p>
                            </div>
                        </div>

                        {tabulation && (
                            <div className="flex items-center gap-2">
                                <a href={printUrl} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Tabulation Sheet
                                    </Button>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Filter Card */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Select Exam *
                                    </label>
                                    <Select
                                        value={selectedExam}
                                        onChange={(e) => setSelectedExam(e.target.value)}
                                        options={[
                                            { value: '', label: '-- Choose Exam --' },
                                            ...exams.map((ex) => ({
                                                value: ex.id.toString(),
                                                label: ex.name,
                                            })),
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Select Class *
                                    </label>
                                    <Select
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            setSelectedSection('');
                                        }}
                                        options={[
                                            { value: '', label: '-- Choose Class --' },
                                            ...classes.map((c) => ({
                                                value: c.id.toString(),
                                                label: c.name,
                                            })),
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Section (Optional)
                                    </label>
                                    <Select
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        disabled={!selectedClass || sections.length === 0}
                                        options={[
                                            { value: '', label: 'All Sections' },
                                            ...sections.map((sec) => ({
                                                value: sec.id.toString(),
                                                label: sec.name,
                                            })),
                                        ]}
                                    />
                                </div>

                                <div>
                                    <Button type="submit" variant="default" className="w-full">
                                        Load Tabulation Sheet
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Tabulation Table */}
                    {tabulation ? (
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="bg-slate-50 border-b border-gray-200 py-4 px-6 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold text-gray-800">
                                        {tabulation.exam.name} — {tabulation.schoolClass.name}
                                    </CardTitle>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Total Examinees: {tabulation.rows.length} | Subjects: {tabulation.subjects.length}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Passed: {tabulation.rows.filter((r) => r.result_status === 'pass').length}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Failed: {tabulation.rows.filter((r) => r.result_status === 'fail').length}
                                    </span>
                                </div>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-700 border-collapse">
                                    <thead className="text-[11px] text-gray-700 uppercase bg-slate-100 border-b border-gray-300">
                                        <tr>
                                            <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center w-12">Roll</th>
                                            <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 min-w-[150px]">Student Name</th>
                                            <th rowSpan={2} className="px-2 py-2 border-r border-gray-300 text-center w-16">Sec</th>
                                            {tabulation.subjects.map((sub) => (
                                                <th key={sub.id} colSpan={3} className="px-2 py-1.5 border-r border-gray-300 text-center font-bold">
                                                    {sub.name}
                                                </th>
                                            ))}
                                            <th rowSpan={2} className="px-2 py-2 border-r border-gray-300 text-center w-16">Full</th>
                                            <th rowSpan={2} className="px-2 py-2 border-r border-gray-300 text-center w-16">Obtd</th>
                                            <th rowSpan={2} className="px-2 py-2 border-r border-gray-300 text-center w-14">GPA</th>
                                            <th rowSpan={2} className="px-2 py-2 border-r border-gray-300 text-center w-12">Grade</th>
                                            <th rowSpan={2} className="px-2 py-2 border-r border-gray-300 text-center w-14">Rank</th>
                                            <th rowSpan={2} className="px-2 py-2 text-center w-16">Status</th>
                                        </tr>
                                        <tr className="bg-slate-50 text-[10px]">
                                            {tabulation.subjects.map((sub) => (
                                                <React.Fragment key={sub.id}>
                                                    <th className="px-1.5 py-1 text-center border-r border-gray-200">Mark</th>
                                                    <th className="px-1.5 py-1 text-center border-r border-gray-200">GP</th>
                                                    <th className="px-1.5 py-1 text-center border-r border-gray-300">Grd</th>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {tabulation.rows.length > 0 ? (
                                            tabulation.rows.map((row) => (
                                                <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-3 py-2 text-center font-bold border-r border-gray-200">
                                                        {row.roll_number}
                                                    </td>
                                                    <td className="px-3 py-2 font-medium border-r border-gray-200 text-gray-900">
                                                        {row.student_name}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-gray-500 border-r border-gray-200">
                                                        {row.section_name}
                                                    </td>
                                                    {tabulation.subjects.map((sub) => {
                                                        const sm = row.subject_marks[sub.id];
                                                        return (
                                                            <React.Fragment key={sub.id}>
                                                                <td className="px-1.5 py-2 text-center border-r border-gray-200">
                                                                    {sm?.is_absent ? (
                                                                        <span className="text-red-500 font-bold">AB</span>
                                                                    ) : (
                                                                        sm?.obtained_marks ?? '-'
                                                                    )}
                                                                </td>
                                                                <td className="px-1.5 py-2 text-center border-r border-gray-200 font-medium">
                                                                    {sm ? (typeof sm.grade_point === 'number' ? sm.grade_point.toFixed(2) : sm.grade_point) : '-'}
                                                                </td>
                                                                <td className={`px-1.5 py-2 text-center border-r border-gray-300 font-bold ${sm?.grade === 'F' ? 'text-red-600' : 'text-slate-700'}`}>
                                                                    {sm?.grade ?? '-'}
                                                                </td>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    <td className="px-2 py-2 text-center text-gray-500 border-r border-gray-200">
                                                        {row.total_marks ?? '-'}
                                                    </td>
                                                    <td className="px-2 py-2 text-center font-bold text-gray-900 border-r border-gray-200">
                                                        {row.obtained_marks ?? '-'}
                                                    </td>
                                                    <td className={`px-2 py-2 text-center font-bold border-r border-gray-200 ${row.result_status === 'pass' ? 'text-green-700' : 'text-red-600'}`}>
                                                        {row.gpa !== null ? Number(row.gpa).toFixed(2) : '-'}
                                                    </td>
                                                    <td className={`px-2 py-2 text-center font-bold border-r border-gray-200 ${row.grade === 'F' ? 'text-red-600' : 'text-indigo-600'}`}>
                                                        {row.grade ?? '-'}
                                                    </td>
                                                    <td className="px-2 py-2 text-center font-bold border-r border-gray-200">
                                                        {row.class_position ? (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-800 border border-amber-200">
                                                                #{row.class_position}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 text-center">
                                                        {row.result_status === 'pass' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800">
                                                                PASS
                                                            </span>
                                                        ) : row.result_status === 'fail' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                                                                FAIL
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={9 + tabulation.subjects.length * 3}
                                                    className="px-6 py-12 text-center text-gray-500"
                                                >
                                                    No results found for this exam and class. Please click "Generate Results" from the Results page first.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ) : (
                        <Card className="text-center py-12 bg-slate-50 border-dashed border-2 border-slate-200">
                            <CardContent>
                                <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-gray-800">No Tabulation Data Selected</h3>
                                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                                    Please select an examination and a class from the filters above and click "Load Tabulation Sheet".
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
