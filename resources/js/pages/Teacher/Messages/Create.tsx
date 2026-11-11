import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Send, Users, User, X, Search, CheckSquare, Square, Paperclip } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    name: string;
    roll: string;
    class: string;
    section: string;
}

interface Teacher {
    id: number;
    name: string;
}

interface Props {
    students: Student[];
    teachers: Teacher[];
}

export default function Create({ students = [], teachers = [] }: Props) {
    const [recipientType, setRecipientType] = useState<'student' | 'teacher'>('student');
    const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sending, setSending] = useState(false);
    const [validationError, setValidationError] = useState('');

    const recipients = recipientType === 'student' ? students : teachers;

    const filteredRecipients = recipients.filter(recipient =>
        recipient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipientType === 'student' && (recipient as Student).roll?.includes(searchTerm))
    );

    const toggleRecipient = (id: number) => {
        setValidationError('');
        setSelectedRecipients(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setValidationError('');
        setSelectedRecipients(filteredRecipients.map(r => r.id));
    };

    const clearAll = () => {
        setSelectedRecipients([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedRecipients.length === 0) {
            setValidationError('Please select at least one recipient from the list below.');
            return;
        }

        setSending(true);

        for (const recipientId of selectedRecipients) {
            const formData = new FormData();
            formData.append('receiver_id', recipientId.toString());
            formData.append('subject', subject);
            formData.append('message', message);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            try {
                await new Promise((resolve) => {
                    router.post('/teacher/messages/send', formData, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => resolve(true),
                        onError: () => resolve(false),
                    });
                });
            } catch (err) {
                console.error(err);
            }
        }

        setSending(false);
        router.visit('/teacher/messages');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Compose Message" />

            <div className="space-y-4 pb-8 max-w-4xl mx-auto">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title="Compose Direct Message"
                    subtitle="Send official circulars, student queries, or faculty announcements"
                    backUrl="/teacher/messages"
                    badges={[
                        { label: `${selectedRecipients.length} Selected`, variant: selectedRecipients.length > 0 ? 'success' : 'neutral' }
                    ]}
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 2. RECIPIENT SELECTOR CARD */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRecipientType('student');
                                        setSelectedRecipients([]);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        recipientType === 'student'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Students ({students.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRecipientType('teacher');
                                        setSelectedRecipients([]);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        recipientType === 'teacher'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Teachers & Staff ({teachers.length})
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    Select All
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search ${recipientType} by name...`}
                                className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            />
                        </div>

                        {validationError && (
                            <p className="text-xs text-rose-600 font-medium">{validationError}</p>
                        )}

                        {/* Recipient Chips Container */}
                        <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {filteredRecipients.map((r) => {
                                const isSelected = selectedRecipients.includes(r.id);
                                return (
                                    <div
                                        key={r.id}
                                        onClick={() => toggleRecipient(r.id)}
                                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="truncate">{r.name}</p>
                                            {recipientType === 'student' && (
                                                <p className="text-[10px] text-slate-400">
                                                    {(r as Student).class} • Roll #{(r as Student).roll}
                                                </p>
                                            )}
                                        </div>
                                        {isSelected ? (
                                            <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                                        ) : (
                                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. MESSAGE COMPOSER CARD */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Message subject..."
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Message Content</label>
                            <textarea
                                required
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Attachment (Optional)</label>
                            <input
                                type="file"
                                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Link
                                href="/teacher/messages"
                                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {sending ? 'Broadcasting...' : `Send to (${selectedRecipients.length})`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
