import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import { route } from '@/Components/Parent/route';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Home" />
            <ParentPage title="Your children" subtitle="They live on the home page now.">
                <Link href={route('parent.dashboard')} className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800">
                    Go to home
                </Link>
            </ParentPage>
        </AuthenticatedLayout>
    );
}
