import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

export interface FormPageHeaderBadge {
    label: string;
    variant?: 'success' | 'warning' | 'indigo' | 'neutral' | 'danger' | 'info' | string;
}

export interface FormPageHeaderProps {
    title: string;
    subtitle?: string;
    backUrl?: string;
    backLabel?: string;
    badge?: string;
    badgeText?: string;
    badges?: FormPageHeaderBadge[];
    badgeIcon?: React.ReactNode | React.ComponentType<{ className?: string }>;
    actions?: React.ReactNode;
    actionSlot?: React.ReactNode;
}

const getBadgeStyle = (variant?: string) => {
    switch (variant) {
        case 'success':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
        case 'warning':
            return 'bg-amber-50 text-amber-700 border-amber-200/60';
        case 'indigo':
            return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
        case 'danger':
            return 'bg-rose-50 text-rose-700 border-rose-200/60';
        case 'info':
            return 'bg-sky-50 text-sky-700 border-sky-200/60';
        case 'neutral':
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200/80';
    }
};

export default function FormPageHeader({
    title,
    subtitle,
    backUrl,
    backLabel = 'Back',
    badge,
    badgeText,
    badges,
    badgeIcon,
    actions,
    actionSlot,
}: FormPageHeaderProps) {
    const singleText = badge || badgeText;
    const actionsContent = actions || actionSlot;

    const renderBadgeIcon = () => {
        if (!badgeIcon) return <Sparkles className="w-3 h-3 text-emerald-600" />;
        if (React.isValidElement(badgeIcon)) return badgeIcon;
        if (typeof badgeIcon === 'function' || (typeof badgeIcon === 'object' && badgeIcon !== null && 'render' in badgeIcon)) {
            const IconComp = badgeIcon as React.ComponentType<{ className?: string }>;
            return <IconComp className="w-3 h-3 text-emerald-600" />;
        }
        return null;
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/5">
            <div className="flex items-start sm:items-center gap-3.5">
                {backUrl && (
                    <Link href={backUrl}>
                        <button
                            type="button"
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all shadow-2xs hover:shadow-xs group flex items-center gap-1.5"
                            title={backLabel}
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-600" />
                            {backLabel !== 'Back' && (
                                <span className="text-xs font-semibold text-slate-700 hidden sm:inline pr-1">
                                    {backLabel}
                                </span>
                            )}
                        </button>
                    </Link>
                )}
                <div>
                    {badges && badges.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {badges.map((b, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getBadgeStyle(
                                        b.variant
                                    )}`}
                                >
                                    {b.label}
                                </span>
                            ))}
                        </div>
                    ) : singleText ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1">
                            {renderBadgeIcon()}
                            <span>{singleText}</span>
                        </div>
                    ) : null}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 bg-clip-text text-transparent leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {actionsContent && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
                    {actionsContent}
                </div>
            )}
        </div>
    );
}
