import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import IndexPagination from '@/Components/IndexPagination';
import DeleteModal from '@/Components/DeleteModal';
import { useCanEditOrDelete } from '@/hooks/useCanEditOrDelete';
import { Plus, Search, Edit, Trash2, Mail, Phone, User as UserIcon, Eye } from 'lucide-react';

interface User {
    id: number;
    name: string | null;
    email: string | null;
    phone?: string | null;
    roles: Array<{ name: string | null }>;
    status: string;
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
    filters: { search?: string };
}

export default function Index({ users, filters }: UsersIndexProps) {
    const canMutate = useCanEditOrDelete();
    const [search, setSearch] = useState(filters.search || '');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string | null } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search }, { preserveState: true });
    };

    const openDelete = (user: User) => {
        setDeleteTarget({ id: user.id, name: user.name });
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

    const getStatusVariant = (status: string) => (status === 'active' ? 'success' : 'default');
    const getRoleVariant = (role: string) => {
        const m: Record<string, string> = {
            'Super Admin': 'purple', 'Admin': 'violet', 'Principal': 'info', 'Teacher': 'success',
            'Accountant': 'warning', 'Librarian': 'cyan', 'Student': 'pink', 'Parent': 'indigo',
        };
        return m[role] || 'default';
    };

    const data = users.data ?? [];

    return (
        <AuthenticatedLayout>
            <Head title="Users" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Manage users and roles</p>
                    </div>
                    <Link href="/users/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add User</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 p-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        />
                        <Button type="submit" size="sm" variant="secondary" icon={<Search className="w-4 h-4" />}>
                            Search
                        </Button>
                    </form>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.length > 0 ? data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />{user.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{user.phone || '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map((r, i) => (
                                                    <Badge key={i} variant={getRoleVariant(r?.name || '') as any} size="sm">{r?.name || 'N/A'}</Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={getStatusVariant(user.status) as any} className="capitalize text-xs">{user.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/users/${user.id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-3.5 h-3.5" /></Link>
                                                {canMutate && (
                                                    <>
                                                        <Link href={`/users/${user.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                        <button type="button" onClick={() => openDelete(user)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={users.links ?? []}
                        from={users.from ?? undefined}
                        to={users.to ?? undefined}
                        total={users.total}
                        lastPage={users.last_page}
                    />
                </div>
            </div>

            <DeleteModal
                isOpen={deleteOpen}
                onClose={closeDelete}
                onConfirm={confirmDelete}
                isDeleting={deleting}
                title="Delete user"
                message="You’re about to permanently delete this user from the system."
                itemName={deleteTarget?.name ?? undefined}
            />
        </AuthenticatedLayout>
    );
}
