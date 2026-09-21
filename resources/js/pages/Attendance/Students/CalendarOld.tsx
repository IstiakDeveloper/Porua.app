import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import AttendanceCalendar from '@/Components/AttendanceCalendar';
import { ArrowLeft, List, BookOpen, GraduationCap } from 'lucide-react';
import Button from '@/Components/Button';

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Props {
    attendanceData: Record<string, { status: string; count: number; details: any }>;
    year: number;
    month: number;
    classes: SchoolClass[];
    sections: Section[];
    filters: {
        class_id?: string;
        section_id?: string;
    };
}

export default function Calendar({ attendanceData, year, month, classes, sections, filters }: Props) {
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');

    const handleDateSelect = (date: string) => {
        router.get('/student-attendance', {
            date,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined
        });
    };

    const handleFilterChange = () => {
        router.get('/student-attendance/calendar', {
            year,
            month,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined
        }, { preserveState: true });
    };

    const currentDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const filteredSections = selectedClass
        ? sections.filter(s => s.class_id.toString() === selectedClass)
        : sections;

    return (
        <AuthenticatedLayout>
            <Head title="Student Attendance Calendar" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Student Attendance Calendar
                        </h1>
                        <p className="text-gray-600 mt-1">Monthly overview of student attendance</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/student-attendance">
                            <Button variant="outline" icon={<List className="w-5 h-5" />}>
                                List View
                            </Button>
                        </Link>
                        <Link href="/student-attendance">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Class & Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <BookOpen className="inline h-4 w-4 mr-1 text-blue-600" />
                                Class
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        Class {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <GraduationCap className="inline h-4 w-4 mr-1 text-blue-600" />
                                Section
                            </label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">All Sections</option>
                                {filteredSections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        Section {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={handleFilterChange} className="w-full">
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <AttendanceCalendar
                    currentDate={currentDate}
                    attendanceData={attendanceData}
                    onDateSelect={handleDateSelect}
                    type="student"
                />

                {/* Summary Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600">Total Present Days</p>
                            <p className="text-2xl font-bold text-green-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'present').length}
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-gray-600">Total Absent Days</p>
                            <p className="text-2xl font-bold text-red-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'absent').length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-600">Total Late Days</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'late').length}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-600">Total Excused Days</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {Object.values(attendanceData).filter((d: any) => d.status === 'excused').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
