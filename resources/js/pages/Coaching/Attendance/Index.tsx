import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCheck,
    UserX,
    FileText,
    ArrowRight,
    MapPin,
    GraduationCap,
} from 'lucide-react';

interface BatchAttendanceItem {
    id: number;
    name: string;
    course_name: string;
    teacher_name: string;
    room_no: string | null;
    start_time: string | null;
    end_time: string | null;
    formatted_schedule: string;
    is_scheduled_today: boolean;
    enrolled_count: number;
    attendances_count: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    status: 'completed' | 'pending' | 'unscheduled';
}

interface Props {
    batches: BatchAttendanceItem[];
    date: string;
    dayName: string;
    summary: {
        total_scheduled: number;
        completed: number;
        pending: number;
        total_present: number;
        total_absent: number;
    };
    filters: {
        search?: string;
        date: string;
    };
}

export default function AttendanceIndex({ batches, date, dayName, summary, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'pending'>('all');

    const handleDateChange = (newDate: string) => {
        router.get(
            route('coaching.attendance.index'),
            { date: newDate, search },
            { preserveState: true, replace: true }
        );
    };

    const handlePreviousDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        handleDateChange(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        handleDateChange(d.toISOString().split('T')[0]);
    };

    const handleToday = () => {
        const today = new Date().toISOString().split('T')[0];
        handleDateChange(today);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('coaching.attendance.index'),
            { date, search },
            { preserveState: true, replace: true }
        );
    };

    const filteredBatches = batches.filter((b) => {
        if (statusFilter === 'scheduled') return b.is_scheduled_today;
        if (statusFilter === 'completed') return b.status === 'completed';
        if (statusFilter === 'pending') return b.status === 'pending';
        return true;
    });

    const isToday = date === new Date().toISOString().split('T')[0];

    return (
        <AuthenticatedLayout>
            <Head title="Batch Attendance - Coaching Management" />

            <div className="space-y-6">
                {/* Header & Date Controller */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <UserCheck className="w-3.5 h-3.5" />
                                Coaching Management
                            </span>
                            {isToday && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                                    Today
                                </span>
                            )}
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Batch Attendance Hub
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Daily class attendance tracking and session logs for active coaching batches.
                        </p>
                    </div>

                    {/* Date Navigator Bar */}
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handlePreviousDay}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title="Previous Day"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 px-2">
                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="border-0 bg-transparent text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 cursor-pointer p-0"
                            />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
                                {dayName}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextDay}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title="Next Day"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {!isToday && (
                            <button
                                type="button"
                                onClick={handleToday}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition"
                            >
                                Today
                            </button>
                        )}
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-gray-800 border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Scheduled Today</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_scheduled}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-800 border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.completed}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-gray-800 border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.pending}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-teal-50/50 to-white dark:from-teal-950/20 dark:to-gray-800 border-teal-100 dark:border-teal-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Students Present</p>
                                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{summary.total_present}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-gray-800 border-rose-100 dark:border-rose-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                                <UserX className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Students Absent</p>
                                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{summary.total_absent}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                statusFilter === 'all'
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            All Batches ({batches.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('scheduled')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                statusFilter === 'scheduled'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            Scheduled Today ({summary.total_scheduled})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                statusFilter === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            Completed ({summary.completed})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            Pending ({summary.pending})
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search batch or course..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </form>
                </div>

                {/* Batch Attendance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredBatches.map((batch) => {
                        const isDone = batch.status === 'completed';
                        const isPending = batch.status === 'pending';

                        return (
                            <Card
                                key={batch.id}
                                className={`overflow-hidden border transition duration-200 hover:shadow-md ${
                                    isDone
                                        ? 'border-emerald-200 dark:border-emerald-800/40 bg-white dark:bg-gray-800'
                                        : isPending
                                        ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/20 dark:bg-gray-800'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-80'
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 mb-1">
                                                {batch.course_name}
                                            </span>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                {batch.name}
                                            </h3>
                                        </div>

                                        {/* Status Badge */}
                                        {isDone ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Done
                                            </span>
                                        ) : isPending ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
                                                <Clock className="w-3.5 h-3.5" />
                                                Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                Off-day
                                            </span>
                                        )}
                                    </div>

                                    {/* Schedule Details */}
                                    <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span>Mentor: <strong>{batch.teacher_name}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>{batch.formatted_schedule || 'No timing set'}</span>
                                        </div>
                                        {batch.room_no && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>Room: {batch.room_no}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enrolled & Attendance Bar */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" /> Enrolled: {batch.enrolled_count} students
                                            </span>
                                            {isDone && (
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {batch.present_count} Present • {batch.absent_count} Absent
                                                </span>
                                            )}
                                        </div>

                                        {isDone && batch.enrolled_count > 0 && (
                                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                                <div
                                                    className="bg-emerald-500 h-full"
                                                    style={{ width: `${(batch.present_count / batch.enrolled_count) * 100}%` }}
                                                    title={`Present: ${batch.present_count}`}
                                                />
                                                <div
                                                    className="bg-rose-500 h-full"
                                                    style={{ width: `${(batch.absent_count / batch.enrolled_count) * 100}%` }}
                                                    title={`Absent: ${batch.absent_count}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                                    <Link
                                        href={route('coaching.attendance.report', batch.id)}
                                        className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Monthly Sheet
                                    </Link>

                                    <Link
                                        href={route('coaching.attendance.sheet', { batch: batch.id, date })}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
                                            isDone
                                                ? 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                                                : isPending
                                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                    >
                                        {isDone ? (
                                            <>
                                                Edit Attendance
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </>
                                        ) : (
                                            <>
                                                Take Attendance
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </Link>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {filteredBatches.length === 0 && (
                    <Card className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No batches found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            No batches match your search criteria or selected filter for this day.
                        </p>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
