import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, DollarSign, Calendar, AlertCircle, Calculator } from 'lucide-react';

interface Props {
    settings: {
        late_fee_per_day?: string;
        fee_due_days?: string;
        allow_partial_payment?: string;
        fine_calculation_method?: string;
    };
}

export default function Fee({ settings }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, errors, processing } = useForm({
        settings: [
            { key: 'late_fee_per_day', value: settings.late_fee_per_day || '10' },
            { key: 'fee_due_days', value: settings.fee_due_days || '30' },
            { key: 'allow_partial_payment', value: settings.allow_partial_payment || '1' },
            { key: 'fine_calculation_method', value: settings.fine_calculation_method || 'daily' },
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
            <Head title="Fee Settings" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="h-6 w-6" />
                            Fee Settings
                        </h1>
                        <p className="text-gray-600 mt-1">Configure fee collection and late payment settings</p>
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
                                    <DollarSign className="h-4 w-4" />
                                    Late Fee Per Day
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={getSetting('late_fee_per_day')}
                                    onChange={(e) => updateSetting('late_fee_per_day', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="10"
                                />
                                <p className="text-sm text-gray-500 mt-1">Amount charged per day for late payment</p>
                                {errors['settings.0.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.0.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fee Due Days
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={getSetting('fee_due_days')}
                                    onChange={(e) => updateSetting('fee_due_days', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="30"
                                />
                                <p className="text-sm text-gray-500 mt-1">Number of days before fee becomes overdue</p>
                                {errors['settings.1.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.1.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={getSetting('allow_partial_payment') === '1'}
                                        onChange={(e) => updateSetting('allow_partial_payment', e.target.checked ? '1' : '0')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Allow Partial Payment</span>
                                </label>
                                <p className="text-sm text-gray-500 mt-1 ml-6">Allow students to pay fees in installments</p>
                                {errors['settings.2.value'] && (
                                    <p className="text-red-500 text-sm mt-1 ml-6">{errors['settings.2.value']}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Fine Calculation Method
                                </label>
                                <select
                                    value={getSetting('fine_calculation_method')}
                                    onChange={(e) => updateSetting('fine_calculation_method', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                                <p className="text-sm text-gray-500 mt-1">How late fees should be calculated</p>
                                {errors['settings.3.value'] && (
                                    <p className="text-red-500 text-sm mt-1">{errors['settings.3.value']}</p>
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
