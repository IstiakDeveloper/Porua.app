import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    Megaphone,
    Search,
    Pin,
    Calendar,
    ChevronRight,
    Filter,
    RotateCcw,
    AlertCircle
} from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    publish_date: string;
    is_pinned: boolean;
}

interface Props {
    pinnedNotices: Notice[];
    regularNotices: Notice[];
    filters: { search: string | null; type: string | null; priority: string | null };
}

export default function Index({ pinnedNotices = [], regularNotices = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');

    const apply = (event?: FormEvent) => {
        event?.preventDefault();
        router.get(route('parent.notices.index'), {
            search: search || undefined,
            type: type !== 'all' ? type : undefined,
            priority: priority !== 'all' ? priority : undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('all');
        setPriority('all');
        router.get(route('parent.notices.index'));
    };

    const notices = [...pinnedNotices, ...regularNotices];

    const getPriorityBadge = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                        Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                        High
                    </span>
                );
            default:
                return (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                        {priority || 'General'}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="School Notices" />

            <ParentPage
                title="School Notices & Bulletins"
                subtitle="Official announcements, circulars, and notifications for parents"
            >
                {/* 1. Compact Filter Bar */}
                <form onSubmit={apply} className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        <div className="sm:col-span-5">
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Search Circular
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by title, topic..."
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Category
                            </label>
                            <select
                                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                value={type}
                                onChange={(event) => setType(event.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="general">General Notice</option>
                                <option value="exam">Examinations</option>
                                <option value="holiday">Holiday Announcement</option>
                                <option value="event">Program & Event</option>
                                <option value="fee">Fee Circular</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Priority
                            </label>
                            <select
                                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                value={priority}
                                onChange={(event) => setPriority(event.target.value)}
                            >
                                <option value="all">All Priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1.5">
                            <button
                                type="submit"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Filter
                            </button>
                            {(search || type !== 'all' || priority !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                                    title="Reset Filters"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* 2. Notices List */}
                {notices.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Notices Found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No published announcements match your current search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notices.map((notice) => (
                            <Link
                                key={notice.id}
                                href={route('parent.notices.show', notice.id)}
                                className={`block p-4 sm:p-5 rounded-xl border transition-all shadow-2xs group ${
                                    notice.is_pinned
                                        ? 'bg-indigo-50/20 border-indigo-200/90 hover:border-indigo-300'
                                        : 'bg-white border-slate-200/80 hover:border-indigo-300'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                            notice.is_pinned
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {notice.is_pinned ? <Pin className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                                                    {notice.title}
                                                </h3>
                                                {notice.is_pinned && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        Pinned
                                                    </span>
                                                )}
                                                {getPriorityBadge(notice.priority)}
                                            </div>

                                            <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {notice.description}
                                            </p>

                                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {notice.publish_date}
                                                </span>
                                                <span>•</span>
                                                <span className="capitalize">{notice.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 self-center">
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </ParentPage>
        </AuthenticatedLayout>
    );
}
