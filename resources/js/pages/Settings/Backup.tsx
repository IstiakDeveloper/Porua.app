import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Database, Download, RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import { useState } from 'react';

export default function Backup() {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateBackup = async () => {
        if (confirm('Are you sure you want to create a backup? This may take a few minutes.')) {
            setIsCreating(true);
            router.post('/settings/backup/create', {}, {
                onFinish: () => setIsCreating(false),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Backup Management" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Database className="h-6 w-6" />
                            Backup Management
                        </h1>
                        <p className="text-gray-600 mt-1">Create and manage database backups</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {flash.error}
                    </div>
                )}

                <Card>
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <HardDrive className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900">Database Backup</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Create a backup of your entire database. This includes all student records,
                                        fee transactions, attendance data, and system settings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Backup</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Creating a backup will generate a complete snapshot of your database.
                                This process may take several minutes depending on the size of your data.
                            </p>
                            <Button
                                onClick={handleCreateBackup}
                                disabled={isCreating}
                                className="flex items-center gap-2"
                            >
                                {isCreating ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Creating Backup...
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-4 w-4" />
                                        Create Backup Now
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Guidelines</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>It's recommended to create backups regularly, at least once a week</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Backups are stored securely on the server</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Download and store backups in a safe location</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Always create a backup before major system updates</span>
                                </li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restore from Backup</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                To restore from a backup, please contact your system administrator.
                                Restoring will replace all current data with the backup data.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-900">Warning</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Restoring a backup will overwrite all current data.
                                            This action cannot be undone. Please proceed with caution.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
