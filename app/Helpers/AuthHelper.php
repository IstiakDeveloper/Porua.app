<?php

if (!function_exists('user')) {
    /**
     * Get the currently authenticated user.
     */
    function user(): ?\App\Models\User
    {
        return auth()->user();
    }
}

if (!function_exists('hasRole')) {
    /**
     * Check if the current user has a specific role.
     */
    function hasRole(string|array $roles): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        if (is_array($roles)) {
            return $user->hasAnyRole($roles);
        }

        return $user->hasRole($roles);
    }
}

if (!function_exists('hasPermission')) {
    /**
     * Check if the current user has a specific permission.
     */
    function hasPermission(string|array $permissions): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        if (is_array($permissions)) {
            return $user->hasAnyPermission($permissions);
        }

        return $user->hasPermission($permissions);
    }
}

if (!function_exists('isSuperAdmin')) {
    /**
     * Check if the current user is a super admin.
     */
    function isSuperAdmin(): bool
    {
        return auth()->user()?->isSuperAdmin() ?? false;
    }
}

if (!function_exists('isAdmin')) {
    /**
     * Check if the current user has the school Admin role (non–Super Admin).
     */
    function isAdmin(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
    }
}

if (!function_exists('canEditOrDeleteRecords')) {
    /**
     * Whether the user may edit or delete existing records (Super Admin only).
     */
    function canEditOrDeleteRecords(): bool
    {
        return auth()->user()?->canEditOrDeleteRecords() ?? false;
    }
}

if (!function_exists('isPrincipal')) {
    /**
     * Check if the current user is a principal.
     */
    function isPrincipal(): bool
    {
        return auth()->user()?->isPrincipal() ?? false;
    }
}

if (!function_exists('isTeacher')) {
    /**
     * Check if the current user is a teacher.
     */
    function isTeacher(): bool
    {
        return auth()->user()?->isTeacher() ?? false;
    }
}

if (!function_exists('isStudent')) {
    /**
     * Check if the current user is a student.
     */
    function isStudent(): bool
    {
        return auth()->user()?->isStudent() ?? false;
    }
}

if (!function_exists('isParent')) {
    /**
     * Check if the current user is a parent.
     */
    function isParent(): bool
    {
        return auth()->user()?->isParent() ?? false;
    }
}

if (!function_exists('isAccountant')) {
    /**
     * Check if the current user is an accountant.
     */
    function isAccountant(): bool
    {
        return auth()->user()?->isAccountant() ?? false;
    }
}

if (!function_exists('isLibrarian')) {
    /**
     * Check if the current user is a librarian.
     */
    function isLibrarian(): bool
    {
        return auth()->user()?->isLibrarian() ?? false;
    }
}

if (!function_exists('canAccess')) {
    /**
     * Check if user can access a route based on permission.
     */
    function canAccess(string $permission): bool
    {
        return auth()->user()?->hasPermission($permission) ?? false;
    }
}

if (!function_exists('getRoleName')) {
    /**
     * Get the primary role name of the current user.
     */
    function getRoleName(): ?string
    {
        return auth()->user()?->roles->first()?->name;
    }
}

if (!function_exists('getRoleSlug')) {
    /**
     * Get the primary role slug of the current user.
     */
    function getRoleSlug(): ?string
    {
        return auth()->user()?->roles->first()?->slug;
    }
}

if (!function_exists('getUserPermissions')) {
    /**
     * Get all permissions for the current user.
     */
    function getUserPermissions(): array
    {
        return auth()->user()?->getPermissionNames() ?? [];
    }
}

if (!function_exists('logActivity')) {
    /**
     * Log an activity for the current user.
     */
    function logActivity(string $action, string $description, ?string $model = null, ?int $modelId = null): void
    {
        if ($user = auth()->user()) {
            \App\Models\ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'description' => $description,
                'model_type' => $model,
                'model_id' => $modelId,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }
    }
}
