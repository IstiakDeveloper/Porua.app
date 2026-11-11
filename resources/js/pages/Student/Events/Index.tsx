import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Event {
    id: number;
    title: string;
    description: string;
    type: string;
    event_date: string;
    event_date_formatted: string;
    start_time: string;
    end_time: string;
    location: string;
    organizer: string;
}

interface Props {
    events: Event[];
    filters: {
        type: string | null;
        month: number;
        year: number;
    };
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Index({ events = [], filters }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [currentMonth, setCurrentMonth] = useState(filters.month);
    const [currentYear, setCurrentYear] = useState(filters.year);

    const handleFilter = (type: string, month: number, year: number) => {
        const params: any = { month, year };
        if (type !== 'all') params.type = type;
        router.get('/student/events', params, { preserveState: true });
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        let newMonth = currentMonth;
        let newYear = currentYear;

        if (direction === 'next') {
            newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
            newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        } else {
            newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        handleFilter(selectedType, newMonth, newYear);
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeBadge = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t === 'academic') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (t === 'sports') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (t === 'cultural') return 'bg-purple-50 text-purple-700 border-purple-200';
        if (t === 'workshop') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <AuthenticatedLayout>
            <Head title="School Events" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="School Events & Programs"
                    subtitle="Upcoming co-curricular activities, competitions, and celebrations"
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `${monthNames[currentMonth - 1]} ${currentYear}`, variant: 'neutral' },
                        { label: `${events.length} Events`, variant: 'neutral' }
                    ]}
                />

                {/* 2. FILTER & SEARCH CONTROLS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search event title, venue..."
                            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                handleFilter(e.target.value, currentMonth, currentYear);
                            }}
                            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        >
                            <option value="all">All Event Categories</option>
                            <option value="Academic">Academic</option>
                            <option value="Sports">Sports</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Celebration">Celebration</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => navigateMonth('prev')}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-slate-800 min-w-[110px] text-center">
                                {monthNames[currentMonth - 1]} {currentYear}
                            </span>
                            <button
                                type="button"
                                onClick={() => navigateMonth('next')}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. EVENTS GRID */}
                {filteredEvents && filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-2.5">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] uppercase font-bold text-indigo-500">
                                                    {new Date(event.event_date).toLocaleDateString('en-GB', { month: 'short' })}
                                                </span>
                                                <span className="text-base font-bold text-indigo-700 leading-none">
                                                    {new Date(event.event_date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                                                <p className="text-[11px] text-slate-500 mt-0.5">Organized by {event.organizer || 'School Authority'}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getTypeBadge(event.type)}`}>
                                            {event.type}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        {event.start_time} - {event.end_time}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {event.location}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">No events scheduled for {monthNames[currentMonth - 1]} {currentYear}</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
