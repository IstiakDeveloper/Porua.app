import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import DeleteModal from '@/Components/DeleteModal';
import { Plus, ArrowLeft, History, Trash2, Filter } from 'lucide-react';

// Route helper function
function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'students.index': '/students',
        'student-promotions.index': '/student-promotions',
        'student-promotions.create': '/student-promotions/create',
        'student-promotions.destroy': '/student-promotions',
    };

    const baseRoute = routes[name] || `/${name.replace('.', '/')}`;
    return params ? `${baseRoute}/${params}` : baseRoute;
}

interface Student {
    id: number;
    admission_number: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

interface Promotion {
    id: number;
    student: Student;
    from_academic_year: AcademicYear;
    to_academic_year: AcademicYear;
    from_class: SchoolClass;
    to_class: SchoolClass;
    from_section: Section | null;
    to_section: Section | null;
    promotion_date: string;
    status: string;
    remarks: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    promotions: {
        data: Promotion[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        links: PaginationLink[];
    };
    academicYears: AcademicYear[];
}

export default function Index({ promotions, academicYears }: IndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        promotion: Promotion | null;
    }>({
        show: false,
        promotion: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterYear, setFilterYear] = useState('');

    const handleDeleteClick = (promotion: Promotion) => {
        setDeleteModal({ show: true, promotion });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.promotion) {
            setIsDeleting(true);
            router.delete(route('student-promotions.destroy', deleteModal.promotion.id), {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ show: false, promotion: null });
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ show: false, promotion: null });
    };

    const handleFilter = () => {
        router.get(route('student-promotions.index'),
            { academic_year_id: filterYear },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setFilterYear('');
        router.get(route('student-promotions.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Promotions" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('students.index')}>
                            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Student Promotions
                            </h1>
                            <p className="text-gray-600 mt-1">View and manage student promotion history</p>
                        </div>
                    </div>
                    <Link href={route('student-promotions.create')}>
                        <Button icon={<Plus className="w-5 h-5" />}>
                            Promote Students
                        </Button>
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Academic Year
                            </label>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Academic Years</option>
                                {academicYears.map(year => (
                                    <option key={year.id} value={year.id}>{year.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter} icon={<Filter className="w-4 h-4" />}>
                                Apply Filter
                            </Button>
                            {filterYear && (
                                <Button variant="ghost" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Promotions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {promotions.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            From
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Promotion Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Remarks
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {promotions.data.map((promotion) => (
                                        <tr key={promotion.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {promotion.student.photo_url ? (
                                                        <img
                                                            src={promotion.student.photo_url}
                                                            alt={`${promotion.student.first_name} ${promotion.student.last_name}`}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                                            <span className="text-white font-semibold">
                                                                {promotion.student.first_name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {promotion.student.first_name} {promotion.student.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {promotion.student.admission_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {promotion.from_academic_year.name}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {promotion.from_class.name}
                                                        {promotion.from_section && ` - ${promotion.from_section.name}`}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {promotion.to_academic_year.name}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {promotion.to_class.name}
                                                        {promotion.to_section && ` - ${promotion.to_section.name}`}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(promotion.promotion_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    promotion.status === 'promoted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : promotion.status === 'passed_out'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {promotion.status === 'passed_out' ? 'Passed Out' : promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {promotion.remarks || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(promotion)}
                                                    className="text-red-600 hover:text-red-900"
                                                    icon={<Trash2 className="w-4 h-4" />}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Promotion Records
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {filterYear ? 'No promotions found for the selected academic year.' : 'There are no student promotions yet.'}
                            </p>
                            <Link href={route('student-promotions.create')}>
                                <Button icon={<Plus className="w-5 h-5" />}>
                                    Create First Promotion
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {promotions.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{promotions.from}</span> to{' '}
                                <span className="font-medium">{promotions.to}</span> of{' '}
                                <span className="font-medium">{promotions.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                {promotions.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-lg ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.show}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Promotion"
                message="Are you sure you want to delete this promotion record? This will revert the student back to their previous class."
                itemName={deleteModal.promotion ? `${deleteModal.promotion.student.first_name} ${deleteModal.promotion.student.last_name}'s promotion` : ''}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
