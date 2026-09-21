import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarDay {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    status?: string;
    count?: number;
}

interface AttendanceCalendarProps {
    currentDate: string;
    attendanceData: Record<string, { status: string; count?: number }>;
    onDateSelect: (date: string) => void;
    type?: 'teacher' | 'student';
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceCalendar({
    currentDate,
    attendanceData,
    onDateSelect,
    type = 'teacher'
}: AttendanceCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date(currentDate));

    const getCalendarDays = (): CalendarDay[] => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevMonthLastDay = new Date(year, month, 0);

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Previous month days
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay.getDate() - i;
            const date = new Date(year, month - 1, day);
            const dateStr = date.toISOString().split('T')[0];

            days.push({
                date: dateStr,
                day,
                isCurrentMonth: false,
                isToday: date.getTime() === today.getTime(),
                ...attendanceData[dateStr]
            });
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];

            days.push({
                date: dateStr,
                day,
                isCurrentMonth: true,
                isToday: date.getTime() === today.getTime(),
                ...attendanceData[dateStr]
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            const dateStr = date.toISOString().split('T')[0];

            days.push({
                date: dateStr,
                day,
                isCurrentMonth: false,
                isToday: date.getTime() === today.getTime(),
                ...attendanceData[dateStr]
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setViewDate(new Date());
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
            case 'absent':
                return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200';
            case 'late':
                return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
            case 'leave':
            case 'excused':
                return 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200';
            case 'holiday':
                return 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200';
            default:
                return 'bg-white border-gray-200 hover:bg-gray-50';
        }
    };

    const calendarDays = getCalendarDays();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Monthly Calendar View
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-300"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="px-4 py-2 bg-white rounded-lg border border-gray-300 min-w-[180px] text-center">
                            <span className="text-sm font-semibold text-gray-900">
                                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </span>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-300"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ml-2"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((calDay, index) => (
                        <button
                            key={index}
                            onClick={() => calDay.isCurrentMonth && onDateSelect(calDay.date)}
                            disabled={!calDay.isCurrentMonth}
                            className={`
                                relative aspect-square p-2 rounded-lg border-2 transition-all
                                ${calDay.isCurrentMonth
                                    ? getStatusColor(calDay.status) + ' cursor-pointer'
                                    : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                }
                                ${calDay.isToday
                                    ? 'ring-2 ring-blue-500 ring-offset-2'
                                    : ''
                                }
                            `}
                        >
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className={`text-sm font-semibold ${
                                    calDay.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                    {calDay.day}
                                </span>
                                {calDay.status && calDay.isCurrentMonth && (
                                    <div className="mt-1">
                                        <div className={`w-2 h-2 rounded-full ${
                                            calDay.status === 'present' ? 'bg-green-600' :
                                            calDay.status === 'absent' ? 'bg-red-600' :
                                            calDay.status === 'late' ? 'bg-yellow-600' :
                                            'bg-orange-600'
                                        }`} />
                                        {calDay.count && (
                                            <span className="text-xs font-medium mt-1">
                                                {calDay.count}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                            <span className="text-xs text-gray-600">Present</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                            <span className="text-xs text-gray-600">Absent</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
                            <span className="text-xs text-gray-600">Late</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-300"></div>
                            <span className="text-xs text-gray-600">{type === 'teacher' ? 'Leave' : 'Excused'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300"></div>
                            <span className="text-xs text-gray-600">Holiday</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
