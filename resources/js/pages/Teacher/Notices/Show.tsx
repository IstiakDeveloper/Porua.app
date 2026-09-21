import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    User,
    AlertCircle,
    FileText,
    Download,
    Clock
} from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    content: string;
    notice_type: string;
    priority: string;
    publish_date: string;
    valid_from: string | null;
    valid_to: string | null;
    attachment: string | null;
    created_by: string;
    created_at: string;
}

interface Props {
    notice: Notice;
}

export default function Show({ notice }: Props) {
    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        High Priority
                    </span>
                );
            case 'normal':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Normal
                    </span>
                );
            case 'low':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-gray-300 text-gray-700">
                        Low Priority
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {priority}
                    </span>
                );
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'Academic': 'bg-blue-100 text-blue-800',
            'General': 'bg-gray-100 text-gray-800',
            'Exam': 'bg-red-100 text-red-800',
            'Event': 'bg-green-100 text-green-800',
            'Holiday': 'bg-yellow-100 text-yellow-800',
            'Urgent': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
                <FileText className="mr-1 h-4 w-4" />
                {type}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Notice - ${notice.title}`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.get('/teacher/notices')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Notices
                    </button>

                    {/* Notice Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <h1 className="text-3xl font-bold text-gray-900 flex-1 pr-4">
                                    {notice.title}
                                </h1>
                                <div className="flex flex-col gap-2">
                                    {getPriorityBadge(notice.priority)}
                                    {getTypeBadge(notice.notice_type)}
                                </div>
                            </div>

                            {/* Meta Information */}
                            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Posted by: <span className="font-semibold text-gray-900">{notice.created_by}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{notice.created_at}</span>
                                </div>
                                {notice.publish_date && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Published: {notice.publish_date}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-6">
                            {/* Validity Period */}
                            {(notice.valid_from || notice.valid_to) && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-semibold">Valid Period:</span>
                                        {notice.valid_from && <span>From {notice.valid_from}</span>}
                                        {notice.valid_from && notice.valid_to && <span>-</span>}
                                        {notice.valid_to && <span>To {notice.valid_to}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Notice Content */}
                            <div className="prose max-w-none">
                                <div
                                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: notice.content }}
                                />
                            </div>

                            {/* Attachment */}
                            {notice.attachment && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachment</h3>
                                    <a
                                        href={`/storage/${notice.attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Attachment
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => router.get('/teacher/notices')}
                                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back to Notices
                                </button>
                                <div className="text-sm text-gray-500">
                                    Notice ID: #{notice.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
