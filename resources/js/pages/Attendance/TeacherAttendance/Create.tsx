import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    user: User;
    attendance?: Array<{
        id: number;
        status: string;
        check_in_time: string;
        check_out_time: string;
    }>;
}

interface Props {
    teachers: Teacher[];
    date: string;
}

export default function Create({ teachers, date }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>(date);
    const [attendanceData, setAttendanceData] = useState<Record<number, {
        status: string;
        check_in_time: string;
        check_out_time: string;
    }>>({});

    const { post, processing } = useForm();

    useEffect(() => {
        // Initialize attendance data
        const initialData: Record<number, any> = {};
        teachers.forEach((teacher) => {
            if (teacher.attendance && teacher.attendance.length > 0) {
                const att = teacher.attendance[0];
                initialData[teacher.id] = {
                    status: att.status,
                    check_in_time: att.check_in_time || '09:00',
                    check_out_time: att.check_out_time || '17:00',
                };
            } else {
                initialData[teacher.id] = {
                    status: 'present',
                    check_in_time: '09:00',
                    check_out_time: '17:00',
                };
            }
        });
        setAttendanceData(initialData);
    }, [teachers]);

    const handleStatusChange = (teacherId: number, status: string) => {
        console.log(`📝 Status changed for Teacher ${teacherId}:`, status);
        setAttendanceData(prev => ({
            ...prev,
            [teacherId]: {
                ...prev[teacherId],
                status
            }
        }));
    };

    const handleTimeChange = (teacherId: number, field: 'check_in_time' | 'check_out_time', value: string) => {
        console.log(`🕐 ${field} changed for Teacher ${teacherId}:`, value);
        setAttendanceData(prev => ({
            ...prev,
            [teacherId]: {
                ...prev[teacherId],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('💾 Submit clicked');
        console.log('📅 Selected Date:', selectedDate);
        console.log('📊 Current Attendance Data:', attendanceData);

        const attendances = Object.entries(attendanceData).map(([teacherId, data]) => ({
            teacher_id: parseInt(teacherId),
            status: data.status,
            check_in_time: data.check_in_time,
            check_out_time: data.check_out_time,
            remarks: null
        }));

        const payload = {
            date: selectedDate,
            attendances: attendances
        };

        console.log('🚀 Full Payload:', payload);
        console.log('🌐 Posting to: /teacher-attendance');

        post('/teacher-attendance', {
            data: payload,
            onBefore: () => {
                console.log('⏳ Starting request...');
            },
            onSuccess: (response) => {
                console.log('✅ Attendance saved successfully!', response);
            },
            onError: (errors) => {
                console.error('❌ Validation errors:', errors);
            },
            onFinish: () => {
                console.log('🏁 Request finished');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mark Teacher Attendance" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Mark Teacher Attendance</h1>
                    <Button variant="secondary" onClick={() => router.get('/teacher-attendance')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    console.log('📅 Date changed:', e.target.value);
                                    setSelectedDate(e.target.value);
                                }}
                                className="max-w-xs"
                            />
                        </div>

                        {teachers.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher Name</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Check In</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teachers.map((teacher) => (
                                            <tr key={teacher.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.first_name} {teacher.last_name}
                                                    <span className="text-gray-500 ml-2">({teacher.employee_id})</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        {['present', 'absent', 'late', 'leave', 'half_day', 'holiday'].map((status) => (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                onClick={() => handleStatusChange(teacher.id, status)}
                                                                className={`px-3 py-1 rounded text-xs font-medium ${
                                                                    attendanceData[teacher.id]?.status === status
                                                                        ? status === 'present'
                                                                            ? 'bg-green-500 text-white'
                                                                            : status === 'absent'
                                                                            ? 'bg-red-500 text-white'
                                                                            : status === 'late'
                                                                            ? 'bg-yellow-500 text-white'
                                                                            : status === 'leave'
                                                                            ? 'bg-blue-500 text-white'
                                                                            : status === 'half_day'
                                                                            ? 'bg-orange-500 text-white'
                                                                            : 'bg-purple-500 text-white'
                                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                }`}
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Input
                                                        type="time"
                                                        value={attendanceData[teacher.id]?.check_in_time || '09:00'}
                                                        onChange={(e) => handleTimeChange(teacher.id, 'check_in_time', e.target.value)}
                                                        className="w-32"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Input
                                                        type="time"
                                                        value={attendanceData[teacher.id]?.check_out_time || '17:00'}
                                                        onChange={(e) => handleTimeChange(teacher.id, 'check_out_time', e.target.value)}
                                                        className="w-32"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {teachers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No active teachers found
                            </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button type="button" variant="secondary" onClick={() => router.get('/teacher-attendance')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || teachers.length === 0}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Attendance'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
