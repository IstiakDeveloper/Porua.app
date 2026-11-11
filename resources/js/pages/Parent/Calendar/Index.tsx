import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    CalendarDays,
    Calendar,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Palmtree,
    Award,
    BookOpen
} from 'lucide-react';

interface EventItem {
    id: number;
    title: string;
    description?: string | null;
    type?: string | null;
    is_holiday: boolean;
    event_date_formatted: string;
    start_time?: string | null;
    end_time?: string | null;
    location?: string | null;
}

interface Props {
    events: EventItem[];
    filters: { month: number; year: number; label: string };
}

function shift(month: number, year: number, direction: -1 | 1) {
    const date = new Date(year, month - 1 + direction, 1);
    router.get(route('parent.calendar.index'), {
        month: date.getMonth() + 1,
        year: date.getFullYear()
    }, { preserveScroll: true });
}

export default function Index({ events = [], filters }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Academic Calendar" />

            <ParentPage
                title="Academic Calendar"
                subtitle="School holidays, term examinations, parent-teacher conferences, and events"
                action={
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => shift(filters.month, filters.year, -1)}
                            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors shadow-2xs"
                            title="Previous Month"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="min-w-28 text-center text-xs font-bold text-slate-900 px-2">
                            {filters.label}
                        </span>
                        <button
                            type="button"
                            onClick={() => shift(filters.month, filters.year, 1)}
                            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors shadow-2xs"
                            title="Next Month"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                }
            >
                {events.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Events Scheduled</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            There are no holidays or scheduled academic events announced for {filters.label}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className={`bg-white rounded-xl border transition-all p-4 shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                                    event.is_holiday
                                        ? 'border-amber-200/80 bg-amber-50/20'
                                        : 'border-slate-200/80 hover:border-indigo-200'
                                }`}
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    {/* Date Badge Box */}
                                    <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-2xs ${
                                        event.is_holiday
                                            ? 'bg-amber-50 border-amber-200/80 text-amber-800'
                                            : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                                    }`}>
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase mt-0.5">
                                            {event.is_holiday ? 'Off' : 'Event'}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {event.title}
                                            </h3>
                                            {event.is_holiday && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                    Holiday
                                                </span>
                                            )}
                                            {event.type && (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                                                    {event.type}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="font-semibold text-slate-700">
                                                {event.event_date_formatted}
                                            </span>
                                            {(event.start_time || event.end_time) && (
                                                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {event.start_time} – {event.end_time || ''}
                                                </span>
                                            )}
                                            {event.location && (
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>

                                        {event.description && (
                                            <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ParentPage>
        </AuthenticatedLayout>
    );
}
