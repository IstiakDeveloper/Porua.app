import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    User,
    Calendar,
    Reply,
    Send,
    Paperclip,
    Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/Card';

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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.get('/student/messages')}
                            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Message Details
                        </h2>
                    </div>
                    {can_reply && (
                        <button
                            onClick={() => setShowReply(!showReply)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                        >
                            <Reply className="mr-2 h-4 w-4" />
                            Reply
                        </button>
                    )}
                </div>
            }
        >
            <Head title={message.subject} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Message Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl mb-4">{message.subject}</CardTitle>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4" />
                                            <div>
                                                <span className="font-medium text-gray-900">{message.sender_name}</span>
                                                <span className="ml-2 text-gray-500">({message.sender_role})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{message.sent_at}</span>
                                        </div>
                                    </div>
                                    {message.read_at && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Read: {message.read_at}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                            </div>

                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                        <Paperclip className="mr-2 h-4 w-4" />
                                        Attachments ({message.attachments.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {message.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={`/storage/${attachment.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Paperclip className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">{attachment.file_name}</p>
                                                        <p className="text-xs text-gray-500">{attachment.file_size}</p>
                                                    </div>
                                                </div>
                                                <Download className="h-4 w-4 text-gray-400" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reply Form */}
                    {showReply && can_reply && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Reply className="mr-2 h-5 w-5" />
                                    Reply to Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleReply} className="space-y-4">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            type="text"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={6}
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            required
                                            placeholder="Type your reply here..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {processing ? 'Sending...' : 'Send Reply'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowReply(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.get('/student/messages')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Messages
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
