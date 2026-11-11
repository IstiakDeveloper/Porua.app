import React, { useState, useRef } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import axios from 'axios';
import {
    Users,
    Printer,
    RefreshCw,
    AlertCircle,
    X,
    FileSpreadsheet,
    Lock
} from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    sections?: Array<{ id: number; name: string }>;
}

interface GeneratedCredential {
    student_name: string;
    class_name: string;
    roll_number: string;
    parent_name: string;
    relation: string;
    username: string;
    password: string;
    note: string;
}

interface BulkGenerateModalProps {
    show: boolean;
    onClose: () => void;
    classes?: SchoolClass[];
    onSuccess?: () => void;
}

export default function BulkGenerateModal({
    show,
    onClose,
    classes = [],
    onSuccess,
}: BulkGenerateModalProps) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [personaPriority, setPersonaPriority] = useState<'father_first' | 'mother_first' | 'guardian_first'>('father_first');
    const [defaultPassword, setDefaultPassword] = useState('1234');
    const [onlyUnlinked, setOnlyUnlinked] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Results state
    const [stats, setStats] = useState<{
        total_students: number;
        created: number;
        merged_siblings: number;
    } | null>(null);
    const [credentials, setCredentials] = useState<GeneratedCredential[]>([]);
    const printAreaRef = useRef<HTMLDivElement>(null);

    const resetModal = () => {
        setSelectedClassId('');
        setSelectedSectionId('');
        setPersonaPriority('father_first');
        setDefaultPassword('1234');
        setOnlyUnlinked(true);
        setIsProcessing(false);
        setErrorMessage(null);
        setStats(null);
        setCredentials([]);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const res = await axios.post('/student-parents/bulk-generate', {
                class_id: selectedClassId || undefined,
                section_id: selectedSectionId || undefined,
                priority: personaPriority,
                default_password: defaultPassword,
                only_unlinked: onlyUnlinked,
            });

            if (res.data.success) {
                setStats(res.data.stats);
                setCredentials(res.data.credentials || []);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setErrorMessage(res.data.message || 'Bulk generation failed.');
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Error occurred during bulk generation.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadCsv = () => {
        if (!credentials || credentials.length === 0) return;

        const headers = ['Student Name', 'Class', 'Roll', 'Parent Name', 'Relation', 'Username / Mobile', 'Password / PIN', 'Status Note'];
        const csvRows = [headers.join(',')];

        credentials.forEach((c) => {
            const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
            csvRows.push([
                escapeCsv(c.student_name),
                escapeCsv(c.class_name),
                escapeCsv(c.roll_number),
                escapeCsv(c.parent_name),
                escapeCsv(c.relation),
                escapeCsv(c.username),
                escapeCsv(c.password),
                escapeCsv(c.note),
            ].join(','));
        });

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
        const link = document.createElement('a');
        link.setAttribute('href', csvContent);
        link.setAttribute('download', `porua_parent_credentials_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintSlips = () => {
        if (!credentials || credentials.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const slipsHtml = credentials.map((c) => `
            <div class="slip">
                <div class="header">
                    <strong>PORUA ACADEMY</strong> • Parent Credentials Slip
                </div>
                <div class="student-info">
                    <strong>Student:</strong> ${c.student_name} (${c.class_name} - Roll: ${c.roll_number})
                </div>
                <div class="parent-info">
                    <strong>Parent:</strong> ${c.parent_name} (${c.relation})
                </div>
                <div class="cred-row">
                    <div><strong>Username / Mobile:</strong> <code>${c.username}</code></div>
                    <div><strong>Password / PIN:</strong> <code class="pin">${c.password}</code></div>
                </div>
                <div class="footer">
                    Login at: <strong>https://porua.app/login</strong> • ${c.note}
                </div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Parent Login Slips</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; color: #1e293b; background: #fff; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                        .slip { border: 1.5px dashed #6366f1; border-radius: 8px; padding: 10px; page-break-inside: avoid; background: #f8fafc; font-size: 11px; }
                        .header { font-size: 10px; font-weight: bold; color: #4338ca; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px; }
                        .student-info, .parent-info { margin-bottom: 3px; }
                        .cred-row { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px; margin: 6px 0; }
                        code { font-family: monospace; font-size: 12px; font-weight: bold; }
                        code.pin { color: #4338ca; letter-spacing: 1.5px; }
                        .footer { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 3px; }
                    </style>
                </head>
                <body>
                    <div class="grid">${slipsHtml}</div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="4xl">
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/70">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                                Bulk Parent Account Generator
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Automatically generate parent login accounts with smart sibling de-duplication
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="my-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* RESULTS VIEW */}
                {stats && (
                    <div className="py-3.5 space-y-4">
                        {/* Summary Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="p-3 bg-blue-50 border border-blue-100/70 rounded-xl">
                                <span className="text-[11px] font-medium text-blue-700">Total Processed</span>
                                <h3 className="text-lg sm:text-xl font-bold text-blue-950 mt-0.5">{stats.total_students} Students</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 border border-emerald-100/70 rounded-xl">
                                <span className="text-[11px] font-medium text-emerald-700">New Parents Created</span>
                                <h3 className="text-lg sm:text-xl font-bold text-emerald-950 mt-0.5">{stats.created} Accounts</h3>
                            </div>
                            <div className="p-3 bg-purple-50 border border-purple-100/70 rounded-xl">
                                <span className="text-[11px] font-medium text-purple-700">Siblings Auto-Merged</span>
                                <h3 className="text-lg sm:text-xl font-bold text-purple-950 mt-0.5">{stats.merged_siblings} Students</h3>
                            </div>
                        </div>

                        {/* Action buttons for CSV & Print */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <span className="text-xs font-semibold text-slate-700">
                                {credentials.length} Login Slips Ready
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadCsv}
                                    icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                                >
                                    Export CSV
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handlePrintSlips}
                                    icon={<Printer className="w-3.5 h-3.5" />}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Print All Slips
                                </Button>
                            </div>
                        </div>

                        {/* Credentials Table Preview */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600 uppercase">Student</th>
                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600 uppercase">Parent / Relation</th>
                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600 uppercase">Username / Phone</th>
                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600 uppercase">PIN</th>
                                        <th className="px-3 py-2 text-left font-semibold text-[11px] text-slate-600 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {credentials.map((cred, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/70">
                                            <td className="px-3 py-1.5">
                                                <div className="font-semibold text-slate-900">{cred.student_name}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {cred.class_name} • Roll: {cred.roll_number}
                                                </div>
                                            </td>
                                            <td className="px-3 py-1.5">
                                                <div className="font-medium text-slate-800">{cred.parent_name}</div>
                                                <div className="text-[10px] text-slate-400">{cred.relation}</div>
                                            </td>
                                            <td className="px-3 py-1.5 font-mono text-[11px] text-indigo-900">
                                                {cred.username}
                                            </td>
                                            <td className="px-3 py-1.5 font-mono font-bold text-slate-900">
                                                {cred.password}
                                            </td>
                                            <td className="px-3 py-1.5">
                                                <span
                                                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                        cred.note.includes('Merged')
                                                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    }`}
                                                >
                                                    {cred.note}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <Button size="sm" onClick={handleClose}>Done</Button>
                        </div>
                    </div>
                )}

                {/* FORM VIEW */}
                {!stats && (
                    <form onSubmit={handleGenerate} className="py-3.5 space-y-4">
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1">
                            <p className="font-semibold text-slate-800">Bulk Generation Workflow:</p>
                            <p>1. Scans students in the selected class/section.</p>
                            <p>2. Picks guardian by your priority rule (Father ➔ Mother ➔ Legal Guardian).</p>
                            <p>3. Students with matching parent phones (siblings) are merged into one single parent account.</p>
                            <p>4. Generates credentials with default PIN and lets you export CSV & print slips.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Target Class <span className="text-slate-400 font-normal">(Empty for Whole School)</span>
                                </label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value);
                                        setSelectedSectionId('');
                                    }}
                                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                >
                                    <option value="">All Classes (Whole School)</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Target Section <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <select
                                    value={selectedSectionId}
                                    disabled={!selectedClassId}
                                    onChange={(e) => setSelectedSectionId(e.target.value)}
                                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white disabled:bg-slate-50"
                                >
                                    <option value="">All Sections</option>
                                    {classes
                                        .find((c) => c.id.toString() === selectedClassId)
                                        ?.sections?.map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                {sec.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Guardian Persona Priority
                                </label>
                                <select
                                    value={personaPriority}
                                    onChange={(e: any) => setPersonaPriority(e.target.value)}
                                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                >
                                    <option value="father_first">👨 Father First (Fallback: Mother ➔ Guardian)</option>
                                    <option value="mother_first">👩 Mother First (Fallback: Father ➔ Guardian)</option>
                                    <option value="guardian_first">👤 Legal Guardian First</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Default 4-Digit Password / PIN
                                </label>
                                <div className="relative">
                                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        minLength={4}
                                        value={defaultPassword}
                                        onChange={(e) => setDefaultPassword(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tracking-widest rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        placeholder="1234"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-1">
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={onlyUnlinked}
                                    onChange={(e) => setOnlyUnlinked(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>
                                    Only generate for students without linked parents (Prevents overwriting existing parents)
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button size="sm" variant="ghost" type="button" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                type="submit"
                                disabled={isProcessing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                                icon={isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
                            >
                                {isProcessing ? 'Generating...' : 'Generate Parent Accounts'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
