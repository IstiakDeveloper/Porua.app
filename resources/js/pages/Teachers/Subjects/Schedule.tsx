import { Head } from '@inertiajs/react';
import { Calendar, BookOpen, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';

interface Schedule {
    id: number;
    subject: { id: number; name: string; code: string };
    class: { id: number; name: string };
    section: { id: number; name: string; student_count: number };
}

interface Props {
    teacher: { id: number; name: string; employee_id: string };
    schedule: Schedule[];
}

export default function Schedule({ teacher, schedule }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Schedule: ${teacher.name}`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Teacher Schedule</h1>
                    <p className="text-sm text-gray-600 mt-1">{teacher.name} ({teacher.employee_id})</p>
                </div>

                {schedule.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schedule.map((item) => (
                            <Card key={item.id} padding="md">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-indigo-100 rounded-lg p-3">
                                        <BookOpen className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.subject.name}</h3>
                                        <p className="text-sm text-gray-600">{item.subject.code}</p>
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {item.class.name} - {item.section.name}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                <Badge variant="info">{item.section.student_count} Students</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <p className="text-gray-500 text-center py-12">No schedule found for this teacher</p>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
