import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import StatusToggle from '@/Components/StatusToggle';
import DeleteModal from '@/Components/DeleteModal';
import {
    Edit,
    Trash2,
    Mail,
    Phone,
    Shield,
    Calendar,
    User as UserIcon,
    AtSign,
    Clock,
    Key,
    GraduationCap,
    BookOpen,
    Users,
    CheckCircle2,
    AlertCircle,
    Building2
} from 'lucide-react';
import { formatBdDate } from '@/utils/datetime';

interface Permission {
    id: number;
    name: string;
    slug: string;
    module?: string;
}

interface Role {
    id: number;
    name: string;
    slug?: string;
    permissions?: Permission[];
}

interface User {
    id: number;
    name: string;
    username?: string | null;
    email: string;
    phone?: string | null;
    status: string;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    roles: Role[];
    student?: {
        id: number;
        admission_number: string;
        roll_number: string;
        school_class?: { name: string };
        section?: { name: string };
    } | null;
    teacher?: {
        id: number;
        employee_id?: string;
        designation?: string;
        department?: string;
    } | null;
    staff?: {
        id: number;
        employee_id?: string;
        designation?: string;
        department?: string;
    } | null;
    student_parent?: {
        id: number;
        students?: Array<{ id: number; full_name?: string; admission_number?: string }>;
    } | null;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    user: User;
}

