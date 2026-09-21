import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Select from '@/Components/Select';
import { Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react';

interface Child {
    id: number;
    full_name: string;
}

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
    class_name: string;
    section_name: string;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
}

interface Result {
    id: number;
    exam: {
        name: string;
    };
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    grade: string;
    gpa: number;
    pass_status: string;
    created_at: string;
}

interface Props {
    student: Student;
    children: Child[];
    upcomingExams: Exam[];
    results: Result[];
}

export default function Index({ student, children, upcomingExams, results }: Props) {
    const handleStudentChange = (studentId: string) => {
        router.get(route('parent.exams.index'), { student_id: studentId });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Exams & Results" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Exams & Results</h1>
                        <p className="text-gray-600">View upcoming exams and published results</p>
                    </div>

                    {/* Student Selector */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Select
                                        label="Select Child"
                                        value={student.id.toString()}
                                        onChange={(e) => handleStudentChange(e.target.value)}
                                        options={children.map((child) => ({
                                            value: child.id.toString(),
                                            label: child.full_name
                                        }))}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="text-sm">
                                        <p className="text-gray-600">Class</p>
                                        <p className="font-medium">{student.class_name} - {student.section_name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Upcoming Exams */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Exams</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {upcomingExams.length > 0 ? (
                                        <div className="space-y-3">
                                            {upcomingExams.map((exam) => (
                                                <Card key={exam.id} className="border">
                                                    <CardContent className="p-4">
                                                        <h4 className="font-semibold mb-2">{exam.name}</h4>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(exam.exam_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                {exam.start_time} - {exam.end_time}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No upcoming exams</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Published Results */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Published Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {results.length > 0 ? (
                                        <div className="space-y-4">
                                            {results.map((result) => (
                                                <Card key={result.id} className="border">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="font-semibold text-lg mb-1">
                                                                    {result.exam.name}
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    Published: {new Date(result.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
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

                                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                                <p className="text-xs text-gray-600 mb-1">Total Marks</p>
                                                                <p className="text-lg font-bold">{result.total_marks}</p>
                                                            </div>
                                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                                <p className="text-xs text-gray-600 mb-1">Obtained</p>
                                                                <p className="text-lg font-bold text-blue-600">
                                                                    {result.obtained_marks}
                                                                </p>
                                                            </div>
                                                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                                <p className="text-xs text-gray-600 mb-1">Percentage</p>
                                                                <p className="text-lg font-bold text-purple-600">
                                                                    {result.percentage.toFixed(2)}%
                                                                </p>
                                                            </div>
                                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                                <p className="text-xs text-gray-600 mb-1">Grade</p>
                                                                <p className="text-lg font-bold text-green-600">
                                                                    {result.grade}
                                                                </p>
                                                            </div>
                                                            <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                                                <p className="text-xs text-gray-600 mb-1">GPA</p>
                                                                <p className="text-lg font-bold text-indigo-600">
                                                                    {result.gpa.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <Link href={route('parent.exams.result', result.id)}>
                                                            <Button variant="outline" className="w-full">
                                                                <BookOpen className="h-4 w-4 mr-2" />
                                                                View Detailed Result
                                                            </Button>
                                                        </Link>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No published results available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
