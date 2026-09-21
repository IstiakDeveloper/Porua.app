import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, ArrowLeft } from 'lucide-react';

export default function Create() {
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, errors, processing } = useForm({
        title: '',
        content: '',
        type: 'general',
        priority: 'normal',
        target_audience: [] as string[],
        target_classes: [] as string[],
        valid_from: '',
        valid_to: '',
        send_sms: false,
        send_email: false,
        is_published: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/notices');
    };

    const audienceOptions = [
        { value: 'all', label: 'All' },
        { value: 'students', label: 'Students' },
        { value: 'teachers', label: 'Teachers' },
        { value: 'parents', label: 'Parents' },
        { value: 'staff', label: 'Staff' },
    ];

    const toggleAudience = (value: string) => {
        const current = data.target_audience || [];
        if (current.includes(value)) {
            setData('target_audience', current.filter(v => v !== value));
        } else {
            setData('target_audience', [...current, value]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Notice" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Notice</h1>
                        <p className="text-gray-600 mt-1">Add a new notice or announcement</p>
                    </div>
                    <Button variant="secondary" onClick={() => router.get('/notices')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter notice title"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter notice content"
                                />
                                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="general">General</option>
                                        <option value="academic">Academic</option>
                                        <option value="event">Event</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Audience
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {audienceOptions.map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.target_audience.includes(option.value)}
                                                onChange={() => toggleAudience(option.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valid From
                                    </label>
                                    <input
                                        type="date"
                                        value={data.valid_from}
                                        onChange={(e) => setData('valid_from', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid To</label>
                                    <input
                                        type="date"
                                        value={data.valid_to}
                                        onChange={(e) => setData('valid_to', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.send_sms}
                                        onChange={(e) => setData('send_sms', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Send SMS</span>
                                </label>

                                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.send_email}
                                        onChange={(e) => setData('send_email', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Send Email</span>
                                </label>

                                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Publish Now</span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button type="button" variant="secondary" onClick={() => router.get('/notices')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Notice'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
