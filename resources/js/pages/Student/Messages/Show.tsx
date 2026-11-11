import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    User,
    Calendar,
    Reply,
    Send,
    Paperclip,
    Download,
    CheckCheck
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Message {
    id: number;
    subject: string;
    message: string;
    sender_name: string;
    sender_role: string;
    recipient_name: string;
    sent_at: string;
    read_at: string | null;
    is_read: boolean;
    has_attachment: boolean;
    attachments?: Array<{
        id: number;
        file_name: string;
        file_path: string;
        file_size: string;
    }>;
    reply_to: number | null;
}

interface Props {
    message: Message;
    can_reply: boolean;
}

export default function Show({ message, can_reply }: Props) {
    const [showReply, setShowReply] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        subject: `Re: ${message.subject}`,
        message: '',
    });

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/student/messages/${message.id}/reply`, {
            onSuccess: () => {
                reset();
                setShowReply(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={message.subject} />

            <div className="space-y-4 pb-8 max-w-4xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Conversation Details"
                    subtitle={`Subject: ${message.subject}`}
                    backUrl="/student/messages"
                    badges={[
                        { label: message.sender_role, variant: 'neutral' },
                        { label: message.read_at ? 'Read' : 'Delivered', variant: 'neutral' }
                    ]}
                    actionSlot={
                        can_reply ? (
                            <button
                                type="button"
                                onClick={() => setShowReply(!showReply)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                            >
                                <Reply className="w-3.5 h-3.5" />
                                Reply to {message.sender_name}
                            </button>
                        ) : undefined
                    }
                />

                {/* 2. MESSAGE BODY CARD */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-2xs space-y-5">
                    {/* Header meta */}
                    <div className="border-b border-slate-100 pb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                                {(message.sender_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{message.sender_name}</h3>
                                <p className="text-xs text-slate-500">
                                    To: <strong className="text-slate-700 font-medium">{message.recipient_name}</strong> • {message.sender_role}
                                </p>
                            </div>
                        </div>

                        <span className="text-xs text-slate-400 shrink-0 font-medium">
                            {message.sent_at}
                        </span>
                    </div>

                    {/* Message text */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line py-2">
                        {message.message}
                    </div>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Attachments</h4>
                            <div className="space-y-2">
                                {message.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={att.file_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-indigo-700 font-medium"
                                    >
                                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                                        {att.file_name} ({att.file_size})
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. INLINE REPLY COMPOSER */}
                {showReply && (
                    <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Reply className="w-3.5 h-3.5 text-indigo-600" />
                            Compose Reply
                        </h4>
                        <form onSubmit={handleReply} className="space-y-3">
                            <textarea
                                rows={4}
                                required
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Type your reply here..."
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReply(false)}
                                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {processing ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
