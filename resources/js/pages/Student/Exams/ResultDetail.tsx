import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    Download,
    Printer,
    ArrowLeft,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
    admission_number: string;
}

interface Result {
    id: number;
    exam_name: string;
    exam_date: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    gpa: number;
    grade: string;
    class_position: number;
    section_position: number;
    result_status: string;
    remarks: string | null;
}

interface Mark {
    id: number;
    subject_name: string;
    theory_marks: number | null;
    practical_marks: number | null;
    total_marks: number;
    obtained_marks: number;
    grade: string;
    grade_point: number;
    is_absent: boolean;
    remarks: string | null;
}

interface Props {
    student: Student;
    result: Result;
    marks: Mark[];
}

export default function ResultDetail({ student, result, marks }: Props) {
    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            'A+': 'bg-green-100 text-green-800',
            'A': 'bg-green-100 text-green-700',
            'A-': 'bg-blue-100 text-blue-800',
            'B': 'bg-blue-100 text-blue-700',
            'C': 'bg-yellow-100 text-yellow-800',
            'D': 'bg-orange-100 text-orange-800',
            'F': 'bg-red-100 text-red-800',
        };
        return colors[grade] || 'bg-gray-100 text-gray-800';
    };

    const isPassed = result.result_status.toLowerCase() === 'pass';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/student/results">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Result Details
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Link href={`/student/results/${result.id}/download`}>
                            <Button size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${result.exam_name} - Result`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Marksheet Card */}
                    <Card className="print:shadow-none">
                        {/* Header */}
                        <CardHeader className="text-center border-b print:border-black">
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
                                <p className="text-sm text-gray-600">Academic Marksheet</p>
                            </div>

                            <div className="flex items-center justify-center">
                                <Badge
                                    variant={isPassed ? 'default' : 'destructive'}
                                    className={`text-lg px-4 py-1 ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}
                                >
                                    {isPassed ? (
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                    ) : (
                                        <XCircle className="mr-2 h-5 w-5" />
                                    )}
                                    {result.result_status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {/* Student Information */}
                            <div className="mb-6 grid grid-cols-2 gap-4 pb-4 border-b">
                                <div>
                                    <p className="text-sm text-gray-600">Student Name</p>
                                    <p className="font-semibold">{student.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Admission Number</p>
                                    <p className="font-semibold">{student.admission_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Class</p>
                                    <p className="font-semibold">{student.class_name} - {student.section_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Roll Number</p>
                                    <p className="font-semibold">{student.roll_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Examination</p>
                                    <p className="font-semibold">{result.exam_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Exam Date</p>
                                    <p className="font-semibold">{result.exam_date}</p>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Subject-wise Performance</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border p-3 text-left text-sm font-semibold">Subject</th>
                                                <th className="border p-3 text-center text-sm font-semibold">Theory</th>
                                                <th className="border p-3 text-center text-sm font-semibold">Practical</th>
                                                <th className="border p-3 text-center text-sm font-semibold">Total</th>
                                                <th className="border p-3 text-center text-sm font-semibold">Obtained</th>
                                                <th className="border p-3 text-center text-sm font-semibold">Grade</th>
                                                <th className="border p-3 text-center text-sm font-semibold">GP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marks.map((mark) => (
                                                <tr key={mark.id} className={mark.is_absent ? 'bg-red-50' : ''}>
                                                    <td className="border p-3 text-sm font-medium">
                                                        {mark.subject_name}
                                                    </td>
                                                    <td className="border p-3 text-center text-sm">
                                                        {mark.is_absent ? 'AB' : mark.theory_marks || '-'}
                                                    </td>
                                                    <td className="border p-3 text-center text-sm">
                                                        {mark.is_absent ? 'AB' : mark.practical_marks || '-'}
                                                    </td>
                                                    <td className="border p-3 text-center text-sm font-semibold">
                                                        {mark.total_marks}
                                                    </td>
                                                    <td className="border p-3 text-center text-sm font-semibold">
                                                        {mark.is_absent ? 'AB' : mark.obtained_marks}
                                                    </td>
                                                    <td className="border p-3 text-center">
                                                        <Badge className={getGradeColor(mark.grade)}>
                                                            {mark.grade}
                                                        </Badge>
                                                    </td>
                                                    <td className="border p-3 text-center text-sm font-semibold">
                                                        {mark.is_absent ? '0.00' : mark.grade_point}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-100 font-semibold">
                                                <td className="border p-3 text-sm" colSpan={3}>Total</td>
                                                <td className="border p-3 text-center text-sm">{result.total_marks}</td>
                                                <td className="border p-3 text-center text-sm">{result.obtained_marks}</td>
                                                <td className="border p-3 text-center">
                                                    <Badge className={getGradeColor(result.grade)}>
                                                        {result.grade}
                                                    </Badge>
                                                </td>
                                                <td className="border p-3 text-center text-sm">{result.gpa}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Result Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Total Marks</p>
                                    <p className="text-xl font-bold">{result.total_marks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Obtained</p>
                                    <p className="text-xl font-bold text-blue-600">{result.obtained_marks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Percentage</p>
                                    <p className="text-xl font-bold text-green-600">{result.percentage}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">GPA</p>
                                    <p className="text-xl font-bold text-purple-600">{result.gpa}</p>
                                </div>
                            </div>

                            {/* Position */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm text-gray-600">Class Position</p>
                                    <p className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                                        <Award className="mr-2 h-6 w-6" />
                                        {result.class_position}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-600">Section Position</p>
                                    <p className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                                        <Award className="mr-2 h-6 w-6" />
                                        {result.section_position}
                                    </p>
                                </div>
                            </div>

                            {/* Remarks */}
                            {result.remarks && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Remarks:</p>
                                    <p className="text-sm text-gray-600">{result.remarks}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t print:flex print:justify-between">
                                <div className="text-sm text-gray-600">
                                    <p>Generated on: {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="mt-4 print:mt-0 text-sm text-gray-600 print:text-right">
                                    <p className="mb-12">Signature</p>
                                    <p className="border-t border-gray-400 pt-1 inline-block">
                                        Principal / Class Teacher
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
