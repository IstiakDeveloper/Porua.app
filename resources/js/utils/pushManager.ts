/**
 * Helper to convert URL-safe base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if Web Push is supported on the current device
 */
export function isPushNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check if the user is currently subscribed to push
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
    if (!isPushNotificationSupported()) return null;
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
}

/**
 * Subscribe user to Web Push notifications
 */
export async function subscribeToPushNotifications(): Promise<{ success: boolean; error?: string }> {
    if (!isPushNotificationSupported()) {
        return { success: false, error: 'Push notifications are not supported on this browser.' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        return { success: false, error: 'Notification permission was denied.' };
    }

    try {
        // 1. Fetch public VAPID key from server
        const res = await fetch('/api/pwa/vapid-public-key');
        const data = await res.json();
        const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

        // 2. Subscribe with Service Worker
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as BufferSource,
        });

        const subJson = subscription.toJSON();

        // 3. Send subscription to Laravel backend
        await fetch('/api/pwa/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint,
                public_key: subJson.keys?.p256dh,
                auth_token: subJson.keys?.auth,
                device_type: /iphone|ipad|android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            }),
        });

        return { success: true };
    } catch (err: unknown) {
        console.error('Failed to subscribe to push notifications:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Unsubscribe user from Web Push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!isPushNotificationSupported()) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        await fetch('/api/pwa/unsubscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
        return true;
    }
    return false;
}

