import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Mail,
    Send,
    Inbox,
    User,
    Calendar,
    Search
} from 'lucide-react';

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

export default function Index({ messages, unread_count }: Props) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [searchTerm, setSearchTerm] = useState('');

    const filterMessages = (messageList: Message[]) => {
        return messageList.filter(msg =>
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const MessageCard = ({ message, isSent }: { message: Message; isSent: boolean }) => (
        <div
            className={`p-5 border rounded-lg cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300 ${
                !message.is_read && !isSent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => router.get(`/teacher/messages/${message.id}`)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                            {isSent ? message.receiver_name : message.sender_name}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {isSent ? 'To' : (message.sender_role || 'Unknown')}
                        </span>
                        {!message.is_read && !isSent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">New</span>
                        )}
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-900">{message.subject}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{message.message}</p>
                    <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {message.sent_at}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header with Compose Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                            <p className="text-sm text-gray-600 mt-1">Send and receive messages</p>
                        </div>
                        <button
                            onClick={() => router.visit('/teacher/messages/create')}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Send className="mr-2 h-5 w-5" />
                            Compose Message
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">My Messages</h3>
                        </div>
                        <div className="p-6">
                            <div className="border-b border-gray-200 mb-6">
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => setActiveTab('inbox')}
                                        className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                                            activeTab === 'inbox'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Inbox className="mr-2 h-4 w-4" />
                                        Inbox
                                        {unread_count > 0 && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {unread_count}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sent')}
                                        className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                                            activeTab === 'sent'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Sent
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'inbox' && (
                                <div>
                                    {filterMessages(messages.inbox).length > 0 ? (
                                        <div className="space-y-3">
                                            {filterMessages(messages.inbox).map((message) => (
                                                <MessageCard key={message.id} message={message} isSent={false} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">No messages in inbox</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'sent' && (
                                <div>
                                    {filterMessages(messages.sent).length > 0 ? (
                                        <div className="space-y-3">
                                            {filterMessages(messages.sent).map((message) => (
                                                <MessageCard key={message.id} message={message} isSent={true} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Send className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">No sent messages</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
