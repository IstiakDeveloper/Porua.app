import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Bell, Search, Eye, Paperclip, Pin } from 'lucide-react';
import { useState } from 'react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'parent.notices.index': '/parent/notices',
        'parent.notices.show': '/parent/notices/:id',
    };

    if (params && name === 'parent.notices.show') {
        return `/parent/notices/${params}`;
    }

    return routes[name] || '/';
}

interface Notice {
    id: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    publish_date: string;
    attachments: any;
    is_pinned: boolean;
    view_count: number;
}

interface Props {
    pinnedNotices: Notice[];
    regularNotices: Notice[];
    filters: {
        search: string | null;
        type: string | null;
        priority: string | null;
    };
}

export default function Index({ pinnedNotices, regularNotices, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');

    const handleSearch = () => {
        router.get(route('parent.notices.index'), {
            search: search || undefined,
            type: type !== 'all' ? type : undefined,
            priority: priority !== 'all' ? priority : undefined,
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam':
                return 'bg-purple-100 text-purple-800';
            case 'holiday':
                return 'bg-green-100 text-green-800';
            case 'event':
                return 'bg-yellow-100 text-yellow-800';
            case 'general':
                return 'bg-blue-100 text-blue-800';
            case 'fee':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderNoticeCard = (notice: Notice) => (
        <Link
            key={notice.id}
            href={route('parent.notices.show', notice.id)}
            className="block"
        >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {notice.is_pinned && (
                                <Pin className="h-4 w-4 text-blue-600" />
                            )}
                            <h3 className="font-semibold text-lg line-clamp-2">{notice.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                            {notice.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getTypeColor(notice.type)}`}>
                            {notice.type}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getPriorityColor(notice.priority)}`}>
                            {notice.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(notice.publish_date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        {notice.attachments && notice.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                                <Paperclip className="h-4 w-4" />
                                <span>{notice.attachments.length}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{notice.view_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Notices" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Notices</h1>
                        <p className="text-gray-600">Stay updated with school announcements</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md mb-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search notices..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="general">General</option>
                                    <option value="exam">Exam</option>
                                    <option value="holiday">Holiday</option>
                                    <option value="event">Event</option>
                                    <option value="fee">Fee</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={handleSearch}
                                className="inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Pinned Notices */}
                    {pinnedNotices.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Pin className="h-5 w-5 text-blue-600" />
                                <h2 className="text-xl font-bold">Pinned Notices</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pinnedNotices.map((notice) => (
                                    <div key={notice.id} className="border-2 border-blue-200 rounded-lg">
                                        {renderNoticeCard(notice)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Notices */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <h2 className="text-xl font-bold">All Notices</h2>
                        </div>
                        {regularNotices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {regularNotices.map((notice) => renderNoticeCard(notice))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No notices found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
