import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { ArrowLeft, BookOpen, TrendingUp, Award } from 'lucide-react';

interface Mark {
    subject: string;
    theory_marks: number;
    practical_marks: number;
    obtained_marks: number;
    total_marks: number;
    grade: string;
    grade_point: number;
    is_absent: boolean;
}

interface Props {
    student: {
        full_name: string;
        roll_number: string;
        class_name: string;
        section_name: string;
    };
    result: {
        id: number;
        exam_name: string;
        total_marks: number;
        obtained_marks: number;
        percentage: number;
        grade: string;
        gpa: number;
        class_position: number | null;
        section_position: number | null;
        remarks: string | null;
        pass_status: string;
    };
    marks: Mark[];
}

export default function ResultDetail({ student, result, marks }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Result Detail" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Link href={route('parent.exams.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{result.exam_name}</h1>
                            <p className="text-gray-600">Detailed Result for {student.full_name}</p>
                        </div>
                    </div>

                    {/* Student Info */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Student Name</p>
                                    <p className="font-semibold">{student.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Roll Number</p>
                                    <p className="font-semibold">{student.roll_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Class</p>
                                    <p className="font-semibold">{student.class_name} - {student.section_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <Badge
                                        className={
                                            result.pass_status === 'Pass'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }
                                    >
                                        {result.pass_status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overall Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-1">Total Marks</p>
                                <p className="text-2xl font-bold">{result.total_marks}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-1">Obtained</p>
                                <p className="text-2xl font-bold text-blue-600">{result.obtained_marks}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                                <p className="text-2xl font-bold text-purple-600">{result.percentage.toFixed(2)}%</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-1">Grade</p>
                                <p className="text-2xl font-bold text-green-600">{result.grade}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-1">GPA</p>
                                <p className="text-2xl font-bold text-indigo-600">{result.gpa.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Positions */}
                    {(result.class_position || result.section_position) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {result.section_position && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <Award className="h-10 w-10 text-yellow-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Section Position</p>
                                                <p className="text-2xl font-bold">#{result.section_position}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {result.class_position && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <Award className="h-10 w-10 text-orange-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Class Position</p>
                                                <p className="text-2xl font-bold">#{result.class_position}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Subject-wise Marks */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Subject-wise Marks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">Subject</th>
                                            <th className="text-center py-3 px-4">Theory</th>
                                            <th className="text-center py-3 px-4">Practical</th>
                                            <th className="text-center py-3 px-4">Obtained</th>
                                            <th className="text-center py-3 px-4">Total</th>
                                            <th className="text-center py-3 px-4">Grade</th>
                                            <th className="text-center py-3 px-4">GPA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marks.map((mark, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                                        {mark.subject}
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    {mark.is_absent ? (
                                                        <Badge variant="destructive">Absent</Badge>
                                                    ) : (
                                                        mark.theory_marks
                                                    )}
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    {mark.is_absent ? '-' : mark.practical_marks}
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    <span className="font-semibold text-blue-600">
                                                        {mark.is_absent ? 0 : mark.obtained_marks}
                                                    </span>
                                                </td>
                                                <td className="text-center py-3 px-4">{mark.total_marks}</td>
                                                <td className="text-center py-3 px-4">
                                                    <Badge
                                                        className={
                                                            mark.is_absent
                                                                ? 'bg-red-100 text-red-800'
                                                                : mark.grade === 'A+'
                                                                ? 'bg-green-100 text-green-800'
                                                                : mark.grade === 'A'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }
                                                    >
                                                        {mark.is_absent ? 'F' : mark.grade}
                                                    </Badge>
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    {mark.is_absent ? 0 : mark.grade_point.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Remarks */}
                    {result.remarks && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Remarks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{result.remarks}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
