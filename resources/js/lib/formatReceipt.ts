/**
 * Formats a receipt number as a 4-digit voucher (padded).
 * Uses the running suffix, not only the last 4 chars of longer numbers.
 * E.g.:
 * - "RCP-20260419-0141" => "0141"
 * - "RCP-20260902-1850" => "1850"
 * - "FEE-20260205-000001" => "000001"
 * - "0141" => "0141"
 */
export function formatReceiptNumber(receiptNumber?: string | null): string {
    if (!receiptNumber) return '';
    const match = receiptNumber.match(/(\d+)$/);
    if (match) {
        return match[1].padStart(4, '0');
    }
    const cleanDigits = receiptNumber.replace(/\D/g, '');
    if (cleanDigits.length > 0) {
        return cleanDigits.padStart(4, '0');
    }
    return receiptNumber;
}

/**
 * Formats a receipt number with leading hash, e.g. "#0141"
 */
export function formatReceiptHash(receiptNumber?: string | null): string {
    const num = formatReceiptNumber(receiptNumber);
    return num ? `#${num}` : '';
}
