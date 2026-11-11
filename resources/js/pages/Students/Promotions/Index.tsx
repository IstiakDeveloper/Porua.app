import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import {
    Plus,
    History,
    Trash2,
    Filter,
    GraduationCap,
    ArrowRight,
    Calendar,
    Users,
    CheckCircle2,
    XCircle,
    Award
} from 'lucide-react';

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
    to_class: SchoolClass | null;
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
    filters?: {
        academic_year_id?: string;
    };
}

export default function Index({ promotions, academicYears, filters = {} }: IndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        promotion: Promotion | null;
    }>({
        show: false,
        promotion: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterYear, setFilterYear] = useState(filters?.academic_year_id || '');

    const handleDeleteClick = (promotion: Promotion) => {
        setDeleteModal({ show: true, promotion });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.promotion) {
            setIsDeleting(true);
            router.delete(`/student-promotions/${deleteModal.promotion.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ show: false, promotion: null });
                },
            });
        }
    };

    const handleFilter = () => {
        router.get('/student-promotions',
            { academic_year_id: filterYear || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setFilterYear('');
        router.get('/student-promotions');
    };

    const destinationClass = (promotion: Promotion) => {
        if (!promotion.to_class) {
            return 'Passed out';
        }

        return `${promotion.to_class.name}${promotion.to_section ? ` (${promotion.to_section.name})` : ''}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'promoted':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Promoted
                    </span>
                );
            case 'passed_out':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        <Award className="w-3 h-3 text-indigo-600" />
                        Passed Out
                    </span>
                );
            case 'detained':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <XCircle className="w-3 h-3 text-amber-600" />
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Detained'}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Promotions" />

            <div className="space-y-4">
                {/* Standard ERP Header */}
                <FormPageHeader
                    title="Student Promotions"
                    subtitle="Manage annual batch promotions and class level progressions"
                    backUrl="/students"
                    backLabel="Students Directory"
                    badge="Academic Progression"
                    badgeIcon={GraduationCap}
                    actions={
                        <Link href="/student-promotions/create">
                            <Button
                                size="sm"
                                icon={<Plus className="w-4 h-4" />}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Promote Students
                            </Button>
                        </Link>
                    }
                />

                {/* Compact Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 sm:max-w-xs">
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:hidden">
                                    Filter by Academic Year
                                </label>
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                >
                                    <option value="">All Academic Years</option>
                                    {academicYears.map(year => (
                                        <option key={year.id} value={year.id}>{year.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleFilter}
                                icon={<Filter className="w-3.5 h-3.5" />}
                            >
                                Filter
                            </Button>
                            {filterYear && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="text-xs text-slate-500 shrink-0 font-medium">
                            Total Records: <span className="font-semibold text-slate-900">{promotions.total}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {promotions.data.length > 0 ? (
                    <>
                        {/* Mobile Cards Feed (< 768px) */}
                        <div className="block md:hidden space-y-2.5">
                            {promotions.data.map((promotion) => (
                                <div key={promotion.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {promotion.student.photo_url ? (
                                                <img
                                                    src={promotion.student.photo_url}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                                                    {promotion.student.first_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {promotion.student.first_name} {promotion.student.last_name}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-mono">
                                                    Adm: {promotion.student.admission_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {getStatusBadge(promotion.status)}
                                        </div>
                                    </div>

                                    {/* Transition Route Pill */}
                                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center justify-between text-xs">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">From</p>
                                            <p className="font-semibold text-slate-800">
                                                {promotion.from_class.name}
                                                {promotion.from_section ? ` (${promotion.from_section.name})` : ''}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono">{promotion.from_academic_year.name}</p>
                                        </div>

                                        <div className="px-2">
                                            <ArrowRight className="w-4 h-4 text-indigo-500" />
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">To</p>
                                            <p className="font-semibold text-slate-800">
                                                {destinationClass(promotion)}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono">{promotion.to_academic_year.name}</p>
                                        </div>
                                    </div>

                                    {/* Remarks & Actions Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{new Date(promotion.promotion_date).toLocaleDateString()}</span>
                                            {promotion.remarks && (
                                                <span className="text-slate-400 italic truncate max-w-[140px]">
                                                    • {promotion.remarks}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(promotion)}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Revert
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table (>= 768px) */}
                        <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/80 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Previous Session & Class
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-8">
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Promoted Session & Class
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Remarks
                                            </th>
                                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-20">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {promotions.data.map((promotion) => (
                                            <tr key={promotion.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        {promotion.student.photo_url ? (
                                                            <img
                                                                src={promotion.student.photo_url}
                                                                alt=""
                                                                className="w-8 h-8 rounded-full object-cover border border-slate-100"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                                                                {promotion.student.first_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-slate-900">
                                                                {promotion.student.first_name} {promotion.student.last_name}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 font-mono">
                                                                {promotion.student.admission_number}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium text-slate-800">
                                                        {promotion.from_class.name}
                                                        {promotion.from_section ? ` (${promotion.from_section.name})` : ''}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono">
                                                        {promotion.from_academic_year.name}
                                                    </p>
                                                </td>
                                                <td className="px-2 py-2.5 text-center">
                                                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 inline-block" />
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <p className="font-semibold text-slate-900">
                                                        {destinationClass(promotion)}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono">
                                                        {promotion.to_academic_year.name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap text-[11px]">
                                                    {new Date(promotion.promotion_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {getStatusBadge(promotion.status)}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate text-[11px]">
                                                    {promotion.remarks || '—'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(promotion)}
                                                        className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                                        title="Revert Promotion"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Desktop Pagination */}
                            <IndexPagination
                                links={promotions.links ?? []}
                                from={promotions.from}
                                to={promotions.to}
                                total={promotions.total}
                                lastPage={promotions.last_page}
                            />
                        </div>

                        {/* Mobile Pagination */}
                        <div className="block md:hidden bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                            <IndexPagination
                                links={promotions.links ?? []}
                                from={promotions.from}
                                to={promotions.to}
                                total={promotions.total}
                                lastPage={promotions.last_page}
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <History className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Promotion Records</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                            {filterYear ? 'No promotions match the selected academic year.' : 'Start batch academic transitions for students across academic years.'}
                        </p>
                        <Link href="/student-promotions/create">
                            <Button
                                size="sm"
                                icon={<Plus className="w-4 h-4" />}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Promote Students
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Standard ERP Delete/Revert Modal */}
            <DeleteModal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, promotion: null })}
                onConfirm={handleDeleteConfirm}
                title="Revert Promotion Record"
                message="This returns the student to their previous class and session. Revert is refused when the target year already has attendance or fees for them."
                itemName={deleteModal.promotion ? `${deleteModal.promotion.student.first_name} ${deleteModal.promotion.student.last_name}'s promotion` : ''}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
