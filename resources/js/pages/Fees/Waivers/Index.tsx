import { formatAmount } from '@/lib/formatCurrency';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Settings } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'fee-waivers.index': '/fee-waivers',
        'fee-waivers.store': '/fee-waivers',
    };

    if (params) {
        if (name === 'fee-waivers.update') return `/fee-waivers/${params.feeWaiver}`;
        if (name === 'fee-waivers.destroy') return `/fee-waivers/${params.feeWaiver}`;
    }

    return routes[name] || '/';
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface FeeWaiver {
    id: number;
    student: { id: number; user: { name: string }; admission_number: string; school_class: { name: string } };
    waiver_type: 'percentage' | 'fixed';
    waiver_amount: number;
    reason: string;
    valid_from: string;
    valid_to: string;
    status: string;
}

interface Props {
    feeWaivers: { data: FeeWaiver[]; links: any[]; meta: any };
    students: Array<{ id: number; user: { name: string }; admission_number: string; school_class: { name: string } }>;
}

export default function Index({ feeWaivers, students }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedWaiver, setSelectedWaiver] = useState<FeeWaiver | null>(null);

    const createForm = useForm({
        student_id: '',
        waiver_type: 'percentage' as 'percentage' | 'fixed',
        waiver_amount: '',
        reason: '',
        valid_from: '',
        valid_to: '',
        status: 'active',
    });

    const editForm = useForm({
        student_id: '',
        waiver_type: 'percentage' as 'percentage' | 'fixed',
        waiver_amount: '',
        reason: '',
        valid_from: '',
        valid_to: '',
        status: 'active',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('fee-waivers.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWaiver) return;

        editForm.put(route('fee-waivers.update', { feeWaiver: selectedWaiver.id }), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedWaiver(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this fee waiver?')) return;
        router.delete(route('fee-waivers.destroy', { feeWaiver: id }));
    };

    const openEditModal = (waiver: FeeWaiver) => {
        setSelectedWaiver(waiver);
        editForm.setData({
            student_id: waiver.student.id.toString(),
            waiver_type: waiver.waiver_type,
            waiver_amount: waiver.waiver_amount.toString(),
            reason: waiver.reason,
            valid_from: waiver.valid_from,
            valid_to: waiver.valid_to,
            status: waiver.status,
        });
        setShowEditModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Waivers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Fee Waivers</h1>
                            <p className="text-gray-600 mt-1">Manage student fee discounts and waivers</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Waiver
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiver Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiver Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid From</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid To</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {feeWaivers.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p>No fee waivers found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        feeWaivers.data.map((waiver) => (
                                            <tr key={waiver.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{waiver.student.user.name}</div>
                                                    <div className="text-xs text-gray-500">{waiver.student.admission_number} • {waiver.student.school_class.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        waiver.waiver_type === 'percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {waiver.waiver_type === 'percentage' ? <Percent className="w-3 h-3 mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
                                                        {waiver.waiver_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                                                    {waiver.waiver_type === 'percentage'
                                                        ? `${waiver.waiver_amount}%`
                                                        : `৳${formatAmount(parseFloat(waiver.waiver_amount.toString()))}`
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(waiver.valid_from)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(waiver.valid_to)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                                                        waiver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {waiver.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => openEditModal(waiver)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(waiver.id)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-50">
                            <h3 className="text-2xl font-bold text-indigo-800">Create Fee Waiver</h3>
                            <button onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Student <span className="text-red-500">*</span></label>
                                <select value={createForm.data.student_id} onChange={(e) => createForm.setData('student_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    <option value="">Select student...</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.user.name} ({student.admission_number}) - {student.school_class.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Waiver Type <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" value="percentage" checked={createForm.data.waiver_type === 'percentage'} onChange={(e) => createForm.setData('waiver_type', e.target.value as 'percentage')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                                            <Percent className="w-4 h-4 mr-1" /> Percentage
                                        </span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" value="fixed" checked={createForm.data.waiver_type === 'fixed'} onChange={(e) => createForm.setData('waiver_type', e.target.value as 'fixed')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" /> Fixed Amount
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Waiver Amount {createForm.data.waiver_type === 'percentage' ? '(%)' : '(৳)'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step={createForm.data.waiver_type === 'percentage' ? '0.01' : '0.01'}
                                    max={createForm.data.waiver_type === 'percentage' ? '100' : undefined}
                                    value={createForm.data.waiver_amount}
                                    onChange={(e) => createForm.setData('waiver_amount', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
                                <textarea value={createForm.data.reason} onChange={(e) => createForm.setData('reason', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="e.g., Merit-based scholarship, Financial hardship..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From <span className="text-red-500">*</span></label>
                                    <input type="date" value={createForm.data.valid_from} onChange={(e) => createForm.setData('valid_from', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid To <span className="text-red-500">*</span></label>
                                    <input type="date" value={createForm.data.valid_to} onChange={(e) => createForm.setData('valid_to', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select value={createForm.data.status} onChange={(e) => createForm.setData('status', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This waiver will be automatically applied to eligible fee collections for this student during the specified validity period.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" disabled={createForm.processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {createForm.processing ? 'Creating...' : 'Create Waiver'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal - Similar to Create */}
            {showEditModal && selectedWaiver && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-50">
                            <h3 className="text-2xl font-bold text-indigo-800">Edit Fee Waiver</h3>
                            <button onClick={() => { setShowEditModal(false); setSelectedWaiver(null); editForm.reset(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Student <span className="text-red-500">*</span></label>
                                <select value={editForm.data.student_id} onChange={(e) => editForm.setData('student_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.user.name} ({student.admission_number}) - {student.school_class.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Waiver Type <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" value="percentage" checked={editForm.data.waiver_type === 'percentage'} onChange={(e) => editForm.setData('waiver_type', e.target.value as 'percentage')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                                            <Percent className="w-4 h-4 mr-1" /> Percentage
                                        </span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" value="fixed" checked={editForm.data.waiver_type === 'fixed'} onChange={(e) => editForm.setData('waiver_type', e.target.value as 'fixed')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" /> Fixed Amount
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Waiver Amount {editForm.data.waiver_type === 'percentage' ? '(%)' : '(৳)'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step={editForm.data.waiver_type === 'percentage' ? '0.01' : '0.01'}
                                    max={editForm.data.waiver_type === 'percentage' ? '100' : undefined}
                                    value={editForm.data.waiver_amount}
                                    onChange={(e) => editForm.setData('waiver_amount', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
                                <textarea value={editForm.data.reason} onChange={(e) => editForm.setData('reason', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From <span className="text-red-500">*</span></label>
                                    <input type="date" value={editForm.data.valid_from} onChange={(e) => editForm.setData('valid_from', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid To <span className="text-red-500">*</span></label>
                                    <input type="date" value={editForm.data.valid_to} onChange={(e) => editForm.setData('valid_to', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowEditModal(false); setSelectedWaiver(null); editForm.reset(); }} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" disabled={editForm.processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {editForm.processing ? 'Updating...' : 'Update Waiver'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
