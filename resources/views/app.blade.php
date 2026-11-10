<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- PWA Primary Meta Tags -->
        <meta name="theme-color" content="#4f46e5" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#1e1b4b" media="(prefers-color-scheme: dark)">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Porua">
        <meta name="application-name" content="Porua">
        <meta name="msapplication-TileColor" content="#4f46e5">

        <link rel="manifest" href="/manifest.webmanifest">

        <!-- Early PWA Install Prompt & Service Worker Registration Hook -->
        <script>
            window.__pwaInstallPrompt = null;
            window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault();
                window.__pwaInstallPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
            });
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
                });
            }
        </script>

        @php
            $inst = \Illuminate\Support\Facades\Cache::get('global_institute_settings');
            $appName = $inst['institute_name'] ?? $inst['school_name'] ?? config('app.name', 'Porua.app');
            $logo = $inst['school_logo'] ?? null;
            $favicon = $inst['school_favicon'] ?? null;
            $favUrl = $favicon 
                ? (str_starts_with($favicon, 'http') ? $favicon : asset('storage/' . $favicon)) 
                : ($logo ? (str_starts_with($logo, 'http') ? $logo : asset('storage/' . $logo)) : '/logo.png');
        @endphp
        <title inertia>{{ $appName }}</title>

        <link rel="icon" type="image/png" href="{{ $favUrl }}">
        <link rel="shortcut icon" type="image/png" href="{{ $favUrl }}">
        <link rel="apple-touch-icon" href="/pwa/icons/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/pwa/icons/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
