import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Send, UserPlus, Users, X } from 'lucide-react';

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

export default function Create({ students, teachers }: Props) {
    const [recipientType, setRecipientType] = useState<'student' | 'teacher'>('student');
    const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sending, setSending] = useState(false);

    const recipients = recipientType === 'student' ? students : teachers;

    const filteredRecipients = recipients.filter(recipient =>
        recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipientType === 'student' && (recipient as Student).roll?.includes(searchTerm))
    );

    const toggleRecipient = (id: number) => {
        setSelectedRecipients(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedRecipients(filteredRecipients.map(r => r.id));
    };

    const clearAll = () => {
        setSelectedRecipients([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedRecipients.length === 0) {
            alert('Please select at least one recipient');
            return;
        }

        console.log('Starting to send messages...');
        console.log('Selected Recipients:', selectedRecipients);
        console.log('Subject:', subject);
        console.log('Message:', message);

        setSending(true);

        let successCount = 0;
        let errorCount = 0;

        // Send message to each recipient using Inertia router
        for (const recipientId of selectedRecipients) {
            console.log('Sending to recipient ID:', recipientId);

            const formData = new FormData();
            formData.append('receiver_id', recipientId.toString());
            formData.append('subject', subject);
            formData.append('message', message);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            try {
                // Using Inertia router.post which handles CSRF automatically
                await new Promise((resolve, reject) => {
                    router.post('/teacher/messages/send', formData, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            console.log('Success for recipient:', recipientId);
                            successCount++;
                            resolve(true);
                        },
                        onError: (errors) => {
                            console.error('Error for recipient:', recipientId, errors);
                            errorCount++;
                            reject(errors);
                        },
                    });
                }).catch(() => {
                    // Error already counted in onError
                });
            } catch (error) {
                console.error('Exception while sending message:', error);
                if (!errorCount) errorCount++;
            }
        }

        setSending(false);

        console.log('Final counts - Success:', successCount, 'Error:', errorCount);

        if (successCount > 0) {
            router.visit('/teacher/messages');
        } else {
            alert('Failed to send messages. Please check console for errors.');
        }
    };

    const getSelectedNames = () => {
        return recipients
            .filter(r => selectedRecipients.includes(r.id))
            .map(r => r.name)
            .join(', ');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Compose New Message
                </h2>
            }
        >
            <Head title="Compose Message" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            {/* Recipient Type Selection */}
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Recipients</h3>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRecipientType('student');
                                            setSelectedRecipients([]);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                            recipientType === 'student'
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Students ({students.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRecipientType('teacher');
                                            setSelectedRecipients([]);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                            recipientType === 'teacher'
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Users className="w-4 h-4" />
                                        Teachers ({teachers.length})
                                    </button>
                                </div>
                            </div>

                            {/* Search and Select Recipients */}
                            <div className="p-6">
                                <div className="flex gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search recipients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Selected Count */}
                                {selectedRecipients.length > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>{selectedRecipients.length}</strong> recipient(s) selected
                                        </p>
                                    </div>
                                )}

                                {/* Recipients List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                    {filteredRecipients.map((recipient) => (
                                        <label
                                            key={recipient.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                                selectedRecipients.includes(recipient.id)
                                                    ? 'bg-blue-50 border-blue-500 shadow-md'
                                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRecipients.includes(recipient.id)}
                                                    onChange={() => toggleRecipient(recipient.id)}
                                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{recipient.name}</p>
                                                    {recipientType === 'student' && (
                                                        <p className="text-xs text-gray-500">
                                                            Roll: {(recipient as Student).roll} | {(recipient as Student).class} - {(recipient as Student).section}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Message Form */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">Message Content</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter message subject"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Type your message here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Attachment (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max size: 5MB. Allowed: PDF, DOC, DOCX, JPG, PNG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.visit('/teacher/messages')}
                                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={sending || selectedRecipients.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                {sending ? 'Sending...' : `Send to ${selectedRecipients.length} Recipients`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
