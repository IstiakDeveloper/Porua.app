import React, { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface LoadingState {
    isLoading: boolean;
    progress: number;
    showPill: boolean;
    showVeil: boolean;
    isCompleting: boolean;
}

const getInitialInstitute = () => {
    try {
        if (typeof document !== 'undefined') {
            const el = document.getElementById('app');
            if (el?.dataset?.page) {
                const initialPage = JSON.parse(el.dataset.page);
                if (initialPage?.props?.institute) {
                    return initialPage.props.institute;
                }
            }
        }
    } catch {
        // ignore parse error
    }
    return {
        name: 'Education ERP',
        logo_url: '/logo.png',
    };
};

export default function GlobalLoadingIndicator() {
    const [institute, setInstitute] = useState(getInitialInstitute);
    const [state, setState] = useState<LoadingState>({
        isLoading: false,
        progress: 0,
        showPill: false,
        showVeil: false,
        isCompleting: false,
    });

    const activeCountRef = useRef(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pillTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const veilTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearAllTimers = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (pillTimeoutRef.current) {
            clearTimeout(pillTimeoutRef.current);
            pillTimeoutRef.current = null;
        }
        if (veilTimeoutRef.current) {
            clearTimeout(veilTimeoutRef.current);
            veilTimeoutRef.current = null;
        }
        if (finishTimeoutRef.current) {
            clearTimeout(finishTimeoutRef.current);
            finishTimeoutRef.current = null;
        }
    };

    const startLoading = () => {
        activeCountRef.current += 1;
        if (activeCountRef.current > 1) {
            return;
        }

        clearAllTimers();

        // Immediate visual confirmation on top progress bar
        setState({
            isLoading: true,
            progress: 18,
            showPill: false,
            showVeil: false,
            isCompleting: false,
        });

        // Smart incremental progress creep
        progressIntervalRef.current = setInterval(() => {
            setState((prev) => {
                if (!prev.isLoading || prev.isCompleting) return prev;
                let increment = 0;
                if (prev.progress < 50) {
                    increment = Math.random() * 8 + 4;
                } else if (prev.progress < 75) {
                    increment = Math.random() * 4 + 2;
                } else if (prev.progress < 92) {
                    increment = Math.random() * 1.5 + 0.5;
                }
                const nextProgress = Math.min(94, prev.progress + increment);
                return { ...prev, progress: nextProgress };
            });
        }, 120);

        // Show floating branded pill if load takes more than 100ms
        pillTimeoutRef.current = setTimeout(() => {
            setState((prev) => (prev.isLoading ? { ...prev, showPill: true } : prev));
        }, 100);

        // Show subtle ambient dimming veil if load takes more than 280ms
        veilTimeoutRef.current = setTimeout(() => {
            setState((prev) => (prev.isLoading ? { ...prev, showVeil: true } : prev));
        }, 280);
    };

    const stopLoading = () => {
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        if (activeCountRef.current > 0) {
            return;
        }

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (pillTimeoutRef.current) {
            clearTimeout(pillTimeoutRef.current);
            pillTimeoutRef.current = null;
        }
        if (veilTimeoutRef.current) {
            clearTimeout(veilTimeoutRef.current);
            veilTimeoutRef.current = null;
        }

        // Snap to 100% and show brief completion
        setState((prev) => ({
            ...prev,
            progress: 100,
            isCompleting: true,
            showVeil: false,
        }));

        // Fade out smoothly and reset
        finishTimeoutRef.current = setTimeout(() => {
            setState({
                isLoading: false,
                progress: 0,
                showPill: false,
                showVeil: false,
                isCompleting: false,
            });
        }, 320);
    };

    const updateProgress = (percentage?: number) => {
        if (percentage !== undefined && percentage > 0) {
            setState((prev) => ({
                ...prev,
                progress: Math.max(prev.progress, Math.min(95, percentage)),
            }));
        }
    };

    useEffect(() => {
        // Listen to Inertia router lifecycle
        const removeStart = router.on('start', () => startLoading());
        const removeProgress = router.on('progress', (event) => {
            if (event.detail?.progress?.percentage) {
                updateProgress(event.detail.progress.percentage);
            }
        });
        const removeFinish = router.on('finish', () => stopLoading());
        const removeCancel = router.on('cancel', () => stopLoading());
        const removeError = router.on('error', () => stopLoading());
        const removeNavigate = router.on('navigate', (event) => {
            const pageProps = event.detail?.page?.props as any;
            if (pageProps?.institute) {
                setInstitute(pageProps.institute);
            }
        });

        // Custom window events for manual triggers anywhere in the app
        const handleCustomStart = () => startLoading();
        const handleCustomStop = () => stopLoading();
        window.addEventListener('app:loading:start', handleCustomStart);
        window.addEventListener('app:loading:stop', handleCustomStop);

        return () => {
            removeStart();
            removeProgress();
            removeFinish();
            removeCancel();
            removeError();
            removeNavigate();
            window.removeEventListener('app:loading:start', handleCustomStart);
            window.removeEventListener('app:loading:stop', handleCustomStop);
            clearAllTimers();
        };
    }, []);

    if (!state.isLoading && !state.isCompleting) {
        return null;
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999999] overflow-hidden">
            {/* 1. Neon Glowing Top Progress Bar */}
            <div
                className="absolute top-0 left-0 right-0 h-[3.5px] bg-transparent transition-opacity duration-300"
                style={{ opacity: state.isCompleting ? 0.85 : 1 }}
            >
                <div
                    className="h-full relative transition-all ease-out"
                    style={{
                        width: `${state.progress}%`,
                        transitionDuration: state.progress === 100 ? '220ms' : '150ms',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 30%, #0d9488 65%, #06b6d4 88%, #34d399 100%)',
                        boxShadow: '0 0 14px rgba(16, 185, 129, 0.7), 0 0 4px rgba(52, 211, 153, 0.9)',
                    }}
                >
                    {/* Glowing Leading Head Particle */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-28 h-[6px] bg-gradient-to-r from-transparent via-emerald-200 to-white rounded-full blur-[1.5px] -mr-1 shadow-[0_0_12px_#34d399,0_0_6px_#10b981]" />

                    {/* Animated Shimmer Streamer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-fast pointer-events-none" />
                </div>
            </div>

            {/* 2. Soft Ambient Micro-Veil */}
            <div
                className={`absolute inset-0 bg-slate-900/10 backdrop-blur-[0.5px] transition-opacity duration-300 ${
                    state.showVeil && !state.isCompleting ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* 3. Floating Branded "Dynamic Pill" (Top-Center) */}
            <div
                className={`absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out transform ${
                    state.showPill && !state.isCompleting
                        ? 'translate-y-0 opacity-100 scale-100'
                        : state.isCompleting
                          ? '-translate-y-1 opacity-0 scale-95'
                          : '-translate-y-3 opacity-0 scale-90'
                }`}
            >
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_12px_32px_rgba(6,78,59,0.18),0_4px_12px_rgba(0,0,0,0.06)] border border-emerald-500/25 ring-1 ring-emerald-500/10">
                    {/* School Logo with Dual Glowing Spinner Ring */}
                    <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                        {/* Outer rotating gradient ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-600 border-r-teal-500 animate-spin" />
                        {/* Inner soft pulse */}
                        <div className="w-5 h-5 rounded-full overflow-hidden p-0.5 bg-white shadow-xs flex items-center justify-center">
                            <img
                                src={institute.logo_url || '/logo.png'}
                                alt={institute.name}
                                className="w-full h-full object-contain animate-pulse"
                            />
                        </div>
                    </div>

                    {/* Status Text & Dynamic Dot Wave */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-slate-800 tracking-tight">
                            {institute.name}
                        </span>
                        <span className="text-emerald-700 font-medium flex items-center">
                            Loading
                            <span className="inline-flex ml-0.5 tracking-tighter animate-pulse font-mono">
                                ...
                            </span>
                        </span>
                    </div>

                    {/* Progress Badge Indicator */}
                    <div className="hidden sm:flex items-center pl-2 border-l border-emerald-100 text-[11px] font-mono font-medium text-emerald-700/90">
                        {Math.round(state.progress)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
