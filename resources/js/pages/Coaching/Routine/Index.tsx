import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { useInstitute } from '@/hooks/useInstitute';
import {
    Calendar,
    Clock,
    Printer,
    Filter,
    GraduationCap,
    MapPin,
    Users,
    Layers,
    BookOpen,
    Sparkles,
} from 'lucide-react';

interface BatchScheduleItem {
    id: number;
    name: string;
    course_name: string;
    teacher_name: string;
    room_no: string;
    start_time: string;
    end_time: string;
    max_capacity: number;
    enrolled_count: number;
}

interface DaySchedule {
    day: {
        key: string;
        full: string;
        bangla: string;
    };
    batches: BatchScheduleItem[];
}

interface Props {
    scheduleByDay: Record<string, DaySchedule>;
    daysOfWeek: Array<{ key: string; full: string; bangla: string }>;
    rooms: string[];
    teachers: Array<{ id: number; name: string }>;
    filters: {
        teacher_id?: string;
        room_no?: string;
    };
    totalActiveBatches: number;
}

export default function RoutineIndex({
    scheduleByDay,
    daysOfWeek,
    rooms,
    teachers,
    filters,
    totalActiveBatches,
}: Props) {
    const institute = useInstitute();
    const [teacherFilter, setTeacherFilter] = useState(filters.teacher_id || '');
    const [roomFilter, setRoomFilter] = useState(filters.room_no || '');
    const [selectedMobileDay, setSelectedMobileDay] = useState(daysOfWeek[0]?.key || 'saturday');

    const handleFilterChange = (newTeacher: string, newRoom: string) => {
        setTeacherFilter(newTeacher);
        setRoomFilter(newRoom);
        router.get(
            route('coaching.routine.index'),
            {
                teacher_id: newTeacher || undefined,
                room_no: newRoom || undefined,
            },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Weekly Routine & Timetable - Coaching Management" />

            <div className="space-y-6">
                {/* Header (Hidden on Print) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                <Clock className="w-3.5 h-3.5" />
                                Class Timetable
                            </span>
                            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                {totalActiveBatches} Active Batches
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Weekly Batch Routine Matrix
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Comprehensive weekly class schedule organized across rooms, mentors, and time slots.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={handlePrint}
                            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs px-4 py-2 inline-flex items-center gap-2 shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print Routine
                        </Button>
                    </div>
                </div>

                {/* Filter Bar (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 print:hidden">
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            <Filter className="w-4 h-4 text-gray-400" />
                            Filters:
                        </div>

                        {/* Room Filter */}
                        <select
                            value={roomFilter}
                            onChange={(e) => handleFilterChange(teacherFilter, e.target.value)}
                            className="text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-1.5 px-3 font-medium text-gray-800 dark:text-gray-200"
                        >
                            <option value="">All Rooms</option>
                            {rooms.map((room) => (
                                <option key={room} value={room}>
                                    Room: {room}
                                </option>
                            ))}
                        </select>

                        {/* Teacher Filter */}
                        <select
                            value={teacherFilter}
                            onChange={(e) => handleFilterChange(e.target.value, roomFilter)}
                            className="text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-1.5 px-3 font-medium text-gray-800 dark:text-gray-200"
                        >
                            <option value="">All Mentors</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>

                        {(roomFilter || teacherFilter) && (
                            <button
                                type="button"
                                onClick={() => handleFilterChange('', '')}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Printable Weekly Routine Sheet */}
                <div className="print:p-0">
                    {/* Official Print Header */}
                    <div className="hidden print:block text-center border-b pb-4 mb-6">
                        {institute.logoUrl && (
                            <img
                                src={institute.logoUrl}
                                alt="Logo"
                                className="h-14 mx-auto mb-2 object-contain"
                            />
                        )}
                        <h2 className="text-xl font-bold uppercase text-gray-900">
                            {institute.name}
                        </h2>
                        {institute.address && (
                            <p className="text-xs text-gray-600">{institute.address}</p>
                        )}
                        <h3 className="mt-2 text-sm font-bold text-gray-800">
                            MASTER CLASS TIMETABLE & ROUTINE
                        </h3>
                    </div>

                    {/* Mobile App-Style Day Tab Selector (< 768px, hidden on print) */}
                    <div className="block md:hidden print:hidden space-y-4 mb-6">
                        {/* Scrollable Day Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                            {daysOfWeek.map((day) => {
                                const count = scheduleByDay[day.key]?.batches?.length || 0;
                                const isSelected = selectedMobileDay === day.key;
                                return (
                                    <button
                                        key={day.key}
                                        type="button"
                                        onClick={() => setSelectedMobileDay(day.key)}
                                        className={`flex flex-col items-center min-w-[72px] py-2 px-2.5 rounded-xl border text-xs transition-all shrink-0 active:scale-95 ${
                                            isSelected
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-semibold'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="font-semibold">{day.full.slice(0, 3)}</span>
                                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                                            {count} cls
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected Day Header & Cards Feed */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                        {scheduleByDay[selectedMobileDay]?.day.full}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {scheduleByDay[selectedMobileDay]?.day.bangla}
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {scheduleByDay[selectedMobileDay]?.batches.length || 0} Batches
                                </span>
                            </div>

                            {/* Batch Cards for Selected Mobile Day */}
                            <div className="space-y-2.5">
                                {(scheduleByDay[selectedMobileDay]?.batches.length || 0) > 0 ? (
                                    scheduleByDay[selectedMobileDay]?.batches.map((batch) => (
                                        <div
                                            key={batch.id}
                                            className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-2.5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {batch.start_time} - {batch.end_time}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Seats: {batch.enrolled_count}/{batch.max_capacity}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {batch.name}
                                                </p>
                                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                    {batch.course_name}
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1 truncate mr-2">
                                                    <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{batch.teacher_name}</span>
                                                </div>
                                                <span className="inline-flex items-center gap-1 shrink-0 font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    {batch.room_no}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-400">
                                        No classes scheduled for {scheduleByDay[selectedMobileDay]?.day.full}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 7-Day Matrix Columns (Desktop >= 768px and Print) */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-7 gap-4 print:grid print:grid-cols-7 print:gap-2">
                        {daysOfWeek.map((day) => {
                            const dayData = scheduleByDay[day.key];
                            const batches = dayData?.batches || [];

                            return (
                                <div
                                    key={day.key}
                                    className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden print:border-gray-300 print:bg-white"
                                >
                                    {/* Column Header */}
                                    <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-center print:border-gray-300">
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white print:text-black">
                                            {day.full}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                                            {day.bangla}
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 print:hidden">
                                            {batches.length} {batches.length === 1 ? 'Class' : 'Classes'}
                                        </span>
                                    </div>

                                    {/* Batch Cards for this Day */}
                                    <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                                        {batches.length > 0 ? (
                                            batches.map((batch) => (
                                                <div
                                                    key={batch.id}
                                                    className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs text-xs space-y-1.5 hover:border-indigo-300 transition print:shadow-none print:border-gray-300"
                                                >
                                                    {/* Time Badge */}
                                                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 print:text-indigo-800">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {batch.start_time} - {batch.end_time}
                                                        </span>
                                                    </div>

                                                    {/* Course & Batch Name */}
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1 print:text-black">
                                                            {batch.name}
                                                        </p>
                                                        <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 print:text-emerald-700 line-clamp-1">
                                                            {batch.course_name}
                                                        </p>
                                                    </div>

                                                    {/* Room & Mentor */}
                                                    <div className="pt-1.5 border-t border-gray-100 dark:border-gray-700/60 text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5 print:text-gray-700">
                                                        <div className="flex items-center gap-1">
                                                            <GraduationCap className="w-3 h-3 text-gray-400" />
                                                            <span className="truncate">{batch.teacher_name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                                {batch.room_no}
                                                            </span>
                                                            <span className="text-gray-400 print:hidden">
                                                                {batch.enrolled_count}/{batch.max_capacity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-[11px] text-gray-400 dark:text-gray-500 italic print:py-4">
                                                No classes
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Print Footer */}
                    <div className="hidden print:block mt-12 pt-4 border-t border-gray-300 text-xs">
                        <div className="flex justify-between items-end pt-10">
                            <div className="text-center border-t border-gray-400 pt-1 w-44">
                                Routine Coordinator
                            </div>
                            <div className="text-center border-t border-gray-400 pt-1 w-44">
                                Academic Incharge
                            </div>
                            <div className="text-center border-t border-gray-400 pt-1 w-44">
                                Principal / Director
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
