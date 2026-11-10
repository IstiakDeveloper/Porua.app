import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatAmount } from '@/lib/formatCurrency';
import { formatReceiptNumber } from '@/lib/formatReceipt';
import {
    Search,
    User,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    X,
    Printer,
    ArrowLeft,
    CreditCard,
    Check,
    RotateCcw,
    ShieldCheck,
    Receipt,
    Phone,
    BadgeCheck,
    RefreshCw,
} from 'lucide-react';

interface StudentItem {
    id: number;
    name: string;
    admission_number: string;
    roll_number: string;
    class_id: number;
    section_id: number;
    class_name: string;
    section_name: string;
    phone: string;
    father_name: string;
    photo: string | null;
    monthly_fee: number | null;
}

interface AccountItem {
    id: number;
    account_name: string;
    current_balance: number;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface DueFee {
    id: number;
    fee_type_id: number;
    fee_type: string;
    month: number | null;
    year: number | null;
    month_name: string;
    amount: number;
    late_fee: number;
    discount: number;
    total_amount: number;
    paid_amount: number;
    status: string;
    due_date: string | null;
}

interface AdvanceMonth {
    month: number;
    year: number;
    label: string;
    full_label: string;
    fee_structure_id: number | null;
    fee_type_name: string;
    amount: number;
}

interface FeeStructure {
    id: number;
    fee_type_id: number;
    fee_type_name: string;
    frequency: string;
    amount: number;
}

interface ActiveWaiver {
    id: number;
    fee_type_id: number | null;
    fee_type_name: string;
    waiver_type: string;
    waiver_value: number;
    reason: string | null;
}

interface RecentReceipt {
    id: number;
    receipt_number: string;
    payment_date: string;
    payment_method: string;
    total_paid: number;
    items_count: number;
    fee_names: string;
}

interface Props {
    students: StudentItem[];
    classes: SchoolClass[];
    sections: Section[];
    accounts: AccountItem[];
    defaultAccountId?: number | null;
    preselectedStudentId?: number | null;
    preselectedMonth?: number | null;
    preselectedFeeId?: number | null;
}

export default function Create({
    students,
    classes,
    sections,
    accounts,
    defaultAccountId,
    preselectedStudentId,
    preselectedMonth,
    preselectedFeeId,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
    const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);

    const [loadingDues, setLoadingDues] = useState(false);
    const [dues, setDues] = useState<DueFee[]>([]);
    const [advanceMonths, setAdvanceMonths] = useState<AdvanceMonth[]>([]);
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [activeWaivers, setActiveWaivers] = useState<ActiveWaiver[]>([]);
    const [recentReceipts, setRecentReceipts] = useState<RecentReceipt[]>([]);

    const [selectedDueIds, setSelectedDueIds] = useState<number[]>([]);
    const [dueDiscounts, setDueDiscounts] = useState<Record<number, number>>({});
    const [selectedAdvance, setSelectedAdvance] = useState<{ month: number; year: number; fee_structure_id: number; amount: number; discount: number; label: string }[]>([]);

    const [selectedAccountId, setSelectedAccountId] = useState<number>(
        defaultAccountId ?? accounts[0]?.id ?? 1
    );
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_banking' | 'bank_transfer' | 'cheque' | 'online'>('cash');
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [remarks, setRemarks] = useState('');
    const [tenderedCash, setTenderedCash] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resyncingDues, setResyncingDues] = useState(false);
    const [resyncMessage, setResyncMessage] = useState<string | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            if (selectedClassId !== 'all' && s.class_id !== Number(selectedClassId)) return false;
            if (selectedSectionId !== 'all' && s.section_id !== Number(selectedSectionId)) return false;
            if (!searchTerm.trim()) return true;

