import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Mail,
    User,
    Clock,
    Download,
    Reply,
    Paperclip
} from 'lucide-react';

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

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.get('/teacher/messages')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Messages
                    </button>

                    {/* Message Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <h1 className="text-2xl font-bold text-gray-900 flex-1 pr-4">
                                    {message.subject}
                                </h1>
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    <Mail className="w-4 h-4" />
                                    {message.read_at ? 'Read' : 'Unread'}
                                </div>
                            </div>

                            {/* Meta Information */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>From: <span className="font-semibold text-gray-900">{message.sender_name}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>To: <span className="font-semibold text-gray-900">{message.receiver_name}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>Sent: {message.sent_at}</span>
                                    {message.read_at && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <span>Read: {message.read_at}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="px-8 py-6">
                            <div className="prose max-w-none">
                                <div
                                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: message.message }}
                                />
                            </div>

                            {/* Attachment */}
                            {message.attachment && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <Paperclip className="w-5 h-5 text-gray-600" />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-gray-900">Attachment</h3>
                                            <p className="text-xs text-gray-500">{message.attachment.split('/').pop()}</p>
                                        </div>
                                        <a
                                            href={`/storage/${message.attachment}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => router.get('/teacher/messages')}
                                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back to Messages
                                </button>
                                <button
                                    onClick={() => router.get('/teacher/messages/create', {
                                        receiver_id: message.sender_name
                                    })}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
