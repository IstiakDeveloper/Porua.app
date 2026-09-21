import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
    settings: {
        enable_email_notifications?: string;
        enable_sms_notifications?: string;
        notify_on_attendance?: string;
        notify_on_fee_payment?: string;
        notify_on_exam_result?: string;
    };
}

export default function Notification({ settings }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, errors, processing } = useForm({
        settings: [
            { key: 'enable_email_notifications', value: settings.enable_email_notifications || '1' },
            { key: 'enable_sms_notifications', value: settings.enable_sms_notifications || '0' },
            { key: 'notify_on_attendance', value: settings.notify_on_attendance || '1' },
            { key: 'notify_on_fee_payment', value: settings.notify_on_fee_payment || '1' },
            { key: 'notify_on_exam_result', value: settings.notify_on_exam_result || '1' },
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
            <Head title="Notification Settings" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notification Settings
                        </h1>
                        <p className="text-gray-600 mt-1">Configure notification preferences</p>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={getSetting('enable_email_notifications') === '1'}
                                            onChange={(e) => updateSetting('enable_email_notifications', e.target.checked ? '1' : '0')}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Mail className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                                            <p className="text-xs text-gray-500">Send notifications via email</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={getSetting('enable_sms_notifications') === '1'}
                                            onChange={(e) => updateSetting('enable_sms_notifications', e.target.checked ? '1' : '0')}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <MessageSquare className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Enable SMS Notifications</span>
                                            <p className="text-xs text-gray-500">Send notifications via SMS</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Triggers</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={getSetting('notify_on_attendance') === '1'}
                                            onChange={(e) => updateSetting('notify_on_attendance', e.target.checked ? '1' : '0')}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Attendance Notifications</span>
                                            <p className="text-xs text-gray-500">Notify when attendance is marked</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={getSetting('notify_on_fee_payment') === '1'}
                                            onChange={(e) => updateSetting('notify_on_fee_payment', e.target.checked ? '1' : '0')}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Fee Payment Notifications</span>
                                            <p className="text-xs text-gray-500">Notify when fees are paid</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={getSetting('notify_on_exam_result') === '1'}
                                            onChange={(e) => updateSetting('notify_on_exam_result', e.target.checked ? '1' : '0')}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Exam Result Notifications</span>
                                            <p className="text-xs text-gray-500">Notify when exam results are published</p>
                                        </div>
                                    </label>
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
