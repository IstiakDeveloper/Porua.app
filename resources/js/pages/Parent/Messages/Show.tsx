import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    ArrowLeft,
    Paperclip,
    User,
    Clock,
    FileText,
    Download,
    MessageSquare,
    Send
} from 'lucide-react';

interface Message {
    subject: string;
    message: string;
    sender_name: string;
    receiver_name: string;
    attachments: Array<string | { url?: string; name?: string }>;
    read_at: string | null;
    created_at: string;
}

function fileHref(file: string | { url?: string; name?: string }): string {
    if (typeof file !== 'string') return file.url || '#';
    if (file.startsWith('http') || file.startsWith('/')) return file;
    return `/storage/${file}`;
}

function fileName(file: string | { url?: string; name?: string }): string {
    if (typeof file !== 'string') return file.name || 'Attachment';
    return file.split('/').pop() || 'Attachment';
}

export default function Show({ message }: { message: Message }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Message - ${message.subject}`} />

            <ParentPage
                title={message.subject}
                subtitle={`Sent on ${message.created_at}`}
                action={
                    <Link
                        href={route('parent.messages.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Inbox
                    </Link>
                }
            >
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* 1. Header Metadata Bar */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                {message.sender_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">From: {message.sender_name}</p>
                                <p className="text-slate-500 text-[11px]">To: {message.receiver_name}</p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right text-[11px] text-slate-400">
                            <p className="flex items-center gap-1 font-mono sm:justify-end">
                                <Clock className="w-3.5 h-3.5" />
                                {message.created_at}
                            </p>
                            {message.read_at && (
                                <p className="text-emerald-600 font-medium mt-0.5">
                                    Seen / Read: {message.read_at}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. Message Body */}
                    <article className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
                        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap py-2">
                            {message.message}
                        </div>

                        {/* Attachments Section */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                                    Attached Documents ({message.attachments.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {message.attachments.map((file, index) => (
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

                    {/* 3. Reply / Followup Shortcut */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                        <span>Need to write a response or send additional queries?</span>
                        <Link
                            href={route('parent.messages.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Compose Reply
                        </Link>
                    </div>
                </div>
            </ParentPage>
        </AuthenticatedLayout>
    );
}
