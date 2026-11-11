<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $institute = [
            'name' => config('app.name', 'Porua.app'),
            'short_name' => '',
            'code' => '',
            'email' => '',
            'phone' => '',
            'address' => '',
            'website' => '',
            'logo_url' => '/logo.png',
            'favicon_url' => '/logo.png',
            'established_year' => '',
            'currency_symbol' => '৳',
            'invoice_footer_text' => 'Thank you for your payment.',
            'type' => 'school',
        ];

        try {
            $settings = \Illuminate\Support\Facades\Cache::remember('global_institute_settings', 3600, function () {
                return \App\Models\Setting::whereIn('key', [
                    'institute_name',
                    'school_name',
                    'school_code',
                    'school_email',
                    'school_phone',
                    'school_address',
                    'school_website',
                    'school_logo',
                    'school_favicon',
                    'established_year',
                    'currency_symbol',
                    'invoice_footer_text',
                    'institute_type',
                ])->pluck('value', 'key')->toArray();
            });

            $name = ! empty($settings['institute_name'])
                ? $settings['institute_name']
                : (! empty($settings['school_name']) ? $settings['school_name'] : config('app.name', 'Porua.app'));
            $logo = $settings['school_logo'] ?? null;
            $favicon = $settings['school_favicon'] ?? null;

            $institute = [
                'name' => $name,
                'short_name' => $settings['school_code'] ?? '',
                'code' => $settings['school_code'] ?? '',
                'email' => $settings['school_email'] ?? '',
                'phone' => $settings['school_phone'] ?? '',
                'address' => $settings['school_address'] ?? '',
                'website' => $settings['school_website'] ?? '',
                'logo_url' => $logo ? (str_starts_with($logo, 'http') ? $logo : asset('storage/'.$logo)) : '/logo.png',
                'favicon_url' => $favicon ? (str_starts_with($favicon, 'http') ? $favicon : asset('storage/'.$favicon)) : '/logo.png',
                'established_year' => $settings['established_year'] ?? '',
                'currency_symbol' => $settings['currency_symbol'] ?? '৳',
                'invoice_footer_text' => $settings['invoice_footer_text'] ?? 'Thank you for your payment.',
                'type' => $settings['institute_type'] ?? 'school',
            ];
        } catch (\Throwable $e) {
            // Keep default fallback
        }

        return [
            ...parent::share($request),
            'name' => $institute['name'],
            'institute' => $institute,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'user_type' => $request->user()->user_type,
                    'roles' => $request->user()->roles,
                    'is_super_admin' => $request->user()->isSuperAdmin(),
                ] : null,
                'can_edit_or_delete' => $request->user()?->canEditOrDeleteRecords() ?? false,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'parentNav' => function () use ($request) {
                $user = $request->user();
                if (! $user) {
                    return null;
                }

                $user->loadMissing('roles');
                $isParent = $user->roles->contains(fn ($role) => $role->name === 'Parent');
                if (! $isParent) {
                    return null;
                }

                $urgentNotices = \App\Models\Notice::query()
                    ->where('is_published', true)
                    ->whereIn('priority', ['urgent', 'high'])
                    ->where(function ($query) {
                        $query->whereJsonContains('target_audience', 'Parent')
                            ->orWhereJsonContains('target_audience', 'All')
                            ->orWhereJsonContains('target_audience', 'all');
                    })
                    ->count();

                $unreadMessages = \App\Models\Message::query()
                    ->where('receiver_id', $user->id)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'urgentNotices' => $urgentNotices,
                    'unreadMessages' => $unreadMessages,
                ];
            },
        ];
    }
}
