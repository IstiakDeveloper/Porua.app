import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Filter, Eye, Edit, Trash2, Pin, AlertCircle } from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    target_audience: string[] | null;
    valid_from: string | null;
    valid_to: string | null;
    is_published: boolean;
    published_at: string | null;
    created_by: number;
    creator?: {
        name: string;
    };
}

interface Props {
    notices: {
        data: Notice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: any[];
    };
    filters: {
        type?: string;
        is_published?: boolean;
    };
}

export default function Index({ notices, filters }: Props) {
    const priorityColors: Record<string, string> = {
        low: 'bg-gray-100 text-gray-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
    };

    const typeColors: Record<string, string> = {
        general: 'bg-blue-100 text-blue-800',
        academic: 'bg-purple-100 text-purple-800',
        event: 'bg-green-100 text-green-800',
        holiday: 'bg-yellow-100 text-yellow-800',
        urgent: 'bg-red-100 text-red-800',
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/notices', { ...filters, [key]: value });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this notice?')) {
            router.delete(`/notices/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notices" />
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                            Notices
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage school notices and announcements</p>
                    </div>
                    <Link href="/notices/create" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto justify-center cursor-pointer">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Notice
                        </Button>
                    </Link>
                </div>

                <Card>
                    <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                                <Filter className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                                Type
                            </label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => handleFilter('type', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Types</option>
                                <option value="general">General</option>
                                <option value="academic">Academic</option>
                                <option value="event">Event</option>
                                <option value="holiday">Holiday</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                                Status
                            </label>
                            <select
                                value={filters.is_published?.toString() || ''}
                                onChange={(e) => handleFilter('is_published', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="1">Published</option>
                                <option value="0">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Mobile Card Feed (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100 -mx-4 sm:mx-0">
                        {notices.data.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs font-medium">No notices found</p>
                            </div>
                        ) : (
                            notices.data.map((notice) => (
                                <div key={notice.id} className="p-4 space-y-2.5 active:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-gray-900 leading-snug">{notice.title}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{notice.content}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${notice.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {notice.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${typeColors[notice.type]}`}>
                                            {notice.type}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${priorityColors[notice.priority]}`}>
                                            {notice.priority}
                                        </span>
                                        {notice.published_at && (
                                            <span className="text-[11px] text-gray-400 font-mono ml-auto">
                                                {new Date(notice.published_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {notice.target_audience && notice.target_audience.length > 0 && (
                                        <p className="text-[11px] text-gray-400">
                                            Target: <span className="text-gray-600">{notice.target_audience.join(', ')}</span>
                                        </p>
                                    )}

                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                        <Link href={`/notices/${notice.id}/edit`}>
                                            <Button size="sm" variant="secondary" className="text-xs py-1 px-2.5">
                                                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            className="text-xs py-1 px-2.5"
                                            onClick={() => handleDelete(notice.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notice
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Published
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {notices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No notices found
                                        </td>
                                    </tr>
                                ) : (
                                    notices.data.map((notice) => (
                                        <tr key={notice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{notice.content}</div>
                                                    {notice.target_audience && notice.target_audience.length > 0 && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Target: {notice.target_audience.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[notice.type]}`}>
                                                    {notice.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[notice.priority]}`}>
                                                    {notice.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${notice.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {notice.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {notice.published_at ? new Date(notice.published_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/notices/${notice.id}/edit`}>
                                                        <Button size="sm" variant="secondary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(notice.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <IndexPagination
                        links={notices.links ?? []}
                        from={notices.from}
                        to={notices.to}
                        total={notices.total}
                        lastPage={notices.last_page}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
