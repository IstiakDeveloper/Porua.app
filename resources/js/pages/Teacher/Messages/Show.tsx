import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Mail,
    User,
    Clock,
    Download,
    Paperclip
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Message {
    id: number;
    subject: string;
    message: string;
    sender_name: string;
    receiver_name: string;
    sent_at: string;
    read_at: string | null;
    attachment: string | null;
}

interface Props {
    message: Message;
}

export default function Show({ message }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Message - ${message.subject}`} />

            <div className="space-y-4 pb-8 max-w-4xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Message Details"
                    subtitle={`Subject: ${message.subject}`}
                    backUrl="/teacher/messages"
                    badges={[
                        { label: message.read_at ? 'Read' : 'Delivered', variant: 'neutral' }
                    ]}
                />

                {/* 2. MESSAGE BODY CARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-2xs space-y-5">
                    {/* Header meta */}
                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                                {(message.sender_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{message.sender_name}</h3>
                                <p className="text-xs text-slate-500">
                                    To: <strong className="text-slate-700 font-medium">{message.receiver_name}</strong>
                                </p>
                            </div>
                        </div>

                        <span className="text-xs text-slate-400 font-medium">
                            Sent: {message.sent_at}
                            {message.read_at && ` • Read: ${message.read_at}`}
                        </span>
                    </div>

                    {/* Message content */}
                    <div
                        className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap py-2"
                        dangerouslySetInnerHTML={{ __html: message.message }}
                    />

                    {/* Attachment if present */}
                    {message.attachment && (
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Attached Document</h4>
                            <a
                                href={message.attachment}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-indigo-700 font-medium"
                            >
                                <Download className="w-3.5 h-3.5 text-indigo-600" />
                                Download Attached File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
