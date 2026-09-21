import React, { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
import { useInstitute } from '@/hooks/useInstitute';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const institute = useInstitute();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
            <Head title={`Forgot Password - ${institute.name}`} />

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
                        Reset Password
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Enter your email address to receive a password reset link
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7 sm:p-9">
                    {/* Status Alert */}
                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-emerald-800">Reset link sent!</p>
                                <p className="text-xs text-emerald-700 mt-0.5">{status}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
                            >
                                Registered Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="admin@school.com"
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none ${
                                        errors.email
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                            : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
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
                                        <span>Sending reset link...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Reset Link</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Back to login */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span>Back to sign in</span>
                        </Link>
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
