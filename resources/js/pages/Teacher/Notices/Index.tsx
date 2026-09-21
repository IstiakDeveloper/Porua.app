import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    Pin,
    Eye,
    Search,
    FileText,
    AlertCircle
} from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    content: string;
    notice_type: string;
    priority: string;
    publish_date: string;
    expiry_date: string | null;
    is_pinned: boolean;
    target_audience: string[];
    attachments: any[];
    views_count: number;
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
        router.get(route('teacher.notices.index'), params, { preserveState: true });
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
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="mr-1 h-3 w-3" />Urgent</span>;
            case 'high':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">High</span>;
            case 'medium':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Medium</span>;
            case 'low':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700">Low</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{priority}</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'Academic': 'bg-blue-100 text-blue-800',
            'Administrative': 'bg-purple-100 text-purple-800',
            'Event': 'bg-green-100 text-green-800',
            'Holiday': 'bg-yellow-100 text-yellow-800',
            'Exam': 'bg-red-100 text-red-800',
            'General': 'bg-gray-100 text-gray-800'
        };
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>{type}</span>;
    };

    const NoticeCard = ({ notice }: { notice: Notice }) => (
        <div
            className={`p-5 border rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer ${
                notice.is_pinned ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-gray-200 hover:bg-gray-50 hover:border-blue-200'
            }`}
            onClick={() => router.get(`/teacher/notices/${notice.id}`)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    {notice.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
                    <h3 className="font-semibold text-lg">{notice.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    {getPriorityBadge(notice.priority)}
                    {getTypeBadge(notice.notice_type)}
                </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{notice.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {notice.publish_date}
                    </span>
                    <span className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {notice.views_count} views
                    </span>
                    {notice.attachments.length > 0 && (
                        <span className="flex items-center">
                            <FileText className="mr-1 h-3 w-3" />
                            {notice.attachments.length} file(s)
                        </span>
                    )}
                </div>
                <span>By: {notice.created_by}</span>
            </div>
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
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search notices..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        handleFilter(e.target.value, selectedPriority);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {pinnedNotices.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Pin className="mr-2 h-5 w-5 text-blue-600" />
                                    Pinned Notices
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {pinnedNotices.map((notice) => (
                                        <NoticeCard key={notice.id} notice={notice} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Bell className="mr-2 h-5 w-5 text-blue-600" />
                                All Notices
                            </h3>
                        </div>
                        <div className="p-6">
                            {regularNotices.length > 0 ? (
                                <div className="space-y-3">
                                    {regularNotices.map((notice) => (
                                        <NoticeCard key={notice.id} notice={notice} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No notices available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
