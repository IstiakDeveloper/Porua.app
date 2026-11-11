import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import StatusToggle from '@/Components/StatusToggle';
import IndexPagination from '@/Components/IndexPagination';
import DeleteModal from '@/Components/DeleteModal';
import { useCanEditOrDelete } from '@/hooks/useCanEditOrDelete';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Mail,
    Phone,
    User as UserIcon,
    Eye,
    Shield,
    Users,
    UserCheck,
    UserX,
    Filter,
    RotateCcw,
    AtSign,
    Calendar,
    Clock
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    slug: string;
    users_count?: number;
}

interface User {
    id: number;
    name: string | null;
    username: string | null;
    email: string | null;
    phone?: string | null;
    roles: Array<{ id: number; name: string | null; slug?: string }>;
    status: string;
    last_login_at?: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersIndexProps {
    users: {
        data: User[] | null;
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    roles: Role[];
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export default function Index({ users, filters = {}, roles = [], stats }: UsersIndexProps) {
    const canMutate = useCanEditOrDelete();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string | null } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/users',
            {
                search: search.trim() || undefined,
                role: selectedRole || undefined,
                status: selectedStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedRole('');
        setSelectedStatus('');
        router.get('/users');
    };

    const handleStatusToggle = (user: User) => {
        setTogglingId(user.id);
        router.patch(
            `/users/${user.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            }
        );
    };

    const openDelete = (user: User) => {
        setDeleteTarget({ id: user.id, name: user.name || user.username || 'this user' });
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        if (deleting) return;
        setDeleteOpen(false);
        setDeleteTarget(null);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/users/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                closeDelete();
            },
        });
    };

    const getRoleVariant = (role: string) => {
        const m: Record<string, 'purple' | 'info' | 'success' | 'warning' | 'default'> = {
            'Super Admin': 'purple',
            'Admin': 'purple',
            'Principal': 'info',
            'Teacher': 'success',
            'Accountant': 'warning',
            'Librarian': 'info',
            'Student': 'default',
            'Parent': 'info',
        };
        return m[role] || 'default';
    };

    const data = users?.data ?? [];

    return (
        <AuthenticatedLayout>
            <Head title="Users Management" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">Users Directory</h1>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                                {users.total} accounts
                            </span>
                        </div>
                        <p className="text-xs text-emerald-800/80 mt-0.5">
                            Manage user profiles, login credentials, roles, and account security
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        <Link href="/roles">
                            <Button size="sm" variant="secondary" icon={<Shield className="w-3.5 h-3.5" />}>
                                Roles & Permissions
                            </Button>
                        </Link>
                        <Link href="/users/create">
                            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                Add User
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{stats?.total ?? users.total}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Active Users</p>
                                <p className="text-xl font-bold text-emerald-700 mt-0.5">{stats?.active ?? 0}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <UserCheck className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Inactive / Suspended</p>
                                <p className="text-xl font-bold text-amber-700 mt-0.5">{stats?.inactive ?? 0}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <UserX className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">Defined Roles</p>
                                <p className="text-xl font-bold text-indigo-700 mt-0.5">{roles.length}</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-xl border border-emerald-100 p-3 sm:p-4 shadow-2xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-2.5">
                        <div className="flex-1 min-w-[220px]">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">Search Users</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by name, username, email, phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full text-xs pl-8 pr-2.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex items-center gap-2">
                            <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-lg sm:w-40 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                                >
                                    <option value="">All Roles ({roles.length})</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.slug || r.name}>
                                            {r.name} {r.users_count !== undefined ? `(${r.users_count})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-lg sm:w-36 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                variant="primary"
                                icon={<Filter className="w-3.5 h-3.5" />}
                                className="flex-1 sm:flex-initial justify-center text-xs"
                            >
                                Filter
                            </Button>
                            {(search || selectedRole || selectedStatus) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Mobile Cards Feed (< md) */}
                <div className="block md:hidden space-y-3">
                    {data.length > 0 ? (
                        data.map((user) => (
                            <div key={user.id} className="bg-white rounded-xl border border-emerald-100 p-3.5 shadow-2xs space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0">
                                            {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 truncate">{user.name || 'Unnamed'}</p>
                                            <p className="text-[11px] text-emerald-700 font-mono flex items-center gap-0.5">
                                                <AtSign className="w-3 h-3 text-emerald-600" />
                                                {user.username || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusToggle
                                        checked={user.status === 'active'}
                                        onChange={() => handleStatusToggle(user)}
                                        loading={togglingId === user.id}
                                    />
                                </div>

                                <div className="text-[11px] text-gray-600 space-y-1 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span className="truncate">{user.email || 'No email'}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((r, i) => (
                                                <Badge key={i} variant={getRoleVariant(r.name || '')} size="sm">
                                                    {r.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-400">No role</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/users/${user.id}`}
                                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-md transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                        {canMutate && (
                                            <>
                                                <Link
                                                    href={`/users/${user.id}/edit`}
                                                    className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-md transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => openDelete(user)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-emerald-100 p-8 text-center text-xs text-gray-500">
                            No users found matching your filters.
                        </div>
                    )}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block bg-white rounded-xl border border-emerald-100 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        User & Identity
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Contact Info
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Assigned Roles
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-emerald-900 uppercase tracking-wider w-28">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.length > 0 ? (
                                    data.map((user) => (
                                        <tr key={user.id} className="hover:bg-emerald-50/20 transition-colors">
                                            {/* User & Identity */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/users/${user.id}`}
                                                            className="text-xs font-semibold text-gray-900 hover:text-emerald-700 transition-colors"
                                                        >
                                                            {user.name || 'Unnamed User'}
                                                        </Link>
                                                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            {user.email || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Username */}
                                            <td className="px-4 py-3">
                                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 font-mono text-xs">
                                                    <AtSign className="w-3 h-3 text-emerald-600" />
                                                    <span className="font-semibold">{user.username || '—'}</span>
                                                </div>
                                            </td>

                                            {/* Contact Info */}
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {user.phone ? (
                                                    <div className="flex items-center gap-1 font-mono">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        <span>{user.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Roles */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((r, i) => (
                                                            <Badge key={i} variant={getRoleVariant(r.name || '')} size="sm">
                                                                {r.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">None</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <StatusToggle
                                                    checked={user.status === 'active'}
                                                    onChange={() => handleStatusToggle(user)}
                                                    loading={togglingId === user.id}
                                                    activeLabel="Active"
                                                    inactiveLabel="Suspended"
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/users/${user.id}`}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    {canMutate && (
                                                        <>
                                                            <Link
                                                                href={`/users/${user.id}/edit`}
                                                                className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                                                title="Edit User"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => openDelete(user)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-xs text-gray-500">
                                            No users found matching the given filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users.total > users.per_page && (
                    <div className="pt-2">
                        <IndexPagination pagination={users as any} />
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteOpen}
                title="Delete User Account"
                itemName={deleteTarget?.name || 'this user'}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </AuthenticatedLayout>
    );
}
