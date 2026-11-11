import React, { FormEvent, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Lock, GraduationCap, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const institute = useInstitute();
    const [showPassword, setShowPassword] = useState(false);
    const { flash } = usePage<{ flash?: { error?: string; success?: string; message?: string } }>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const displayStatus = status || flash?.success || flash?.message;
    const generalError = flash?.error;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
            <Head title={`Login - ${institute.name}`} />

            {/* Subtle background grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

            {/* Soft ambient gradient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="w-full max-w-md relative z-10">
                {/* Header & Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-2 shadow-lg shadow-emerald-600/10 mb-4 ring-8 ring-emerald-50 border border-slate-100 transition-transform duration-200 hover:scale-105 overflow-hidden">
                        <img 
                            src={institute.logo_url || '/logo.png'} 
                            alt={institute.name} 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {institute.name}
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500">
                        {institute.type === 'coaching' ? 'Sign in to your coaching management portal' : 'Sign in to your education management portal'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7 sm:p-9">
                    {/* Status Alert */}
                    {displayStatus && (
                        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{displayStatus}</span>
                        </div>
                    )}

                    {/* General Error Alert */}
                    {generalError && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-sm">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{generalError}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Login Identifier Field (Username / Mobile / Email) */}
                        <div>
                            <label
                                htmlFor="login"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
                            >
                                Username / Mobile / Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="login"
                                    type="text"
                                    name="login"
                                    value={data.login}
                                    onChange={(e) => {
                                        setData('login', e.target.value);
                                        setData('email', e.target.value);
                                    }}
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    placeholder="e.g. 017xxxxxxxx or username or email"
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none ${
                                        errors.login || errors.email
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300'
                                    }`}
                                />
                            </div>
                            {(errors.login || errors.email) && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.login || errors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                                >
                                    Password <span className="text-red-500">*</span>
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between pt-1">
                            <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer transition-colors"
                                />
                                <span className="text-xs sm:text-sm text-slate-600 font-medium">Remember me</span>
                            </label>

                            <Link
                                href="/forgot-password"
                                className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm hover:shadow transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in to Dashboard</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Authorized access only • Encrypted connection</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} {institute.name}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
