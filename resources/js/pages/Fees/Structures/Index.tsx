import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Edit, Trash2, X, FileText } from 'lucide-react';

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'fee-structures.index': '//',
        'fee-structures.store': '/fee-structures',
    };

    if (params) {
        if (name === 'fee-structures.update') return `/fee-structures/${params.feeStructure}`;
        if (name === 'fee-structures.destroy') return `/fee-structures/${params.feeStructure}`;
    }

    return routes[name] || '/';
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface FeeStructure {
    id: number;
    fee_type: { id: number; name: string };
    school_class: { id: number; name: string };
    academic_year: { id: number; year: string };
    amount: number;
    due_date: string;
    description: string | null;
    status: string;
}

interface FeeType {
    id: number;
    name: string;
    amount: number;
}

interface Props {
    feeStructures: { data: FeeStructure[]; links: any[]; meta: any };
    feeTypes: FeeType[];
    classes: Array<{ id: number; name: string }>;
    academicYears: Array<{ id: number; year: string }>;
}

export default function Index({ feeStructures, feeTypes, classes, academicYears }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);

    const currentYear = academicYears.find(y => y.year)?.id || (academicYears[0]?.id || '');

    const createForm = useForm({
        academic_year_id: currentYear,
        class_id: '',
        fee_type_id: '',
        amount: '',
        due_date: '',
        description: '',
        status: 'active',
    });

    const editForm = useForm({
        academic_year_id: '',
        class_id: '',
        fee_type_id: '',
        amount: '',
        due_date: '',
        description: '',
        status: 'active',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('fee-structures.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStructure) return;

        editForm.put(route('fee-structures.update', { feeStructure: selectedStructure.id }), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedStructure(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this fee structure?')) return;
        router.delete(route('fee-structures.destroy', { feeStructure: id }));
    };

    const openEditModal = (structure: FeeStructure) => {
        setSelectedStructure(structure);
        editForm.setData({
            academic_year_id: structure.academic_year.id.toString(),
            class_id: structure.school_class.id.toString(),
            fee_type_id: structure.fee_type.id.toString(),
            amount: structure.amount.toString(),
            due_date: structure.due_date,
            description: structure.description || '',
            status: structure.status,
        });
        setShowEditModal(true);
    };

    const handleFeeTypeChange = (feeTypeId: string, form: typeof createForm) => {
        form.setData('fee_type_id', feeTypeId);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Structures" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Fee Structures</h1>
                            <p className="text-gray-600 mt-1">Define fee amounts for each class and academic year</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Structure
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {feeStructures.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p>No fee structures found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        feeStructures.data.map((structure) => (
                                            <tr key={structure.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {structure.academic_year.year}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {structure.school_class.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {structure.fee_type.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                    ৳{formatAmount(parseFloat(structure.amount.toString()))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(structure.due_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                                                        structure.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {structure.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => openEditModal(structure)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(structure.id)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition" title="Delete">
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
                            <h3 className="text-2xl font-bold text-indigo-800">Create Fee Structure</h3>
                            <button onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year <span className="text-red-500">*</span></label>
                                <select value={createForm.data.academic_year_id} onChange={(e) => createForm.setData('academic_year_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    {academicYears.map(year => <option key={year.id} value={year.id}>{year.year}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class <span className="text-red-500">*</span></label>
                                <select value={createForm.data.class_id} onChange={(e) => createForm.setData('class_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    <option value="">Select class...</option>
                                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type <span className="text-red-500">*</span></label>
                                <select value={createForm.data.fee_type_id} onChange={(e) => handleFeeTypeChange(e.target.value, createForm)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    <option value="">Select fee type...</option>
                                    {feeTypes.map(type => <option key={type.id} value={type.id}>{type.name} - ৳{formatAmount(type.amount)}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" value={createForm.data.amount} onChange={(e) => createForm.setData('amount', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date <span className="text-red-500">*</span></label>
                                <input type="date" value={createForm.data.due_date} onChange={(e) => createForm.setData('due_date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea value={createForm.data.description} onChange={(e) => createForm.setData('description', e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select value={createForm.data.status} onChange={(e) => createForm.setData('status', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" disabled={createForm.processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {createForm.processing ? 'Creating...' : 'Create Structure'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal - Similar to Create */}
            {showEditModal && selectedStructure && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-50">
                            <h3 className="text-2xl font-bold text-indigo-800">Edit Fee Structure</h3>
                            <button onClick={() => { setShowEditModal(false); setSelectedStructure(null); editForm.reset(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year <span className="text-red-500">*</span></label>
                                <select value={editForm.data.academic_year_id} onChange={(e) => editForm.setData('academic_year_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    {academicYears.map(year => <option key={year.id} value={year.id}>{year.year}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class <span className="text-red-500">*</span></label>
                                <select value={editForm.data.class_id} onChange={(e) => editForm.setData('class_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type <span className="text-red-500">*</span></label>
                                <select value={editForm.data.fee_type_id} onChange={(e) => editForm.setData('fee_type_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                    {feeTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" value={editForm.data.amount} onChange={(e) => editForm.setData('amount', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date <span className="text-red-500">*</span></label>
                                <input type="date" value={editForm.data.due_date} onChange={(e) => editForm.setData('due_date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowEditModal(false); setSelectedStructure(null); editForm.reset(); }} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" disabled={editForm.processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {editForm.processing ? 'Updating...' : 'Update Structure'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
