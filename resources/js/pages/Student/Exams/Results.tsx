import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    TrendingUp,
    Medal,
    Download,
    Eye
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
}

interface Result {
    id: number;
    exam_id: number;
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

interface Props {
    student: Student;
    results: Result[];
}

export default function Results({ student, results }: Props) {
    const getResultColor = (status: string) => {
        return status.toLowerCase() === 'pass' ? 'text-green-600' : 'text-red-600';
    };

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

    const averagePercentage = results.length > 0
        ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2)
        : '0.00';

    const averageGPA = results.length > 0
        ? (results.reduce((sum, r) => sum + r.gpa, 0) / results.length).toFixed(2)
        : '0.00';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Results
                </h2>
            }
        >
            <Head title="My Results" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Class {student.class_name} - {student.section_name} | Roll: {student.roll_number}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Overview */}
                    {results.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total Exams</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{results.length}</div>
                                    <p className="text-xs text-gray-500">Results published</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Average Percentage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{averagePercentage}%</div>
                                    <p className="text-xs text-gray-500">Overall performance</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Average GPA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{averageGPA}</div>
                                    <p className="text-xs text-gray-500">Out of 5.00</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Results List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Award className="mr-2 h-5 w-5" />
                                Published Results
                            </CardTitle>
                            <CardDescription>View your exam results and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {results.length > 0 ? (
                                <div className="space-y-4">
                                    {results.map((result) => (
                                        <div
                                            key={result.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">{result.exam_name}</h4>
                                                    <Badge className={getGradeColor(result.grade)}>
                                                        {result.grade} - {result.gpa}
                                                    </Badge>
                                                    <Badge variant="outline" className={getResultColor(result.result_status)}>
                                                        {result.result_status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Marks Obtained</p>
                                                        <p className="font-semibold">
                                                            {result.obtained_marks} / {result.total_marks}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Percentage</p>
                                                        <p className="font-semibold">{result.percentage}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Class Position</p>
                                                        <p className="font-semibold flex items-center">
                                                            <Medal className="mr-1 h-4 w-4 text-yellow-600" />
                                                            {result.class_position}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Exam Date</p>
                                                        <p className="font-semibold">{result.exam_date}</p>
                                                    </div>
                                                </div>

                                                {result.remarks && (
                                                    <p className="mt-2 text-sm text-gray-600 italic">
                                                        Remarks: {result.remarks}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-2 ml-4">
                                                <Link href={`/student/results/${result.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Button>
                                                </Link>
                                                <Link href={`/student/results/${result.id}/download`}>
                                                    <Button size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No results published yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
