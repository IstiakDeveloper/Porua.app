import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Mail,
    Send,
    Inbox,
    Search,
    PlusCircle,
    User,
    Calendar,
    Paperclip,
    X,
    MessageSquare
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
    reply_to: number | null;
}

interface Props {
    messages: {
        inbox: Message[];
        sent: Message[];
    };
    unread_count: number;
    recipients: Array<{
        id: number;
        name: string;
        role: string;
    }>;
}

export default function Index({ messages, unread_count = 0, recipients = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCompose, setShowCompose] = useState(false);
    const [composeData, setComposeData] = useState({
        receiver_id: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleCompose = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/student/messages', composeData, {
            onSuccess: () => {
                setShowCompose(false);
                setComposeData({ receiver_id: '', subject: '', message: '' });
                setSubmitting(false);
            },
            onError: () => {
                setSubmitting(false);
            }
        });
    };

    const currentList = activeTab === 'inbox' ? (messages?.inbox || []) : (messages?.sent || []);
    const filteredMessages = currentList.filter(msg =>
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Direct Messaging" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Student Inbox & Messaging"
                    subtitle="Communicate directly with class teachers and administration"
                    backUrl="/student/dashboard"
                    badges={[
                        { label: `${unread_count} Unread Messages`, variant: unread_count > 0 ? 'success' : 'neutral' }
                    ]}
                    actionSlot={
                        <button
                            type="button"
                            onClick={() => setShowCompose(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Compose Message
                        </button>
                    }
                />

                {/* 2. COMPOSE MESSAGE MODAL / DRAWER */}
                {showCompose && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 w-full max-w-lg shadow-xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-indigo-600" />
                                    New Message to Teacher
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCompose(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCompose} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Send To</label>
                                    <select
                                        required
                                        value={composeData.receiver_id}
                                        onChange={(e) => setComposeData({ ...composeData, receiver_id: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="">Select Faculty Member / Teacher</option>
                                        {recipients.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} ({r.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Brief subject..."
                                        value={composeData.subject}
                                        onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Message Content</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Type your message here..."
                                        value={composeData.message}
                                        onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCompose(false)}
                                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                                    >
                                        {submitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. TABS & SEARCH STRIP */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('inbox')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                activeTab === 'inbox'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Inbox className="w-3.5 h-3.5" />
                            Inbox ({messages?.inbox?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('sent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                activeTab === 'sent'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            Sent ({messages?.sent?.length || 0})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter conversations..."
                            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        />
                    </div>
                </div>

                {/* 4. MESSAGES LIST */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {filteredMessages && filteredMessages.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredMessages.map((msg) => (
                                <Link
                                    key={msg.id}
                                    href={`/student/messages/${msg.id}`}
                                    className={`p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5 block group ${
                                        !msg.is_read && activeTab === 'inbox' ? 'bg-indigo-50/20' : ''
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                                        !msg.is_read && activeTab === 'inbox'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {(msg.sender_name || 'U').charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {activeTab === 'inbox' ? msg.sender_name : `To: ${msg.recipient_name}`}
                                                </h4>
                                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {msg.sender_role}
                                                </span>
                                                {!msg.is_read && activeTab === 'inbox' && (
                                                    <span className="w-2 h-2 rounded-full bg-indigo-600" title="Unread" />
                                                )}
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {msg.sent_at}
                                            </span>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-800 truncate mb-0.5">
                                            {msg.subject}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {msg.message}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No messages in this folder</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
