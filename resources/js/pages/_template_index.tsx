import { router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Plus } from 'lucide-react';

export default function Index({ data }: { data: any }) {
    return (
        <AuthenticatedLayout>
            <Head title="Page Title" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Page Title</h1>
                    <Button onClick={() => router.get('/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                    </Button>
                </div>
                <Card>
                    <p className="text-center py-12 text-gray-500">Data will be displayed here</p>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
