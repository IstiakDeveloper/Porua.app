import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';
import DeleteModal from '@/Components/DeleteModal';
import { Layers, Plus, Search, Filter, Edit, Trash2, Users, Calendar, Clock, MapPin, BookOpen, ChevronRight, UserCheck } from 'lucide-react';

interface Course {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
}

interface Batch {
    id: number;
    name: string;
    course_id: number;
    course?: { id: number; name: string } | null;
    teacher_id: number | null;
    teacher?: { id: number; first_name: string; last_name: string } | null;
    room_no: string | null;
    days_of_week: string[] | null;
    start_time: string | null;
    end_time: string | null;
    formatted_schedule: string;
    max_capacity: number;
    status: 'active' | 'completed' | 'upcoming' | 'cancelled';
    enrollments_count?: number;
    active_enrollments_count?: number;
}

interface Props {
    batches: {
        data: Batch[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    courses: Course[];
    teachers: Teacher[];
    filters: {
        search?: string;
        course_id?: string;
        teacher_id?: string;
        status?: string;
    };
}

export default function Index({ batches, courses, teachers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [courseId, setCourseId] = useState(filters.course_id || '');
    const [teacherId, setTeacherId] = useState(filters.teacher_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteBatchId, setDeleteBatchId] = useState<number | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/batches', { search, course_id: courseId, teacher_id: teacherId, status }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setCourseId('');
        setTeacherId('');
        setStatus('');
        router.get('/batches', {}, { preserveState: true });
    };

    const confirmDelete = () => {
        if (deleteBatchId) {
            router.delete(`/batches/${deleteBatchId}`, {
                onSuccess: () => setDeleteBatchId(null),
            });
        }
    };

    const getStatusBadge = (bStatus: string) => {
        switch (bStatus) {
            case 'active':
                return <Badge variant="success">Active</Badge>;
            case 'upcoming':
                return <Badge variant="info">Upcoming</Badge>;
            case 'completed':
                return <Badge variant="secondary">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="danger">Cancelled</Badge>;
            default:
                return <Badge variant="default">{bStatus}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Coaching Batches" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Layers className="w-7 h-7 text-indigo-600" />
                            Coaching Batches & Schedules
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Organize class timing, mentor assignment, seat limits, and student enrollments
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/courses">
                            <Button variant="outline" className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>Manage Courses</span>
                            </Button>
                        </Link>
                        <Link href="/batches/create">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>Create Batch</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card>
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search batch or room..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Courses</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                Filter
                            </Button>
                            {(search || courseId || teacherId || status) && (
                                <Button type="button" variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Batches Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Batch Name & Course</th>
                                    <th className="py-3.5 px-4">Teacher / Mentor</th>
                                    <th className="py-3.5 px-4">Schedule & Room</th>
                                    <th className="py-3.5 px-4">Enrolled Capacity</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {batches.data.length > 0 ? (
                                    batches.data.map((batch) => {
                                        const enrolled = batch.active_enrollments_count || 0;
                                        const capacity = batch.max_capacity || 30;
                                        const percent = Math.min(Math.round((enrolled / capacity) * 100), 100);
                                        const isFull = enrolled >= capacity;

                                        return (
                                            <tr key={batch.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <Link
                                                        href={`/batches/${batch.id}`}
                                                        className="font-bold text-gray-900 hover:text-indigo-600 transition inline-flex items-center gap-1.5"
                                                    >
                                                        <span>{batch.name}</span>
                                                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                                    </Link>
                                                    <div className="text-xs text-indigo-700 font-medium mt-0.5 flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3 text-indigo-500" />
                                                        <span>{batch.course?.name || 'Unassigned Course'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-700">
                                                    {batch.teacher ? (
                                                        <div className="font-medium">
                                                            {batch.teacher.first_name} {batch.teacher.last_name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="text-xs text-gray-800 font-medium flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{batch.formatted_schedule || 'Flexible'}</span>
                                                    </div>
                                                    {batch.room_no && (
                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <MapPin className="w-3 h-3 text-gray-400" />
                                                            <span>Room: {batch.room_no}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 w-48">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="font-semibold text-gray-800">
                                                            {enrolled} / {capacity}
                                                        </span>
                                                        <span className={`text-[11px] font-medium ${isFull ? 'text-red-600' : 'text-gray-500'}`}>
                                                            {isFull ? 'Full' : `${capacity - enrolled} left`}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                isFull ? 'bg-red-500' : (percent > 75 ? 'bg-amber-500' : 'bg-indigo-600')
                                                            }`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {getStatusBadge(batch.status)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/batches/${batch.id}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                                                            title="View batch and enroll students"
                                                        >
                                                            <UserCheck className="w-3.5 h-3.5" />
                                                            <span>Students ({enrolled})</span>
                                                        </Link>
                                                        <Link
                                                            href={`/batches/${batch.id}/edit`}
                                                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                                                            title="Edit Batch"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteBatchId(batch.id)}
                                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                                            title="Delete Batch"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Layers className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-base font-semibold text-gray-700">No batches found</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Create your first batch under an existing course.
                                                </p>
                                                <Link href="/batches/create" className="mt-4">
                                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        <span>Create Batch</span>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {batches.data.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <Pagination links={batches.links} />
                        </div>
                    )}
                </Card>
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteBatchId !== null}
                onClose={() => setDeleteBatchId(null)}
                onConfirm={confirmDelete}
                title="Delete Batch"
                message="Are you sure you want to delete this batch? Batches with active enrolled students cannot be deleted."
            />
        </AuthenticatedLayout>
    );
}
