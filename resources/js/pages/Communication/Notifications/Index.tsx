import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import { Bell, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    action_url: string | null;
}

interface Props {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: any[];
    };
}

export default function Index({ notifications }: Props) {
    const typeIcons: Record<string, any> = {
        info: Info,
        success: CheckCircle,
        warning: AlertCircle,
        error: AlertCircle,
    };

    const typeColors: Record<string, string> = {
        info: 'text-blue-500 bg-blue-50',
        success: 'text-green-500 bg-green-50',
        warning: 'text-yellow-500 bg-yellow-50',
        error: 'text-red-500 bg-red-50',
    };

    const handleMarkAsRead = (id: number) => {
        router.post(`/notifications/${id}/mark-as-read`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            router.delete(`/notifications/${id}`);
        }
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/mark-all-as-read');
    };

    const handleDeleteAll = () => {
        if (confirm('Are you sure you want to delete all notifications?')) {
            router.post('/notifications/delete-all');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notifications
                        </h1>
                        <p className="text-gray-600 mt-1">View all your notifications</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleMarkAllAsRead}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark All as Read
                        </Button>
                        <Button variant="danger" onClick={handleDeleteAll}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
                        </Button>
                    </div>
                </div>

                <Card>
                    <div className="space-y-4">
                        {notifications.data.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.data.map((notification) => {
                                const Icon = typeIcons[notification.notification_type] || Info;
                                return (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                                            notification.is_read
                                                ? 'bg-white border-gray-200'
                                                : 'bg-blue-50 border-blue-200'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${typeColors[notification.notification_type]}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!notification.is_read && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(notification.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {notification.action_url && (
                                                <a
                                                    href={notification.action_url}
                                                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    View Details →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <IndexPagination
                        links={notifications.links ?? []}
                        from={notifications.from}
                        to={notifications.to}
                        total={notifications.total}
                        lastPage={notifications.last_page}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
