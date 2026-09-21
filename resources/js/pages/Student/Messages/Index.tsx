import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Mail,
    Send,
    Inbox,
    Reply,
    Trash2,
    Search,
    PlusCircle,
    User,
    Calendar,
    Paperclip
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';

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

export default function Index({ messages, unread_count, recipients }: Props) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCompose, setShowCompose] = useState(false);
    const [composeData, setComposeData] = useState({
        receiver_id: '',
        subject: '',
        message: ''
    });

    const handleCompose = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/student/messages', composeData, {
            onSuccess: () => {
                setShowCompose(false);
                setComposeData({ receiver_id: '', subject: '', message: '' });
            }
        });
    };

    const handleReply = (messageId: number) => {
        router.get(`/student/messages/${messageId}`);
    };

    const filterMessages = (messageList: Message[]) => {
        if (!messageList || !Array.isArray(messageList)) return [];
        return messageList.filter(msg =>
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const MessageCard = ({ message, isSent }: { message: Message; isSent: boolean }) => (
        <div
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                !message.is_read && !isSent ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => router.get(`/student/messages/${message.id}`)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold">
                                {isSent ? message.recipient_name : message.sender_name}
                            </span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
                            {isSent ? 'To' : 'From'}: {isSent ? message.recipient_name : message.sender_role}
                        </span>
                        {!message.is_read && !isSent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">New</span>
                        )}
                        {message.has_attachment && (
                            <Paperclip className="h-4 w-4 text-gray-500" />
                        )}
                    </div>

                    <h4 className="font-semibold text-lg mb-2">{message.subject}</h4>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {message.message}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {message.sent_at}
                        </span>
                        {message.read_at && (
                            <span>Read: {message.read_at}</span>
                        )}
                    </div>
                </div>

                {!isSent && (
                    <button
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReply(message.id);
                        }}
                    >
                        <Reply className="h-4 w-4" />
                    </button>
                )}
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
                            onClick={() => setShowCompose(!showCompose)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Compose Message
                        </button>
                    </div>
                    {/* Compose Message */}
                    {showCompose && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Send className="mr-2 h-5 w-5" />
                                    Compose Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCompose} className="space-y-4">
                                    <div>
                                        <label htmlFor="receiver_id" className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
                                        <select
                                            id="receiver_id"
                                            value={composeData.receiver_id}
                                            onChange={(e) => setComposeData({ ...composeData, receiver_id: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="">-- Select Recipient --</option>
                                            {recipients.map((recipient) => (
                                                <option key={recipient.id} value={recipient.id}>
                                                    {recipient.name} ({recipient.role})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Select a teacher or admin to send your message</p>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <input
                                            id="subject"
                                            type="text"
                                            placeholder="Message subject"
                                            value={composeData.subject}
                                            onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea
                                            id="message"
                                            rows={6}
                                            placeholder="Type your message here..."
                                            value={composeData.message}
                                            onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button type="submit" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Message
                                        </button>
                                        <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Search Bar */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Messages Tabs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex space-x-4">
                                    <button
                                        onClick={() => setActiveTab('inbox')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === 'inbox'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Inbox className="inline-block mr-2 h-4 w-4" />
                                        Inbox
                                        {unread_count > 0 && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                                                {unread_count}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sent')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === 'sent'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Send className="inline-block mr-2 h-4 w-4" />
                                        Sent
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'inbox' && (
                                <div className="mt-6">
                                    {filterMessages(messages.inbox).length > 0 ? (
                                        <div className="space-y-3">
                                            {filterMessages(messages.inbox).map((message) => (
                                                <MessageCard key={message.id} message={message} isSent={false} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">
                                                {searchTerm ? 'No messages found' : 'No messages in inbox'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'sent' && (
                                <div className="mt-6">
                                    {filterMessages(messages.sent).length > 0 ? (
                                        <div className="space-y-3">
                                            {filterMessages(messages.sent).map((message) => (
                                                <MessageCard key={message.id} message={message} isSent={true} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Send className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">
                                                {searchTerm ? 'No messages found' : 'No sent messages'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
