import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Select from '@/Components/Select';
import { MessageSquare, Send, Search, Mail, Eye } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Parent {
    id: number;
    father_name: string;
}

interface Message {
    id: number;
    subject: string;
    message: string;
    sender: {
        name: string;
    };
    recipient: {
        name: string;
    };
    read_at: string | null;
    created_at: string;
}

interface Props {
    parent: Parent;
    inbox: Message[];
    sent: Message[];
    unreadCount: number;
}

export default function Index({ parent, inbox, sent, unreadCount }: Props) {
    const [showCompose, setShowCompose] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('inbox');

    const { data, setData, post, processing, errors, reset } = useForm({
        recipient_type: 'Teacher',
        recipient_id: '',
        subject: '',
        message: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('parent.messages.send'), {
            onSuccess: () => {
                reset();
                setShowCompose(false);
            },
        });
    };

    const filteredInbox = inbox.filter((msg) =>
        msg.subject.toLowerCase().includes(search.toLowerCase()) ||
        msg.message.toLowerCase().includes(search.toLowerCase()) ||
        msg.sender.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSent = sent.filter((msg) =>
        msg.subject.toLowerCase().includes(search.toLowerCase()) ||
        msg.message.toLowerCase().includes(search.toLowerCase()) ||
        msg.recipient.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Messages</h1>
                        <p className="text-gray-600">Communicate with teachers and administrators</p>
                    </div>

                    {/* Compose Message */}
                    {showCompose && (
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Compose Message</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Select
                                                    label="Recipient Type"
                                                    value={data.recipient_type}
                                                    onChange={(e) => setData('recipient_type', e.target.value)}
                                                    options={[
                                                        { value: 'Teacher', label: 'Teacher' },
                                                        { value: 'Admin', label: 'Admin' }
                                                    ]}
                                                    error={errors.recipient_type}
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    label="Recipient ID"
                                                    type="number"
                                                    value={data.recipient_id}
                                                    onChange={(e) => setData('recipient_id', e.target.value)}
                                                    placeholder="Enter recipient user ID"
                                                    error={errors.recipient_id}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Input
                                                label="Subject"
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                placeholder="Enter message subject"
                                                error={errors.subject}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                            <textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Enter your message"
                                                rows={6}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.message && (
                                                <p className="text-sm text-red-600 mt-1">{errors.message}</p>
                                            )}
                                        </div>
                                        <Button onClick={handleSubmit} disabled={processing}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Messages */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>My Messages</CardTitle>
                                {!showCompose && (
                                    <Button onClick={() => setShowCompose(true)}>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Compose
                                    </Button>
                                )}
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search messages..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Tab Buttons */}
                            <div className="grid w-full grid-cols-2 mb-4 border-b">
                                <button
                                    onClick={() => setActiveTab('inbox')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'inbox'
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Inbox
                                    {unreadCount > 0 && (
                                        <Badge variant="default" className="ml-2">{unreadCount}</Badge>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('sent')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'sent'
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Sent
                                </button>
                            </div>

                            {/* Inbox Tab */}
                            {activeTab === 'inbox' && (
                                <div className="space-y-3">
                                    {filteredInbox.length > 0 ? (
                                        filteredInbox.map((message) => (
                                            <Link
                                                key={message.id}
                                                href={route('parent.messages.show', message.id)}
                                                className={`block p-4 border rounded-lg hover:bg-gray-50 transition ${
                                                    !message.read_at ? 'bg-blue-50 border-blue-200' : ''
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-5 w-5 text-gray-400" />
                                                        <h4 className="font-semibold">{message.subject}</h4>
                                                        {!message.read_at && (
                                                            <Badge variant="default" className="ml-2">New</Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(message.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    From: <span className="font-medium">{message.sender.name}</span>
                                                </p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No messages in inbox</p>
                                    )}
                                </div>
                            )}

                            {/* Sent Tab */}
                            {activeTab === 'sent' && (
                                <div className="space-y-3">
                                    {filteredSent.length > 0 ? (
                                        filteredSent.map((message) => (
                                            <Link
                                                key={message.id}
                                                href={route('parent.messages.show', message.id)}
                                                className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Send className="h-5 w-5 text-gray-400" />
                                                        <h4 className="font-semibold">{message.subject}</h4>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(message.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    To: <span className="font-medium">{message.recipient.name}</span>
                                                </p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No sent messages</p>
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
