import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { formatAmount } from '@/lib/formatCurrency';
import {
    Search,
    User,
    AlertCircle,
    Plus,
    CheckCircle,
    Calendar,
    Clock,
    X,
    XCircle,
    ShoppingCart,
    Trash2,
    CreditCard,
    ChevronRight,
} from 'lucide-react';

interface Student {
    id: number;
    admission_number: string;
    roll_number: string;
    user: { name: string };
    school_class: { id: number; name: string };
}

interface FeeStructure {
    id: number;
    fee_type: { id: number; name: string; frequency: string };
    amount: number;
    due_date: string;
}

interface PendingFee {
    id: number;
    fee_type: string;
    month: number;
    year: number;
    month_name: string;
    amount: number;
    late_fee: number;
    total_amount: number;
    status: 'pending' | 'overdue';
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface NewFeeItem {
    localId: string;
    fee_structure_id: number;
    fee_type_name: string;
    amount: number;
    month: number;
    year: number;
    months_count: number;
    discounts: number[];
}

interface CartLine {
    key: string;
    type: 'pending' | 'advance';
    title: string;
    period: string;
    grossAmount: number;
    discount: number;
    pendingFeeId?: number;
    advanceLocalId?: string;
    monthIndex?: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    accounts: Account[];
    defaultAccountId?: number | null;
}

const formatMoney = formatAmount;

const getMonthName = (month: number) =>
    new Date(2000, month - 1).toLocaleString('default', { month: 'short' });

const generateMonthsList = (startMonth: number, startYear: number, count: number) => {
    const months: string[] = [];
    let m = startMonth;
    let y = startYear;
    for (let i = 0; i < count; i++) {
        months.push(`${getMonthName(m)} ${y}`);
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    return months;
};

export default function FeeCollectionModal({ isOpen, onClose, students, accounts, defaultAccountId }: Props) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const resolvedDefaultAccountId =
        defaultAccountId?.toString()
        ?? accounts.find((a) => a.account_name.toLowerCase().includes('prime'))?.id?.toString()
        ?? accounts[1]?.id?.toString()
        ?? accounts[0]?.id?.toString()
        ?? '';

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
    const [availableFees, setAvailableFees] = useState<FeeStructure[]>([]);
    const [selectedPendingFees, setSelectedPendingFees] = useState<number[]>([]);
    const [pendingDiscounts, setPendingDiscounts] = useState<Record<number, number>>({});
    const [newFeeItems, setNewFeeItems] = useState<NewFeeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'advance'>('pending');
    const [nextUnpaidMonth, setNextUnpaidMonth] = useState(currentMonth);
    const [nextUnpaidYear, setNextUnpaidYear] = useState(currentYear);

    const form = useForm({
        student_id: '',
        account_id: resolvedDefaultAccountId,
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        remarks: '',
    });

    const filteredStudents = students.filter((student) => {
        const search = searchTerm.toLowerCase();
        return (
            student.user?.name?.toLowerCase().includes(search) ||
            student.roll_number?.toLowerCase().includes(search) ||
            student.admission_number?.toLowerCase().includes(search) ||
            student.school_class?.name?.toLowerCase().includes(search)
        );
    });

    const resetSelection = () => {
        setSelectedStudent(null);
        setPendingFees([]);
        setSelectedPendingFees([]);
        setPendingDiscounts({});
        setNewFeeItems([]);
        setSearchTerm('');
        form.reset();
        form.setData('account_id', resolvedDefaultAccountId);
    };

    const handleStudentSelect = async (student: Student) => {
        setSelectedStudent(student);
        form.setData('student_id', student.id.toString());
        setSearchTerm('');
        setSelectedPendingFees([]);
        setPendingDiscounts({});
        setNewFeeItems([]);

        setLoading(true);
        try {
            const duesResponse = await fetch(`/api/fee-collections/student-dues?student_id=${student.id}`);
            const duesData = await duesResponse.json();
            const dues = duesData.dues || duesData;
            setPendingFees(Array.isArray(dues) ? dues : []);

            if (duesData.next_month && duesData.next_year) {
                setNextUnpaidMonth(duesData.next_month);
                setNextUnpaidYear(duesData.next_year);
            }

            if (student.school_class?.id) {
                const feesResponse = await fetch(`/api/fee-structures?class_id=${student.school_class.id}`);
                const feesData = await feesResponse.json();
                setAvailableFees(feesData);
            }

            if (Array.isArray(dues) && dues.length > 0) {
                setActiveTab('pending');
            }
        } catch (error) {
            console.error('Failed to load student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePendingFee = (feeId: number) => {
        if (selectedPendingFees.includes(feeId)) {
            setSelectedPendingFees((prev) => prev.filter((id) => id !== feeId));
            setPendingDiscounts((prev) => {
                const next = { ...prev };
                delete next[feeId];
                return next;
            });
        } else {
            setSelectedPendingFees((prev) => [...prev, feeId]);
            setPendingDiscounts((prev) => ({ ...prev, [feeId]: 0 }));
        }
    };

    const selectAllPending = () => {
        if (selectedPendingFees.length === pendingFees.length) {
            setSelectedPendingFees([]);
            setPendingDiscounts({});
        } else {
            const ids = pendingFees.map((fee) => fee.id);
            setSelectedPendingFees(ids);
            setPendingDiscounts(Object.fromEntries(ids.map((id) => [id, 0])));
        }
    };

    const addNewFeeItem = (feeStructure: FeeStructure) => {
        setNewFeeItems((prev) => [
            ...prev,
            {
                localId: `${feeStructure.id}-${Date.now()}`,
                fee_structure_id: feeStructure.id,
                fee_type_name: feeStructure.fee_type.name,
                amount: feeStructure.amount,
                month: nextUnpaidMonth,
                year: nextUnpaidYear,
                months_count: 1,
                discounts: [0],
            },
        ]);
    };

    const removeNewFeeItem = (localId: string) => {
        setNewFeeItems((prev) => prev.filter((item) => item.localId !== localId));
    };

    const updateNewFeeItem = (localId: string, field: 'month' | 'year' | 'months_count', value: number) => {
        setNewFeeItems((prev) =>
            prev.map((item) => {
                if (item.localId !== localId) return item;
                if (field === 'months_count') {
                    const discounts = Array.from({ length: value }, (_, i) => item.discounts[i] ?? 0);
                    return { ...item, months_count: value, discounts };
                }
                return { ...item, [field]: value };
            })
        );
    };

    const updatePendingDiscount = (feeId: number, discount: number) => {
        const fee = pendingFees.find((f) => f.id === feeId);
        const maxDiscount = fee ? parseFloat(fee.total_amount.toString()) || 0 : 0;
        setPendingDiscounts((prev) => ({
            ...prev,
            [feeId]: Math.min(Math.max(0, discount), maxDiscount),
        }));
    };

    const updateAdvanceDiscount = (localId: string, monthIndex: number, discount: number) => {
        setNewFeeItems((prev) =>
            prev.map((item) => {
                if (item.localId !== localId) return item;
                const discounts = [...item.discounts];
                discounts[monthIndex] = Math.min(Math.max(0, discount), item.amount);
                return { ...item, discounts };
            })
        );
    };

    const buildCartLines = (): CartLine[] => {
        const lines: CartLine[] = [];

        selectedPendingFees.forEach((feeId) => {
            const fee = pendingFees.find((f) => f.id === feeId);
            if (!fee) return;
            const gross = parseFloat(fee.total_amount.toString()) || 0;
            const discount = pendingDiscounts[feeId] ?? 0;
            lines.push({
                key: `pending-${feeId}`,
                type: 'pending',
                title: fee.fee_type,
                period: fee.month_name,
                grossAmount: gross,
                discount,
                pendingFeeId: feeId,
            });
        });

        newFeeItems.forEach((item) => {
            const months = generateMonthsList(item.month, item.year, item.months_count);
            let m = item.month;
            let y = item.year;
            for (let i = 0; i < item.months_count; i++) {
                lines.push({
                    key: `advance-${item.localId}-${i}`,
                    type: 'advance',
                    title: item.fee_type_name,
                    period: months[i],
                    grossAmount: item.amount,
                    discount: item.discounts[i] ?? 0,
                    advanceLocalId: item.localId,
                    monthIndex: i,
                });
                m++;
                if (m > 12) {
                    m = 1;
                    y++;
                }
            }
        });

        return lines;
    };

    const cartLines = buildCartLines();
    const subtotal = cartLines.reduce((sum, line) => sum + line.grossAmount, 0);
    const totalDiscount = cartLines.reduce((sum, line) => sum + line.discount, 0);
    const grandTotal = subtotal - totalDiscount;
    const hasSelection = cartLines.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData: Record<string, unknown> = {
            student_id: form.data.student_id,
            account_id: form.data.account_id,
            payment_method: form.data.payment_method,
            payment_date: form.data.payment_date,
            remarks: form.data.remarks,
        };

        if (selectedPendingFees.length > 0) {
            submitData.pending_fees = selectedPendingFees.map((id) => ({
                id,
                discount: pendingDiscounts[id] ?? 0,
            }));
        }

        if (newFeeItems.length > 0) {
            submitData.fee_structures = newFeeItems.flatMap((item) => {
                const fees = [];
                let m = item.month;
                let y = item.year;
                for (let i = 0; i < item.months_count; i++) {
                    fees.push({
                        fee_structure_id: item.fee_structure_id,
                        month: m,
                        year: y,
                        discount: item.discounts[i] ?? 0,
                    });
                    m++;
                    if (m > 12) {
                        m = 1;
                        y++;
                    }
                }
                return fees;
            });
        }

        router.post('/fee-collections', submitData, {
            onSuccess: () => {
                onClose();
                resetSelection();
            },
        });
    };

    if (!isOpen) return null;

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30';
    const labelClass = 'mb-0.5 block text-[11px] font-medium text-slate-500';

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-3">
            <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4">
                    <div className="min-w-0 pr-2">
                        <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">Collect Fee</h2>
                        <p className="hidden truncate text-[11px] text-slate-500 sm:block">
                            Select fees, apply per-item discount, and record payment
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    {!selectedStudent ? (
                        <div className="overflow-y-auto p-3 sm:p-4">
                            <label className={`${labelClass} mb-2 flex items-center gap-1.5`}>
                                <User className="h-3.5 w-3.5" />
                                Find Student
                            </label>

                            <select
                                onChange={(e) => {
                                    const student = students.find((s) => s.id === parseInt(e.target.value));
                                    if (student) handleStudentSelect(student);
                                }}
                                className={`${inputClass} mb-3`}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Choose from list...
                                </option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.user?.name} · Roll {student.roll_number} · {student.school_class?.name}
                                    </option>
                                ))}
                            </select>

