import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    Pin,
    Download,
    Search,
    FileText,
    AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';

interface Notice {
    id: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    attachment: string | null;
    valid_from: string | null;
    valid_to: string | null;
    created_at: string;
    created_by: string;
}

interface Props {
    notices: Notice[];
    filters: {
        type: string | null;
        priority: string | null;
    };
}

export default function Index({ notices, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');

    const handleFilter = (type: string, priority: string) => {
        const params: any = {};
        if (type !== 'all') params.type = type;
        if (priority !== 'all') params.priority = priority;
        router.get('/student/notices', params, { preserveState: true });
    };

    const filteredNotices = notices.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pinnedNotices = filteredNotices.filter(n => n.is_pinned);
    const regularNotices = filteredNotices.filter(n => !n.is_pinned);

    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white"><AlertCircle className="mr-1 h-3 w-3" />Urgent</span>;
            case 'high':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600 text-white">High</span>;
            case 'medium':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">Medium</span>;
            case 'low':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">Low</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{priority}</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'Academic': 'bg-blue-600',
            'Administrative': 'bg-purple-600',
            'Event': 'bg-green-600',
            'Holiday': 'bg-yellow-600',
            'Exam': 'bg-red-600',
            'General': 'bg-gray-600'
        };
        return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colors[type] || 'bg-gray-600'}`}>{type}</span>;
    };

    const NoticeCard = ({ notice }: { notice: Notice }) => (
        <div
            className={`p-4 border rounded-lg hover:shadow-md transition cursor-pointer ${
                notice.is_pinned ? 'border-blue-300 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => router.get(`/student/notices/${notice.id}`)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    {notice.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
                    <h3 className="font-semibold text-lg">{notice.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    {getPriorityBadge(notice.priority)}
                    {getTypeBadge(notice.type)}
                </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {notice.content}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {notice.created_at}
                    </span>
                    {notice.attachment && (
                        <span className="flex items-center">
                            <FileText className="mr-1 h-3 w-3" />
                            Has attachment
                        </span>
                    )}
                </div>
                <span>By: {notice.created_by}</span>
            </div>

            {notice.valid_to && (
                <div className="mt-2 text-xs text-orange-600">
                    <AlertCircle className="inline mr-1 h-3 w-3" />
                    Expires on: {notice.valid_to}
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Notices & Announcements
                </h2>
            }
        >
            <Head title="Notices" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Search & Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="relative md:col-span-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search notices..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        handleFilter(e.target.value, selectedPriority);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Types</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Administrative">Administrative</option>
                                    <option value="Event">Event</option>
                                    <option value="Holiday">Holiday</option>
                                    <option value="Exam">Exam</option>
                                    <option value="General">General</option>
                                </select>

                                <select
                                    value={selectedPriority}
                                    onChange={(e) => {
                                        setSelectedPriority(e.target.value);
                                        handleFilter(selectedType, e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pinned Notices */}
                    {pinnedNotices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Pin className="mr-2 h-5 w-5 text-blue-600" />
                                    Pinned Notices
                                </CardTitle>
                                <CardDescription>Important notices pinned for quick access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pinnedNotices.map((notice) => (
                                        <NoticeCard key={notice.id} notice={notice} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* All Notices */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="mr-2 h-5 w-5 text-gray-600" />
                                All Notices
                            </CardTitle>
                            <CardDescription>Published notices and announcements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {regularNotices.length > 0 ? (
                                <div className="space-y-3">
                                    {regularNotices.map((notice) => (
                                        <NoticeCard key={notice.id} notice={notice} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        {searchTerm ? 'No notices found matching your search' : 'No notices available'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
