import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import {
    User,
    Calendar,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Plus,
    CreditCard,
    Search,
    ArrowLeft,
    Receipt,
    Clock,
    XCircle,
} from 'lucide-react';
import { formatReceiptNumber } from '@/lib/formatReceipt';

function route(name: string, params?: any): string {
    if (name === 'fee-collections.store') return '/fee-collections';
    if (name === 'fee-collections.index') return '/fee-collections';
    return '/';
}

interface Student {
    id: number;
    admission_number: string;
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
    discount: number;
    total_amount: number;
    status: 'pending' | 'overdue';
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface PaymentHistory {
    id: number;
    receipt_number: string;
    fee_type: { name: string };
    month: number;
    year: number;
    amount: number;
    paid_amount: number;
    payment_date: string;
    payment_method: string;
}

interface Props {
    students: Student[];
    accounts: Account[];
}

interface NewFeeItem {
    fee_structure_id: number;
    fee_type_name: string;
    amount: number;
    month: number;
    year: number;
}

export default function StudentFees({ students, accounts }: Props) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [availableFees, setAvailableFees] = useState<FeeStructure[]>([]);
    const [selectedPendingFees, setSelectedPendingFees] = useState<number[]>([]);
    const [newFeeItems, setNewFeeItems] = useState<NewFeeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'new' | 'history'>('pending');

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const form = useForm({
        student_id: '',
        fee_collection_ids: [] as number[],
        fee_structures: [] as { fee_structure_id: number; month: number; year: number }[],
        account_id: accounts[0]?.id || '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        discount: 0,
        remarks: '',
    });

