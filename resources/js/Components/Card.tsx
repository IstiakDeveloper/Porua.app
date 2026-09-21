import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`border-b border-emerald-100 bg-emerald-50/80 px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p className={`text-sm text-gray-600 mt-1 ${className}`}>
            {children}
        </p>
    );
}

export function CardContent({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

// Keep the original Card component as default export for backward compatibility
export default function CardLegacy({
    children,
    title,
    subtitle,
    action,
    className = '',
    padding = 'md',
}: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`bg-white rounded-lg border border-emerald-100 shadow-sm ${className}`}>
            {(title || subtitle || action) && (
                <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={paddings[padding]}>{children}</div>
        </div>
    );
}
