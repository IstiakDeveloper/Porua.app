<?php

namespace App\Http\Controllers\Pwa;

use App\Http\Controllers\Controller;
use App\Models\PwaPushSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PwaSubscriptionController extends Controller
{
    /**
     * Store or update a Web Push subscription.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'public_key' => 'nullable|string',
            'auth_token' => 'nullable|string|max:255',
            'device_type' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        $subscription = PwaPushSubscription::updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'user_id' => $user?->id,
                'public_key' => $validated['public_key'] ?? null,
                'auth_token' => $validated['auth_token'] ?? null,
                'device_type' => $validated['device_type'] ?? 'mobile',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Push notifications successfully subscribed.',
            'id' => $subscription->id,
        ]);
    }

    /**
     * Remove a Web Push subscription.
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|string|max:500',
        ]);

        PwaPushSubscription::where('endpoint', $request->input('endpoint'))->delete();

        return response()->json([
            'success' => true,
            'message' => 'Push notifications unsubscribed.',
        ]);
    }

    /**
     * Get the VAPID Public Key for client subscription.
     */
    public function vapidPublicKey(): JsonResponse
    {
        $key = config('services.webpush.public_key') 
            ?? env('VAPID_PUBLIC_KEY', 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U');

        return response()->json([
            'publicKey' => $key,
        ]);
    }
}

