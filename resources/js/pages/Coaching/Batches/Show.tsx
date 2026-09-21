import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import DeleteModal from '@/Components/DeleteModal';
import { useInstitute } from '@/hooks/useInstitute';
import {
    Layers,
    BookOpen,
    Users,
    Clock,
    MapPin,
    Calendar,
    ArrowLeft,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    UserCheck,
    UserX,
    DollarSign,
    Phone,
    GraduationCap,
    Banknote,
    Award,
} from 'lucide-react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_id: string | null;
    roll_number: string | null;
    phone: string | null;
    school_class?: { name: string } | null;
    section?: { name: string } | null;
}

interface Enrollment {
    id: number;
    student_id: number;
    batch_id: number;
    enrolled_date: string;
    agreed_fee: number | string;
    discount_amount: number | string;
    status: 'active' | 'completed' | 'dropped';
    notes: string | null;
    student: Student;
}

interface Batch {
    id: number;
    name: string;
    course_id: number;
    course?: {
        id: number;
        name: string;
        standard_fee: number | string;
        fee_type: 'monthly' | 'one_time';
        academic_year?: { name: string } | null;
    } | null;
    teacher_id: number | null;
    teacher?: { id: number; first_name: string; last_name: string; phone: string } | null;
    room_no: string | null;
    days_of_week: string[] | null;
    start_time: string | null;
    end_time: string | null;
    formatted_schedule: string;
    max_capacity: number;
    status: 'active' | 'completed' | 'upcoming' | 'cancelled';
    notes: string | null;
    enrollments_count?: number;
    active_enrollments_count?: number;
}

interface Props {
    batch: Batch;
    enrollments: {
        data: Enrollment[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    availableStudents: Student[];
    filters: {
        student_search?: string;
        enrollment_status?: string;
    };
}

export default function Show({ batch, enrollments, availableStudents, filters }: Props) {
    const institute = useInstitute();

    // Filters
    const [search, setSearch] = useState(filters.student_search || '');
    const [statusFilter, setStatusFilter] = useState(filters.enrollment_status || '');

    // Enrollment Modal
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | number>('');
    const [enrolledDate, setEnrolledDate] = useState(new Date().toISOString().split('T')[0]);
    const [agreedFee, setAgreedFee] = useState(String(batch.course?.standard_fee || ''));
    const [discountAmount, setDiscountAmount] = useState('0');
    const [enrollmentNotes, setEnrollmentNotes] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    // Edit Enrollment Modal
    const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
    const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'dropped'>('active');
    const [editFee, setEditFee] = useState('');
    const [editDiscount, setEditDiscount] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    // Delete Enrollment
    const [deleteEnrollmentId, setDeleteEnrollmentId] = useState<number | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(`/batches/${batch.id}`, {
            student_search: search,
            enrollment_status: statusFilter,
        }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        router.get(`/batches/${batch.id}`, {}, { preserveState: true });
    };

    const handleEnrollSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        setEnrolling(true);
        router.post('/batch-enrollments', {
            batch_id: batch.id,
            student_id: selectedStudentId,
            enrolled_date: enrolledDate,
            agreed_fee: agreedFee,
            discount_amount: discountAmount || 0,
            notes: enrollmentNotes || null,
        }, {
            onSuccess: () => {
                setIsEnrollModalOpen(false);
                setSelectedStudentId('');
                setEnrollmentNotes('');
            },
            onFinish: () => setEnrolling(false),
        });
    };

    const openEditModal = (enrollment: Enrollment) => {
        setEditingEnrollment(enrollment);
        setEditStatus(enrollment.status);
        setEditFee(String(enrollment.agreed_fee));
        setEditDiscount(String(enrollment.discount_amount || 0));
        setEditNotes(enrollment.notes || '');
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEnrollment) return;

        setUpdating(true);
        router.put(`/batch-enrollments/${editingEnrollment.id}`, {
            status: editStatus,
            agreed_fee: editFee,
            discount_amount: editDiscount || 0,
            notes: editNotes || null,
        }, {
            onSuccess: () => setEditingEnrollment(null),
            onFinish: () => setUpdating(false),
        });
    };

    const confirmDelete = () => {
        if (deleteEnrollmentId) {
            router.delete(`/batch-enrollments/${deleteEnrollmentId}`, {
                onSuccess: () => setDeleteEnrollmentId(null),
            });
        }
    };

