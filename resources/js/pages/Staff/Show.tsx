import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, ArrowLeft } from 'lucide-react';

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // post('/endpoint');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create New</h1>
                    <Button variant="secondary" onClick={() => router.get('javascript:history.back()')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <p className="text-center py-12 text-gray-500">Form fields will be displayed here</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
