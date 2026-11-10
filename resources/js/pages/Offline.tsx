import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { WifiOff, RefreshCw, Home, BookOpen, CreditCard, ShieldCheck } from 'lucide-react';
import Button from '@/Components/Button';

export default function Offline() {
    const [isRetrying, setIsRetrying] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setOnlineStatus(true);
            window.location.reload();
        };

        const handleOffline = () => {
            setOnlineStatus(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsRetrying(true);
        setTimeout(() => {
            if (navigator.onLine) {
                window.location.href = '/dashboard';
            } else {
                setIsRetrying(false);
            }
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
            <Head title="Offline Mode - Porua" />

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center relative overflow-hidden">
                {/* Background soft glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

                {/* Animated Offline Icon Badge */}
                <div className="relative mx-auto mb-6 w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-sm">
                    <WifiOff className="w-10 h-10 animate-pulse text-indigo-600" />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                    </span>
                </div>

                {/* Title & Description */}
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                    You're Currently Offline
                </h1>
                <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                    ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। আপনার ডিভাইসটি অনলাইনে আসার সাথে সাথে পেজটি স্বয়ংক্রিয়ভাবে রিলোড হবে।
                </p>

                {/* Network Status Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 mb-6">
                    <span className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {onlineStatus ? 'Network Restored - Reconnecting...' : 'Waiting for network connection'}
                </div>

                {/* Retry Button */}
                <div className="space-y-3 mb-8">
                    <Button
                        type="button"
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 font-bold transition-all active:scale-[0.98]"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                        {isRetrying ? 'Checking Connection...' : 'Try Reconnecting'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="w-full justify-center py-2.5 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                    >
                        Go Back to Previous Page
                    </Button>
                </div>

                {/* Offline Resilient Features Notice */}
                <div className="pt-6 border-t border-slate-100 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Offline Resilient Capabilities
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 font-medium">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Previously loaded routines and timetables remain cached.
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Teachers can mark offline attendance; it will sync automatically.
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Downloaded digital fee slips are saved on your phone.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <img src="/pwa/icons/favicon-32x32.png" alt="Porua" className="w-4 h-4 rounded" />
                <span>Porua PWA • Offline-First Smart School ERP</span>
            </div>
        </div>
    );
}