    // Load student data when selected
    const handleStudentChange = async (studentId: string) => {
        const student = students.find((s) => s.id === parseInt(studentId));
        setSelectedStudent(student || null);
        form.setData('student_id', studentId);
        setSelectedPendingFees([]);
        setNewFeeItems([]);

        if (student) {
            setLoading(true);
            try {
                // Fetch pending/overdue fees
                const duesResponse = await fetch(`/api/fee-collections/student-dues?student_id=${student.id}`);
                const duesData = await duesResponse.json();
                setPendingFees(duesData);

                // Fetch fee structures for this student's class
                const feesResponse = await fetch(`/api/fee-structures?class_id=${student.school_class.id}`);
                const feesData = await feesResponse.json();
                setAvailableFees(feesData);

                // Fetch payment history (assuming endpoint exists)
                // const historyResponse = await fetch(`/api/fee-collections/payment-history?student_id=${student.id}`);
                // const historyData = await historyResponse.json();
                // setPaymentHistory(historyData);
            } catch (error) {
                console.error('Failed to load student data:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setPendingFees([]);
            setAvailableFees([]);
            setPaymentHistory([]);
        }
    };

    // Toggle pending fee selection
    const togglePendingFee = (feeId: number) => {
        setSelectedPendingFees((prev) =>
            prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]
        );
    };

    // Select all pending fees
    const selectAllPending = () => {
        if (selectedPendingFees.length === pendingFees.length) {
            setSelectedPendingFees([]);
        } else {
            setSelectedPendingFees(pendingFees.map((fee) => fee.id));
        }
    };

    // Add new fee item
    const addNewFeeItem = (feeStructure: FeeStructure) => {
        const newItem: NewFeeItem = {
            fee_structure_id: feeStructure.id,
            fee_type_name: feeStructure.fee_type.name,
            amount: feeStructure.amount,
            month: currentMonth,
            year: currentYear,
        };
        setNewFeeItems([...newFeeItems, newItem]);
    };

    // Remove new fee item
    const removeNewFeeItem = (index: number) => {
        setNewFeeItems(newFeeItems.filter((_, i) => i !== index));
    };

    // Update new fee item month/year
    const updateNewFeeItem = (index: number, field: 'month' | 'year', value: number) => {
        const updated = [...newFeeItems];
        updated[index][field] = value;
        setNewFeeItems(updated);
    };

    // Calculate totals
    const calculatePendingTotal = () => {
        const selectedFees = pendingFees.filter((fee) => selectedPendingFees.includes(fee.id));
        return selectedFees.reduce((sum, fee) => sum + fee.total_amount, 0);
    };

    const calculateNewTotal = () => {
        return newFeeItems.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculateGrandTotal = () => {
        return calculatePendingTotal() + calculateNewTotal() - (form.data.discount || 0);
    };

    // Get month name
    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    // Submit payment
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedPendingFees.length === 0 && newFeeItems.length === 0) {
            alert('Please select at least one fee to collect');
            return;
        }

        // Prepare data based on what's selected
        const submitData: any = {
            student_id: form.data.student_id,
            account_id: form.data.account_id,
            payment_method: form.data.payment_method,
            payment_date: form.data.payment_date,
            discount: form.data.discount,
            remarks: form.data.remarks,
        };

        // If paying existing pending fees
        if (selectedPendingFees.length > 0) {
            submitData.fee_collection_ids = selectedPendingFees;
        }

        // If adding new fees
        if (newFeeItems.length > 0) {
            submitData.fee_structures = newFeeItems.map((item) => ({
                fee_structure_id: item.fee_structure_id,
                month: item.month,
                year: item.year,
            }));
        }

        router.post(route('fee-collections.store'), submitData, {
            onSuccess: () => {
                // Reset form
                setSelectedPendingFees([]);
                setNewFeeItems([]);
                form.reset();
                setSelectedStudent(null);
                setPendingFees([]);
                setAvailableFees([]);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Fee Collection" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Student Fee Collection</h1>
                            <p className="text-gray-600 mt-1">Select student and pay pending fees or add new fees</p>
                        </div>
                        <button
                            onClick={() => router.get(route('fee-collections.index'))}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Collections
                        </button>
                    </div>

                    {/* Student Selection */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <User className="w-4 h-4 inline mr-2" />
                            Select Student
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={form.data.student_id}
                                onChange={(e) => handleStudentChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                            >
                                <option value="">-- Choose a student --</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.user.name} ({student.admission_number}) - {student.school_class.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading student data...</p>
                        </div>
                    )}

                    {/* Student Data Display */}
                    {selectedStudent && !loading && (
                        <>
                            {/* Student Info Card */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 mb-6 text-white">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-indigo-100 text-sm">Student Name</p>
                                        <p className="font-bold text-lg">{selectedStudent.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm">Admission Number</p>
                                        <p className="font-bold text-lg">{selectedStudent.admission_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm">Class</p>
                                        <p className="font-bold text-lg">{selectedStudent.school_class.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm">Total Pending</p>
                                        <p className="font-bold text-lg">${pendingFees.reduce((sum, fee) => sum + fee.total_amount, 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="bg-white rounded-t-lg shadow-md">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`flex-1 px-6 py-4 text-center font-medium transition ${
                                            activeTab === 'pending'
                                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <AlertCircle className="w-5 h-5 inline mr-2" />
                                        Pending Fees ({pendingFees.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('new')}
                                        className={`flex-1 px-6 py-4 text-center font-medium transition ${
                                            activeTab === 'new'
                                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <Plus className="w-5 h-5 inline mr-2" />
                                        Add New Fees
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`flex-1 px-6 py-4 text-center font-medium transition ${
                                            activeTab === 'history'
                                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <Receipt className="w-5 h-5 inline mr-2" />
                                        Payment History
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="bg-white rounded-b-lg shadow-md p-6 mb-6">
                                {/* Pending Fees Tab */}
                                {activeTab === 'pending' && (
                                    <div>
                                        {pendingFees.length > 0 ? (
                                            <>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Select fees to pay
                                                    </h3>
                                                    <button
                                                        onClick={selectAllPending}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        {selectedPendingFees.length === pendingFees.length
                                                            ? 'Deselect All'
                                                            : 'Select All'}
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {pendingFees.map((fee) => (
                                                        <div
                                                            key={fee.id}
                                                            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                                                                selectedPendingFees.includes(fee.id)
                                                                    ? 'border-indigo-500 bg-indigo-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                            onClick={() => togglePendingFee(fee.id)}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-3 flex-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedPendingFees.includes(fee.id)}
                                                                        onChange={() => togglePendingFee(fee.id)}
                                                                        className="mt-1 h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <h4 className="font-semibold text-gray-800">
                                                                                {fee.fee_type}
                                                                            </h4>
                                                                            <span
                                                                                className={`px-2 py-1 text-xs font-medium rounded ${
                                                                                    fee.status === 'overdue'
                                                                                        ? 'bg-red-100 text-red-800'
                                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                                }`}
                                                                            >
                                                                                {fee.status === 'overdue' ? (
                                                                                    <>
                                                                                        <XCircle className="w-3 h-3 inline mr-1" />
                                                                                        Overdue
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                                                        Pending
                                                                                    </>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 mb-2">
                                                                            <Calendar className="w-4 h-4 inline mr-1" />
                                                                            {fee.month_name}
                                                                        </p>
                                                                        <div className="flex gap-4 text-sm">
                                                                            <span className="text-gray-600">
                                                                                Amount: <strong>${fee.amount.toFixed(2)}</strong>
                                                                            </span>
                                                                            {fee.late_fee > 0 && (
                                                                                <span className="text-red-600">
                                                                                    Late Fee: <strong>${fee.late_fee.toFixed(2)}</strong>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-600 mb-1">Total</p>
                                                                    <p className="text-xl font-bold text-indigo-600">
                                                                        ${fee.total_amount.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {selectedPendingFees.length > 0 && (
                                                    <div className="mt-6 bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700 font-medium">
                                                                Selected Fees ({selectedPendingFees.length})
                                                            </span>
                                                            <span className="text-2xl font-bold text-indigo-600">
                                                                ${calculatePendingTotal().toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    No Pending Fees
                                                </h3>
                                                <p className="text-gray-600">This student has no pending or overdue fees.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Add New Fees Tab */}
                                {activeTab === 'new' && (
                                    <div>
                                        {availableFees.length > 0 ? (
                                            <>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                    Available Fee Types
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    {availableFees.map((feeStructure) => (
                                                        <div
                                                            key={feeStructure.id}
                                                            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-800">
                                                                        {feeStructure.fee_type.name}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        {feeStructure.fee_type.frequency}
                                                                    </p>
                                                                </div>
                                                                <p className="text-lg font-bold text-indigo-600">
                                                                    ${feeStructure.amount.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => addNewFeeItem(feeStructure)}
                                                                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                                                            >
                                                                <Plus className="w-4 h-4 inline mr-1" />
                                                                Add to Collection
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Selected New Fees */}
                                                {newFeeItems.length > 0 && (
                                                    <div className="border-t pt-6">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                            Fees to Collect
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {newFeeItems.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                                                >
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-semibold text-gray-800 mb-3">
                                                                                {item.fee_type_name}
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div>
                                                                                    <label className="block text-xs text-gray-600 mb-1">
                                                                                        Month
                                                                                    </label>
                                                                                    <select
                                                                                        value={item.month}
                                                                                        onChange={(e) =>
                                                                                            updateNewFeeItem(
                                                                                                index,
                                                                                                'month',
                                                                                                parseInt(e.target.value)
                                                                                            )
                                                                                        }
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                                                    >
                                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                                                            (month) => (
                                                                                                <option key={month} value={month}>
                                                                                                    {getMonthName(month)}
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                    </select>
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-xs text-gray-600 mb-1">
                                                                                        Year
                                                                                    </label>
                                                                                    <select
                                                                                        value={item.year}
                                                                                        onChange={(e) =>
                                                                                            updateNewFeeItem(
                                                                                                index,
                                                                                                'year',
                                                                                                parseInt(e.target.value)
                                                                                            )
                                                                                        }
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                                                    >
                                                                                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                                                                                            (year) => (
                                                                                                <option key={year} value={year}>
                                                                                                    {year}
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-lg font-bold text-indigo-600 mb-2">
                                                                                ${item.amount.toFixed(2)}
                                                                            </p>
                                                                            <button
                                                                                onClick={() => removeNewFeeItem(index)}
                                                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-6 bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-700 font-medium">
                                                                    New Fees Total ({newFeeItems.length})
                                                                </span>
                                                                <span className="text-2xl font-bold text-indigo-600">
                                                                    ${calculateNewTotal().toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    No Fee Structures Available
                                                </h3>
                                                <p className="text-gray-600">
                                                    There are no fee structures configured for this student's class.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Payment History Tab */}
                                {activeTab === 'history' && (
                                    <div>
                                        {paymentHistory.length > 0 ? (
                                            <div className="space-y-3">
                                                {paymentHistory.map((payment) => (
                                                    <div
                                                        key={payment.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Receipt className="w-4 h-4 text-indigo-600" />
                                                                    <h4 className="font-semibold text-gray-800 font-mono">
                                                                        #{formatReceiptNumber(payment.receipt_number)}
                                                                    </h4>
                                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                                        Paid
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    {payment.fee_type.name} - {getMonthName(payment.month)}{' '}
                                                                    {payment.year}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    <Calendar className="w-3 h-3 inline mr-1" />
                                                                    {new Date(payment.payment_date).toLocaleDateString()} via{' '}
                                                                    {payment.payment_method}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-green-600">
                                                                    ${payment.paid_amount.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    No Payment History
                                                </h3>
                                                <p className="text-gray-600">No payments have been made yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment Form */}
                            {(selectedPendingFees.length > 0 || newFeeItems.length > 0) && (
                                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                                        <CreditCard className="w-5 h-5 inline mr-2" />
                                        Payment Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Account Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Account <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={form.data.account_id}
                                                onChange={(e) => form.setData('account_id', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                {accounts.map((account) => (
                                                    <option key={account.id} value={account.id}>
                                                        {account.account_name} (Balance: ${account.current_balance.toFixed(2)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Method <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={form.data.payment_method}
                                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cheque">Cheque</option>
                                                <option value="mobile_banking">Mobile Banking</option>
                                                <option value="online">Online Payment</option>
                                            </select>
                                        </div>

                                        {/* Payment Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={form.data.payment_date}
                                                onChange={(e) => form.setData('payment_date', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>

                                        {/* Discount */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount (Optional)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={form.data.discount}
                                                onChange={(e) => form.setData('discount', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remarks (Optional)
                                        </label>
                                        <textarea
                                            value={form.data.remarks}
                                            onChange={(e) => form.setData('remarks', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Add any notes or comments..."
                                        />
                                    </div>

                                    {/* Total Summary */}
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
                                        <div className="space-y-3">
                                            {selectedPendingFees.length > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span>Pending Fees ({selectedPendingFees.length})</span>
                                                    <span className="text-xl font-bold">
                                                        ${calculatePendingTotal().toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                            {newFeeItems.length > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span>New Fees ({newFeeItems.length})</span>
                                                    <span className="text-xl font-bold">${calculateNewTotal().toFixed(2)}</span>
                                                </div>
                                            )}
                                            {form.data.discount > 0 && (
                                                <div className="flex justify-between items-center text-green-200">
                                                    <span>Discount</span>
                                                    <span className="text-xl font-bold">-${form.data.discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-indigo-400 pt-3 mt-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-semibold">Grand Total</span>
                                                    <span className="text-3xl font-bold">
                                                        ${calculateGrandTotal().toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPendingFees([]);
                                                setNewFeeItems([]);
                                            }}
                                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                                        >
                                            Clear Selection
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {form.processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="w-5 h-5" />
                                                    Collect Payment (${calculateGrandTotal().toFixed(2)})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}

                    {/* No Student Selected */}
                    {!selectedStudent && !loading && (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Student Selected</h3>
                            <p className="text-gray-600">Please select a student to view and collect fees.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
