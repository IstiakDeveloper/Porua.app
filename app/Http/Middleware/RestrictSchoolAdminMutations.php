<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictSchoolAdminMutations
{
    /**
     * School "Admin" users may view and create data but cannot edit or delete records.
     * Super Admin bypasses all restrictions.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isSuperAdmin() || ! $user->isAdmin()) {
            return $next($request);
        }

        $route = $request->route();
        $name = $route?->getName();

        if ($name && (
            str_starts_with($name, 'student.')
            || str_starts_with($name, 'teacher.')
            || str_starts_with($name, 'parent.')
        )) {
            return $next($request);
        }

        if ($name === 'logout') {
            return $next($request);
        }

        $method = strtoupper($request->method());

        if (in_array($method, ['PUT', 'PATCH', 'DELETE'], true)) {
            abort(403, 'Only Super Admin can edit or delete records.');
        }

        if ($method === 'POST' && $name && str_ends_with($name, '.update')) {
            abort(403, 'Only Super Admin can edit or delete records.');
        }

        if ($method === 'GET' && $name && str_ends_with($name, '.edit')) {
            abort(403, 'Only Super Admin can edit or delete records.');
        }

        return $next($request);
    }
}
