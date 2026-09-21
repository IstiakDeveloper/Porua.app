import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table from '@/Components/Table';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Calendar, CheckCircle } from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    status: string;
    created_at: string;
}

interface AcademicYearsIndexProps {
    academicYears: AcademicYear[];
}

export default function Index({ academicYears }: AcademicYearsIndexProps) {
    const [processing, setProcessing] = useState<number | null>(null);

    const handleSetCurrent = (id: number) => {
        if (confirm('Set this as the current academic year?')) {
            setProcessing(id);
            router.post(`/academic-years/${id}/set-current`, {}, {
                onFinish: () => setProcessing(null),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this academic year?')) {
            router.delete(`/academic-years/${id}`);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Academic Year',
            sortable: true,
            render: (value: string, row: AcademicYear) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="font-medium text-gray-900">{value}</p>
                        {row.is_current && (
                            <Badge variant="success" size="sm" className="mt-1">
                                Current
                            </Badge>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'start_date',
            label: 'Start Date',
            render: (date: string) => (
                <span className="text-sm text-gray-900">
                    {new Date(date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'end_date',
            label: 'End Date',
            render: (date: string) => (
                <span className="text-sm text-gray-900">
                    {new Date(date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (status: string) => (
                <Badge variant={status === 'active' ? 'success' : 'danger'}>
                    {status}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: AcademicYear) => (
                <div className="flex items-center gap-2">
                    {!row.is_current && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSetCurrent(row.id)}
                            loading={processing === row.id}
                            icon={<CheckCircle className="w-4 h-4" />}
                        >
                            Set Current
                        </Button>
                    )}
                    <Link href={`/academic-years/${row.id}/edit`}>
                        <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Academic Years" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Academic Years</h1>
                        <p className="text-gray-600 mt-1">Manage academic years and sessions</p>
                    </div>
                    <Link href="/academic-years/create">
                        <Button icon={<Plus className="w-5 h-5" />}>
                            Add Academic Year
                        </Button>
                    </Link>
                </div>

                <Card>
                    <Table columns={columns} data={academicYears} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
