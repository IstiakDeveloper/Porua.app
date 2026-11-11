const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseDisplayDate(value?: string | null): Date | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const iso = trimmed.includes('T') ? trimmed : `${trimmed.slice(0, 10)}T00:00:00`;
        const date = new Date(iso);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const named = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
    if (!named) {
        return null;
    }

    const monthIndex = MONTHS.findIndex((month) => named[2].toLowerCase().startsWith(month.toLowerCase()));
    if (monthIndex < 0) {
        return null;
    }

    const date = new Date(Number(named[3]), monthIndex, Number(named[1]));
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatWhen(value?: string | null): string {
    if (!value) {
        return '—';
    }

    const date = parseDisplayDate(value);
    if (!date) {
        return value;
    }

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateBadge(value?: string | null): { month: string; day: string } {
    const date = parseDisplayDate(value);
    if (!date) {
        return { month: '—', day: '—' };
    }

    return {
        month: date.toLocaleDateString('en-GB', { month: 'short' }),
        day: String(date.getDate()),
    };
}

export function formatClock(value?: string | null): string {
    if (!value) {
        return '—';
    }
    if (/am|pm/i.test(value)) {
        return value;
    }
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) {
        return value;
    }
    const hours = Number(match[1]);
    const minutes = match[2];
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${suffix}`;
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
    const startLabel = formatClock(start);
    const endLabel = formatClock(end);
    if (startLabel === '—' && endLabel === '—') {
        return '—';
    }
    if (endLabel === '—') {
        return startLabel;
    }
    if (startLabel === '—') {
        return endLabel;
    }
    return `${startLabel} - ${endLabel}`;
}

/**
 * Format a date in Bangladeshi standard readable format (e.g. '10 Nov, 2026' or '10/11/2026').
 */
export function formatBdDate(value?: string | null, style: 'short' | 'medium' | 'long' = 'medium'): string {
    if (!value) return '—';
    const date = parseDisplayDate(value) || new Date(value);
    if (!date || Number.isNaN(date.getTime())) return String(value);

    if (style === 'short') {
        // DD/MM/YYYY
        return date.toLocaleDateString('en-GB');
    }
    if (style === 'long') {
        // 10 November 2026
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    // medium: '10 Nov, 2026'
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
}

/**
 * Format a date range in Bangladeshi format.
 * E.g., '10 Nov, 2026' (single day) or '10 Nov, 2026 - 12 Nov, 2026'
 */
export function formatBdDateRange(start?: string | null, end?: string | null, style: 'short' | 'medium' = 'medium'): string {
    if (!start && !end) return '—';
    const s = formatBdDate(start, style);
    if (!end || start === end) return s;
    const e = formatBdDate(end, style);
    if (s === e) return s;
    return `${s} - ${e}`;
}

/**
 * Format days count cleanly without awkward decimals.
 * E.g. 1.0 -> '1 day', 2.0 -> '2 days', 0.5 -> '0.5 day', 1.5 -> '1.5 days'
 */
export function formatDays(days: number | string | null | undefined): string {
    if (days === null || days === undefined || days === '') return '0 days';
    const num = typeof days === 'number' ? days : parseFloat(String(days));
    if (Number.isNaN(num)) return `${days} days`;

    const val = Number.isInteger(num) ? String(num) : String(parseFloat(num.toFixed(1)));
    return `${val} ${num === 1 ? 'day' : 'days'}`;
}

/**
 * Format days as a clean number without trailing decimal zeros (e.g. 1.0 -> '1', 12.0 -> '12', 0.5 -> '0.5')
 */
export function formatDaysCount(days: number | string | null | undefined): string {
    if (days === null || days === undefined || days === '') return '0';
    const num = typeof days === 'number' ? days : parseFloat(String(days));
    if (Number.isNaN(num)) return String(days);

    return Number.isInteger(num) ? String(num) : String(parseFloat(num.toFixed(1)));
}