                            <div className="mb-3 flex items-center gap-2">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">or search</span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Name, roll, admission no..."
                                    className={`${inputClass} pl-8`}
                                />
                            </div>

                            {searchTerm && (
                                <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200 sm:max-h-64">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <button
                                                key={student.id}
                                                type="button"
                                                onClick={() => handleStudentSelect(student)}
                                                className="flex w-full items-center gap-2.5 border-b border-slate-100 p-2.5 text-left transition last:border-0 hover:bg-indigo-50/80"
                                            >
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                                                    <User className="h-3.5 w-3.5 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-slate-900">
                                                        {student.user?.name}
                                                    </p>
                                                    <p className="truncate text-[11px] text-slate-500">
                                                        Roll {student.roll_number} · {student.school_class?.name}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-500">
                                            <AlertCircle className="mx-auto mb-1.5 h-6 w-6 text-slate-300" />
                                            No students found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                            {/* Left: Fee Selection */}
                            <div className="flex min-h-0 flex-1 flex-col border-b border-slate-200 lg:max-w-[58%] lg:border-b-0 lg:border-r">
                                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                                            {(selectedStudent.user?.name ?? '?')[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-slate-900">
                                                {selectedStudent.user?.name}
                                            </p>
                                            <p className="truncate text-[10px] text-slate-500">
                                                {selectedStudent.school_class?.name} · Roll {selectedStudent.roll_number}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={resetSelection}
                                        className="shrink-0 text-[10px] font-medium text-slate-500 hover:text-slate-700"
                                    >
                                        Change
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex flex-1 items-center justify-center py-10">
                                        <div className="text-center">
                                            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                            <p className="mt-2 text-[11px] text-slate-500">Loading fees...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex shrink-0 border-b border-slate-200 px-3">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('pending')}
                                                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[11px] font-medium transition sm:text-xs ${
                                                    activeTab === 'pending'
                                                        ? 'border-indigo-600 text-indigo-600'
                                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                Pending
                                                {pendingFees.length > 0 && (
                                                    <span className="rounded-full bg-red-100 px-1.5 py-px text-[10px] font-semibold text-red-700">
                                                        {pendingFees.length}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('advance')}
                                                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[11px] font-medium transition sm:text-xs ${
                                                    activeTab === 'advance'
                                                        ? 'border-indigo-600 text-indigo-600'
                                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Advance
                                            </button>
                                        </div>

                                        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:max-h-none sm:p-3.5">
                                            {activeTab === 'pending' && (
                                                <div className="space-y-1.5">
                                                    {pendingFees.length > 0 ? (
                                                        <>
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                                                    Outstanding
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    onClick={selectAllPending}
                                                                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                                                                >
                                                                    {selectedPendingFees.length === pendingFees.length
                                                                        ? 'Deselect all'
                                                                        : 'Select all'}
                                                                </button>
                                                            </div>
                                                            {pendingFees.map((fee) => {
                                                                const isSelected = selectedPendingFees.includes(fee.id);
                                                                return (
                                                                    <button
                                                                        key={fee.id}
                                                                        type="button"
                                                                        onClick={() => togglePendingFee(fee.id)}
                                                                        className={`w-full rounded-lg border p-2.5 text-left transition ${
                                                                            isSelected
                                                                                ? 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-200'
                                                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                readOnly
                                                                                checked={isSelected}
                                                                                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                                                                            />
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                                    <span className="text-xs font-medium text-slate-900">
                                                                                        {fee.fee_type}
                                                                                    </span>
                                                                                    <span
                                                                                        className={`inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[10px] font-medium ${
                                                                                            fee.status === 'overdue'
                                                                                                ? 'bg-red-100 text-red-700'
                                                                                                : 'bg-amber-100 text-amber-700'
                                                                                        }`}
                                                                                    >
                                                                                        {fee.status === 'overdue' ? (
                                                                                            <XCircle className="h-2.5 w-2.5" />
                                                                                        ) : (
                                                                                            <Clock className="h-2.5 w-2.5" />
                                                                                        )}
                                                                                        {fee.status}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                                                                                    <Calendar className="h-2.5 w-2.5" />
                                                                                    {fee.month_name}
                                                                                    {fee.late_fee > 0 && (
                                                                                        <span className="text-red-600">
                                                                                            Late ৳{formatMoney(fee.late_fee)}
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <span className="shrink-0 text-xs font-semibold text-slate-900">
                                                                                ৳{formatMoney(fee.total_amount)}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </>
                                                    ) : (
                                                        <div className="py-8 text-center">
                                                            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                                                            <p className="text-xs font-medium text-slate-700">All clear</p>
                                                            <p className="text-[11px] text-slate-500">No pending fees</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'advance' && (
                                                <div className="space-y-3">
                                                    {availableFees.length > 0 ? (
                                                        <>
                                                            <div>
                                                                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                                                    Add fee type
                                                                </p>
                                                                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                                                    {availableFees.map((fee) => (
                                                                        <button
                                                                            key={fee.id}
                                                                            type="button"
                                                                            onClick={() => addNewFeeItem(fee)}
                                                                            className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 p-2 text-left transition hover:border-indigo-400 hover:bg-indigo-50/40"
                                                                        >
                                                                            <div className="min-w-0 pr-1">
                                                                                <p className="truncate text-xs font-medium text-slate-800">
                                                                                    {fee.fee_type.name}
                                                                                </p>
                                                                                <p className="text-[10px] text-slate-500">
                                                                                    ৳{formatMoney(fee.amount)} / {fee.fee_type.frequency}
                                                                                </p>
                                                                            </div>
                                                                            <Plus className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {newFeeItems.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                                                        Configured
                                                                    </p>
                                                                    {newFeeItems.map((item) => (
                                                                        <div
                                                                            key={item.localId}
                                                                            className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                                                                        >
                                                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                                                <p className="text-xs font-medium text-slate-900">
                                                                                    {item.fee_type_name}
                                                                                </p>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeNewFeeItem(item.localId)}
                                                                                    className="rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                                >
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="grid grid-cols-3 gap-1.5">
                                                                                <div>
                                                                                    <label className={labelClass}>Month</label>
                                                                                    <select
                                                                                        value={item.month}
                                                                                        onChange={(e) =>
                                                                                            updateNewFeeItem(
                                                                                                item.localId,
                                                                                                'month',
                                                                                                parseInt(e.target.value)
                                                                                            )
                                                                                        }
                                                                                        className={inputClass}
                                                                                    >
                                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                                                            (m) => (
                                                                                                <option key={m} value={m}>
                                                                                                    {getMonthName(m)}
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                    </select>
                                                                                </div>
                                                                                <div>
                                                                                    <label className={labelClass}>Year</label>
                                                                                    <select
                                                                                        value={item.year}
                                                                                        onChange={(e) =>
                                                                                            updateNewFeeItem(
                                                                                                item.localId,
                                                                                                'year',
                                                                                                parseInt(e.target.value)
                                                                                            )
                                                                                        }
                                                                                        className={inputClass}
                                                                                    >
                                                                                        {Array.from(
                                                                                            { length: 5 },
                                                                                            (_, i) => currentYear - 2 + i
                                                                                        ).map((y) => (
                                                                                            <option key={y} value={y}>
                                                                                                {y}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                <div>
                                                                                    <label className={labelClass}>Count</label>
                                                                                    <select
                                                                                        value={item.months_count}
                                                                                        onChange={(e) =>
                                                                                            updateNewFeeItem(
                                                                                                item.localId,
                                                                                                'months_count',
                                                                                                parseInt(e.target.value)
                                                                                            )
                                                                                        }
                                                                                        className={inputClass}
                                                                                    >
                                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                                                            (n) => (
                                                                                                <option key={n} value={n}>
                                                                                                    {n}
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                            <p className="mt-1.5 text-[10px] leading-snug text-indigo-700">
                                                                                {generateMonthsList(
                                                                                    item.month,
                                                                                    item.year,
                                                                                    item.months_count
                                                                                ).join(' · ')}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="py-8 text-center text-xs text-slate-500">
                                                            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                                                            No fee structures for this class
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right: Cart & Payment */}
                            <div className="flex min-h-0 w-full flex-col bg-slate-50 lg:w-[42%] lg:shrink-0">
                                <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-200 px-3 py-2">
                                    <ShoppingCart className="h-3.5 w-3.5 text-slate-600" />
                                    <span className="text-xs font-semibold text-slate-800">Summary</span>
                                    {cartLines.length > 0 && (
                                        <span className="ml-auto rounded-full bg-indigo-600 px-1.5 py-px text-[10px] font-bold text-white">
                                            {cartLines.length}
                                        </span>
                                    )}
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3">
                                    {!hasSelection ? (
                                        <div className="flex min-h-[120px] flex-col items-center justify-center py-6 text-center sm:min-h-[160px]">
                                            <ShoppingCart className="mb-2 h-7 w-7 text-slate-300" />
                                            <p className="text-xs font-medium text-slate-600">No fees selected</p>
                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                                Select pending or advance fees
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {cartLines.map((line) => (
                                                <div
                                                    key={line.key}
                                                    className="rounded-lg border border-slate-200 bg-white p-2"
                                                >
                                                    <div className="mb-1.5 flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[11px] font-medium text-slate-900 sm:text-xs">
                                                                {line.title}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">{line.period}</p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-[10px] text-slate-400">Amt</p>
                                                            <p className="text-[11px] font-semibold text-slate-800 sm:text-xs">
                                                                ৳{formatMoney(line.grossAmount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <label className="shrink-0 text-[10px] font-medium text-slate-500">
                                                            Disc.
                                                        </label>
                                                        <div className="relative min-w-0 flex-1">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                                                ৳
                                                            </span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max={line.grossAmount}
                                                                value={line.discount || ''}
                                                                onChange={(e) => {
                                                                    const val =
                                                                        e.target.value === ''
                                                                            ? 0
                                                                            : parseFloat(e.target.value);
                                                                    if (line.type === 'pending' && line.pendingFeeId) {
                                                                        updatePendingDiscount(line.pendingFeeId, val);
                                                                    } else if (
                                                                        line.type === 'advance' &&
                                                                        line.advanceLocalId !== undefined &&
                                                                        line.monthIndex !== undefined
                                                                    ) {
                                                                        updateAdvanceDiscount(
                                                                            line.advanceLocalId,
                                                                            line.monthIndex,
                                                                            val
                                                                        );
                                                                    }
                                                                }}
                                                                className="w-full rounded-md border border-slate-200 py-1 pl-5 pr-1.5 text-[11px] focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="w-16 shrink-0 text-right sm:w-[4.5rem]">
                                                            <p className="text-[10px] text-slate-400">Net</p>
                                                            <p className="text-[11px] font-semibold text-emerald-700 sm:text-xs">
                                                                ৳{formatMoney(line.grossAmount - line.discount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {hasSelection && (
                                    <div className="shrink-0 border-t border-slate-200 p-2.5 sm:p-3">
                                        <div className="mb-2.5 space-y-1 rounded-lg bg-white p-2.5 text-[11px] sm:text-xs">
                                            <div className="flex justify-between text-slate-600">
                                                <span>Subtotal</span>
                                                <span>৳{formatMoney(subtotal)}</span>
                                            </div>
                                            {totalDiscount > 0 && (
                                                <div className="flex justify-between text-emerald-600">
                                                    <span>Discount</span>
                                                    <span>-৳{formatMoney(totalDiscount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between border-t border-slate-100 pt-1.5 text-xs font-bold text-slate-900 sm:text-sm">
                                                <span>Total</span>
                                                <span className="text-indigo-700">৳{formatMoney(grandTotal)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <label className={labelClass}>Account</label>
                                                <select
                                                    value={form.data.account_id}
                                                    onChange={(e) => form.setData('account_id', e.target.value)}
                                                    className={inputClass}
                                                    required
                                                >
                                                    {accounts.map((account) => (
                                                        <option key={account.id} value={account.id}>
                                                            {account.account_name} (৳{formatMoney(account.current_balance)})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className={labelClass}>Method</label>
                                                    <select
                                                        value={form.data.payment_method}
                                                        onChange={(e) =>
                                                            form.setData('payment_method', e.target.value)
                                                        }
                                                        className={inputClass}
                                                        required
                                                    >
                                                        <option value="cash">Cash</option>
                                                        <option value="bank_transfer">Bank Transfer</option>
                                                        <option value="cheque">Cheque</option>
                                                        <option value="mobile_banking">Mobile Banking</option>
                                                        <option value="online">Online</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Date</label>
                                                    <input
                                                        type="date"
                                                        value={form.data.payment_date}
                                                        onChange={(e) =>
                                                            form.setData('payment_date', e.target.value)
                                                        }
                                                        className={inputClass}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Remarks</label>
                                                <textarea
                                                    value={form.data.remarks}
                                                    onChange={(e) => form.setData('remarks', e.target.value)}
                                                    rows={2}
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="Optional notes..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-2.5 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="flex-1 rounded-lg border border-slate-300 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={form.processing}
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {form.processing ? (
                                                    <>
                                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        <span className="hidden sm:inline">Processing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        <span className="truncate">
                                                            Collect ৳{formatMoney(grandTotal)}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
