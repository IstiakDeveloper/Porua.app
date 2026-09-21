import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { ArrowLeft, Calendar, MapPin, User, Edit, Trash2, Clock } from 'lucide-react';

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
    event: Event;
}

export default function Show({ event }: Props) {
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

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this event?')) {
            router.delete(`/events/${event.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={event.title} />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Event Details
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => router.get('/events')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Link href={`/events/${event.id}/edit`}>
                            <Button variant="secondary">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="danger" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${eventTypeColors[event.event_type]}`}>
                                    {event.event_type}
                                </span>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[event.status]}`}>
                                    {event.status}
                                </span>
                            </div>
                        </div>

                        {event.description && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                            </div>
                        )}

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                                        <p className="text-gray-900">{new Date(event.start_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">End Date</p>
                                        <p className="text-gray-900">{new Date(event.end_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>

                                {event.location && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Location</p>
                                            <p className="text-gray-900">{event.location}</p>
                                        </div>
                                    </div>
                                )}

                                {event.organizer && (
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Organizer</p>
                                            <p className="text-gray-900">{event.organizer}</p>
                                        </div>
                                    </div>
                                )}

                                {event.createdBy && (
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Created By</p>
                                            <p className="text-gray-900">{event.createdBy.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {event.start_date !== event.end_date && (
                            <div className="border-t pt-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Multi-day Event</p>
                                            <p className="text-sm text-blue-700">
                                                This event spans from {new Date(event.start_date).toLocaleDateString()} to {new Date(event.end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
