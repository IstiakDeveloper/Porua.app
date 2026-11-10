/**
 * Haptic feedback helper for mobile touch interactions
 * Uses the Web Vibration API when supported
 */
export const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch {
            // Silently fallback if device or browser permissions restrict vibration
        }
    }
};

export const hapticPatterns = {
    tap: 8,
    selection: 12,
    success: [15, 60, 20],
    warning: [25, 40, 25],
    error: [40, 80, 40],
};

