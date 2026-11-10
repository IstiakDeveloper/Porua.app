import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '@/Components/Button';
import { triggerHaptic } from '@/utils/haptics';

export default function PwaUpdateToast() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            import('workbox-window').then(({ Workbox }) => {
                const wb = new Workbox('/sw.js');

                wb.addEventListener('waiting', () => {
                    setNeedRefresh(true);
                    setUpdateSW(() => async () => {
                        wb.addEventListener('controlling', () => {
                            window.location.reload();
                        });
                        wb.messageSkipWaiting();
                    });
                });

                wb.register().catch((err) => {
                    console.debug('ServiceWorker registration error:', err);
                });
            }).catch(() => {
                // Ignore if workbox-window fails to load
            });
        }
    }, []);

    const handleUpdate = async () => {
        triggerHaptic(15);
        if (updateSW) {
            await updateSW();
        } else {
            window.location.reload();
        }
    };

    if (!needRefresh) return null;

    return (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-indigo-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-indigo-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-100">
                        New version of Porua is ready!
                    </span>
                </div>

                <Button
                    size="sm"
                    onClick={handleUpdate}
                    className="text-xs bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-1 px-3 h-auto shrink-0 shadow-sm"
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Update Now
                </Button>
            </div>
        </div>
    );
}

