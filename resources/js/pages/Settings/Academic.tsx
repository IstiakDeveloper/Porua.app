import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, GraduationCap, Clock, Calendar, AlertCircle } from 'lucide-react';

interface Props {
    settings: {
        academic_year_start_month?: string;
        class_duration_minutes?: string;
        attendance_marking_time?: string;
        late_arrival_minutes?: string;
        exam_pass_percentage?: string;
    };
}

export default function Academic({ settings }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, errors, processing } = useForm({
        settings: [
            { key: 'academic_year_start_month', value: settings.academic_year_start_month || '1' },
            { key: 'class_duration_minutes', value: settings.class_duration_minutes || '45' },
            { key: 'attendance_marking_time', value: settings.attendance_marking_time || '09:00' },
            { key: 'late_arrival_minutes', value: settings.late_arrival_minutes || '15' },
            { key: 'exam_pass_percentage', value: settings.exam_pass_percentage || '40' },
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

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Academic Settings" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Academic Settings
                        </h1>
                        <p className="text-gray-600 mt-1">Configure academic year and class settings</p>
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
                                    <Calendar className="h-4 w-4" />
                                    Academic Year Start Month
                                </label>
                                <select
                                    value={getSetting('academic_year_start_month')}
                                    onChange={(e) => updateSetting('academic_year_start_month', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">The month when the academic year begins</p>
                                {errors['settings.0.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.0.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Class Duration (Minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={getSetting('class_duration_minutes')}
                                    onChange={(e) => updateSetting('class_duration_minutes', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="45"
                                />
                                <p className="text-sm text-gray-500 mt-1">Standard duration for each class period</p>
                                {errors['settings.1.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.1.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Attendance Marking Time
                                </label>
                                <input
                                    type="time"
                                    value={getSetting('attendance_marking_time')}
                                    onChange={(e) => updateSetting('attendance_marking_time', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">Time when attendance should be marked</p>
                                {errors['settings.2.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.2.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Late Arrival Tolerance (Minutes)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={getSetting('late_arrival_minutes')}
                                    onChange={(e) => updateSetting('late_arrival_minutes', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="15"
                                />
                                <p className="text-sm text-gray-500 mt-1">Grace period before marking student as late</p>
                                {errors['settings.3.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.3.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Exam Pass Percentage
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={getSetting('exam_pass_percentage')}
                                    onChange={(e) => updateSetting('exam_pass_percentage', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="40"
                                />
                                <p className="text-sm text-gray-500 mt-1">Minimum percentage required to pass an exam</p>
                                {errors['settings.4.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.4.value']}</p>
                                )}
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
