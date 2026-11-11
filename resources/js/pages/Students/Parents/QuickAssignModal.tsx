import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import axios from 'axios';
import {
    Search,
    User,
    Users,
    Phone,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Check,
    Copy,
    Printer,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    ChevronRight,
    Plus,
    X,
    Link2,
    Baby
} from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    sections?: Array<{ id: number; name: string }>;
}

interface GuardianInfo {
    name?: string | null;
    phone?: string | null;
    occupation?: string | null;
    relation?: string | null;
}

export interface StudentSearchResult {
    id: number;
    full_name: string;
    roll_number: string | null;
    admission_number: string | null;
    class_name: string;
    section_name: string;
    photo?: string | null;
    has_parent: boolean;
    parent_id?: number | null;
    existing_parent_name?: string | null;
    existing_parent_phone?: string | null;
    existing_parent_username?: string | null;
    father: GuardianInfo;
    mother: GuardianInfo;
    guardian: GuardianInfo;
}

interface DuplicateCheckResult {
    found: boolean;
    parent?: {
        id: number;
        user_id: number;
        name: string;
        phone: string | null;
        username: string | null;
        email: string | null;
        linked_children: Array<{
            id: number;
            full_name: string;
            roll_number: string | null;
            class_name: string | null;
            section_name: string | null;
        }>;
    };
}

interface QuickAssignModalProps {
    show?: boolean;
    onClose?: () => void;
    classes?: SchoolClass[];
    onSuccess?: () => void;
    initialStudent?: StudentSearchResult | null;
    embedded?: boolean;
}

