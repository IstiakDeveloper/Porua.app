import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { useState } from 'react';
import { Calendar, Clock, Save, Wifi, WifiOff, Plus, Trash2, Edit, CheckCircle2, XCircle, Server, Users, GraduationCap, Settings as SettingsIcon } from 'lucide-react';

interface DeviceSetting {
    id: number;
    device_ip: string;
    device_port: string;
    device_name: string;
    last_sync_at: string | null;
    last_sync_status: string | null;
    total_synced: number;
    teacher_in_time: string;
    teacher_out_time: string;
    teacher_late_time: string;
    student_in_time: string;
    student_out_time: string;
    student_late_time: string;
    weekend_days: string[];
    auto_mark_present: boolean;
    auto_mark_absent: boolean;
    auto_mark_late: boolean;
    auto_mark_early_leave: boolean;
    sms_on_present: boolean;
    sms_on_absent: boolean;
    sms_on_late: boolean;
    sms_on_early_leave: boolean;
    auto_sync_enabled: boolean;
    sync_interval_minutes: number;
}

interface Holiday {
    id: number;
    name: string;
    date: string;
    type: 'public' | 'optional' | 'school';
    description: string | null;
    is_active: boolean;
}

interface Props {
    settings: DeviceSetting;
    holidays: Holiday[];
}

