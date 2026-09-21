import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';
import DeleteModal from '@/Components/DeleteModal';
import { useInstitute } from '@/hooks/useInstitute';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Users, Layers, Calendar, DollarSign } from 'lucide-react';

interface Course {
    id: number;
    name: string;
    code: string | null;
    academic_year_id: number | null;
    academic_year?: { id: number; name: string } | null;
    fee_type: 'monthly' | 'one_time';
    standard_fee: string | number;
    description: string | null;
    status: 'active' | 'inactive';
    batches_count?: number;
    active_batches_count?: number;
}

interface Props {
    courses: {
        data: Course[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ courses, filters }: Props) {
    const institute = useInstitute();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/courses', { search, status }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/courses', {}, { preserveState: true });
    };

    const confirmDelete = () => {
        if (deleteCourseId) {
            router.delete(`/courses/${deleteCourseId}`, {
                onSuccess: () => setDeleteCourseId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Courses Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-7 h-7 text-indigo-600" />
                            Coaching Courses
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage subject programs, package crash courses, and standardized fees
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/batches">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                <span>View Batches</span>
                            </Button>
                        </Link>
                        <Link href="/courses/create">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>Create Course</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card>
                    <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search courses by name or code..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="w-full md:w-48">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                                Filter
                            </Button>
                            {(search || status) && (
                                <Button type="button" variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Courses List */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Course Name</th>
                                    <th className="py-3.5 px-4">Code</th>
                                    <th className="py-3.5 px-4">Academic Session</th>
                                    <th className="py-3.5 px-4">Fee Structure</th>
                                    <th className="py-3.5 px-4">Active Batches</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {courses.data.length > 0 ? (
                                    courses.data.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-gray-900">{course.name}</div>
                                                {course.description && (
                                                    <div className="text-xs text-gray-500 line-clamp-1 max-w-sm mt-0.5">
                                                        {course.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                    {course.code || '—'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600">
                                                {course.academic_year?.name || 'All Sessions'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-gray-900">
                                                    {institute.currency_symbol} {Number(course.standard_fee).toLocaleString()}
                                                </div>
                                                <div className="text-[11px] text-gray-500 uppercase font-semibold">
                                                    {course.fee_type === 'monthly' ? 'Monthly Fee' : 'One-Time Package'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Link
                                                    href={`/batches?course_id=${course.id}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                                                    title="View batches under this course"
                                                >
                                                    <Layers className="w-3.5 h-3.5" />
                                                    <span>{course.batches_count || 0} Batches</span>
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge variant={course.status === 'active' ? 'success' : 'secondary'}>
                                                    {course.status === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/batches/create?course_id=${course.id}`}
                                                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                                                        title="Add Batch for this course"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/courses/${course.id}/edit`}
                                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                                                        title="Edit Course"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteCourseId(course.id)}
                                                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                                        title="Delete Course"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <BookOpen className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-base font-semibold text-gray-700">No courses found</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Get started by creating your first coaching course or program.
                                                </p>
                                                <Link href="/courses/create" className="mt-4">
                                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        <span>Create Course</span>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {courses.data.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <Pagination links={courses.links} />
                        </div>
                    )}
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteCourseId !== null}
                onClose={() => setDeleteCourseId(null)}
                onConfirm={confirmDelete}
                title="Delete Course"
                message="Are you sure you want to delete this course? Courses with active batches cannot be deleted."
            />
        </AuthenticatedLayout>
    );
}
