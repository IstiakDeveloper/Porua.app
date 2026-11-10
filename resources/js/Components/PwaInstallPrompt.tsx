import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, Check, Info } from 'lucide-react';
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
    const [showFallbackGuide, setShowFallbackGuide] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // 1. Check if running in standalone mode (already installed)
        const isStandaloneMode =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;

        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // 2. Detect iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIPhoneOrIPad = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

        if (isIPhoneOrIPad && isSafari) {
            setIsIOS(true);
        }

        // 3. Check if window.__pwaInstallPrompt was already caught before React loaded
        const earlyPrompt = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
        if (earlyPrompt) {
            setDeferredPrompt(earlyPrompt);
            setShowPrompt(true);
        }

        // 4. Listen for pwa-prompt-ready event from early head script
        const handlePromptReady = () => {
            const prompt = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
            if (prompt) {
                setDeferredPrompt(prompt);
                setShowPrompt(true);
            }
        };
        window.addEventListener('pwa-prompt-ready', handlePromptReady);

        // 5. Fallback beforeinstallprompt event if head script missed it
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt = promptEvent;
            setDeferredPrompt(promptEvent);
            setShowPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        const handleAppInstalled = () => {
            setInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
            localStorage.setItem('porua_pwa_installed', 'true');
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        // 6. Allow opening the prompt manually from anywhere (e.g. sidebar, profile)
        const handleManualTrigger = () => {
            setShowPrompt(true);
            localStorage.removeItem('porua_pwa_prompt_dismissed');
        };
        window.addEventListener('porua:show-install-prompt', handleManualTrigger);

        // 7. Auto-display timer for iOS Safari or if prompt is ready
        const timer = setTimeout(() => {
            const lastDismissed = localStorage.getItem('porua_pwa_prompt_dismissed');
            // If user clicked dismiss recently, don't auto-pop immediately
            if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 24 * 60 * 60 * 1000) {
                return;
            }
            if (isIPhoneOrIPad && isSafari) {
                setShowPrompt(true);
            } else if ((window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt) {
                setShowPrompt(true);
            }
        }, 1500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('pwa-prompt-ready', handlePromptReady);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('porua:show-install-prompt', handleManualTrigger);
        };
    }, []);

    const handleInstallClick = async () => {
        triggerHaptic(15);

        const currentPrompt = deferredPrompt || (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;

        if (currentPrompt) {
            await currentPrompt.prompt();
            const choice = await currentPrompt.userChoice;

            if (choice.outcome === 'accepted') {
                setShowPrompt(false);
                setInstalled(true);
            }
            setDeferredPrompt(null);
            (window as unknown as { __pwaInstallPrompt?: null }).__pwaInstallPrompt = null;
        } else {
            // Browser has not exposed beforeinstallprompt (e.g. Desktop Chrome or user previously cancelled native dialog)
            setShowFallbackGuide(true);
        }
    };

    const handleDismiss = () => {
        triggerHaptic(8);
        setShowPrompt(false);
        setShowFallbackGuide(false);
        localStorage.setItem('porua_pwa_prompt_dismissed', Date.now().toString());
    };

    if (isStandalone || installed || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/60 relative overflow-hidden">
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

                {/* Actions & Instructions */}
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
                    ) : showFallbackGuide ? (
                        <div className="space-y-2.5">
                            <div className="bg-indigo-950/60 border border-indigo-800/50 rounded-xl p-3 text-xs text-indigo-200">
                                <p className="font-bold flex items-center gap-1.5 text-white mb-1">
                                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                                    Browser Installation Steps:
                                </p>
                                <p className="text-[11px] text-indigo-300">
                                    Tap your browser menu (<span className="font-bold text-white">⋮</span> or <span className="font-bold text-white">Share</span>) and select <span className="font-bold text-white">"Install Porua"</span> or <span className="font-bold text-white">"Add to Home Screen"</span>.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleDismiss}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1.5 px-3 h-auto"
                                >
                                    Got it
                                </Button>
                            </div>
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

/**
 * Trigger the PWA install dialog from anywhere in the app
 */
export const openPwaInstallPrompt = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('porua:show-install-prompt'));
    }
};
