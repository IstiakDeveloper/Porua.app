import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { ArrowLeft, Save, Calendar, Trash2 } from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
    is_current: boolean;
    description: string;
}

interface EditProps {
    year: AcademicYear;
}

export default function Edit({ year }: EditProps) {
    const [data, setData] = useState({
        name: year.name,
        title: year.title || '',
        start_date: year.start_date,
        end_date: year.end_date,
        status: year.status,
        is_current: year.is_current,
        description: year.description || '',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/academic-years/${year.id}`, data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${year.name}"?`)) {
            router.delete(`/academic-years/${year.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Academic Year" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/academic-years')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Edit Academic Year
                            </h1>
                            <p className="text-gray-600 mt-1">Update academic year details</p>
                        </div>
                    </div>
                    <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="w-5 h-5" />}>
                        Delete Year
                    </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Editing: {year.name}</p>
                            <p className="text-xs text-blue-700">
                                {year.is_current && 'Current Active Year'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Year Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Year Name"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="2024-2025"
                            />
                            <Input
                                label="Title (Optional)"
                                value={data.title}
                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                error={errors.title}
                                placeholder="Academic Year 2024-2025"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData({ ...data, start_date: e.target.value })}
                                error={errors.start_date}
                                required
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData({ ...data, end_date: e.target.value })}
                                error={errors.end_date}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData({ ...data, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-7">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_current}
                                        onChange={(e) => setData({ ...data, is_current: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Set as current academic year</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData({ ...data, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Additional details about this academic year..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <Button type="button" variant="ghost" onClick={() => router.visit('/academic-years')}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            icon={<Save className="w-5 h-5" />}
                        >
                            {processing ? 'Updating...' : 'Update Year'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
