import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Mail,
    Send,
    Inbox,
    User,
    Calendar,
    Search,
    PlusCircle,
    ChevronRight,
    Paperclip
} from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Message {
    id: number;
    subject: string;
    message: string;
    sender_name?: string;
    sender_role?: string;
    receiver_name?: string;
    sent_at: string;
    read_at: string | null;
    is_read: boolean;
    has_attachment: boolean;
}

interface Props {
    messages: {
        inbox: Message[];
        sent: Message[];
    };
    unread_count: number;
}

export default function Index({ messages, unread_count = 0 }: Props) {
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');

    const currentList = activeTab === 'inbox' ? (messages?.inbox || []) : (messages?.sent || []);
    const filteredMessages = currentList.filter(msg =>
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.receiver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Faculty Messaging" />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Faculty Communications & Messages"
                    subtitle="Direct messaging with guardians, students, and administration"
                    backUrl="/teacher/dashboard"
                    badges={[
                        { label: `${unread_count} Unread Messages`, variant: unread_count > 0 ? 'success' : 'neutral' }
                    ]}
                    actionSlot={
                        <Link
                            href="/teacher/messages/create"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Compose Message
                        </Link>
                    }
                />

                {/* 2. TABS & SEARCH STRIP */}
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

                    <div className="relative w-full sm:w-72">
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

                {/* 3. MESSAGES LIST */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {filteredMessages && filteredMessages.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredMessages.map((msg) => (
                                <Link
                                    key={msg.id}
                                    href={`/teacher/messages/${msg.id}`}
                                    className={`p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5 block group ${
                                        !msg.is_read && activeTab === 'inbox' ? 'bg-indigo-50/20' : ''
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                                        !msg.is_read && activeTab === 'inbox'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {(activeTab === 'inbox' ? msg.sender_name : msg.receiver_name)?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {activeTab === 'inbox' ? msg.sender_name : `To: ${msg.receiver_name}`}
                                                </h4>
                                                {msg.sender_role && (
                                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {msg.sender_role}
                                                    </span>
                                                )}
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
