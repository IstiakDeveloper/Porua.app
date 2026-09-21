import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { List, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    event_type: string;
}

interface Props {
    events: Event[];
}

export default function Calendar({ events }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const eventTypeColors: Record<string, string> = {
        academic: 'bg-blue-500',
        sports: 'bg-green-500',
        cultural: 'bg-purple-500',
        holiday: 'bg-red-500',
        meeting: 'bg-yellow-500',
        other: 'bg-gray-500',
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getEventsForDate = (date: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        return events.filter(event => {
            const start = event.start_date.split(' ')[0];
            const end = event.end_date.split(' ')[0];
            return dateStr >= start && dateStr <= end;
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Events Calendar" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6" />
                            Events Calendar
                        </h1>
                        <p className="text-gray-600 mt-1">View events in calendar format</p>
                    </div>
                    <Link href="/events">
                        <Button variant="secondary">
                            <List className="h-4 w-4 mr-2" />
                            List View
                        </Button>
                    </Link>
                </div>

                <Card>
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={previousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setCurrentDate(new Date())}>
                                Today
                            </Button>
                            <Button size="sm" variant="secondary" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-gray-700 py-2">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="border border-gray-200 rounded-lg p-2 h-24 bg-gray-50" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const date = i + 1;
                            const dayEvents = getEventsForDate(date);
                            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toDateString();

                            return (
                                <div
                                    key={date}
                                    className={`border rounded-lg p-2 h-24 overflow-y-auto ${
                                        isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                    }`}
                                >
                                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                        {date}
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <Link
                                                key={event.id}
                                                href={`/events/${event.id}`}
                                                className={`block text-xs px-1 py-0.5 rounded text-white truncate ${eventTypeColors[event.event_type]}`}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex gap-4 flex-wrap">
                        <div className="text-sm font-semibold text-gray-700">Legend:</div>
                        {Object.entries(eventTypeColors).map(([type, color]) => (
                            <div key={type} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${color}`} />
                                <span className="text-sm text-gray-700 capitalize">{type}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
