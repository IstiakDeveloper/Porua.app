import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Layers, ArrowLeft, Save, Clock, Calendar, Users, MapPin, BookOpen } from 'lucide-react';

interface Course {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props {
    courses: Course[];
    teachers: Teacher[];
    selectedCourseId?: string | number;
}

const ALL_DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Create({ courses, teachers, selectedCourseId }: Props) {
    const [courseId, setCourseId] = useState<string | number>(selectedCourseId || '');
    const [name, setName] = useState('');
    const [teacherId, setTeacherId] = useState<string | number>('');
    const [roomNo, setRoomNo] = useState('');
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>(['Saturday', 'Monday', 'Wednesday']);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:30');
    const [maxCapacity, setMaxCapacity] = useState('30');
    const [remunerationType, setRemunerationType] = useState<'none' | 'percentage' | 'per_class' | 'fixed'>('percentage');
    const [teacherCommissionRate, setTeacherCommissionRate] = useState('50');
    const [status, setStatus] = useState<'active' | 'completed' | 'upcoming' | 'cancelled'>('active');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const toggleDay = (day: string) => {
        if (daysOfWeek.includes(day)) {
            setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
        } else {
            setDaysOfWeek([...daysOfWeek, day]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/batches', {
            course_id: courseId,
            name,
            teacher_id: teacherId || null,
            room_no: roomNo || null,
            days_of_week: daysOfWeek,
            start_time: startTime || null,
            end_time: endTime || null,
            max_capacity: Number(maxCapacity) || 30,
            remuneration_type: remunerationType,
            teacher_commission_rate: Number(teacherCommissionRate) || 0,
            status,
            notes: notes || null,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Coaching Batch" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/batches"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
                            <p className="text-sm text-gray-500">
                                Configure batch timing, days, teacher mentor, and student capacity
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card title="Batch Setup">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Associated Course *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={courseId}
                                        onChange={(e) => setCourseId(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                        required
                                    >
                                        <option value="">Select a Course</option>
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Batch Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Morning Shift A (Sat-Mon-Wed)"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Assigned Teacher / Instructor
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={teacherId}
                                        onChange={(e) => setTeacherId(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Instructor (Optional)</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.first_name} {t.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Classroom / Room No
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={roomNo}
                                        onChange={(e) => setRoomNo(e.target.value)}
                                        placeholder="e.g. Room 201 / Lab 2"
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Days of the Week
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_DAYS.map((day) => {
                                        const isSelected = daysOfWeek.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Start Time
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    End Time
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Maximum Student Capacity *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={maxCapacity}
                                    onChange={(e) => setMaxCapacity(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Batch Status *
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full py-2.5 px-3.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Teacher Remuneration Section */}
                            <div className="md:col-span-2 p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-indigo-950 flex items-center gap-1.5">
                                        <span>Teacher Remuneration & Commission Model</span>
                                    </h4>
                                    <p className="text-xs text-indigo-700 mt-0.5">
                                        Define how the batch mentor teacher is compensated (revenue share, fixed stipend, or standard salary).
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                            Remuneration Method
                                        </label>
                                        <select
                                            value={remunerationType}
                                            onChange={(e) => setRemunerationType(e.target.value as any)}
                                            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                        >
                                            <option value="percentage">Percentage Share (% of Batch Collection)</option>
                                            <option value="fixed">Fixed Monthly Honorarium (BDT)</option>
                                            <option value="per_class">Per Class / Lecture Rate (BDT)</option>
                                            <option value="none">No Batch Commission (Regular Salary)</option>
                                        </select>
                                    </div>

                                    {remunerationType !== 'none' && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                                {remunerationType === 'percentage' ? 'Commission Rate (%)' : 'Amount (BDT)'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step={remunerationType === 'percentage' ? '0.5' : '10'}
                                                    value={teacherCommissionRate}
                                                    onChange={(e) => setTeacherCommissionRate(e.target.value)}
                                                    placeholder={remunerationType === 'percentage' ? '50' : '5000'}
                                                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-gray-400">
                                                    {remunerationType === 'percentage' ? '%' : 'BDT'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Any batch-specific requirements, remarks, or instructions..."
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href="/batches">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Save & Open Batch'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
