import { ReactNode } from 'react';
import { cardClass } from './format';

export default function EmptyState({
    icon,
    title,
    body,
}: {
    icon: ReactNode;
    title: string;
    body: string;
}) {
    return (
        <div className={`${cardClass} px-6 py-12 text-center`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                {icon}
            </div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{body}</p>
        </div>
    );
}
