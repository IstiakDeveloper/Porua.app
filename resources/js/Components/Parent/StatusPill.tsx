const tones: Record<string, string> = {
    present: 'bg-emerald-50 text-emerald-800',
    paid: 'bg-emerald-50 text-emerald-800',
    pass: 'bg-emerald-50 text-emerald-800',
    late: 'bg-amber-50 text-amber-800',
    partial: 'bg-amber-50 text-amber-800',
    pending: 'bg-amber-50 text-amber-800',
    due: 'bg-amber-50 text-amber-800',
    absent: 'bg-rose-50 text-rose-800',
    overdue: 'bg-rose-50 text-rose-800',
    fail: 'bg-rose-50 text-rose-800',
    half_day: 'bg-sky-50 text-sky-800',
    leave: 'bg-violet-50 text-violet-800',
    not_marked: 'bg-slate-100 text-slate-600',
};

export default function StatusPill({ status, label }: { status?: string | null; label: string }) {
    const tone = tones[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
            {label}
        </span>
    );
}