export default function Show({ user }: ShowProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toggling, setToggling] = useState(false);

    const handleToggleStatus = () => {
        setToggling(true);
        router.patch(
            `/users/${user.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setToggling(false),
            }
        );
    };

    const confirmDelete = () => {
        router.delete(`/users/${user.id}`, {
            onFinish: () => setDeleteOpen(false),
        });
    };

    const getRoleBadgeVariant = (role: string): any => {
        const colors: Record<string, any> = {
            'Super Admin': 'purple',
            'Admin': 'purple',
            'Principal': 'info',
            'Teacher': 'success',
            'Accountant': 'warning',
            'Librarian': 'info',
            'Student': 'default',
            'Parent': 'info',
        };
        return colors[role] || 'default';
    };

    // Collect all unique permissions across all assigned roles
    const allPermissions = (user.roles || []).flatMap((r) => r.permissions || []);
    const uniquePermissions = Array.from(new Map(allPermissions.map((p) => [p.id, p])).values());

    return (
        <AuthenticatedLayout>
            <Head title={`User Profile: ${user.name}`} />

            <div className="max-w-5xl mx-auto space-y-5 pb-12">
                {/* Standardized Header */}
                <FormPageHeader
                    title={user.name}
                    subtitle={`@${user.username || 'no-username'} • Institutional User Account`}
                    backUrl="/users"
                    badge="User Profile"
                    actionSlot={
                        <div className="flex items-center gap-2">
                            <Link href={`/users/${user.id}/edit`}>
                                <Button size="sm" icon={<Edit className="w-3.5 h-3.5" />} className="text-xs">
                                    Edit Account
                                </Button>
                            </Link>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setDeleteOpen(true)}
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                className="text-xs"
                            >
                                Delete
                            </Button>
                        </div>
                    }
                />

                {/* Profile Hero Card */}
                <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-8 h-8" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
                                    <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <AtSign className="w-3 h-3 text-emerald-600" />
                                        <span>{user.username || 'no-username'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        {user.email}
                                    </span>
                                    {user.phone && (
                                        <span className="flex items-center gap-1 font-mono">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            {user.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                            <div className="flex items-center gap-2">
                                <StatusToggle
                                    checked={user.status === 'active'}
                                    onChange={handleToggleStatus}
                                    loading={toggling}
                                    activeLabel="Active"
                                    inactiveLabel="Suspended"
                                />
                            </div>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Member since {formatBdDate(user.created_at, 'long')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left Column: Account Details (2 cols) */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Institutional Affiliation if Linked */}
                        {user.student && (
                            <FormCard
                                title="Student Enrolment Record"
                                description="Linked student profile details in current academic database"
                                icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Admission No</span>
                                        <span className="font-mono font-bold text-gray-800 text-sm mt-0.5 block">
                                            {user.student.admission_number || '—'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Class & Section</span>
                                        <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                                            {user.student.school_class?.name || 'Class —'} {user.student.section?.name ? `(${user.student.section.name})` : ''}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Roll Number</span>
                                        <span className="font-mono font-bold text-gray-800 text-sm mt-0.5 block">
                                            {user.student.roll_number || '—'}
                                        </span>
                                    </div>
                                </div>
                            </FormCard>
                        )}

                        {user.teacher && (
                            <FormCard
                                title="Faculty & Teaching Profile"
                                description="Associated teacher and department appointment details"
                                icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Employee ID</span>
                                        <span className="font-mono font-bold text-gray-800 text-sm mt-0.5 block">
                                            {user.teacher.employee_id || '—'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Designation</span>
                                        <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                                            {user.teacher.designation || 'Teacher'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Department</span>
                                        <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                                            {user.teacher.department || 'General'}
                                        </span>
                                    </div>
                                </div>
                            </FormCard>
                        )}

                        {user.staff && (
                            <FormCard
                                title="Administrative Staff Details"
                                description="Administrative role details and department assignment"
                                icon={<Building2 className="w-5 h-5 text-emerald-600" />}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Employee ID</span>
                                        <span className="font-mono font-bold text-gray-800 text-sm mt-0.5 block">
                                            {user.staff.employee_id || '—'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Designation</span>
                                        <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                                            {user.staff.designation || 'Staff'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Department</span>
                                        <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                                            {user.staff.department || 'Administration'}
                                        </span>
                                    </div>
                                </div>
                            </FormCard>
                        )}

                        {/* Account Authentication & Activity */}
                        <FormCard
                            title="Account Authentication & Security"
                            description="Credentials details, session information, and login history"
                            icon={<Shield className="w-5 h-5 text-emerald-600" />}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-gray-500 font-medium">Unique Login Username</span>
                                    <p className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                                        @{user.username || 'no-username'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-gray-500 font-medium">Primary Email Address</span>
                                    <p className="font-mono font-semibold text-gray-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                        {user.email}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-gray-500 font-medium">Last Login Timestamp</span>
                                    <p className="text-gray-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {user.last_login_at
                                            ? `${formatBdDate(user.last_login_at)} ${new Date(user.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : 'No recorded login'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-gray-500 font-medium">Last Login IP Address</span>
                                    <p className="font-mono text-gray-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                        {user.last_login_ip || 'Not recorded'}
                                    </p>
                                </div>
                            </div>
                        </FormCard>

                        {/* Effective Permissions Capabilities */}
                        <FormCard
                            title={`Effective Permissions (${uniquePermissions.length})`}
                            description="Capabilities granted to this user through their assigned role(s)"
                            icon={<Key className="w-5 h-5 text-emerald-600" />}
                        >
                            {uniquePermissions.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                                    {uniquePermissions.map((perm) => (
                                        <span
                                            key={perm.id}
                                            className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                        >
                                            {perm.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No explicit permissions assigned.</p>
                            )}
                        </FormCard>
                    </div>

                    {/* Right Column: Roles & Quick Actions */}
                    <div className="space-y-5">
                        {/* Assigned Roles Card */}
                        <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-emerald-600" />
                                    Assigned Roles
                                </h3>
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                    {user.roles.length} role(s)
                                </span>
                            </div>

                            <div className="space-y-2">
                                {user.roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-xs font-bold text-gray-900 block">{role.name}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {role.permissions?.length || 0} permissions included
                                            </span>
                                        </div>
                                        <Badge variant={getRoleBadgeVariant(role.name)} size="sm">
                                            {role.name}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-2.5">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                                Account Actions
                            </h3>
                            <Link href={`/users/${user.id}/edit`} className="block">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                    <Edit className="w-3.5 h-3.5 mr-2" />
                                    Modify User Info & Roles
                                </Button>
                            </Link>
                            <Link href="/roles" className="block">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                    <Shield className="w-3.5 h-3.5 mr-2" />
                                    Manage Role Definitions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteOpen}
                title="Delete User Account"
                itemName={user.name}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </AuthenticatedLayout>
    );
}