            const q = searchTerm.toLowerCase();
            return (
                s.name.toLowerCase().includes(q) ||
                s.admission_number.toLowerCase().includes(q) ||
                s.roll_number.toLowerCase().includes(q) ||
                (s.phone && s.phone.includes(q))
            );
        }).slice(0, 15);
    }, [students, searchTerm, selectedClassId, selectedSectionId]);

    const availableSections = useMemo(() => {
        if (selectedClassId === 'all') return sections;
        return sections.filter((sec) => sec.class_id === Number(selectedClassId));
    }, [sections, selectedClassId]);

    useEffect(() => {
        if (preselectedStudentId) {
            const found = students.find((s) => s.id === preselectedStudentId);
            if (found) {
                handleSelectStudent(found);
            }
        }
    }, [preselectedStudentId]);

    const handleSelectStudent = async (student: StudentItem) => {
        setSelectedStudent(student);
        setShowStudentDropdown(false);
        setSearchTerm('');
        setLoadingDues(true);
        setErrorMessage(null);

        setSelectedDueIds([]);
        setDueDiscounts({});
        setSelectedAdvance([]);
        setTenderedCash('');

        try {
            const res = await fetch(`/api/fee-collections/student-dues?student_id=${student.id}`);
            if (!res.ok) throw new Error('Failed to load dues');
            const data = await res.json();

            setDues(data.dues || []);
            setAdvanceMonths(data.advance_months || []);
            setFeeStructures(data.fee_structures || []);
            setActiveWaivers(data.active_waivers || []);
            setRecentReceipts(data.recent_receipts || []);

            if (data.dues && data.dues.length > 0) {
                if (preselectedFeeId) {
                    const feeMatch = data.dues.filter((d: DueFee) => d.id === preselectedFeeId);
                    if (feeMatch.length > 0) {
                        setSelectedDueIds(feeMatch.map((d: DueFee) => d.id));
                    } else if (preselectedMonth) {
                        const monthMatches = data.dues.filter((d: DueFee) => d.month === preselectedMonth);
                        setSelectedDueIds(monthMatches.length > 0 ? monthMatches.map((d: DueFee) => d.id) : data.dues.map((d: DueFee) => d.id));
                    } else {
                        setSelectedDueIds(data.dues.map((d: DueFee) => d.id));
                    }
                } else if (preselectedMonth) {
                    const monthMatches = data.dues.filter((d: DueFee) => d.month === preselectedMonth);
                    if (monthMatches.length > 0) {
                        setSelectedDueIds(monthMatches.map((d: DueFee) => d.id));
                    } else {
                        setSelectedDueIds(data.dues.map((d: DueFee) => d.id));
                    }
                } else {
                    const allIds = data.dues.map((d: DueFee) => d.id);
                    setSelectedDueIds(allIds);
                }
            } else if (preselectedMonth && data.advance_months && data.advance_months.length > 0) {
                const advMatch = data.advance_months.find((a: AdvanceMonth) => a.month === preselectedMonth);
                if (advMatch) {
                    setSelectedAdvance([{
                        month: advMatch.month,
                        year: advMatch.year,
                        fee_structure_id: advMatch.fee_structure_id || 0,
                        amount: advMatch.amount,
                        discount: 0,
                        label: advMatch.label,
                    }]);
                }
            }
        } catch (err: any) {
            setErrorMessage('Error fetching student fee dues. Please try again.');
        } finally {
            setLoadingDues(false);
        }
    };

    const toggleDue = (id: number) => {
        setSelectedDueIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAllDues = () => {
        if (selectedDueIds.length === dues.length) {
            setSelectedDueIds([]);
        } else {
            setSelectedDueIds(dues.map((d) => d.id));
        }
    };

    const handleResyncDues = async () => {
        if (!selectedStudent || resyncingDues) return;
        setResyncingDues(true);
        setResyncMessage(null);
        setErrorMessage(null);
        try {
            // GET avoids CSRF mismatch (route already allows GET|POST).
            // Plain CSRF meta must NOT be sent as X-XSRF-TOKEN (that expects the encrypted cookie).
            const res = await fetch(
                `/api/fee-collections/resync-student-dues?student_id=${encodeURIComponent(String(selectedStudent.id))}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                }
            );

            const data = await res.json().catch(() => null);

            if (res.ok && data?.success) {
                setResyncMessage(data.message);
                await handleSelectStudent(selectedStudent);
            } else {
                setErrorMessage(data?.error || data?.message || `Failed to resync dues (Status: ${res.status})`);
            }
        } catch (err: any) {
            setErrorMessage(err?.message || 'Error resyncing student dues. Please try again.');
        } finally {
            setResyncingDues(false);
        }
    };

    const handleDueDiscountChange = (id: number, val: string) => {
        const num = parseFloat(val) || 0;
        setDueDiscounts((prev) => ({ ...prev, [id]: Math.max(0, num) }));
    };

    const toggleAdvanceMonth = (item: AdvanceMonth) => {
        if (!item.fee_structure_id) return;
        const key = `${item.year}-${item.month}`;
        const exists = selectedAdvance.find((a) => `${a.year}-${a.month}` === key);

        if (exists) {
            setSelectedAdvance((prev) => prev.filter((a) => `${a.year}-${a.month}` !== key));
        } else {
            setSelectedAdvance((prev) => [
                ...prev,
                {
                    month: item.month,
                    year: item.year,
                    fee_structure_id: item.fee_structure_id!,
                    amount: item.amount,
                    discount: 0,
                    label: item.label,
                },
            ]);
        }
    };

    const calculation = useMemo(() => {
        let grossTotal = 0;
        let totalLateFee = 0;
        let totalDiscount = 0;
        let itemsCount = 0;

        dues.forEach((due) => {
            if (selectedDueIds.includes(due.id)) {
                itemsCount++;
                grossTotal += Number(due.amount);
                totalLateFee += Number(due.late_fee || 0);

                const discountVal = dueDiscounts[due.id] !== undefined
                    ? dueDiscounts[due.id]
                    : Number(due.discount || 0);

                totalDiscount += Number(discountVal);
            }
        });

        selectedAdvance.forEach((adv) => {
            itemsCount++;
            grossTotal += Number(adv.amount);
            totalDiscount += Number(adv.discount || 0);
        });

        const netPayable = Math.max(0, grossTotal + totalLateFee - totalDiscount);
        const tendered = parseFloat(tenderedCash) || 0;
        const changeDue = tendered > netPayable ? tendered - netPayable : 0;

        return {
            grossTotal,
            totalLateFee,
            totalDiscount,
            netPayable,
            itemsCount,
            changeDue,
        };
    }, [dues, selectedDueIds, dueDiscounts, selectedAdvance, tenderedCash]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedStudent) {
            setErrorMessage('Please select a student first.');
            return;
        }

        if (calculation.itemsCount === 0) {
            setErrorMessage('Please select at least one fee or advance month to collect.');
            return;
        }

        setSubmitting(true);
        setErrorMessage(null);

        const pendingFeesPayload = dues
            .filter((d) => selectedDueIds.includes(d.id))
            .map((d) => ({
                id: d.id,
                discount: dueDiscounts[d.id] !== undefined ? dueDiscounts[d.id] : Number(d.discount || 0),
            }));

        const feeStructuresPayload = selectedAdvance.map((a) => ({
            fee_structure_id: a.fee_structure_id,
            month: a.month,
            year: a.year,
            discount: a.discount || 0,
        }));

        const payload = {
            student_id: selectedStudent.id,
            account_id: selectedAccountId,
            payment_method: paymentMethod,
            payment_date: paymentDate,
            remarks: remarks.trim() || undefined,
            pending_fees: pendingFeesPayload,
            fee_structures: feeStructuresPayload,
            redirect_to_receipt: true,
        };

        router.post('/fee-collections', payload, {
            onError: (errors) => {
                setSubmitting(false);
                const firstErr = Object.values(errors)[0] as string;
                setErrorMessage(firstErr || 'Failed to collect fees. Please verify your inputs.');
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Collection Counter" />

            <div className="space-y-4 pb-10" onKeyDown={handleKeyDown}>
                {/* Header Card (Compact) */}
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => router.visit('/fee-collections')}
                            className="w-8 h-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition inline-flex items-center justify-center shrink-0 cursor-pointer"
                            title="Back to Collections List"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2 leading-tight">
                                <Receipt className="w-4 h-4 text-indigo-600 shrink-0" />
                                Fee Collection Counter
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Single-screen POS desk for fast student fee collection & instant money receipts
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <BadgeCheck className="w-3 h-3 shrink-0 text-emerald-600" /> POS Desk
                        </span>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span className="flex-1 font-medium">{errorMessage}</span>
                        <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700 shrink-0">
                            <X className="w-3.5 h-3.5 shrink-0" />
                        </button>
                    </div>
                )}

                {/* Split POS Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* LEFT COLUMN: Student Picker & Ledger Items (7 of 12 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* 1. Student Search & Profile Box */}
                        <div className="bg-white rounded-lg p-3.5 shadow-xs border border-slate-200 relative">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <User className="w-3 h-3 shrink-0 text-indigo-600" />
                                    Select Student
                                </label>
                                {selectedStudent && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedStudent(null);
                                            setDues([]);
                                            setSelectedDueIds([]);
                                            setSelectedAdvance([]);
                                            setTimeout(() => searchInputRef.current?.focus(), 100);
                                        }}
                                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-2.5 h-2.5 shrink-0" /> Change Student
                                    </button>
                                )}
                            </div>

                            {!selectedStudent ? (
                                <div className="space-y-2">
                                    {/* Class & Section Select Filters */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <div>
                                            <select
                                                value={selectedClassId}
                                                onChange={(e) => {
                                                    setSelectedClassId(e.target.value);
                                                    setSelectedSectionId('all');
                                                }}
                                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="all">All Classes</option>
                                                {classes.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={selectedSectionId}
                                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                                className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="all">All Sections</option>
                                                {availableSections.map((sec) => (
                                                    <option key={sec.id} value={sec.id}>
                                                        {sec.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                {filteredStudents.length} students found
                                            </span>
                                        </div>
                                    </div>

                                    {/* Search Input Bar (With Clear 36px Offset) */}
                                    <div className="relative flex items-center">
                                        <div className="absolute left-2.5 pointer-events-none text-slate-400 flex items-center z-10">
                                            <Search className="w-3.5 h-3.5 shrink-0" />
                                        </div>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            style={{ paddingLeft: '2.25rem' }}
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowStudentDropdown(true);
                                            }}
                                            onFocus={() => setShowStudentDropdown(true)}
                                            placeholder="Search student name, roll, or admission ID..."
                                            className="w-full pr-7 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-2 text-slate-400 hover:text-slate-600 z-10"
                                            >
                                                <X className="w-3 h-3 shrink-0" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Results */}
                                    {showStudentDropdown && (
                                        <div className="absolute z-30 left-3.5 right-3.5 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100">
                                            {filteredStudents.length === 0 ? (
                                                <div className="p-3 text-center text-xs text-slate-500">
                                                    No students found matching "{searchTerm}"
                                                </div>
                                            ) : (
                                                filteredStudents.map((s) => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => handleSelectStudent(s)}
                                                        className="w-full text-left p-2.5 hover:bg-indigo-50/70 flex items-center justify-between transition cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold inline-flex items-center justify-center text-[11px] shrink-0">
                                                                {s.photo ? (
                                                                    <img src={s.photo} alt={s.name} className="w-full h-full object-cover rounded-full" />
                                                                ) : (
                                                                    s.name.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                                                                    {s.name}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500">
                                                                    Class: <span className="font-medium text-slate-700">{s.class_name}</span> {s.section_name && `(${s.section_name})`} | Roll: <span className="font-medium text-slate-700">{s.roll_number || 'N/A'}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                            ID: {s.admission_number}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Selected Student Profile Card */
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold inline-flex items-center justify-center text-sm shadow-xs overflow-hidden shrink-0">
                                            {selectedStudent.photo ? (
                                                <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                            ) : (
                                                selectedStudent.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                                {selectedStudent.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-600">
                                                <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                                    Class: {selectedStudent.class_name} {selectedStudent.section_name && `(${selectedStudent.section_name})`}
                                                </span>
                                                <span>•</span>
                                                <span>Roll: <b className="text-slate-900">{selectedStudent.roll_number || 'N/A'}</b></span>
                                                <span>•</span>
                                                <span>ID: <b className="font-mono text-slate-900">{selectedStudent.admission_number}</b></span>
                                            </div>
                                            {(selectedStudent.father_name || selectedStudent.phone) && (
                                                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                                    {selectedStudent.father_name && <span>Father: {selectedStudent.father_name}</span>}
                                                    {selectedStudent.phone && (
                                                        <span className="inline-flex items-center gap-0.5">
                                                            <Phone className="w-2.5 h-2.5 shrink-0 text-slate-400" /> {selectedStudent.phone}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1.5">
                                        {activeWaivers.length > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-600" />
                                                {activeWaivers[0].waiver_type === 'percentage'
                                                    ? `${activeWaivers[0].waiver_value}% Waiver`
                                                    : `৳${formatAmount(activeWaivers[0].waiver_value)} Waiver`}
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                            dues.length > 0
                                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        }`}>
                                            {dues.length > 0 ? `${dues.length} Dues Pending` : 'No Dues Pending'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Outstanding Dues Checklist (Compact) */}
                        {selectedStudent && (
                            <div className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
                                <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
                                    <div>
                                        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                            Outstanding Student Dues
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono font-bold">
                                                {dues.length}
                                            </span>
                                        </h2>
                                        <p className="text-[10px] text-slate-500">
                                            Check fees to collect now
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={handleResyncDues}
                                            disabled={resyncingDues}
                                            title="ভর্তির তারিখ অনুযায়ী বকেয়া ও অনুপস্থিত মাসিক ফি রিসিংক করুন"
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${resyncingDues ? 'animate-spin' : ''}`} />
                                            {resyncingDues ? 'রিসিংক হচ্ছে...' : 'রিসিংক ফি'}
                                        </button>
                                        {dues.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={toggleSelectAllDues}
                                                className="text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                                            >
                                                {selectedDueIds.length === dues.length ? 'Deselect All' : 'Select All Dues'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {resyncMessage && (
                                    <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{resyncMessage}</span>
                                        </div>
                                        <button type="button" onClick={() => setResyncMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                {loadingDues ? (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <p>Loading dues...</p>
                                    </div>
                                ) : dues.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto inline-flex items-center justify-center mb-2 shrink-0">
                                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        </div>
                                        <h3 className="text-xs font-bold text-slate-900">
                                            All clear! No pending dues recorded
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                                            ভর্তির তারিখ থেকে কোনো পূর্ববর্তী মাসিক ফি অনুপস্থিত থাকলে নিচের বাটনে ক্লিক করে স্বয়ংক্রিয়ভাবে তৈরি করে নিতে পারেন।
                                        </p>
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={handleResyncDues}
                                                disabled={resyncingDues}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 ${resyncingDues ? 'animate-spin' : ''}`} />
                                                {resyncingDues ? 'বিল জেনারেট হচ্ছে...' : 'ভর্তির তারিখ থেকে বিল রিসিংক / জেনারেট করুন'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {dues.map((fee) => {
                                            const isSelected = selectedDueIds.includes(fee.id);
                                            const currentDiscount = dueDiscounts[fee.id] !== undefined
                                                ? dueDiscounts[fee.id]
                                                : Number(fee.discount || 0);
                                            const lineTotal = Math.max(0, Number(fee.amount) + Number(fee.late_fee || 0) - currentDiscount);

                                            return (
                                                <div
                                                    key={fee.id}
                                                    onClick={() => toggleDue(fee.id)}
                                                    className={`p-2.5 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                                        isSelected
                                                            ? 'bg-indigo-50/40'
                                                            : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="pt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold text-slate-900">
                                                                    {fee.fee_type}
                                                                </span>
                                                                {fee.month_name !== 'N/A' && (
                                                                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                                        {fee.month_name}
                                                                    </span>
                                                                )}
                                                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full uppercase border ${
                                                                    fee.status === 'overdue'
                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                    {fee.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                                                <span>Original: ৳{formatAmount(fee.amount)}</span>
                                                                {fee.late_fee > 0 && (
                                                                    <span className="text-rose-600 font-medium">
                                                                        + Fine: ৳{formatAmount(fee.late_fee)}
                                                                    </span>
                                                                )}
                                                                {fee.due_date && <span>Due: {fee.due_date}</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-2 pl-6 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[10px] text-slate-500 whitespace-nowrap">
                                                                Disc:
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={Number(fee.amount) + Number(fee.late_fee || 0)}
                                                                value={currentDiscount}
                                                                onChange={(e) => handleDueDiscountChange(fee.id, e.target.value)}
                                                                disabled={!isSelected}
                                                                className="w-16 text-[11px] py-0.5 px-1.5 rounded border border-slate-300 bg-white text-slate-900 disabled:opacity-50 text-right font-mono"
                                                            />
                                                        </div>

                                                        <div className="text-right min-w-[70px]">
                                                            <span className={`text-xs font-bold font-mono ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                                ৳{formatAmount(lineTotal)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Quick Advance Month Chips (Compact) */}
                        {selectedStudent && advanceMonths.length > 0 && (
                            <div className="bg-white rounded-lg p-3.5 shadow-xs border border-slate-200">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                        Pay Advance Upcoming Months
                                    </h3>
                                    <span className="text-[10px] text-slate-400">1-Click add</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                    {advanceMonths.map((adv) => {
                                        const key = `${adv.year}-${adv.month}`;
                                        const isSelected = selectedAdvance.some((a) => `${a.year}-${a.month}` === key);

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleAdvanceMonth(adv)}
                                                className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/20'
                                                        : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full mb-0.5">
                                                    <span className="text-[11px] font-bold">{adv.label}</span>
                                                    {isSelected ? (
                                                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[9px] shrink-0">
                                                            <Check className="w-2.5 h-2.5 shrink-0" />
                                                        </span>
                                                    ) : (
                                                        <Plus className="w-3 h-3 shrink-0 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between w-full text-[10px]">
                                                    <span className="text-slate-500 truncate">{adv.fee_type_name}</span>
                                                    <span className="font-mono font-bold text-slate-900">
                                                        ৳{formatAmount(adv.amount)}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 4. Student Recent Receipts History */}
                        {selectedStudent && recentReceipts.length > 0 && (
                            <div className="bg-white rounded-lg p-3.5 shadow-xs border border-slate-200">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                                    <Receipt className="w-3 h-3 shrink-0 text-slate-400" />
                                    Recent Payment Receipts
                                </h3>
                                <div className="divide-y divide-slate-100">
                                    {recentReceipts.map((rcp) => (
                                        <div key={rcp.id} className="py-1.5 flex items-center justify-between text-[11px]">
                                            <div>
                                                <span className="font-mono font-bold text-indigo-600">
                                                    #{formatReceiptNumber(rcp.receipt_number)}
                                                </span>
                                                <p className="text-slate-500 text-[10px]">
                                                    {rcp.payment_date} • {rcp.payment_method}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="font-mono font-bold text-slate-900">
                                                    ৳{formatAmount(rcp.total_paid)}
                                                </span>
                                                <a
                                                    href={`/fee-collections/${rcp.id}/receipt`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-6 h-6 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 inline-flex items-center justify-center shrink-0 transition"
                                                    title="Print Receipt"
                                                >
                                                    <Printer className="w-3 h-3 shrink-0" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Billing Summary & Settlement (5 of 12 cols, Sticky) */}
                    <div className="lg:col-span-5 sticky top-16">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
                            {/* Panel Header */}
                            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                        <DollarSign className="w-4 h-4 shrink-0 text-emerald-600" />
                                        Collection Summary
                                    </h2>
                                    <p className="text-[10px] text-slate-500">
                                        Review totals and confirm transaction
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {calculation.itemsCount} {calculation.itemsCount === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            <div className="p-3.5 space-y-3">
                                {/* Totals Breakdown Box */}
                                <div className="bg-slate-50 p-3 rounded-lg space-y-1.5 border border-slate-200">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Gross Total Amount:</span>
                                        <span className="font-mono font-medium text-slate-900">৳{formatAmount(calculation.grossTotal)}</span>
                                    </div>
                                    {calculation.totalLateFee > 0 && (
                                        <div className="flex justify-between text-xs text-rose-600 font-medium">
                                            <span>Late Fine Fee:</span>
                                            <span className="font-mono">+ ৳{formatAmount(calculation.totalLateFee)}</span>
                                        </div>
                                    )}
                                    {calculation.totalDiscount > 0 && (
                                        <div className="flex justify-between text-xs text-emerald-700 font-medium">
                                            <span>Discount / Waiver:</span>
                                            <span className="font-mono">- ৳{formatAmount(calculation.totalDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline">
                                        <span className="text-xs font-bold text-slate-900">Net Payable:</span>
                                        <span className="text-lg font-bold text-indigo-700 font-mono">
                                            ৳{formatAmount(calculation.netPayable)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                        Payment Method
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {[
                                            { id: 'cash', label: 'Cash' },
                                            { id: 'mobile_banking', label: 'bKash / Nagad' },
                                            { id: 'bank_transfer', label: 'Bank' },
                                        ].map((pm) => (
                                            <button
                                                key={pm.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(pm.id as any)}
                                                className={`py-1.5 px-2 text-xs font-semibold rounded-md border text-center transition cursor-pointer ${
                                                    paymentMethod === pm.id
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {pm.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Deposit Account Selection */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                        Deposit Into Account
                                    </label>
                                    <select
                                        value={selectedAccountId}
                                        onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                                        className="w-full text-xs py-1.5 px-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500 font-medium"
                                    >
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.account_name} (৳{formatAmount(acc.current_balance)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cash Tendered & Change Return Box */}
                                <div className="p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">
                                                Tendered Cash (৳)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={tenderedCash}
                                                onChange={(e) => setTenderedCash(e.target.value)}
                                                placeholder={calculation.netPayable.toString()}
                                                className="w-full text-xs font-mono font-bold py-1 px-2 rounded border border-indigo-200 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">
                                                Change Return (৳)
                                            </label>
                                            <div className="text-xs font-mono font-bold py-1 px-2 rounded bg-white text-emerald-700 border border-indigo-100">
                                                ৳{formatAmount(calculation.changeDue)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Date & Remarks */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                            Payment Date
                                        </label>
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="w-full text-xs py-1 px-2 rounded border border-slate-300 bg-white text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                            Remarks
                                        </label>
                                        <input
                                            type="text"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Optional note..."
                                            className="w-full text-xs py-1 px-2 rounded border border-slate-300 bg-white text-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* Submit & Print Button */}
                                <button
                                    type="submit"
                                    disabled={submitting || calculation.itemsCount === 0 || !selectedStudent}
                                    className="w-full py-2.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Printer className="w-3.5 h-3.5 shrink-0" />
                                            Collect & Print Receipt (৳{formatAmount(calculation.netPayable)})
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-slate-400">
                                    Press <kbd className="px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono border border-slate-200">Ctrl+Enter</kbd> to submit
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