export default function QuickAssignModal({
    show = false,
    onClose,
    classes = [],
    onSuccess,
    initialStudent = null,
    embedded = false,
}: QuickAssignModalProps) {
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(initialStudent);

    // Selected Persona & Form Data
    const [persona, setPersona] = useState<'father' | 'mother' | 'guardian' | 'custom'>('father');
    const [parentName, setParentName] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('1234');
    const [showPassword, setShowPassword] = useState(false);

    // Duplicate Check & Sibling Linking
    const [duplicateInfo, setDuplicateInfo] = useState<DuplicateCheckResult | null>(null);
    const [linkExisting, setLinkExisting] = useState(true);
    const [selectedSiblings, setSelectedSiblings] = useState<StudentSearchResult[]>([]);
    const [siblingSearchQuery, setSiblingSearchQuery] = useState('');
    const [siblingSearchResults, setSiblingSearchResults] = useState<StudentSearchResult[]>([]);
    const [isSearchingSiblings, setIsSearchingSiblings] = useState(false);

    // Submission & Result Slip
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successCredentials, setSuccessCredentials] = useState<{
        student_name: string;
        class_name?: string;
        roll_number?: string;
        parent_name: string;
        relation: string;
        username: string;
        phone?: string;
        email: string;
        password: string;
        login_url: string;
        linked_students_count: number;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const printSlipRef = useRef<HTMLDivElement>(null);

    // Reset when modal opens/closes
    useEffect(() => {
        if (show || embedded) {
            if (initialStudent) {
                selectStudent(initialStudent);
            } else {
                fetchInitialStudents();
            }
        } else {
            resetModal();
        }
    }, [show, embedded, initialStudent]);

    const resetModal = () => {
        setSearchQuery('');
        setSelectedClassId('');
        setSelectedSectionId('');
        setSearchResults([]);
        setSelectedStudent(null);
        setPersona('father');
        setParentName('');
        setParentPhone('');
        setUsername('');
        setEmail('');
        setPassword('1234');
        setShowPassword(false);
        setDuplicateInfo(null);
        setSelectedSiblings([]);
        setErrorMessage(null);
        setSuccessCredentials(null);
        setCopied(false);
    };

    const fetchInitialStudents = async () => {
        try {
            setIsSearching(true);
            const res = await axios.get('/student-parents/search-guardians', {
                params: {
                    class_id: selectedClassId || undefined,
                    section_id: selectedSectionId || undefined,
                    q: searchQuery || undefined,
                },
            });
            setSearchResults(res.data.students || []);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Live search with debounce
    useEffect(() => {
        if ((!show && !embedded) || selectedStudent) return;
        const timer = setTimeout(() => {
            fetchInitialStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedClassId, selectedSectionId, show, embedded, selectedStudent]);

    // Handle student selection
    const selectStudent = (student: StudentSearchResult) => {
        setSelectedStudent(student);
        setErrorMessage(null);

        let defaultPersona: 'father' | 'mother' | 'guardian' = 'father';
        if (!student.father.name && student.mother.name) {
            defaultPersona = 'mother';
        } else if (!student.father.name && !student.mother.name && student.guardian.name) {
            defaultPersona = 'guardian';
        }

        applyPersona(student, defaultPersona);
    };

    const applyPersona = (student: StudentSearchResult, targetPersona: 'father' | 'mother' | 'guardian' | 'custom') => {
        setPersona(targetPersona);

        let name = '';
        let phone = '';

        if (targetPersona === 'father') {
            name = student.father.name || '';
            phone = student.father.phone || '';
        } else if (targetPersona === 'mother') {
            name = student.mother.name || '';
            phone = student.mother.phone || '';
        } else if (targetPersona === 'guardian') {
            name = student.guardian.name || '';
            phone = student.guardian.phone || '';
        }

        setParentName(name);
        setParentPhone(phone);

        // Generate clean username
        const cleanPhone = phone.replace(/\D/g, '');
        const autoUsername = cleanPhone ? cleanPhone : `p_${student.admission_number || student.roll_number || student.id}`;
        setUsername(autoUsername);
        setEmail(`${autoUsername}@porua.app`);

        // Check for duplicate parent account with this phone/username
        if (cleanPhone || autoUsername) {
            checkDuplicateParent(cleanPhone, autoUsername);
        }
    };

    const checkDuplicateParent = async (phone: string, uname: string) => {
        try {
            const res = await axios.get('/student-parents/check-duplicate', {
                params: { phone, username: uname },
            });
            if (res.data.found && res.data.parent) {
                setDuplicateInfo(res.data);
                setLinkExisting(true);
            } else {
                setDuplicateInfo(null);
            }
        } catch {
            setDuplicateInfo(null);
        }
    };

    const generateRandomPin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setPassword(pin);
    };

    // Sibling search
    const handleSiblingSearch = async (q: string) => {
        setSiblingSearchQuery(q);
        if (q.trim().length < 2) {
            setSiblingSearchResults([]);
            return;
        }
        try {
            setIsSearchingSiblings(true);
            const res = await axios.get('/student-parents/search-guardians', {
                params: { q },
            });
            const filtered = (res.data.students || []).filter(
                (s: StudentSearchResult) =>
                    s.id !== selectedStudent?.id && !selectedSiblings.some(sib => sib.id === s.id)
            );
            setSiblingSearchResults(filtered);
        } catch {
            setSiblingSearchResults([]);
        } finally {
            setIsSearchingSiblings(false);
        }
    };

    const addSibling = (sibling: StudentSearchResult) => {
        setSelectedSiblings([...selectedSiblings, sibling]);
        setSiblingSearchQuery('');
        setSiblingSearchResults([]);
    };

    const removeSibling = (siblingId: number) => {
        setSelectedSiblings(selectedSiblings.filter(s => s.id !== siblingId));
    };

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const payload: any = {
                student_id: selectedStudent.id,
                persona,
                name: parentName,
                phone: parentPhone || null,
                username: username || null,
                email: email || null,
                password,
                sibling_student_ids: selectedSiblings.map(s => s.id),
            };

            if (duplicateInfo?.found && duplicateInfo.parent && linkExisting) {
                payload.link_existing_parent_id = duplicateInfo.parent.id;
            }

            const res = await axios.post('/student-parents/quick-assign', payload);
            if (res.data.success) {
                setSuccessCredentials(res.data.credentials);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setErrorMessage(res.data.message || 'Failed to assign parent.');
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Error occurred while assigning parent.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyCredentials = () => {
        if (!successCredentials) return;
        const text = `=== PORUA PARENT LOGIN CREDENTIALS ===
Student: ${successCredentials.student_name} (${successCredentials.class_name || ''} - Roll: ${successCredentials.roll_number || 'N/A'})
Parent/Guardian: ${successCredentials.parent_name} (${successCredentials.relation})
Username / Mobile: ${successCredentials.username}
Password / PIN: ${successCredentials.password}
Portal URL: ${successCredentials.login_url}
======================================`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrintSlip = () => {
        const printContent = printSlipRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Parent Login Slip - ${successCredentials?.student_name}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
                        .slip-box { border: 1.5px dashed #6366f1; border-radius: 12px; padding: 20px; max-width: 420px; margin: 0 auto; background: #f8fafc; }
                        .title { font-size: 16px; font-weight: 700; color: #0f172a; text-align: center; margin-bottom: 2px; }
                        .subtitle { font-size: 11px; color: #64748b; text-align: center; margin-bottom: 16px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
                        .label { color: #64748b; font-weight: 500; }
                        .val { font-weight: 600; color: #0f172a; }
                        .cred-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin: 12px 0; text-align: center; }
                        .cred-box .user { font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace; }
                        .cred-box .pass { font-size: 18px; font-weight: 800; color: #4f46e5; font-family: monospace; letter-spacing: 2px; margin-top: 4px; }
                        .footer { font-size: 10px; text-align: center; color: #94a3b8; margin-top: 12px; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const modalInner = (
        <div className="p-4 sm:p-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/70">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                            1-Click Smart Parent Assign
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            Search student, select Father/Mother/Guardian, and auto-generate credentials
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* If credentials generated, show Success Slip */}
            {successCredentials ? (
                <div className="py-4 space-y-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-semibold text-xs text-emerald-900">Parent Successfully Assigned</p>
                            <p className="text-[11px] text-emerald-700">
                                Credentials slip generated below. You can copy or print it now.
                            </p>
                        </div>
                    </div>

                    {/* Printable Voucher Slip */}
                    <div
                        ref={printSlipRef}
                        className="slip-box border border-dashed border-indigo-200 bg-slate-50/70 rounded-xl p-4 sm:p-5 shadow-2xs max-w-md mx-auto"
                    >
                        <div className="text-center pb-3 border-b border-slate-200">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full mb-1 border border-indigo-100">
                                <ShieldCheck className="w-3 h-3" /> PORUA ACCESS SLIP
                            </span>
                            <h3 className="title text-sm font-bold text-slate-900">
                                {successCredentials.student_name}
                            </h3>
                            <p className="subtitle text-[11px] text-slate-500">
                                Class: {successCredentials.class_name || 'N/A'} • Roll: {successCredentials.roll_number || 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-1.5 py-3">
                            <div className="row flex justify-between text-xs py-1 border-b border-slate-100">
                                <span className="label text-slate-500">Parent / Guardian:</span>
                                <span className="val font-semibold text-slate-800">
                                    {successCredentials.parent_name} ({successCredentials.relation})
                                </span>
                            </div>
                            <div className="row flex justify-between text-xs py-1 border-b border-slate-100">
                                <span className="label text-slate-500">Linked Students:</span>
                                <span className="val font-semibold text-indigo-600">
                                    {successCredentials.linked_students_count} Child(ren)
                                </span>
                            </div>
                            <div className="row flex justify-between text-xs py-1 border-b border-slate-100">
                                <span className="label text-slate-500">Login Portal:</span>
                                <span className="val font-mono text-[11px] text-slate-700">
                                    {successCredentials.login_url}
                                </span>
                            </div>
                        </div>

                        {/* Credentials Highlight Box */}
                        <div className="cred-box bg-white border border-slate-200 rounded-lg p-3 text-center my-1.5">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Username or Mobile
                            </div>
                            <div className="user text-sm font-bold text-slate-900 font-mono select-all mt-0.5">
                                {successCredentials.username}
                            </div>

                            <div className="mt-2 pt-2 border-t border-dashed border-slate-100">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                    Password / PIN
                                </div>
                                <div className="pass text-lg font-black text-indigo-600 font-mono tracking-widest select-all">
                                    {successCredentials.password}
                                </div>
                            </div>
                        </div>

                        <div className="footer text-[10px] text-center text-slate-400 mt-2">
                            Parents can use this Username/Mobile & PIN to log in.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyCredentials}
                            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        >
                            {copied ? 'Copied!' : 'Copy Credentials'}
                        </Button>

                        <Button
                            size="sm"
                            onClick={handlePrintSlip}
                            icon={<Printer className="w-3.5 h-3.5" />}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Print Slip
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setSuccessCredentials(null);
                                setSelectedStudent(null);
                                fetchInitialStudents();
                            }}
                        >
                            Assign Another
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-3.5 space-y-4">
                    {errorMessage && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* STEP 1: Search & Student Selection */}
                    {!selectedStudent ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Class Filter</label>
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => {
                                            setSelectedClassId(e.target.value);
                                            setSelectedSectionId('');
                                        }}
                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    >
                                        <option value="">All Classes</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedClassId && (
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Section</label>
                                        <select
                                            value={selectedSectionId}
                                            onChange={(e) => setSelectedSectionId(e.target.value)}
                                            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
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
                                )}

                                <div className={selectedClassId ? 'sm:col-span-1' : 'sm:col-span-2'}>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Search Student / Parent</label>
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Student name, roll, mobile..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Results Grid */}
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                {isSearching ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-indigo-500" />
                                        <p className="text-xs">Searching students...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => selectStudent(student)}
                                            className="p-2.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                                                    {student.full_name?.charAt(0) || 'S'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-semibold text-xs text-slate-900 truncate">
                                                            {student.full_name}
                                                        </p>
                                                        {student.has_parent && (
                                                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium px-1.5 py-0.2 rounded">
                                                                Linked
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate">
                                                        {student.class_name} • Roll: {student.roll_number || 'N/A'} • Adm: {student.admission_number || 'N/A'}
                                                    </p>
                                                    <div className="text-[10px] text-slate-400 flex gap-2 truncate">
                                                        {student.father.name && <span>F: {student.father.name} ({student.father.phone || 'No Phone'})</span>}
                                                        {student.mother.name && <span>M: {student.mother.name}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button size="sm" variant="ghost" className="text-xs shrink-0">
                                                Select <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                        <Users className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                        <p className="text-xs font-medium text-slate-600">No students match your query</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Try searching student name, roll number, or phone.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: Pick Persona & Auto Credentials */
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Selected Student Banner */}
                            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                        {selectedStudent.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-bold text-xs text-slate-900">{selectedStudent.full_name}</p>
                                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100 font-medium">
                                                {selectedStudent.class_name} ({selectedStudent.section_name})
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Roll: {selectedStudent.roll_number || 'N/A'} • Adm: {selectedStudent.admission_number || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setDuplicateInfo(null);
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            {selectedStudent.has_parent && (
                                <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-lg flex items-center gap-2 text-xs text-amber-800">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                    <span>
                                        Student already has linked parent: <strong>{selectedStudent.existing_parent_name}</strong>.
                                    </span>
                                </div>
                            )}

                            {/* Persona Selector Cards */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                                    Select Guardian Persona
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {/* Father Card */}
                                    <div
                                        onClick={() => applyPersona(selectedStudent, 'father')}
                                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            persona === 'father'
                                                ? 'border-indigo-600 bg-indigo-50/40 shadow-2xs'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-base">👨</span>
                                                <span className="font-bold text-xs text-slate-800">Father</span>
                                            </div>
                                            {persona === 'father' && (
                                                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 truncate">
                                            {selectedStudent.father.name || '(No name set)'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                                            {selectedStudent.father.phone || '(No phone)'}
                                        </p>
                                    </div>

                                    {/* Mother Card */}
                                    <div
                                        onClick={() => applyPersona(selectedStudent, 'mother')}
                                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            persona === 'mother'
                                                ? 'border-indigo-600 bg-indigo-50/40 shadow-2xs'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-base">👩</span>
                                                <span className="font-bold text-xs text-slate-800">Mother</span>
                                            </div>
                                            {persona === 'mother' && (
                                                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 truncate">
                                            {selectedStudent.mother.name || '(No name set)'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                                            {selectedStudent.mother.phone || '(No phone)'}
                                        </p>
                                    </div>

                                    {/* Legal Guardian Card */}
                                    <div
                                        onClick={() => applyPersona(selectedStudent, 'guardian')}
                                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            persona === 'guardian'
                                                ? 'border-indigo-600 bg-indigo-50/40 shadow-2xs'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-base">👤</span>
                                                <span className="font-bold text-xs text-slate-800">Guardian</span>
                                            </div>
                                            {persona === 'guardian' && (
                                                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 truncate">
                                            {selectedStudent.guardian.name || '(No guardian set)'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                                            {selectedStudent.guardian.phone || '(No phone)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Duplicate Detection Alert */}
                            {duplicateInfo?.found && duplicateInfo.parent && (
                                <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-xl space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-purple-700" /> Existing Parent Account Detected
                                        </span>
                                        <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.2 rounded-full">
                                            Auto-Merge
                                        </span>
                                    </div>
                                    <p className="text-xs text-purple-800">
                                        Found account for <strong>{duplicateInfo.parent.name}</strong> (User: <code>{duplicateInfo.parent.username || duplicateInfo.parent.phone}</code>) with {duplicateInfo.parent.linked_children.length} existing student(s):
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                        {duplicateInfo.parent.linked_children.map((child) => (
                                            <span
                                                key={child.id}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-purple-200 rounded text-[10px] font-medium text-purple-900"
                                            >
                                                <Baby className="w-3 h-3 text-purple-600" />
                                                {child.full_name} ({child.class_name})
                                            </span>
                                        ))}
                                    </div>
                                    <div className="pt-1 flex items-center gap-3">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-purple-900 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="dup_action"
                                                checked={linkExisting}
                                                onChange={() => setLinkExisting(true)}
                                                className="text-purple-600 focus:ring-purple-500"
                                            />
                                            Link to existing parent (1 shared login)
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="dup_action"
                                                checked={!linkExisting}
                                                onChange={() => setLinkExisting(false)}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            Create separate account
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Credentials Fields */}
                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                        Account Credentials
                                    </span>
                                    <span className="text-[10px] text-slate-400">All fields editable</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                                            Parent Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={parentName}
                                            onChange={(e) => setParentName(e.target.value)}
                                            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            placeholder="Parent name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            value={parentPhone}
                                            onChange={(e) => {
                                                setParentPhone(e.target.value);
                                                if (!username || username === parentPhone.replace(/\D/g, '')) {
                                                    const clean = e.target.value.replace(/\D/g, '');
                                                    setUsername(clean);
                                                    setEmail(`${clean}@porua.app`);
                                                }
                                            }}
                                            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            placeholder="01XXXXXXXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                                            Username (Universal Login) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            placeholder="username or mobile"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                                            Default Email (Auto-Generated)
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            placeholder="username@porua.app"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <label className="text-[11px] font-medium text-slate-700">
                                                Password / 4-Digit PIN <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateRandomPin}
                                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                            >
                                                <RefreshCw className="w-2.5 h-2.5" /> Random PIN
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={4}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full text-xs font-mono tracking-wider py-1.5 pl-2.5 pr-8 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                                placeholder="Min 4 digits (e.g. 1234)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sibling Linker */}
                            <div className="border border-slate-200/80 rounded-xl p-2.5 bg-white">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                                        <Link2 className="w-3.5 h-3.5 text-indigo-600" /> Link Additional Siblings (Optional)
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {selectedSiblings.length} selected
                                    </span>
                                </div>

                                {selectedSiblings.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {selectedSiblings.map((sib) => (
                                            <span
                                                key={sib.id}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded border border-indigo-100"
                                            >
                                                <span>{sib.full_name} ({sib.class_name})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSibling(sib.id)}
                                                    className="hover:text-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-1.5 relative">
                                    <input
                                        type="text"
                                        placeholder="Search sibling student..."
                                        value={siblingSearchQuery}
                                        onChange={(e) => handleSiblingSearch(e.target.value)}
                                        className="w-full text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 py-1.5 px-2.5 bg-white"
                                    />
                                    {isSearchingSiblings && (
                                        <RefreshCw className="w-3 h-3 animate-spin absolute right-2.5 top-2 text-slate-400" />
                                    )}

                                    {siblingSearchResults.length > 0 && (
                                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-36 overflow-y-auto">
                                            {siblingSearchResults.map((sib) => (
                                                <div
                                                    key={sib.id}
                                                    onClick={() => addSibling(sib)}
                                                    className="px-2.5 py-1.5 text-xs hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                                                >
                                                    <span className="font-medium text-slate-800">
                                                        {sib.full_name} ({sib.class_name} - Roll {sib.roll_number || 'N/A'})
                                                    </span>
                                                    <Plus className="w-3 h-3 text-indigo-600" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button size="sm" variant="ghost" type="button" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    type="submit"
                                    disabled={isSubmitting || !parentName}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                                    icon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                >
                                    {isSubmitting ? 'Creating...' : 'Generate Parent Account'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );

    if (embedded) {
        return (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                {modalInner}
            </div>
        );
    }

    return (
        <Modal show={show} onClose={onClose || (() => {})} maxWidth="3xl">
            {modalInner}
        </Modal>
    );
}
