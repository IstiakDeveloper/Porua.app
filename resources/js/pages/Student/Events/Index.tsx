import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Users,
    Search,
    Info,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';

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

export default function Index({ events, filters }: Props) {
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
        const colors: Record<string, string> = {
            'Academic': 'bg-blue-600',
            'Sports': 'bg-green-600',
            'Cultural': 'bg-purple-600',
            'Workshop': 'bg-orange-600',
            'Meeting': 'bg-gray-600',
            'Celebration': 'bg-pink-600',
            'Competition': 'bg-red-600',
            'Other': 'bg-gray-500'
        };
        return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colors[type] || 'bg-gray-600'}`}>{type}</span>;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const EventCard = ({ event }: { event: Event }) => (
        <div className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                    </div>
                    {getTypeBadge(event.type)}
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                        {new Date(event.event_date).getDate()}
                    </div>
                    <div className="text-xs text-gray-600">
                        {monthNames[new Date(event.event_date).getMonth()].slice(0, 3)}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {event.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-gray-600">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {event.event_date_formatted}
                </div>
                <div className="flex items-center text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    {event.start_time} - {event.end_time}
                </div>
                <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                </div>
                <div className="flex items-center text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {event.organizer}
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Events & Activities
                </h2>
            }
        >
            <Head title="Events" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Month Navigation */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => navigateMonth('prev')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </button>

                                <div className="text-center">
                                    <h3 className="text-2xl font-bold">{monthNames[currentMonth - 1]} {currentYear}</h3>
                                    <p className="text-sm text-gray-600">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</p>
                                </div>

                                <button
                                    onClick={() => navigateMonth('next')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search & Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        handleFilter(e.target.value, currentMonth, currentYear);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Types</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Celebration">Celebration</option>
                                    <option value="Competition">Competition</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events List */}
                    {filteredEvents.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
                                    Events for {monthNames[currentMonth - 1]} {currentYear}
                                </CardTitle>
                                <CardDescription>{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center py-12">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">No events found for {monthNames[currentMonth - 1]} {currentYear}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Events */}
                    {filteredEvents.length === 0 && (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        {searchTerm ? 'No events found matching your search' : 'No events scheduled for this month'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
