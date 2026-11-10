import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import GlobalLoadingIndicator from './Components/GlobalLoadingIndicator';

// Stale service workers (often from production/PWA) intercept Vite HMR and throw
// "Failed to convert value to 'Response'" — clear them in local development.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
    });
}

// Prevent mouse wheel from changing number input values while focused
document.addEventListener(
    'wheel',
    (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.type === 'number') {
            event.preventDefault();
        }
    },
    { passive: false, capture: true }
);

const appName = import.meta.env.VITE_APP_NAME || 'Education ERP';

createInertiaApp({
    title: (title) => title || appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <GlobalLoadingIndicator />
            </>
        );
    },
    progress: false,
});

