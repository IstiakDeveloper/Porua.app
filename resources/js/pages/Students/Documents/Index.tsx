import React, { useState, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus,
    Upload,
    Eye,
    Download,
    Trash2,
    FileText,
    X,
    FileSpreadsheet,
    FileCode,
    File,
    HardDrive,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';

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

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        document: Document | null;
    }>({
        isOpen: false,
        document: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const documentTypes = [
        { value: 'photo', label: 'Student Photo' },
        { value: 'certificate', label: 'Birth Certificate' },
        { value: 'marksheet', label: 'Previous Marksheet' },
        { value: 'medical', label: 'Medical Certificate' },
        { value: 'id_proof', label: 'ID Proof / NID' },
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
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    const handleDeleteClick = (doc: Document) => {
        setDeleteModal({
            isOpen: true,
            document: doc,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteModal.document) return;
        setIsDeleting(true);
        router.delete(`/student-documents/${deleteModal.document.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal({ isOpen: false, document: null });
            },
        });
    };

    const handleView = (doc: Document) => {
        window.open(doc.file_path, '_blank');
    };

    const handleDownload = (doc: Document) => {
        window.location.href = `/student-documents/${doc.id}/download`;
    };

    const formatFileSize = (kb: number) => {
        if (!kb || isNaN(kb)) return '0 KB';
        if (kb < 1024) return kb + ' KB';
        return (kb / 1024).toFixed(2) + ' MB';
    };

    const totalStorageKb = documents.reduce((acc, curr) => acc + (Number(curr.file_size) || 0), 0);

    const getDocumentTypeBadge = (type: string) => {
        const docType = documentTypes.find(dt => dt.value === type);
        const label = docType ? docType.label : type;
        const colorClasses: Record<string, string> = {
            photo: 'bg-purple-50 text-purple-700 border-purple-200/60',
            certificate: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
            marksheet: 'bg-blue-50 text-blue-700 border-blue-200/60',
            medical: 'bg-rose-50 text-rose-700 border-rose-200/60',
            id_proof: 'bg-amber-50 text-amber-700 border-amber-200/60',
            other: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        const color = colorClasses[type] || 'bg-slate-100 text-slate-700 border-slate-200';
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${color}`}>
                {label}
            </span>
        );
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName?.split('.')?.pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext || '')) {
            return <FileText className="w-4 h-4 text-purple-600" />;
        }
        if (['pdf'].includes(ext || '')) {
            return <FileText className="w-4 h-4 text-rose-600" />;
        }
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
            return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
        }
        return <File className="w-4 h-4 text-indigo-600" />;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Documents - ${student.first_name} ${student.last_name}`} />

            <div className="space-y-4">
                {/* Standard ERP Header */}
                <FormPageHeader
                    title="Student Documents"
                    subtitle={`${student.first_name} ${student.last_name} • Adm No: ${student.admission_number}`}
                    backUrl={`/students/${student.id}`}
                    backLabel="Student Profile"
                    badge="Verified Storage"
                    badgeIcon={FileText}
                    actions={
                        <Button
                            size="sm"
                            onClick={openModal}
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Upload Document
                        </Button>
                    }
                />

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Documents</p>
                            <p className="text-xl font-bold text-slate-900 mt-0.5">{documents.length}</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Storage Consumed</p>
                            <p className="text-xl font-bold text-slate-900 mt-0.5">{formatFileSize(totalStorageKb)}</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600">
                            <HardDrive className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Storage Policy</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-emerald-700">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Encrypted & Backed Up
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Documents Content */}
                {documents.length > 0 ? (
                    <>
                        {/* Mobile Cards Feed (< 768px) */}
                        <div className="block md:hidden space-y-2.5">
                            {documents.map((doc) => (
                                <div key={doc.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                {getFileIcon(doc.file_name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {doc.title || doc.file_name}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-mono truncate">
                                                    {doc.file_name} • {formatFileSize(doc.file_size)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {getDocumentTypeBadge(doc.type)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                        <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleView(doc)}
                                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDownload(doc)}
                                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(doc)}
                                                className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
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
                                                Document Title
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Original File
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Size
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Upload Date
                                            </th>
                                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-28">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-2.5 font-medium text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                                                            {getFileIcon(doc.file_name)}
                                                        </div>
                                                        <span className="font-semibold text-slate-900">{doc.title || doc.file_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {getDocumentTypeBadge(doc.type)}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">
                                                    {doc.file_name}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">
                                                    {formatFileSize(doc.file_size)}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                                                    {new Date(doc.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleView(doc)}
                                                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownload(doc)}
                                                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(doc)}
                                                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Documents Uploaded</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                            Upload birth certificates, ID cards, marksheets, and medical clearances for this student.
                        </p>
                        <Button
                            size="sm"
                            onClick={openModal}
                            icon={<Plus className="w-4 h-4" />}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Upload First Document
                        </Button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Upload Student Document</h2>
                                    <p className="text-[11px] text-slate-500">Attach files to {student.first_name}'s profile</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Document Category <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.document_type}
                                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    required
                                >
                                    {documentTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                {errors.document_type && <p className="text-rose-600 text-[11px] mt-1">{errors.document_type}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Document Title <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    placeholder="e.g. Birth Certificate 2024 / Grade 5 Marksheet"
                                />
                                {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Select File <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-5 text-center transition-colors bg-slate-50/50">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        accept="image/*,.pdf,.doc,.docx"
                                        required
                                    />
                                    {formData.file ? (
                                        <div className="space-y-2">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-900 truncate max-w-xs mx-auto">
                                                {formData.file.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                {(formData.file.size / 1024).toFixed(2)} KB
                                            </p>
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                            >
                                                <Upload className="w-3.5 h-3.5 text-slate-500" />
                                                Choose Different File
                                            </label>
                                        </div>
                                    ) : (
                                        <label htmlFor="file-upload" className="cursor-pointer block">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-800">
                                                Click to browse or drop file here
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                PDF, DOC, DOCX, or Images (Max 10MB)
                                            </p>
                                        </label>
                                    )}
                                </div>
                                {errors.file && <p className="text-rose-600 text-[11px] mt-1">{errors.file}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing || !formData.file}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    icon={<Upload className="w-4 h-4" />}
                                >
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Standard ERP Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, document: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Document"
                message="Are you sure you want to delete this document from the student's records?"
                itemName={deleteModal.document ? (deleteModal.document.title || deleteModal.document.file_name) : ''}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
