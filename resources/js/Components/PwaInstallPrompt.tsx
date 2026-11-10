import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, Check } from 'lucide-react';
import Button from '@/Components/Button';
import { triggerHaptic } from '@/utils/haptics';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // 1. Check if running in standalone mode (already installed)
        const isStandaloneMode = 
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;

        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // 2. Check dismissal cooldown (dismissed within last 3 days)
        const lastDismissed = localStorage.getItem('porua_pwa_prompt_dismissed');
        if (lastDismissed) {
            const daysSince = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
            if (daysSince < 3) return;
        }

        // 3. Detect iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIPhoneOrIPad = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

        if (isIPhoneOrIPad && isSafari) {
            setIsIOS(true);
            // Delay showing slightly for non-intrusive appearance
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // 4. Android / Chrome beforeinstallprompt event
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            const timer = setTimeout(() => setShowPrompt(true), 2500);
            return () => clearTimeout(timer);
        };

        const handleAppInstalled = () => {
            setInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
            localStorage.setItem('porua_pwa_installed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        triggerHaptic(15);
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === 'accepted') {
            setShowPrompt(false);
            setInstalled(true);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        triggerHaptic(8);
        setShowPrompt(false);
        localStorage.setItem('porua_pwa_prompt_dismissed', Date.now().toString());
    };

    if (isStandalone || installed || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    aria-label="Close"
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5 pr-6">
                    {/* App Logo */}
                    <img
                        src="/pwa/icons/icon-96x96.png"
                        alt="Porua"
                        className="w-12 h-12 rounded-xl border border-slate-700 shadow-md shrink-0 bg-white p-0.5"
                    />

                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">Install Porua App</h4>
                            <span className="flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded-full">
                                <Sparkles className="w-2.5 h-2.5" />
                                Fast & Offline
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">
                            {isIOS
                                ? 'Add to Home Screen for instant offline timetable, exam routine & fee alerts.'
                                : 'Install on your device for instant offline access and real-time attendance alerts.'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                    {isIOS ? (
                        <div className="bg-slate-800/60 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-center justify-between gap-2 border border-slate-700/40">
                            <span className="flex items-center gap-1.5 font-medium">
                                1. Tap <Share className="w-3.5 h-3.5 text-blue-400" />
                            </span>
                            <span className="text-slate-500">➔</span>
                            <span className="flex items-center gap-1.5 font-medium">
                                2. Scroll & tap <PlusSquare className="w-3.5 h-3.5 text-slate-300" /> "Add to Home Screen"
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDismiss}
                                className="text-xs text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800 py-1.5 h-auto"
                            >
                                Not Now
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleInstallClick}
                                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 h-auto px-4 shadow-lg shadow-indigo-600/30"
                            >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                Install App
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

