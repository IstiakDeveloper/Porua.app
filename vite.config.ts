import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        VitePWA({
            registerType: 'prompt',
            strategies: 'generateSW',
            manifest: false,
            scope: '/',
            workbox: {
                cleanupOutdatedCaches: true,
                importScripts: ['/sw-custom.js'],
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                navigateFallback: '/offline',
                navigateFallbackDenylist: [/^\/api\//, /^\/login/, /^\/logout/, /^\/setup/],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.(?:bunny\.net|googleapis\.com|gstatic\.com)/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'porua-fonts-v1',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 365 * 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'porua-images-v1',
                            expiration: {
                                maxEntries: 150,
                                maxAgeSeconds: 30 * 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: /^https?:\/\/.*\/.*(?:\/student\/|\/parent\/|\/teacher\/).*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'porua-data-v1',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 80,
                                maxAgeSeconds: 7 * 24 * 60 * 60,
                            },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        // Use IPv4 explicitly — host:true writes http://[::]:port into public/hot
        // which browsers fail to load (ERR_FAILED + broken service-worker fetches).
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
            port: 5173,
        },
        cors: true,
    },
    esbuild: {
        jsx: 'automatic',
    },
});
