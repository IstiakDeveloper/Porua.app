import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    ArrowLeft,
    Paperclip,
    Calendar,
    Pin,
    Megaphone,
    FileText,
    Download,
    Building2
} from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    publish_date: string;
    attachments: Array<string | { url?: string; name?: string }>;
    is_pinned: boolean;
}

function fileHref(file: string | { url?: string; name?: string }): string {
    if (typeof file !== 'string') {
        return file.url || '#';
    }
    if (file.startsWith('http') || file.startsWith('/')) {
        return file;
    }
    return `/storage/${file}`;
}

function fileName(file: string | { url?: string; name?: string }): string {
    if (typeof file !== 'string') {
        return file.name || 'Notice Attachment';
    }
    return file.split('/').pop() || 'Notice Attachment';
}

export default function Show({ notice }: { notice: Notice }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Notice - ${notice.title}`} />

            <ParentPage
                title={notice.title}
                subtitle={`Published on ${notice.publish_date} • Category: ${notice.type} • Priority: ${notice.priority}`}
                action={
                    <Link
                        href={route('parent.notices.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Notices
                    </Link>
                }
            >
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Notice Main Content Article */}
                    <article className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
                        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
                            {notice.is_pinned && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Pin className="w-3.5 h-3.5" />
                                    Pinned Circular
                                </span>
                            )}
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                                {notice.type}
                            </span>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                                Priority: {notice.priority}
                            </span>
                            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1 font-mono">
                                <Calendar className="w-3.5 h-3.5" />
                                {notice.publish_date}
                            </span>
                        </div>

                        {/* Notice Body */}
                        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap py-2">
                            {notice.description}
                        </div>

                        {/* Attachments Section */}
                        {notice.attachments && notice.attachments.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                                    Attached Documents ({notice.attachments.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {notice.attachments.map((file, index) => (
                                        <a
                                            key={index}
                                            href={fileHref(file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-xs font-medium text-slate-800 flex items-center justify-between gap-2 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                                <span className="truncate group-hover:text-indigo-700">{fileName(file)}</span>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Official Authority Card */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-4 text-xs space-y-1 text-slate-600">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            Official Institutional Broadcast
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            This notice was published by the school administration for authorized guardians. For inquiries related to this circular, please message the administration via the portal.
                        </p>
                    </div>
                </div>
            </ParentPage>
        </AuthenticatedLayout>
    );
}
