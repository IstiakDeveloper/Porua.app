import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import Button from '@/Components/Button';
import { User, Mail, Phone, Calendar, Users } from 'lucide-react';

interface Child {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    class_name: string;
    section_name: string;
    phone: string;
    email: string;
}

interface Props {
    children: Child[];
}

export default function Index({ children }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="My Children" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">My Children</h1>
                        <p className="text-gray-600">View and manage your children's information</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {children.map((child) => (
                            <Card key={child.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center mb-4">
                                        <img
                                            src={child.photo || '/default-avatar.png'}
                                            alt={child.full_name}
                                            className="h-24 w-24 rounded-full object-cover mb-4"
                                        />
                                        <h3 className="text-xl font-semibold mb-1">{child.full_name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {child.class_name} - {child.section_name}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                Roll: {child.roll_number}
                                            </span>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                {child.admission_number}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(child.date_of_birth).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span>{child.gender}</span>
                                        </div>
                                        {child.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <span>{child.phone}</span>
                                            </div>
                                        )}
                                        {child.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{child.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link href={route('parent.children.show', child.id)}>
                                        <Button className="w-full">
                                            <Users className="h-4 w-4 mr-2" />
                                            View Full Profile
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {children.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No children found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
