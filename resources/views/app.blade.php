<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

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
        <link rel="apple-touch-icon" href="{{ $favUrl }}">

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
