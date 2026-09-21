import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Bell, Calendar, Eye, Paperclip, Pin } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'parent.notices.index': '/parent/notices',
    };
    return routes[name] || '/';
}

interface Notice {
    id: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    publish_date: string;
    attachments: any;
    is_pinned: boolean;
    view_count: number;
    created_at: string;
}

interface Props {
    notice: Notice;
}

export default function Show({ notice }: Props) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam':
                return 'bg-purple-100 text-purple-800';
            case 'holiday':
                return 'bg-green-100 text-green-800';
            case 'event':
                return 'bg-yellow-100 text-yellow-800';
            case 'general':
                return 'bg-blue-100 text-blue-800';
            case 'fee':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={notice.title} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('parent.notices.index')}>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Notices
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <Bell className="h-6 w-6 text-indigo-600 mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {notice.is_pinned && (
                                                <Pin className="h-5 w-5 text-blue-600" />
                                            )}
                                            <h1 className="text-2xl font-bold text-gray-900">{notice.title}</h1>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getTypeColor(notice.type)}`}>
                                                {notice.type}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getPriorityColor(notice.priority)}`}>
                                                {notice.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <div>
                                        <p className="text-xs">Published Date</p>
                                        <p className="font-medium">
                                            {new Date(notice.publish_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Eye className="h-4 w-4" />
                                    <div>
                                        <p className="text-xs">Views</p>
                                        <p className="font-medium">{notice.view_count}</p>
                                    </div>
                                </div>
                                {notice.attachments && notice.attachments.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Paperclip className="h-4 w-4" />
                                        <div>
                                            <p className="text-xs">Attachments</p>
                                            <p className="font-medium">{notice.attachments.length} file(s)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {notice.description}
                                </div>
                            </div>

                            {notice.attachments && notice.attachments.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Paperclip className="h-5 w-5" />
                                        Attachments
                                    </h3>
                                    <div className="space-y-2">
                                        {notice.attachments.map((attachment: any, index: number) => (
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

                            <div className="border-t pt-6 mt-6">
                                <p className="text-xs text-gray-500">
                                    Posted on {new Date(notice.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
