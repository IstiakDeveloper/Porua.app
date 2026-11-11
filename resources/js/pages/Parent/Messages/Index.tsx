import React, { FormEvent, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';
import {
    MessageSquare,
    Send,
    Search,
    Inbox,
    Mail,
    User,
    Clock,
    Plus,
    X,
    ChevronRight,
    Building2,
    GraduationCap
} from 'lucide-react';

interface Message {
    id: number;
    subject: string;
    message: string;
    sender: { name: string };
    recipient: { name: string };
    read_at: string | null;
    created_at: string;
}

interface ContactPerson {
    id: number;
    name: string;
}

interface Contact {
    student_id: number;
    student_name: string;
    teacher: ContactPerson | null;
    office: ContactPerson | null;
}

interface Props {
    inbox: Message[];
    sent: Message[];
    unreadCount: number;
    contacts: Contact[];
}

export default function Index({ inbox = [], sent = [], unreadCount = 0, contacts = [] }: Props) {
    const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
    const [search, setSearch] = useState('');
    const [openComposer, setOpenComposer] = useState(false);

    const first = contacts[0];
    const [studentId, setStudentId] = useState(first ? String(first.student_id) : '');
    const contact = contacts.find((item) => String(item.student_id) === studentId) || first;

    const choices = useMemo(() => {
        if (!contact) return [];
        const rows: { id: number; label: string }[] = [];
        if (contact.teacher) rows.push({ id: contact.teacher.id, label: `Class Teacher (${contact.teacher.name})` });
        if (contact.office && contact.office.id !== contact.teacher?.id) {
            rows.push({ id: contact.office.id, label: `School Administration (${contact.office.name})` });
        }
        return rows;
    }, [contact]);

    const { data, setData, post, processing, errors, reset } = useForm({
        receiver_id: choices[0]?.id ? String(choices[0].id) : '',
        subject: '',
        message: '',
    });

    const activeList = tab === 'inbox' ? inbox : sent;

    const filteredList = activeList.filter((msg) => {
        const query = search.toLowerCase();
        const sender = msg.sender?.name || '';
        const recipient = msg.recipient?.name || '';
        const subj = msg.subject || '';
        const body = msg.message || '';
        return (
            subj.toLowerCase().includes(query) ||
            body.toLowerCase().includes(query) ||
            sender.toLowerCase().includes(query) ||
            recipient.toLowerCase().includes(query)
        );
    });

    const sendMessage = (event: FormEvent) => {
        event.preventDefault();
        post(route('parent.messages.send'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('subject', 'message');
                setOpenComposer(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Direct Messages" />

            <ParentPage
                title="School Communication & Messages"
                subtitle={unreadCount > 0 ? `${unreadCount} unread message(s) awaiting your review` : 'Direct messaging channel with class teachers and administration'}
                action={
                    <button
                        type="button"
                        onClick={() => setOpenComposer(!openComposer)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                    >
                        {openComposer ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {openComposer ? 'Close Form' : 'Compose Message'}
                    </button>
                }
            >
                {/* 1. Collapsible Message Composer */}
                {openComposer && (
                    <div className="bg-white rounded-xl border border-indigo-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Send className="w-4 h-4 text-indigo-600" />
                                Send Message to Teacher or School
                            </h3>
                            <button
                                type="button"
                                onClick={() => setOpenComposer(false)}
                                className="text-slate-400 hover:text-slate-600 text-xs"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={sendMessage} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {contacts.length > 1 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Related Student
                                        </label>
                                        <select
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            value={studentId}
                                            onChange={(event) => {
                                                const next = contacts.find((item) => String(item.student_id) === event.target.value);
                                                setStudentId(event.target.value);
                                                const nextId = next?.teacher?.id || next?.office?.id;
                                                if (nextId) setData('receiver_id', String(nextId));
                                            }}
                                        >
                                            {contacts.map((item) => (
                                                <option key={item.student_id} value={item.student_id}>
                                                    {item.student_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Recipient <span className="text-rose-500">*</span>
                                    </label>
                                    {choices.length > 0 ? (
                                        <select
                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            value={data.receiver_id}
                                            onChange={(event) => setData('receiver_id', event.target.value)}
                                            required
                                        >
                                            {choices.map((choice) => (
                                                <option key={choice.id} value={choice.id}>
                                                    {choice.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-xs text-slate-500 py-2">
                                            No designated faculty contact found for this student.
                                        </p>
                                    )}
                                    {errors.receiver_id && <p className="text-[11px] text-rose-600 mt-1">{errors.receiver_id}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Subject <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    value={data.subject}
                                    onChange={(event) => setData('subject', event.target.value)}
                                    placeholder="e.g. Query regarding upcoming mathematics quiz"
                                    required
                                />
                                {errors.subject && <p className="text-[11px] text-rose-600 mt-1">{errors.subject}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Message Details <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 h-28"
                                    value={data.message}
                                    onChange={(event) => setData('message', event.target.value)}
                                    placeholder="Type your message clearly to the teacher or administration..."
                                    required
                                />
                                {errors.message && <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpenComposer(false)}
                                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || choices.length === 0}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs disabled:opacity-60"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {processing ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 2. Navigation Tabs & Search Bar */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                        <button
                            type="button"
                            onClick={() => setTab('inbox')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                tab === 'inbox'
                                    ? 'bg-white text-indigo-700 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Inbox className="w-3.5 h-3.5" />
                            Inbox
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white ml-0.5">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('sent')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                tab === 'sent'
                                    ? 'bg-white text-indigo-700 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            Sent Messages
                        </button>
                    </div>

                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Filter messages..."
                        />
                    </div>
                </div>

                {/* 3. Message Feed */}
                {filteredList.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                            {tab === 'inbox' ? 'Inbox is Empty' : 'No Sent Messages'}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            {tab === 'inbox'
                                ? 'You do not have any incoming messages from teachers or school staff.'
                                : 'You have not sent any direct inquiries through the portal yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredList.map((message) => {
                            const isUnread = tab === 'inbox' && !message.read_at;

                            return (
                                <Link
                                    key={message.id}
                                    href={route('parent.messages.show', message.id)}
                                    className={`block p-4 rounded-xl border transition-all shadow-2xs group ${
                                        isUnread
                                            ? 'bg-indigo-50/20 border-indigo-200/90 hover:border-indigo-300'
                                            : 'bg-white border-slate-200/80 hover:border-indigo-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                isUnread
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <User className="w-4 h-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                        {tab === 'inbox' ? `From: ${message.sender?.name || 'Staff'}` : `To: ${message.recipient?.name || 'Teacher'}`}
                                                    </p>
                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                                    )}
                                                </div>

                                                <h4 className={`text-xs mt-0.5 group-hover:text-indigo-700 truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                                                    {message.subject}
                                                </h4>

                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                    {message.message}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {message.created_at}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </ParentPage>
        </AuthenticatedLayout>
    );
}
