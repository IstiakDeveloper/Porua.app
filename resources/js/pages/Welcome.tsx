import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useInstitute } from '@/hooks/useInstitute';
import {
    ArrowRight,
    Building2,
    GraduationCap,
    Layers,
    Lock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    Users,
    Globe,
    BookOpen,
} from 'lucide-react';

export default function Welcome() {
    const institute = useInstitute();
    const { auth } = usePage<{ auth?: { user?: any } }>().props;
    const user = auth?.user;

    const modeLabels = {
        school: { title: 'School & Madrasah Management Portal', icon: Building2, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        coaching: { title: 'Coaching Center Management Portal', icon: GraduationCap, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
        hybrid: { title: 'Unified School & Coaching Education ERP', icon: Layers, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    };

    const currentMode = (institute.type && institute.type in modeLabels)
        ? modeLabels[institute.type as keyof typeof modeLabels]
        : modeLabels.hybrid;
    const ModeIcon = currentMode.icon;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30 text-slate-900 flex flex-col justify-between overflow-x-hidden relative selection:bg-indigo-600 selection:text-white">
            <Head title={`${institute.name} — Smart Education Portal`} />

            {/* Ambient Animated Gradient Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[480px] bg-gradient-to-tr from-indigo-200/30 via-teal-100/30 to-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none -z-0" />

            {/* Top Navigation Bar */}
            <header className="relative z-10 px-4 sm:px-12 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 overflow-hidden shadow-xs">
                        <img
                            src={institute.logo_url || '/logo.png'}
                            alt={institute.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <span className="text-base font-bold tracking-tight text-slate-900 line-clamp-1">
                            {institute.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block -mt-0.5">
                            {institute.code ? `Code: ${institute.code}` : 'Smart Education Portal'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition duration-150"
                        >
                            <span>Go to Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition duration-150"
                        >
                            <Lock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Staff & Student Login</span>
                        </Link>
                    )}
                </div>
            </header>

            {/* Center Main Stage (Single-Screen) */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
                <div className="max-w-2xl w-full text-center space-y-6">
                    {/* Operating Mode Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-indigo-200/70 bg-indigo-50 text-indigo-700 shadow-xs backdrop-blur-md transition hover:scale-105 duration-200 cursor-default">
                        <ModeIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{currentMode.title}</span>
                    </div>

                    {/* Prominent Logo & Institution Identity */}
                    <div className="space-y-3">
                        <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3.5 flex items-center justify-center border border-slate-200 shadow-xl shadow-indigo-500/10 backdrop-blur-xl relative group">
                            <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                            <img
                                src={institute.logo_url || '/logo.png'}
                                alt={institute.name}
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                            {institute.name}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-medium">
                            {institute.address || 'Next-generation Digital Management System for Students, Teachers & Administrators.'}
                        </p>
                    </div>

                    {/* Primary Action Button */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-600/20 transition duration-200 hover:scale-102 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Continue to Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-600/20 transition duration-200 hover:scale-102 cursor-pointer"
                            >
                                <Lock className="w-4 h-4" />
                                <span>Enter Portal / লগইন করুন</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    {/* Quick Portal Role Cards */}
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                        <Link
                            href="/login"
                            className="p-3 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition text-center group cursor-pointer"
                        >
                            <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition" />
                            <span className="text-[11px] font-bold text-slate-700 block">Student</span>
                        </Link>
                        <Link
                            href="/login"
                            className="p-3 rounded-xl bg-white hover:bg-teal-50/50 border border-slate-200/90 shadow-xs hover:border-teal-300 transition text-center group cursor-pointer"
                        >
                            <GraduationCap className="w-4 h-4 text-teal-600 mx-auto mb-1 group-hover:scale-110 transition" />
                            <span className="text-[11px] font-bold text-slate-700 block">Teacher</span>
                        </Link>
                        <Link
                            href="/login"
                            className="p-3 rounded-xl bg-white hover:bg-emerald-50/50 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition text-center group cursor-pointer"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition" />
                            <span className="text-[11px] font-bold text-slate-700 block">Admin</span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Bottom Contact & Information Strip */}
            <footer className="relative z-10 px-6 sm:px-12 py-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 font-medium">
                        {institute.phone && (
                            <div className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{institute.phone}</span>
                            </div>
                        )}
                        {institute.email && (
                            <div className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{institute.email}</span>
                            </div>
                        )}
                        {institute.address && (
                            <div className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="line-clamp-1">{institute.address}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>© {new Date().getFullYear()} {institute.name}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-bold">Powered by Porua.app</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
