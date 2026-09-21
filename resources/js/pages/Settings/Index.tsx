import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import {
    Building2,
    GraduationCap,
    DollarSign,
    Mail,
    Bell,
    Database,
    Settings as SettingsIcon,
    ChevronRight,
    Server
} from 'lucide-react';

interface SettingCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
}

export default function Index() {
    const settingCards: SettingCard[] = [
        {
            title: 'General Settings',
            description: 'Configure school basic information and details',
            icon: <Building2 className="w-6 h-6" />,
            href: '/settings/general',
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Academic Settings',
            description: 'Manage academic year, class duration, and exam settings',
            icon: <GraduationCap className="w-6 h-6" />,
            href: '/settings/academic',
            color: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Fee Settings',
            description: 'Configure fee structure, late fees, and payment options',
            icon: <DollarSign className="w-6 h-6" />,
            href: '/settings/fee',
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Email Settings',
            description: 'Setup SMTP configuration for email notifications',
            icon: <Mail className="w-6 h-6" />,
            href: '/settings/email',
            color: 'bg-orange-100 text-orange-600',
        },
        {
            title: 'Notification Settings',
            description: 'Manage notification preferences and alerts',
            icon: <Bell className="w-6 h-6" />,
            href: '/settings/notification',
            color: 'bg-yellow-100 text-yellow-600',
        },
        {
            title: 'Device Settings',
            description: 'Configure ZKTeco attendance device and rules',
            icon: <Server className="w-6 h-6" />,
            href: '/device-settings',
            color: 'bg-indigo-100 text-indigo-600',
        },
        {
            title: 'Backup & Restore',
            description: 'Manage database backups and system restore',
            icon: <Database className="w-6 h-6" />,
            href: '/settings/backup',
            color: 'bg-red-100 text-red-600',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-gray-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                        <p className="text-gray-600">Configure and manage system preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settingCards.map((card, index) => (
                        <Link key={index} href={card.href}>
                            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${card.color}`}>
                                        {card.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {card.description}
                                        </p>
                                        <div className="flex items-center text-blue-600 text-sm font-medium">
                                            Configure
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
