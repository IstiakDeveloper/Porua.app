import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Shield, Calendar, User as UserIcon } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: string;
    roles: Role[];
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    user: User;
}

export default function Show({ user }: ShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${user.id}`);
        }
    };

    const getRoleBadgeColor = (role: string): any => {
        const colors: Record<string, any> = {
            'Super Admin': 'purple',
            'Principal': 'info',
            'Teacher': 'success',
            'Accountant': 'warning',
            'Librarian': 'cyan',
            'Student': 'pink',
            'Parent': 'indigo',
        };
        return colors[role] || 'default';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            icon={<ArrowLeft className="w-5 h-5" />}
                            onClick={() => router.visit('/users')}
                            className="hover:bg-blue-50 hover:text-blue-600"
                        >
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                User Details
                            </h1>
                            <p className="text-gray-600 mt-1">View user information and settings</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/users/${user.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit User
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            icon={<Trash2 className="w-5 h-5" />}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
                                <UserIcon className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-16 px-8 pb-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge
                                        variant={user.status === 'active' ? 'success' : 'default'}
                                        className="capitalize"
                                    >
                                        {user.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        Member since {new Date(user.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Email Address</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Information */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            Assigned Roles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {user.roles.map((role, i) => (
                                <Badge key={i} variant={getRoleBadgeColor(role.name)} className="text-sm px-4 py-2">
                                    {role.name}
                                </Badge>
                            ))}
                            {user.roles.length === 0 && (
                                <p className="text-gray-500 text-sm">No roles assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            Account Status
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <div className="mt-1">
                                    <Badge
                                        variant={user.status === 'active' ? 'success' : 'default'}
                                        className="capitalize"
                                    >
                                        {user.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Account Created</label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
