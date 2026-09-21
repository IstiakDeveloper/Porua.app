import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { Save, ArrowLeft, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SchoolClass {
    id: number;
    name: string;
    class_numeric: number;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface User {
    id: number;
    name: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    roll_number: string;
    user: User;
    attendance?: Array<{
        id: number;
        status: string;
        date: string;
    }>;
}

interface Props {
    classes: SchoolClass[];
    sections: Section[];
}

export default function Create({ classes, sections }: Props) {
    const [selectedClass, setSelectedClass] = useState<number | ''>('');
    const [selectedSection, setSelectedSection] = useState<number | ''>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});

    const filteredSections = selectedClass
        ? sections.filter(s => s.class_id === selectedClass)
        : [];

    const { data, setData, post, errors, processing } = useForm({
        date: selectedDate,
        attendances: [] as Array<{ student_id: number; status: string }>
    });

    useEffect(() => {
        setData('date', selectedDate);
    }, [selectedDate]);

    const loadStudents = async () => {
        console.log('🔄 Load Students clicked');
        console.log('📋 Selected Class:', selectedClass);
        console.log('📋 Selected Section:', selectedSection);
        console.log('📅 Selected Date:', selectedDate);

        if (!selectedClass || !selectedSection) {
            console.warn('⚠️ Class or Section not selected');
            alert('Please select both class and section');
            return;
        }

        setLoading(true);
        console.log('⏳ Loading students...');

        try {
            const url = `/student-attendance/students?class_id=${selectedClass}&section_id=${selectedSection}&date=${selectedDate}`;
            console.log('🌐 API URL:', url);

            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log('📡 Response Status:', response.status);
            console.log('📡 Response OK:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const studentsData = await response.json();
            console.log('✅ Students Loaded:', studentsData.length, 'students');
            console.log('📊 First Student Sample:', studentsData[0]);

            setStudents(studentsData);

            // Pre-fill attendance data
            const initialAttendance: Record<number, string> = {};
            studentsData.forEach((student: Student) => {
                if (student.attendance && student.attendance.length > 0) {
                    initialAttendance[student.id] = student.attendance[0].status;
                    console.log(`📝 Pre-filled Student ${student.id}:`, student.attendance[0].status);
                } else {
                    initialAttendance[student.id] = 'present';
                }
            });
            setAttendanceData(initialAttendance);
            console.log('✅ Attendance data initialized:', Object.keys(initialAttendance).length, 'records');

        } catch (error) {
            console.error('❌ Failed to load students:', error);
            alert('Failed to load students: ' + (error as Error).message);
        } finally {
            setLoading(false);
            console.log('✅ Loading complete');
        }
    };

    const handleStatusChange = (studentId: number, status: string) => {
        console.log(`📝 Status changed for Student ${studentId}:`, status);
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('💾 Submit clicked');
        console.log('📊 Current Attendance Data:', attendanceData);
        console.log('📅 Selected Date:', selectedDate);
        console.log('🏫 Selected Class:', selectedClass);
        console.log('📚 Selected Section:', selectedSection);

        if (!selectedClass || !selectedSection) {
            console.error('❌ Class or Section not selected!');
            alert('Please select class and section');
            return;
        }

        const attendances = Object.entries(attendanceData).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status
        }));

        console.log('📤 Submitting attendances:', attendances.length, 'records');

        const payload = {
            date: selectedDate,
            class_id: selectedClass,
            section_id: selectedSection,
            attendances: attendances
        };

        console.log('🚀 Full Payload:', payload);
        console.log('🌐 Posting to: /student-attendance');

        post('/student-attendance', {
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
            <Head title="Mark Student Attendance" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Mark Student Attendance</h1>
                    <Button variant="secondary" onClick={() => router.get('/teacher-attendance?report_type=student')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    console.log('📅 Date changed:', e.target.value);
                                    setSelectedDate(e.target.value);
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={selectedClass}
                                onChange={(e) => {
                                    const value = e.target.value ? Number(e.target.value) : '';
                                    console.log('🏫 Class changed:', value);
                                    setSelectedClass(value);
                                    setSelectedSection('');
                                    setStudents([]);
                                }}
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <select
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={selectedSection}
                                onChange={(e) => {
                                    const value = e.target.value ? Number(e.target.value) : '';
                                    console.log('📚 Section changed:', value);
                                    setSelectedSection(value);
                                    setStudents([]);
                                }}
                                disabled={!selectedClass}
                            >
                                <option value="">Select Section</option>
                                {filteredSections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                type="button"
                                onClick={loadStudents}
                                disabled={!selectedClass || !selectedSection || loading}
                                className="w-full"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                {loading ? 'Loading...' : 'Load Students'}
                            </Button>
                        </div>
                    </div>

                    {students.length > 0 && (
                        <form onSubmit={handleSubmit}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.roll_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.first_name} {student.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        {['present', 'absent', 'late', 'excused'].map((status) => (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                onClick={() => handleStatusChange(student.id, status)}
                                                                className={`px-3 py-1 rounded text-sm font-medium ${
                                                                    attendanceData[student.id] === status
                                                                        ? status === 'present'
                                                                            ? 'bg-green-500 text-white'
                                                                            : status === 'absent'
                                                                            ? 'bg-red-500 text-white'
                                                                            : status === 'late'
                                                                            ? 'bg-yellow-500 text-white'
                                                                            : 'bg-blue-500 text-white'
                                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                }`}
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <Button type="button" variant="secondary" onClick={() => router.get('/teacher-attendance?report_type=student')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save Attendance'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {students.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            Select class and section, then click "Load Students" to mark attendance
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
