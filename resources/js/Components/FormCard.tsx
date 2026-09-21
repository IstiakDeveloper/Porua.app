import React from 'react';

interface FormCardProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export default function FormCard({
    title,
    description,
    icon,
    action,
    children,
    className = '',
}: FormCardProps) {
    const renderIcon = () => {
        if (!icon) return null;
        if (React.isValidElement(icon)) {
            return icon;
        }
        if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)) {
            const IconComp = icon as React.ComponentType<{ className?: string }>;
            return <IconComp className="w-5 h-5" />;
        }
        return null;
    };

    const renderedIcon = renderIcon();

    return (
        <div className={`bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300/80 ${className}`}>
            {(title || renderedIcon || action) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        {renderedIcon && (
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                                {renderedIcon}
                            </div>
                        )}
                        <div>
                            {title && (
                                <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{description}</p>
                            )}
                        </div>
                    </div>
                    {action && <div className="w-full sm:w-auto flex items-center justify-end">{action}</div>}
                </div>
            )}
            <div className="p-4 sm:p-6">{children}</div>
        </div>
    );
}
