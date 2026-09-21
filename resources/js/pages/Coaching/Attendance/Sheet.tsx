import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    GraduationCap,
    MapPin,
    Save,
    UserCheck,
    Users,
    UserX,
    AlertCircle,
    Info,
} from 'lucide-react';

interface StudentAttendanceRow {
    id: number;
    batch_enrollment_id: number;
    name: string;
    admission_number: string | number;
    phone: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks: string;
    past_attendance_rate: number;
    past_classes: number;
}

interface BatchInfo {
    id: number;
    name: string;
    course_name: string;
    teacher_name: string;
    room_no: string | null;
    formatted_schedule: string;
}

interface Props {
    batch: BatchInfo;
    students: StudentAttendanceRow[];
    date: string;
    isTaken: boolean;
}

export default function AttendanceSheet({ batch, students, date, isTaken }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        date: date,
        attendances: students.map((s) => ({
            student_id: s.id,
            batch_enrollment_id: s.batch_enrollment_id,
            status: s.status,
            remarks: s.remarks || '',
        })),
    });

    const setAllStatus = (newStatus: 'present' | 'absent') => {
        setData(
            'attendances',
            data.attendances.map((item) => ({
                ...item,
                status: newStatus,
            }))
        );
    };

    const updateStudentStatus = (studentId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
        setData(
            'attendances',
            data.attendances.map((item) =>
                item.student_id === studentId ? { ...item, status } : item
            )
        );
    };

    const updateStudentRemarks = (studentId: number, remarks: string) => {
        setData(
            'attendances',
            data.attendances.map((item) =>
                item.student_id === studentId ? { ...item, remarks } : item
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('coaching.attendance.save', batch.id));
    };

    // Live counts
    const presentCount = data.attendances.filter((a) => a.status === 'present').length;
    const absentCount = data.attendances.filter((a) => a.status === 'absent').length;
    const lateCount = data.attendances.filter((a) => a.status === 'late').length;
    const excusedCount = data.attendances.filter((a) => a.status === 'excused').length;

    return (
        <AuthenticatedLayout>
            <Head title={`Take Attendance - ${batch.name}`} />

            <div className="space-y-6">
                {/* Header with Batch Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link
                                href={route('coaching.attendance.index', { date })}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Attendance Hub
                            </Link>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {batch.course_name}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            {batch.name} — Attendance Sheet
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                Session Date: <strong>{date}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                                Mentor: {batch.teacher_name}
                            </span>
                            {batch.room_no && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        Room: {batch.room_no}
                                    </span>
                                </>
                            )}
                            {batch.formatted_schedule && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {batch.formatted_schedule}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {isTaken && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            <Check className="w-4 h-4" />
                            Attendance previously recorded for this date. Updating will override.
                        </div>
                    )}
                </div>

                {/* Live Counter & Quick Toggles */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Counters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            <Users className="w-3.5 h-3.5 text-gray-500" />
                            Total: {students.length}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Present: {presentCount}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <UserX className="w-3.5 h-3.5 text-rose-600" />
                            Absent: {absentCount}
                        </div>
                        {lateCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Late: {lateCount}
                            </div>
                        )}
                        {excusedCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                <Info className="w-3.5 h-3.5 text-blue-600" />
                                Excused: {excusedCount}
                            </div>
                        )}
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setAllStatus('present')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 transition"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Mark All Present
                        </button>
                        <button
                            type="button"
                            onClick={() => setAllStatus('absent')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 transition"
                        >
                            <UserX className="w-3.5 h-3.5" />
                            Mark All Absent
                        </button>
                    </div>
                </div>

                {/* Form & Student Table */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-gray-800/80 text-xs uppercase text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th scope="col" className="px-5 py-3 w-16 text-center">#</th>
                                        <th scope="col" className="px-5 py-3">Student Name</th>
                                        <th scope="col" className="px-5 py-3">ID / Roll</th>
                                        <th scope="col" className="px-5 py-3">Phone</th>
                                        <th scope="col" className="px-5 py-3 text-center">Past Rate</th>
                                        <th scope="col" className="px-5 py-3 text-center w-72">Status</th>
                                        <th scope="col" className="px-5 py-3">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {students.map((student, idx) => {
                                        const currentStatus =
                                            data.attendances.find((a) => a.student_id === student.id)?.status || 'present';
                                        const currentRemarks =
                                            data.attendances.find((a) => a.student_id === student.id)?.remarks || '';

                                        return (
                                            <tr
                                                key={student.id}
                                                className={`transition hover:bg-gray-50/70 dark:hover:bg-gray-700/30 ${
                                                    currentStatus === 'absent'
                                                        ? 'bg-rose-50/20 dark:bg-rose-950/10'
                                                        : currentStatus === 'late'
                                                        ? 'bg-amber-50/20 dark:bg-amber-950/10'
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-5 py-4 text-center font-medium text-gray-500 text-xs">
                                                    {idx + 1}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {student.name}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                    {student.admission_number}
                                                </td>

                                                <td className="px-5 py-4 text-xs text-gray-500">
                                                    {student.phone}
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                                            student.past_attendance_rate >= 80
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : student.past_attendance_rate >= 60
                                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}
                                                        title={`${student.past_classes} previous classes recorded`}
                                                    >
                                                        {student.past_attendance_rate}%
                                                    </span>
                                                </td>

                                                {/* Status Selector Pill Buttons */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStudentStatus(student.id, 'present')}
                                                            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition ${
                                                                currentStatus === 'present'
                                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            P
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => updateStudentStatus(student.id, 'absent')}
                                                            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition ${
                                                                currentStatus === 'absent'
                                                                    ? 'bg-rose-600 text-white shadow-sm'
                                                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            A
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => updateStudentStatus(student.id, 'late')}
                                                            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition ${
                                                                currentStatus === 'late'
                                                                    ? 'bg-amber-500 text-white shadow-sm'
                                                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            L
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => updateStudentStatus(student.id, 'excused')}
                                                            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition ${
                                                                currentStatus === 'excused'
                                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            E
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Remarks */}
                                                <td className="px-5 py-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Optional notes..."
                                                        value={currentRemarks}
                                                        onChange={(e) => updateStudentRemarks(student.id, e.target.value)}
                                                        className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-transparent py-1 px-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {students.length === 0 && (
                            <div className="p-10 text-center">
                                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No active students in this batch</h4>
                                <p className="text-xs text-gray-500 mt-1">Enroll students into this batch before taking attendance.</p>
                            </div>
                        )}

                        {/* Sticky Action Footer */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <strong>{students.length}</strong> students ready to record.
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('coaching.attendance.index', { date })}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    Cancel
                                </Link>

                                <Button
                                    type="submit"
                                    disabled={processing || students.length === 0}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 inline-flex items-center gap-2 shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Attendance'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