    const enrolledCount = batch.active_enrollments_count || 0;
    const capacity = batch.max_capacity || 30;
    const isFull = enrolledCount >= capacity;
    const capacityPercent = Math.min(Math.round((enrolledCount / capacity) * 100), 100);

    return (
        <AuthenticatedLayout>
            <Head title={`Batch: ${batch.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/batches"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
                                <Badge variant={batch.status === 'active' ? 'success' : 'secondary'}>
                                    {batch.status.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-sm text-indigo-700 font-medium mt-0.5 flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                <span>{batch.course?.name}</span>
                                {batch.course?.academic_year && (
                                    <span className="text-gray-400">({batch.course.academic_year.name})</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/coaching/attendance/${batch.id}/sheet`}>
                            <Button variant="outline" className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Take Attendance</span>
                            </Button>
                        </Link>
                        <Link href={`/model-tests?batch_id=${batch.id}`}>
                            <Button variant="outline" className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/60 border-indigo-200 hover:bg-indigo-100">
                                <Award className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Model Tests & Merit</span>
                            </Button>
                        </Link>
                        <Link href={`/batches/${batch.id}/edit`}>
                            <Button variant="outline" className="flex items-center gap-1.5 text-xs">
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Batch</span>
                            </Button>
                        </Link>
                        <Button
                            onClick={() => setIsEnrollModalOpen(true)}
                            disabled={isFull}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 text-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Enroll Student</span>
                        </Button>
                    </div>
                </div>

                {/* Batch Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Schedule */}
                    <Card className="p-4 bg-white border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Batch Schedule</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">
                                    {batch.formatted_schedule || 'Flexible Timings'}
                                </p>
                                {batch.room_no && (
                                    <p className="text-xs text-gray-500 mt-0.5">Room: {batch.room_no}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Instructor */}
                    <Card className="p-4 bg-white border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Mentor / Instructor</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">
                                    {batch.teacher ? `${batch.teacher.first_name} ${batch.teacher.last_name}` : 'Not assigned'}
                                </p>
                                {batch.teacher?.phone && (
                                    <p className="text-xs text-gray-500 mt-0.5">{batch.teacher.phone}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Standard Fee */}
                    <Card className="p-4 bg-white border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Standard Course Fee</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">
                                    {institute.currency_symbol} {Number(batch.course?.standard_fee || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                    {batch.course?.fee_type === 'monthly' ? 'Per Month' : 'Package Total'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Capacity Meter */}
                    <Card className="p-4 bg-white border border-gray-200">
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500 font-medium">Capacity Meter</span>
                                <span className="font-bold text-gray-900">
                                    {enrolledCount} / {capacity} Seats
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden my-2">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        isFull ? 'bg-red-500' : (capacityPercent > 75 ? 'bg-amber-500' : 'bg-indigo-600')
                                    }`}
                                    style={{ width: `${capacityPercent}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-gray-500">
                                {isFull ? '⚠️ Batch is completely full' : `✅ ${capacity - enrolledCount} seats available`}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Enrolled Students Section */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Enrolled Students ({enrollments.total})
                            </h2>
                            <p className="text-xs text-gray-500">
                                Students currently assigned to this batch
                            </p>
                        </div>

                        <form onSubmit={handleFilter} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search enrolled students..."
                                    className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 w-56"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="py-1.5 px-3 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="dropped">Dropped</option>
                            </select>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 px-3">
                                Filter
                            </Button>
                            {(search || statusFilter) && (
                                <Button type="button" variant="outline" onClick={handleReset} className="text-xs py-1.5 px-3">
                                    Reset
                                </Button>
                            )}
                        </form>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-4">Student Details</th>
                                        <th className="py-3.5 px-4">Student ID / Roll</th>
                                        <th className="py-3.5 px-4">Phone / Contact</th>
                                        <th className="py-3.5 px-4">Enrolled Date</th>
                                        <th className="py-3.5 px-4">Agreed Fee</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {enrollments.data.length > 0 ? (
                                        enrollments.data.map((enrollment) => (
                                            <tr key={enrollment.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {enrollment.student?.first_name} {enrollment.student?.last_name}
                                                    </div>
                                                    {enrollment.notes && (
                                                        <div className="text-xs text-gray-500 italic mt-0.5">
                                                            Note: {enrollment.notes}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                        {enrollment.student?.student_id || enrollment.student?.roll_number || '—'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600">
                                                    {enrollment.student?.phone ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <span>{enrollment.student.phone}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No phone</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600">
                                                    {enrollment.enrolled_date}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-semibold text-gray-900">
                                                        {institute.currency_symbol} {Number(enrollment.agreed_fee).toLocaleString()}
                                                    </span>
                                                    {Number(enrollment.discount_amount) > 0 && (
                                                        <span className="ml-1 text-[11px] text-emerald-600 font-semibold">
                                                            (-{institute.currency_symbol}{Number(enrollment.discount_amount)})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge
                                                        variant={
                                                            enrollment.status === 'active'
                                                                ? 'success'
                                                                : (enrollment.status === 'completed' ? 'info' : 'danger')
                                                        }
                                                    >
                                                        {enrollment.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={`/coaching/fees?batch_id=${batch.id}&search=${enrollment.student?.student_id || enrollment.student?.first_name}`}
                                                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                                                            title="Collect / View Batch Fees"
                                                        >
                                                            <Banknote className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(enrollment)}
                                                            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                                                            title="Edit Enrollment / Fee"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteEnrollmentId(enrollment.id)}
                                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                                            title="Remove from batch"
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
                                                    <Users className="w-10 h-10 text-gray-300 mb-2" />
                                                    <p className="text-sm font-semibold text-gray-700">No students enrolled yet</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Click "Enroll Student" above to assign students to this batch.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {enrollments.data.length > 0 && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <Pagination links={enrollments.links} />
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Enroll Student Modal */}
            <Modal
                show={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                maxWidth="md"
            >
                <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-indigo-600" />
                            Enroll Student into Batch
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsEnrollModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Select Student *
                            </label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Choose a Student...</option>
                                {availableStudents.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} {s.student_id ? `(${s.student_id})` : ''} {s.phone ? `- ${s.phone}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Enrolled Date *
                                </label>
                                <input
                                    type="date"
                                    value={enrolledDate}
                                    onChange={(e) => setEnrolledDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Agreed Fee ({institute.currency_symbol}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={agreedFee}
                                    onChange={(e) => setAgreedFee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-semibold"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Discount / Concession Amount ({institute.currency_symbol})
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Notes / Remarks
                            </label>
                            <input
                                type="text"
                                value={enrollmentNotes}
                                onChange={(e) => setEnrollmentNotes(e.target.value)}
                                placeholder="e.g. Special care batch / sibling waiver"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEnrollModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={enrolling || !selectedStudentId}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                        >
                            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Enrollment Modal */}
            <Modal
                show={editingEnrollment !== null}
                onClose={() => setEditingEnrollment(null)}
                maxWidth="md"
            >
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Edit className="w-5 h-5 text-indigo-600" />
                            Update Enrollment
                        </h3>
                        <button
                            type="button"
                            onClick={() => setEditingEnrollment(null)}
                            className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Student
                            </label>
                            <p className="text-sm font-bold text-gray-800">
                                {editingEnrollment?.student?.first_name} {editingEnrollment?.student?.last_name}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Agreed Fee ({institute.currency_symbol}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editFee}
                                    onChange={(e) => setEditFee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-semibold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Discount ({institute.currency_symbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editDiscount}
                                    onChange={(e) => setEditDiscount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Enrollment Status *
                            </label>
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="active">Active (বর্তমানে নিয়মিত)</option>
                                <option value="completed">Completed (কোর্স সম্পন্ন)</option>
                                <option value="dropped">Dropped (বাতিল / ছেড়ে দিয়েছে)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Remarks / Notes
                            </label>
                            <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingEnrollment(null)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updating}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                        >
                            {updating ? 'Updating...' : 'Update Enrollment'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <DeleteModal
                isOpen={deleteEnrollmentId !== null}
                onClose={() => setDeleteEnrollmentId(null)}
                onConfirm={confirmDelete}
                title="Remove Student from Batch"
                message="Are you sure you want to remove this student from the batch? Their previous fee records will remain intact."
            />
        </AuthenticatedLayout>
    );
}
