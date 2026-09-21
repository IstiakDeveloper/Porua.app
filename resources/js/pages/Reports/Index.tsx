import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';

export default function Index({ data }: { data: any }) {
    return (
        <AuthenticatedLayout>
            <Head title="Reports" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                </div>
                <Card>
                    <p className="text-center py-12 text-gray-500">
                        Page content will be displayed here
                    </p>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
