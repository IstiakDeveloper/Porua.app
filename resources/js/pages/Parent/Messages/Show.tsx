import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Mail, User, Calendar, Paperclip, CheckCircle } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'parent.messages.index': '/parent/messages',
    };
    return routes[name] || '/';
}

interface Message {
    id: number;
    subject: string;
    message: string;
    sender_name: string;
    recipient_name: string;
    attachments: any;
    read_at: string | null;
    created_at: string;
}

interface Props {
    message: Message;
}

export default function Show({ message }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={message.subject} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('parent.messages.index')}>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Messages
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <Mail className="h-6 w-6 text-indigo-600 mt-1" />
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{message.subject}</h1>
                                        {message.read_at && (
                                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-green-600 text-green-600">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">From:</span>
                                    <span className="font-medium">{message.sender_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">To:</span>
                                    <span className="font-medium">{message.recipient_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium">
                                        {new Date(message.created_at).toLocaleString()}
                                    </span>
                                </div>
                                {message.read_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">Read At:</span>
                                        <span className="font-medium">
                                            {new Date(message.read_at).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-lg">
                                    {message.message}
                                </div>
                            </div>

                            {message.attachments && message.attachments.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Paperclip className="h-5 w-5" />
                                        Attachments
                                    </h3>
                                    <div className="space-y-2">
                                        {message.attachments.map((attachment: any, index: number) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <Paperclip className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium">{attachment.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