export default function DeviceSettings({ settings, holidays }: Props) {
    const [activeTab, setActiveTab] = useState('device');
    const { props } = usePage();
    const flash = (props as any).flash;

    const [isConnected, setIsConnected] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [showHolidayForm, setShowHolidayForm] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

    // Device Info Form
    const deviceForm = useForm({
        device_ip: settings.device_ip || '',
        device_port: settings.device_port || '4370',
        device_name: settings.device_name || 'ZKTeco Device',
    });

    // Teacher Rules Form
    const teacherForm = useForm({
        teacher_in_time: settings.teacher_in_time || '08:00',
        teacher_out_time: settings.teacher_out_time || '16:00',
        teacher_late_time: settings.teacher_late_time || '08:30',
    });

    // Student Rules Form
    const studentForm = useForm({
        student_in_time: settings.student_in_time || '08:30',
        student_late_time: settings.student_late_time || '09:00',
    });

    // Weekend Form
    const weekendForm = useForm({
        weekend_days: (settings.weekend_days || ['5', '6']).map(String),
    });

    // Automation Form
    const automationForm = useForm({
        auto_mark_present: settings.auto_mark_present ?? true,
        auto_mark_absent: settings.auto_mark_absent ?? true,
        auto_mark_late: settings.auto_mark_late ?? true,
        auto_mark_early_leave: settings.auto_mark_early_leave ?? true,
        sms_on_present: settings.sms_on_present ?? false,
        sms_on_absent: settings.sms_on_absent ?? false,
        sms_on_late: settings.sms_on_late ?? false,
        sms_on_early_leave: settings.sms_on_early_leave ?? false,
        auto_sync_enabled: settings.auto_sync_enabled ?? false,
        sync_interval_minutes: settings.sync_interval_minutes || 30,
    });

    const holidayForm = useForm({
        name: '',
        date: '',
        type: 'public' as 'public' | 'optional' | 'school',
        description: '',
        is_active: true,
    });

    // Submit handlers for each section
    const handleDeviceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        deviceForm.put('/device-settings/device');
    };

    const handleTeacherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        teacherForm.put('/device-settings/teacher');
    };

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        studentForm.put('/device-settings/student');
    };

    const handleWeekendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        weekendForm.put('/device-settings/weekend');
    };

    const handleAutomationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        automationForm.put('/device-settings/automation');
    };


    const testConnection = async () => {
        setIsTestingConnection(true);
        try {
            const response = await fetch('/device-settings/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    device_ip: deviceForm.data.device_ip,
                    device_port: deviceForm.data.device_port,
                }),
            });
            const result = await response.json();
            setIsConnected(result.success);
            alert(result.message);
        } catch (error) {
            setIsConnected(false);
            alert('Failed to connect to device');
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleHolidaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingHoliday) {
            holidayForm.put(`/holidays/${editingHoliday.id}`, {
                onSuccess: () => {
                    setShowHolidayForm(false);
                    setEditingHoliday(null);
                    holidayForm.reset();
                },
            });
        } else {
            holidayForm.post('/holidays', {
                onSuccess: () => {
                    setShowHolidayForm(false);
                    holidayForm.reset();
                },
            });
        }
    };

    const deleteHoliday = (id: number) => {
        if (confirm('Are you sure you want to delete this holiday?')) {
            router.delete(`/holidays/${id}`);
        }
    };

    const openEditDialog = (holiday: Holiday) => {
        setEditingHoliday(holiday);
        holidayForm.setData({
            name: holiday.name,
            date: holiday.date,
            type: holiday.type,
            description: holiday.description || '',
            is_active: holiday.is_active,
        });
        setShowHolidayForm(true);
    };

    const closeHolidayForm = () => {
        setShowHolidayForm(false);
        setEditingHoliday(null);
        holidayForm.reset();
    };

    const weekDays = [
        { value: '0', label: 'Sunday' },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
    ];

    const toggleWeekendDay = (day: string) => {
        const current = weekendForm.data.weekend_days || [];
        if (current.includes(day)) {
            weekendForm.setData('weekend_days', current.filter(d => d !== day));
        } else {
            weekendForm.setData('weekend_days', [...current, day]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Device Settings" />
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline"> {flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {flash.error}</span>
                    </div>
                )}


                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ZKTeco Device Settings</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Configure attendance device and auto-marking rules</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {settings.last_sync_at && (
                            <div className="text-xs sm:text-sm text-gray-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                <span className="font-medium">Last Sync:</span> {new Date(settings.last_sync_at).toLocaleString()}
                                <span className="ml-1 text-slate-400">({settings.total_synced} records)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex space-x-1 min-w-max pb-1">
                        <button
                            onClick={() => setActiveTab('device')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'device'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Server className="w-4 h-4 inline mr-2" />
                            Device Info
                        </button>
                        <button
                            onClick={() => setActiveTab('teachers')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'teachers'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Teachers
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'students'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4 inline mr-2" />
                            Students
                        </button>
                        <button
                            onClick={() => setActiveTab('weekends')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'weekends'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Weekends
                        </button>
                        <button
                            onClick={() => setActiveTab('holidays')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'holidays'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Holidays
                        </button>
                        <button
                            onClick={() => setActiveTab('automation')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'automation'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <SettingsIcon className="w-4 h-4 inline mr-2" />
                            Automation
                        </button>
                    </div>
                </div>

                {/* Device Info Tab */}
                {activeTab === 'device' && (
                    <form onSubmit={handleDeviceSubmit}>
                        <Card title="Device Configuration">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Device Name
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceForm.data.device_name}
                                        onChange={(e) => deviceForm.setData('device_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {deviceForm.errors.device_name && <p className="text-red-500 text-sm mt-1">{deviceForm.errors.device_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Device IP Address
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceForm.data.device_ip}
                                        onChange={(e) => deviceForm.setData('device_ip', e.target.value)}
                                        placeholder="192.168.0.21"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {deviceForm.errors.device_ip && <p className="text-red-500 text-sm mt-1">{deviceForm.errors.device_ip}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Device Port
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceForm.data.device_port}
                                        onChange={(e) => deviceForm.setData('device_port', e.target.value)}
                                        placeholder="4370"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {deviceForm.errors.device_port && <p className="text-red-500 text-sm mt-1">{deviceForm.errors.device_port}</p>}
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={testConnection}
                                        disabled={isTestingConnection}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        {isTestingConnection ? (
                                            <>Testing...</>
                                        ) : (
                                            <>
                                                {isConnected ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
                                                Test Connection
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button type="submit" disabled={deviceForm.processing}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Device Info
                                </Button>
                            </div>
                        </Card>
                    </form>
                )}

                {/* Teachers Tab */}
                    {activeTab === 'teachers' && (
                        <form onSubmit={handleTeacherSubmit}>
                            <Card title="Teacher Attendance Rules">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            In Time
                                        </label>
                                        <input
                                            type="time"
                                            value={teacherForm.data.teacher_in_time}
                                            onChange={(e) => teacherForm.setData('teacher_in_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {teacherForm.errors.teacher_in_time && <p className="text-red-500 text-sm mt-1">{teacherForm.errors.teacher_in_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Out Time
                                        </label>
                                        <input
                                            type="time"
                                            value={teacherForm.data.teacher_out_time}
                                            onChange={(e) => teacherForm.setData('teacher_out_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {teacherForm.errors.teacher_out_time && <p className="text-red-500 text-sm mt-1">{teacherForm.errors.teacher_out_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Late After
                                        </label>
                                        <input
                                            type="time"
                                            value={teacherForm.data.teacher_late_time}
                                            onChange={(e) => teacherForm.setData('teacher_late_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {teacherForm.errors.teacher_late_time && <p className="text-red-500 text-sm mt-1">{teacherForm.errors.teacher_late_time}</p>}
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Teachers arriving after the "Late After" time will be automatically marked as late.
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Button type="submit" disabled={teacherForm.processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Teacher Rules
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <form onSubmit={handleStudentSubmit}>
                            <Card title="Student Attendance Rules">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            In Time
                                        </label>
                                        <input
                                            type="time"
                                            value={studentForm.data.student_in_time}
                                            onChange={(e) => studentForm.setData('student_in_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {studentForm.errors.student_in_time && <p className="text-red-500 text-sm mt-1">{studentForm.errors.student_in_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Late After
                                        </label>
                                        <input
                                            type="time"
                                            value={studentForm.data.student_late_time}
                                            onChange={(e) => studentForm.setData('student_late_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {studentForm.errors.student_late_time && <p className="text-red-500 text-sm mt-1">{studentForm.errors.student_late_time}</p>}
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Students only need to mark their arrival. Out time is not required for students.
                                    </p>
                                </div>
                            </Card>

                            {/* Submit Button */}
                            <Card>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={studentForm.processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Student Rules
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    )}

                    {/* Weekends Tab */}
                    {activeTab === 'weekends' && (
                        <form onSubmit={handleWeekendSubmit}>
                            <Card title="Weekend Days">
                                <div className="space-y-3">
                                    {weekDays.map((day) => (
                                        <label key={day.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={weekendForm.data.weekend_days?.includes(day.value)}
                                                onChange={() => toggleWeekendDay(day.value)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        <span className="ml-3 text-gray-900 font-medium">{day.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Selected days will be considered as weekends. No attendance will be marked automatically on these days.
                                </p>
                            </div>
                            {weekendForm.errors.weekend_days && <p className="text-red-500 text-sm mt-2">{weekendForm.errors.weekend_days}</p>}
                        </Card>

                        {/* Submit Button */}
                        <Card>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={weekendForm.processing}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Weekend Days
                                </Button>
                            </div>
                        </Card>
                    </form>
                    )}

                    {/* Holidays Tab */}
                    {activeTab === 'holidays' && (
                        <div className="space-y-6">
                            <Card
                                title="Holidays"
                                action={
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setEditingHoliday(null);
                                            holidayForm.reset();
                                            setShowHolidayForm(true);
                                        }}
                                        size="sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Holiday
                                    </Button>
                                }
                            >
                                {holidays.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {holidays.map((holiday) => (
                                                    <tr key={holiday.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{holiday.name}</div>
                                                            {holiday.description && (
                                                                <div className="text-sm text-gray-500">{holiday.description}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(holiday.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                holiday.type === 'public' ? 'bg-blue-100 text-blue-800' :
                                                                holiday.type === 'school' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {holiday.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {holiday.is_active ? (
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                            <Button
                                                                type="button"
                                                                onClick={() => openEditDialog(holiday)}
                                                                size="sm"
                                                                variant="ghost"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                onClick={() => deleteHoliday(holiday.id)}
                                                                size="sm"
                                                                variant="danger"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No holidays added yet. Click "Add Holiday" to create one.
                                    </div>
                                )}
                            </Card>

                            {/* Holiday Form */}
                            {showHolidayForm && (
                                <Card title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}>
                                    <form onSubmit={handleHolidaySubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Holiday Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={holidayForm.data.name}
                                                    onChange={(e) => holidayForm.setData('name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={holidayForm.data.date}
                                                    onChange={(e) => holidayForm.setData('date', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type
                                                </label>
                                                <select
                                                    value={holidayForm.data.type}
                                                    onChange={(e) => holidayForm.setData('type', e.target.value as 'public' | 'optional' | 'school')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="public">Public Holiday</option>
                                                    <option value="school">School Holiday</option>
                                                    <option value="optional">Optional Holiday</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={holidayForm.data.is_active}
                                                        onChange={(e) => holidayForm.setData('is_active', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-gray-900 font-medium">Active</span>
                                                </label>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description (Optional)
                                                </label>
                                                <textarea
                                                    value={holidayForm.data.description}
                                                    onChange={(e) => holidayForm.setData('description', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <Button
                                                type="button"
                                                onClick={closeHolidayForm}
                                                variant="secondary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={holidayForm.processing}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingHoliday ? 'Update' : 'Save'} Holiday
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Automation Tab */}
                    {activeTab === 'automation' && (
                        <form onSubmit={handleAutomationSubmit} className="space-y-6">
                            <Card title="Auto Marking Settings">
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">Auto Mark Present</span>
                                            <span className="text-sm text-gray-500">Automatically mark as present when attendance is recorded on time</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.auto_mark_present}
                                            onChange={(e) => automationForm.setData('auto_mark_present', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">Auto Mark Late</span>
                                            <span className="text-sm text-gray-500">Automatically mark as late when arriving after late time</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.auto_mark_late}
                                            onChange={(e) => automationForm.setData('auto_mark_late', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">Auto Mark Absent</span>
                                            <span className="text-sm text-gray-500">Mark as absent if no attendance recorded by end of day</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.auto_mark_absent}
                                            onChange={(e) => automationForm.setData('auto_mark_absent', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">Auto Mark Early Leave</span>
                                            <span className="text-sm text-gray-500">Mark early leave when leaving before expected out time</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.auto_mark_early_leave}
                                            onChange={(e) => automationForm.setData('auto_mark_early_leave', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>
                                </div>
                            </Card>

                            <Card title="SMS Notification Settings">
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">SMS on Present</span>
                                            <span className="text-sm text-gray-500">Send SMS when marked as present</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.sms_on_present}
                                            onChange={(e) => automationForm.setData('sms_on_present', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">SMS on Absent</span>
                                            <span className="text-sm text-gray-500">Send SMS when marked as absent</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.sms_on_absent}
                                            onChange={(e) => automationForm.setData('sms_on_absent', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">SMS on Late</span>
                                            <span className="text-sm text-gray-500">Send SMS when marked as late</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.sms_on_late}
                                            onChange={(e) => automationForm.setData('sms_on_late', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">SMS on Early Leave</span>
                                            <span className="text-sm text-gray-500">Send SMS when leaving early</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.sms_on_early_leave}
                                            onChange={(e) => automationForm.setData('sms_on_early_leave', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>
                                </div>
                            </Card>

                            <Card title="Auto Sync Settings">
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <span className="text-gray-900 font-medium block">Enable Auto Sync</span>
                                            <span className="text-sm text-gray-500">Automatically sync attendance from device at regular intervals</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={automationForm.data.auto_sync_enabled}
                                            onChange={(e) => automationForm.setData('auto_sync_enabled', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    {automationForm.data.auto_sync_enabled && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Sync Interval (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={automationForm.data.sync_interval_minutes}
                                                onChange={(e) => automationForm.setData('sync_interval_minutes', parseInt(e.target.value))}
                                                min="5"
                                                max="1440"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">Minimum 5 minutes, Maximum 1440 minutes (24 hours)</p>
                                            {automationForm.errors.sync_interval_minutes && (
                                                <p className="text-red-500 text-sm mt-1">{automationForm.errors.sync_interval_minutes}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Submit Button */}
                            <Card>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={automationForm.processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Automation Settings
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    )}

            </div>
        </AuthenticatedLayout>
    );
}
