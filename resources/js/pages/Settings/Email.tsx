import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, Mail, Server, Lock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    settings: {
        email_from_address?: string;
        email_from_name?: string;
        smtp_host?: string;
        smtp_port?: string;
        smtp_username?: string;
        smtp_password?: string;
        smtp_encryption?: string;
    };
}

export default function Email({ settings }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        settings: [
            { key: 'email_from_address', value: settings.email_from_address || '' },
            { key: 'email_from_name', value: settings.email_from_name || '' },
            { key: 'smtp_host', value: settings.smtp_host || '' },
            { key: 'smtp_port', value: settings.smtp_port || '587' },
            { key: 'smtp_username', value: settings.smtp_username || '' },
            { key: 'smtp_password', value: settings.smtp_password || '' },
            { key: 'smtp_encryption', value: settings.smtp_encryption || 'tls' },
        ],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings');
    };

    const updateSetting = (key: string, value: string) => {
        setData('settings', data.settings.map(s =>
            s.key === key ? { ...s, value } : s
        ));
    };

    const getSetting = (key: string) => {
        return data.settings.find(s => s.key === key)?.value || '';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Email Settings" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Mail className="h-6 w-6" />
                            Email Settings
                        </h1>
                        <p className="text-gray-600 mt-1">Configure SMTP settings for outgoing emails</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {flash.error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    From Email Address
                                </label>
                                <input
                                    type="email"
                                    value={getSetting('email_from_address')}
                                    onChange={(e) => updateSetting('email_from_address', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="noreply@school.com"
                                />
                                <p className="text-sm text-gray-500 mt-1">Email address used as sender</p>
                                {errors['settings.0.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.0.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Name
                                </label>
                                <input
                                    type="text"
                                    value={getSetting('email_from_name')}
                                    onChange={(e) => updateSetting('email_from_name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="School Management System"
                                />
                                <p className="text-sm text-gray-500 mt-1">Name displayed as sender</p>
                                {errors['settings.1.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.1.value']}</p>
                                )}
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Server className="h-5 w-5" />
                                    SMTP Configuration
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Host
                                        </label>
                                        <input
                                            type="text"
                                            value={getSetting('smtp_host')}
                                            onChange={(e) => updateSetting('smtp_host', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="smtp.gmail.com"
                                        />
                                        {errors['settings.2.value'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['settings.2.value']}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Port
                                        </label>
                                        <input
                                            type="number"
                                            value={getSetting('smtp_port')}
                                            onChange={(e) => updateSetting('smtp_port', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="587"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Common ports: 587 (TLS), 465 (SSL), 25</p>
                                        {errors['settings.3.value'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['settings.3.value']}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Username
                                        </label>
                                        <input
                                            type="text"
                                            value={getSetting('smtp_username')}
                                            onChange={(e) => updateSetting('smtp_username', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="your-email@gmail.com"
                                        />
                                        {errors['settings.4.value'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['settings.4.value']}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            SMTP Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={getSetting('smtp_password')}
                                                onChange={(e) => updateSetting('smtp_password', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        {errors['settings.5.value'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['settings.5.value']}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Encryption
                                        </label>
                                        <select
                                            value={getSetting('smtp_encryption')}
                                            onChange={(e) => updateSetting('smtp_encryption', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                            <option value="">None</option>
                                        </select>
                                        {errors['settings.6.value'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['settings.6.value']}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
