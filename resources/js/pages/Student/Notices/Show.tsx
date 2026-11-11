import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, FileText, User } from 'lucide-react';
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
}

interface Props {
    notice: Notice;
}

export default function Show({ notice }: Props) {
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
            <Head title={notice.title} />

            <div className="space-y-4 pb-8 max-w-4xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Notice Circular"
                    subtitle={`Published on ${notice.created_at} by ${notice.created_by}`}
                    backUrl="/student/notices"
                    badges={[
                        { label: notice.type, variant: 'neutral' },
                        { label: notice.priority.toUpperCase(), variant: notice.priority.toLowerCase() === 'urgent' ? 'neutral' : 'neutral' }
                    ]}
                />

                {/* 2. NOTICE DETAIL CARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-2xs space-y-5">
                    <div className="border-b border-slate-100 pb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${getPriorityBadge(notice.priority)}`}>
                                {notice.priority}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {notice.type}
                            </span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                            {notice.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {notice.created_at}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                Author: {notice.created_by}
                            </span>
                        </div>
                    </div>

                    {/* Notice Body */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line py-2">
                        {notice.content}
                    </div>

                    {/* Attachment if present */}
                    {notice.attachment && (
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Attached Documents</h4>
                            <a
                                href={notice.attachment}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-indigo-700 transition-colors"
                            >
                                <Download className="w-4 h-4 text-indigo-600" />
                                Download Attached File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
