import React, { useState, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { ArrowLeft, Plus, Upload, Eye, Download, Trash2, FileText, X } from 'lucide-react';

interface Student {
    id: number;
    admission_number: string;
    first_name: string;
    last_name: string;
}

interface Document {
    id: number;
    student_id: number;
    type: string;
    title: string;
    file_name: string;
    file_path: string;
    file_size: number;
    created_at: string;
}

interface IndexProps {
    student: Student;
    documents: Document[];
}

export default function Index({ student, documents = [] }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        document_type: 'photo',
        file: null as File | null,
        title: '',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const documentTypes = [
        { value: 'photo', label: 'Student Photo' },
        { value: 'certificate', label: 'Birth Certificate' },
        { value: 'marksheet', label: 'Previous Marksheet' },
        { value: 'medical', label: 'Medical Certificate' },
        { value: 'id_proof', label: 'ID Proof' },
        { value: 'other', label: 'Other Document' },
    ];

    const openModal = () => {
        setFormData({
            document_type: 'photo',
            file: null,
            title: '',
        });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            document_type: 'photo',
            file: null,
            title: '',
        });
        setErrors({});
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, file });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const data = new FormData();
        data.append('document_type', formData.document_type);
        if (formData.title) {
            data.append('title', formData.title);
        }
        if (formData.file) {
            data.append('file', formData.file);
        }

        router.post(`/students/${student.id}/documents`, data, {
            onSuccess: () => {
                closeModal();
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    const handleDelete = (document: Document) => {
        if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
            router.delete(`/student-documents/${document.id}`);
        }
    };

    const handleView = (document: Document) => {
        window.open(document.file_path, '_blank');
    };

    const handleDownload = (document: Document) => {
        window.location.href = `/student-documents/${document.id}/download`;
    };

    const formatFileSize = (kb: number) => {
        if (kb < 1024) return kb + ' KB';
        return (kb / 1024).toFixed(2) + ' MB';
    };

    const getDocumentTypeLabel = (type: string) => {
        const docType = documentTypes.find(dt => dt.value === type);
        return docType ? docType.label : type;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Documents - ${student.first_name} ${student.last_name}`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/students')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Student Documents
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {student.first_name} {student.last_name} ({student.admission_number})
                            </p>
                        </div>
                    </div>
                    <Button onClick={openModal} icon={<Plus className="w-5 h-5" />}>
                        Add Document
                    </Button>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {documents.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-gray-900">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                {getDocumentTypeLabel(doc.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{doc.file_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(doc.file_size)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(doc)}
                                                    icon={<Eye className="w-4 h-4" />}
                                                    title="View"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(doc)}
                                                    icon={<Download className="w-4 h-4" />}
                                                    title="Download"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                    title="Delete"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Uploaded</h3>
                            <p className="text-gray-600 mb-4">Start by uploading student documents.</p>
                            <Button onClick={openModal} icon={<Plus className="w-5 h-5" />}>
                                Add First Document
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                                <select
                                    value={formData.document_type}
                                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    {documentTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                {errors.document_type && <p className="text-red-600 text-sm mt-1">{errors.document_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Document Title (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="E.g., Birth Certificate 2024"
                                />
                                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select File *</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        accept="image/*,.pdf,.doc,.docx"
                                        required
                                    />
                                    {formData.file ? (
                                        <div className="space-y-3">
                                            <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                                            <p className="text-sm text-gray-900 font-medium">{formData.file.name}</p>
                                            <p className="text-xs text-gray-500">{(formData.file.size / 1024).toFixed(2)} KB</p>
                                            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                <Upload className="w-4 h-4" />
                                                Change File
                                            </label>
                                        </div>
                                    ) : (
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium">Click to upload</p>
                                            <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, Images (Max 10MB)</p>
                                        </label>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !formData.file}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                    icon={<Upload className="w-5 h-5" />}
                                >
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
