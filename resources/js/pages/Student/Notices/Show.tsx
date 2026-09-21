import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, AlertCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/Card';

interface Notice {
    id: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    attachment: string | null;
    valid_from: string | null;
    valid_to: string | null;
    created_at: string;
    created_by: string;
}

interface Props {
    notice: Notice;
}

export default function Show({ notice }: Props) {
    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white"><AlertCircle className="mr-1 h-3 w-3" />Urgent</span>;
            case 'high':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600 text-white">High</span>;
            case 'medium':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">Medium</span>;
            case 'low':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">Low</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{priority}</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'Academic': 'bg-blue-600',
            'Administrative': 'bg-purple-600',
            'Event': 'bg-green-600',
            'Holiday': 'bg-yellow-600',
            'Exam': 'bg-red-600',
            'General': 'bg-gray-600'
        };
        return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colors[type] || 'bg-gray-600'}`}>{type}</span>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Notice Details
                    </h2>
                    <Link
                        href="/student/notices"
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Notices
                    </Link>
                </div>
            }
        >
            <Head title={notice.title} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {getTypeBadge(notice.type)}
                                    {getPriorityBadge(notice.priority)}
                                </div>
                                <CardTitle className="text-2xl">{notice.title}</CardTitle>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {notice.created_at}
                                    </div>
                                    <div>
                                        By: {notice.created_by}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-6">
                                {/* Validity Period */}
                                {(notice.valid_from || notice.valid_to) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-900 mb-1">Validity Period</h4>
                                                <div className="text-sm text-blue-700">
                                                    {notice.valid_from && <div>Valid From: {notice.valid_from}</div>}
                                                    {notice.valid_to && <div>Valid Until: {notice.valid_to}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notice Content</h3>
                                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                        {notice.content}
                                    </div>
                                </div>

                                {/* Attachment */}
                                {notice.attachment && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachment</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <FileText className="h-8 w-8 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {notice.attachment.split('/').pop()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Click to download</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`/storage/${notice.attachment}`}
                                                download
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
