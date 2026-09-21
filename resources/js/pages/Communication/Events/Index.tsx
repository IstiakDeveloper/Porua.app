import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Calendar, Filter, Eye, Edit, Trash2, MapPin, User } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string | null;
    event_type: string;
    start_date: string;
    end_date: string;
    location: string | null;
    organizer: string | null;
    status: string;
    created_by: number;
    createdBy?: {
        name: string;
    };
}

interface Props {
    events: {
        data: Event[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: any[];
    };
    filters: {
        event_type?: string;
        status?: string;
    };
}

export default function Index({ events, filters }: Props) {
    const eventTypeColors: Record<string, string> = {
        academic: 'bg-blue-100 text-blue-800',
        sports: 'bg-green-100 text-green-800',
        cultural: 'bg-purple-100 text-purple-800',
        holiday: 'bg-red-100 text-red-800',
        meeting: 'bg-yellow-100 text-yellow-800',
        other: 'bg-gray-100 text-gray-800',
    };

    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-100 text-blue-800',
        ongoing: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/events', { ...filters, [key]: value });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this event?')) {
            router.delete(`/events/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Events" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Events
                        </h1>
                        <p className="text-gray-600 mt-1">Manage school events and activities</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/events/calendar">
                            <Button variant="secondary">
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar View
                            </Button>
                        </Link>
                        <Link href="/events/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Event
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <div className="mb-6 flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Filter className="h-4 w-4 inline mr-1" />
                                Event Type
                            </label>
                            <select
                                value={filters.event_type || ''}
                                onChange={(e) => handleFilter('event_type', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="academic">Academic</option>
                                <option value="sports">Sports</option>
                                <option value="cultural">Cultural</option>
                                <option value="holiday">Holiday</option>
                                <option value="meeting">Meeting</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Event
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No events found
                                        </td>
                                    </tr>
                                ) : (
                                    events.data.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                                    {event.organizer && (
                                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                            <User className="h-3 w-3" />
                                                            {event.organizer}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${eventTypeColors[event.event_type]}`}>
                                                    {event.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{new Date(event.start_date).toLocaleDateString()}</div>
                                                {event.start_date !== event.end_date && (
                                                    <div className="text-xs text-gray-500">
                                                        to {new Date(event.end_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {event.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {event.location}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[event.status]}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/events/${event.id}`}>
                                                        <Button size="sm" variant="secondary">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/events/${event.id}/edit`}>
                                                        <Button size="sm" variant="secondary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(event.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <IndexPagination
                        links={events.links ?? []}
                        from={events.from}
                        to={events.to}
                        total={events.total}
                        lastPage={events.last_page}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
