export function formatTaka(amount: number | null | undefined): string {
    const value = Number(amount ?? 0);
    const rounded = Number.isFinite(value) ? Math.round(value) : 0;
    return `৳${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(rounded)}`;
}

export { dateBadge, formatClock, formatTimeRange, formatWhen, parseDisplayDate } from '@/utils/datetime';

export function attendanceLabel(status?: string | null): string {
    switch (status) {
        case 'present':
            return 'Present';
        case 'absent':
            return 'Absent';
        case 'late':
            return 'Late';
        case 'half_day':
            return 'Half day';
        case 'leave':
            return 'On leave';
        default:
            return 'Not marked';
    }
}

export const fieldClass =
    'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';

export const cardClass = 'rounded-xl border border-slate-200/80 bg-white shadow-2xs';
