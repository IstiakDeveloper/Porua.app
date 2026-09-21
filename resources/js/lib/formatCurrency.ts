/**
 * Format money: show decimals only when needed (e.g. 1350 vs 1350.05).
 */
export function formatAmount(amount: number | string | null | undefined): string {
    const num = Number(amount);
    if (!Number.isFinite(num)) {
        return '0';
    }

    const rounded = Math.round(num * 100) / 100;
    const hasFraction = Math.abs(rounded % 1) > 0.0001;

    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: hasFraction ? 2 : 0,
        maximumFractionDigits: 2,
    }).format(rounded);
}

/** Alias for formatAmount */
export const formatCurrency = formatAmount;
