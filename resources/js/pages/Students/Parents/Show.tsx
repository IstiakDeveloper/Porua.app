import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import DeleteModal from '@/Components/DeleteModal';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Shield,
    ShieldCheck,
    GraduationCap,
    Printer,
    Copy,
    Check,
    ExternalLink,
    Briefcase,
    Calendar
} from 'lucide-react';

interface Student {
    id: number;
    admission_number: string;
    roll_number: string | null;
    first_name: string;
    last_name: string;
    full_name: string;
    photo_url?: string | null;
    status: string;
    school_class?: { id: number; name: string };
    section?: { id: number; name: string };
    user?: {
        name: string;
        email: string;
    };
}

interface Parent {
    id: number;
    user_id: number;
    father_name: string | null;
    father_phone: string | null;
    father_occupation: string | null;
    mother_name: string | null;
    mother_phone: string | null;
    mother_occupation: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    address: string | null;
    status?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        username?: string | null;
        email: string;
        phone: string | null;
        status?: string;
        created_at: string;
    } | null;
    students: Student[];
}

interface ShowProps {
    parent: Parent;
}

export default function Show({ parent }: ShowProps) {
    const [copiedUsername, setCopiedUsername] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const printSlipRef = useRef<HTMLDivElement>(null);

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        router.delete(`/student-parents/${parent.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
            },
        });
    };

    const handleCopyUsername = () => {
        const text = parent.user?.username || parent.user?.phone || '';
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedUsername(true);
        setTimeout(() => setCopiedUsername(false), 2000);
    };

    const handlePrintSlip = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const childrenList = parent.students.map(s => `
            <div style="padding: 4px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px;">
                <strong>${s.full_name || `${s.first_name} ${s.last_name}`}</strong> 
                (${s.school_class?.name || 'Class N/A'} - Roll: ${s.roll_number || 'N/A'}, Adm: ${s.admission_number})
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Parent Portal Access Slip - ${parent.user?.name || 'Parent'}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
                        .slip-box { border: 1.5px dashed #6366f1; border-radius: 12px; padding: 20px; max-width: 440px; margin: 0 auto; background: #f8fafc; }
                        .title { font-size: 16px; font-weight: 700; color: #0f172a; text-align: center; margin-bottom: 2px; }
                        .subtitle { font-size: 11px; color: #64748b; text-align: center; margin-bottom: 16px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
                        .label { color: #64748b; font-weight: 500; }
                        .val { font-weight: 600; color: #0f172a; }
                        .cred-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center; }
                        .cred-box .user { font-size: 15px; font-weight: 700; color: #0f172a; font-family: monospace; }
                        .footer { font-size: 10px; text-align: center; color: #94a3b8; margin-top: 14px; }
                    </style>
                </head>
                <body>
                    <div class="slip-box">
                        <div class="title">PORUA ACADEMY</div>
                        <div class="subtitle">Parent Portal Access Credentials</div>
                        <div class="row">
                            <span class="label">Parent Name:</span>
                            <span class="val">${parent.user?.name || 'N/A'}</span>
                        </div>
                        <div class="row">
                            <span class="label">Phone:</span>
                            <span class="val">${parent.user?.phone || 'N/A'}</span>
                        </div>
                        <div class="cred-box">
                            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Login Identifier</div>
                            <div class="user">${parent.user?.username || parent.user?.phone || parent.user?.email}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Portal URL: <strong>https://porua.app/login</strong></div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Linked Children:</div>
                            ${childrenList}
                        </div>
                        <div class="footer">Please keep these credentials secure.</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Parent Profile - ${parent.user?.name || 'Details'}`} />

            <div className="space-y-4 max-w-6xl">
                {/* Standard Admin Header */}
                <FormPageHeader
                    title={parent.user?.name || 'Parent Profile'}
                    subtitle="Guardian contact details, login credentials, and linked children"
                    backUrl="/student-parents"
                    backLabel="Parents"
                    badgeText="Parent Portal"
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePrintSlip}
                                icon={<Printer className="w-3.5 h-3.5" />}
                            >
                                Print Slip
                            </Button>
                            <Link href={`/student-parents/${parent.id}/edit`}>
                                <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                                    icon={<Edit className="w-3.5 h-3.5" />}
                                >
                                    Edit Parent
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setDeleteModalOpen(true)}
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                                Delete
                            </Button>
                        </div>
                    }
                />

                {/* Main 2-Column ERP Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* LEFT COLUMN: Profile & Portal Credentials */}
                    <div className="space-y-4">
                        {/* Basic Identity Card */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-700 font-bold text-base shrink-0">
                                    {parent.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-slate-900 truncate">
                                            {parent.user?.name || 'N/A'}
                                        </h3>
                                        <Badge
                                            variant={parent.user?.status === 'active' ? 'success' : 'default'}
                                            className="text-[10px]"
                                        >
                                            {parent.user?.status || 'Active'}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Registered: {new Date(parent.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Portal Access Card */}
                        <FormCard
                            title="Portal Login Credentials"
                            description="Identifiers used to sign in to the web and mobile app"
                            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        >
                            <div className="space-y-2.5">
                                <div>
                                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                        Username (Universal Login)
                                    </span>
                                    <div className="flex items-center justify-between mt-0.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg">
                                        <span className="font-mono text-xs font-bold text-indigo-900 select-all">
                                            {parent.user?.username || parent.user?.phone || 'Not set'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyUsername}
                                            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-white"
                                            title="Copy Username"
                                        >
                                            {copiedUsername ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                        Mobile Phone
                                    </span>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-700">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        {parent.user?.phone ? (
                                            <a href={`tel:${parent.user.phone}`} className="font-mono hover:text-indigo-600 hover:underline">
                                                {parent.user.phone}
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic">No phone registered</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                        Email Address
                                    </span>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-700">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        {parent.user?.email ? (
                                            <a href={`mailto:${parent.user.email}`} className="hover:text-indigo-600 hover:underline truncate">
                                                {parent.user.email}
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic">No email</span>
                                        )}
                                    </div>
                                </div>

                                {parent.address && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                            Present Address
                                        </span>
                                        <p className="text-xs text-slate-600 mt-0.5 flex items-start gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                            <span>{parent.address}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </FormCard>

                        {/* Detailed Guardian Records */}
                        <FormCard
                            title="Family & Guardian Records"
                            description="Historical contact references"
                            icon={<Users className="w-4 h-4 text-slate-600" />}
                        >
                            <div className="space-y-2 text-xs">
                                {parent.father_name && (
                                    <div className="p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="font-semibold text-slate-800">Father:</span> {parent.father_name}
                                        {parent.father_phone && <span className="block text-[11px] text-slate-500 font-mono">Phone: {parent.father_phone}</span>}
                                        {parent.father_occupation && <span className="block text-[10px] text-slate-400">Occupation: {parent.father_occupation}</span>}
                                    </div>
                                )}

                                {parent.mother_name && (
                                    <div className="p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="font-semibold text-slate-800">Mother:</span> {parent.mother_name}
                                        {parent.mother_phone && <span className="block text-[11px] text-slate-500 font-mono">Phone: {parent.mother_phone}</span>}
                                        {parent.mother_occupation && <span className="block text-[10px] text-slate-400">Occupation: {parent.mother_occupation}</span>}
                                    </div>
                                )}

                                {parent.guardian_name && (
                                    <div className="p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="font-semibold text-slate-800">Guardian:</span> {parent.guardian_name}
                                        {parent.guardian_relation && <span className="text-[11px] text-indigo-600 ml-1">({parent.guardian_relation})</span>}
                                        {parent.guardian_phone && <span className="block text-[11px] text-slate-500 font-mono">Phone: {parent.guardian_phone}</span>}
                                    </div>
                                )}
                            </div>
                        </FormCard>
                    </div>

                    {/* RIGHT COLUMN: Linked Children (Students) Hub */}
                    <div className="lg:col-span-2 space-y-4">
                        <FormCard
                            title="Linked Students (Children)"
                            description="Students enrolled under this parent's guardianship"
                            icon={<GraduationCap className="w-4 h-4 text-indigo-600" />}
                            action={
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    {parent.students.length} Student(s)
                                </span>
                            }
                        >
                            {parent.students && parent.students.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {parent.students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                {student.photo_url ? (
                                                    <img
                                                        src={student.photo_url}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                                                        {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h4 className="font-bold text-xs text-slate-900 truncate">
                                                            {student.full_name || `${student.first_name} ${student.last_name}`}
                                                        </h4>
                                                        <Badge
                                                            variant={student.status === 'active' ? 'success' : 'default'}
                                                            className="text-[9px] capitalize shrink-0"
                                                        >
                                                            {student.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                        {student.school_class?.name} {student.section?.name ? `(${student.section.name})` : ''}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                                                        <span>Roll: {student.roll_number || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span>Adm: {student.admission_number}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400">Child Profile</span>
                                                <Link
                                                    href={`/students/${student.id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    View Details <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-slate-700">No Students Linked</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                                        This parent account does not have any active students attached.
                                    </p>
                                    <Link href={`/student-parents/${parent.id}/edit`}>
                                        <Button size="sm" variant="outline">
                                            Link Students Now
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </FormCard>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Parent Account"
                message="Are you sure you want to remove this parent account? Linked students will become unlinked."
                itemName={parent.user?.name || 'this parent'}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}

