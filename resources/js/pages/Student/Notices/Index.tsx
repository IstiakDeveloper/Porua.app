import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    Pin,
    Search,
    FileText,
    AlertCircle,
    ChevronRight,
    Paperclip
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

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
    is_pinned?: boolean;
}

interface Props {
    notices: Notice[];
    filters: {
        type: string | null;
        priority: string | null;
    };
}

export default function Index({ notices = [], filters }: Props) {
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

    const getPriorityBadge = (priority: string) => {
        switch ((priority || '').toLowerCase()) {
            case 'urgent':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'high':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="School Notices" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Notice Board"
                    subtitle="Official circulars, schedules, administrative notices, and updates"
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `${notices.length} Notices`, variant: 'neutral' }
                    ]}
                />

                {/* 2. SEARCH & CATEGORY FILTERS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search notices by keyword..."
                            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                handleFilter(e.target.value, selectedPriority);
                            }}
                            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        >
                            <option value="all">All Notice Types</option>
                            <option value="Academic">Academic</option>
                            <option value="Exam">Exam</option>
                            <option value="Holiday">Holiday</option>
                            <option value="Administrative">Administrative</option>
                            <option value="Event">Event</option>
                            <option value="General">General</option>
                        </select>

                        <select
                            value={selectedPriority}
                            onChange={(e) => {
                                setSelectedPriority(e.target.value);
                                handleFilter(selectedType, e.target.value);
                            }}
                            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                {/* 3. NOTICE LIST */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {filteredNotices && filteredNotices.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredNotices.map((notice) => (
                                <Link
                                    key={notice.id}
                                    href={`/student/notices/${notice.id}`}
                                    className={`p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5 block group ${
                                        notice.is_pinned ? 'bg-indigo-50/20' : ''
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                        notice.is_pinned
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {notice.is_pinned ? <Pin className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {notice.title}
                                                </h3>
                                                {notice.is_pinned && (
                                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                                        Pinned
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(notice.priority)}`}>
                                                    {notice.priority}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {notice.type}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {notice.content}
                                        </p>

                                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Published by {notice.created_by} • {notice.created_at}</span>
                                            {notice.attachment && (
                                                <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                                                    <Paperclip className="w-3 h-3" />
                                                    Attachment
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No notices found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
